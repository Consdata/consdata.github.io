---
layout:    post
title:     "Czy wiesz czym jest Attribute Pattern w MongoDB?"
date:      2024-01-26T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bmitan
image: /assets/img/posts/2024-01-26-czy-wiesz-czym-jest-attribute-pattern-w-mongodb/code.webp
description: Masz w kolekcji wiele dużych dokumentów z wieloma polami o tej samej charakterystyce? Ten wzorzec jest dla Ciebie! 
tags:
- mongodb
- attribute pattern
---

## Kiedy stosować Attribute Pattern?

Wzorzec warto zastosować, kiedy:
- mamy wiele dużych dokumentów z wieloma podobnymi polami, ale istnieje pewien podzbiór pól o tej samej charakterystyce, a chcemy pytać i sortować właśnie po tym podzbiorze pól, lub
- tylko niewielka część dokumentów zawiera pola, po których chcemy sortować, lub
- oba powyższe warunki występują jednocześnie.

### Przykłady:

#### Kolekcja filmów - pola daty premier w poszczególnych krajach
```javascript
{
    title: "Star Wars",
    director: "George Lucas",
    // ...
    release_US: ISODate("1977-05-20T01:00:00+01:00"),
    release_France: ISODate("1977-10-19T01:00:00+01:00"),
    release_Italy: ISODate("1977-10-20T01:00:00+01:00"),
    release_UK: ISODate("1977-12-27T01:00:00+01:00")
}
```

#### Kolekcja utworów muzycznych
```javascript
{
    title: 'What is love?',
    // ...
    streams_spotify: 23854235,
    streams_tidal: 23432,
    streams_youtube: 9993453,
    streams_apple: 345665
}
```

## Na czym polega problem?
Chodzi o wydajność zapytań. W pierwszym przykładzie zapytanie po dacie premiery będzie wymagało indeksu na każdym z pól release_*.  Jeśli mamy wiele krajów, to zarządzanie tymi indeksami może być trudne, obsługa nowych wydań, np. w nowym kraju albo na festiwalu oznacza konieczność dodania jeszcze kolejnego indeksu.

### Indeksy - przed zastosowaniem AttributePattern
```javascript
[
    {release_US: 1},
    {release_France: 1},
    {release_Italy: 1},
    {release_UK: 1},
    // ...
]
```

## Na czym polega Attribute Pattern?
Dane można zamodelować inaczej. Zamiast wielu osobnych pól wystarczy wprowadzić jedno pole typu Array, zawierające pary klucz-wartość. W przykładzie kolekcji filmów, kluczami będą kolejne lokalizacje, a wartościami daty.
Po zastosowaniu wzorca otrzymamy dokumenty w następującej formie:
```javascript
{
    title: "Star Wars",
    director: "George Lucas",
    // ...
    releases: [
        {
        location: "USA",
        date: ISODate("1977-05-20T01:00:00+01:00")
        },
        {
        location: "France",
        date: ISODate("1977-10-19T01:00:00+01:00")
        },
        {
        location: "Italy",
        date: ISODate("1977-10-20T01:00:00+01:00")
        },
        {
        location: "UK",
        date: ISODate("1977-12-27T01:00:00+01:00")
        },
        // ...
    ],
    // ...
}
```

Plusy takiego rozwiązania to:
- łatwe dodanie nowych lokalizacji,
- jeden indeks: `{ "releases.location": 1, "releases.date": 1}`
- łatwe dodawanie kolejnych pól charakteryzujących nasze dane,
- szybsze zapytania.

## Praktyczny przypadek użycia
Inny przypadek użycia to kolekcja produktów, posiadających różne charakterystyki w zależności od typu. Przykładowo ubrania mogą mieć rozmiar S, M, L.  Natomiast kubki mogą mieć pojemność podaną w różnych jednostkach. Jeszcze inne produkty będą miały wysokość, szerokość, długość, czy masę, również w różnych jednostkach. Niektóre z tych charakterystyk nie są znane na etapie projektowania aplikacji i mogą zostać wprowadzone później. Załóżmy, że chcemy zapewnić użytkownikowi możliwość wyszukiwania po wielu polach i móc łatwo dodać nowy rodzaj filtra. Tu również wzorzec Attribute Pattern okaże się idealnym rozwiązaniem. Kubek może mieć np. następujące dane:
```javascript
"specs": [
    { k: "volume", v: "500", u: "ml" },
    { k: "volume", v: "12", u: "ounces" }
]
```
a szafka zupełnie inne dane, ale w tym samym polu `specs`:
```javascript
"specs": [
    { k: "height", v: "100", u: "cm" },
    { k: "height", v: "39.37", u: "inches" },
    // ...,
    { k: "weight", v: "10", u: "kg"}
]
```
Aby efektywnie przeszukiwać taką strukturę potrzebujemy tylko jednego indeksu:
```javascript
{"specks.k": 1, "specs.v": 1, "specs.u": 1}
```

Otrzymujemy bardzo elastyczny model danych, pozwalający na skomplikowane i wydajne wyszukiwanie.

## Więcej informacji
[https://www.mongodb.com/developer/how-to/attribute-pattern/](https://www.mongodb.com/developer/how-to/attribute-pattern/)