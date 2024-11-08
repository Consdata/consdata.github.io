---
layout:    post
title:     Czy wiesz, jak używać slice w JavaScript?
description: ""
date:      2024-11-22T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2024-11-22-czy-wiesz-jak-uzywac-slice-w-javascript/thumbnail.webp
tags:
- javascript
---
`Slice` zwraca płytką kopię obiektów w `Array`. Płytka kopia obiektu to kopia, która posiada te same referencje na wartości. Zmiana w skopiowanym obiekcie spowoduje zmianę pierwotnego obiektu.

`Slice` można sparametryzować, podając indeks startu oraz końca.
```javascript
slice()
slice(start)
slice(start, end)
```

Przykład na liczbach:
```javascript
const listA = [1, 2, 3, 4];
 
const listB = listA.slice(1, 3);
// listB: [2, 3]
 
listB.push(5);
// listA: [1, 2, 3, 4]
// listB: [2, 3, 5]
 
const listC = listA.slice(2);
// listC: [3, 4]
```

Przykład ze złożonym obiektem:
```javascript
const books = [
  {
    name: 'Frankenstein',
    author: 'Mary Shelley',
  },
  {
    name: 'Dracula',
    author: 'Bram Stoker',
  },
  {
    name: 'The War of the Worlds',
    author: 'Herbert George Wells',
  },
];  const booksSliced = books.slice(1, 2);
// booksSliced: [{author: "Bram Stoker", name: "Dracula"]
 
booksSliced[0].name = 'The Mystery of the Sea';
// booksSliced: [{author: "Bram Stoker", name: "The Mystery of the Sea"]
// boooks: [{author: "Mary Shelley", name: "Frankenstein",
//          {author: "Bram Stoker", name: "The Mystery of the Sea"},
//          {author: "Herbert George Wells", name: "The War of the Worlds"}]
```

W przypadku obiektów należy pamiętać, że slice tworzy płytką kopię obiektów. Modyfikacja obiektu spowoduje zmianę również na pierwotnej liście.

## Przydatne linki
- Wykonywalny kod: [https://js-k8u73q.stackblitz.io](https://js-k8u73q.stackblitz.io)