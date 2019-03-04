# Wprowadzenie do świata funkcji [WIP]
![bob](/assets/img/posts/2019-04-01-functional-introduction/1.jpeg)

// todo: wstęp

```
Początkowo chciałem, żebyśmy pobawili się pożyczkowym wzorcem, czyli Loan Pattern (będzie opisany kiedyś w innym wpisie), który to wywodzi się bardziej ze środowiska Scalowego. Niemniej jak to często bywa cały kierunek pisania wpisu poszedł w inną stronę podczas samego pisania. Tak samo jest z programowaniem. 

Co jakiś czas jest przedstawiana jakaś stara prawda, czy też adoptowane jest jakieś nowe narzędzie. Tak też nie jest już nowością, że programowanie funkcyjne zyskało na popularności i ułatwia wiele rzeczy. W Javie mamy różne funkcyjne bibliteki umożliwiające tworzenie bardziej funkcyjnego kodu jak chociażby Vavr, oraz JOOλ. W Kotlinie mamy Arrow choć sam język jest tutaj z natury funkcyjny. W tym wpisie zacznijmy od omówienia funkcjnego podejścia oraz jedenej z podstawowych struktr danych tam istniejących. 
```

### Szable w dłoń i robimy funkcyjnie!
#### Ale zacznijmy od początku... 🛤 
Funkcjnie, czyli mamy... funkcje. Mają one jakieś wejście/wyjście. Kluczowym konceptem jest tutaj modułowość. Możemy rozbić nasz algorytm, czy cokolwiek tam robimy na mniejsze pod-funkcje. Jak wiadomo nasze umysły mają tylko ograniczoną ilość RAMu do rozwiązywania codziennych problemów, dlatego wymyślamy koncepty, paradygmaty, standardy aby uprościć to wszystko. Małe moduły mogą być kodzone szybko i być łatwo testowane. Do tego jest możliwe ich re-używanie. Czyli mamy w sumie kilka najważniejszych zasad dobrego kodu spakowane do jednego worka z tego też powodu programowanie zorientowane na funkcje staje się poopularne. 


### OOP vs FP 🥊
Jak to zwykle bywa czasami jest hype na nowy język, framework, metodykę, czy cokolwiek innego. Zazwyczaj stoją ku temu powody i tymi powodami najczęsciej jest rozwiązanie jakiegoś problemu, który niektórym z nas akurat przeszkadzał. Niemniej ważne, że przy takich sprawach wsprowadzamy rozwiązanie do problemu, a nie problem do rozwiązania. Używanie FP wcale nie znaczy, że OOP jest już passé. Wręcz przeciwnie oba paradygmaty doskonale ze sobą współpracują. Dobra... Może nie do końca współpracują, ale bardziej zastępują lub uzpełniają niektóre techniki zawierające się w innych paradygmatach. 

#### Ważniejsze cechy funkcjonalnego podejścia: 

⚙ Higher-order functions - przekazują funkcję jako paramter do innej funkcji - istna incepcja.

Na przykład funkcja `availableCustomers(Supplier<Boolean> customerAvailability)` przyjmuje funkcję jako parametr `Customer::isAvailable`.

Czego wynikiem jest: `availableCustomers(Customer::isAvailable)`

⚙ First-class citizens - czyli traktowanie funkcji jako wartości.

Dla obrazowania przykładu zróbmy sobie funkcję w Kotlinie o wdzięcznej nazwie `adder`: 

*  `fun add(a: Int, b: Int) = (a + b).toDouble()` - nasza funkcja.
*  `val adder = ::add` - którą przypisujemy do zmiennej.
*  `val adder: (Int, Int) -> Double = { a, b -> (a + b).toDouble() }` - lub to samo w ten sposób.
*  `adder(1,1)` - po czym robimy skomplikowane obliczenia.

⚙ Anonymous classes - `() -> "czyli lambdy"`

### Skutki uboczne programowania imperatywnego 🔰
Impratywnego, czyli takiego z jakim mamy styczność zazwyczaj na początku drogi z programowaniem.

Przykładowo jeśli A == 0 to zwróć B inaczej B++ oraz A--. 

Mamy tutaj mutowalne zmienne, czyli w sumie niszczymy stany obiektów. Jeśli okaże się, że trzeba zmienić wymagania biznesowe to szybko okazuje się, że również zmieniamy wynik działania naszej aplikacji. Programowanie funkcyjne promuje nie-mutowalność obiektów, A.K.A. Immutability. Co jest dobre. Do tego poprzez funkcje ograniczamy interakcje naszego kodu ze światem zewnętrznym. Integracja jest dopiero po skończeniu obliczeń, potem rzucamy wyjątki, zapisujemy do bazy, czy wysyłamy coś po HTTPie. 

### Wracając do wejścia/wyjścia 🚪
Funkcjny kod ma zapewnić jak najmniejszą ilość efektów ubocznych, czyli mamy `in -> out`, zamiast `in -> file -> exception -> poop -> db -> info -> out`. Takie podejście daje nam bardziej determistyczny sposób działania apki. Również testowanie takiego kodu jest łatwiejsze, bo nie potrzebujemy armii Mocków do wyizolowania przypadku testowego.

### Przechodząc z imperatywnego do funkcyjnego
//todo: 


## Czas na trochę mięsa 🍗
Kod będzie w Kotlinie. Myślę, że o wiele lepiej oddaje różne idea programowania funkcyjnego bez zbędnego boilercode'u.

Choćby zapis typu funkcji wygląda następująco `(A) -> B`.

Gdzie w Javie byłoby to `Function<? super T, ? extends R>`.

Jak się zapewne domyślasz powyższy kod to dobrze nam znana metoda ` .map { } `

Kotlin bardzo upraszcza kod. Stworzyłem dla ciebie prostą katę, abyś mógł porównać: [Java](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/main/java/pl/braintelligence/katas/Java_1_SocketsPairs.java) oraz [Kotlin](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/main/kotlin/pl/braintelligence/katas/Kotlin_1_SocketsPairs.kt), a tutaj [Test Jednostkowy](https://github.com/braintelligencePL/snippets-and-katas-of-jvm-languages/blob/master/katas/src/test/groovy/pl/braintelligence/katas/_1_SocketsPairsTest.groovy).

Oczywiście jest to moja implementacja, także jeśli znasz lepszy sposób na zrobienie tego [zadanka](https://www.hackerrank.com/challenges/sock-merchant/problem?h_l=interview&playlist_slugs%5B%5D=interview-preparation-kit&playlist_slugs%5B%5D=warmup) nie krępuj się zrobić PR. 

<br>


#### Nie język czyni programowanie funkcyjnym, a podejście 🖐 [WIP]
Często haskell jest praktycznym przykładem czysto funkcjonalnego języka. Niemniej to nie język czyni programowanie funkcyjnym. Takowy język daje nam tyle, że jest bardziej przyjazny dla tego podejścia. Funkcyjnie można pisać w większości języków.

// todo: anonymous functions, closures, lazy-evaluation 

Rzeczy te pojawiją się często w językach funkcjonalnych i są praktycznie spowiwem tworzącym język funkcjonalym. 


### Przechodząc z imperatywnego do funkcyjnego świata


Przykład zerżnięty od [pysaumont](https://github.com/pysaumont)

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
 

#### Na początek zacznijmy od starego i wciąż dobrego (co warto podkreślić) TryCatcha:
todo:  
#### Czas na mięso 🍗  (Loan Pattern) 
Pożyczkowy wzorzec wywodzi się bardziej ze środowiska Scalowego...

todo:  

#### jOOλ.append(Vavr).build()
todo:  
