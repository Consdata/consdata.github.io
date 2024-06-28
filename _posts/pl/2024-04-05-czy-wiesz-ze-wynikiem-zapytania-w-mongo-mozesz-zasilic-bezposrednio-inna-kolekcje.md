---
layout:    post
title:     "Czy wiesz, że wynikiem zapytania w MongoDB możesz zasilić bezpośrednio inną kolekcję?"
date:      2024-04-05T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pstachowiak
image: /assets/img/posts/2024-04-05-czy-wiesz-ze-wynikiem-zapytania-w-mongo-mozesz-zasilic-bezposrednio-inna-kolekcje/leaf.webp
tags:
- mongodb
- merge
---

MongoDB w wersji 4.2 udostępnił nowy etap potoku agregacji (ang. aggregation pipeline) - $merge.
Pozwala on na zapisanie wyniku agregacji do określonej kolekcji.

Etap `$merge`:
- Może wyprowadzać dane do kolekcji w tej samej lub innej bazie danych,
- utworzyć nową kolekcję, jeśli kolekcja jeszcze nie istnieje,
- może merge'ować wyniki do istniejącej kolekcji.

```javascript
{ 
    $merge: {
        into: <collection> -or- { db: <db>, coll: <collection> },
        on: <identifier field> -or- [ <identifier field1>, ...],
        let: <variables>,
        whenMatched: <replace|keepExisting|merge|fail|pipeline>,
        whenNotMatched: <insert|discard|fail>
    }
}
```

Etap `$merge` zawsze musi być ostatnim etapem agregacji. Możemy określić następujące parametry:
- `into` - kolekcja, do której chcemy zapisać wynik; może to być kolekcja w innej bazie np.:  `into: { db:"myDB", coll:"myOutput" }`,
- `on` - pole lub pola, które działają jako unikalny identyfikator dokumentu. Identyfikator określa, czy dokument wynikowy pasuje do istniejącego dokumentu w kolekcji wyjściowej. Domyślnie `_id`, jeśli wskażemy inne pola, to musi być na nich unikalny indeks,
- `let` - zmienne wykorzystywane w whenMatched,
- `whenMatched` - rodzaj zachowania, gdy w kolekcji wyjściowej znajduje się taki sam dokument (dopasowany po `on`),
- `whenNotMatched` - rodzaj zachowania, gdy w kolekcji wyjściowej nie znaleziono dokumentu o takim samym identyfikatorze.

Dzięki `$merge` możemy tworzyć zmaterializowane widoki na żądanie (ang. On-Demand Materialized View). Ciekawy przykład wprost z dokumentacji MongoDB:

Mamy 2 kolekcje:
```javascript
db.purchaseorders.insertMany([
   {_id: 1, quarter: "2019Q1", region: "A", qty: 200, reportDate: new Date("2019-04-01")},
   {_id: 2, quarter: "2019Q1", region: "B", qty: 300, reportDate: new Date("2019-04-01")},
   {_id: 3, quarter: "2019Q1", region: "C", qty: 700, reportDate: new Date("2019-04-01")},
   {_id: 4, quarter: "2019Q2", region: "B", qty: 300, reportDate: new Date("2019-07-01")},
   {_id: 5, quarter: "2019Q2", region: "C", qty: 1000, reportDate: new Date("2019-07-01")},
   {_id: 6, quarter: "2019Q2", region: "A", qty: 400, reportDate: new Date("2019-07-01")}
])

db.reportedsales.insertMany([
   {_id: 1, quarter: "2019Q1", region: "A", qty: 400, reportDate: new Date("2019-04-02")},
   {_id: 2, quarter: "2019Q1", region: "B", qty: 550, reportDate: new Date("2019-04-02")},
   {_id: 3, quarter: "2019Q1", region: "C", qty: 1000, reportDate: new Date("2019-04-05")},
   {_id: 4, quarter: "2019Q2", region: "B", qty: 500, reportDate: new Date("2019-07-02")}
])
```

Potrzebujemy jednak raportu, który przedstawi nam sumaryczną sprzedaż i kupno dla poszczególnych kwartałów. Dane te będą nam często potrzebne, więc dobrze będzie je zapisać. Wykorzystamy do tego operator `$merge`.
```javascript
db.purchaseorders.aggregate([
   {$group: {_id: "$quarter", purchased: {$sum: "$qty"}}},
   {$merge: {into: "quarterlyreport", on: "_id",  whenMatched: "merge", whenNotMatched: "insert"}}
])
```

Grupujemy wartości po czym zapisujemy je w kolekcji `quarterlyreport`. Po takiej operacji otrzymujemy kolekcję `quarterlyreport`:
```javascript
{"_id": "2019Q2", "purchased": 1700}
{"_id": "2019Q1", "purchased": 1200}
```

Następnie przeprowadzamy analogiczną operację dla sprzedaży:
```javascript
db.reportedsales.aggregate([
   {$group: {_id: "$quarter", sales: {$sum: "$qty"}}},
   {$merge: {into: "quarterlyreport", on: "_id", whenMatched: "merge", whenNotMatched: "insert"}}
])
```

W wyniku otrzymujemy kolekcję, która służy nam za widok  ze zagregowanymi danymi. Warto zauważyć, że w wynikowej kolekcji dokumenty zostały zmergowane, a nie zastąpione: 
```javascript
{"_id": "2019Q1", "sales": 1950, "purchased": 1200}
{"_id": "2019Q2", "sales": 500, "purchased": 1700}
```

Przydatne linki:
- [https://docs.mongodb.com/manual/reference/operator/aggregation/merge/](https://docs.mongodb.com/manual/reference/operator/aggregation/merge/)
- [https://docs.mongodb.com/manual/aggregation/](https://docs.mongodb.com/manual/aggregation/)