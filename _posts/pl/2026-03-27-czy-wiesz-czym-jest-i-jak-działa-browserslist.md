---
layout:    post
title:     "Czy wiesz, czym jest i jak działa Browserslist?"
date:      2026-03-16T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: pgrobelny
image: /assets/img/posts/2026-03-27-czy-wiesz-czym-jest-i-jak-działa-browserslist/thumbnail.webp
description: "Browserslist to niepozorny plik, który steruje tym, jakie przeglądarki wspiera Twoja aplikacja — a pośrednio: jak budujesz CSS i JavaScript. Zobacz, kto z niego korzysta i co zmienia jedna linijka konfiguracji."
tags:
- frontend
- javascript
- angular
---

Od czasu do czasu każda osoba pracująca nad frontendem natrafia na plik o nazwie `browserslist`. Jest mało intuicyjny: 
po otwarciu widać listę warunków, ale… po co to jest? Kto z tego korzysta i jaki wpływ mają zmiany w środku?

Browserslist to **konfiguracja**, z której czytają inne narzędzia i na jej podstawie podejmują decyzje ważne najczęściej **na etapie kompilacji** aplikacji. 
Na przykład:
- jakie polyfille zastosować,
- jaka wersja JavaScript będzie „bezpieczna”,
- które prefiksy CSS dodać (np. `-webkit-`, `-moz-`).

Sama biblioteka Browserslist to „czytnik” konfiguracji + logika selekcji przeglądarek. Źródłem danych o wsparciu funkcji i popularności jest paczka `caniuse-lite`, 
budowana na bazie danych Can I Use.

## Przykładowy plik browserslist
Przejdźmy teraz do tego, jak wygląda przykładowy plik konfiguracyjny i omówmy sobie, z czego się składa.
Poniżej przykład konfiguracji z często spotykanymi parametrami:

```text
last 2 versions
> 0.5%
Firefox ESR
not dead
last 5 iOS major versions
```

Każda linia to informacja o **wspieraniu** (albo wykluczaniu) konkretnych przeglądarek/urządzeń.

## Omówienie linia po linii
Przejdźmy sobie po każdym wpisie i wyjaśnijmy co on oznacza:

### last 2 versions

Oznacza: **dwie ostatnie wersje każdej wspieranej przeglądarki**.

Przykładowo, jeśli w momencie budowania danych najnowszy Chrome ma numer 144, to warunek obejmie Chrome 144 i 143 (analogicznie dla innych). 

### > 0.5%

Oznacza: przeglądarki, które mają **ponad 0,5% udziału w rynku**.

Te dane nie pochodzą z Twoich statystyk. Są agregowane z różnych źródeł i udostępniane przez Can I Use. 

### Firefox ESR

Oznacza: **najnowszą wersję Firefox Extended Support Release**.

To częsty wymóg w środowiskach enterprise, gdzie przeglądarki bywają aktualizowane wolniej, ale wciąż trzymają się wspieranej gałęzi.

### not dead

Oznacza: wyklucza przeglądarki uznane za „martwe”, czyli takie, które **nie były aktualizowane przez ostatnie 2 lata**.

### last 5 iOS major versions

Oznacza: zostawia **tylko 5 ostatnich głównych wersji iOS**.

Słowo kluczowe `major` jest tu ważne. Bez niego (`last 5 iOS versions`) wynik mógłby obejmować „punktowe” wersje, np. `26.2`, `26.1`, `26.0`, `18.7`, `18.6` — czyli niekoniecznie to, co masz na myśli, kiedy mówisz „5 ostatnich wersji”.

## Angular 20 i plik .browserslistrc

Warto jeszcze wspomnieć, że od wersji Angulara 20 pojawił się nowy plik o nazwie `.browserslistrc` o podobnej roli. 
Jest on jednak bardziej szczegółowy i zwykle polega na określaniu **konkretnych wersji przeglądarek**, żeby lepiej panować nad stabilnością i powtarzalnością buildów.

W praktyce Angular (Angular CLI) najpierw próbuje znaleźć `.browserslistrc`, a jeśli go nie ma, próbuje skorzystać z konfiguracji `browserslist`.

## Gdzie szukać więcej (dokumentacja)
- [Składnia i przykłady konfiguracji](https://github.com/browserslist/browserslist)
- [Biblioteka Browserslist (npm)](https://www.npmjs.com/package/browserslist)
- [Dane Can I Use (caniuse-lite)](https://www.npmjs.com/package/caniuse-lite)
