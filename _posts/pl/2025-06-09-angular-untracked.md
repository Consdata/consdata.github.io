---
layout: post
title: "Czy wiesz, do czego służy untracked w Angular?"
description: ""
date: 2025-08-01T13:23:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2025-06-09-angular-untracked/thumbnail.webp
tags:
  - angular
---

W bibliotekach opartych na reaktywnych sygnałach, takich jak Angular Signals, 
każda zmiana wartości sygnału używanego w funkcjach `computed()` lub `effect()` powoduje automatyczną rekalkulację lub ponowne wykonanie efektu. 
Dzięki temu aplikacja utrzymuje spójny stan i dynamicznie reaguje na zmiany danych.
W niektórych sytuacjach jednak warto pobrać wartość sygnału bez uruchamiania reakcji. 
Można to osiągnąć za pomocą funkcji `untracked()`, która pozwala na odczyt wartości sygnału z pominięciem mechanizmu śledzenia zależności.

```typescript
const signalA = signal(0);
const signalB = signal(1);
 
effect(() => {
  console.log(signalA(), untracked(() => signalB()));
})
```
Powyższy kod wykona się ponownie tylko w przypadku aktualizacji wartości sygnału A.

W poniższym przykładzie `untracked` został użyty w komponencie karuzeli kategorii:
```typescript
@Component({
  // (...)
  template: `
    <ul>
      @for (category of categories(); track $index; let i = $index) {
        <li [attr.row-id]="i" #category>
          {{category}}
        </li>
      }
    </ul>
  `,
})
export class Categories {
  // lista kategorii
  categories: WritableSignal<string[]> = signal([
    'wszystkie',
    'ankieta',
    'bezpieczenstwo',
    'inne',
    'marketing',
    'monitoring',
    'oferta',
    'oplaty',
    'oprocentowanie',
    'regulaminy',
    'reklamacje',
  ]);
 
  // wybrana kategoria
  selectedRow: WritableSignal<number> = signal(0);
 
}
```
Na karuzeli wyświetlają się poziomo kategorie, które są scrollowalne.

Dodanie scrollowania do wybranej kategorii, można dodać w ramach `effect()`:
```typescript
// (...)
export class Categories {
  // (...)
  viewChildrenCategories: Signal<ReadonlyArray<ElementRef>> = 
    viewChildren<ElementRef>('category');
  
  constructor() {
    effect(() => {
      const selectedRow = this.selectedRow();
      const selectedElement = untracked(() =>
        this.viewChildrenCategories().find(
            (element) =>
            element.nativeElement.getAttribute('row-id') == selectedRow
            )
        );
      selectedElement?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }); 
 }
 // (...)
}
```

Scroll zostanie wykonany jedynie w przypadku gdy `selectedRow` zostanie zaktualizowany. Aktualizacja kategorii nie spowoduje przeskrollowania.

## Przydatne linki
- [Playground](https://stackblitz.com/edit/stackblitz-starters-1g2ydxbm?file=src%2Fmain.ts)
- [Dokumentacja](https://angular.dev/guide/signals#reading-without-tracking-dependencies)
