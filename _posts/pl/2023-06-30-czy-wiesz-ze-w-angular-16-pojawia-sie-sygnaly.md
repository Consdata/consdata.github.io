---
layout:    post
title:     "Czy wiesz, że w Angular 16 pojawią się sygnały?"
date:      2023-06-30T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2023-06-30-czy-wiesz-ze-w-angular-16-pojawia-sie-sygnaly/angular.png
description: Sygnały to nowa koncepcja w Angular, upraszcza ona tworzenie reaktywnych komponentów. Mogą one w przyszłości doprowadzić do usunięcia Zone.js z Angular.
tags:
- angular
- signals
---

Sygnały to nowa koncepcja w Angular, upraszcza ona tworzenie reaktywnych komponentów. Mogą one w przyszłości doprowadzić do usunięcia Zone.js z Angular.

Przykład utworzenia i odczytywania wartości z sygnału:
```typescript
// tworzenie sygnału
name = signal('Szczupły Zbyszek');

// odczytywanie wartości
name();

// ustawienie nowej wartości
name.set('Piękna Marysia');
```
Do utworzenia sygnału potrzebna jest zawsze początkowa wartość. Obecną wartość z sygnału można odczytać wywołując sygnał jak funkcję.
Przykład prostego komponentu:
```typescript
@Component({
    selector: 'simple-name-signal',
    standalone: true,
    imports: [CommonModule],
    template: `
        <p>{{ name() }}</p>
        <button (click)="generateName()">Generate name</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleNameSignalComponent {
    name = signal('Szczupły Zbyszek');
    
    constructor(private generatorSerivce: GeneratorService) {}
    
    generateName() {
        this.name.set(this.generatorSerivce.generateName());
    }
}
```
Jeżeli wartość sygnału `name` nie ulegnie zmianie, komponent nie zostanie ponownie wyrysowany.

Sygnał zawsze posiada wartość, dlatego możliwe jest odczytanie ostatniej wartości np. w logice obsługi eventów:
```typescript
@Component({
    selector: 'simple-name-signal',
    standalone: true,
    imports: [CommonModule],
    template: `
        <p>{{data()}}</p>
        <button (click)="doSomething()">Do something</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleNameSignalComponent {
    
    data = signal('Szczupły Zbyszek');
    
    doSomething() {
    console.log(this.data()); // wywołanie this.data(), zwróci ostatnią wartość, bez rekalkulacji!
    }
}
```
Sygnały oferują możliwość agregowania, tak jak combineLatest z rxjs. Przykład:
```typescript
// rxjs
name = new BehaviorSubject('gorgeous Zbyszek');
counter = new BehaviorSubject(0);

concat$ = combineLatest([this.name, this.counter]).pipe(
    tap((data) => {
        console.log('RXJS computing concat', data);
    }),
    map(([name, counter]) => `${name}, counter: ${counter}`)
);

this.name.next('Grześ');
this.name.next('Grześ');
// output
// RXJS computing concat ["Grześ", 0]
// RXJS computing concat ["Grześ", 0]

// signal
name = signal('gorgeous Zbyszek');
counter = signal(0);

concat = computed(() => {
    console.log('SIGNAL computing concat');
    return `${this.name()}, counter: ${this.counter()}`;
});

this.name.set('Grześ');
this.name.set('Grześ');
// output:
// SIGNAL computing concat
```
Sygnały działają jak producer-consumer. Jeżeli ustawiamy nową wartość na sygnale, konsumer - `name()` otrzyma powiadomienie o zmianie i funkcja `concat` zostanie przeliczona.

W przypadku rxjs zostaną wyemitowane dwa eventy. Wykorzystując dodatkowy operator - `distinctUntilChanged`, wynik byłby taki sam jak w przypadku sygnałów.

A jak to wpłynie na NgRx? Nadal toczy się dyskusja ([link](https://github.com/ngrx/platform/discussions/3796), [link](https://github.com/ngrx/platform/discussions/3843)). Proponowana jest możliwość stworzenia SignalStore oraz pobierania selektorów, które zwrócą sygnał:
```typescript
data = this.store.selectSignal(selectData);
```

## Przydatne linki

- [Playground - komponent rxjs oraz komponent oparty o sygnały](https://stackblitz.com/edit/angular-wlwgq4),
- [https://itnext.io/angular-signals-the-future-of-angular-395a69e60062](https://itnext.io/angular-signals-the-future-of-angular-395a69e60062)
- [https://www.freecodecamp.org/news/angular-signals/](https://www.freecodecamp.org/news/angular-signals/)
- [https://dev.to/this-is-angular/signals-what-this-means-for-ngrx-eho](https://dev.to/this-is-angular/signals-what-this-means-for-ngrx-eho)

