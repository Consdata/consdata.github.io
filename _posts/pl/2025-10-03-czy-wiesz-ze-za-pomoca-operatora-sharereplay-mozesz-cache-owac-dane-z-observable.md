---
layout:    post
title:     Czy wiesz, że za pomocą operatora shareReplay możesz cache'ować dane z observable?
description: ""
date:      2025-10-03T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: ptatarski
image: /assets/img/posts/2025-10-03-czy-wiesz-ze-za-pomoca-operatora-sharereplay-mozesz-cache-owac-dane-z-observable/thumbnail.webp
tags:
- angular
- rxjs
- observable
---

Często zdarza się, że nie chcemy za każdym razem ponownie wykonywać całej logiki z danego *Observable* — 
zamiast tego wolimy przechować jego wynik w pamięci. W Angularze (i ogólnie w RxJS) możemy to zrobić za pomocą operatora **`shareReplay`**.

## Czym jest shareReplay?
Operator `shareReplay` (tak jak operator `share`) pozwala na konwersję z *cold* do *hot* observable, 
tak aby każda subskrypcja korzystała z tej samej emisji observable. Dodatkowo dane są zapisywane w wewnętrznym **ReplaySubject** 
(w przeciwieństwie do operatora share), przez co każda nowa subskrypcja dostaje ostatnią wyemitowaną wartość (lub wartości jeżeli `bufferSize > 1`).

## Przykład użycia
W przykładzie poniżej generujemy losową liczbę. Normalnie przy każdej subskrypcji otrzymalibyśmy nowy wynik,
ale dzięki `shareReplay` obie subskrypcje dostają dokładnie tę samą wartość.
```typescript
const source$: Observable<number> = of(Math.round(Math.random() * 1000))
    .pipe(shareReplay());
source$.subscribe((x: number) => console.log('s1: ', x));
source$.subscribe((x: number) => console.log('s2: ', x));
```
W efekcie w konsoli pojawi się ta sama liczba w obu subskrypcjach, np.: 
```shell
s1:  742
s2:  742
```
## Opcje konfiguracji
Operator `shareReplay` posiada także dodatkowe opcje do skonfigurowania.
- `bufferSize`  - określa wielkość wewnętrznego ReplaySubject (domyślnie przechowuje ostatnią wartość),
- `refCount`  - określa, czy w momencie, gdy liczba subskrybentów wyniesie 0 shareReplay ma odsubskrybować się od źródłowego observable, co spowoduje wyczyszczenie cache (domyślnie false),
- `windowTime`  - ograniczenie czasu przechowywanych wartości (domyślnie nie ogranicza).


### Przykład z dodatkowymi opcjami konfiguracji
Załóżmy, że chcemy cache’ować więcej niż jedną wartość i dodatkowo kontrolować czas ich przechowywania.
```typescript
shareReplay({ bufferSize: 3, refCount: true, windowTime: 500 })
```
- zostaną umieszczone w buforze 3 ostatnie wartości,
- każda z osobna będzie miała czas życia ustawiony na pół sekundy,
- w momencie, gdy nie będzie żadnej aktywnej subskrypcji, bufor zostanie wyczyszczony.

### Przydatne linki
[StackBlitz - Przykład interaktywny](https://stackblitz.com/edit/rxjs-ewsunmdz?file=index.ts)

[Rxjs - Oficjalna dokumentacja](https://rxjs.dev/api/index/function/shareReplay)

[Github - Kod źródłowy](https://github.com/ReactiveX/rxjs/blob/b25db9f369b07f26cf2fc11714ec1990b78a4536/src/internal/operators/shareReplay.ts#L26-L37)