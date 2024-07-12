---
layout:    post
title:     Czy wiesz, czym są container queries?
description: ""
date:      2024-08-23T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: ptatarski
image: /assets/img/posts/2024-08-23-czy-wiesz-czym-sa-container-queries/thumbnail.webp
tags:
- css
- container queries
---

*Container queries* to mechanizm analogiczny do *media queries* działający na elementach DOM a nie parametrach przeglądarki. Pozwala odpytać o parametry kontenera i względem tych parametrów, ostylować element w nim zawarty.

Aby oznaczyć element jako wspomniany wcześniej kontener, należy ustawić mu regułę `container-type`. Do dyspozycji mamy tutaj 3 wartości:
- `size` - podczas stylowania względem tego kontenera będzie brana zarówno szerokość jak i wysokość elementu oraz jego style,
- `inline-size` - podczas stylownia będzie brany pod uwagę tylko wymiar inline-size (czyli szerokość przy domyślnie ustawionym [writing-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode)),
- `normal` - podczas stylowania będą brane pod uwagę jedynie style kontenera.

Mając tak zdefiniowaną strukturę HTML:
```html
<div class="container">
    <div class="intermediate-container">
        <div class="box"></div>
    </div>
</div>
```
oraz następujące style CSS:
```css
.container {
  container-type: size;
  height: 500px;
  width: 75vw;
  background: yellowgreen;
}
 
.box {
  height: 100px;
  width: 100px;
  background: yellow;
}
```
element `.box` może zostać ostylowany względem aktualnej szerokości kontenera. Przykładowo:
```css
@container parent (min-width: 400px) {
  .box {
    background: red;
  }
}
```
W tym przypadku, gdy kontener będzie miał rozmiar większy niż 400px element `box` pozostanie żółty, jednak gdy szerokość kontenera przekroczy tę granicę, kolor elementu `box` zmieni się na czerwony.

### Co jeżeli jednak mamy wiele zagnieżdżonych kontenerów i chcemy odwołać się do któregoś konkretnego?

Domyślnie pod uwagę brany jest kontekst najbliższego kontenera, jednak można to zmienić poprzez ustawienie reguły `container-name` z wybraną przez nas nazwą kontenera. Przykładowo:
```css
.container {
  container-type: size;
  container-name: parent-container
}
 
@container parent-container (min-width: 700px) {
    /* ... */
}
```
Dzięki tej regule możemy odwoływać się do kontenerów, które są wyżej niż najbliższy naszemu elementowi.


Przykład w wersji wykonywalnej: [https://codesandbox.io/s/css-container-queries-complete-example](https://codesandbox.io/s/css-container-queries-complete-example-one-forked-4546kz)





