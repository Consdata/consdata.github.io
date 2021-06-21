---
layout:    post
title:     "Volatile nie należy się bać"
date:      2021-05-31 10:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    mmergo
image:     /assets/img/posts/2021-05-31-slowo-kluczowe-volatile/volatile.webp
tags:
- java
---

Słowo kluczowe **volatile** wydaje się jednym z najrzadziej stosowanych, ale też najbardziej tajemniczych i najsłabiej poznanych słów kluczowych w Javie. Do czego więc służy, i czy jest się czego bać?

Na początek należy zauważyć, że **volatile** ma zastosowanie jedynie w przypadku zmiennych. Sam typ zmiennej, oraz to, czy jest to typ prosty czy złożony, nie ma znaczenia. Przykładowe użycie słowa **volatile** wygląda następująco:

```java
private volatile int myInt = 0;
```
Volatile ma zastosowanie w przypadku aplikacji wielowątkowych, i związane jest z optymalizacjami, które wykonuje zarówno procesor, jak i JVM podczas zmiany wartości zmiennych, z których korzysta więcej niż jeden wątek. Brzmi skomplikowanie? Wyobraźmy sobie sytuację, w której wątki **A** oraz **B** mają dostęp do zmiennej **foo**. W przypadku kiedy wątek **A** zmieni wartości tej zmiennej, zmiana ta niekoniecznie będzie od razu spropagowana do wątku **B**! W skrajnym przypadku może nie zostać spropagowana nigdy. Oznacza to, że dwa wątki, odczytujące pozornie tą samą zmienną, mogą widzieć dwie rozbieżne wartości. Tyle teorii, kod jest ciekawszy.

Żeby lepiej zobrazować problem, pochylmy się nad poniższym kawałkiem kodu:

```java
public class VolatileExample {
 
    private static int counter = 0;
 
    public static void main(String[] args) {
        ThreadSupplier producer = () -> {
            while (true) {
                System.out.println(format("Ustawiam licznik na %s", ++counter));
                Thread.sleep(1000);
            }
        };
 
        ThreadSupplier consumer = () -> {
            int localCounter = counter;
            while (true) {
                if (localCounter != counter) {
                    System.out.println(format("Licznik zmienił wartość na: %s", localCounter = counter));
                }
            }
        };
 
        CompletableFuture.allOf(supplyAsync(producer), supplyAsync(consumer)).join();
    }
}
```

Co robi ta klasa? Uruchamia dwa wątki: odpowiednio wątek producenta, podbijający raz na sekundę licznik, oraz wątek konsumenta, który w pętli sprawdza czy licznik zmienił wartość, a jeśli tak - wypisuje jego wartość.

Jakiego wyjścia na pierwszy rzut oka można by się spodziewać po odpaleniu powyższego kodu? Prawdopodobnie wielu z nas spodziewać się będzie efektu mniej więcej jak poniżej - i wydaje się to zupełnie rozsądne:

```

Ustawiam licznik na 1
Licznik zmienił wartość na: 1
Ustawiam licznik na 2
Licznik zmienił wartość na: 2
Ustawiam licznik na 3
Licznik zmienił wartość na: 3
Ustawiam licznik na 4
Licznik zmienił wartość na: 4
Ustawiam licznik na 5
Licznik zmienił wartość na: 5
```

Tymczasem jednak, po uruchomieniu tego kodu najprawdopodobniej zobaczycie takie wyjście:

```
Ustawiam licznik na 1
Ustawiam licznik na 2
Ustawiam licznik na 3
Ustawiam licznik na 4
Ustawiam licznik na 5
...
Ustawiam licznik na 1000
```

Co się dzieje z wątkiem konsumenta, a w szczególności, dlaczego nie podchwytuje zmian licznika? Okazuje się, że oba te wątki - producent oraz konsument - posiadają własną kopię zmiennej counter. Kiedy jeden z wątków zmienia jej wartość, to JVM oraz procesor decydują, kiedy przepropagować jej wartość do pozostałych wątków. W imię optymalizacji taka propagacja może nie nastąpić nigdy. Jak więc naprawić nasz program? Bardzo prosto, wystarczy do definicji zmiennej counter dodać słowo kluczowe volatile, które poinformuje wszystkie zainteresowane mechanizmy, że z tej zmiennej korzysta więcej niż jeden wątek, i wszelkie zmiany jej wartości należy natychmiast propagować do tych wątków:

```java
private static volatile int counter = 0;
```

Po takiej zmianie i ponownym uruchomieniu programu ujrzymy wyjście, którego się oryginalnie spodziewaliśmy.

Jak natomiast ma się to do aplikacji, które rozwijamy na co dzień? Dobrym przykładem mogą być np. zmienne trzymane w sesji użytkownika, czytane i modyfikowane przez potencjalnie wiele wątków - w skrajnym przypadku może dojść do sytuacji, w której różne wątki korzystające z takiego sesyjnego obiektu będą widziały rozbieżne jego wartości, co z kolei może doprowadzić do najróżniejszych anomalii oraz błędów (szczególnie, jeśli jeden z tych wątków wykonuje przetwarzanie obciążające procesor - z punktu widzenia procesora będzie to kandydat do wykonania optymalizacji polegającej na niepropagowaniu do tego wątku nowej wartości takiej zmiennej).

Podsumowując, warto pamiętać o volatile rozwijając wielowątkowe aplikacje, w których różne wątki korzystają ze wspólnych zmiennych.



PS. uważny czytelnik zauważy, że w gołej Javie nie istnieje taki interfejs funkcyjny jak ThreadSupplier - utworzyłem go na potrzeby czytelności przykładu, aby nie zaciemniać kodu obsługą wyjątku z Thread.sleep. Pełny kod źródłowy tego przykładu znajduje się poniżej — polecam lekturę wszystkim, którzy chcieliby się dowiedzieć jak poradzić sobie z wyjątkami rzucanymi w lambdach bez użycia zewnętrznych bibliotek.

```java
package com.consdata.webdev;

import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

import static java.lang.String.format;
import static java.util.concurrent.CompletableFuture.supplyAsync;

public class VolatileExample {

    private static volatile int counter = 0;

    public static void main(String[] args) {
        ThreadSupplier producer = () -> {
            while (true) {
                System.out.println(format("Ustawiam licznik na %s", ++counter));
                Thread.sleep(1000);
            }
        };

        ThreadSupplier consumer = () -> {
            int localCounter = counter;
            while (true) {
                if (localCounter != counter) {
                    System.out.println(format("Licznik zmienił wartość na: %s", localCounter = counter));
                }
            }
        };

        CompletableFuture.allOf(supplyAsync(producer), supplyAsync(consumer)).join();
    }
}

/**
 * Gdyby ktoś się zastanawiał dlaczego interfejs funkcyjny z dwoma metodami w ogóle działa:
 * W przypadku interfejsów funkcyjnych pod uwagę brane są jedynie nieabstrakcyjne metody interfejsu.
 * Metoda interfejsu posiadająca domyślną implementację NIE JEST traktowana jako abstrakcyjna.
 *
 * Na podobnej zasadzie działa np. Consumer
 * https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/function/Consumer.html
 */
@FunctionalInterface
interface ThreadSupplier<T> extends Supplier<T> {
    default T get() {
        try {
            return getThrows();
        } catch (InterruptedException e) {
            // W tym miejscu należy zrobić coś sensownego z wyjątkiem - minimum zalogować.
            throw new RuntimeException(e);
        }
    }

    T getThrows() throws InterruptedException;
}
```
