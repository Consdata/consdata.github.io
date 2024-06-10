---
layout:    post
title:     "Czy wiesz co to stylePreprocessorOptions w Angular?"
date:      2024-01-12T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2024-01-12-czy-wiesz-co-to-style-processor-options-w-angular/thumbnail.webp
description: StylePreprocessorOptions pozwala na dynamiczne dodawanie stylów do aplikacji. Pokazujemy kawałek kodu, który to umożliwia.
tags:
- angular
- css
---
StylePreprocessorOptions pozwala na dynamiczne dodawanie stylów do aplikacji. Zamiast używać relatywnych ścieżek do pliku ze stylami:
```scss
// Relatywna ścieżka
@import 'libs/feature-theme-A/src/style/palette';
```
można zaimportować style w taki sposób:
```scss
// Po dodaniu stylePreprocessorOptions, można tak:
@import 'palette';
```

Co to daje? Załóżmy, że mamy aplikację A oraz B, które korzystają z tych samych komponentów. Przedstawione rozwiązanie umożliwia zmianę stylów w zależności, w której aplikacji używamy określonego komponentu nie tracąc jednocześnie enkapsulacji stylów w Angularze. Możemy tak zaimportować zmienne, dodatkowe klasy czy mixiny.

Dodanie StylePreprocessorOptions w aplikacji sprowadza się do wskazania odpowiednich ścieżek w projekcie:
```json
"stylePreprocessorOptions": {
    "includePaths": ["libs/feature-theme-A/src/style"]
}
```

Miłego kolorowania!