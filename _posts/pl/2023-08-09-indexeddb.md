---
layout: post
title: "IndexedDB - narzędzie do przechowywania danych w przeglądarce"
date: 2023-08-09T08:00:00+02:00
published: true
didyouknow: false
lang: pl
author: wstolarski
image: /assets/img/posts/2023-08-09-czy-wiesz-czym-jest-indexeddb/post_img.jpg
description:
tags:
  - indexeddb
  - webstorage
  - database
  - javascript
readingTime: 20 min
---

IndexedDB to wbudowana w przeglądarkę internetową baza danych typu NoSQL. Przechowuje ona dane lokalnie w przeglądarce,
co pozwala na korzystanie z nich nawet wtedy, gdy urządzenie nie ma połączenia z internetem. Dzięki temu IndexedDB
stanowi świetną opcję dla aplikacji internetowych i jest dobrą alternatywą dla Local Storage.

W przeciwieństwie do Local Storage, dane w IndexedDB nie są automatycznie usuwane przez przeglądarkę. Są one trwale przechowywane do momentu, gdy użytkownik zdecyduje się usunąć je ręcznie lub gdy aplikacja, która korzysta z
IndexedDB, wykona odpowiednie operacje usuwania.

Dodatkowo IndexedDB pozwala na:

- obsługę transakcji,
- tworzenie zapytań typu range query,
- obsługę indeksów,
- przechowywanie znacznie większej ilości danych niż Local Storage i cookies.

## Maksymalna ilość danych przechowywanych w IndexedDB
Maksymalna ilość danych, którą można przechowywać w IndexedDB różni się w zależności od przeglądarki internetowej, ale zwykle jest to kilka gigabajtów.

### Firefox
Firefox nakłada ograniczenia w zależności od rozmiaru profilu użytkownika na dysku:
- 10% całkowitego rozmiaru dysku dla profilu użytkownika,
- 10 GB dla wszystkich stron z tej samej domeny (limity grupowe),
- Do 50% całkowitego rozmiaru dysku, z ograniczeniem do 8 TB dla stron z przyznaną pamięcią trwałą.

#### Przykład:
Jeśli nasze urządzenie ma dysk o pojemności 1000 GB, Firefox pozwoli źródłu na przechowanie:
- 10 GB danych (limit grupy dla tej samej domeny),
- 500 GB danych (50% całkowitego rozmiaru dysku).

### Chrome i przeglądarki oparte na projekcie open-source Chromium (np. Edge)
Przeglądarki te pozwalają źródłu na zajęcie do 60% całkowitego rozmiaru dysku.
Przykładowo, jeśli urządzenie ma dysk o pojemności 1 TB, przeglądarka pozwoli źródłu na wykorzystanie do 600 GB.

### Safari
W Safari źródło otrzymuje początkowy limit 1 GB.
Gdy źródło osiągnie ten limit, Safari prosi użytkownika o zgodę na przechowywanie większej ilości danych.

## Kompatybilność i wsparcie przeglądarek

Listę przeglądarek wspierających opisywany mechanizm możemy znaleźć [tutaj](https://caniuse.com/indexeddb).

## Tworzenie bazy

W celu rozpoczęcia prac z IndexedDB musimy najpierw "otworzyć" bazę danych (połączyć się z nią).

```javascript
// Otwieranie połączenia z bazą danych. 
// Jeśli baza nie istnieje to zostanie utworzona.

const dbName = 'MyDatabase';
const dbVersion = 1;
const request = indexedDB.open(dbName, dbVersion);
```

Aby podejrzeć bazę danych, musimy otworzyć konsolę deweloperską (devTools), przejść do zakładki "Application", następnie w sekcji "Storage" znajduje się "IndexedDB", a w niej utworzone bazy danych.

![Umiejscownienie IndexedDB w devTools](/assets/img/posts/2023-08-09-czy-wiesz-czym-jest-indexeddb/indexeddb_db.jpg)

Możemy utworzyć wiele baz danych o różnych nazwach, ale istnieją one w ramach jednego źródła (ang. *origin* - protokół warstwy aplikacji, domena, port).
Strony internetowe działające w ramach tej samej domeny mają dostęp do swoich własnych baz danych, ale nie mogą uzyskać
dostępu do baz danych utworzonych na innych domenach. Poniżej zamieszczam źródło, dla którego została utworzona nasza
baza danych:

![Weryfikacja źródła bazy danych w devTools](/assets/img/posts/2023-08-09-czy-wiesz-czym-jest-indexeddb/indexeddb_origin.jpg)

### Wersjonowanie

Wersjonowanie w IndexedDB jest kluczowym mechanizmem do zarządzania zmianami w strukturze danych podczas aktualizacji
aplikacji. Zapewnia spójność danych i minimalizuje ryzyko konfliktów między różnymi wersjami aplikacji, a co za tym
idzie, zapobiega powtórnemu tworzeniu istniejących elementów struktury danych.

Aby wersjonować bazę danych w IndexedDB, możemy określić numer wersji bazy danych podczas jej otwierania, używając
drugiego parametru w metodzie `open()` (tak jak w kodzie powyżej). Jeśli numer wersji jest większy niż wersja
istniejącej bazy danych, zostanie wywołany odpowiedni callback aktualizacji, który umożliwi dodanie nowego object store 
lub indeksów.

Warto zauważyć, że próba utworzenia object store lub indeksu, który już istnieje w bazie danych, spowoduje
zgłoszenie błędu przez przeglądarkę.

## Usuwanie utworzonej bazy

```javascript
indexedDB.deleteDatabase(dbName);
```

## Object store

Główną koncepcją w IndexedDB jest "object store" (magazyn obiektów). Object store jest niezbędny do przechowywania
danych w bazie. W innych bazach danych, odpowiednik object store często nazywany jest "tabelą" lub "kolekcją". W
IndexedDB dane są reprezentowane jako obiekty JavaScript, które można przekształcić do formatu JSON lub innego formatu
tekstowego przed zapisaniem ich w bazie danych.

IndexedDB dodatkowo obsługuje przechowywanie danych w różnych formatach, takich jak typy wbudowane JavaScript (np.
liczby, ciągi znaków, daty), tablice oraz dane binarne. Warto zaznaczyć, że obiekty, których nie można serializować, nie
mogą być umieszczone w bazie.

Dla każdej wartości w object store musi istnieć unikalny klucz (identyfikator). Klucz musi być jednym z tych typów:
liczba, data, ciąg znaków, dane binarne lub tablica. Klucze mogą być generowane automatycznie.

### Dodawanie object store, przykład:

```javascript
// Tworzenie object store o nazwie 'Customers', z polem 'id' 
// jako kluczem podstawowym

let db = request.result;
const customersObjectStoreKey = 'Customers';

if (!db.objectStoreNames.contains(customersObjectStoreKey)) {
    db.createObjectStore(customersObjectStoreKey, {keyPath: 'id'});
}
```

`keyPath` to właściwość, która istnieje zawsze i zawiera unikalną wartość.

Można również użyć generatora kluczy, takiego jak `autoIncrement`. Generator kluczy tworzy unikalną wartość dla każdego
obiektu dodanego do object store. Domyślnie, jeśli nie określimy klucza, IndexedDB tworzy i przechowuje go oddzielnie od
danych.

```javascript
db.createObjectStore('id', {autoIncrement: true});
```

### Usuwanie object store

```javascript
db.deleteObjectStore('Customers');
```

## Operacje na danych

Wszystkie operacje na danych w IndexedDB muszą być wykonywane w ramach transakcji, co pozwala na zapewnienie spójności
danych. Transakcja w IndexedDB jest zbiorem operacji, które wykonają się atomowo - wszystkie lub, w przypadku błędu, nie wykona się żadna z nich.
Zarządzanie danymi w transakcyjny sposób pomaga w unikaniu konfliktów i utrzymaniu
spójności danych nawet w przypadku równoczesnych operacji na bazie danych. Jest to ważne w przypadku aplikacji, w których
odbywa sie przetwarzanie równoległe (np. wielu użytkowników pracujących równolegle) lub wymagają pracy w trybie offline.

Przykład tworzenia transakcji:

```javascript
const customersObjectStore = 'Customers';
const transactionType = 'readwrite';

const transaction = db.transaction(customersObjectStore, transactionType);

// Pobranie object store dla klientów w celu wykonywania dowolnej operacji
const customers = transaction.objectStore(customersObjectStoreKey);
```

Typy transakcji:
- `readonly` - umożliwia jedynie odczyt danych (opcja domyślna).
- `readwrite` - umożliwia zarówno odczyt, jak i zapis danych, ale nie pozwala na tworzenie, usuwanie ani modyfikację
  object store.

Przykładowy kod dodający obiekt do naszej bazy danych:
```javascript
// Rozpoczynanie transakcji na object store 'Customers'
const transaction = db.transaction(customersObjectStoreKey, 'readwrite');
const customers = transaction.objectStore(customersObjectStoreKey);

// Dodawanie danych do object store
const customer = { id: 1, name: 'Jan', surname: 'Kowalski' };
const transactioRequest = customers.add(customer);
```

Podgląd bazy danych po dodaniu obiektu:
![Podgląd stanu bazy danych w devTools po dodaniu obiektu](/assets/img/posts/2023-08-09-czy-wiesz-czym-jest-indexeddb/indexeddb_with_data.jpg)

Podstawowe operacje, które można wykonać w ramach transakcji to:

- `add(data, optionalKey)` - dodawanie nowego rekordu do object store,
- `get(primaryKey)` - pobieranie rekordu na podstawie klucza,
- `getAll(optionalConstraint)` - odczytywanie wszystkich danych z object store,
- `put(data)` - aktualizowanie lub dodawanie rekordu w object store,
- `put(data, optionalKey)` - aktualizacja danych na podstawie istniejącego klucza,
- `delete(primaryKey)` - usuwanie rekordu na podstawie klucza,
- `clear()` - usuwanie wszystkich rekordów z object store.

## Podsumowanie

W artykule przedstawione zostały podstawowe koncepcje i operacje na danych w kontekście IndexedDB. Zachęcam do zgłebienia
tematu i skorzystania z dodatkowych źródeł zamieszczonych poniżej, które dostarczą bardziej zaawansowanych informacji na
temat tego mechanizmu.

## Playground
[https://jsfiddle.net/wstolarski_consdata/awy94tsm/1/](https://jsfiddle.net/wstolarski_consdata/awy94tsm/1/)

## Źródła

- [https://javascript.info/indexeddb](https://javascript.info/indexeddb)
- [https://www.freecodecamp.org/news/how-indexeddb-works-for-beginners/](https://www.freecodecamp.org/news/how-indexeddb-works-for-beginners/)
- [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/)
