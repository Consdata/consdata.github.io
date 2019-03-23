---
layout:    post
title:     "Świat Kotlina, Javy, Vavra, Arrowa, czyli wszystko co potrzebne do programowania funkcyjnego."
date:      2018-04-01 08:00:00 +0100
published: false
author:    Łukasz Sroczyński
tags:
    - tech
    - kotlin
    - java
    - javascript
    - functional programming
    
---

TODO("Aktualizacja linków")

W naszym programistycznym świecie stare prawdy często wracają do łask mimo swoich lat. Choćby algorytmy machine learningowe oraz modele statystyczne, które to były głównie na uczelniach i w bardzo wąskiej grupie biznesów teraz zyskują na popularności. Dzieje się to za sprawą tego, że próg wejścia zmniejsza się z każdą nową biblioteką, która ułatwia kolejną rzecz. Można operować na surowych algorytmach machine learningowych, ale jako programiści zapewne sięgniemy po coś pokroju PyTorcha, albo Kerasa, który to pozwoli nam szybciej wejść w świata Deep Learningu (w tym przypadku). Przy pomocy narzędzi będziemy w stanie szybciej stworzyć prototyp i przetestować nasz pomysł.

Programowanie funkcyjne nie jest inne. Pozwala nam pisać kod, który jest czystszy, a przedewszystkim łatwo testowalny. Oddzielamy kod, który jest zależny od innych usług. W ten sposób nie potrzebujemy armii Mocków jako zaślepek oraz mamy potencjalnie mniej możliwych błędów na produkcji. Oczywiście nie usuwa to wszystkich rodzajów błędów, ale zdecydowanie czyni kod bardziej bezpiecznym. A to w jaki sposób to robi omówimy sobie za chwilę. 

W Javie mamy różne funkcyjne bibliteki umożliwiające tworzenie bardziej funkcyjnego kodu. Można użyć Vavra, albo JOOλ. W Kotlinie mamy Arrow choć sam język jest tutaj z natury funkcyjny. Wszystkie te rzeczy to po prostu przemapowanie funkcyjności ze Scali, czy też innych funkcyjnych języków.

**Będziemy używać tych rzeczy:**

```
// Kotlin
implementation 'org.jetbrains.kotlin:kotlin-stdlib-jdk8'
implementation 'org.jetbrains.kotlin:kotlin-reflect'
implementation 'io.arrow-kt:arrow-core:0.8.2'

// Java
implementation 'io.vavr:vavr:0.10.0' // Uwaga: Nie będzie standardowej biblioteki Javy!
implementation 'org.projectlombok:lombok:1.18.6'
implementation 'org.apache.commons:commons-lang3:3.7'
```

**Oraz omówimy te rzeczy:**

* Parę słów o programowaniu imparatywnym, proceduralnym, obiektowym, funkcyjnym.
* Funkcyjne, czyli: `pure functions` + `immutability` = referential transparency 🕵
* First-class citizens, Higher-order functions w Kotlinie, Javie oraz JSie.
* Co znać w dzisiajszej Javie? 
* Monads, Memoization, Values oraz inne potencjalnie niezrozumiałe pojęcia.
* Do tego spora garść przykładów funkcyjnych porównujących Kotlina z Javą. Każdy znajdzie coś dla siebie.

[Kody z wpisu znajdziesz tutaj](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages)

**Jako, że funkcyjnie można w każdym języku to opiszemy sobie to podejście na przykładzie Kotlina, Javy oraz JSa!**

## Ale zacznijmy od początku... 🛤 
Funkcjnie, czyli mamy... funkcje. Mają one jakieś wejście/wyjście. Jednym z głównych konceptów jest tutaj modułowość. Możemy rozbić nasz algorytm na mniejsze pod-funkcje. Jak wiadomo nasze umysły mają tylko ograniczoną ilość RAMu do rozwiązywania codziennych problemów, dlatego wymyślamy koncepty, paradygmaty, standardy, aby uprościć to wszystko. Małe moduły mogą być kodzone szybko i być łatwo testowane. Do tego jest możliwe ich re-używanie. Mamy tutaj kilka najważniejszych zasad dobrego kodu spakowane do jednego worka. Jest to jeden z powodów dlaczego programowanie zorientowane na funkcje staje się poopularne. 

## Funkcje naturalnym wrogiem obiektów? 💣
Jak to zwykle bywa czasami jest hype na nowy język, framework, metodykę, czy jak w tym przypadku funkcyjny paradygmat. Zazwyczaj stoją ku temu powody i tymi powodami najczęsciej jest rozwiązanie jakiegoś problemu, który niektórym z nas akurat przeszkadzał. Niemniej ważne, że przy takich sprawach wsprowadzamy rozwiązanie do problemu, a nie problem do rozwiązania. Używanie FP wcale nie znaczy, że OOP jest już passé. Wręcz przeciwnie oba paradygmaty doskonale ze sobą współpracują. Dobra... Może nie do końca współpracują, ale bardziej zastępują lub uzpełniają niektóre techniki zawierające się w innych paradygmatach.

## Paradygmat proceduralny, imparatywny 📉
Jest to po prostu lista instrukcji, która prowadzi Cię do celu. Dokładne kroki prowadzące do rozwiązania. Niemniej algorytm podczas wykonywanie zmienia swój stan, a to jest rzecz jakiej nie pożądamy w dzisiejszych wielowątkowych czasach. Prowadzi to do wielu nieporządanych efektów. Najłatwiej jest zrozumieć na przykładzie, także napiszmy trochę pseudo-kodu.   

IF `A == 0` RETURN `B` ELSE `B++ AND A--`

Widzimy tutaj czarno na białym mutowalne zmienne. Zmieniamy, niszczymy stan obiektów jakimi operujemy. Możesz spytać... Dlaczego jest to złe? Powiedzmy, że pomiędzy `B++` oraz `A--` wchodzi nowe wymaganie biznesowe. W tym momencie jesteśmy w kropce, bo zmiana ta wpływa na wynik działania całego naszego algorytmu. Oczywiście nie chcemy tego.

**W imparatywnym programowaniu skupiamy się na tym co chcemy zrobić. Wykonujemy konkretne czynności.**

## Paradygmat funkcyjny, deklaratywny 📈
Funkcjny kod ma zapewnić jak najmniejszą ilość efektów ubocznych, czyli mamy `in -> out`. Jedną z podstawowych rzeczy jakie podejście funkcyjne promuje jest `immutability`, czyli w pewnym stopniu rozwiązanie powyższego problemu. W ten sposób nie wpływamy bezpośrednio na stan obiektu, bo jest on niezmienny. Do tego pure functions `in -> out` zapewniają bardziej deterministyczny sposób działania aplikacji. Co ważne nie potrzebujemy armii Mocków do wyizolowania przypadku testowego.

### Prosty przykład `in -> out` w Kotlinie `.map { }`

```kotlin
data class Order(val name: String, val amount: Int)

val orders = listOf( Order("product1", 10), Order("product2", 30) )

orders.map { it.amount + 1 }
```

Wchodzi lista zamówień `in`, a wychodzi `out` lista zamówień powiększona o 1.

**W funkcyjnym programowaniu skupiamy się na tym co chcemy osiągnąć, a nie tym co chcemy zrobić. Drobna, a jednak znaczna różnica co zobaczymy już za chwilę.**

### Czemu immutability jest ważne?

* łatwiejsze w użyciu obiekty oraz mniej rzeczy może pójść nie tak
* mniej interakcji pomiędzy innymi częściami aplikacji
* mogą być dzielone pomiędzy różnymi wątkami

```java
// Weźmy sobie dzisiejszą datę... | 2019.04.01
val date = new Date(); 

// Wrzućmy to do mapy... Przyda się na później...
val map = new HashMap<Date, String>();
map.put(date, "value"); 

// Wiele linijek dalej...

val magicNumber = 123 
date.setTime(magicNumber); // To jeszcze tylko ustawię nową datę i można iść po kawę...

// Sprawdzę, czy aby na pewno data jest na miejscu...
map.containsKey(date);  // false, ale chwila przecież zrobiłem zmienną jako immutable

date // 1970... chyba jednak nie będzie kawy :(  
```

**Disclaimer:** Powyższy kod jest w Javie. Ostatnio odkryłem, że lombok posiada `val`, czyli `final` plus typ obiektu jest zgadywany przez kompilator, czyli to samo co w Kotlinie oraz Scali. Całkiem fajne. Sam kod jest sporo czytelniejszy, a do tego wciąż równie bezpieczny.

Przechodząc do konkretów. Oczywiście nikt już nie używa starego mutowalnego `java.util.Date`, ale pokazuje to, że immutability rozwiązuje problemy zanim się pojawią. Kosztem niezmienności obiektów jest oczywiście pożeranie większych ilości pamięci, bo nie zmieniamy stanu tylko kopiujemy całe obiekty. W takim scenariuszu będziemy widzieć nie tyle znacząco więcej pożeranej pamięci przez JVMkę, ale bardziej zaobserwujemy częstsze trigerowanie się odśmiecania w Garbage Collectorza. A to z kolei powoduje częstsze `stop-the-world`, czyli moment, w którym pamięć jest odśmiecana i wszelkie wątki, które wykonywały swoje zadania zatrzymują się.

**Jeśli niebardzo wiesz co to immutability oraz co się stało z Date to [bardziej szczegółowy opis znajdziesz tutaj](link).**

## Odetchnijmy na chwilę od Javy i przejdźmy do JSa
### Tu też można funkcyjnie! W sumie nawet bardziej aniżeli w Javie
Pobawmy się zatem function composition (function chaining). Co oznacza nie mniej nie więcej, że wynik poprzedniej funkcji jest przekazywany do kolejnej. Ponownie jest tutaj immutability gdzie obiekt jest kopiowany zamiast zmieniania jego stanu.

```javascript
function clearSomeImpurities(text) {
  return text.toLowerCase()   
    .trim()
    .split(" ")
    .join(" & ");
}

clearSomeImpurities("RiCk MoRtY") // "rick & morty"
```

### Jeśli jesteśmy już przy JSie. To zobaczmy jeszcze na świętą trójcę, czyli `filter`, `map`, `reduce`

```javascript
let films = [
{ title: "Rick & Morty", type: "X", totalTimeWatched: 333 },
{ title: "Game of Thrones", type: "X", totalTimeWatched: 888 },
{ title: "unknown", type: "unknown", totalTimeWatched: 1111111 }
]

const byType = (film) => film.type == "X";
const byTotalTimeWatched = (film) => film.totalTimeWatched;
const getSumTotalTimeWatched = (acc, amount) => acc + amount;

function getTotalTimeSpentWatching(films) {
    return films
            .filter(byType)
            .map(byTotalTimeWatched)
            .reduce(getSumTotalTimeWatched, 0);
}

getTotalTimeSpentWatching(films); // 1221
```

To co widzisz powyżej to higher-order function, które omówimy już za chwilę. Warto też rozkładać kod na mniejsze pod funkcje, możliwe jak najbardziej opisowe. Osoba czytająca ten kod na pewno doceni buga jakiego zostawiłeś, ale może trochę załagodzisz sprawę zrozumiałym kodem.

## `Pure Functions` + `Immutability` = `Referential Transparency`🕵

**Referential transparency** - jest to po prostu brak efektów ubocznych.

Czyli `in -> out` zamiast `in -> file -> exception -> db -> whatever -> 💩 -> info -> out` 

Brak zależności od zewnętrznych serwisów, plików, czy nastroju programisty. Funkcja zawsze zwraca to co powinna. Jest deterministyczna. Nie zgłosi wyjątku. Nie przestanie działać z powodu braku danych z API, bazy, czy jakiegoś urządzenia IoT zbierającego dane. Po prostu działa i zawsze zwraca to samo przy podanych argumentach. 

**Pure** - czyli wynik jest zawsze ten sam dla tych samych danych wejściowych `in`.

```java
// Nie jest to referencyjnie przezroczyste
Math.random(); // Wynik jest różny za każdym razem

// Jest referencyjnie przezroczysta. Jest deterministyczna
Math.max(1, 2); // Wynik zawsze jest taki sam

```

W całych tych skutkach ubocznych nie chodzi o świat bez nich, ale o to, aby nie musieć się z nimi borykać bezpośrednio. Ponownie wracamy do podstaw, czyli enkapsulacji. Chcemy po prostu ukryć pewne rzeczy, które są w danym momencie zbędne, niezwiązane z danych kontekstem w jakim działamy. Wystarczy po prostu przekazać odpowiedni argument: 

`sum(1, sum(1, sum(1,2)))` == `sum(1, sum(1, 3))` == `sum(1, 4)`

Powiedzmy, że drugi argument nie jest potrzebny. Jest on zawsze stały w naszej aplikacji. 

Taką funkcję można by zoptymalizować `SOMETHING = 4` >> `sum(1, SOMETHING)`

Jeśli funkcja zwraca `void` to jest całkiem dobry znak, że niekoniecznie jest pure. Dobrym przykładem jest `List` ze standardowej biblioteki, która udostępnia metody zmieniające stan `add()`, `remove()` oraz inne. Jest to jeden z powodów dlaczego lepiej używać vavra.   

Co do wyjątków to jest to tylko częściowa prawda. Metoda może oczywiście zgłosić OutOfMemoryException, StackOverflow, czy inne. Niemniej tego typu wyjątki to te, na które nie mamy bezpośredniego wpływu. Są one bardziej sygnałem że mamy większy problem w apce o jaki powinniśmy się zatroszczyć i to jak najszybciej.

## First-class citizens 👨
Czyli traktowanie funkcji jako wartości. Stwórzmy zatem funkcję o wdzięcznej nazwie `adder` w Kotlinie.

```kotlin
fun add(a: Int, b: Int) = (a + b).toDouble()
val adder = ::add

adder(1,1) 
```

Albo po prostu

```kotlin
val adder: (Int, Int) -> Double = { a, b -> (a + b).toDouble() }

adder(1,1) // 2.0 
// Jak widać jedna z bardziej przydatnych funkcji jakie tutaj zrobiliśmy :)   
```

Przykład na [githubie](lnik).

## Higher-order functions 🌀
Czyli przekazanie funkcji jako paramter do innej funkcji - istna incepcja. 

### Na początek zobaczmy na [prosty przykład w Javie](link)

Metoda: `availableCustomers(Supplier<Boolean> customerAvailability)` 

Przyjmuje supplier jako paramter. Możemy tutaj przekazać method-reference: `Customer::isAvailable` 

`HigherOrderFunctions.availableCustomers(Customer::isAvailable)`

**Jeśli jeszcze nie nadrobiłeś zadania domowego z funkcyjnych interfejsów w Javie to możesz zerknąć [tutaj]((http://www.braintelligence.pl/tutorial-java-8-up-to-11-most-important-things-to-know-about-modern-java/)) gdzie opisałem większość nowości w Javie od 8 do 11.**

### Bardziej skomplikowany funkcyjny [przykład w Kotlinie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/kotlin/pl/braintelligence/kotlin/HigherOrderFunctions.kt)

```kotlin
fun calculate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return operation(x, y)                                        
}

fun sum(x: Int, y: Int) = x + y                                   

fun main() {
    val sumResult = calculate(4, 5, ::sum)                        
    val mulResult = calculate(4, 5) { a, b -> a * b }             
    println("sumResult $sumResult, mulResult $mulResult") // sumResult 9, mulResult 20
}
```

### A na koniec równie funkcyjny JSowy przykład
```javascript
const evenNumber = elem => elem % 2 == 0;
const listOfNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
listOfNumbers.filter(evenNumber); // [0, 2, 4, 6, 8, 10]
```

Gdzie przekazaliśmy funkcję `evenNumber` jako argument do funkcji `filter`.

Wcześniej w tym wpisie już poznałeś bardziej skomplikowany przykład `filter`, `map`, `reduce`.

## Kotlin oraz Java - funkcyjne starcie


### Kilka różnych struktur typu Value [(przykłady tutaj)](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/ValueExample.java)

`Value` - czyli po prostu finalne obiekty A.K.A. immutable objects, czyli thread-safy za darmo!

### `Option` - czyli obrona przed nullem!
Jest to praktycznie to samo co Optional. Różnica jest taka, że ma tylko jedną metodę `Option.of()`. Optional jest bardziej dwuznaczny posiadając dwie metody `Optional.of()` oraz `Optional.ofNullable()` co niezawsze jest oczywiste gdzie i jak użyc. Odnośnie optionali było więcej w [tym wpisie](http://www.braintelligence.pl/tutorial-java-8-up-to-11-most-important-things-to-know-about-modern-java/). Tym samym przejdźmy zwinnie do [przykładów](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/ValueExample.java). 🙆‍♂️

#### 1️⃣ Na początek klasycznie dla wielbicieli nulla

Prawdopodobnie najgorszy przypadek. Jedno, że sprawdzanie `!= null` jest katorgą i nieczytelne.

Drugie to zwracanie domyślnego nulla `return null` na końcu prowadzi do wielu problemów (choćby ten, który właśnie robimy).

Pełny przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

```java
private String badCascadingPileOfCrapAndNullReturnedWorst() {
    User user = userRepository.findOne("123");

    if (user != null) {
        Address address = user.getAddress();
        if (address != null) {
            String street = address.getStreet();
            if(street != null) {
                return street; // ufff.. to się nazywa praca, a nie tam jakiś biblioteki używają...
            }
        }
    }

    return null;
    }
```

#### 2️⃣ Dobra ktoś powiedział, że Optionale są lepsze od nulla, trzeba zatem używać

Podobnie zły przypadek jak powyżej. Jedyny plus to zwracanie `Optional.empty()`.

Używanie `isPresent()` jest podobnie złe jak używanie `get()` (przynajmniej w tym przypadku). 

Używając `get()` całkowicie wyrzucamy to co dodaliśmy do optionala i rzucamy NullPointerException.

Pełny przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

```java
    private Optional<Address> badCascadingOptionalPileOfCrap() {
        Optional<User> user = Optional.ofNullable(userRepository.findOne("123"));
        
        if (user.isPresent()) 
            Optional<Address> address = Optional.ofNullable(user.get().getAddress());
            
            if (address.isPresent())
                Optional<String> street = Optional.ofNullable(address.get().getStreet());
                
	             if(street.isPresent())
                     return street; // potem się dziwić, że ludzie nie lubią Optionali...

    return Optional.empty();
    }
```

#### 3️⃣ No to może zrobić ten kod bardziej funkcyjnym?

Zastosowanie `Optional` lub `Option` w tym przykładzie wyglądałoby podobnie. 

Niemniej vavr posiada dużo więcej metod pomocniczych z jakich można wybierać oraz jak było powiedziane poprzednio jest mniej dwuznaczny.

Pełny przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

```java
private Option<String> fetchStreetFromDB() {
    return optionUserRepository.findOne("123")
        .flatMap(User::getAddress)
        .map(Address::getStreet)
        .getOrElse(Option.none());
}
```

W powyższym przykładzie `flatMap` spłaszcza strukturę do tego co chcemy. Działa ona w następujący sposób: 

```
// Mając listę list spłaszczasz do listy
val listOfList = List.of(List.of("123"), List.of("123", "456"));
// List(123), List(123, 456)

listOfList.flatMap(List::toStream) // List(123, 123, 456)

```

Jeszcze jeden krótki przykład i przechodzimy do wisienki na torcie, czyli Kotlina.

```java
// Option
val result = Option.of(null)
        .map(Object::toString)
        .map(String::toLowerCase)
        .getOrElse(() -> "DEFAULT");

result // DEFAULT
```

#### 4️⃣ Jak zrobić to samo w Kotlinie?

Przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/kotlin/pl/braintelligence/kotlin/WorkingWithOptionalCode.kt).

```kotlin
user?.address?.street
```

Gdy koledzy obok kończą pisać funkcję w Javie Ty właśnie wracasz z kubkiem kawy. ☕

```
// Można jeszcze dodać elvisa z jakąś domyślną wartością
user?.address?.street ?: "nasty null was found instead of a street :("
```

Każdy obiekt oznaczony `?` jest uznawany za potencjał do zwrócenia nulla - jest to tak zwany safe-call. Więcej w [dokumentacji](https://kotlinlang.org/docs/reference/null-safety.html). Dla wielbicieli NPE jest również `user!!`, które wyrzuci najpopularniejszy wyjątek. :)

### Error handling - catch them all❗

Mamy kilka struktur gdy chcemy obsłużyć wyjątki: 

* `Try<Value>` - coś może się popsuć.
* `Either<Exception, Value>` - albo wyjątek po lewej, albo prawidłowa wartość po prawej.
* `Validation<List<Exception>, Value` - akumulacja błędów. 

Jako, że checked exception psują nam przepływ funkcji oraz nie lubią się z lambdami używając funkcji staramy się ich unikać, albo reagować w odpowiedni sposób.

Jest wiele opini co do checked exceptions i nawet nie chcę wchodzić tutaj w dyskusję o tym, niemniej żyje się szczęśliwiej bez nich mimo wszystko. Warto mieć również na uwadze, że większość języków tego nie ma, Kotlin, C#, Scala. Jako, że funkcyjne podejście zyskuje na popularności to tym bardziej nie będziemy chcieli się bezpośrednio borykać z niewygodnymi wyjątkami.

[Przykład](link) gdy chcemy olać wyjątek.

```java
// Klasyczny try-catch 
try {
    User.findUserInfoByAccountNumberFromFile("123");
} catch (IOException e) {
    log.error(e.getMessage());
}

// Funkcyjnie olany wyjątek 
lift(User::findUserInfoByAccountNumberFromFile)
    .apply("123")
    .getOrElse("DEFAULT")
```

Podobny [przykład](link) gdzie interesuje nas tylko pozytywny wynik. 

```
Try.of(() -> User.findUserInfoByAccountNumber("123"))
    .onSuccess(System.out::println);
```

Podobny [przykład](link) gdzie reagujemy jeśli wynik nie jest pozytywny.

```java
divide(1, 1)
    .onFailure(e -> System.out.println("Sorry, not possible."))
    .onSuccess(System.out::println);

Try<Integer> divide(Integer dividend, Integer divisor) {
    return Try.of(() -> dividend / divisor);
}
```

Kolejny tym razem bardziej praktyczny [przykład](link).

```java
val result2 = Try.of(() -> new URL("KABOOM-http://braintelligence.pl"))
        .map(URL::getHost)
        .getOrElse(() -> "google.pl");

result2 // google.pl
```

Oraz taki bardziej skomplikowany [przykład](link).

```java
val result = fetchArticlesFromFacebook()
                .orElse(() -> fetchArticlesFromGoogle())
                .getOrElse(List::empty)
                .filter(name -> !name.getName().contains("123"))
                .map(Article::getName);
                    
fetchArticlesFromFacebook() // throws NoSuchElementException
fetchArticlesFromGoogle() // returns list of articles
     
```

**Co tu się dzieje?**

1. Pobieramy artykuły od Facebooka. Jeśli Facebook rzuca błędami pobieramy od Google.
2. Jeśli nic nie przyło zwracamy pustą listę
3. Odrzucamy artykuły, które zawierają w nazwie 123.
4. Zwracamy listę artykułów.

Mimo tego, że mamy tutaj efekty uboczne to wiemy, że funkcja zwróci wynik, albo pustą listę. (funkcja jest referencyjnie transparentna).

Dokładnie ten sam [przykład](link) w Kotlinie: 

```kotlin
val result = fetchArticlesFromFacebook()
    .orElse { fetchArticlesFromGoogle() }
    .getOrElse { emptyList() }
    .filterNot { it.name.contains("123") }
    .map { it.name }
```

















### Functional sugar 🍩 🍰 🍨


### Pattern Matching

Czyli po prostu armia if-else-if...

```
private String matchStatusCode(int httpStatus) {
    if (httpStatus == HttpStatus.OK.value()) {
        return "all fine";
    } else if (httpStatus == HttpStatus.NOT_FOUND.value()) {
        return "nothing here";
    } else if (httpStatus == HttpStatus.I_AM_A_TEAPOT.value()) {
        return "wtf?";
    }
    return "DEFAULT";
}
```

Czasami można użyć do tego Vavra, aby stworzyć kod trochę czytelniejszym. Jest to przydatne kiedy musimy reagować na różne sposoby. 

```
Match(httpStatus).of(
    Case($(HttpStatus.OK.value()), "all fine"),
    Case($(HttpStatus.NOT_FOUND.value()), "nothing here"),
    Case($(HttpStatus.I_AM_A_TEAPOT.value()), "wtf?"),
    Case($(), "DEFAULT")
);
```

Ponadto, można reagować na wyjątki w następujący sposób.

```java
Match(fetchUrl(...)).of(
    Case(Success($()), getArticles()),
    Case(Failure($()), emptyList())
)

Match(expression).of(
    Case($(), callThisFunction), // domyślne
    Case($("equals"), callThisFunction), // kiedy równe
    Case(isIn("a", "b"), callThisFunction) // kiedy zawiera się w...
)
```

W  Kotlinie jest to o wiele 

```
when (statusCode) {
    HttpStatus.OK.value() -> "all fine"
    HttpStatus.NOT_FOUND.value() -> "nothing here"
    HttpStatus.I_AM_A_TEAPOT.value() -> "wtf?"
    else -> "DEFAULT"
}

```


## Kilka losowych funkcyjnych snippetów

#### Memoization

Czyli dana jest zapamiętana (cached, memoized). Niewiele jest tutaj do dodania. Oszczędza to zasoby jeśli potrzebujemy.

```java
Function0<UUID> memoizedRandomUUID = Function0.of(UUID::randomUUID).memoized();

memoizedRandomUUID.apply(); // 80cc9c17...
memoizedRandomUUID.apply(); // 80cc9c17...
```

Przykład na [githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/Memoization.java).

#### Lazy

Rozszerzeniem powyższego może być `Lazy`. Daje to nam [lazy initialization](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/ValueExample.java), czyli odroczenie stworzenia obiektu do momentu jego wykorzystania. Inaczej mówiąc jest to taki monadyczny kontener, który reprezentuje `lazy evaluated value`. Wartość jest zapamiętana (cached, memoized) i zwracana bez potrzeby ponownego wykonywania obliczeń. Oszczędza to pamięć jeśli potrzebujemy.

```java
// Lazy 
val result = Lazy.of(UUID.randomUUID())
        .map(Object::toString)
        .map(String::toUpperCase);

result.get() // 52EA7812...
result.get() // 52EA7812...
```

W Kotlinie wygląda to podobnie tyle, że w Arrow podobna struktura nazywa się Eval oraz sam Kotlin posida `by lazy` do takich rzeczy.

```
val result = Eval.now(UUID.randomUUID())
        .value.toString().toUpperCase()
```

#### HashMap

W standardowej Javie nie mamy inicjalizacji HashMapy, także vavr daje nam to oraz całkiem fajne API do tworzenia płynnych wywołań.

```java
val things = HashMap.of(
    "qwe", "cAt",
    "a", "WHAs",
    "rty", "DOg"
).bimap(
    String::toUpperCase,
    String::toLowerCase
);

things.get("QWE") // Option("cat")
```

## W czym pisać? Jak żyć? Scala, Kotlin, Java? 

Niestety nie miałem zbyt dużo okazji pisać kodu w Scali. Niemniej Scala wydaje się takim czołgiem, który jest jednocześnie samochodem sportowym. Wielki, potężny, szybki. Ma wszystko, ale jakbyś chciał wjechać tym do centrum handlowego to jest problem. Chodzi o to, że krzywa uczenia się co do Scali jest większa, aniżeli w Javie, czy Kotlinie. Posiada wiele fajnych tricków, ale wraz z tym przychodzi złożoność. To z kolei powoduje trudność ze zrozumieniem kodu. Jak powiedział Russel Winder podczas jednego z wystąpień na [devoxx](https://youtu.be/cFL_DDXBkJQ) "I quite like Scala, but I ignore 40% of it.".

No to mamy Kotlina jest on takim fajnym, nowym, mającym akurat momentum ekskluzywnym i przytulnym samochodem rodzinnym. Ma wszystkie najfajniejsze dodatki zaciągnięte od przeróżnych języków. Ponadto w pakiecie posiada nitro w postaci Coroutines, które znacząco ułatwia asynchroniczny kod oraz daje inne podejście do samego działania wątków softwarowych. Czym się różni taki od hardwarowego? Pisałem o tym w moim pierwszym wpisie jaki znajdziesz [tutaj](http://www.braintelligence.pl/jak-dziala-komputer-jak-dzialaja-poszczegolne-elementy-komputera). Tak też Kotlin wygląda elegancko, a do tego nie wytwarza spalin, co tworzy mniej boilerkodu. Ponadto jeśli znasz Kotlina to znasz też Swifta (jako bonus). 

Podsumowyjąc Kotlin jest w moich oczach takim equilibrium pomiędzy złożonością Scali, a nie tak bardzo ekspresywaną Javą. Ucząc się na błędach innych jest tu wiele przydatnych jak i kontrowersyjnych ficzerów jak chociażby obecność checked exceptions. Jest to rzecz, która sprzyja funkcyjnemu podejściu. Kolejną ciekawą rzeczą są finalne klasy co jest bardzo dobrą praktyką prosto z [Effective Java](https://www.ceneo.pl/62258323#cid=27301&crid=226914&pid=16886). Tworzy to jednak pewien problem ze Springiem, który można obejść pluginem `allopen`. zasadniczym pytaniem jest, czy tak się powinno robić? A co Ty o tym myślisz? :) 

Podsumowując podsumowanie Kotlin to język tworzony przez JetBrains, które to tworzy swoje nowe zabawki właśnie w tym języku jak i przepisuje już istniejące Javowe usługi na Kotlina. Ponadto poparcie ze strony Google powoduje to, że prawdopodobnie w niedalekiej przyszłości zobaczymy coraz więcej Kotlina również na backendzie.

Przechodząc na koniec do Javy to jest to taki samochód w sędziwym wieku. Gdzieniegdzie już jest pordzewiały (np. java.utils.date), ale wciąż jest utrzymywany w dobrym stanie. Musisz wiedzieć jak go używać oraz które części nie są już tak nowe i jakie były zastąpione przez nowe. Tak też kolejne biblioteki robią go ładniejszym, ale istnieją pewne ograniczenia co do tego gdzie można zajść. Jest to w końcu język, który ma swoje lata, a do tego ma w zamyśle wsteczną kompatybilność. Jest to pewnie rzeczy, która zrobiła Javę tak popularną. Z drugiej ogranicza rozwój do przodu, nie można mieć wszystkiego co nie?  

**Tak czy inaczej jeśli potrafimy coś zrobić w Javie to potrafimy to samo w Javascriptcie, Kotlinie, czy Scali. W każdym z tych języków znajdziemy filter, map, reduce, które pozwoli nam zrobić sporą część obliczeń.**

## Podsumowanie, dodatki, przemyślenia, co dalej?

* [Code-Katas](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/tree/master/katas/src) - porównujące te same kawałki kodu w Javie oraz Kotlinie wraz z testami w Spocku.
* [Code-Snippets](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/tree/master/jvm-languages-snippets/src) - wszystko co we wpisie oraz dodatkowe przykłady jakie nie były użyte we wpisie.

Jeśli podobnie jak mnie interesuje Cię Kotlin i chcesz zobaczyć większy [backendowy przykład](https://github.com/braintelligencePL/project-manager-kotlin) to znajdziesz tutaj aplikację do zarządzania projektami (coś jak Trello). Przeszła ona transformację z layered architecture na hexagonal architecture, czyli porty i adaptery oraz parę innych fajnych rzeczy DDD, BDD, TDD. Jeśli masz jakieś uwagi to PR mile widziany. A [tutaj](http://www.braintelligence.pl/prawie-trywialna-aplikacja-do-zarzadzania-projektami/) opis projektu. Trochę tak porzuciłem go na rzecz kolejnego, ale postaram się zrobić jakiś follow-up co tam się zadziało. 

Tak też postanowiłem stworzyć kolejny projekt i zrobić jakże innowacyjny projekt sklepu w architekturze mikroserwisów oraz hexagonal architecture [online-store](https://github.com/braintelligencePL/online-store-microservices-kotlin-angular7/tree/master/online-store-backend). Zacząłem od prostych testów na architekturę w ArchUnit  **"LINK DO GITHUBA"**. PLus jest już lista produktów oraz powstaje lista kategorii. Kolejne wpisy mam nadzieję, że będą właśnie w tym temacie, czyli będzie o DDD, TDD, BDD oraz hexagonal architecture. Potem dojdzie CQRS oraz Event Sourcing. Wszystko ze Spockiem oraz Kotlinem. Jeszcze jedna rzecz na jaką patrzę przychylnym okiem to Vert.x co oznacza częściowe odejście od springa. Choć nie wiem, czy jest sens używać Vert.x mając Kotlina, który ma Ktora oraz inne fajne asynchroniczne biblioteki. Mam nadzieję, że zobaczymy wkrótce co tam powstanie. 🛠
