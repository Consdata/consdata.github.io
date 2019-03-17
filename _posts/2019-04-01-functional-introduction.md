---
layout:    post
title:     "Wejście do świata funkcji"
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

W naszym programistycznym świecie stare prawdy często wracają do łask mimo swoich lat. Choćby algorytmy machine learningowe oraz modele statystyczne, które to były głównie na uczelniach i w bardzo wąskiej grupie biznesów teraz zyskują na popularności. Dzieje się to za sprawą tego, że próg wejścia zmniejsza się z każdą nową biblioteką, która ułatwia kolejną rzecz. Można operować na surowych algorytmach machine learningowych, ale jako programiści zapewne sięgniemy po coś pokroju PyTorcha, albo Kerasa, który to pozwoli nam szybciej wejść w świata Deep Learningu (w tym przypadku). Przy pomocy narzędzi będziemy w stanie szybciej stworzyć prototyp i przetestować nasz pomysł.

Programowanie funkcyjne nie jest inne. Pozwala nam pisać kod, który jest czystszy, a przedewszystkim łatwo testowalny. Oddzielamy kod, który jest zależny od innych usług. W ten sposób nie potrzebujemy armii Mocków jako zaślepek oraz mamy potencjalnie mniej możliwych błędów na produkcji. Oczywiście nie usuwa to wszystkich rodzajów błędów, ale zdecydowanie czyni kod bardziej bezpiecznym. A to w jaki sposób to robi omówimy sobie za chwilę. 

W Javie mamy różne funkcyjne bibliteki umożliwiające tworzenie bardziej funkcyjnego kodu. Można użyć Vavr, albo JOOλ. W Kotlinie mamy Arrow choć sam język jest tutaj z natury funkcyjny. Wszystkie te rzeczy to po prostu przemapowanie funkcjonalności z Javy, czy też innych funkcyjnych języków. 

W tym wpisie zacznijmy od omówienia funkcjnego podejścia. Następnie omówimy sobie kilka podstawowych struktr danych tam istniejących między innymi `Value` oraz `Tuple`.

**Jako, że funkcyjnie można w każdym języku to opiszemy sobie to podejście na przykładzie Kotlina, Javy oraz JSa!**

## Ale zacznijmy od początku... 🛤 
Funkcjnie, czyli mamy... funkcje. Mają one jakieś wejście/wyjście. Jednym z głównych konceptów jest tutaj modułowość. Możemy rozbić nasz algorytm na mniejsze pod-funkcje. Jak wiadomo nasze umysły mają tylko ograniczoną ilość RAMu do rozwiązywania codziennych problemów, dlatego wymyślamy koncepty, paradygmaty, standardy, aby uprościć to wszystko. Małe moduły mogą być kodzone szybko i być łatwo testowane. Do tego jest możliwe ich re-używanie. Mamy tutaj kilka najważniejszych zasad dobrego kodu spakowane do jednego worka. Jest to jeden z powodów dlaczego programowanie zorientowane na funkcje staje się poopularne. 

## Obiektowe vs Funkcyjne 🥊
Jak to zwykle bywa czasami jest hype na nowy język, framework, metodykę, czy jak w tym przypadku funkcyjny paradygmat. Zazwyczaj stoją ku temu powody i tymi powodami najczęsciej jest rozwiązanie jakiegoś problemu, który niektórym z nas akurat przeszkadzał. Niemniej ważne, że przy takich sprawach wsprowadzamy rozwiązanie do problemu, a nie problem do rozwiązania. Używanie FP wcale nie znaczy, że OOP jest już passé. Wręcz przeciwnie oba paradygmaty doskonale ze sobą współpracują. Dobra... Może nie do końca współpracują, ale bardziej zastępują lub uzpełniają niektóre techniki zawierające się w innych paradygmatach. 

## Imparatywne (proceduralne) programowanie 📉
Jest to po prostu lista instrukcji, która prowadzi Cię do celu. Dokładne kroki prowadzące do rozwiązania. Niemniej algorytm podczas wykonywanie zmienia swój stan, a to jest rzecz jakiej nie pożądamy w dzisiejszych czasach. Prowadzi to do wielu nieporządanych efektów tymbardziej w środowisku wielowątkowym. Najłatwiej jest zrozumieć na przykładzie, także napiszmy trochę pseudo-kodu.   

IF `A == 0` RETURN `B` ELSE `B++ AND A--`

Widzimy tutaj czarno na białym mutowalne zmienne. Zmieniamy, niszczymy stan obiektów jakimi operujemy. Możesz spytać... Dlaczego jest to złe? Powiedzmy, że pomiędzy `B++` oraz `A--` wchodzi nowe wymaganie biznesowe. W tym momencie jesteśmy w kropce, bo zmiana ta wpływa na wynik działania całego naszego algorytmu. Oczywiście nie chcemy tego.

**W imparatywnym programowaniu skupiamy się na tym co chcemy zrobić. Wykonujemy konkretne czynności.**


### Tak też idziemy w stronę programowania funkcyjnego 📈
Funkcjny kod ma zapewnić jak najmniejszą ilość efektów ubocznych, czyli mamy `in -> out`. Jedną z podstawowych rzeczy jakie podejście funkcyjne promuje jest `immutability`, czyli rozwiązanie powyższego problemu. W ten sposób nie wpływamy bezpośrednio na stan obiektu, bo jest on niezmienny. Do tego pure functions (`in -> out`) zapewniają bardziej deterministyczny sposób działania aplikacji. Co ważne nie potrzebujemy armii Mocków do wyizolowania przypadku testowego.

#### Prosty przykład `in -> out` w Kotlinie `.map { }`

```
data class Order(val name: String, val amount: Int)

val orders = listOf( Order("product1", 10), Order("product2", 30) )

orders.map { it.amount + 1 }
```

Gdzie inkrementujemy ilość zamówień o 1.

**W funkcyjnym programowaniu skupiamy się na tym co chcemy osiągnąć, a nie tym co chcemy zrobić. Drobna, a jednak znaczna różnica.**

#### Dlaczego immutability jest ważne?
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
map.containsKey(date);  // false

date // 1970... chyba jednak nie będzie kawy :(  
```

**Disclaimer:** Powyższy kod jest w Javie. Ostatnio odkryłem, że lombok posiada `val`, czyli `final`. Typ obiektu jest zgadywany przez kompilator, czyli to samo co w Kotlinie oraz Scali. Całkiem fajne. Sam kod jest sporo czytelniejszy, a do tego bezpieczniejszy.

Przechodząc do konkretów. Oczywiście nikt już nie używa starego mutowalnego `java.util.Date`, ale pokazuje to, że nie-mutowalność rozwiązuje problemy zanim się pojawią. Kosztem jest oczywiście pożeranie większych ilości pamięci. Hmm, może nie do końca duże ilości pamięci są pożerane, ale zdecydowanie triggeruje to częstsze uruchomianie się odśmiecania w Garbage Collectorze. A to z kolei powoduje częstsze `stop-the-world`, czyli moment, w którym pamięć jest odśmiecana i wszelkie wątki, które wykonywały swoje zadania zatrzymują się. 

### Odetchnijmy na chwilę od Javy i przejdźmy do JSa 
#### Tu też można funkcyjnie! W sumie nawet bardziej aniżeli w Javie
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

### Jeśli jesteśmy już przy JSie
#### To zobaczmy jeszcze na świętą trójcę, czyli `filter`, `map`, `reduce`

```
let films = [
{ title: "Rick & Morty", type: "X", totalTimeWatched: 333 },
{ title: "Game of Thrones", type: "X", totalTimeWatched: 888 },
{ title: "unknown", type: "unknown", totalTimeWatched: 1111111 }
]

const byType = (film) => film.type == "X";
const getTotalTimeWatched = (film) => film.totalTimeWatched;
const sumOfTotalTimeWatched = (acc, amount) => acc + amount;

function getTotalTimeSpent(films) {
    return films
            .filter(byType)
            .map(getTotalTimeWatched)
            .reduce(sumOfTotalTimeWatched, 0);
}

getTotalTimeSpent(films); // 1221
```

To co widzisz powyżej to higher-order function, które omówimy już za chwilę.

### `pure functions` + `immutability` = referential transparency 🕵
**Referential transparency** - jest to po prostu brak efektów ubocznych.

Czyli `in -> out` zamiast `in -> file -> exception -> db -> info -> out` 

Brak zależności od zewnętrznych serwisów, plików, czy nastroju programisty. Funkcja zawsze zwraca to co powinna. Jest deterministyczna. Nie zgłosi wyjątku. Nie przestanie działać z powodu braku danych z API, bazy, czy jakiegoś urządzenia IoT zbierającego dane.

#### Pure, czyli wynik jest zawsze ten sam dla wejściowych parametrów `in`

```java
// Nie jest to referencyjnie przezroczyste
Math.random(); // Wynik jest różny za każdym razem


// Jest referencyjnie przezroczyste
// Funkcja jest deterministyczna 
Math.max(1, 2); // Wynik zawsze jest taki sam
``` 

W całych tych skutkach ubocznych nie chodzi o świat bez nich, ale o to, aby nie musieć się z nimi borykać bezpośrednio. Ponownie wracamy do podstaw, czyli enkapsulacji. Chcemy po prostu ukryć pewne rzeczy, które są w danym momencie zbędne, niezwiązane z danych kontekstem w jakim działamy.

W poniższym [przykładzie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/ValueExample.java) interesuje nas tylko pozytywny wynik. Ewentualnie jeśli coś pójdzie nie to można wyświetlić komunikat.

```java
divide(1, 1)
    .onFailure(e -> System.out.println("Sorry, not possible."))
    .onSuccess(System.out::println);

Try<Integer> divide(Integer dividend, Integer divisor) {
    return Try.of(() -> dividend / divisor);
}
```

Wystarczy tu po prostu przekazać <b>odpowiedni</b> argument.

`sum(1, sum(1, sum(1,2)))` == `sum(1, sum(1, 3))` == `sum(1, 4)` 

Teraz powiedzmy, że drugi argument nie jest potrzebny. Jest on zawsze stały w naszej aplikacji.

Taką funkcję można by zoptymalizować `SOMETHING = 4` >> `sum(1, SOMETHING)`

Co do wyjątków to jest to tylko częściowa prawda. Metoda może oczywiście zgłosić OutOfMemoryException, albo inne typu StackOverflow. Niemniej tego typu wyjątki to te, na które nie mamy bezpośredniego wpływu. Są one bardziej sygnałem że mamy większy problem w apce o jaki powinniśmy się zatroszczyć i to jak najszybciej.

### First-class citizens 👨
Czyli traktowanie funkcji jako wartości. Stwórzmy zatem funkcję o wdzięcznej nazwie `adder`.

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

### Higher-order functions 💎
Czyli przekazanie funkcji jako paramter do innej funkcji - istna incepcja. 

#### Na początek zobaczmy na [prosty przykład w Javie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/HigherOrderFunctions.java)

Metoda: `availableCustomers(Supplier<Boolean> customerAvailability)` 

Przyjmuje supplier jako paramter. Możemy tutaj przekazać method-reference: `Customer::isAvailable` 

`HigherOrderFunctions.availableCustomers(Customer::isAvailable)`

Jeśli nie wiesz, czym są **@FunctionalInterface** z Javy 8 to zerknij [tutaj](http://www.braintelligence.pl/tutorial-java-8-up-to-11-most-important-things-to-know-about-modern-java/) gdzie opisałem większość nowości w Javie od 8 do 11.

#### Bardziej funkcyjny [przykład w Kotlinie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/kotlin/HigherOrderFunctions.kt)

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

#### A na koniec równie funkcyjny JSowy przykład
```javascript
const evenNumber = elem => elem % 2 == 0;
const listOfNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
listOfNumbers.filter(evenNumber); // [0, 2, 4, 6, 8, 10]
```
Gdzie przekazaliśmy funkcję `evenNumber` jako argument do funkcji `filter`.

Wcześniej w tym wpisie już poznałeś bardziej skomplikowany przykład `filter`, `map`, `reduce`.

## Co daje vavr w Javie?  

1. immutable collections - standardowa Java ma remove, at, clear, wszystkie te metody łamią enkapsulację twojej klasy.

Czego się wystrzegać? Jeśli widzisz, że metoda zwraca `void` to wiedz, że coś się dzieje. Dlaczego?

Jeśli metoda nie zwraca niczego to znak, że jest to jakiś efekt uboczny. To o czym mówiliśmy kilka akapitów temu.


### Tuple, Value

`Function2<Integer, Integer, Integer> sum = (a, b) -> a + b`

`CheckedFunction2<Integer, Interger, Integer> sum = (a, b) -> a + b`

### Memoization - [java example](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/Memoization.java)

```
Function0<UUID> memoizedRandomUUID = Function0.of(UUID::randomUUID).memoized();

memoizedRandomUUID.apply(); // 80cc9c17...
memoizedRandomUUID.apply(); // 80cc9c17...
```

### Tuples [(przykład na githubie)](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/TupleExample.java)

```java
var tuple = Tuple.of("Something ", 1)
        .map(
            s -> s.concat("else"),
            i -> i + 1
        );

tuple // (Something else, 2)
```

### Kilka różnych struktur typu `Value` [(przykład na githubie)](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/ValueExample.java)

```java

// Option
val result1 = Option.of(null)
        .map(Object::toString)
        .map(String::toLowerCase)
        .getOrElse(() -> "option default");

System.out.println(result1); // option default


// Try
val result2 = Try.of(() -> new URL("BLAAH//hHttp://braintelligence.pl"))
        .map(URL::getHost)
        .getOrElse(() -> "google.pl");

System.out.println(result2); // google.pl


// Lazy (is memoized and its referentially transparent)
val result3 = Lazy.of(UUID.randomUUID())
        .map(Object::toString)
        .map(String::toUpperCase);

System.out.println(result3.get());

```

### Functional sugar 🍩 🍰 🍨

#### Klasycznie dla wielbicieli nulli
Prawdopodobnie najgorszy przypadek. Przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

```java
private String badCascadingPileOfCrapAndNull_WorstOfTheWorstest() {
    User user = userRepository.findOne("123");

    if (user != null) {
        Address address = user.getAddress();
        if (address != null) {
            String street = address.getStreet();
            if(street != null) {
                return street; // ufff.. to jest prawdziwa praca.
            }
        }
    }

    return null;
    }
```

2. Używanie `isPresent()` jest równie złe jak używanie `get()` gdzie w sumie wrzucasz zmienną do wrappera, a potem i tak pobierasz NullPointerException. Bez sensu. Przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

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

### Bardziej funkcyjnie

Podobnie można zrobić z `Optional`, ale lepiej jest użyć `Option` od vavra, bo ma po prostu więcej opcji z jakich można wybierać. Do tego jest łatwiejszy w korzystaniu, bo ma tylko jedną metodę `Option.of()` co wprowadza mniej dwuznaczności gdzie Optional nie jest już tak oczywisty. 

Przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/pl/braintelligence/java/WorkingWithOptionalCode.java).

```java
private Option<String> muchBetterWithOption() {
    return optionUserRepository.findOne("123")
        .flatMap(User::getAddress)
        .map(Address::getStreet)
        .getOrElse(Option.none());
}
```

### A jak to wygląda w Kotlinie? 

Przykład [na githubie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/kotlin/pl/braintelligence/kotlin/WorkingWithOptionalCode.kt).

```kotlin
user?.address?.street ?: "null was found instead of a street :("
```
Gdy koledzy obok kończą pisać funkcję w Javie Ty właśnie wracasz z kubkiem kawy. ☕


## A co jest ważne...
Wszystkie te zasady tyczą się większości popularnych języków, także jeśli potrafimy coś zrobić w Javie to potrafimy to samo w Javascriptcie, Kotlinie, czy Scali. W każdym z tych języków znajdziemy filter, map, reduce, które pozwoli nam zrobić większą część obliczeń. 

## Dodatki
Jeśli chcesz zobaczyć małe porównanie Kotlina oraz Javy na prostych zadankach możesz zerknąć [tutaj](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/tree/master/katas/src). 

Kiedyś jak w końcu nauczę się Scali to również dojdą tam katy z tego języka. :)

[Tutaj](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/BetterJavaWithVavr.java) kilka praktycznych przykładów wykorzystania Vavra.   

Jeśli interesuje Cię Kotlin i chcesz zobaczyć trochę większy [przykład](https://github.com/braintelligencePL/project-manager-kotlin) to znajdziesz w linku aplikację, która przeszła transformację z layered architecture na hexagonal architecture, czyli porty i adaptery oraz parę innych fajnych rzeczy.

Jako, że tamten projekt nie dał mi takiej swobody jaką bym chciał to postanowiłem zrobić jakże innowacyjny projekt [sklepu internetowego](https://github.com/braintelligencePL/online-store-microservices-kotlin-angular7/tree/master/online-store-backend). Jak na razie jest lista produktów oraz kategorii. Całkiem prawdopodobne, że kolejne wpisy będą właśnie w tym temacie. Czyli będzie o DDD, TDD, BDD oraz hexagonal architecture. Potem dojdzie CQRS oraz event sourcing.
 
## Dlaczego Kotlin?

Jeśliby wziąć pod uwagę trzy języki pod względem funkcyjności to byłyby one w takiej kolejności: 

**Java -> Kotlin -> Scala**

Z czego biblioteka vavr implementuje właśnie rzeczy ze Scali.

1. Łatwiejsze, czytelniejsze tworzenie obiektów immutable

* `val name: String = 'qwerty'` zamiast `final String name = 'qwerty'` ewentualnie lombokowego `val name = 'qwerty'`, czasami jednak warto dodać zwracany typ, a tego Java nam nie umożliwia. 

2. 

 
## --------------------------------
## Notatki
## --------------------------------

## Ważniejsze cechy funkcjonalnego podejścia:


⚙ Anonymous classes - `() -> "czyli lambdy"`

## Czas na trochę mięsa 🍗
Kod będzie w Kotlinie. Myślę, że o wiele lepiej oddaje różne idea programowania funkcyjnego bez zbędnego boilercode'u.

Choćby zapis typu funkcji wygląda następująco `(A) -> B`.

Gdzie w Javie byłoby to `Function <? super T, ? extends R>`.

Jak się zapewne domyślasz powyższy kod to dobrze nam znana metoda ` .map { } `

Kotlin bardzo upraszcza kod. Stworzyłem dla ciebie prostą katę, abyś mógł porównać: [Java](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/main/java/pl/braintelligence/katas/Java_1_SocketsPairs.java) oraz [Kotlin](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/main/kotlin/pl/braintelligence/katas/Kotlin_1_SocketsPairs.kt), a tutaj [Test Jednostkowy](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/test/groovy/pl/braintelligence/katas/_1_SocketsPairsTest.groovy).

Oczywiście jest to moja implementacja, także jeśli znasz lepszy sposób na zrobienie tego [zadanka](https://www.hackerrank.com/challenges/sock-merchant/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=warmup) nie krępuj się zrobić PR. 

<br>


#### Nie język czyni programowanie funkcyjnym, a podejście 🖐 [WIP]
Często haskell jest praktycznym przykładem czysto funkcjonalnego języka. Niemniej to nie język czyni programowanie funkcyjnym. Takowy język daje nam tyle, że jest bardziej przyjazny dla tego podejścia. Funkcyjnie można pisać w większości języków.

// todo: anonymous functions, closures, lazy-evaluation 

Rzeczy te pojawiją się często w językach funkcjonalnych i są praktycznie spowiwem tworzącym język funkcjonalym. 


### Z imperatywnego do funkcyjnego

Przykład wzięty od [pysaumont](https://github.com/pysaumont)

```kotlin
fun buy(creditCard: CreditCard): Donut {
 val donut = Donut()
 creditCard.charge(Donut.price)
 return donut
} 
``` 

Mamy tutaj żywy przykład efektu ubocznego o jakim mówiliśmy wcześniej. Na pierwszy rzut oka ten kawałek kodu nie wygląda podejrzanie zwykły blokujący się kod, ale potwór kryje się w implementacji. Obciążenie karty zapewne ma jakiś rodzaj uwierzytelniania, po czym pobierany jest stan rachunku, a na końcu rejestrowana jest transakcja. A na końcu mamy pączka, bo kto nie lubi pączków. :)   

// todo: Taki kod jest bardzo trudno przetestować..

// todo: W Javie można skorzystać z Tuple(T, R) od Vavr

// todo: W Kotlinie `Purchase(donut, payment)` , `Pair(T, R)`


## Ważniejsze cechy funkcjonalnego podejścia: v2
⚙ Pure Functions - 
⚙ Immutability - 
⚙ Referential transparency - 
⚙ First-class citizens - 
⚙ Higher-order functions - 
<br>

## Święta trójca - filter, map, reduce
![filter-map-reduce](/assets/img/posts/2019-04-01-functional-introduction/2.png)

#### Na początek zacznijmy od starego i wciąż dobrego (co warto podkreślić) TryCatcha:
todo:  
#### Czas na mięso 🍗  (Loan Pattern) 
Pożyczkowy wzorzec wywodzi się bardziej ze środowiska Scalowego...

todo:  

#### jOOλ.append(Vavr).build()
todo:  
