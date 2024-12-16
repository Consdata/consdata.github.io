---
layout:    post
title:     Czy wiesz, że w Angular 17 została wprowadzona alternatywa dla *ngFor?
description: ""
date:      2024-12-16T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2024-12-16-czy-wiesz-ze-w-angular-17-zostala-wprowadzona-alternatywa-dla-ngfor/thumbnail.webp
tags:
- angular
---
W Angular 17 pojawiło się *built-it control flow*, które zostało ustabilizowane w wersji 18. Są to zamienniki dyrektyw `*ngIf` (opisaliśmy to [tutaj]({% post_url pl/2024-11-04-czy-wiesz-ze-od-angular-17-mozna-uzywac-if-zamiast-ngif %})), `*ngFor`, `*ngSwitch`.

`@for` jest odpowiednikiem `*ngFor`. Przykładowe wykorzystanie:
```
// *ngFor
<li *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</li>
 
// @for
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

`track`, tak jak wcześniej, łączy dane z konkretnym węzłem w DOM. Powoduje to wzrost wydajności przy operacjach na kolekcji. W `*ngFor` ustawienie `trackBy` było opcjonalne, natomiast w `@for` `track` jest obowiązkowy.

W ramach `@for` można używać dodatkowych zmiennych np. `$index`, `$event`, `$last` (więcej informacji na ten temat znajduje się w dokumentacji)
```
@for (product of products; track product.id; let i = $index, last = $last) {
  <li>#{{ i }}: {{ product.name }}, last row: {{ last }}</li>
}
```

`@for` oferuje dodatkowy blok `@empty`, który pojawia się, gdy kolekcja przekazana do `@for` jest pusta:
```
@for (item of items; track item.id) {
  <li> {{ item.id }}</li>
} @empty {
  <li> There are no items. </li>
}
```

## Dokumentacja
- [https://angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)
- [https://angular.dev/api/core/@for](https://angular.dev/api/core/@for)