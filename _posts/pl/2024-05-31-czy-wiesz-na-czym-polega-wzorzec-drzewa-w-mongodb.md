---
layout:    post
title:     "Czy wiesz na czym polega wzorzec drzewa w MongoDB?"
date:      2024-04-31T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: kbocer
image: /assets/img/posts/2024-05-31-czy-wiesz-na-czym-polega-wzorzec-drzewa-w-mongodb/tree.webp
tags:
- mongodb
---
Bardzo często przechowywane dane w bazie tworzą większe struktury. Przykładowo lista pracowników firmy i ich hierarchia, asortyment w sklepie i kategoria do której przynależy, miasta wraz z województwami, wymieniać można długo. Takie relacje są dla nas bardzo naturalne. W MongoDB możemy taką przynależność jednego obiektu do drugiego przedstawić za pomocą wzorca drzewa. W zależności od implementacji zyskujemy łatwiejsze poruszanie się po dokumentach albo ograniczamy liczbę zapytań do bazy. Trzeba jednak mieć na uwadze, że przedstawienie danych w taki sposób ma swoją cenę. Każdy przechowywany dokument będzie musiał posiadać dodatkowe pole z informacją o swoim dziecku i/lub rodzicu albo potomkach. Taka zmiana oprócz samego rozszerzenia dokumentu wiąże się też z utrzymaniem nowych pól, jednak o tym później. Na razie przyjrzyjmy się jak możemy zaimplementować wzorzec drzewa.

Spróbujmy skupić się na przykładzie ze sklepem i jego asortymentem. Powiedzmy, że struktura dla wybranych produktów wygląda następująco:

![Kategorie asortymentu](/assets/img/posts/2024-05-31-czy-wiesz-na-czym-polega-wzorzec-drzewa-w-mongodb/products.png)
Po samym grafie już widać, że dane tworzą strukturę drzewa. W bazie możemy taką bazę przedstawić na kilka sposobów w zależności od potrzeb.

## Drzewo z referencją na dzieci
W tym podejściu każdy obiekt ma dodatkowe pole z powiązanymi do niego kategoriami / produktami. Więc struktura może wyglądać następująco:
```javascript
{ "_id" : "Super TV", "children" : []}
{ "_id" : "HD TV", "children" : []}
{ "_id" : "Telewizory", "children" : [ "Super TV", "HD TV" ]}
{ "_id" : "TV i Video", "children" : [ "Telewizory" ]}
{ "_id" : "Zimna Lodówka", "children" : []}
{ "_id" : "AGD Wolnostojące", "children" : [ "Zimna Lodówka" ]}
{ "_id" : "RTV i AGD", "children" : [ "AGD Wolnostojące", "TV i Video" ]}
{ "_id" : "Elektronika", "children" : [ "RTV i AGD" ]}
{ "_id" : "Sklep", "children" : [ "Elektronika" ]}
```

Przechowanie danych w następujący sposób daje nam dodatkową informację o powiązanych podkategoriach dla obiektu, który pobraliśmy.
```javascript
db.getCollection('categories').find({_id: "RTV i AGD"});
---
{ "_id" : "RTV i AGD", "children" : [ "AGD Wolnostojące", "TV i Video" ] }
```
Możemy również sprawdzić rodzica dla wybranej kategorii
```javascript
db.getCollection('categories').find({children: "RTV i AGD"})
---
{ "_id" : "Elektronika", "children" : [ "RTV i AGD" ] }
```

## Drzewo z referencją na rodzica
W poprzednim podejściu pobierając dokument z wybranym telewizorem niestety nie dostaniemy informacji do jakiej kategorii należy produkt. Konieczne jest przeszukanie wszystkich kategorii czy w dzieciach mają nasz telewizor. By zapobiec dodatkowemu zapytaniu możemy niejako odwrócić strukturę i zamiast referencji na dzieci danego obiektu przechowywać referencje na rodzica.
```javascript
{ "_id": "Super TV", "parent": "Telewizory" }
{ "_id": "HD TV", "parent": "Telewizory" }
{ "_id": "Telewizory", "parent": "TV i Video" }
{ "_id": "TV i Video", "parent": "RTV i AGD" }
{ "_id": "Zimna Lodówka", "parent": "AGD Wolnostojące" }
{ "_id": "AGD Wolnostojące", "parent": "RTV i AGD" }
{ "_id": "RTV i AGD", "parent": "Elektronika" }
{ "_id": "Elektronika", "parent": "Sklep" }
{ "_id": "Sklep", "parent": null }
```
Dzięki takiemu układowi mając obiekt `Super TV` bez dodatkowych żądań wiemy, że znajduje się on w kategorii `Telewizory`.
```javascript
db.getCollection('categories').find({_id: "Super TV"});
---
{ "_id" : "Super TV", "parent" : "Telewizory" }
```

## Drzewo z listą przodków
Referencję tylko na rodzica może być mało pomocna jeśli potrzebujemy pełnej ścieżki do danego obiektu.

By rozwiązać ten problem pole rodzica zastępujemy listą przodków.
```javascript
{ "_id" : "Super TV", "ancestors" : [ "Telewizory", "TV i Video", "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "HD TV", "ancestors" : [ "Telewizory", "TV i Video", "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "Telewizory", "ancestors" : [ "TV i Video", "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "TV i Video", "ancestors" : [ "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "Zimna Lodówka", "ancestors" : [ "AGD Wolnostojące", "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "AGD Wolnostojące", "ancestors" : [ "RTV i AGD", "Elektronika", "Sklep" ] }
{ "_id" : "RTV i AGD", "ancestors" : [ "Elektronika", "Sklep" ] }
{ "_id" : "Elektronika", "ancestors" : [ "Sklep" ] }
{ "_id" : "Sklep", "ancestors" : [] }
```
Teraz pobierając `Super TV` wiemy bez dodatkowych zapytań, że znajduje się on pod ścieżką: `Sklep` → `Elektronika` → `RTV i AGD` → `TV i Video` → `Telewizory`.
```javascript

db.getCollection('categories').find({"_id": "Super TV"})
---
{ "_id" : "Super TV", "ancestors" : [ "Telewizory", "TV i Video", "RTV i AGD", "Elektronika", "Sklep"] }
```

## Drzewo z zagnieżdżonymi zbiorami
Najbardziej specyficzny przykład dla równie specyficznych potrzeb. Możemy go zastosować kiedy zestaw danych jest bardzo rzadko modyfikowany i potrzebujemy wydajnie przeszukiwać i pobierać całe podzbiory naszej struktury. Dokument tym razem rozszerzamy o 3 pola:
- `parent` - definiuje pozycje w strukturze,
- `left` - używane do wyszukiwania,
- `right` - używane do wyszukiwania.

Pola `left` i `right` musimy sami wyliczyć przechodząc całe drzewo od korzenia przez wszystkie liście  i z powrotem do korzenia nadając poszczególnym elementom kolejne indeksy.

![Kategorie asortymentu z zagnieżdżonymi zbiorami](/assets/img/posts/2024-05-31-czy-wiesz-na-czym-polega-wzorzec-drzewa-w-mongodb/subsets.png)

```javascript
{ "_id" : "Super TV", "parent" : "Telewizory", "left" : 11.0, "right" : 12.0 }
{ "_id" : "HD TV", "parent" : "Telewizory", "left" : 9.0, "right" : 10.0 }
{ "_id" : "Telewizory", "parent" : "TV i Video", "left" : 8.0, "right" : 13.0 }
{ "_id" : "TV i Video", "parent" : "RTV i AGD", "left" : 7.0, "right" : 14.0 }
{ "_id" : "Zimna Lodówka", "parent" : "AGD Wolnostojące", "left" : 4.0, "right" : 5.0 }
{ "_id" : "AGD Wolnostojące", "parent" : "RTV i AGD", "left" : 3.0, "right" : 6.0 }
{ "_id" : "RTV i AGD", "parent" : "Elektronika", "left" : 2.0, "right" : 15.0 }
{ "_id" : "Elektronika", "parent" : "Sklep", "left" : 1.0, "right" : 16.0 }
{ "_id" : "Sklep", "parent" : null, "left" : 0.0, "right" : 17.0 }
```

Teraz możemy wyszukać całego podzbioru dla kategorii `TV i Video`:
```javascript
var kategoria = db.getCollection('categories').findOne( { _id: "TV i Video" } );
db.categories.find( { left: { $gt: kategoria.left }, right: { $lt: kategoria.right } } );
---
{ "_id" : "Super TV", "parent" : "Telewizory", "left" : 11.0, "right" : 12.0 }
{ "_id" : "HD TV", "parent" : "Telewizory", "left" : 9.0, "right" : 10.0 }
{ "_id" : "Telewizory", "parent" : "TV i Video", "left" : 8.0, "right" : 13.0 }
```

## Koszt każdego z rozwiązań

Jak wspomniałem na początku zastosowanie wzorca drzewa ma swoją cenę. Modyfikacje struktury danych mogą być bardzo kosztowne. Musimy pilnować by dodane przez nas pola były spójne z nową strukturą. Powiedzmy, że musimy rozbić dział `RTV i AGD` na dwa osobne `RTV` i `AGD`. Co musimy zrobić dodatkowo by zachować spójność?

- **drzewo z referencją na dzieci** - szukamy rodzica dla dawnego `RTV i AGD`, usuwamy tę kategorię z dzieci i dodajemy dwie nowe - konieczna będzie modyfikacja dodatkowego jednego dokumentu (rodzica kategorii `RTV i AGD`),
- **drzewo z referencją na rodzica** - szukamy dzieci dla dawnego `RTV i AGD` i przypisujemy im nowego rodzica `RTV` lub `AGD` - konieczna będzie modyfikacja wszystkich dzieci kategorii `RTV i AGD`,
- **drzewo z listą przodków** - szukamy wszystkich potomków i zastępujemy im przodka `RTV i AGD` nowym `RTV` lub `AGD` - konieczna będzie modyfikacja wszystkich potomków kategorii `RTV i AGD`,
- **drzewo z zagnieżdżonymi zbiorami** - należy dokonać zmian jak dla drzewa z referencją na rodzica i przeliczyć wszystkie indeksy - należy zmodyfikować wszystkie elementy kolekcji.

Jak widać liczba dotkniętych zmianą dokumentów może być bardzo duża, z tego powodu wzorzec ten jest używany w przypadkach gdzie struktura jest niezmienna lub zmienia się bardzo rzadko.

## Podsumowanie
Nie ma najlepszej uniwersalnej implementacji tego wzorca. Co będzie najlepsze zależy od naszych potrzeb. Po jakie dane często sięgamy, jak wyszukujemy. Nic nie stoi na przeszkodzie by połączyć wspomniane rozwiązania i rozszerzyć obiekt o listę przodków jak i listę dzieci. Pamiętajmy jednak, że wzorzec ten wymusza dodatkową pracę przy zmianach struktury danych.

## Przydatne linki
- [https://www.mongodb.com/blog/post/building-with-patterns-the-tree-pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-tree-pattern)
- [https://mongoing.com/docs/tutorial/model-tree-structures.html](https://mongoing.com/docs/tutorial/model-tree-structures.html)