---
layout:    post
title:     "Czy wiesz, że w TypeScript możesz łączyć typy za pomocą interpolacji ciągów znaków?"
date:      2023-12-29T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2023-12-29-czy-wiesz-ze-w-typescript-mozesz-laczyc-typy-za-pomoca-interpolacji-ciagow-znakow/thumbnail.webp
description: Krótki wpis Template Literal Types, czyli o łączeniu Literal Types za pomocą interpolacji ciągów znaków.
tags:
- typescript
- literal types
- union types
---

W TypeScript możemy tworzyć swoje własne typy ([Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)) w następujący sposób:
```typescript
type lang = 'pl' | 'en';
```
gdzie używamy znaku `|` aby móc zdefiniować kilka różnych typów ([Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)).

W TypeScript 4.1 pojawiła się możliwość łączenia ze sobą typów za pomocą interpolacji ciągów:
```typescript
type lang = 'pl' | 'en';
type textType = 'description' | 'title';

type textType = '${textType}_${lang};
```
Dzięki temu możemy otrzymać każdą możliwą kombinację typów w ramach nowego typu. Dla tego przykładu będą to: `description_pl`, `description_en`, `title_pl`, `title_en`.

Więcej informacji znajdziecie pod adresem: [https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)


