---
layout:    post
title:     "Czy wiesz, co to Beacon API?"
date:      2022-08-09 06:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    dmejer
image:     /assets/img/posts/2022-08-09-beacon-api/thumbnail.webp
description: "Beacon API pozwala na wysyłanie asynchronicznych, nieblokujących żądań. W odróżnieniu od XMLHttpRequest czy Fetch API, przeglądarka gwarantuje wykonanie żądań, nawet gdy użytkownik zamknie przeglądarkę. Idealnie nadaje się do wysyłania analityk czy logów z przeglądarki na serwer."
tags:
- javascript
- ecmascript
- ES2021
- Beacon API
---

`Beacon API` pozwala na wysyłanie asynchronicznych, nieblokujących żądań. W odróżnieniu od `XMLHttpRequest` czy `Fetch API`, przeglądarka gwarantuje wykonanie żądań, nawet gdy użytkownik zamknie przeglądarkę. Idealnie nadaje się do wysyłania analityk czy logów z przeglądarki na serwer.

## Jak wygląda API

API składa się z jednej metody:

```javascript
navigator.sendBeacon(url, data?);
```

Beacon wysyła żądanie `POST`, w parametrze data można przekazać `FormData`, `Blob`, `ArrayBuffer`, `ArrayBufferView` albo `URLSearchParams`. SendBeacon zwraca true, jeżeli przeglądarka z sukcesem dodała żądanie do kolejki wysyłek. Odpowiedź na żadanie jest pomijana.

Przykład wysłania JSON jako Blob:

```javascript
const blob = new Blob([JSON.stringify({wolna: 'ukraina'})], {type : 'application/json'})
navigator.sendBeacon('/api/log', blob);
```

Zobacz więcej:
* [https://w3c.github.io/beacon/](https://w3c.github.io/beacon/)
* [https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
* [https://caniuse.com/beacon](https://caniuse.com/beacon)