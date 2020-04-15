---
layout:    post
title:     "Absolutne importowanie zależności w Angular CLI"
date:      2017-02-17 08:00:00 +0100
published: true
author:    glipecki
image:     angular-cli.png
tags:
    - angular
---

Odpowiedzialny programista tworząc aplikacje przestrzega powszechnie uznanych zasad tworzenia oprogramowania. Jedną z takich zasad jest _[Single Responsibility Principle](https://en.wikipedia.org/wiki/Singleresponsibilityprinciple)_, która uczy nas, że każdy moduł powinien mieć jedno, jasno zdefiniowane zadanie. Przenosząc tę zasadę na strukturę aplikacji powinniśmy, co najmniej, wydzielić każdą tworzoną klasę do osobnego pliku. O ile świat _JavaScript'u_ próbował wielokrotnie zmierzyć się z problemem modularyzacji aplikacji, to jednak dopiero standard _ES6_ pozwolił w pełni zaadaptować takie podejście.

## Modularyzacja w ES6

W ramach standardu _ES6_ wprowadzono pojęcie modułu oraz standardowego sposobu wyrażania zależności za pomocą polecenia _import_.

Za moduł przyjmuje się pojedyczny plik. Wszystkie elementy w nim zdefiniowane są jego własnością i nie zabrudzają globalnej przestrzeni aplikacji. Elementy, które chcemy udostępnić innym modułom należy jawnie wskazać przez oznaczenie ich poleceniem _export_. Wyeksportowane elementy możemy importować i używać w modułach zależnych poleceniem _import_.

Przykładowo, możemy zdefiniować zależność pomiędzy modułami:

_service.ts_

```typescript
export class Service {}
```

_component.ts_

```typescript
import {Service} from './service';
export class Component {
	private service: Service;
}
```

## Problemy z importowaniem zależności

Standardowo importowane moduły są wyszukiwane względem importującego pliku. W przypadku nietrywialnej struktury może to doprowadzić do pogroszenia czytelności aplikacji.

Wyobraźmy sobie strukturę kodu:

```
src
  \- user
    \- details
      user-details.component.ts
  \- authentication
    \- authentication.service.ts
```

Wówczas zawartość pliku _user-details.component.ts_ mogłaby wyglądać:

_component.ts_

```typescript
import {AuthenticationService} from '../../authentication/authentication.service';
export class UserDetailsService {
	private service: AuthenticationService;
}
```

Utrzymywanie względnych ścieżek importowanych modułów jest trudne. Czytelność istniejących importów jest wątpliwa, a dopisywanie nowych niewygodne. Rozwiązaniem tego problemu może być stosowanie absolutnych ścieżek do modułów, liczonych względem głównego katalogu ze źródłami. Przy takim podejściu dopisywanie nowych importów jest proste (widząc strukturę aplikacji), a czytając jesteśmy w stanie szybko się zorientować jakie zależności właściwie wciągamy.

## Użycie absolutnych ścieżek zależności

Na szczęście zalecane podejście do pisania aplikacji w _Angular 2_ zakłada stosowanie kompilatora _TypeScript_, a ten od dłuższego czasu wspiera stosowanie absolutnych ścieżek przy importowaniu zależności. Dodatkowo, również _Angular CLI_ prawidłowo obsluguje bundlowanie zasobów zbudowanych z wykorzystaniem absolutnych ścieżek.

W tym celu należy zmodyfikować plik konfiguracyjny kompilatora _TypeScript_. W pliku _tsconfig.json_ dopisujemy atrybut _baseUrl: "."_

```json
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

Od teraz możemy we wszystkich miejscach importować zależności podając ich absolutne ścieżki:

```typescript
import {AuthenticationService} from 'authentication/authentication.service';
export class UserDetailsService {
	private service: AuthenticationService;
}
```

## Podsumowanie

Wprowdzenie modularyzacji do standardu _ES6_ to ogromny krok w stronę poprawy jakości aplikacji. Jednak podawanie względnych ścieżek do zależności może szybko doprowadzić do pogorszenia czytelności kodu i przyprawić niejednego programistę o ból głowy. Na szczęścię kompilator _TypeScript_ pozawala definiować zależności wskazując absolutne ścieżki - wystarczy za pomocą atrybutu _baseUrl_ kompilatora zdefiniować katalog, względem którego chcemy wyszukiwać plików do importowania.

- [Wsparcie dla absolutnych importów w kompilatorze TypeScript](https://github.com/Microsoft/TypeScript/pull/5728)
- [Wsparcie dla konfiguracji baseUrl w Angular CLI](https://github.com/angular/angular-cli/pull/2470)
