---
layout: post
title: Pułapki adnotacji @Transactional
description: ""
date: 2025-11-20T08:00:00+01:00
published: false
didyouknow: false
lang: pl
author: kdudek
image: TODO
tags:
- java
- spring
---

Wykorzystanie adnotacji `@Transactional` w frameworku Spring stanowi jedno z podstawowych narzędzi w zarządzaniu transakcjami bazodanowymi. Choć jej zastosowanie jest wygodne i upraszcza kod, niesie ze sobą również potencjalne pułapki, które mogą powodować trudne do zdiagnozowania błędy.

Na potrzeby tego wpisu załóżmy, że mamy następujący schemat bazy danych:
```java
@Entity
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String vin;

    @Column
    private String model;

    @Column
    private int mileage;

    @ManyToOne
    @JoinColumn(name = "car_owner_id")
    private CarOwner carOwner;

    // konstruktory, gettery, settery    

}

@Entity
public class CarOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @OneToMany(mappedBy = "carOwner", cascade = CascadeType.ALL)
    private List<Car> cars = new ArrayList<>();

    // konstruktory, gettery, settery

}
```

## 1. @Transactional domyślnie jest realizowany przez proxy
Domyślnie Spring dla wszystkich klas lub metod oznaczonych adnotacją `@Transactional` tworzy proxy (dynamiczne proxy JDK albo proxy CGLIB w zależności od sytuacji oraz ustawień), co umożliwia zastosowanie logiki transakcyjnej (np. rozpoczęcia i commitowania transakcji) przed oraz po wykonaniu wywoływanej metody. Oznacza to, że adnotacja ta będzie działała tylko w przypadku metod publicznych - metody o innej widoczności po prostu zignorują tę adnotację bez żadnych ostrzeżeń, ponieważ nie są one obsługiwane przez proxy. Dodatkowo przechwytywane będą tylko zewnętrzne wywołania metod, czyli takie, które przechodzą przez proxy. Wszelkie wywołania metod wewnątrz tego samego komponentu nie spowodują rozpoczęcia transakcji, nawet jeśli metoda jest oznaczona adnotacją `@Transactional`. W przypadku, gdy chcemy, aby wewnętrzna metoda działała jednak w sposób transakcyjny możemy posiłkować się wstrzyknięciem beana do samego siebie (self-injection), co pozwala nam na użycie proxy stworzonego przez Springa.

```java
@Service
public class WrongTransactionalCarService {

    private final CarRepository carRepository;

    public WrongTransactionalCarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public void createCar() {
        Car polonez = Car.builder()
                .model("FSO Polonez")
                .vin("1D4GP24R75B188657")
                .mileage(100)
                .build();
        saveCar(polonez);
    }

    @Transactional
    public void saveCar(Car car) {
        carRepository.save(car);

        throw new IllegalStateException("Some exception - rollback transaction!");
    }

    /* 
        Wynik metody createCar():
        > SELECT id, model FROM car;
        id | model      
        ---+------------
        1  | FSO Polonez
    */

}
```
W powyższym przykładzie wywołanie metody `createCar()` nie spowoduje wycofania transakcji pomimo rzucenia wyjątku `IllegalStateException`, ponieważ metoda `saveCar()` z adnotacją `@Transactional` została wywołana bezpośrednio wewnątrz beana - a nie przez proxy. 

```java
@Service
public class WorkingTransactionalCarService {

    private final CarRepository carRepository;

    private final WorkingTransactionalCarService workingTransactionalCarService;

    public WorkingTransactionalCarService(CarRepository carRepository,
                                          @Lazy WorkingTransactionalCarService workingTransactionalCarService) {
        this.carRepository = carRepository;
        this.workingTransactionalCarService = workingTransactionalCarService;
    }

    public void createCar() {
        Car polonez = Car.builder()
                .model("FSO Polonez")
                .vin("1D4GP24R75B188657")
                .mileage(100)
                .build();
        workingTransactionalCarService.saveCar(polonez);
    }

    @Transactional
    public void saveCar(Car car) {
        carRepository.save(car);

        throw new IllegalStateException("Some exception - rollback transaction!");
    }

    /*
        Wynik metody createCar():
        > SELECT id, model FROM car;
        id | model
        ---+------
    */

}
```
Powyższy przykład reprezentuje ten sam proces, jednak tym razem wywołanie metody `saveCar()` odbyło się poprzez użycie wstrzykniętego proxy - w takiej sytuacji wycofanie transakcji działa poprawnie.

### AdviceMode.ASPECTJ - @Transactional jako aspekt
Spring w trybie `AdviceMode.ASPECTJ` zamiast domyślnego `AdviceMode.PROXY` realizuje `@Transactional` poprzez aspekty AspectJ oraz modyfikacje kodu bajtowego, a nie przez proxy. Pozwala na ominięcie powyższych ograniczeń - w takiej formie oprócz modyfikatora publicznego obsługiwane są również inne modyfikatory dostępu, a także działa wewnętrzne wywoływanie metod. Minusem takiego rozwiązania jest jednak skomplikowanie procesu budowania aplikacji (wymagany jest kompilator AspectJ albo konfiguracja `load-time weavingu`) oraz trudniejsze jej utrzymywanie względem domyślnego trybu z proxy.

```java
@SpringBootApplication
@EnableTransactionManagement(mode = AdviceMode.ASPECTJ)
public class AspectJExampleApp {

	public static void main(String[] args) {
		SpringApplication.run(AspectJExampleApp.class, args);
	}

}

@Service
public class AspectJTransactionalService {

    private final CarRepository carRepository;

    public AspectJTransactionalService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    public void createCar() {
        Car polonez = Car.builder()
                .model("FSO Polonez")
                .vin("1D4GP24R75B188657")
                .mileage(100)
                .build();
        saveCar(polonez);
    }

    @Transactional
    private void saveCar(Car car) {
        carRepository.save(car);

        throw new IllegalStateException("Some exception - rollback transaction!");
    }

    /*
        Wynik metody createCar():
        > SELECT id, model, mileage FROM car;
        id | model
        ---+------------
    */

}
```
Przedstawiona klasa `AspectJTransactionalService` poprawnie wycofa transakcję, pomimo że metoda `saveCar()` jest prywatna oraz jest wywoływana wewnętrznie.

## 2. @Transactional, Hibernate i dirty checking 

### Hibernate aktualizuje zarządzane obiekty niewprost
Cykl życia encji w Hibernate składa się z czterech stanów:
1. `Transient` - obiekt został stworzony w aplikacji, ale nie jest jeszcze zarządzany przez Hibernate
2. `Persistent` - obiekt jest zarządzany przez Hibernate i jest powiązany z sesją
3. `Detached` - obiekt był w stanie `persistent`, ale sesja, z którą był powiązany została zamknięta lub obiekt został ręcznie od niej odłączony
4. `Removed` - obiekt został usunięty; Hibernate usunie odpowiadający mu rekord z bazy danych w stosownym momencie (np. przy commicie)

Wszelkie operacje (takie jak pobieranie z bazy oraz zapisywanie do niej), które powodują przejście obiektu do stanu `persistent` oraz powiązanie go z sesją, sprawiają, że kopia tego obiektu zostaje umieszczona w kontekście persystencji, czyli cache'u L1 (cache'u sesji). Hibernate poprzez mechanizm `dirty checking` porównuje tę kopię obiektu z obiektem oryginalnym, śledząc w ten sposób wszystkie zmiany, którym została poddana encja, aby odwzorować je w bazie danych po zakończeniu transakcji. Innymi słowy, wszystkie zmiany, wykonane np. przez użycie setterów, zostaną automatycznie zapisane do bazy danych w momencie zakończenia transakcji, nawet jeśli wprost nie została wywołana metoda wykonująca zapis (np. `repository.save(entity)`).

```java
@Service
public class MileageUpdater {

    private final CarRepository carRepository;

    public MileageUpdater(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    @Transactional
    public void updateMileage(Long carId, int newMileage) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown car!"));

        var oldMileage = car.getMileage();

        car.setMileage(newMileage);

        if (isMileageCorrect(oldMileage, newMileage)) {
            carRepository.save(car);
        }
    }

    private boolean isMileageCorrect(int oldMileage, int newMileage) {
        return newMileage >= oldMileage;
    }

    /*
        Stan przed wywołaniem metody updateMileage()
        > SELECT id, model, mileage FROM car;
        id | model            | mileage
        ---+------------------+--------
        1  | Volkswagen Jetta | 197000
    */
    /*
        Po wywołaniu metody updateMileage(1L, 10000)
        > SELECT id, model, mileage FROM car;
        id | model            | mileage
        ---+------------------+--------
        1  | Volkswagen Jetta | 10000
    */
}
```
W tym przykładowym serwisie walidacja opiera się na sprawdzeniu, czy nowy przebieg samochodu nie jest niższy od starego. Jeśli nowy przebieg jest niepoprawny, to metoda `carRepository.save(car)`, która wprost zapisuje tę encję do bazy, nie zostanie wykonana. Ponieważ jednak znajdujemy się w transakcji, a encja ta znajduje się w kontekście persystencji (została wcześniej wyciągnięta z bazy za pośrednictwem `carRepository.findById(carId)`), w przypadku ustawienia niepoprawnej wartości poprzez `car.setMileage()` zmiana ta zostanie odzwierciedlona na bazie danych, nawet jeśli kod naszego serwisu nie wskazuje na to wprost.

Rozwiązaniem tego problemu jest pilnowanie, aby wszelkie zmiany stanu obiektu znajdującego się w kontekście persystencji odbywały się w momencie, w którym dozwolony jest jego zapis. Jeśli z jakiegoś powodu nie jest to możliwe możemy ratować się np. odłączając obiekt z kontekstu persystencji lub korzystając z obiektu pośredniczącego, który na końcu zostanie zsynchronizowany z oryginalnym obiektem. Poniżej znajduje się przykładowa implementacja `MileageUpdater` z poprawioną logiką.

```java
@Service
public class CorrectMileageUpdater {

    private final CarRepository carRepository;

    public CorrectMileageUpdater(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    @Transactional
    public void updateMileage(Long carId, int newMileage) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown car!"));

        var oldMileage = car.getMileage();

        if (isMileageCorrect(oldMileage, newMileage)) {
            car.setMileage(newMileage);
            // carRepository.save(car); nie jest potrzebne - samo car.setMileage() spowoduje zapis encji do bazy
        }

    }

    private boolean isMileageCorrect(int oldMileage, int newMileage) {
        return newMileage >= oldMileage;
    }

    /*
        Stan przed wywołaniem metody updateMileage()
        > SELECT id, model, mileage FROM car;
        id | model            | mileage
        ---+------------------+--------
        1  | Volkswagen Jetta | 197000
    */
    /*
        Po wywołaniu metody updateMileage(1L, 10000)
        > SELECT id, model, mileage FROM car;
        id | model            | mileage
        ---+------------------+--------
        1  | Volkswagen Jetta | 197000
    */
}
```

### Hibernate porównuje obiekty z tym co znajduje się w kontekście persystencji

W ramach transakcji `dirty checking` jest podstawowym mechanizmem, dzięki któremu Hibernate wie jakie encje muszą zostać zaktualizowane, a które tego nie wymagają. Warto mieć na uwadze, że Hibernate załaduje do kontekstu persystencji wszystkie obiekty zwrócone przez zapytania bazodanowe, nawet jeśli zwrócą one rekordy, które w praktyce nie istnieją.
```java
@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    @Query(value = """
                SELECT 100 AS id, 'Volvo S70' AS model, 'YV1LS55A3X1588402' AS vin, 192311 AS mileage, null AS car_owner_id
            """,
            nativeQuery = true)
    List<Car> returnNotExistingCars();

}
```
```java
@Service
public class NotExistingCarService {

    private final CarRepository carRepository;

    public NotExistingCarService(CarRepository carRepository) {
        this.carRepository = carRepository;
    }

    @Transactional
    public void tryToAddNotExistingCars() {
        List<Car> cars = carRepository.returnNotExistingCars();
        assert !cars.isEmpty();
        carRepository.saveAll(cars);
    }

    /*
        Stan bazy przed wykonaniem tryToAddNotExistingCars():
        > SELECT * FROM car;
        mileage | car_owner_id | id | model | vin
        --------+--------------+----+-------+----
    */
    /*
        Stan bazy po wykonaniu tryToAddNotExistingCars():
        > SELECT * FROM car;
        mileage | car_owner_id | id | model | vin
        --------+--------------+----+-------+----
    */
}
```
Zapytanie `returnNotExistingCars()` zwraca samochód, który został stworzony bezpośrednio w tym zapytaniu i nie jest zapisany w bazie danych. Metoda `tryToAddNotExistingCars()` próbuje zapisać ten samochód, jednak tabela pozostanie pusta pomimo tego, że używamy `carRepository.saveAll(cars)`. Z punktu widzenia Hibernate, nieistniejący samochód istnieje w kontekście persystencji (jest zarządzany przez Hibernate) i jego stan nie został zmieniony, dlatego nie ma potrzeby wykonania operacji `INSERT` do bazy danych. W tej sytuacji aby dodać tę encję trzeba np. odłączyć ją od kontekstu za pośrednictwem `EntityManager.detach()`.

## 3. @Transactional, a checked exceptions
Jednym z kluczowych mechanizmów transakcji jest rollback, który wycofuje wszystkie zmiany w przypadku natrafienia na wyjątek. Domyślnie mechanizm ten wyzwalany jest przy wyjątkach `unchecked exceptions` dziedziczących po `RuntimeException` oraz przy wyjątkach dziedziczących po klasie `Error`, natomiast nie działa w przypadku `checked exceptions`, czyli wyjątków dziedziczących po klasie `Exception`. Aby mechanizm ten działał także w tym przypadku, należy wprost określić wyjątki, które mają uruchamiać rollback używając parametru `rollbackFor` w adnotacji `@Transactional` - przykładowo `@Transactional(rollbackFor = SomeBusinessException.class)` 

## 4. @Transactional w testach
Popularną praktyką w testach integracyjnych zahaczających o bazę danych jest użycie w nich adnotacji `@Transactional` (bezpośrednio lub pośrednio np. przez adnotację `@DataJpaTest`). Z pozoru jest to wygodne rozwiązanie, które np. gwarantuje nam czyszczenie bazy po każdym teście, jednak w praktyce może prowadzić do kilku pułapek. Istnieje ryzyko, że transakcje i ich zakresy obecne w naszych testach będą różniły się od tych obecnych w kodach produkcyjnych przez co nasze testy nie będą działały zgodnie z oczekiwaniami.

Załóżmy, że chcemy wyciągnąć z bazy właścicieli samochodów z konkretnymi numerami VIN. Dodatkowo chcemy, żeby zwrócone rekordy właścicieli (klasa `CarOwner`) zawierały jedynie wyfiltrowane samochody posiadające te numery VIN. Przykładowo dla właściciela o `id=1` oraz tabeli `car`:
```
 mileage | car_owner_id | id |    model     |   vin   
---------+--------------+----+--------------+---------
  199989 |            1 |  1 | Toyota Yaris | SZUKANY
  199989 |            1 |  2 | Audi A6      | INNY
```
Chcemy otrzymać rekord `CarOwner` zawierający w polu `CarOwner.cars` listę z jednym elementem - samochodem z numerem VIN o wartości "SZUKANY". W tym celu możemy napisać zapytanie:
```java
@Repository
public interface CarOwnerRepository extends JpaRepository<CarOwner, Long> {

    @Query("SELECT co, c FROM CarOwner co JOIN FETCH co.cars c WHERE c.vin IN :vinNumbers")
    List<CarOwner> findOwnersByCarVinNumbersAndFilterCars(List<String> vinNumbers);

}
```
Zapytanie to zostanie przekonwertowane na następujący SQL:
```sql
    select
        c1_0.id,
        c2_0.car_owner_id,
        c2_0.id,
        c2_0.mileage,
        c2_0.model,
        c2_0.vin,
        c1_0.name 
    from
        car_owner c1_0 
    join
        car c2_0 
            on c1_0.id=c2_0.car_owner_id 
    where
        c2_0.vin in ('SZUKANY')
```
Wykonanie tego zapytania bezpośrednio na bazie zwraca oczekiwany wynik:
```
 id | car_owner_id | id | mileage |    model     |   vin   | name 
----+--------------+----+---------+--------------+---------+------
  1 |            1 |  1 |  199989 | Toyota Yaris | SZUKANY | John
```

Napiszmy test integracyjny, który podniesie kontekst Springa i zweryfikuje poprawność działania tego zapytania:
```java
@SpringBootTest
class CarRepositoryTest {

    @Autowired
    CarOwnerRepository carOwnerRepository;

    @BeforeEach
    void populateDb() {
        CarOwner owner = new CarOwner();
        owner.setName("John");

        Car toyota = Car.builder()
                .vin("SZUKANY")
                .model("Toyota Yaris")
                .carOwner(owner)
                .mileage(199989)
                .build();
        Car audi = Car.builder()
                .vin("INNY")
                .model("Audi A6")
                .carOwner(owner)
                .mileage(199989)
                .build();

        owner.setCars(List.of(toyota, audi));

        carOwnerRepository.save(owner);
    }

    @Test
    @Transactional    
    void shouldFindOwnerWithFilteredCars() {
        List<CarOwner> owners = carOwnerRepository.findOwnersByCarVinNumbersAndFilterCars(List.of("SZUKANY"));
        assertThat(owners).hasSize(1);
        CarOwner carOwner = owners.get(0);
        assertThat(carOwner.getCars())
                .hasSize(1)
                .extracting(Car::getVin)
                .isEqualTo(List.of("SZUKANY"));
    }
}
```
Powyższy test wypełnia bazę danych w metodzie `populateDb()`, a następnie wykonuje testowane zapytanie do bazy. Następnie robi asercje, aby upewnić się, że zwrócony został właściciel z dokładnie jednym, szukanym samochodem. Uruchomienie tego testu zakończy się jednak błędem:
```
Expected size: 1 but was: 2 in:
[Car(id=1, vin=SZUKANY, model=Toyota Yaris, mileage=199989),
    Car(id=2, vin=INNY, model=Audi A6, mileage=199989)]
```
Pierwszą reakcją może być myśl, że zapytanie jest niepoprawne, jednak w tym przypadku powód jest inny. Powyższy test jest opakowany w `@Transactional` - oznacza to, że cały jego przebieg (uzupełnienie bazy danych testowymi danymi w `populateDb()` oraz sam właściwy test zapytania `shouldFindOwnerWithFilteredCars()`) wykonuje się w jednej transakcji, a tym samym w jednej sesji Hibernate. Ponieważ zapis do bazy wiąże się z wrzuceniem obiektu do kontekstu persystencji, Hibernate nie uwzględnia w pełni treści zapytania i zamiast pobrać wartości z bazy, pobiera je ze swojego cache L1. Taka sytuacja nie miałaby miejsca w przypadku kodów produkcyjnych, w których zapis do bazy oraz odczyt byłby najprawdopodobniej w zupełnie odrębnych transakcjach. 

Jeśli pozbędziemy się adnotacji `@Transactional`, test będzie przechodził zgodnie z oczekiwaniami. W takim przypadku jednak musimy sami zadbać o wyczyszczenie bazy po wykonanym teście - np. używając adnotacji `@AfterEach` i metody `carRepository.deleteAll()`.

#### Więcej o @Transactional w testach

O innym ciekawym problemie z adnotacją `@Transactional` można przeczytać we wpisie: [Czy wiesz dlaczego nie powinno się stosować adnotacji @Transactional w testach integracyjnych z Hibernate?](https://blog.consdata.tech/2025/09/01/transactional-w-testach-integracyjnych-hibernate.html)

