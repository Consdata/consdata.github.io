---
layout:    post
title:     "Czy wiesz, że w Angularze istnieje sygnałowa alternatywa @ViewChild?"
date:      2026-08-07T07:00:00+02:00
published: true
didyouknow: true
lang: pl
author: mbartosik
image: /assets/img/posts/2026-08-07-czy-wiesz-ze-w-angularze-istnieje-sygnalowa-alternatywa-viewchild/thumbnail.webp
description: "Pokażę sygnałową alternatywę dla @ViewChild w Angularze i jej zalety względem klasycznego podejścia z AfterViewInit."
tags:
- angular
- signals
- frontend
---

`@ViewChild` służy do pobrania referencji elementu z szablonu. Jego standardowe wykorzystanie może wyglądać tak:

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div #rightClickMenu>
      Click me right. Counter: {{ counter() }}
    </div>
  `,
})
export class PlaygroundComponent implements AfterViewInit {
  @ViewChild('rightClickMenu') rightClickMenu!: ElementRef;
  counter = signal(0);

  ngAfterViewInit() {
    this.rightClickMenu.nativeElement.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      this.counter.set(this.counter() + 1);
    });
  }
}
```

Wykorzystując `@ViewChild` zmienna przechowująca referencję jest uzupełniana dopiero po zainicjowaniu widoku. 
Dlatego TypeScript dla takiego przypadku wymaga określenia dodatkowego typu `undefined` lub wyłączonej non-null asercji.

Angular 17.2 wprowadził metodę `viewChild`, która zwraca referencję w postaci sygnału.

Przy użyciu metody `viewChild` powyższy komponent wygląda tak.

```ts
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div #rightClickMenu>
      Click me right. Counter: {{ counter() }}
    </div>
  `,
})
export class PlaygroundComponent {
  rightClickMenu = viewChild.required<ElementRef>('rightClickMenu');
  counter = signal(0);

  constructor() {
    effect(() => {
      this.rightClickMenu().nativeElement.addEventListener('contextmenu', (event: MouseEvent) => {
        event.preventDefault();
        this.counter.set(this.counter() + 1);
      });
    });
  }
}
```

Sygnałowe podejście poprawia czytelność kodu i upraszcza rozwiązanie. W drugim przykładzie zamiast `AfterViewInit` została użyta sygnałowa funkcja `effect`, aby wykonać działanie na elemencie w momencie, gdy jego referencja zostanie zwrócona przez sygnał.

Można używać również funkcji `computed()`, aby wyprowadzać wartości z sygnału.

Dodatkową zaletą jest możliwość użycia metody `required`, która wymusza obecność żądanego elementu w szablonie komponentu, dlatego warto ją stosować dla statycznie zdefiniowanych elementów, aby ograniczyć konieczność stosowania dodatkowych asercji.

Sygnałowym podejściem możemy zastąpić również dekoratory `@ViewChildren`, `@ContentChild` i `@ContentChildren`, odpowiednio metodami `viewChildren()`, `contentChild()` i `contentChildren()`.

### Źródła

- [Angular Signals Queries](https://angular.dev/guide/signals/queries)
- [Angular ViewChild and ContentChild](https://blog.angular-university.io/angular-viewchild-contentchild/)

Pełny przykład dostępny: [StackBlitz](https://stackblitz.com/edit/stackblitz-starters-exyuncx2?file=src%2Fdecorator-box.ts)

