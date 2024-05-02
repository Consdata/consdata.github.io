---
layout:    post
title:     Czy wiesz, czym jest i jak działa Scroll Snap?
description: Scroll-snap-type to atrybut CSS, który podczas scrollowania powoduje, że scroll nie zatrzymuje się w miejscu gdzie przestaliśmy scrollować, a przylega do elementu, który mu wskażemy.
date:      2024-06-14T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-06-14-czy-wiesz-czym-jest-i-jak-dziala-scroll-snap/mouse.webp
tags:
- css
---

`Scroll-snap-type` to atrybut CSS, który podczas scrollowania powoduje, że scroll nie zatrzymuje się w miejscu gdzie przestaliśmy scrollować, a przylega do elementu, który mu wskażemy.

Aby skorzystać z tego zachowania najpierw na kontenerze, który scrollujemy, ustawiamy atrybut `scroll-snap-type`:
```css
.container {
    scroll-snap-type: x;
}
```
`x` oznacza, że będziemy zatrzymywać się na osi x (parametr może też przybierać wartości: `y`, `block`, `inline`, `both`, więcej szczegółów w [dokumentacji](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)).

Następnie w dzieciach tego kontenera ustawiamy atrybut `scroll-snap-align`, który określa czy scroll ma się zatrzymać na początku, czy na końcu elementu:
```css
.element {
    scroll-snap-align: start;
}
```

## Przydatne linki
- Działający przykład: [https://codepen.io/Porkite/pen/jOpQqEG](https://codepen.io/Porkite/pen/jOpQqEG)
- Kompatybilność na różnych przeglądarkach: [https://caniuse.com/?search=scroll-snap](https://caniuse.com/?search=scroll-snap)
- Dokumentacja scroll-snap-type: [https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)
- Dokumentacja scroll-snap-align: [https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-align)