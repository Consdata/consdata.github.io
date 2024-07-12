---
layout:    post
title:     Czy wiesz, jak używać splice w JavaScript?
description: Splice to metoda dostępna dla tablicy. ozwala usunąć, zmienić istniejący element lub dodać nowy element do tablicy.
date:      2024-07-12T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2024-07-12-czy-wiesz-jak-uzywac-splice-w-javascript/code.webp
tags:
- javascript
---
`Splice` to metoda dostępna dla tablicy. Pozwala usunąć, zmienić istniejący element lub dodać nowy element do tablicy.

Przykład usunięcia elementów:
```javascript
const a = [1, 2, 3, 4];
const b = a.splice(1, 1); // usunięcie 1 elementu od indeksu 1
 
// a: [1, 3, 4]
// b: [2]
```

`Splice` modyfikuje pierwotną tablicę i zwraca usunięte elementy.

Przykład dodawania elementów:
```javascript
const a = [1, 2, 3, 4];
const b = a.splice(1, 2, 5, 6); // usunięcie 2 elementów od indeksu 1 i dodanie elementów 5, 6
 
// a: [1, 5, 6, 4]
// b: [2, 3]
```

Istnieje jeszcze metoda `toSpliced`, która nie modyfikuje pierwotnej tablicy:
```javascript
const a = [1, 2, 3, 4];
const b = a.toSpliced(1, 1); // usunięcie 1 elementów od indeksu 1
 
// a: [1, 2, 3, 4]
// b: [1, 3, 4]
```

Przykład dodawania elementów za pomocą `toSpliced`:
```javascript
const a = [1, 2, 3, 4];
const b = a.toSpliced(1, 2, 5, 6); // usunięcie 2 elementów od indeksu 1 i dodanie elementów 5, 6
 
// a: [1, 2, 3, 4]
// b: [1, 5, 6, 4]
```
`toSpliced` nie modyfikuje pierwotnej tablicy, a zwraca nowa zmienioną tablicę.
