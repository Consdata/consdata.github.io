---
layout:    post
title:     "Czy wiesz czym .includes() różni się od .some()?"
date:      2023-12-15T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2023-12-15-czy-wiesz-czym-include-rozni-sie-od-some/thumbnail.webp
description: "Jeśli nie wiesz, to zapraszamy do przeczytania artykułu :)"
tags:
- javascript
---

`includes()` pozwala nam sprawdzić, czy element Y znajduje się w tablicy, np.:
```javascript
const zbior = [1,2,3,4,5,6,7];
const wynik = zbior.includes(3);
console.log(wynik); // true, 3 znajduje się w zbiorze liczb
```

`includes()` porównuje obiekty przez referencje, świetnie sprawdzi się w prostych typach, ale przy obiektach może nie zadziałać zgodnie z oczekiwaniem, np.:
```javascript
const bogurodzica = {name: 'Bogurodzica'};
const songs = [bogurodzica, {name: 'Cicha noc'}, {name: 'Lulajże'}];
 
const wynik = songs.includes({name: 'Bogurodzica'});
console.log(wynik); // false, jest to inny obiekt
 
const wynikRef = songs.includes(bogurodzica);
console.log(wynikRef); // true
```

Rozwiązaniem tego problemu jest użycie funkcji `some(fn)`. Iteruje ona po elementach i sprawdza warunek (`fn`) podany dla konkretnego elementu. Funkcja zwróci `true`, gdy dowolny element spełni warunek lub `false`, gdy żaden element nie pasuje do warunku, np.:
```javascript
const songs = [{name: 'Bogurodzica'}, {name: 'Cicha noc'}, {name: 'Lulajże'}];
 
const wynik = songs.some((song) => song.name === 'Bogurodzica');
console.log(wynik); // true
 
const brak = songs.some((song) => song.name === 'Master of puppets');
console.log(brak); // false
```
Miłego przeszukiwania tablic!

