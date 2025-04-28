---
layout:    post
title:     "Czy wiesz, że w Jest można automatycznie testować dostępność (a11y)?"
description: ""
date:      2025-05-19T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2025-05-19-automatyczne-testowanie-dostepnosci/thumbnail.webp
tags:
- wcag
---
Jeśli projekt wykorzystuje bibliotekę `jest`, to nie wiele wystarczy, aby dodać testy sprawdzające zgodność z WCAG.

`jest-axe` to biblioteka, która umożliwia testowanie dostępności w testach jednostkowych w środowisku `jest`. Pozwala sprawdzić, czy komponenty napisane w `React`, `Angular` czy innych frameworkach spełniają wytyczne WCAG.

Przykład dla Angular:
- W pliku `test-setup.ts` należy zaimportować `jest-axe/extend-expect`
- Poniższy przykład obrazuje test dla komponentu `SomeComponent`:

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { axe } from "jest-axe";
 
import { SomeComponent } from "./some.component";
 
describe("SomeComponent", () => {
  let fixture: ComponentFixture<SomeComponent>;
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SomeComponent],
    });
 
    fixture = TestBed.createComponent(SomeComponent);
  });
 
  it("should have no violations", async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
});
```

Dla powyższego:
- `axe(fixture.nativeElement)` - uruchamia analizę dostępności dla wygenerowanego HTMLa komponentu
- `expect(results).toHaveNoViolations();` - sprawdza, czy nie znaleziono żadnych błędów związanych z dostępnością (czy np. brakujące atrybutu alt dla obrazków)

Dzięki kilku linijkom kodu przeprowadzenie audytu całego systemu projektowego pod kątem problemów z dostępnością staje się wykonalne! Warto pamiętać, że testy automatyczne wykryją tylko część problemów. **Nie gwarantują** one, że komponent jest w pełni dostępny.

## Przydatne linki
- [Repozytorium biblioteki jest-axe](https://github.com/nickcolley/jest-axe)