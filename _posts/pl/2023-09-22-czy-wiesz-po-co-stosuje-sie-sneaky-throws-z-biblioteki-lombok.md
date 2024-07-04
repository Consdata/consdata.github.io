---
layout:    post
title:     "Czy wiesz, po co stosuje się @SneakyThrows z biblioteki Lombok?"
date:      2023-09-22T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: kdudek
image: /assets/img/posts/2023-09-22-czy-wiesz-po-co-stosuje-sie-sneaky-throws-z-biblioteki-lombok/thumbnail.webp
tags:
- java
- lombok
- sneakythrows
---

Wyjątki w Javie dzielą się na `checked exceptions` oraz `unchecked exceptions`. Unchecked exception reprezentuje błąd w logice programu, który może wystąpić w dowolnym miejscu - przykładowo odwołanie się do nieistniejącego elementu tablicy spowoduje rzucenie wyjątku `ArrayIndexOutOfBoundsException`. Kompilator nie jest w stanie przewidzieć błędów logicznych, które pojawiają się dopiero w czasie wykonywania programu, dlatego nie może sprawdzać tego typu problemów w czasie kompilacji, co sprawia, że wyjątki te nie muszą być obsłużone przez programistę.

Przykład `unchecked exception` - dzielenie przez zero wyrzuci wyjątek `ArithmeticException`:
```java
private static void divideByZero() {
    int numerator = 1;
    int denominator = 0;
    int result = numerator / denominator;
}
```

`Checked exception` to wyjątek reprezentujący przewidywalną, błędną sytuację, która może wystąpić nawet w przypadku poprawnej logiki programu - przykładowo próba otwarcia pliku, który nie istnieje, spowoduje rzucenie wyjątku `FileNotFoundException`. Wyjątki tego rodzaju są weryfikowane w czasie kompilacji, dlatego Java zmusza nas do ich obsługi - albo poprzez słowo kluczowe throws, albo poprzez złapanie wyjątku w bloku `try-catch`:
- Przykład obsługi przez słowo kluczowe `throws` - przekazanie wyjątku w dół stosu wywołań:
  ```java
  private static void openFile() throws FileNotFoundException {
      File file = new File("Nieistniejacy_plik.txt");
      FileInputStream stream = new FileInputStream(file);
  }
  ```
- Przykład obsługi przez blok `try-catch` - złapanie wyjątku:
  ```java
  private static void openFile() {
      File file = new File("Nieistniejacy_plik.txt");
      try {
          FileInputStream stream = new FileInputStream(file);
      } catch (FileNotFoundException e) {
          e.printStackTrace();
      }
  }
  ```

## Koncepcja sneaky throws

`Sneaky throws` to koncepcja pozwalająca na rzucenie dowolnego `checked exception` bez jego jawnego definiowania w sygnaturze metody. Pozwala ona na ominięcie słowa kluczowego throws oraz imitowanie zachowania `unchecked exception` i jest możliwa, ponieważ obsługa wyjątków `checked exception` jest wymuszana tylko przez kompilator Javy.  W kodzie bajtowym każdy wyjątek może zostać rzucony z dowolnego miejsca i jest traktowany przez JVM tak samo - zostaje on propagowany w dół stosu wywołań. Od Javy 8 każde użycie throws `T`, gdzie `T` jest typem generycznym rozszerzajacym `Throwable`, oznacza, że metoda może rzucić `unchecked exception`. Dzięki temu możemy stworzyć metodę pomocniczą, która będzie rzucała wyjątek typu `checked`, jednak kompilator nie będzie wymagał jego przechwycenia.
Metoda pomocnicza realizująca koncepcję `sneaky throws`:
```java
private static <T extends Throwable> void sneakyThrow(Throwable t) throws T {
    throw (T) t;
}
```

Metodę tę możemy następnie dowolnie wykorzystać w naszym kodzie:
```java
private File getFile(String fileName) {
   return null;
}
 
private void deleteFile(String fileName) {
   File file = getFile(fileName);
   if (file == null) {
      sneakyThrow(new FileNotFoundException("Nie znaleziono pliku"));
   }
   file.delete();
}
 
public void tryToDeleteNotExistingFile() {
   try {
      deleteFile("Nieistniejacy_plik.txt");
   } catch (Exception exception) {
      exception.printStackTrace();
   }
}
```
Warto zauważyć, że w takiej sytuacji w metodzie `tryToDeleteNotExistingFile()` nie możemy złapać już wyjątku `FileNotFoundException`, ponieważ nie jest on zadeklarowany - możemy jedynie ratować się złapaniem bardziej ogólnego `Exception`.

## Lombok - adnotacja `@SneakyThrows`
Biblioteka `Lombok` udostępnia adnotację `@SneakyThrows`, która wykorzystuje powyższą sztuczkę i dzięki oszukaniu kompilatora pozwala rzucać `checked exception` bez deklarowania tego w sygnaturze metody.
Przykład - użycie adnotacji `@SneakyThrows`:
```java
private File getFile(String fileName) {
   return null;
}
 
@SneakyThrows(FileNotFoundException.class)
private void deleteFile(String fileName) {
   File file = getFile(fileName);
   if (file == null) {
      throw new FileNotFoundException("Nie znaleziono pliku");
   }
   file.delete();
}
 
public void tryToDeleteNotExistingFile() {
   try {
      deleteFile("Nieistniejacy_plik.txt");
   } catch (Exception exception) {
      exception.printStackTrace();
   }
}
```
Do adnotacji `@SneakyThrows` można przekazać dowolną liczbę wyjątków. Jeśli nie podamy żadnego, to adnotacja ta uwzględni dowolny wyjątek. Należy pamiętać także o tym, że `@SneakyThrows` nie dziedziczy.

## Kiedy używać?

Dokumentacja @SneakyThrows wspomina o dwóch częstych przypadkach użycia:
- niepotrzebnie rygorystyczne interfejsy takie jak `Runnable`,
- "niemożliwe" wyjątki, które nie powinny nigdy być rzucone np. ze względu na specyfikację JVM.

Inną sytuacją, w której można zastanowić się nad użyciem `@SneakyThrows` są wyrażenia lambda - użycie tej adnotacji pozwoli zwiększyć czytelność, ponieważ nie będziemy musieli przejmować się łapaniem wyjątków w blok `try-catch`. Przykład z użyciem `@SneakyThrows`:
```java
@SneakyThrows
private static Instant sneakyParseStringDate(String date) {
   return new SimpleDateFormat("yyyy-MM-dd").parse(date).toInstant();
}
 
public List<Instant> getInstants() {
   return List.of("2022-05-18").stream().map(SneakyThrowsExample::sneakyParseStringDate)
         .collect(Collectors.toList());
}
```

Ten sam przykład bez użycia @SneakyThrows:
```java
private static Instant nonSneakyParseStringDate(String date) throws ParseException {
   return new SimpleDateFormat("yyyy-MM-dd").parse(date).toInstant();
}
 
public List<Instant> getInstants() {
   return List.of("2022-05-18").stream().map(date -> {
      try {
         return nonSneakyParseStringDate(date);
      } catch (ParseException e) {
         throw new RuntimeException(e);
      }
   }).collect(Collectors.toList());
}
```

## Dokumentacja
- [https://projectlombok.org/features/SneakyThrows](https://projectlombok.org/features/SneakyThrows)