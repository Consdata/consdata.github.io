---
layout:    post
title:     Czy wiesz, że w Angular 17 została wprowadzona alternatywa dla *ngSwitch?
description: ""
date:      2025-03-10T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2025-03-10-czy-wiesz-ze-w-angular-17-zostala-wprowadzona-alternatywa-dla-ngswitch/thumbnail.webp
tags:
- angular
---
W Angular 17 pojawiło się *built-it control flow*, które zostało ustabilizowane w wersji 18. Są to zamienniki dyrektyw `*ngIf` (opisaliśmy to [tutaj]({% post_url pl/2024-11-04-czy-wiesz-ze-od-angular-17-mozna-uzywac-if-zamiast-ngif %})), `*ngFor` (opisane [tutaj]({% post_url pl/2024-12-16-czy-wiesz-ze-w-angular-17-zostala-wprowadzona-alternatywa-dla-ngfor %})), `*ngSwitch`.

`@switch` jest odpowiednikiem `*ngSwitch`. Oferuje tą samą funkcjonalność. Przykładowe wykorzystanie:
```
// *ngSwitch
<ng-container [ngSwitch]="color">
  <p *ngSwitchCase="'blue'">Blue</p>
  <p *ngSwitchCase="'red'">Red</p>
  <p *ngSwitchDefault>Default case</p>
</ng-container>
 
// @switch
@switch(color) {
  @case ('blue') {
    Blue
  }
  @case ('red') {
    Red
  }
  @default {
    Default case
  }
}
```

`@switch` poprawia czytelność, oddzielając logikę od tagów html.

## Dokumentacja
- [https://angular.dev/guide/templates/control-flow](https://angular.dev/guide/templates/control-flow)
- [https://angular.dev/api/core/@switch](https://angular.dev/api/core/@switch)