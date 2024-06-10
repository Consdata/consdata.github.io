---
layout:    post
title:     "Czy wiesz, czym są sekwencje i jak ich (nie) używać?"
date:      2023-08-25T12:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bmitan
image: /assets/img/posts/2023-08-25-czy-wiesz-czym-sa-sekwencje-i-jak-ich-uzywac/thumbnail.webp
tags:
- sekwencje
- bazy danych
---

W sql możemy utworzyć kolumnę tak, żeby jej wartość była automatycznie inkrementowana (dekrementowana), co jest przydatne zwłaszcza w przypadku klucza głównego. W pewnych sytuacjach możemy jednak zdecydować, żeby zamiast tego skorzystać z sekwencji.

W sql można utworzyć sekwencję, która będzie generatorem kolejnych wartości numerycznych zgodnie ze swoją specyfikacją. Można określić m.in. wartość minimalną i maksymalną lub ich brak, wartość początkową, o ile zwiększać (lub zmniejszać) kolejne wartości, typ, cykliczność lub jej brak oraz to, czy korzystać z cache'a i jakiej wielkości. Te i inne parametry są często opcjonalne, bo mają swoje domyślne wartości i to jedna z pułapek, które opiszę.

## Różnice
Najważniejsze różnice między kolumną Identity a sekwencją:

- sekwencja nie jest powiązana z tabelą - można jej potencjalnie używać do generowania wartości dla kilku tabel lub nawet niezależnie od jakiejkolwiek tabeli,
- w przypadku sekwencji można wygenerować wartość lub nawet cały zakres bez dodawania wierszy do tabeli - używając `NEXT VALUE FOR`,
- w przypadku sekwencji to my musimy kontrolować zgodność typów i zarządzać ich użyciem w aplikacji,
- czasami w jednej tabeli nie można mieć dwóch kolumn Identity, ale można skorzystać z dwóch sekwencji - trudno jednak poruszać ten temat w oderwaniu od technologii i tak np. w PostgreSQL mamy dostępny typ serial - czyli starą implementację automatycznie generowanych unikalnych wartości, który jednak nie jest częścią standardu sql - i w przypadku serial nie ma ograniczenia na liczbę kolumn serial w jednej tabeli).

O czym należy więc pamiętać, korzystając z sekwencji?

## Typ sekwencji powinien być tożsamy z typem kolumny - miej kontrolę nad możliwymi różnicami

### Przykład 1
```sql
create sequence my_seq start with 101;
```
Sekwencja my_seq będzie miała typ BIGINT w PostgreSQL, ale INTEGER w db2 - bo takie są domyślne wartości, a nie zdefiniowaliśmy AS data-type.

Jeśli mamy kolumnę typu BIGINT, to prawdopodobnie zakładamy, że może osiągnąć duże wartości. Jeśli dla takiej kolumny użyjemy sekwencji typu INTEGER, otrzymamy błąd, gdy sekwencja dobije do maksymalnej wartości dla INTEGERa.

### Przykład 2
```sql
create sequence TASK_SEQ
 as BIGINT
 minvalue 1
 increment by 1
 no maxvalue
 cycle;
 
create table TASK (
   ID integer not null primary key,
   text VARCHAR(254) not null
);
```

Wydawałoby się, że w drugą stronę nie ma większego problemu. Jeśli sekwencja ma typ BIGINT, a kolumna INTEGER i sekwencja nie jest używana dla żadnej innej tabeli, to widocznie oceniliśmy, tworząc tabelę, że nigdy nie dojdziemy do tak dużych wartości, żeby mieć problem. Nie zawsze...

Zakładając, że w tabeli TASK jest bardzo dużo zadań, których szybko się pozbywamy, uznaliśmy, że najlepsze będzie użycie cyklu - kiedy sekwencja dobije do maksymalnej wartości, generuje minimalną wartość (i odwrotnie w przypadku sekwencji malejącej). Nie musimy się wtedy martwić ograniczeniami maksymalnej wartości użytego typu numerycznego.

Niestety nasza sekwencja przekroczy maksymalną wartość INTEGERa i nie zresetuje się jeszcze, bo jest typu BIGINT. Jednak insert wiersza z taką wartością nie będzie dozwolony.

## Pamiętaj o cache'owaniu

### Przykład 3
```sql
create sequence ORDER_SEQ
    minvalue 1
    increment by 1
    no maxvalue
    cache 1000;
```
Warto pamiętać o zdefiniowaniu cache'a, jeśli to możliwe, a zależy nam na wydajności zapytań. Wówczas naraz zostanie zaalokowanych w pamięci więcej wartości i przy odpowiednio dużym cache'u osiągniemy wydajność insertów z zastosowaniem sekwencji zbliżoną do insertów z zastosowaniem kolumny identity. W takiej sytuacji możemy "zgubić" niektóre wcześniej scache'owane wartości w przypadku awarii i mogą się zdarzyć przerwy w wartościach kolejnych wierszy.