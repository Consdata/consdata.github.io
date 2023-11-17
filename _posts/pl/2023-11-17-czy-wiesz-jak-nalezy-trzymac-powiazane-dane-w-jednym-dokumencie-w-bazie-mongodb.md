---
layout:    post
title:     "Czy wiesz, jak należy trzymać powiązane dane w jednym dokumencie w bazie MongoDB?"
date:      2023-11-17T12:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bmitan
image: /assets/img/posts/2023-11-17-czy-wiesz-jak-nalezy-trzymac-powiazane-dane-w-jednym-dokumencie-w-bazie-mongodb/data.webp
tags:
- mongodb
- subset
- extended reference
- bazy danych
---

Ważna zasada przy projektowaniu schematu w MongoDB mówi, żeby dane, do których dostęp jest zazwyczaj wspólny, przechowywać razem. Jest to całkowicie sprzeczne z koncepcją normalizacji – dzieleniem danych tak, żeby uniknąć duplikowania i ograniczyć potrzebne miejsce na dane – czyli ze wszystkim, co znamy z relacyjnych baz danych.

Warto podkreślić, że odpowiednikiem JOINów w zapytaniu SQL jest operacja `$lookup`, która pozwala łączyć dane z kilku kolekcji. Operacja ta jest jednak wolna i kosztowna, dlatego jest wskazana tylko dla rzadko wykonywanych zapytań, na które można długo zaczekać lub zapytań analitycznych, które można wykonać bez limitu czasu (np. na osobnym przeznaczonym do takich zapytań węźle). Dla zapytań, które mają być wykonywane często i oczekujemy ich wyników szybko, istotne będzie odpowiednie zamodelowanie danych. Pomóc w tym mogą m.in. wzorce *Subset* i *Extended Reference*.

Wyobraźmy sobie, że tworzymy serwis z książkami. Dla każdego autora chcemy szybko zaprezentować jego najnowsze książki (tytuł, rok wydania i zdjęcie okładki bez pozostałych szczegółowych informacji), cytaty (nie będzie ich dużo) oraz najnowsze recenzje na jego temat. Mamy więc kolekcję `authors`, kolekcję `books`, kolekcję `comments` i kolekcję `quotes`, ale spróbujmy zamodelować dane trochę inaczej.
Dane w kolekcjach prezentują się następująco:
- *authors*
  ```javascript
  {
    "_id": 234,
    "name": "Robert C. Martin",
    // ...
  }
  ```
- *books*
  ```javascript
  {
    "_id": 123454,
    "name": "Clean Code, A Handbook of Agile Software Craftsmanship",
    "year": 2009,
    "author_id": 234,
    "publisher": "Prentice Hall",
    "img": "https://bookpage/images?id=4567456",
    "isbn13": 9780132350884,
    "isbn10": 9780132350884,
    // ...
    "summary": "..."
  }
  ```
- *comments*
  ```javascript
  {
    "_id": 12454356,
    "author_id": 234,
    "comment_author": "Marek",
    "title": "Great author",
    "text": "I read all his books!",
    "date": "2021-05-26T07:23:12.000Z"
  }
  ```
- *quotes*
  ```javascript
  {
    "_id": 43,
    "author_id": 234,
    "text": "Truth can only be found in one place: the code.",
    "tags": ["programming", "software"]
  }
  ```

Najprostsza sytuacja dotyczy cytatów. Ponieważ cytaty przeglądamy zawsze razem z autorami i nie może być ich zbyt wiele, decydujemy się całkowicie usunąć kolekcję `quotes` i przenieść cytaty jako poddokument do kolekcji `authors`.

Inaczej będzie z komentarzami. Zakładamy, że może być ich wiele, a sam komentarz może być dosyć długi. Nie chcemy przenieść wszystkich komentarzy do dokumentu autora, bo skończymy ze zbyt dużym dokumentem. Zamiast tego podzielimy komentarze w dwie kolekcje - najświeższe dane będziemy przechowywać w dokumencie autora, a starsze w kolekcji `comments`. Taki wzorzec to *Subset Pattern*.

W przypadku najnowszych książek jest podobnie - potrzebujemy na wejście tylko kilku najnowszych książek. Tak naprawdę nie potrzebujemy też wszystkich informacji o tych książkach. Wystarczy tytuł, rok wydania i URL do zdjęcia książki. Będziemy więc nadal trzymać książki w kolekcji `books` i skrócone informacje o najnowszych książkach danego autora w kolekcji `authors`. Zastosowaliśmy właśnie wzorzec *Extended Reference*. Warto zwrócić uwagę, że powoduje to duplikację danych. Są to dane odczytywane często, ale idealna sytuacja to taka, w której nie są często aktualizowane. Musimy zawsze zastanowić się, co zrobić w przypadku aktualizacji dokumentu - w tym przypadku książki. Czy musimy zaktualizować dane również w dokumencie autora? W przypadku tego wzorca strategie są różne. Może to być np. asynchroniczna aktualizacja danych lub zachowanie historycznych danych (nie zawsze aktualizacja ma sens biznesowo). W naszym przypadku trzymamy w kolekcji `authors` dane o książkach, które nie powinny się prawie nigdy zmieniać.

Ostatecznie nasz dokument w kolekcji authors będzie wyglądał tak:
```javascript
{
    "_id": 234,
    "name": "Robert C. Martin",
    // ...,
    "quotes": [
        {
            "_id": 43,
            "author_id": 234,
            "text": "Truth can only be found in one place: the code.",
            "tags": ["programming", "software"]
        }
    ],
    "recent_comments": [
        {
            "_id": 12454356,
            "author_id": 234,
            "comment_author": "Marek",
            "title": "Great author",
            "text": "I read all his books!",
            "date": "2021-05-26T07:23:12.000Z"
        },
        // ...
    ],
    "recent_books": [
        {
            "_id": 123454,
            "name": "Clean Code, A Handbook of Agile Software Craftsmanship",
            "year": "2009",
            "author_id": 234,
            "img": "https://bookpage/images?id=4567456"
        },
        // ...
    ]
}
```

## Subset Pattern

Kiedy stosować?
- mamy w dokumencie dużo rzadko odczytywanych danych,
- możemy podzielić te dane na dane historyczne i bieżące, występują relacje typu 1-N i N-N,
- typowe przykłady to komentarze, recenzje produktu, aktorzy w filmach.

Plusy:
- szybsze odczyty.

Minusy:
- trochę bardziej skomplikowana logika.

## Extended Reference Pattern

Kiedy stosować?
- występują relacje N-1, konieczność zastosowania operacji `$lookup`, za dużo "joinów" i w efekcie problemy z wydajnością,
- typowe przykłady to aplikacja do zarządzania zamówieniami, np. powiązania między zamówieniami, produktami a klientami, zamówieniami a klientami, fakturami a dostawcami i klientami,

Plusy:
- szybsze odczyty.

Minusy:
- duplikacja danych,
- bardziej skomplikowana logika,
- może wystąpić konieczność aktualizacji wielu dokumentów przy aktualizacji danych, które są zduplikowane.

## Przydatne linki:
- [Building with patterns: The Subset Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-subset-pattern)
- [Building with Patterns: The Extended Reference Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern)
- [Schema design anti pattern: Separating Data That is Accessed Together](https://www.mongodb.com/developer/article/schema-design-anti-pattern-separating-data/)