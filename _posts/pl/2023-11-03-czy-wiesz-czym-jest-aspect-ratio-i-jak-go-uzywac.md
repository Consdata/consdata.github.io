---
layout:    post
title:     "Czy wiesz, czym jest aspect-ratio i jak go używać?"
date:      2023-11-03T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
description: "Niedawno w przeglądarkach pojawiło się wsparcie dla nowego atrybutu w CSS - aspect-ratio. Jak nazwa sugeruje, służy on do określania proporcji elementu..."
image: /assets/img/posts/2023-11-03-czy-wiesz-czym-jest-aspect-ratio-i-jak-go-uzywac/measure.webp
tags:
- css
- aspect-ratio
---
Niedawno w przeglądarkach pojawiło się wsparcie dla nowego atrybutu w CSS - `aspect-ratio` ([caniuse](https://caniuse.com/mdn-css_properties_aspect-ratio)). Jak nazwa sugeruje, służy on do określania proporcji elementu.

Przyjmuje on dwa parametry oddzielone ukośnikiem:
```css
aspect-ratio: 1 / 2;
```
Określa on stosunek wysokości do szerokości obiektu. Dla podanego wyżej przykładu, jeżeli wysokość ustawimy na 100px to szerokość automatycznie ustawi się na 50px. Jeżeli w stylu zdefiniujemy wysokość i szerokość, wtedy atrybut `aspect-ratio` zostanie zignorowany.

Poniżej przykład, na którym można zaobserwować działanie omawianego parametru:
[https://codepen.io/Porkite/pen/xxPqyzR](https://codepen.io/Porkite/pen/xxPqyzR)