---
layout:    post
title:     "Czy wiesz czym różnią się json i jsonb w PostgreSQL?"
date:      2021-12-07 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    kkur
image:     /assets/img/posts/2021-11-23-json-vs-jsonb-postgresql/json.jpg
tags:
- PostgreSQL
---

# Podstawowe różnice

Podstawową różnicą pomiędzy json a jsonb jest sposób ich przechowywania. Typ json jest przechowywany jako tekst, natomiast typ jsonb w postaci binarnej. Typ, na jaki się zdecydujemy, json czy jsonb, ma wpływ na kilka czynników:

* zapis danych w postaci jsonb trwa dłużej,
* operacje wykonywane na typie jsonb trwają krócej, gdyż nie trzeba ich dodatkowo parsować.

Ze sposobu przechowywania wynikają kolejne różnice. Zobaczmy poniższy przykład:

```sql

SELECT '{"c":0, "a":2,"a":1}'::json, '{"c":0, "a":2,"a":1}'::jsonb;
```

``` 
          json          |        jsonb
------------------------+---------------------
 {"c":0,   "a":2,"a":1} | {"a": 1, "c": 0}
```
* Json zachowuje formatowanie - dlatego w przykładzie widać spacje przed kluczem a, natomiast jsonb nie zachowuje formatowania - usuwa whitespace'y.
* Json pozwala dodawać powielone klucze (w przykładzie widać, że klucz "a" występuje 2 razy), natomiast jsonb zachowuje tylko ostatnią wartość.
* Json zachowuje kolejność kluczy, natomiast jsonb przechowuje posortowane alfabetycznie klucze.
* Jsonb przechowuje obiekty w postaci binarnej, natomiast json przechowuje dane jako tekst.
* Jsonb pozwala zakładać indexy na kluczach.

# Operatory wspierane tylko przez jsonb
W celu zobrazowania dodatkowych operatorów dla typu jsonb, zacznijmy od utworzenia prostej tabeli, którą wykorzystamy w przykładach

```sql
CREATE TABLE orders (
    id serial NOT NULL PRIMARY KEY,
    data jsonb NOT NULL
);
```

oraz zainicjujmy ją prostymi danymi w formacie json.

```sql

INSERT INTO orders (data) VALUES ('{ "customer": "Anna Kowalczyk", "items": {"product": "Pieluchy","qty": 24} }'),
    ('{ "customer": "Zofia Wiśniewska", "items": {"product": "Zabawka samochód","qty": 1} }'),
    ('{ "customer": "Wojciech Nowak", "items": {"product": "Klocki LEGO","qty": "1"}, "regular_customer": true}'),
    ('{ "customer": "Jan Kowalski", "items": {"product": "Piwo","qty": 6}}');
```
Operator `@>` pozwala na sprawdzenie, czy json zawiera na tym poziomie pole wraz z podaną wartością.

```sql

SELECT (data -> 'items') @> '{"qty": 6}' from orders;
  
contains
----------
f
f
f
```

Operator `?` pozwala na sprawdzenie, czy json posiada określone pole. Przydatne, jeśli jsony nie trzymają się restrykcyjnie określonego schematu i obiekty mogą posiadać różne zestawy pól.
```sql
SELECT data ? 'regular_customer' from orders;
  
field_exists
----------
f
f
t
f
```

Poza tym typ jsonb wspiera kilka operatorów, które pozwalają na skuteczną modyfikację jsonów trzymanych w bazie.
* `||` - Pozwala złączyć ze sobą dwa obiekty typu jsonb w jeden nowy obiekt typu jsonb, przykładowo dodać nowe wartości do istniejącej tablicy.
* `- ` - Pozwala na usunięcie pary klucz-wartość lub też określonego elementu z tablicy, przykładowo '["a", "b"]'::jsonb - 1. Zwróci to tablicę zawierającą wyłącznie element "a".
* `#-` - Pozwala na usunięcie pola lub elementu znajdującego się pod określoną ścieżką.

# Kiedy stosować typ json, a kiedy jsonb?
Jeżeli potrzebujemy jedynie zapisywać i odczytywać dane w formacie json i dalsze operacje na tych danych nie będą konieczne, to możemy zastosować typ json.

Kiedy jednak wykonujemy wiele operacji na jsonie albo potrzebujemy indexu na kluczu, wtedy lepszym wyborem będzie zastosowanie typu jsonb.

W dokumentacji PostgreSQL znajdziemy rekomendację używania typu jsonb. Pamiętajmy jednak o sytuacjach, w których typ json może się sprawdzić lepiej. Dobrym przykładem są systemy legacy, w których polegamy na kolejności zapisu danych.

Przeczytaj więcej tutaj:
* [https://www.postgresql.org/docs/9.5/datatype-json.html](https://www.postgresql.org/docs/9.5/datatype-json.html)
* [https://www.compose.com/articles/faster-operations-with-the-jsonb-data-type-in-postgresql/](https://www.compose.com/articles/faster-operations-with-the-jsonb-data-type-in-postgresql/)
