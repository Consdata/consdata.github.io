---
layout: post
title: "Czy wiesz, że w Jest można automatycznie testować dostępność (a11y)?"
description: ""
date: 2025-05-19T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2025-05-19-automatyczne-testowanie-dostepnosci/thumbnail.webp
tags:
  - wcag
---


Standard WCAG (Web Content Accessibility Guidelines) to zbiór wytycznych mających na celu zapewnienie dostępności treści
cyfrowych dla wszystkich użytkowników, w tym osób z niepełnosprawnościami. Do testowania zgodności z tym standardem
można wykorzystać różne narzędzia - jednym z nich jest "jest-axe". W tym wpisie przybliżymy jego działanie, krok po
kroku pokażemy, jak przeprowadzić testy dostępności oraz wskażemy, na co warto zwrócić uwagę podczas jego użycia.

Więcej szczegółowych informacji na temat tego czym jest WCAG, kiedy i jak należy go stosować, a także o tym, jakie
wyzwania związane z zapewnianiem użytkownikom dostępności cyfrowej niesie przyszłość
opisujemy [tutaj] (https://consdata.com/pl/blog/biznesowy/co-to-jest-wcag-i-dlaczego-nalezy-wdrozyc-ten-standard-w-swojej-organizacji)

# Czym jest jest-axe?

Jeśli projekt wykorzystuje bibliotekę Jest, dodanie testów sprawdzających zgodność komponentów z WCAG jest proste i nie
wymaga dużego nakładu pracy.

Jest-axe to narzędzie do automatycznego testowania dostępności, oparte na silniku axe-core. Działa podobnie jak lintery
kodu (np. eslint czy stylelint), czyli wykrywa typowe problemy, ale nie gwarantuje pełnej zgodności z wymaganiami
dostępności.
Integruje się z biblioteką Jest i pozwala analizować HTML komponentów pod kątem błędów dostępności, takich jak:

- brakujące atrybuty alt w obrazkach,
- nieprawidłowe role ARIA,
- nagłówki bez odpowiedniej hierarchii,

Dodaje do testów matcher `toHaveNoViolations`, który umożliwia prostą walidację wyników analizy.

<br/><br/>
***Uwaga!***
Jest-axe nie zastępuje ręcznego audytu dostępności. Automatyczne testy są tylko wsparciem i nie wychwycą wszystkich
problemów. Pełną ocenę powinny przeprowadzać osoby posiadające wiedzę w tym zakresie.

# Co jest-axe może przeoczyć?

Ważnym jest, aby mieć świadomość ograniczeń tego narzędzia. Jest-axe może nie wykryć m.in.:

- problemów z kontrastem,
- pełnej oceny struktury semantycznej,
- niektórych problemów z interaktywnymi elementami,
- problemów z nawigacją klawiaturową,
- problemów kontekstowych

# Integracja z Angular

Do projektu zawierajacego Jest należy zainstalować Jest-axe

## Krok 1: Instalacja

```bash 
npm install --save-dev jest-axe @types/jest-axe
```

## Krok 2: Konfiguracja

Do pliku z konfiguracją testów np. `test-setup.ts`, należy dodać import

```typescript
import 'jest-axe/extend-expect';
```

## Krok 3: Podstawowy test dostępności komponentu

W pliku `test-setup.ts` należy zaimportować `jest-axe/extend-expect`

# Testy

Kiedy wszystko zostało już skonfigurowanie, nie pozostaje nic innego jak użycie narzędzia w testach.
W pliku z testami należy dodać import `import { axe } from 'jest-axe';`. Następnie, dzięki `axe(fixture.nativeElement)`,
uruchomiona zostanie analiza dostępności dla wygenerowanego HTMLa komponentu.
Wynik analizy musi zostać sprawdzony przy użyciu metody `toHaveNoViolations`, w następujący sposób:
`expect(results).toHaveNoViolations()`.

## Przypadki testowe

Na potrzeby testów przygotowano dwa komponenty. Pierwszy zawiera HTML, który nie spełnia wymagań audytu dostępności, a
drugi taki, który je spełnia.

### Pierwszy scenariusz

Komponent posiada następujący kod HTML:

```html

<div class="container">
    <!-- Błąd: Nieprawidłowa kolejność nagłówków (h4 po h2 bez h3) -->
    <h2>Główny nagłówek</h2>
    <h4>Polecane akcesoria</h4>

    <!-- Błąd: Obraz bez atrybutu alt -->
    <img src="product.jpg" class="banner-image">

    <!-- Błąd: Link bez treści (pusty link) -->
    <a href="/home" class="home-link"></a>

    <!-- Błąd: Element select bez etykiety -->
    <select>
        <option value="">Wybierz temat...</option>
        <option value="question">Pytanie</option>
        <option value="complaint">Reklamacja</option>
    </select>

    <!-- Błąd: Atrybut ARIA z nieprawidłową wartością -->
    <div aria-hidden="falsy">Ukryta treść</div>
</div>
```

Test wykonujący audyt:

```typescript
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MyComponent} from './my.component';
import {axe} from 'jest-axe';

describe('MyComponent', () => {
    let component: MyComponent;
    let fixture: ComponentFixture<MyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MyComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should pass accessibility tests', async () => {
        const results = await axe(fixture.nativeElement);
        expect(results).toHaveNoViolations()
    });
});

```

Po uruchomieniu testu, zwrócony został następujące komunikaty błędów

```
expect(received).toHaveNoViolations(expected)
Expected the HTML found at $('div[aria-hidden="falsy"]') to have no violations:
<div aria-hidden="falsy">Ukryta treść</div>

Received:
"ARIA attributes must conform to valid values (aria-valid-attr-value)"

Fix all of the following:
  Invalid ARIA attribute value: aria-hidden="falsy"

You can find more information on this issue here: 
https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr-value?application=axeAPI
────────
...

Received:
"Heading levels should only increase by one (heading-order)"

...
────────
...

Received:
"Images must have alternative text (image-alt)"

...
────────
...

Received:
"Links must have discernible text (link-name)"

...
────────
...

Received:
"Select element must have an accessible name (select-name)"

```

Jak widać, zwrócone zostały nie tylko komunikaty błędów, ale także podpowiedzi, jak te konkretne błędy naprawić.

Powyższe błędy dotyczą:

- nieprawidłowej kolejność nagłówków - użycie `h4` bezpośrednio po `h2` bez `h3` pomiędzy nimi
- obrazu bez atrybutu alt - brak tekstu alternatywnego dla obrazu z klasą "banner-image"
- linku bez treści - pusty znacznik `<a>` bez żadnej zawartości ani atrybutów dostępności
- elementu select bez etykiety - rozwijana lista bez powiązanej etykiety
- nieprawidłowej wartość atrybutu ARIA - użycie "falsy" zamiast "false" dla aria-hidden

### Drugi scenariusz

W tym scenariuszu komponent posiada już prawidłowy, poprawiony HTML.

```html

<div class="container">
    <!-- Poprawna hierarchia nagłówków -->
    <h2 id="main-heading">Główny nagłówek</h2>
    <h3 id="recommended-heading">Polecane akcesoria</h3>

    <!-- Dodany atrybut alt dla obrazu -->
    <img src="product.jpg" class="banner-image" alt="Zdjęcie produktu">

    <!-- Link zawiera teraz tekst -->
    <a href="/home" class="home-link">Strona główna</a>

    <!-- Element select z właściwą etykietą -->
    <label for="topic-select">Wybierz temat:</label>
    <select id="topic-select" name="topic">
        <option value="">Wybierz temat...</option>
        <option value="question">Pytanie</option>
        <option value="complaint">Reklamacja</option>
    </select>

    <!-- Poprawna wartość atrybutu ARIA -->
    <div aria-hidden="true">Ukryta treść</div>
</div>
```

Więcej informacji dotyczących testowania dostępności oraz szczegółowe scenariusze działania z wykorzystaniem różnych
narzędzi opisujemy w [osobnym artykule](https://consdata.com/pl/blog/biznesowy/testowanie-dostepnosci-wcag)

# Podsumowanie

Jest-axe łatwo integruje się z Jest, pozwala wykrywać proste błędy dostępności w HTML i działa z popularnymi
frameworkami (Angular, React, Vue).
Nie wspiera on jednak pełnego wsparcia audytorskiego pod kątem dostępności.

Dlatego jest-axe powinien być traktowany jako wsparcie, a nie zastępstwo dla ręcznych testów dostępności i audytów z
udziałem osób z niepełnosprawnościami.

## Przydatne linki

- [Repozytorium biblioteki jest-axe](https://github.com/nickcolley/jest-axe)
