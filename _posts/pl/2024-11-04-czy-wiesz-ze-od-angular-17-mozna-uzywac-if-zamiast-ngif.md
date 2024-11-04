---
layout:    post
title:     Czy wiesz, że w Angular 17 została wprowadzona alternatywa dla *ngIf?
description: ""
date:      2024-11-01T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2024-11-04-czy-wiesz-ze-od-angular-17-mozna-uzywac-if-zamiast-ngif/thumbnail.webp
tags:
- javascript
---
W Angular 17 pojawiło się *built-it control flow*, które zostało ustabilizowane w wersji 18. Są to zamienniki dyrektyw `*ngIf`, `*ngFor`, `*ngSwitch`.

`@if` jest odpowiednikiem `*ngIf`. Przykładowe wykorzystanie:
```
// *ngIf - if-else
<div *ngIf="a > b; then aGreaterBlock else aLessOrEqualBlock"></div>
<ng-template #aGreaterBlock>A jest większe niż B</ng-template>
<ng-template #aLessOrEqualBlock>A jest mniejsze lub równe B</ng-template>
 
// @if - if, else if, else
@if (a > b) {
  A jest większe niż B
} @else if (a < b){
  A jest mniejsze niż B
} @else {
  A jest równe B
}
```

`@if` można używać również z `async pipe`. Przykład wykorzystania:
```
// *ngIf - async pipe
<ng-container *ngIf="vm$ | async as viewModel">
  {{ viewModel.attachemnts.length }}
</ng-container>
 
// @if - async pipe
@if (vm$ | async; as viewModel) {
  {{ viewModel.attachemnts.length }}
}
```

`@if` poprawia czytelność szablonów, oddziela logikę od tagów html oraz oferuje klauzulę `@else`, która będzie wykonana, jeśli zdefiniowany warunek nie zostanie spełniony.

## Dokumentacja
- [https://angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)
- [https://angular.dev/api/common/NgIf](https://angular.dev/api/common/NgIf)