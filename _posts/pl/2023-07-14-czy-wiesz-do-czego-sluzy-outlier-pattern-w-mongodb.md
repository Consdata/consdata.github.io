---
layout:    post
title:     "Czy wiesz do czego służy Outlier Pattern w MongoDB?"
date:      2023-07-14T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bmitan
image: /assets/img/posts/2023-07-14-czy-wiesz-do-czego-sluzy-outlier-pattern-w-mongodb/outlier.webp
description: Wzorzec ten jest stosowany, kiedy większość danych można i warto zamodelować w jeden sposób, ale dla niewielkiego odsetka dokumentów, które odstają od normy, będzie to nieakceptowalne lub niemożliwe.
tags:
- mongodb
- outlier pattern
---

Wzorzec ten jest stosowany, kiedy większość danych można i warto zamodelować w jeden sposób, ale dla niewielkiego odsetka dokumentów, które odstają od normy, będzie to nieakceptowalne lub niemożliwe.

## Przykład
Przedstawmy wzorzec Outlier na przykładzie. Załóżmy, że mamy kolekcję `books`, w której przechowujemy książki z podstawowymi danymi. Chcemy też łatwo wyciągnąć informację, kto kupił daną książkę - żeby na tej podstawie rekomendować inne książki.

Możemy zdecydować się na zapisywanie identyfikatorów użytkowników w naszym dokumencie książki zamiast osobno. Dla większości książek będzie to najwydajniejsze rozwiązanie.
```json
{
    "_id": 12,
    "title": "MongoDB Patterns",
    ...,
    "customers_purchased": ["user00", "user01", "user02"]
 
}
```
Może się jednak okazać, że dla bestsellerów przekroczymy dopuszczalny maksymalny rozmiar dokumentów - 16 MB. Jeśli zdecydujemy się wyciągnąć te informacje z `books` do osobnej kolekcji, to skończymy z rozwiązaniem działającym dla wszystkich przypadków, ale niewydajnym dla ponad 99% z nich.

Chcąc mieć wydajność pierwszego rozwiązania bez jego ograniczeń, z dodatkową obsługą tylko dla niewielkiej liczby dokumentów, wprowadzamy wzorzec Outlier.

Nadal większość dokumentów będzie przechowywać identyfikatory w polu `customers_purchased` i będą wyglądać dokładnie tak jak pierwszy przykład. Jeśli liczba użytkowników, która kupiła daną książkę, przekroczy określony przez nas limit, np. 1000, kolejnych użytkowników zaczynamy przechowywać osobno, a do tego dokumentu dodamy flagę `has_extras` z wartością `true`.

```json
{
    "_id": 13,
    "title": "Clean code",
    ...,
    "customers_purchased": ["user00", "user05", "user06", ...],
    "has_extras": "true"
}
```
```json
{
  "book_id": 13,
  "customers_purchased": ["user6045", "user3451", "user1242", ...]
}
```

Musimy zadbać o to, żeby dociągnąć potrzebne informacje dla dokumentów z `has_extras`. Warto jednak robić to w jednym miejscu w kodzie, a we wszystkich innych ta flaga i cały design powinny być tak naprawdę transparentne i nie mieć wpływu na resztę kodu aplikacji.

## Zastosowania
Inne zastosowania to relacje (polubienia, obserwowanie) w sieciach społecznościowych czy recenzje filmów. Popularne osoby, filmy, książki mogą zaburzyć standardowe zastosowania i typową liczbę powiązań.

## Źródła
- [https://www.mongodb.com/developer/products/mongodb/outlier-pattern/](https://www.mongodb.com/developer/products/mongodb/outlier-pattern/)
- [https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)