---
layout: post
title: "Czy wiesz czym jest IndexedDB?"
date: 2023-07-24T11:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2023-07-24-czy-wiesz-czym-jest-indexeddb/post_img.jpg
description:
tags:
  - indexeddb
  - webstorage
  - database
  - javascript
---

IndexedDB jest wbudowaną w przeglądarkę internetową, bazą danych typu NoSQL (przeglądarki wspierające
mechanizm: https://caniuse.com/indexeddb).

IndexedDB jest znacznie potężniejszy niż localStorage, ponieważ pozwala na:

- przechowywanie prawie każdego rodzaju wartości według kluczy
- obsługę transakcji,
- tworzenie zapytań range queries,
- obsługę indeksów,
- przechowywanie znacznie większej ilości danych niż localStorage

Dodatkowo IndexedDB przechowuje dane lokalnie w przeglądarce, co oznacza, że można korzystać z nich nawet wtedy, gdy
urządzenie nie ma połączenia z internetem.

## Tworzenie bazy

W celu rozpoczęcia prac z IndexedDB musimy najpierw "otworzyć" bazę danych (połączyć się z nią).

```javascript
//Otwieranie połączenia z bazą danych. Jeśli baza nie istnieje to zostanie utworzona

const dbName = 'MyDatabase';
const dbVersion = 1;
const request = indexedDB.open(dbName, dbVersion);
```

Aby podejrzeć otworzoną bazę danych, musimy otworzyć konsolę deweloperską (devTools), przejść do zakładki "
Application", następnie w sekcji "Storage" znajduje się "IndexedDB", a w niej utworzone bazy danych.

![](/assets/img/posts/2023-07-24-czy-wiesz-czym-jest-indexeddb/indexeddb_db.jpg)

Możemy mieć wiele baz danych o różnych nazwach, ale istnieją one w ramach bieżącego źródła (domena/protokół/port). Różne
strony internetowe nie mogą uzyskać dostępu do baz danych z innej domeny. Na poniższym obrazku zostało zaznaczone
źródło, dla którego została utworzona baza danych.

![](/assets/img/posts/2023-07-24-czy-wiesz-czym-jest-indexeddb/indexeddb_origin.jpg)

## Usuwanie utworzonej bazy

```javascript
indexedDB.deleteDatabase(dbName);
```

## Object store

Główną koncepcją w IndexedDB jest "object store" (magazyn obiektów). Object store jest niezbędny, aby umożliwić
przechowywanie danych w bazie. W innych bazach danych, odpowiednikiem object store są często określane jako "tabela"
lub "kolekcja". W IndexedDB dane są zazwyczaj reprezentowane jako obiekty JavaScript, które można sprowadzić do formatu
JSON lub innego formatu tekstowego przed ich zapisaniem w bazie danych.

Dodatkowo IndexedDB obsługuje przechowywanie danych w różnych formatach, takich jak typy wbudowane JavaScript (np. liczby, łańcuchy znaków, daty), tablice i dane binarne. Warto wspomnieć, że obiekty, których nie można serializować,
nie mogą być umieszczone w bazie.

Dla każdej wartości w object store musi istnieć unikalny klucz (identyfikator). Klucz musi być jednym z tych typów: liczba, data, ciąg znaków, binarny lub tablica. Klucze mogą być generowane automatycznie.

### Dodawanie object store, przykład:

```javascript
//Tworzenie object store o nazwie 'Customers', z polem 'id' jako kluczem, jeśli nie istnieje on w bazie danych

let db = request.result;

if (!db.objectStoreNames.contains('Customers')) {
    db.createObjectStore('Customers', {keyPath: 'id'});
}
```

### Usuwanie object store

```javascript
db.deleteObjectStore('Customers');
```

## Operacje na danych

Wszystkie operacje na danych w IndexedDB muszą być wykonywane w ramach transakcji.
Transakcja to zbiór operacji, które
muszą wykonać się wszystkie lub żadna z nich.

Przykład tworzenia transakcji:

```javascript
const clientsObjectStoreKey = 'Customers';
const transactionType = 'readwrite';

const transaction = db.transaction(clientsObjectStoreKey, transactionType);

//pobranie object store dla klientów w celu wykonywania dowolnej operacji
const clients = transaction.objectStore(clientsObjectStoreKey);
```
Typy transakcji:
- `readonly` - można tylko odczytywać dane — opcja domyślna
- `readwrite` - można odczytywać i zapisywać dane, ale nie może tworzyć, usuwać, modyfikować object store.


Podstawowe operacje, które można wykonać w ramach transakcji dla object store `clients`:

```javascript
//Dodawanie danych
clients.add(data);

//Odczytywanie danych
clients.get(key);
clients.getAll();

//Aktualizacja danych
clients.put(data);

//Aktualizacja danych na podstawie istniejącego klucza
clients.put(data, key);

//Usuwanie danych na podstawie klucza
clients.delete(key);

//Usunięcie wszystkich danych
clients.clear();
```

Podgląd bazy danych po dodaniu obiektu:
![](/assets/img/posts/2023-07-24-czy-wiesz-czym-jest-indexeddb/indexeddb_with_data.jpg)

## Podsumowanie

W artykule przedstawione zostały podstawowe koncepcje i operacje na danych w kontekście IndexedDB. Zachęca do zgłębienia
tematu i skorzystania z dodatkowych źródeł zamieszczonych poniżej, które dostarczą bardziej zaawansowanych informacji na
temat tego mechanizmu.

## Playground

https://jsfiddle.net/wstolarski_consdata/awy94tsm/1/

## Źródła

https://javascript.info/indexeddb
https://www.freecodecamp.org/news/how-indexeddb-works-for-beginners/
https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
