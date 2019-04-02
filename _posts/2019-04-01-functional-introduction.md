---
layout:    post
title:     "Wejście do świata funkcyjnego."
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

W naszym programistycznym świecie stare prawdy często wracają do łask mimo swoich lat. Choćby algorytmy machine learningowe oraz modele statystyczne, które to były głównie na uczelniach i w bardzo wąskiej grupie biznesów teraz zyskują na popularności. Dzieje się to za sprawą tego, że próg wejścia zmniejsza się z każdą nową biblioteką, która ułatwia kolejną rzecz. Można operować na surowych algorytmach machine learningowych, ale jako programiści zapewne sięgniemy po coś pokroju PyTorcha, albo Kerasa, który to pozwoli nam szybciej wejść w świata Deep Learningu (w przypadku tych bibliotek). Przy pomocy narzędzi będziemy w stanie szybciej stworzyć prototyp i przetestować nasz pomysł.

Programowanie funkcyjne nie jest inne. Pozwala nam pisać kod, który jest czystszy, bezpieczniejszy, a przedewszystkim łatwo testowalny - czego chcieć więcej? Oddzielamy kod jaki jest zależy od innych usług (zewnętrznego świata). Takim sposobem nie potrzebujemy armii Mocków jako zaślepek oraz mamy potencjalnie mniej możliwych błędów na produkcji. Oczywiście nie usuwa to wszystkich rodzajów błędów, ale zdecydowanie czyni kod bardziej bezpiecznym. A to w jaki sposób to robi omówimy sobie za chwilę.

W Javie mamy różne funkcyjne bibliteki umożliwiające tworzenie bardziej funkcyjnego kodu. Można użyć Vavra, albo JOOλ. W Kotlinie mamy Arrow choć sam język jest tutaj z natury funkcyjny. Vavr oraz Arrow jest po prostu implementacja rzeczy naturalnie występujących w chociażby Scali.

**Będziemy używać tych rzeczy:**

```
// Kotlin
implementation 'org.jetbrains.kotlin:kotlin-stdlib-jdk8'
implementation 'org.jetbrains.kotlin:kotlin-reflect'
implementation 'io.arrow-kt:arrow-core:0.8.2' 

// Java
implementation 'io.vavr:vavr:0.10.0' // Wszystkie przykłady z Javy wykorzystują Vavra!
implementation 'org.projectlombok:lombok:1.18.6'
implementation 'org.apache.commons:commons-lang3:3.7'
```

**Oraz omówimy te rzeczy:**

* Parę słów o programowaniu imparatywnym, proceduralnym, obiektowym oraz funkcyjnym.
* Funkcyjne, czyli: `pure functions` + `immutability` = referential transparency 🕵
* First-class citizens, Higher-order functions w Kotlinie, Javie oraz JSie.
* Co znać w dzisiajszej Javie? Plus porównanie do Kotlina.
* Monads, Memoization, Values oraz inne funkcyjne struktury.
* Do tego spora garść funkcyjnych przykładów porównujących Kotlina z Javą. Każdy znajdzie coś dla siebie.

[Kody z wpisu znajdziesz tutaj (w formie JUnitowych testów).](https://github.com/braintelligencePL/snippets-of-jvm-languages)

## Ale zacznijmy od początku... 🛤 
Funkcjnie, czyli mamy... funkcje. Mają one jakieś wejście/wyjście. Jednym z głównych konceptów jest tutaj modułowość. Możemy rozbić nasz algorytm na mniejsze pod-funkcje. Jak wiadomo nasze umysły mają tylko ograniczoną ilość RAMu do rozwiązywania codziennych problemów, dlatego wymyślamy koncepty, paradygmaty, standardy, aby uprościć to wszystko. Małe moduły mogą być kodzone szybko i być łatwo testowane. Do tego jest możliwe ich re-używanie. Mamy tutaj kilka najważniejszych zasad dobrego kodu spakowane do jednego worka. Jest to jeden z powodów dlaczego programowanie zorientowane na funkcje staje się poopularne. 

## Funkcje naturalnym wrogiem obiektów? 💣
Jak to zwykle bywa czasami jest hype na nowy język, framework, metodykę, czy jak w tym przypadku funkcyjny paradygmat. Zazwyczaj stoją ku temu powody. Najczęsciej jest to rozwiązanie jakiegoś problemu, który niektórym z nas akurat przeszkadzał. Niemniej ważne, że przy takich sprawach wprowadzamy rozwiązanie do problemu, a nie problem do rozwiązania. Używanie FP wcale nie znaczy, że OOP jest już passé. Wręcz przeciwnie oba paradygmaty doskonale ze sobą współpracują. Dobra... Może nie do końca współpracują, ale bardziej zastępują lub uzpełniają niektóre techniki zawierające się w innych paradygmatach.

## Paradygmat proceduralny, imparatywny 📉
Jest to po prostu lista instrukcji, która prowadzi Cię do celu. Dokładne kroki prowadzące do rozwiązania. Niemniej algorytm podczas wykonywanie zmienia swój stan, a to jest rzecz jakiej nie pożądamy w dzisiejszych wielowątkowych czasach. Prowadzi to do wielu nieporządanych efektów. Najłatwiej jest zrozumieć na przykładzie, także napiszmy trochę pseudo-kodu.   

IF `A == 0` RETURN `B` ELSE `B++ AND A--`

Niby nic strasznego, ale widzimy tutaj czarno na białym mutowalne zmienne. Zmieniamy, niszczymy stan obiektów jakimi operujemy. Możesz spytać... Dlaczego jest to złe? Powiedzmy, że pomiędzy `B++` oraz `A--` wchodzi nowe wymaganie biznesowe. W tym momencie jesteśmy w kropce, bo zmiana ta wpływa na wynik działania całego naszego algorytmu. Oczywiście nie chcemy tego. 

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

### Na pohybel mutantom! Czyli immutability jest ważne?

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
map.containsKey(date);  // false, ale chwila przecież zrobiłem zmienną jako niezmienną

date // 1970... chyba jednak nie będzie kawy :(  
```

**Disclaimer:** Powyższy kod jest w Javie. Ostatnio odkryłem, że lombok posiada `val`, czyli `final` plus typ obiektu jest zgadywany przez kompilator, czyli to samo co w Kotlinie oraz Scali. Całkiem fajne. Sam kod jest sporo czytelniejszy, a do tego wciąż równie bezpieczny.

Przechodząc do konkretów. Oczywiście nikt już nie używa starego mutowalnego `java.util.Date`, ale pokazuje to, że immutability rozwiązuje problemy zanim się pojawią. Kosztem niezmienności obiektów jest oczywiście pożeranie większych ilości pamięci, ale w obecnych czasach nie jest to zbyt wielkim problemem. Inna rzecz, że raczej nie zobserwujemy znacząco większego zużycia pamięci przez JVMkę. Bardziej prawdopodobnym scenariuszem to częstsze odśmiecanie przez Garbage Collectora. To z kolei powoduje częstsze `stop-the-world`, czyli moment w jakim pamięć jest odśmiecana i wszelkie wątki, które wykonywały swoje zadania zatrzymują się. To akurat nie jest rzecz jakiej pożądamy, ale nie można mieć wszystkiego.

**Jeśli niebardzo wiesz co to immutability oraz co się stało z date to [przykłady z opisem znajdziesz tu](http://www.braintelligence.pl/tutorial-java-8-up-to-11-most-important-things-to-know-about-modern-java/).**

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

To co widzisz powyżej to higher-order function, które omówimy już za chwilę. Warto też rozkładać kod na mniejsze pod funkcje, możliwe jak najbardziej opisowe. Osoba czytająca ten kod na pewno doceni buga jakiego zostawiłeś, ale jeszcze bardziej doceni zrozumiały kod.

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

W rzeczywistości jesteśmy często zależni od zewnętrznych serwisów i nie da się żyć bez nich. Chodzi tutaj bardziej o to, żeby funkcja była deterministyczna. Abyśmy wiedzieli już na etapie kompilacji czego się spodziewać (nawet jeśli coś pójdzie nie tak). Nie chcemy borykać się z efektami ubocznymi bezpośrednio. Zamiast teog ignorujemy je, albo enkapsulujemy, czyli powrót do podstaw. Chcemy po prostu ukryć pewne rzeczy, które są w danym momencie zbędne, niezwiązane z danych kontekstem w jakim działamy. 

**Jak myślisz, czy poniższa funkcja ma efekty uboczne?**

`sum(1, sum(1, sum(1,2)))` == `sum(1, sum(1, 3))` == `sum(1, 4)`

Funkcja zwraca sumę, także jest raczej znak, że może ona być referencyjnie transparentna. Z drugiej strony jeśli funkcja zwraca `void` to jest całkiem dobry znak, że niekoniecznie jest czysta. Dobrym przykładem jest `List` ze standardowej biblioteki, która udostępnia metody zmieniające stan `add()`, `remove()`. Jest to jeden z powodów dlaczego lepiej używać vavra.

**Dodatkowo takie funkcje można czasami zoptymalizować.**

Powiedzmy, że drugi argument nie jest potrzebny. Jest on zawsze stały w naszej aplikacji. 

Taką funkcję można by zoptymalizować: 

* bo zamiast: `sum(1, sum(1, sum(1,2)))` 
* można to zrobić tak `SOMETHING = 4` >> `sum(1, SOMETHING)`

Co do wyjątków to jest to tylko częściowa prawda. Metoda może oczywiście zgłosić OutOfMemoryException, StackOverflow, czy inne. Niemniej tego typu wyjątki to te, na które nie mamy bezpośredniego wpływu. Są one bardziej sygnałem że mamy większy problem w apce o jaki powinniśmy się zatroszczyć i to jak najszybciej.

Podsumowując nie zawsze da się uciec całkowicie od efektów ubocznych, ale warto postarać się, aby enkapsulować je w taki sposób, aby były jak najmniej dotkliwe. Po to właśnie istnieją monadyczne struktury, które pomagają nam obsługiwać wyjątki `Try`, `Either` oraz takich gdy nie ma wartości `Option`.

## First-class citizens 👨
Czyli traktowanie funkcji jako wartości. Stwórzmy zatem funkcję o wdzięcznej nazwie `adder` w Kotlinie.

```kotlin
fun add(a: Int, b: Int) = (a + b).toDouble()
val adder = ::add

adder(1,1)
```

Jak widać jedna z bardziej przydatnych funkcji jakie tutaj zrobiliśmy :)

```kotlin
// Albo po prostu 
val adder: (Int, Int) -> Double = { a, b -> (a + b).toDouble() }

adder(1,1) // 2.0 
```

[Przykład na Githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/main/kotlin/pl/braintelligence/functional_bricks/FirstClassCitizen.kt)

## Higher-order functions 🌀
Czyli przekazanie funkcji jako paramter do innej funkcji - istna incepcja. 

### Na początek zobaczmy na [prosty przykład w Javie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/main/java/pl/braintelligence/functional_bricks/HigherOrderFunctions.java)

`HigherOrderFunctions.availableCustomers(Customer::isAvailable)`

Metoda: `availableCustomers(Supplier<Boolean> customerAvailability)` 

Przyjmuje suppliera/funkcję jako paramter. Następnie przekazujemy method-reference: `Customer::isAvailable`, czyli po prostu metoda z klasy Customer.

### Trochę bardziej złożony [przykład w Kotlinie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/functional-bricks/src/main/kotlin/pl/braintelligence/kotlin/HigherOrderFunctions.kt)

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

## Struktury funkcyjne w Javie, Kotlinie

Zacznijmy od tych najbardziej przydatnych/popularnych. 

## Obiekty typu: `Value`
Czyli po prostu finale obiekty A.K.A. immutable objects gdzie dostajemy thread-safety za darmo! 

### `Option` - obrona przed nullem!
Jest to praktycznie to samo co Optional. Różnica jest taka, że ma tylko jedną metodę `Option.of()`. 


Optional jest bardziej dwuznaczny. Ma dwie metody `.of()` oraz `.ofNullable()` co nie zawsze jest oczywiste jak użyć. Odnośnie optionali pisałem więcej [w tym wpisie](http://www.braintelligence.pl/tutorial-java-8-up-to-11-most-important-things-to-know-about-modern-java/). Tym samym przejdźmy zwinnie do [przykładu z wykorzystaniem Option](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/value/OptionExamples.java). 🙆‍♂️

#### 1️⃣ Na początek klasycznie dla wielbicieli nulla

Prawdopodobnie najgorszy przypadek. Jedno, że sprawdzanie `!= null` jest katorgą i nieczytelne.

Drugie to zwracanie domyślnego nulla `return null` na końcu prowadzi do wielu problemów (choćby ten, który właśnie robimy).

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

Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/main/java/pl/braintelligence/functional_bricks/WorkingWithOptionalCode.java).

#### 2️⃣ Dobra ktoś powiedział, że Optionale są lepsze od nulla

**No to tylko zrefaktoryzuje kod do Optiona i będzie git.**

Podobnie zły przypadek jak powyżej. Jedyny plus to zwracanie `Optional.empty()`.

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

Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/main/java/pl/braintelligence/functional_bricks/WorkingWithOptionalCode.java)

#### 3️⃣ No to może zrobić ten kod bardziej funkcyjnym?

Zastosowanie `Optional` lub `Option` w tym przykładzie wyglądałoby podobnie. 

Niemniej vavr posiada dużo więcej metod pomocniczych z jakich można wybierać oraz jak było powiedziane poprzednio jest mniej dwuznaczny.

```java
private Option<String> fetchStreetFromDB() {
    return optionUserRepository.findOne("123")
        .flatMap(User::getAddress)
        .map(Address::getStreet)
        .getOrElse(Option.none());
}
```

Nie wiesz jak działa `flatMap`? Zobaczmy na kolejny przykład gdzie spłaszczamy strukturę do tego co chcemy. 

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

Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/value/OptionExamples.java).

#### 4️⃣ Jak zrobić to samo w Kotlinie? 🍒

```kotlin
user?.address?.street
```

Gdy koledzy obok kończą pisać funkcję w Javie Ty właśnie wracasz z kubkiem kawy. ☕

Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/main/kotlin/pl/braintelligence/functional_bricks/WorkingWithOptionalCode.kt).


```
// Można jeszcze dodać elvisa z jakąś domyślną wartością
user?.address?.street ?: "nasty null was found instead of a street :("
```

Każdy obiekt oznaczony `?` jest uznawany za potencjał do zwrócenia nulla - można go wywołać safe-callem. Więcej w [dokumentacji](https://kotlinlang.org/docs/reference/null-safety.html). Dla wielbicieli NPE jest również `user!!`, które wyrzuci najpopularniejszy wyjątek.

Podobno twórcy w początkowej fazie rozwoju chcieli tam wrzucić 10 wykrzykników. Fajnie by to wyglądało: `user!!!!!!!!!!`. Przynajmniej każdy by się dobrze zastanowił przed rzuceniem NPE. Tak czy inaczej tak czy inaczej jeśli używasz Kotlina unikaj `!!` są to po prostu asercje, które nie mogą być zweryfikowane przez kompilator. 😃

### Error handling - catch them all❗ 

**Co najczęściej robimy z wyjątkami w Javie?** Oczywiście wrzucamy do worka z "unchecked-exceptions", czyli Runtime'u tworzymy/zostawiamy problem na później. Z drugiej mamy jeszcze checked-exceptions, które to są sprawdzane podczas compile-time, czyli wtedy jak piszemy nasz kod w IDE. Jest to zasadniczo dobry pomysł, ale nie dogaduje się z lambdami i funkcyjnym światem. Pisząc w Javie często tworzymy wrapper do takich wyjątków. Jako, że funkcyjne podejście zyskuje na popularności to tym bardziej nie będziemy chcieli się bezpośrednio borykać z niewygodnymi wyjątkami. W Kotlinie, Scali, C# wszystkie wyjątki są unchecked, także problem z lambdami nie istnieje. 

**Mamy kilka struktur do wyjątków wprost ze funkcyjnego świata Scali, Haskella:**

* `Try<Value>` - coś może się popsuć i warto na to zareagować lub też nic nie robić.
* `Either<Exception, Value>` - albo wyjątek po lewej, albo prawidłowa wartość po prawej. 
* `Validation<List<Exception>, Value` - akumulacja błędów.

Omówimy sobie `Try` oraz `Either` na przykładach. 

#### Na początek zobaczmy `Try<Value>`

Klasycznie z try/catch. Nie wygląda to zachęcająco tym bardziej jeśli operujemy na streamie.

```java
try {
    User.findUserInfoByAccountNumberFromFile("123");
} catch (IOException e) {
    log.error(e.getMessage());
}
```

W poniższym przykładzie interesuje nas tylko pozytywny wynik: 

```
Try.of(() -> User.findUserInfoByAccountNumber("123"))
    .onSuccess(System.out::println);
```

W kolejnym [przykładzie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/value/TryExample.java) dodatkowo reagujemy na brak pozytywnego wyniku: 

```java
divide(1, 1)
    .onFailure(e -> System.out.println("Sorry, not possible."))
    .onSuccess(System.out::println);

Try<Integer> divide(Integer dividend, Integer divisor) { return Try.of(() -> dividend / divisor); }
```

Można też użyć `fold( {Failure}, {Success} )` (Tym razem przykład w Kotlinie): 

```kotlin
divide(1, 0)
    .fold(
        { print("Sorry, not possible") },
        { print(it) }
)

fun divide(dividend: Int, divisor: Int) = Try { dividend / divisor }
``` 
Lambdy w Kotlinie są przekazywane jako `function literals`, czyli nie są deklarowane jak w Javie tylko są przekazywane jako wyrażenie `{ }`. Zagadka dla ciebie, który `fold` jest z Kotlina, a który z Javy.  

- `fold(Function<? super Throwable, ? extends X> ifFail, Function<? super T, ? extends X> f)`
- `fold(ifFailure: (Throwable) -> B, ifSuccess: (A) -> B)`

Bardziej praktyczny [przykład w Javie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/value/TryExample.java): 

```java
val result = Try.of(() -> new URL("KABOOM-http://braintelligence.pl"))
        .map(URL::getHost)
        .getOrElse(() -> "google.pl");

result // google.pl
```

Oraz [to samo w Kotlinie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/kotlin/pl/braintelligence/functional_kotlin/arrow/TryExample.kt):

```kotlin
val result = Try { URL("BLAAH//hHttp://braintelligence.pl") }
    .map { it.host }
    .getOrElse { "google.pl" }

```

Na koniec minimalnie bardziej złożony [w Javie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/value/TryExample.java).

```java
val result = fetchArticlesFromFacebook()
                .orElse(() -> fetchArticlesFromGoogle())
                .getOrElse(List::empty)
                .filter(name -> !name.getName().contains("123"))
                .map(Article::getName);
```

Oraz dla porównania [w Kotlinie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/kotlin/pl/braintelligence/functional_kotlin/arrow/TryExample.kt)

```kotlin
val result = fetchArticlesFromFacebook()
    .orElse { fetchArticlesFromGoogle() }
    .getOrElse { emptyList() }
    .filterNot { it.name.contains("123") }
    .map { it.name }
```

**Co tu się dzieje?**

1. Pobieramy artykuły od Facebooka. Jeśli Facebook rzuca błędami pobieramy od Google.
2. Jeśli nic nie przyszło zwracamy pustą listę.
3. Odrzucamy artykuły, które nazywają się 123.
4. Zwracamy listę nazw artykułów.

Mimo tego, że mamy tutaj efekty uboczne to wiemy, że funkcja zwróci albo listę artykułów, albo pustą listę. Można się pokusić o stwierdzenie, że funkcja ta jest referencyjnie transparentna mimo, że zależy od zewnętrznych serwisów.

#### Kolejna struktura to `Either<Exception, Value>`

Mamy zasadniczo dwa przypadki, albo danych nie ma `Option`, albo coś poszło nie tak podczas korzystania z danych `Exception`. Wyjawię Ci sekret kilka akapitów temu skorzystaliśmy już z `Either`. Było to na przykładzie folda, które to zwracało `fold( Either.left(), Either.right() )`. Jak widać nie jest to tak straszne na jakie wygląda.

Jednym z problemów wyjątków jest to, że są one wyrzucane i nie mamy do nich bezpośrednio dostępu. Tutaj robimy wrapppera na wyjątek. Taki prosty zabieg pozwala nam powiązać wyjątek bezpośrednio z obiektem gdzie wystąpił. 

Jako, że dobrze rozwiązałeś zagadkę z foldem to w nagrodę przykłady będą w Kotlinie.

1️⃣ Powiedzmy, że chcemy sparsować String do Int. W tym celu tworzymy strasznego Regexa 😱
`fun isNumber(str: String) = str.matches(Regex("-?[0-9]+"))`

2️⃣ No to zróbmy to klasycznie rzucając wyjątek. 

```kotlin
fun classicalParse(str: String): Int = when (isNumber(str)) {
    true -> str.toInt()
    false -> throw NumberFormatException("$str is not a valid integer.")
}
```

Jeśli tak jak ja nie przepadasz za ifami to w Kotlinie dobrą praktyką jest zamienianie ich na strukturę `when(...)`.

Wrcając do konrektów mamy tutaj wyjątek. Jest on rzucany do konsoli, ale nie jest on powiązany z obiektem. Jeśli byśmy chcieli odpowiednio zaaragować na rzucony wyjątek to jest drobny problem. Jest on rzucony i zakończył wykonywanie obecnego wątku w programie. Nie możemy zareagować. 

3️⃣ A co się stanie jeśli zrobimy wrapppera na wyjątek? Do tego powiążemy wyjątek z obiektem z jakim koegzystuje?

```kotlin
fun eitherParse(str: String) = when (isNumber(str)) {
    true -> Either.Right(str.toInt())
    false -> Either.Left(NumberFormatException("$str is not a valid integer."))
}
```

Teraz tak mamy: `eitherParse("123aa")`, które zwraca `Left(Exception)`: 
`Left(a=java.lang.NumberFormatException: 123aa is not a valid integer.)`

Możemy teraz przemapować wynik, w tradycyjnym podejściu nie mieliśmy takiej możliwośći. 

```kotlin
val result = eitherParse("123")
    .mapLeft { it.message }
    .map { it + 3 }
```

Co zwróci nam, albo message `"123a is not a valid integer."`, albo `126`.


### Pattern Matching

Czyli po prostu armia if-else-if-else-if w czystej Javie

```java
private String matchStatusCode(HttpStatus httpStatus) {
    if (httpStatus == HttpStatus.OK) {
        return "all fine";
    } else if (httpStatus == HttpStatus.NOT_FOUND) {
        return "nothing here";
    } else if (httpStatus == HttpStatus.I_AM_A_TEAPOT) {
        return "wtf?";
    }
    return "DEFAULT";
}
```

Ten sam kod w Vavrze. Może to być przydatne kiedy musimy reagować na różne sposoby. 

```java
Match(httpStatus).of(
    Case($(HttpStatus.OK), "all fine"),
    Case($(HttpStatus.NOT_FOUND), "nothing here"),
    Case($(HttpStatus.I_AM_A_TEAPOT), "wtf?"),
    Case($(), "DEFAULT")
);
```

Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/jvm-languages-snippets/src/test/java/pl/braintelligence/functional_java/vavr/matching_pattern/MatchingPatternExamples.java)

Pattern matching daje nam sporo przydatnych rzeczy. Można łączyć inne funkcyjne struktury ze sobą przez co kod może stać się bardziej czytelny. Niemniej łatwo jest tutaj przesadzić przez co kod stanie się nieczytelny. Niestety w Javie jest to dość rozlazłe. 

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

// Tylko, że w pewnym momencie staje się to po prostu nieczytelne.

// 1...
Case($(allOf(isNotNull(),isIn(1,2,3))), "Number found")

// 2...
Case(Person($(), Address($_, $())), (name, number) -> name + ", " + number)
```

W Kotlinie mamy switcha na sterydach, czyli `when`. Posiada on wiele ulepszeń, ale mimo wszystko nie pozwala na taki pattern matching jak jest natywnie dostępny w Scali.

```kotlin
when (statusCode) {
    HttpStatus.OK -> "all fine"
    HttpStatus.NOT_FOUND -> "nothing here"
    HttpStatus.I_AM_A_TEAPOT -> "wtf?"
    else -> "DEFAULT"
}
```
Przykład [na githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/tree/master/jvm-languages-snippets/src/test/kotlin/pl/braintelligence/functional_kotlin/standard/MatchingPattern)

Oczywiście jest tego więcej i warto sobie polecam poczytać dokumentację Arrowa na temat błędów. Jest tam między innymi przykład z akumulacją błędów oraz parę innych fajnych artykułów.  

* [Error Handling - Arrow](https://arrow-kt.io/docs/patterns/error_handling/).

## Kilka losowych funkcyjnych snippetów

#### Memoization

Czyli dana jest zapamiętana (cached, memoized). Oszczędza to zasoby jeśli potrzebujemy.

```java
Function0<UUID> memoizedRandomUUID = Function0.of(UUID::randomUUID).memoized();

memoizedRandomUUID.apply(); // 80cc9c17...
memoizedRandomUUID.apply(); // 80cc9c17...
```

Przykład na [githubie](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/Memoization.java).

#### Lazy

Rozszerzeniem powyższego może być `Lazy`. Daje to nam [lazy initialization](https://github.com/braintelligencePL/snippets-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/ValueExample.java), czyli odroczenie stworzenia obiektu do momentu jego wykorzystania. Inaczej mówiąc jest to taki monadyczny kontener, który reprezentuje `lazy evaluated value`. Wartość jest zapamiętana (cached, memoized) i zwracana bez potrzeby ponownego wykonywania obliczeń. Oszczędza to pamięć jeśli potrzebujemy.

```java
// Lazy 
val result = Lazy.of(UUID.randomUUID())
        .map(Object::toString)
        .map(String::toUpperCase);

result.get() // 52EA7812...
result.get() // 52EA7812...
```

W Kotlinie wygląda to podobnie tyle, że w Arrow podobna struktura nazywa się Eval oraz sam Kotlin posida `by lazy` do takich rzeczy.

```kotlin
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

No to mamy Kotlina jest on takim fajnym, nowym, mającym akurat momentum ekskluzywnym i przytulnym samochodem rodzinnym. Ma wszystkie najfajniejsze dodatki zaciągnięte od przeróżnych języków. Ponadto w pakiecie posiada nitro w postaci Coroutines, które znacząco ułatwia asynchroniczny kod oraz daje inne podejście do samego działania wątków. Tak też Kotlin wygląda elegancko, a do tego nie wytwarza spalin, co tworzy mniej boilerkodu. Ponadto jeśli znasz Kotlina to znasz też Swifta (jako bonus). 

Podsumowyjąc Kotlin jest w moich oczach takim equilibrium pomiędzy złożonością Scali, a nie tak bardzo ekspresywaną Javą. Ucząc się na błędach innych jest tu wiele przydatnych jak i kontrowersyjnych ficzerów jak chociażby obecność checked exceptions, których to jednak większość języków nie posiada, a jest to rzecz jaka sprzyja funkcyjnemu podejściu. Kolejną ciekawą funkcją są domyślne finalne klasy co jest bardzo dobrą praktyką prosto z [Effective Java](https://www.ceneo.pl/62258323#cid=27301&crid=226914&pid=16886). Niemniej tworzy to jednak problem ze Springiem. Można to obejść pluginem `allopen`, ale zasadniczym pytaniem jest, czy tak się powinno robić? A co Ty o tym myślisz? :)

Podsumowując podsumowanie. Kotlin to język tworzony przez JetBrains, które to tworzy swoje nowe zabawki właśnie w tym języku jak i przepisuje już istniejące Javowe usługi na Kotlina. Powiedzmy, że chcemy napisać plugin do IntelliJ Idea? W czym to napisać? [Guess what?](http://www.jetbrains.org/intellij/sdk/docs/tutorials/kotlin.html). A może Android? No właśnie. Poparcie ze strony Google powoduje to, że prawdopodobnie w niedalekiej przyszłości zobaczymy coraz więcej Kotlina również na backendzie.

Przechodząc na koniec do Javy to jest to taki samochód w sędziwym wieku. Gdzieniegdzie już jest pordzewiały (np. java.utils.date), ale wciąż jest utrzymywany w dobrym stanie. Musisz wiedzieć jak go używać oraz które części nie są już tak nowe i jakie były zastąpione przez nowe. Tak też kolejne biblioteki robią go ładniejszym, ale istnieją pewne ograniczenia co do tego gdzie można zajść. Jest to w końcu język, który ma swoje lata, a do tego ma w zamyśle wsteczną kompatybilność. Jest to pewnie rzeczy, która zrobiła Javę tak popularną. Z drugiej ogranicza rozwój do przodu, nie można mieć wszystkiego co nie?  

**Tak czy inaczej jeśli potrafimy coś zrobić w Javie to potrafimy to samo w Javascriptcie, Kotlinie, czy Scali. W każdym z tych języków znajdziemy filter, map, reduce, które pozwoli nam zrobić sporą część obliczeń.**

## Podsumowanie, dodatki, przemyślenia, co dalej?

* [Code-Snippets](https://github.com/braintelligencePL/snippets-of-jvm-languages/tree/master/jvm-languages-snippets/src) - wszystko co we wpisie oraz dodatkowe przykłady jakie nie były użyte we wpisie.
* [Code-Katas](https://github.com/braintelligencePL/snippets-of-jvm-languages/tree/master/katas/src) - porównujące te same kawałki kodu w Javie oraz Kotlinie wraz z testami w Spocku.

Jeśli podobnie jak mnie interesuje Cię Kotlin i chcesz zobaczyć większy [backendowy przykład](https://github.com/braintelligencePL/project-manager-kotlin) to znajdziesz tutaj aplikację do zarządzania projektami (coś jak Trello). Przeszła ona transformację z layered architecture na hexagonal architecture, czyli porty i adaptery oraz parę innych fajnych rzeczy DDD, BDD, TDD. Jeśli masz jakieś uwagi to PR mile widziany. A [tutaj opis projektu](http://www.braintelligence.pl/prawie-trywialna-aplikacja-do-zarzadzania-projektami/). Trochę tak porzuciłem go na rzecz kolejnego, ale postaram się zrobić jakiś follow-up co tam się zadziało.

W następnych wpisach skupimy się [na tym projekcie](https://github.com/braintelligencePL/online-store-microservices-kotlin-angular7/tree/master/online-store-backend). Mikroserwisy oraz hexagonal architecture. Do tego testy architektury. Tak! Nie przesłyszałeś się będziemy [testować apkę pod względem architektonicznym w ArchUnit](https://github.com/braintelligencePL/project-manager-kotlin/tree/master/src/test/kotlin/pl/braintelligence/projectmanager/core/team). Jest to po prostu zestaw zasad jakie nakładamy sobie przed stworzeniem projektu, aby pozostał poukładany od początku do końca. Potem dojdzie CQRS oraz Event Sourcing. Wszystko ze Spockiem oraz Kotlinem. Do usłyszenia wkrótce!
