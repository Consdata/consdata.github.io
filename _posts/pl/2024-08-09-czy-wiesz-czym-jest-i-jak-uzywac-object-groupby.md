---
layout:    post
title:     Czy wiesz, czym jest i jak używać Object.groupBy()?
description: ""
date:      2024-08-09T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-08-09-czy-wiesz-czym-jest-i-jak-uzywac-object-groupby/thumbnail.webp
tags:
- javascript
---

`Object.groupBy()` to statyczna metoda pozwalająca grupować elementy.
Jej składnia jest następująca:
```javascript
Object.groupBy(items, callbackFn)
```
gdzie `items` jest listą, którą będziemy grupować, a `callbackFn` jest funkcją, którą będziemy wywoływać dla każdego elementu z listy. Funkcja ta będzie określać grupę, do której element ma trafić na nowej liście.
Jako przykład posłuży nam poniższa lista książek:
```javascript
const books = [
  {title: '1984', genre: 'Dystopian fiction', year: 1949},
  {title: 'To Kill a Mockingbird', genre: 'Classic literature', year: 1960},
  {title: 'The Great Gatsby', genre: 'Modernist novel', year: 1925},
  {title: 'The Catcher in the Rye', genre: 'Classic literature', year: 1951},
  {title: 'Pride and Prejudice', genre: 'Romance novel', year: 1813}
];
```

Chcąc stworzyć nową listę, w której pozycje będą pogrupowane gatunkami, wystarczy wywołać `Object.groupBy` w następujący sposób:
```javascript
Object.groupBy(books, ({ genre }) => genre)

// wynik:
{
  "Dystopian fiction": [
      {"title": "1984", "genre": "Dystopian fiction", "year": 1949},
  ],
  "Classic literature": [
      {"title": 'To Kill a Mockingbird', "genre": 'Classic literature', "year": 1960},
      {"title": 'The Catcher in the Rye', "genre": 'Classic literature', "year": 1951},
  ],
  "Romance novel": [
      {"title": 'Pride and Prejudice', "genre": 'Romance novel', "year": 1813}
  ], 
  "Modernist novel": [
      {"title": "The Great Gatsby", "genre": "Modernist novel", "year": 1925}
  ]
}
```

Bardziej zaawansowanym przykładem może być podział listy na grupy obejmujące nowe książki (wydane po 1900 roku) i stare (pozostałe):
```javascript
Object.groupBy(books, ({year}) => year > 1900 ? "new" : "old")

// wynik:
{
  "new": [
      {"title": "1984", "genre": "Dystopian fiction", "year": 1949},
      {"title": "The Great Gatsby", "genre": "Modernist novel", "year": 1925},
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