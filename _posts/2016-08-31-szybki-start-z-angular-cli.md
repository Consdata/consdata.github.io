---
layout:    post
title:     "Szybki start z Angular CLI"
date:      2016-08-31 08:00:00 +0100
published: true
author:    glipecki
tags:
    - tech
    - angular
---

Wydanie stabilnej wersji Angular 2 to idealny moment, żeby zacząć swoją przygodę z tym frameworkiem. Nie ma lepszego sposobu na poznanie nowej technologii niż skok na głęboką wodę i rozpoczęcie zabawy z kodem 😉

Częstym problemem przy pierwszym zetknięciu z nową technologią jest wysoki próg wejścia związany z przygotowaniem środowiska, projektu, czy też samym uruchomieniem i testowaniem. Mimo że samodzielne stworzenie projektu, przygotowanie całej konfiguracji i uruchomienie pierwszego buildu to świetna przygoda, tym razem skorzystamy z narzędzia Angular CLI i uruchomimy całość w kilka minut.

W ramach artykułu dowiesz się:
- jak stworzyć od zera projekt aplikacji webowej opartej o Angular 2,
- jak budować i pracować z projektem,
- jak szybko tworzyć składowe elementy projektu nie powtarzając tworzenia boilerplate.

Przed przeczytaniem artykułu warto mieć zgrubne pojęcie o konceptach frameworka: [https://angular.io/docs/ts/latest/guide/architecture.html](https://angular.io/docs/ts/latest/guide/architecture.html)

## Utworzenie projektu
Do działania angular-cli potrzebujemy zainstalowanego node’a (>= 4.x.x) z npm’em (>= 3.x.x). Samo cli najłatwiej zainstalować globalnie:
```bash
npm install -g angular-cli
```
Tworzymy nowy projekt, dodatkowo wskazując preprocesor CSSów – scss:
```bash
ng new sample-cli --style=scss
```

Wszystkie kolejne operacje cli wykonujemy będąc w katalogu projektu.
Uruchamiamy projekt w trybie developerskim:
```bash
ng serve
```
Aplikacja standardowo wystawia się na localhost na porcie 4200:
<img height="500px" src="/assets/img/posts/2016-08-31-szybki-start-z-angular-cli/1.png" />

W kilku krokach dostajemy gotowy szkielet aplikacji, gotowy do rozwoju i dystrybucji.

Dzięki Angular CLI dostajemy za darmo:
- kompletny szkielet aplikacji
- działający projekt ze skonfigurowaną najnowszą wersją Angulara
- kompletne skrypty budujące z możliwością
- uruchomienia buildu produkcyjnego
- uruchomienia aplikacji w trybie developerskim
- uruchomienia testów jednostkowych i testów e2e
- wsparcie dla kompilowania budowania CSS’ów na bazie scss/sass/less/stylus

W tym zaawansowane techniki budowania aplikacji:
- bundlowanie kodu, w tym obsługa podziału na części wspólne i ładowane asynchronicznie
- tree-shaking
- uglifying

## Struktura projektu
Wygenerowany szablon pozwala pracować nad kompletną aplikacją webową. W poszczególnych folderach znajdują się źródła aplikacji (kody TypeScript, html’e i stylizacje), pliki testów (w tym e2e) oraz zasoby statyczne serwowane as-is w docelowej aplikacji.
<img height="500px" src="/assets/img/posts/2016-08-31-szybki-start-z-angular-cli/2.png" />

Punktem wejścia aplikacji są src/index.html oraz src/main.ts, których celem jest załadowanie strony i osadzenie głównego komponentu naszej aplikacji zdefiniowanego w src/app/app.component.ts. Od tego ostatniego zaczynamy swoją przygodę z frameworkiem.

## Generowanie kodu i praca z CLI
Angular CLI, poza wygenerowaniem i budowaniem projektu, pomaga też w codziennej pracy, zdejmując z programisty typowe zadania związane z boilerplate.

Automatycznie wygenerujemy szablony dla wszystkich składowych frameworka:
- komponenty (component),
- dyrektywy (directive),
- pipe’y (pipe),
- seriwisy (service),
- klasy i interfejsy (class, interface),
- enumy (enum),
- moduły (module).

Użycie generatora pozwala szybko stworzyć komplet zasobów.

Przykładowo stworzenie nowego komponentu wygeneruje dla nas:
- klasę komponentu (*.ts)
- szablon html komponentu (*.html)
- plik stylizacji komponentu (*.html)
- plik z testami komponentu (*.spec.ts)
- podpięcie komponentu pod moduł aplikacji

Tak wygenerowany komponent jest gotowy do użycia bez dodatkowych modyfikacji:
```bash
ng generate component TodoList
```

Równie łatwo możemy stworzyć serwis:
```bash
ng generate service Todo
```

Nowo stworzone serwisy nie są standardowo podpinane pod żaden moduł. Można to jednak łatwo zrobić, np. podpinając w głównym module aplikacji, w pliku src/app/app.module.ts:
```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoService } from './todo.service';

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [TodoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
W podobny sposób możemy tworzyć pozostałe elementy aplikacji, zrzucając na narzędzie tworzenie zasobów na podstawie szablonów.

## Budowanie projektu
Wygenerowany projekt można zbudować w finalną aplikację:
```bash
ng build
```
Wygenerowane zasoby trafiają do folderu dist.

Budowanie można uruchomić podając dodatkowo profil. Standardowo budowana jest developerska wersja aplikacji. Jeżeli chcemy zbudować produkcyjną aplikację, wykorzystującą uglifying i tree-shaking, powinniśmy wskazać profil prod:
```bash
ng build --prod
```
Dodatkowo możliwe jest podanie wartości środowiskowych dla buildu i np. uruchamianie warunkowo szerszego logowania czy też punktów debugowania. W tym celu można użyć przełącznika –env nazwa.

Tak ustawiony profil można wykorzystać na etapie budowania oraz w uruchomionej aplikacji, przykładowo:
```typescript
if (environment.production) {
  // ...
}
```

## Uruchomienie testów
Zarówno testy jednostkowe, jak i end-to-end możemy spokojnie uruchamiać za pomocą CLI, wszystkie potrzebne konfiguracje są już dostarczone w ramach wygenerowanego szkieletu aplikacji.

Standardowo testy są uruchamiane w trybie nasłuchiwania na zmiany, to znaczy że framework testowy pozostaje uruchomiony w tle i wykonuje zestaw testów za każdym razem gdy wprowadzimy zmianę w źródłach.

Żeby testy uruchomić jednokrotnie należy dodać flagę –watch false.
```bash
ng test --watch false
```

Testy funkcjonalne uruchamiamy poleceniem:
```bash
ng e2e
```
jednak przed ich uruchomieniem należy wcześniej uruchomić samą aplikację, np. przez pokazany już ng serve:
```bash
ng serve & ng e2e
```


## Podsumowanie
Wykorzystanie narzędzia typu Angular CLI pozwala nam na:
- korzystanie z najnowszych technologii,
- ustandaryzowanie struktury i konfiguracji projektu,
- zrzucenie utrzymania procesu budowania na community,
- szybkie wsparcie dla nowych wersji frameworka przy minimalnym koszcie,
- stosowanie wzorcowej/zalecanej konfiguracji,
- szybkie uruchamianie nowych projektów,
- stosowanie podejścia convention over configuration.