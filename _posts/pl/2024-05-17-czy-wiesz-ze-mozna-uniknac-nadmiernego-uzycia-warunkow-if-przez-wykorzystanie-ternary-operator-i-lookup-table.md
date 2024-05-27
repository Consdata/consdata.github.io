---
layout:    post
title:     "Czy wiesz, że można uniknąć nadmiernego użycia warunków 'if' przez wykorzystanie ternary operator i lookup table?"
date:      2024-05-17T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2024-05-17-czy-wiesz-ze-mozna-uniknac-nadmiernego-uzycia-warunkow-if-przez-wykorzystanie-ternary-operator-i-lookup-table/code.webp
description: Niektórzy uważają, że liczba warunków `if/else` w kodzie powinna być minimalna, co oznacza, że pojedyncze instrukcje `if/else` należy zastępować operatorem ternarnym. Duża liczba warunków `if/else` skutkuje skomplikowaną strukturą i może przyprawić programistów o zawrót głowy...
tags:
- javascript
---

Niektórzy uważają, że liczba warunków `if/else` w kodzie powinna być minimalna, co oznacza, że pojedyncze instrukcje `if/else` należy zastępować operatorem ternarnym. Duża liczba warunków `if/else` skutkuje skomplikowaną strukturą i może przyprawić programistów o zawrót głowy.

Załóżmy, że mamy kod, który na podstawie wprowadzonej wartości w polu wejściowym (`<input>`), a dokładnie marki samochodu, wyświetla jego opis.

## Scenariusz z if/else
```javascript
const setCarDescriptionBasedOnBrand = () => {
  const brandInput = document.getElementById('brandInput').value;
 
    let carDesc = '';
   
    if(brandInput === 'toyota') {
        carDesc = 'Toyota - Reliable and Fuel Efficient'
    } else if(brandInput === 'ford') {
        carDesc = 'Ford - American Toughness';
    } else if(brandInput === 'honda') {
        carDesc = 'Honda - Innovative and Efficient';
    } else if(brandInput === 'bmw') {
        carDesc = 'BMW - Ultimate Driving Machine';
    } else {
        carDesc = 'Unknown Car Brand';
    }
 
  document.getElementById('carDescription').innerText = carDesc;
};
```
Choć `if/else` załatwia sprawę, to jesteśmy obciążeni dużą ilością powtarzalnej logiki porównującej `brandInput` i przypisywanym `carDesc`.

## Scenariusz switch-case

Alternatywą dla `if/else` jest użycie `switch-case`. Lepiej pasuje do koncepcji tego, co próbujemy osiągnąć.
```javascript
const setCarDescriptionBasedOnBrandSwitchCase = () => {
    const descByBrand = (brand) => {
        switch (brand) {
            case 'toyota': return 'Toyota - Reliable and Fuel Efficient';
            case 'ford': return 'Ford - American Toughness';
            case 'honda': return 'Honda - Innovative and Efficient';
            case 'bmw': return 'BMW - Ultimate Driving Machine';
            default: return 'Unknown Car Brand';
        }
    };
    const brandInputValue = document.getElementById('switchCaseBrandInput').value;
    const carDesc = descByBrand(brandInputValue);
    document.getElementById('carDescription').innerText = carDesc;
};
```
Kod jednak nadal jest dość złożony i mało czytelny. Czy da się tego uniknąć? Tak! Rozważmy kolejny scenariusz.

## Scenariusz lookup table

Stwórzmy obiekt przechowujący nazwy marek samochodowych jako klucze i opisy marek jako wartości. Dzięki temu będziemy mogli uzyskać opis marki, korzystając z notacji `obiekt[klucz]`. Dodatkowo dodajemy wartość domyślną, aby obsłużyć scenariusz, kiedy klucz nie zostanie znaleziony.
```javascript
const carBrandsDesctipion = {
    'toyota'   : 'Toyota - Reliable and Fuel Efficient',
    'ford'  : 'Ford - American Toughness',
    'honda' : 'Honda - Innovative and Efficient',
    'bmw'   : 'BMW - Ultimate Driving Machine',
    'default': 'Unknown Car Brand'
};
 
const setCarDescription = () => {
  const brandName = document.getElementById('brandInput').value;
    document.getElementById('carDescription').innerText = carBrandsDesctipion[brandName]
        ? carBrandsDesctipion[brandName]
        : carBrandsDesctipion['default'];
};
```
Mamy kod wykorzystujący lookup table i operator ternarny. Jest on znacznie bardziej zwięzły i czytelniejszy niż `if/else` i `switch-case`. Dodatkowo zwiększyliśmy łatwość utrzymania kodu i zmniejszyliśmy jego złożoność, ponieważ jest tylko jedno sprawdzenie logiczne dla domyślnego rozwiązania awaryjnego.

Takim samym sposobem możemy obsłużyć bardziej skomplikowany przypadek wykorzystujący operatory porównania.

Przykład dla `if/else`:
```javascript
const classifyEngine = (horsepower) => {
  if (horsepower >= 500) {
    return "High Performance";
  } else if (horsepower >= 400) {
    return "Strong";
  } else if (horsepower >= 300) {
    return "Moderate";
  } else if (horsepower >= 200) {
    return "Basic";
  } else {
    return "Low";
  }
};
```
Jak można zauważyć, operatory logiczne ciągle się powtarzają.

Wyodrębnijmy więc nasze dane do tablicy obiektów. Umożliwi nam to wyszukanie w tablicy obiektu, który spełnia jeden warunek z wykorzystaniem operatora "większe lub równe".
```javascript
const engineClasification = [
    {minHorsepower: 500, desc: 'High Performance'},
    {minHorsepower: 400, desc: 'Strong'},
    {minHorsepower: 300, desc: 'Moderate'},
    {minHorsepower: 200, desc: 'Basic'},
    {minHorsepower: 0,  desc: 'Low'}
];
 
const classifyEngine = (horsepower) => {
    const clasification = engineClasification.find(
        (engine) => horsepower >= engine.minHorsepower
    );
 
    return clasification.desc;
};
```

## Playground
[https://jsfiddle.net/wstolarski_consdata/v57mrdfw/](https://jsfiddle.net/wstolarski_consdata/v57mrdfw/)
