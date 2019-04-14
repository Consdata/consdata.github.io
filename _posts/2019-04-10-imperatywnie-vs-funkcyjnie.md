---
layout:    post
title:     "Wstęp do programowania funkcyjnego"
date:      2019-04-10 9:00:00 +0100
published: false
author:    Łukasz Sroczyński
tags:
    - backend
    - kotlin
    
---

Programowanie funkcyjne w ostatnich latach stało się bardzo popularne. Umożliwia nam to pisanie kodu, który jest czystszy, bezpieczniejszy, a przede wszystkim łatwo testowalny. Oczywiście FP ma również wady z czego jedną z nich może być zbyt duże pójście w abstrakcję co powoduje, że kod staje się niezrozumiały. Omówimy sobie w takim razie jakie są różnice pomiędzy imperatywnym podejściem, a tym funkcyjnym. 

## Różnica między kodem imperatywnym, a funkcyjnym?
Imperatywny kod to ten z którym najczęściej spotykamy się na początku naszej przygody z programowaniem. Jest to bowiem najbardziej naturalny sposób w jaki można pisać aplikację. Tworzymy tutaj ciąg instrukcji jaki nasz program wykonuje (step-by-step). Opisujemy dokładne czynności jakie muszą być wykonane podczas działania algorytmu. Podczas tych kroków zmieniamy stan systemu modyfikując go, a wynikiem końcowym jest zwrócona wartość lub też inny efekt.

Cechy imperatywnego kodu: 

* zmieniający się stan podczas każdej iteracji
* kolejność wykonywania jest ważna (step-by-step)
* wywołujemy funkcje, pętle, warunki

Mówiąc o imperatywnym podejściu nie można nie wspomnieć o najbardziej popularnym z paragymatów, czyli obiektówce. Skupiamy się tutaj na hierarchii klas, enkapsulacji oraz wielu, wielu innych elementach przekraczających zakres tego wpisu. Generalnie myślimy w kontekście obiektów. Wbrew pozorom większość popularnych języków obiektowych wspiera/wywodzi się właśnie z imparatywnego/proceduralnego podejścia. Aby przejść z tego paradygmatu na ten bardziej matematyczny/funkcyjny trzeba zmienić myślenie. 

Podchodząc do programowania funkcyjnego nie myślimy już o obiektach. Obiektem uwielbienia stają się tutaj funkcje. Główną różnicą pomiędzy imperatywnym, a funkcyjnym jest to, że w tym pierwszym przypisujemy wartości zmiennym oraz mutujemy je, a w funkcyjnym zwracamy wartość w bezstanowy sposób. Dzięki temu możemy po prostu używać funkcji patrząc na ich `input` oraz `output`.  

Cechy funkcyjnego kodu: 

* stan nie istnieje
* kolejność wykonywania nie jest ważna (często może być asynchroniczna)

Główną różnicą jest tutaj to, że fukcyjne programy są bardziej ekspresyjne. Piszemy mniej kodu robiąc to samo co w imperatywnym. Ponadto dzięki niemutowalności oraz większej kontroli nad efektami ubocznymi nasze aplikacje są bardziej deterministyczne. Dzięki czemu czasami uciekniemy od wielowątkowych problemów jak race-conditions, deadlocks oraz inne. Jak i również nie musimy już przejmować się kolejnością wykonywania działań w naszym kodzie.  
 
### Pokażmy na przykładzie gdzie dodajmy dwie liczby: 
* W podejściu imperatywnym dodajemy liczby i tworzymy wynik. Skupiamy się na tym co chcemy zrobić.
* W podejściu funkcyjnym dodane liczby to jest wynik. (drobna, a jednak znaczna różnica o czym się zaraz przekonamy)

### Imperatywny przykład
Chcemy tylko nieparzyste liczby: 

```kotlin
val numbers = listOf(1, 2, 3, 4, 5)
val odds = ArrayList<Int>()

for (index in 0..numbers.lastIndex) {
    val item = numbers[index]
    if (item % 2 != 0) odds.add(item)
}
```
Powyższy kod jest zbudowany z wyrażeń. Coś bierzemy, coś dodajemy, coś zmieniamy, coś warunkujemy. Mutujemy zmienne przez co kod nie jest bezpieczny. W obecnych funkcyjnych czasach mimo wszystko rzadko spotyka się powyższy kod i dobrze, bo jest on kompletnie nieczytelny. Skupiamy się tutaj na tym co chcemy zrobić. Jest to po prostu seria mutacji oddzielonych od siebie warunkami.

### Funkcyjny przykład
```kotlin
val numbers = listOf(1, 2, 3, 4, 5)
val odds = numbers.filter { it % 2 != 0 }
```
Teraz coś z tym większość z nas ma więcej styczności, czyli bardziej funkcyjny kod. Skupiamy się na tym co chcemy osiągnać.

## Czy da się napisać program bez efektu ubocznego? 
Krótka odpowiedź. Nie da się. Chodzi nam bardziej o to, żeby nie mieć obserwowalnych efektów ubocznych. Co to znaczy? Wyjaśnimy sobie już za chwilkę. Zazwyczaj jak piszemy apkę to mamy widoczny efekt - wynik. Zapisaliśmy coś do bazy danych, wysłaliśmy coś po HTTPie, wrzuciliśmy jakiś event na kolejkę, wygenerowaliśmy raport i tak dalej. Integrujemy się ze światem zewnętrznym. W programowaniu funkcyjnym chodzi o odłożenie efektów ubcznych do czasu  wykonania obliczeń, a nie podczas ich.

```kotlin
fun multiply(val a: Int, val b: Int) = a * b
fun divide(a: Int, b: Int) = a / b
 
multiply(123456789, 123456789) // -1757895751
divive(123456789, 0) // ArithmeticException: / by zero
```
Powyższy program nie jest funkcyjny dlatego, że mogą w nim wystąpić efekty uboczne. Jeśli przekręcimy Inta to dostaniemy ujemną wartość - błędną wartość. W drugim przypadku dostaniemy wyjątek, czyli efekt uboczny czego również się nie spodziwaliśmy. Nasze początkowe założenie, że funkcja pomnoży/podzieli wynik jest błędna. Oczywiście rzadko kiedy sytuacja jest, aż tak trywialna, ale można sobie wyobrazić, że to wszystko jest jakimś zapytaniem do bazy, albo inną operacją. Chodzi o to, aby nasze funkcje były deterministyczne, czyli wynik zawsze jest taki sam dla podanych argumentów. Jeśli są jakieś efekty uboczne to wiemy, jakie i odpowiednio na nie reagujemy. 

```kotlin
fun multiply(a: Int, b: Int) = a * b.toFloat()
fun divide(a: Int, b: Int) = a / b.toFloat()
 
multiply(123456789, 123456789) // 1.52415794E16
divide(123456789, 0) // Infinity

```

W tym momencie dla każdej możliwej wartości będzie ten sam wynik. Również w przypadku poprzedniego wyjątku teraz 
zostanie zwrócony obiekt **Infinity**, na którym możemy działać dalej z naszym kodem. Gdy wiemy czego się spodziewać po funkcji i zawsze zwraca ona prawidłową wartość można nazwać ją czystą. Znaczy to tyle, że takie pure functions nie mają żadnych efektów ubocznych. To co zwraca zależy tylko i wyłącznie od parametrów jakie podaliśmy. Dobrym przykładem są funkcje z klasy Math. Gdzie biorąc `sqrt(2.0)` wiemy, że wynikiem jest zawsze jakiś obiekt typu Double.

## To jak pisać bardziej funkcyjnie?

```kotlin
// Na początek imperatywny przykład
fun buyBook(bookName: String, creditCard: CreditCard): Book {
    val book = Book(name = bookName)
    creditCard.performPayment(book.price) // efekt uboczny 
    return book
}
```

Mamy tutaj funkcję `performPayment`, która mogłaby zwracać Unit, czyli odpowiednik Javowego void. Jest to całkiem dobry znak, że funkcja nie jest czysta. Ma ona efekty uboczne. Moglibyśmy trafić na moment, w którym serwis od jakiego jesteśmy zależy nie odpowiada, albo po prostu jest coś z nim nie tak. W programowaniu funkcyjnym jest wiele struktur, koncepcji, które służą do ukrywania efektów ubocznych takie jak Try, Either, Option, IO oraz dużo więcej. Są to takie monadyczne struktury do tworzenia wrappera do operacji jaką wykonujemy. Oprócz wrappowania mają one zawsze jakiś określony efekt. Choćby efekt braku danych co jest obsługiwane przez Optional w standardowej Javie, albo poprzez Option w vavrze. W Kotlinie to samo mamy out-of-box. Non-Nullability jest wbudowane w język.

W naszym poniższym przykładzie stworzymy sobie coś co nazwiemy `Purchase`. Mogłoby to być zastąpione poprzez Tuple, albo Pair, czyli taki bardziej generyczny kontener na łączenie różnych elementów ze sobą, aby tworzyły inny obiekt. Chodzi o to, aby stworzyć taki byt umożliwiający przekazywanie obiektu całościowo. Wracając jeszcze na chwilkę do powyższego kodu jest on dość trudny do przetestowania. Musielibyśmy sobie zamockować proces weryfikacji w banku, czy karta w ogóle istnieje, czy posiada środki na koncie i tak dalej. Dopiero po tym zwracamy film. Możemy zrobić to trochę inaczej. Co jeśliby przetestować to bez kontaktu z bankiem? Moglibyśmy powiązać płatność z książką.

```kotlin
// Bardziej funkcyjny przykład
fun buyBook(bookName: String, creditCard: CreditCard): Pair<Book, Payment> {
    val book = Book(name = bookName)
    val payment = Payment(creditCard, book.price)
    return Pair(book, payment)
}

data class Purchase(val book: String, val payment: Payment)
data class Payment(val creditCard: CreditCard, val price: BigDecimal)
data class Book(val name: String, val price: BigDecimal)

// Można też użyć Pair od Kotlina oraz Tuple od Javy (Vavr)
```

Zauważ, że teraz nie obchodzi nas jak zaaraguje bank. Czy karta zostanie przyjęta, czy odrzucona - nie jest to istotne w tym kontekście. Można też zmodyfikować ten kod i umożliwić kupno różnych przedmiotów. Po czym agregować płatności i dopiero pod koniec wysłać zapytanie do banku. Przetestowanie powyższego kodu jednostkowo jest mega proste.

```kotlin
@Test 
fun `Should buy book`() {
    // given:
    val creditCard = CreditCard()
    val bookStore = BookStore()

    // when:
    val purchase = bookStore.buyBook("12 rules for life", creditCard)

   // then:
   assertThat(petersonBookPrice) 
      .isEqualTo(purchase.first.price) 
 
   assertThat(creditCard)
       .isEqualTo(purchase.second.creditCard) 
}
```
Przykład zaczerpnięty od [Pierre Yves Saumont - Java programowanie funkcyjne](https://helion.pl/ksiazki/java-programowanie-funkcyjne-pierre-yves-saumont,javapf.htm)


