---
layout:    post
title:     "Czy wiesz, jak działa Bucket Pattern w MongoDB i czemu sprawdził się w implementacji IoT Boscha albo w apkach bankowych?"
date:      2021-11-08 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    bmitan
image:     /assets/img/posts/2021-09-16-bucket-pattern/bucket.jpeg
description: "Największe korzyści z używania odpowiedniego wzorca grupowania danych, czyli Bucket Pattern w MongoDB, to m.in. zwiększenie wydajności indeksów czy uproszczenie zapytań. Przeczytaj jak to wszystko zrealizować."
tags:
- mongoDB
---
Największe korzyści z używania odpowiedniego wzorca grupowania danych, czyli Bucket Pattern w MongoDB, to m.in. zwiększenie wydajności indeksów czy uproszczenie zapytań. Przeczytaj jak to wszystko zrealizować.

## Jaki problem próbujemy rozwiązać?

Zacznijmy od prostego przykładu - **pomiarów czujnika wykonywanych bardzo często**, np. co sekundę, każdego dnia. Można by je zapisywać następująco:

```javascript
{
   sensor_id: 12345,
   timestamp: ISODate("2019-01-31T10:00:00.000Z"),
   temperature: 40
}
 
{
   sensor_id: 12345,
   timestamp: ISODate("2019-01-31T10:01:00.000Z"),
   temperature: 40
}
 
{
   sensor_id: 12345,
   timestamp: ISODate("2019-01-31T10:02:00.000Z"),
   temperature: 41
}
```

Oczywiste jest, że dokumentów w takiej kolekcji będzie bardzo dużo i w związku z tym, problemem może być szybki dostęp do tych danych. W celu zwiększenia wydajności zdecydujemy się zastosować indeksy, najprawdopodobniej na polach sensor_id i timestamp. Wówczas sam rozmiar indeksów stanie się sporym wyzwaniem w kontekście niezbędnej do tego pamięci.

## Na czym polega Bucket Pattern?

Wzorzec polega na **odpowiednim pogrupowaniu danych**. Pamiętając o naszym przykładzie z czujnikami, możemy pogrupować dane z jednego czujnika w interesującym nas przedziałach czasu, np. przedziałach 1-godzinnych. Przejdziemy wówczas z modelu danych odpowiadającemu relacyjnemu podejściu na model z zagnieżdżonymi dokumentami.

Te same dane wyglądałyby następująco:

```javascript
{
    sensor_id: 12345,
    start_date: ISODate("2019-01-31T10:00:00.000Z"),
    end_date: ISODate("2019-01-31T10:59:59.000Z"),
    measurements: [
       {
       timestamp: ISODate("2019-01-31T10:00:00.000Z"),
       temperature: 40
       },
       {
       timestamp: ISODate("2019-01-31T10:01:00.000Z"),
       temperature: 40
       },
       ...
       {
       timestamp: ISODate("2019-01-31T10:42:00.000Z"),
       temperature: 42
       }
    ],
   transaction_count: 42,
   sum_temperature: 2413
}
```

Dokumentów w kolekcji będzie mniej i zwiększymy wydajność zapytań. Wiedząc, jakie będzie zastosowanie danych, możemy również dodać do naszego "wiaderka" dodatkowe informacje. Czy faktycznie potrzebujemy do większości zapytań każdego pojedynczego pomiaru? Być może ciekawszą informacją będzie średnia temperatura z godziny w danym miejscu? Wówczas możemy zapisać takie zagregowane dane w Bucket Pattern i uprościć późniejsze zapytania.

W naszym przykładzie, jeśli dojdzie nowy pomiar z czujnika w tym zakresie, zwiększymy liczbę `transaction_count` i `sum_temperature`. Zapytanie o średnią temperaturę w danym dniu lub godzinie, będzie wtedy nawet prostsze niż gdybyśmy korzystali z pojedynczych pomiarów.

I na koniec jeszcze jedna wskazówka. Dobrym pomysłem może się okazać zarchiwizowanie części danych historycznych. Dane spływają wówczas na bieżąco i wiemy, że konkretny dokument nie będzie później modyfikowany, a dostęp do starych danych może być niezwykle rzadki.

## Praktyczne przypadki użycia

Twórcy Mongo chwalą się, że takie zastosowania to nie tylko teoria. Bosch korzysta z Bucket Pattern w MongoDB w aplikacji z branży automotive, zbierając dane z wielu czujników w pojeździe. Również niektóre banki skorzystały z tego wzorca, grupując transakcje.

## Korzyści, o których warto pamiętać

- redukcja liczby dokumentów w kolekcji,
- zwiększenie wydajności indeksów,
- uproszczenie zapytań dotyczących zagregowanych danych.

Przeczytaj więcej tutaj:
* [https://developer.mongodb.com/how-to/bucket-pattern/](https://developer.mongodb.com/how-to/bucket-pattern/)
* [https://www.mongodb.com/customers/bosch](https://www.mongodb.com/customers/bosch)
