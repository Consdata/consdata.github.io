---
layout:    post
title:     "Czy wiesz, jak bezprzerwowo zmienić schemat w MongoDB?"
date:      2024-02-09T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bmitan
image: /assets/img/posts/2024-02-09-czy-wiesz-jak-bezprzerwowo-zmienic-schemat-w-mongodb/code.webp
tags:
- mongodb
- Schema Versioning Pattern
---

Wyobraźmy sobie konieczność wprowadzenia zmian w schemacie. Przy tradycyjnym podejściu musielibyśmy zatrzymać aplikację, dokonać migracji bazy i dopiero po jej zakończeniu uruchomić aplikację.  Co jeśli nasza kolekcja jest już bardzo duża albo przerwy nie są akceptowalne? Jest też ryzyko, że nastąpi błąd przy migracji, a powrót do poprzedniej wersji w niektórych przypadkach może być dużym problemem. Co proponuje MongoDB? Schema Versioning Pattern.

Kiedy użyć?
- kiedy nie może być przerwy w dostępie do systemu,
- kiedy aktualizacja dokumentów może zająć godziny, dni lub tygodnie,
- kiedy nie trzeba aktualizować wszystkich dokumentów do nowej wersji.

## Przykład
Pierwotnie zamodelowaliśmy dane kontaktowe w następujący sposób.

```javascript
{
    "_id": "<ObjectId>",
    "name": "Anakin Skywalker",
    "home": "503-555-0000",
    "work": "503-555-0010",
    "mobile": "503-555-0120"
}
```

Minęło trochę czasu, mamy już dużo dokumentów w naszej kolekcji, ale zmieniły się wymagania i musimy przechowywać więcej danych kontaktowych, związanych z nowymi formami komunikacji. Znamy na szczęście {% comment %}Zmienić na link jak już będzie znany[Attribute Pattern]({% post_url pl/2024-01-26-czy-wiesz-czym-jest-attribute-pattern-w-mongodb %}){% endcomment %}Attribute Pattern i decydujemy wprowadzić nie tylko nowe pola, ale i zastosować ten wzorzec - dodajemy pole `contact_method`.
```javascript
"contact_method": [
    { "work": "503-555-0210" },
    { "mobile": "503-555-0220" },
    { "twitter": "@anakinskywalker" },
    { "skype": "AlwaysWithYou" }
]
```

Nie możemy sobie jednak pozwolić na przerwę w działaniu aplikacji i migrację od razu wszystkich dokumentów. Nowe dokumenty będą miały już tylko pole `contact_method`, a stare jeszcze dawne pola `home`, `work`, `mobile`.  Kod aplikacji będzie więc tworzył nowe dokumenty z polem `contact_method` przy dodawaniu. Może też ewentualnie aktualizować stare dokumenty przy okazji update'a.

Wymaga to od nas dostosowania kodu aplikacji do dokumentów w dwóch różnych wersjach. Twórcy Mongo proponują bardzo prosty pomysł - dodanie dodatkowego pola `schema_version` w nowych dokumentach (lub zwiększenie wartości `schema_version`, jeśli już istnieje).

```javascript
{
    "_id": "<ObjectId>",
    "schema_version": "2",
    "name": "Anakin Skywalker",
    "contact_method": [
        { "work": "503-555-0210" },
        { "mobile": "503-555-0220" },
        { "twitter": "@anakinskywalker" },
        { "skype": "AlwaysWithYou" }
    ]
}
```

Mamy więc sytuację, gdy dokumenty są w dwóch różnych wersjach, a nasz kod musi radzić sobie z obsługą tych dwóch wersji i wskazane jest, żeby rozróżniać wersję właśnie po polu "schema_version" (w przeciwieństwie do wykrywania np. czy dane pole istnieje). Możemy równocześnie wykonać w tle masową aktualizację i zadecydować sami, kiedy ma się wydarzyć. W kolejnej wersji aplikacji możemy też zdecydować o pozbyciu się kodu obsługującego obydwie wersje.

Zauważmy jednak, że w skrajnym przypadku w okresie przejściowym będziemy potrzebować więcej indeksów - dotychczasowy, wspierający poprzednią wersję i nowy, wspierający nową wersję.

Osobnym tematem, o którym nie można zapomnieć, jest podejście do walidacji takiego schematu. Warto pamiętać, że chociaż Mongo jako baza NoSql uznawana jest jako schemaless, to pozwala ona na walidacje schematu, np. wymagalność pól.

## Podsumowanie

Plusy:
- bezprzerwowa migracja,
- możliwość zarządzania migracją (kiedy i jak się odbędzie).

Minusy:
- może być konieczność utrzymywania 2 indeksów do czasu zakończenia migracji,
- jeśli korzystamy z walidacji schematu, może wystąpić konieczność dostosowania walidacji do dwóch wersji.

## Przydatne linki
- [https://www.mongodb.com/blog/post/building-with-patterns-the-schema-versioning-pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-schema-versioning-pattern)
- [https://docs.mongodb.com/manual/core/schema-validation/](https://docs.mongodb.com/manual/core/schema-validation/)