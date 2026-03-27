---
layout:    post
title:     "Czy wiesz, czym jest i jak działa Browserslist?"
date:      2026-03-27T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2026-03-27-czy-wiesz-czym-jest-i-jak-działa-browserslist/thumbnail.webp
description: "Od czasu do czasu każda osoba pracująca nad frontendem natrafia na plik o nazwie `browserslist`. Kto z niego korzysta i na co wpływają dokonywane w nim zmiany?"
tags:
- frontend
- javascript
- angular
---

Od czasu do czasu każda osoba pracująca nad frontendem natrafia na plik o nazwie `browserslist`, który jest mało intuicyjny.
Na pierwszy rzut oka jego zawartość jest czytelna, ale pojawia się pytanie: po co on właściwie istnieje? 
Kto z niego korzysta i jakie skutki mają wprowadzane w nim zmiany?

## Czym jest Browserslist?
Browserslist to **konfiguracja**, z której czytają inne narzędzia i na jej podstawie podejmują decyzje najczęściej związane z **etapem kompilacji**. 
Na przykład:
- jakie polyfille zastosować,
- jaka wersja JS będzie „bezpieczna”,
- które prefiksy dodać do CSS (np. `-webkit-`, `-moz-`).

Sam Browserslist jest tylko biblioteką, która czyta informacje z caniuse, a następnie przekazuje je dalej do innych narzędzi, 
które ich potrzebują.

## Przykładowy plik browserslist
Przejdźmy teraz do tego, jak wygląda przykładowy plik konfiguracyjny i omówmy sobie, z czego się składa.
Poniżej znajduje się przykład konfiguracji z często spotykanymi parametrami:

```text
last 2 versions
> 0.5%
Firefox ESR
not dead
last 5 iOS major versions
```

Każda linia pliku to informacja o wspieraniu lub niewspieraniu konkretnych urządzeń i przeglądarek.

## Omówienie linia po linii
Przejdźmy przez każdy z wpisów i wyjaśnijmy, co on oznacza:

### last 2 versions
Są to dwie ostatnie wersje każdej wspieranej przeglądarki. Dla Google Chrome oznacza to aktualnie wersje 144 i 143.
### > 0.5%
Przeglądarki z ponad 0,5% udziału w rynku. 
Informacje o rynku pochodzą z różnych źródeł, są agregowane i przygotowywane później przez caniuse i następnie udostępniane.
### Firefox ESR
Najnowsza wersja Firefox Extended Support Release.
### not dead
Wyklucza przeglądarki, które nie były aktualizowane przez ostatnie dwa lata.
### last 5 iOS major versions
Wyklucza wszystko z wyjątkiem 5 ostatnich wersji systemu iOS, czyli od 15 do 26, uwzględniając przeskoki w numeracji kolejnych wersji.
Jeżeli nie umieścilibyśmy tej informacji w parametrze major (last 5 iOS major versions), to wynikiem byłyby wersje: 26.2, 26.1, 26.0, 18.7, 18.6.
## Angular 20 i plik .browserslistrc

Warto jeszcze wspomnieć o tym, że od wersji Angulara 20 pojawił się nowy plik o nazwie `.browserslistrc`, który pełni podobną funkcję.
Jest on jednak bardziej szczegółowy i zwykle polega na określaniu **konkretnych wersji przeglądarek**, 
żeby lepiej panować nad stabilnością i powtarzalnością buildów.

W praktyce Angular najpierw próbuje znaleźć `.browserslistrc`, a jeśli go nie ma, 
próbuje skorzystać z konfiguracji `browserslist`.

## Gdzie szukać więcej (dokumentacja)
- [Składnia i przykłady konfiguracji](https://github.com/browserslist/browserslist)
- [Biblioteka Browserslist (npm)](https://www.npmjs.com/package/browserslist)
- [Dane Can I Use (caniuse-lite)](https://www.npmjs.com/package/caniuse-lite)
