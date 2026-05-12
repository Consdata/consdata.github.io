---
layout:    post
title:     "Czy wiesz, jak stworzyć klikalną kartę (Card component) zgodnie z WCAG?"
description: Budowa karty, która jest w całości klikalna, a jednocześnie zawiera w sobie dodatkowe akcje (jak przycisk „Ulubione”), to jedno z częstych wyzwań UX/UI.
date:      2026-05-12T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: mbartosik
image: /assets/img/posts/2026-05-13-czy-wiesz-jak-stworzyc-klikalna-karte-card-component-zgodnie-z-wcag/thumbnail.webp
tags:
- angular
- wcag
- html
---

Budowa karty, która jest w całości klikalna, a jednocześnie zawiera w sobie dodatkowe akcje (jak przycisk „Ulubione”), to jedno z częstych wyzwań UX/UI.

## Opisywany komponent karty

![Klikalny komoponent karty](/assets/img/posts/2026-05-13-czy-wiesz-jak-stworzyc-klikalna-karte-card-component-zgodnie-z-wcag/clickable-card.png)

### Na czym polega problem?

Zgodnie ze standardami HTML i WCAG nie wolno umieszczać elementów interaktywnych wewnątrz innych elementów interaktywnych.

Taka konstrukcja prowadzi do błędów w drzewie dostępności, utrudniając poprawną nawigację przy użyciu czytników ekranowych.

### Co chcemy osiągnąć?

Naszym celem jest rozdzielenie warstwy wizualnej od semantyki:

Dla użytkownika:

- cała karta wygląda jak klikalna
- kursor zmienia się na „łapkę” na całej powierzchni

Dla technologii asystujących:

- linkiem jest tylko konkretny element (np. tytuł)
- przyciski są osobnymi, niezależnymi kontrolkami

## Rozwiązanie: stretched link

Zamiast owijać całą kartę w `<a>`, traktujemy:

- link
- przyciski

jako oddzielne elementy.

### Kluczowa idea

Link umieszczamy tam, gdzie ma sens semantyczny, najczęściej w tytule.

Następnie:

- Rozciągamy link: za pomocą `::after` sprawiamy, że link z nagłówka pokrywa całą powierzchnię karty.
- Warstwujemy akcje: przyciski (np. „Ulubione”) wyciągamy na wierzch przez `z-index`, by pozostały niezależne i klikalne.

```typescript
@Component({
  selector: 'app-accessible-card',
  template: `
    <article class="card">
      <div class="content">
        <header>
          <span class="badge">{{ category() }}</span>
          <h3 class="title">
            <a [href]="linkUrl()" class="overlay-link">{{ title() }}</a>
          </h3>
           
          <button
            type="button"
            class="fav-btn"
            [attr.aria-label]="isFavorite() ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'"
            [class.is-fav]="isFavorite()"
            (click)="toggleFavorite($event)">
            <span aria-hidden="true">❤</span>
          </button>
        </header>
 
        <p class="desc">{{ description() }}</p>
 
        <footer>
          <button type="button" class="btn-primary" (click)="onActionClick($event)">
            Szczegóły
          </button>
        </footer>
      </div>
    </article>
  `,
  styleUrl: './accessible-card.component.css'
})
export class AccessibleCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  category = input<string>('Artykuł');
  linkUrl = input.required<string>();
  isFavorite = input<boolean>(false);
 
  favoriteToggled = output<boolean>();
  actionTriggered = output<void>();
 
  toggleFavorite(event: Event) {
    event.stopPropagation();            // Zapobiega aktywacji linku głównego
    this.favoriteToggled.emit(!this.isFavorite());
  }
 
  onActionClick(event: Event) {
    event.stopPropagation();            // Zapobiega aktywacji linku głównego
    this.actionTriggered.emit();
  }
}
```

## Kluczowe fragmenty CSS

```css
.card {
  position: relative;
}
 
.overlay-link {
 
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;             /* Warstwa podstawowa */
  }
 
  /* Wyraźny focus klawiatury widoczny na obrysie całej karty */
  &:focus-visible::after {
    outline: 3px solid #3b82f6;
    outline-offset: 4px;
  }
}
 
/* Przyciski interaktywne wyciągnięte "NAD" link */
.fav-btn,
.btn-primary {
  position: relative;
  z-index: 2;               /* Przebija się przez warstwę linku głównego */
}
```

## Dlaczego to podejście wygrywa?

- Prawidłowa semantyka: Czytnik ekranu ogłasza tylko krótki, konkretny tytuł jako link.
- Niezależne akcje: Możemy dodać przycisk „Ulubione”, „Koszyk” czy „Tagi”, m.in. dzięki `z-index: 2`.
- Zgodność z HTML5: Unikamy błędu zagnieżdżania przycisku wewnątrz linku.

## Demo

Demo dostępne pod linkiem: [StackBlitz](https://stackblitz.com/edit/stackblitz-starters-lartscym?file=src%2Flib%2Faccessible-card.component.css)

## Źródła

- [Bootstrap - stretched-link](https://getbootstrap.com/docs/5.0/helpers/stretched-link/)  
- [Piccalilli - Accessible faux-nested interactive controls](https://piccalil.li/blog/accessible-faux-nested-interactive-controls/)
