---
layout:    post
title:     Czy wiesz czym jest i jak używać Object.groupBy()?
description: ""
date:      2024-08-09T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-09-09-czy-wiesz-czym-jest-i-jak-uzywac-object-groupby/thumbnail.webp
tags:
- javascript
---

`Object.groupBy()` to statyczna metoda pozwalająca grupować ze sobą elementy.
Jej składnia jest następująca:
```javascript
Object.groupBy(items, callbackFn)
```
gdzie `items` jest listą, którą będziemy grupować, a `callbackFn` jest funkcją, którą będziemy wywoływać dla każdego elementu z listy i będzie ona określać grupę, do której element ma trafić na nowej liście.
W przykładach będziemy bazować na poniższej liście książek:
```javascript
const books = [
  {title: '1984', genre: 'Dystopian fiction', year: 1949},
  {title: 'To Kill a Mockingbird', genre: 'Classic literature', year: 1960},
  {title: 'The Great Gatsby', genre: 'Dystopian fiction', year: 1925},
  {title: 'The Catcher in the Rye', genre: 'Classic literature', year: 1951},
  {title: 'Pride and Prejudice', genre: 'Romance novel', year: 1813}
];
```

Jeżeli chcielibyśmy stworzyć nową listę, w której pozycje będą pogrupowane gatunkami wystarczy wywołać `Object.groupBy` w następujący sposób:
```javascript
Object.groupBy(books, ({ genre }) => genre)

// wynik:
{
  "Dystopian fiction": [
      {"title": "1984", "genre": "Dystopian fiction", "year": 1949},
      {"title": "The Great Gatsby", "genre": "Dystopian fiction", "year": 1925}
  ],
  "Classic literature": [
      {"title": 'To Kill a Mockingbird', "genre": 'Classic literature', "year": 1960},
      {"title": 'The Catcher in the Rye', "genre": 'Classic literature', "year": 1951},
  ],
  "Romance novel": [
      {"title": 'Pride and Prejudice', "genre": 'Romance novel', "year": 1813}
  ]
}
```

Bardziej zaawansowany przykład, w którym dzielimy listę na grupę książek nowych (wydanych po 1900 roku) i starych (pozostałych):
```javascript
Object.groupBy(books, ({year}) => year > 1900 ? "new" : "old")

// wynik:
{
  "new": [
      {"title": "1984", "genre": "Dystopian fiction", "year": 1949},
      {"title": "The Great Gatsby", "genre": "Dystopian fiction", "year": 1925},
      {"title": 'To Kill a Mockingbird', "genre": 'Classic literature', "year": 1960},
      {"title": 'The Catcher in the Rye', "genre": 'Classic literature', "year": 1951},
  ],
  "old": [
      {"title": 'Pride and Prejudice', "genre": 'Romance novel', "year": 1813}
  ]
}
```

## Przydatne linki
- Kompatybilność z przeglądarkami: [https://caniuse.com/?search=Object.groupBy](https://caniuse.com/?search=Object.groupBy)
- Dokumentacja: [https://developer.mozilla.org/.../Object/groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)