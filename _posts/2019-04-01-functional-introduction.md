---
layout:    post
title:     "Wprowadzenie do świata funkcji"
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

W naszym programistycznym świecie stare prawdy często wracają do łask mimo swoich lat. Choćby algorytmy machine learningowe oraz modele statystyczne, które to były głównie na uczelniach i w bardzo wąskiej grupie biznesów teraz zyskują na popularności. Dzieje się to za sprawą tego, że próg wejścia zmniejsza się z każdą nową biblioteką, która ułatwia kolejną rzecz. Można operować na surowych algorytmach machine learningowych, ale jako programiści zapewne sięgniemy po coś pokroju PyTorcha, albo Kerasa, który to pozwoli nam szybciej wejść w świata Deep Learningu. Przy pomocy narzędzi będziemy w stanie szybciej stworzyć prototyp i przetestować nasz pomysł.

Programowanie funkcyjne nie inne. Pozwala nam pisać kod, który jest czystszy, a przedewszystkim łatwo testowalny. Oddzielamy kod, który jest zależny od innych usług. W ten sposób nie potrzebujemy armii Mocków jako zaślepek oraz mamy potencjalnie mniej możliwych błędów na produkcji. Oczywiście nie usuwa to wszystkich rodzajów błędów, ale zdecydowanie czyni kod bardziej bezpiecznym. A to w jaki sposób to robi omówimy sobie za chwilę. 

W Javie mamy różne funkcyjne bibliteki umożliwiające tworzenie bardziej funkcyjnego kodu. Można użyć Vavr, albo JOOλ. W Kotlinie mamy Arrow choć sam język jest tutaj z natury funkcyjny. W tym wpisie zacznijmy od omówienia funkcjnego podejścia oraz jedenej z podstawowych struktr danych tam istniejących `Tuple`. 

**Jako, że funkcyjnie można w każdym języku to opiszemy sobie to podejście na przykładzie Kotlina, Javy oraz JSa!**

## Ale zacznijmy od początku... 🛤 
Funkcjnie, czyli mamy... funkcje. Mają one jakieś wejście/wyjście. Jednym z głównych konceptów jest tutaj modułowość. Możemy rozbić nasz algorytm na mniejsze pod-funkcje. Jak wiadomo nasze umysły mają tylko ograniczoną ilość RAMu do rozwiązywania codziennych problemów, dlatego wymyślamy koncepty, paradygmaty, standardy, aby uprościć to wszystko. Małe moduły mogą być kodzone szybko i być łatwo testowane. Do tego jest możliwe ich re-używanie. Mamy tutaj kilka najważniejszych zasad dobrego kodu spakowane do jednego worka. Jest to jeden z powodów dlaczego programowanie zorientowane na funkcje staje się poopularne. 

## Obiektowe vs Funkcyjne 🥊
Jak to zwykle bywa czasami jest hype na nowy język, framework, metodykę, czy cokolwiek innego. Zazwyczaj stoją ku temu powody i tymi powodami najczęsciej jest rozwiązanie jakiegoś problemu, który niektórym z nas akurat przeszkadzał. Niemniej ważne, że przy takich sprawach wsprowadzamy rozwiązanie do problemu, a nie problem do rozwiązania. Używanie FP wcale nie znaczy, że OOP jest już passé. Wręcz przeciwnie oba paradygmaty doskonale ze sobą współpracują. Dobra... Może nie do końca współpracują, ale bardziej zastępują lub uzpełniają niektóre techniki zawierające się w innych paradygmatach. 

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

**W funkcyjnym programowaniu skupiamy się na tym co chcemy osiągnąć.**

### Co działa tak samo w innych językach
#### Aby pokazać, że funkcyjnie można w każdym języku przejdzmy do JSa
Można tu pobawić się function composition, albo inaczej function chaining. Co oznacza nie mniej nie więcej, że wynik poprzedniej funkcji jest przekazywany do kolejnej. Ten przykład pokazuje koncept nie-mutowalności (immutability) obiektu gdzie jest on kopiowany zamiast zmieniania jego stanu.

```javascript
function clearSomeImpurities(text) {
  return text.toLowerCase()   
    .trim()
    .split(" ")
    .join(" & ");
}

clearSomeImpurities("RiCk MoRtY") // "rick & morty"
```

### Jak już jesteśmy przy JSie to musimy zobaczyć świętą trójcę
#### czyli `filter`, `map`, `reduce`

```
let films = [
{ title: "Rick & Morty", type: "X", totalTimeWatched: 333 },
{ title: "Game of Thrones", type: "X", totalTimeWatched: 888 },
{ title: "unknown", type: "unknown", totalTimeWatched: 1111111 }
]

const byType = (film) => film.type == "X";
const getTotalTimeWatched = (film) => film.totalTimeWatched;
const totalWatchedTimeSum = (acc, amount) => acc + amount;

function getTotalTimeSpent(films) {
    return films
            .filter(byType)
            .map(getTotalTimeWatched)
            .reduce(totalWatchedTimeSum, 0);
}

getTotalTimeSpent(films); // 1221
```


### `pure functions` + `immutability` = referential transparency 🕵
Jest to po prostu brak efektów ubocznych, czyli `in -> out` zamiast `in -> file -> exception -> db -> info -> out`. Brak zależności od zewnętrznych serwisów, plików, czy nastroju programisty. Funkcja zawsze zwraca to co powinna. Jest deterministyczna. Nie zgłosi wyjątku. Nie przestanie działać z powodu braku danych z API, bazy, czy jakiegoś urządzenia IoT zbierającego dane. 

Wystarczy tu po prostu przekazać <b>odpowiedni</b> argument.

`sum(1, sum(1, sum(1,2)))` == `sum(1, sum(1, 3))` == `sum(1, 4)` 

Powiedzmy, że drugi argument nie jest potrzebny. 

Jest on zawsze stały w naszej aplikacji. 

Taką funkcję można by zoptymalizować `SOMETHING = 4`.

`sum(1, SOMETHING)`

Co do wyjątków to jest to tylko częściowa prawda. Metoda może oczywiście zgłosić OutOfMemoryException, albo StackOverflow. Niemniej tego typu wyjątki to te, na które nie mamy bezpośredniego wpływu. Są one bardziej sygnałem że mamy większy problem w apce o jaki powinniśmy się zatroszczyć i to jak najszybciej.

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
// Pomijając użyteczność tej funkcji :)  
```

### Higher-order functions 💎
Czyli przekazanie funkcji jako paramter do innej funkcji - istna incepcja. 

#### Na początek zobaczmy na [prosty przykład w Javie](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/functional-bricks/src/main/java/HigherOrderFunctions.java)

Metoda: `availableCustomers(Supplier<Boolean> customerAvailability)` 

Przyjmuje supplier jako paramter.

Możemy tutaj przekazać method-reference: `Customer::isAvailable` 

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
    println("sumResult $sumResult, mulResult $mulResult")
}
```

#### A na koniec równie funkcyjny JSowy przykład
```javascript
const evenNumber = elem => elem % 2 == 0;
const listOfNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
listOfNumbers.filter(evenNumber); // [0, 2, 4, 6, 8, 10]
```
Gdzie przekazaliśmy funkcję `evenNumber` jako argument do funkcji `filter`.

#### No to jeszcze 


## A co jest ważne...
Wszystkie te zasady tyczą się wszystkich popularnych języków, także jeśli potrafimy coś zrobić w Javie to potrafimy to samo w Javascript, Kotlinie, czy Scali. W każdym z tych języków znajdziemy filter, map, reduce, które pozwoli nam zrobić część obliczeń. 

 
 
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
