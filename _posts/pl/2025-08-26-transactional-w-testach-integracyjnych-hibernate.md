---
layout: post
title: "Czy wiesz dlaczego nie powinno się stosować adnotacji @Transactional w testach integracyjnych z Hibernate?"
description: ""
date: 2025-09-01T00:00:00+01:00
published: true
didyouknow: true
lang: pl
author: rmastalerek
image: /assets/img/posts/2025-08-26-transactional-w-testach-integracyjnych-hibernate/thumbnail.webp
tags:
  - transactions
  - spring
  - java
  - transactional
---

Testy integracyjne z użyciem `Springa` i `Hibernate` mają za zadanie możliwie wiernie odwzorować zachowanie aplikacji na środowisku produkcyjnym. 
Często, aby uprościć ich tworzenie, sięgamy po adnotację `@Transactional`, która automatycznie `rollbackuje` wszystkie zmiany w bazie danych po zakończeniu testu. 
Brzmi idealnie – nie musimy martwić się o „czystość” bazy, a każdy scenariusz startuje od świeżego punktu.

## Jak Spring obsługuje adnotację @Transactional?
Wykorzystane jest w tym celu AoP (`Aspect-oriented Programming`). W zależności od tego, czy używamy `Spring Aspects` czy `AspectJ`, `@Transactional` 
zostaje wykryty albo w `Spring Beans` wyłącznie dla metod publicznych, albo w dowolnym miejscu w kodzie. 
Następnie wszystkie znalezione metody opakowane zostają w proxy, które rozpoczyna transakcję przed wywołaniem rzeczywistej logiki metody 
i zatwierdza ją po jej zakończeniu (lub wycofuje w przypadku wyjątku zgłoszonego przez tę metodę). Gdy `@Transactional` używany jest w testach integracyjnych, 
automatycznie wycofuje metodę testową po zakończeniu pracy.

Brzmi bardzo wygodnie, prawda? Pozbywamy się boilerplate'ów do zarządzania transakcjami w każdym miejscu. 
Nie musimy przywracać stanu bazy sprzed testu po każdym zdefiniowanym przypadku itp. 
Niestety w połączeniu z `Hibernate`, adnotacja ta może stać się również pułapką.

Jedną z podstawowych cech transakcji bazy danych jest jej zakres. Zakres transakcji decyduje o tym, które fragmenty kodów podlegają której transakcji. 
Zmiana zakresu transakcji może mieć zatem ogromny wpływ na zachowanie kodu. Jest to szczególnie widoczne podczas korzystania z `Hibernate`. 
`Hibernate` używa `Transactions` (i instancji `Transactional Entity Manager`) dla mechanizmu lazy loading. Spójrzmy na poniższy przykład:
```java
Encja
@Entity(name = "user")
public class UserEntity {

    @Id
    @GeneratedValue
    private UUID id;
 
    private String name;
     
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<UserEntity> accounts;
}
```
Kiedy pobierana jest instancja `UserEntity`, pole z powiązanymi kontami (accounts) nie zostanie zainicjowane. 
Będzie to instancja `PersistentSet`, czyli implementacji biblioteki `Hibernate`, 
która przy pierwszym wywołaniu którejkolwiek z metod zbioru pobierze listę kont użytkownika z bazy danych. Gdzie zatem jest haczyk?

**`Lazy loading (leniwe ładowanie)`** w `Hibernate` działa poprawnie tylko wtedy, gdy jesteśmy w zasięgu aktywnej transakcji bazy danych. 
Gdy tylko spróbujemy leniwie załadować cokolwiek po zakończeniu oryginalnej transakcji, 
zostanie zaprezentowany wyjątek `LazyInitializationException`. Zmieniając zakres transakcji możemy zatem wprowadzić do naszej logiki `RuntimeException`. 
Rzućmy okiem na kolejny przykład:

### Prawidłowy zakres transakcji
```java
// Start transakcji
transactionTemplate.executeWithoutResult(transactionStatus -> {
    // User jest pobierany z bazy danych po nazwie
    User u = userService.getUserByName(name);
    // właściwości lazy-loaded są zaciągane w poprawny sposób
    u.getAccounts().forEach(this::doSomethingWithAccount);
    // Koniec transakcji
});
```

### Nieprawidłowy zakres transakcji
```java
// Start transakcji
User u = transactionTemplate.execute(transactionStatus -> {        
    // User jest pobierany z bazy danych po nazwie
    return userService.getUserByName(name);
    // Koniec transakcji
});
// Próba ładowania właściwości lazy-loaded z opóźnieniem, 
// w wyniku czego wyjątek LazyInitializationException
u.getAccounts().forEach(this::doSomethingWithAccount);
```
Niepoprawność w powyższym przykładzie widać dość klarownie. Gdy używamy `TransactionTemplate` dostarczone przez `Springa`, 
czyli ręcznie zarządzamy transakcją. 
Mniej oczywiste jest to w przypadku używania adnotacji `@Transactional`:

## Test integracyjny oznaczony @Transactional
```java
@Test
@Transactional
public void shouldAddUser() throws Exception {
// given:
// Tworzymy nowego użytkownika
createNewUser(getNewUser());

        // when
        // Próbujemy pobrać z bazy użytkownika po nazwie (wraz z wszystkimi właściwościami lazy-loaded)
        MvcResult createdUserResponse = getUserByName(name);
 
        // then
        // W przeciwieństwie do zachowania produkcyjnego nie ma żadnego wyjątku i jesteśmy w stanie odczytać właściwości lazy-loaded
        assertEquals(200, createdUserResponse.getResponse().getStatus());
        UserDto createdUser = getUserFromResponse(createdUserResponse);
        assertEquals(name, createdUser.getName());
        assertEquals(2, createdUser.getAccounts().size());
    }
```

Test oznaczony adnotacją `@Transactional` umożliwia użycie "magii" `Springa`. Przeanalizujemy poniższy przykład:

1. Tworzymy nową instancję użytkownika w transakcji:
```java
   @Transactional
   @ResponseStatus(HttpStatus.CREATED)
   @PostMapping
   public void createUser(@RequestBody UserDto user) {
    userService.createUser(user);
   }
```

2. Znajdujemy instancję użytkownika według jego nazwy i przekształcamy w `DTO`, używając jej leniwie ładowanej właściwości "accounts":
```java
   @GetMapping("/{name}")
    public UserDto getUserByName(@PathVariable("name") String name) {
    User user = userService.getUserByName(name).orElseThrow(() -> new RuntimeException("User not Found"));
    return new UserDto(user.getName(), user.getAccounts().stream().map(Account::getAccounts).collect(Collectors.toList()));
   }
```

### Jak zadziałał test integracyjny?
Wszystko zadziałało poprawnie, utworzony użytkownik został zwrócony przez wywołanie `getUserByName()`. Nie rzucono żadnego wyjątku. 
Jesteśmy pewni, że nasz kod działa poprawnie.

### Co stanie się na produkcji?
Jak widzimy, logika testu zawiera 2 oddzielne wywołania `REST`. 
W takim przypadku transakcja użyta do utworzenia użytkownika zostałaby zakończona przed zwróceniem odpowiedzi `HTTP` przez `Controller`. 
Pobranie użytkownika po jego nazwie zostałoby wykonane poza pierwotną transakcją. 
Konwersja encji `UserEntity` w `UserDto` dałaby wyjątek `LazyInitializationException`, 
ponieważ próbowaliśmy leniwie załadować pole adresów użytkownika bez transakcji.

### Przyczyna
Kiedy korzystamy z adnotacji `@Transactional` w testach integracyjnych, `Hibernate` cache'uje wszystkie encje ze wszystkich transakcji, 
które wykonywane są w ramach przypadku testowego. Ponieważ na początku wykonywania testu, kiedy wykonana została metoda `createNewUser()`, 
użytkownik był "znany" `Hibernate`, wraz ze swoimi powiązanymi kontami, to `Hibernate` zapisał je w pamięci podręcznej. 
Kiedy zatem wywołana została metoda `getUserByName()`, to kolekcja została pobrana bez żadnego problemu z tejże pamięci. 
Spring re-używa tej samej sesji `Hibernate` do każdej transakcji w testach integracyjnych. 
Jest to logiczne, ponieważ `Spring` będzie chciał wykonać `Rollback` po zakończeniu każdego przypadku testowego.

### Alternatywy
Alternatyw dla adnotacji `@Transactional` w testach integracyjnych jest kilka:

- Wykorzystanie adnotacji **`@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)`** - to rozwiązanie pozwala nam 
przed każdym testem na nowo tworzyć kontekst `Spring'a`. Ma bardzo duży wpływ na wydajność aplikacji i raczej nie powinno być stosowane.
- Wykorzystanie z adnotacji `@SQL` i skryptu do czyszczenia bazy - to rozwiązanie pozwala na zdefiniowanie dedykowanego skryptu, 
który wyczyści pożądaną tabelę lub kilka tabel przed / po każdym przypadku testowym.
Minusem tego rozwiązania jest fakt, że trzeba pilnować, by istniał skrypt, który czyści każdą "zabrudzoną" tabelę. 
Adnotację `SQL` można dodać na poziomie klasy, lub pojedynczego przypadku testowego:
[docs.spring.io - Script Execution Phases](https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/executing-sql.html#testcontext-executing-sql-declaratively-script-execution-phases)
- Dedykowany serwis czyszczący wszystkie tabele w bazie - wydaje się to być najbezpieczniejszym i najmniej obciążającym rozwiązaniem. 
Polega na tym, że przed lub po każdym przypadku testowym czyścimy bazę danych. Kod wtedy jest mniej zależny od zakresu transakcji.
```java
class SomeIntegrationTest {

    @Autowired
    private DatabaseCleanup databaseCleanup;
 
    // ...
  
    @AfterEach
    void afterEach() {
        databaseCleanup.execute();
    }
 
    //...
}
```
```java
@Service
@ActiveProfiles("test")
public class DatabaseCleanup implements InitializingBean {

    @PersistenceContext
    private EntityManager entityManager;
 
    private List<String> tableNames;
 
    @Override
    public void afterPropertiesSet() {
        tableNames = entityManager.getMetamodel().getEntities().stream()
                .filter(e -> e.getJavaType().getAnnotation(Entity.class) != null)
                .map(e -> CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, e.getName()))
                .collect(Collectors.toList());
    }
 
    @Transactional
    public void execute() {
        entityManager.flush();
        entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();
 
        for (String tableName : tableNames) {
            entityManager.createNativeQuery("TRUNCATE TABLE " + tableName).executeUpdate();
        }
 
        entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY TRUE").executeUpdate();
    }
}
```

## Przydatne linki:

[dev.to - Don’t Use @Transactional in Tests](https://dev.to/henrykeys/don-t-use-transactional-in-tests-40eb)

[docs.spring.io - Script Execution Phases](https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/executing-sql.html#testcontext-executing-sql-declaratively-script-execution-phases)

[miensol.pl - How to clear database in Spring Boot tests?](https://miensol.pl/clear-database-in-spring-boot-tests/)

