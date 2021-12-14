---
layout:    post
title:     "Transakcje - co warto wiedzieć?"
date:      2021-12-14 08:00:00 +0100
published: true
didyouknow: false
lang: pl
author:    rmastalerek
image:     /assets/img/posts/2021-12-14-transactions/transactions.jpg
tags:
    - transactions
    - spring
    - java
    - transactional
---

Czy ktokolwiek, po zamówieniu w restauracji kawy i ciastka chciałby zapłacić za oba, a otrzymać tylko czarny, gorący napój? Czy do zaakceptowania byłby fakt, że po wysłaniu przelewu na pokaźną kwotę, uszczuplony zostałby jedynie nasz rachunek, a kwota nie zasiliłaby konta odbiorcy? Podane przykłady mają na celu lepsze zilustrowanie zagadnienia, które zostanie poruszone w niniejszym wpisie. Pewne rzeczy mają sens tylko wtedy, gdy wykonywane są kompleksowo. Tym razem chciałbym przedstawić krótkie wprowadzanie do transakcji. Wpis zostanie podzielony na 2 części. W części pierwszej skupię się na przybliżeniu samej definicji oraz zasady działania transakcyjności w systemach baz danych oraz wykorzystaniu adnotacji _@Transactional_ w Springu. Kolejna część poświęcona będzie problemom jakie napotkaliśmy w codziennej pracy, co pozwoliło je zidentyfikować oraz jak zostały wyeliminowane.

# Transakcja
Pewien zbiór operacji, które muszą zostać wykonane kompleksowo (wszystkie lub żadna), nazywamy wlaśnie **transakcją**. Odniesienie do operacji bankowej o takiej samej nazwie jest nieprzypadkowe. Wspomniany we wstępie przykład przelewu jest modelowym wzorem transakcji. Wykonując przelew w banku pieniądze muszą jedocześnie zostać odjęte z rachunku nadawcy, jak i dodane w tej samej kwocie do salda konta odbiorcy. Tylko wtedy transakcja kończy się sukcesem.

W przypadku niepowodzenia, któregokolwiek z kroków, wykonane dotąd operacje muszą zostać cofnięte, a stan systemu przywrócony do chwili sprzed rozpoczęcia całej procedury.

Transakcje cechują się zasadą ACID. Jest to akronim 5 właściwości (konkretnie ich angielskich nazw), którymi charaktryzuje się transakcja:

- **A** (_ang. atomicity_) – atomowość – transakcja może zostać wykonana w całości albo anulowana. Jeżeli w trakcie wykonywania kroku objętego transakcją wystąpi problem, to wykonane zmiany powinny zostać cofnięte (rollback). Jeżeli wszystkie zakończone zostałyby sukcesem, to transakcja jest akceptowana (commit).

- **C** (_ang. consistency_) – spójność – mówiąc potocznie oznacza, że „baza jest w dobrym stanie”. Powracając do przykładu przelewu, spójność oznaczałaby, że konto, z którego wysyłane są środki, pozwala na dokonanie operacji. Po zakończeniu transakcji stan konta nie może być ujemny. Spójność jest zatem pewnym zestawem reguł i zasad, które należy przestrzegać.

- **I** (_ang. isolation_) – izolacja – właściwość, która odseparowuje od siebie operacje wykonywane jednocześnie tak, aby te nie miały na siebie wpływu. Chodzi np. o sytuację, gdy odwołujemy się do tej samej tabeli w bazie. Można też powiedzieć, że izolacja zapewnia, że w przypadku wykonywania operacji w sposób równoległy baza danych pozostanie w takim stanie, jakby operacje te zostały wykonane sekwencyjnie.

- **D** (_ang. durability_) – trwałość – gwarancja, że zaakceptowana transakcja nie zniknie niespodziewanie z systemu np. w przypadku awarii. Trwałość uzyskuje się poprzez zastosowanie mechanizmu replikacji, odnotowywania operacji w dzienniku logów czy poprzez zapis danych na dysku.

# Zarządzanie transakcjami w JDBC
Każdy, kto korzysta z mechanizmu transakcji w Springu wie, że pomocna w tym jest adnotacja **@Transactional**. Dzięki niej możemy zaoszczędzić trochę czasu, bo sami nie musimy implementować całego mechanizmu, którym zarządza framework. Warto jednak wiedzieć co dzieje się „pod maską”. Zobaczmy zatem jak wygląda uproszczone zarządzanie transakcją w JDBC, na którym zawsze bazujemy.

```java
// nawiązanie połączenia z bazą danych
Connection connection = dataSource.getConnection();

try (connection) {
	// Po utworzenia połączenia z bazą, połaczenie to jest w trybie tzw. „automatycznego zatwierdzania”. Oznacza to, że każda pojedyncza instrukcja SQL jest traktowana jako jedna transakcja i jest automatycznie zatwierdzana zaraz po jej wykonaniu. Ustawienie flagi autoCommit na false pozwala na wykonanie więcej niż jednej instrukcji w ramach jednej transakcji.
	connection.setAutoCommit(false);

	// ...
	// operacje wchodzące w skład transakcji
	// ...

	// zatwierdzenie transakcji
	connection.commit(); 
} catch (SQLException e) {
	// wycofanie zmian w przypadku błędów 
	connection.rollback(); 
}
```

## Poziomy izolacji
Mając już ogólny pogląd tego, jak zaimplementowany jest mechanizm transakcji warto wspomnieć o sposobie ustawiania blokad w dostępie do danych. Sposób ustawiania blokad określany jest mianem **poziomu izolacji** transakcji i pomaga w zachowaniu integralności danych. Określają one zasady równoległej realizacji kilku transakcji.

W JDBC występuje 5 poziomów izolacji transakcji:
- `TRANSACTION_NONE` - brak transakcji
  
- `TRANSACTION_READ_COMMITTED` - inne transakcje nie mogą odczytywać zmienionych wierszy przed wywołaniem metody _commit()_
  
- `TRANSACTION_READ_UNCOMMITTED` - dopuszcza odczyt danych przed wywołaniem metody _commit()_
  
- `TRANSACTION_REPEATABLE_READ` - chroni przed sytuacją, gdy transakcja odczytuje wiersz, druga transakcja go zmienia, a pierwsza ponownie odczytuje otrzymując inne dane
  
- `TRANSACTION_SERIALIZABLE` - chroni przed sytuacją, gdy jedna transakcja odczytuje zbiór wierszy spełniający określone kryteria, a następnie druga transakcja wstawia wiersz spełniający ten sam warunek, po czym pierwsza ponownie odczytuje ten sam zbiór wierszy dostając nowy rekord
System Zarządania Bazą Danych może np. zablokować wiersz tabeli, dopóki nie zostaną zatwierdzone aktualizacje. Efektem takiej blokady byłoby uniemożliwienie użytkownikowi uzyskania **brudnego odczytu**  (_ang. dirty read_). Odczyt tego typu polega na dostępie do zaktualizowanej wartości, która nie została jeszcze zatwierdzona, i której istnieje możliwość przywrócenia do wartości poprzedniej.

**Niepowtarzalny odczyt** (_ang. non-repeatable read_) ma miejsce wtedy, gdy transakcja A pobiera wiersz, transakcja B go aktualizuje, a następnie transakcja A pobiera ten sam wiersz ponownie. W takim przypadku transakcja A pobiera dwa razy ten sam wiersz, ale widzi różne dane.

**Odczyt fantomowy** (_ang. phantom read_) to sytuacja, gdy transakcja A pobiera zbiór wierszy będących w danym stanie. Transakcja B następnie wstawia lub aktualizuje wiersz do tabeli. Następnie transakcja A ponownie odczytuję zbiór wierszy widząc tym razem nowy lub zaktualizowany wiersz, określany jako fantom.

| Poziom izolacji                | Brudne         | Niepowtarzalne         | Fantomowe         |
|                                | odczyty        | odczyty                | odczyty           |
| ------------------------------ |:--------------:|:----------------------:|:-----------------:|
| `TRANSACTION_NONE`             | Nie dotyczy    | Nie dotyczy            | Nie dotyczy       |
| `TRANSACTION_READ_COMMITTED`   | Uniemożliwione | Dozwolone              | Dozwolone         |
| `TRANSACTION_READ_UNCOMMITTED` | Dozwolone      | Dozwolone              | Dozwolone         |
| `TRANSACTION_REPEATABLE_READ`  | Uniemożliwione | Uniemożliwione         | Dozwolone         |
| `TRANSACTION_SERIALIZABLE`     | Uniemożliwione | Uniemożliwione         | Uniemożliwione    |

## Punkty zapisu (_ang. save points_)
Oprócz operacji zatwierdzania transakcji (_COMMIT_) oraz jej wycofywania w przypadku niepowodzenia (_ROLLBACK_),  istotna jest jeszcze jedna funkcja całego mechanizmu – **punkty zapisu**. Są to miejsca, do których nastąpi wycofanie transakcji, w przypadku awarii czy niepowodzenia. Posługując się fragmentem kodu, zastosowanie punktów zapisu, mogłoby wyglądać tak:
```java
// ustawienie poziomu izolacji
connection.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITED);

// instrukcje wykonywane w ramach transakcji – część 1
// …

// ustawienie punktu zapisu 
Savepoint savepoint = connection.setSavepoint();

// instrukcje wykonywane w ramach transakcji – część 2 
// … 

// przywrócenie zmian do stanu z punktu zapisu
connection.rollback(savePoint);
```

# Transakcje w Springu
O ile JDBC pozwala na zarządzanie transakcjami poprzez wykorzystanie _setAutocommit(false)_, o tyle Spring daje kilka sposobów osiągnięcia tego samego w znacznie wygodniejszy sposób.

## Programowalne zarządzanie transakcją
Pierwsza, ale raczej rzadko wykorzystywana metoda to użycie _TransactionTemplate_ albo _PlatformTransactionManager_. Sposób jej użycia wygląda następująco:
```java
@Service
public class BookService {

	@Autowired
	private TransactionTemplate template;

	public Long addBook(Book book) {
		Long id = template.execute(status → {
			// dodaj książkę do bazy i zwróć wygenerowany identyfikator 
			// … 
			return id;
		});
	}
}
```
**Zalety**:
- nie trzeba zaprzątać sobie głowy otwieraniem i zamykaniem połączenia z bazą danych poprzez stosowanie bloku _try-catch-finally_. Zamiast tego wykorzystywany jest mechanizm callback’ów (`Transaction Callbacks`).
- nie trzeba przechwytywać wyjątków _SQLException_, ponieważ Spring konwertuje je na wyjątki _RuntimeException_.
- lepsza integracja z ekosystemem Springa. _TransactionTemplate_ wykorzystuje _TransactionManager_ do konfiguracji połączenie z bazą danych. Ich implementacja wiążę się z koniecznością utworzenia odpowiednich beanów, jednak później nie musimy się już martwić o zarządzanie nimi.

## Deklaratywne zarządzanie transakcją
O ile powyższa metoda jest znacznym usprawnieniem i ułatwieniem w zarządzaniu transakcjami, to  Spring daje nam nieco więcej, a wszystko za sprawą adnotacji **`@Transactional`**. Dzięki niej, każda publiczna metoda, która zostanie oznaczona tą adnotacją, zostanie wykonana wewnątrz transakcji.
Mając już wiedzę w jaki sposób wygląda zarządzanie transakcją w JDBC, zobaczmy jak łatwo przekształcić tak, aby wykorzystywał dobrodziejstwo frameworka Spring:

Na początek zobaczmy jak wyglądałoby dodanie nowej książki do bazy przy użyciu JDBC:
```java
public class BookService {

    public Long addBook(Book book) {
        Connection connection = dataSource.getConnection();
        try (connection) {
            connection.setAutoCommit(false);

	// dodaj książkę do bazy i zwróć wygenerowany identyfikator 
            // bookDao.save(book);

            connection.commit();
        } catch (SQLException e) {
            connection.rollback();
        }
    }
}
```
A teraz przyjrzyjmy się użyciu adnotacji _@Transactional_ w Springu:
```java
public class BookService {
	@Transactional
	public Long addBook(Book book) {
		// dodaj książkę do bazy i zwróć wygenerowany identyfikator 
		// bookDao.save(book);
		return id;
	}
}
```
Wygląda znacznie prościej prawda? Aby skorzystać z adnotacji _@Transactional_, konieczne jest jedynie zdefiniowanie menadżera transakcji w konfiguracji Spring’a oraz dodanie adnotacji _@EnableTransactionManagement_ (w Spring Boot nie jest to konieczne).
```java
@Configuration
@EnableTransactionManagement
public class MyConfig {

    @Bean
    public PlatformTransactionManager transactionManager() {
        return transactionManager;
    }
}
```

## Jak działa adnotacja @Transactional
Spring pozwala na wykorzystanie usługi BookService w każdym innym beanie, który tego wymaga. Stosując adnotację _@Transactional_ i odwołując się do metody, która jest nią opatrzona, Spring nie odwołuje się bezpośrednio do tej metody, ale tworzy tzw. **proxy transakcyjne**. Dzieje się to przy pomocy biblioteki _Cglib_ i metody zwanej _proxy-through-sublcassing_. Zadaniem tego proxy jest zawsze:
- otwieranie i zamykanie połączeń/transakcji z bazą danych
- delegowanie zadania do rzeczywistej usługi, jak nasze _BookService_
  
Całą procedurę można zobrazować prostym diagramem:
![2021-12-14-transaction-proxy.png](/assets/img/posts/2021-12-14-transactions/transaction-proxy.png)

## Poziomy propagacji (_ang. propagation levels_)
Spring pozwala na jeszcze jedną konfigurację mechanizmu zarządzania transakcjami. Daje bowiem możliwość ustawienia tzw. **poziomów propagacji**, które pozwalają niejako rozgraniczyć logikę biznesową w naszej aplikacji. Spring pozwala na wykorzystanie następujących rodzajów propagacji:
- `REQUIRED` (domyślna) – Spring sprawdza czy istnieje aktywna transakcja, i jeżeli nie, tworzy ją. W przeciwnym razie logika biznesowa zostaje wykonana w ramach istniejącej transakcji.
- `SUPPORTS` – Spring najpierw sprawdza czy istnieje aktywna transakcja. Jeżeli tak, wtedy jest ona wykorzystywana do wykonania logiki biznesowej, w przeciwnym razie logika wykonana jest poza transakcją.
- `MANDATORY` – Podobnie, jak w przypadku `SUPPORTS`, Spring njpierw poszukuje aktywnej transakcji, i jeżeli ją znajdzie, to ją wykorzystuje. W przeciwnym razie rzucany jest wyjątek.
- `NEVER` – Spring rzuca wyjątek w przypadku wykrycia aktywnej transakcji
- `NOT_SUPPORTED` – Jeżeli istenieje aktywna transakcja, Spring przerywa ją, a następnie logika biznesowa wykonywana jest poza transakcją.
- `REQUIRES_NEW` – Podobnie, jak w przypadku `NOT_SUPPORTED`, Spring przerywa aktywną transakcję, lecz tym razem tworzy nową na potrzebę wykonania logiki biznesowej w odrębnej transakcji.
- `NESTED` – Spring sprawdza czy istnieje aktywna transakcja. Jeżeli tak, to utworzony zostaje punkt zapisu. Oznacza to, że jeżeli wykonana następnie logika biznesowa zakończy się błędem, to stan systemu zostanie przywrócony do punktu zapisu. Jeżeli natomiast nie ma aktywnej transakcji, to system zachowa się tak, jak w przypadku `REQUIRED`.

## Pułapka
Na zakończenie warto wspomnieć o częstym błędzie popełnianym głównie na początku przygody z transakcjami. Zdarza się, że adnotacją _@Transactional_ oznacza się powiązane ze sobą metody w tej samej klasie oczekując, że te wykonane zostaną w ramach odrębnych transakcji. W takim przypadku należy spojrzeć ponownie na powyższy diagram. Spring tworzy proxy transakcyjne, ale w momencie, gdy znajdziemy się już w rzeczywistym beanie _BookService_ i wywołamy inne metody w nim zaimplementowane, żadne nowe proxy nie będzie zaangażowane w te operacje. Innymi słowy, nie zostanie rozpoczęta żadna nowa transakcja.

Spójrzmy na poniższy kod, który tworzy streszczenie wybranej książki, następnie zapisuje je w bazie i wysyła e-mail. Mimo oznaczenia obydwu metod adnotacją _@Transactional_, zgodnie z powyższym wyjaśnieniem, otwarta zostanie jedynie pojedyncza transakcja, nawet gdyby druga metoda jawnie wskazywała na konieczność utworzenia nowej transakcji poprzez ustawienie odpowiedniego **poziomu propagacji**.
```java
@Service
public class BookService {
    @Transactional
    public void sendBookSummary() {
        createBookSummary();
        // zapisz streszczenie w bazie
        // wyślij streszczenie mailem, itd.
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createBookSummary() {
        // ...
    }
}
```

# Podsumowanie
Było to teoretyczne wprowadzenie do systemu zarządzania transakcjami w Javie. Na początku dowiedzieliśmy się czym w ogóle jest transakcje, dlaczego są ważne i co je cechuje. Następnie przedstawiony został mechanizm działania transakcji w JDBC po to, by na koniec zaprezentować uproszczenie implementacji tego mechanizmu w Springu. W kolejnym artykule z tej serii dowiemy się jakie problemy napotkaliśmy wykorzystując mechanizm zarządzania transakcjami, jak udało się go zlokalizować oraz na czym polegała poprawka. 