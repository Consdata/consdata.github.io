---
layout:    post
title:     Czy wiesz, że już nie musisz klonować tablic, by wykonać na nich typowe operacje?
description: "Metody toReversed(), toSplice(), toSorted() oraz with() stanowią grupę metod operujących na tablicach. Rozszerzają tradycyjne operacje, pozwalając na uzyskanie zmodyfikowanych kopii tablic, na których zostały wywołane."
date:      2024-09-06T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: mbartosik
image: /assets/img/posts/2024-09-13-czy-wiesz-ze-nie-musisz-juz-klonowac-tablic-by-wykonac-na-nich-typowe-operacje/thumbnail.webp
tags:
- javascript
---
Metody `toReversed()`, `toSplice()`, `toSorted()` oraz `with()` stanowią grupę metod operujących na tablicach. Rozszerzają tradycyjne operacje, pozwalając na uzyskanie zmodyfikowanych kopii tablic, na których zostały wywołane.
W przeciwieństwie do tradycyjnych metod takich jak `sort()`, `splice()` czy `reverse()`, metody te nie modyfikują tablic, na których zostały wywołane.

### toReversed()
Metoda `toReversed()` odpowiada `reverse()`. Zwraca nową tablicę z elementami w odwrotnej kolejności.
```javascript
const a = [3, 1, 5, 6];
const b = Array.from(a).reverse();  // b: [6, 5, 1, 3]
const c = a.toReversed();           // c: [6, 5, 1, 3]
```

### toSorted()
Metoda `toSorted()` odpowiada `sort()`. Zwraca nową posortowaną tablicę.
```javascript
const a = [3, 1, 5, 6];
const b = Array.from(a).sort();     // b: [1, 3, 5, 6]
const c = a.toSorted();             // c: [1, 3, 5, 6]
```

### toSpliced()
Metoda `toSpliced()` odpowiada `splice()`. Zwraca nową tablicę z usuniętymi, zmienionymi lub nowymi elementami.
```javascript
const a = [3, 1, 5, 6];
const b = Array.from(a);
b.splice(1, 1);                     // b: [3, 5, 6]
const c = a.toSpliced(1, 1);        // c: [3, 5, 6]
```

### with()
Metoda `with()` odpowiada notacji `[<index>]`. Zwraca nową tablicę ze zmienionym elementem pod wskazanym indeksem.
```javascript
const a = [3, 1, 5, 6];
const b = Array.from(a);
b[2] = 9;                           // b: [1, 3, 9, 6]
const c = a.with(2, 9);             // c: [1, 3, 9, 6]
```

## Przydatne linki
- Wykonywalny przykład: [https://playcode.io/1833099](https://playcode.io/1833099)
- Kompatybilność z przeglądarkami: [Array.toReversed](https://caniuse.com/?search=Array.toReversed), [Array.toSorted](https://caniuse.com/?search=Array.toSorted), [Array.toSpliced](https://caniuse.com/?search=Array.toSpliced), [Array.with](https://caniuse.com/?search=Array.with)
- Dokumentacja: [Array.toReversed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed), [Array.toSorted](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted), [Array.toSpliced](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced), [Array.with](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with)