---
layout:    post
title:     Czy wiesz, czym jest narzędzie artillery?
description: ""
date:      2026-02-13T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: kdudek
image: /assets/img/posts/2026-02-13-czy-wiesz-czym-jest-narzedzie-artillery/thumbnail.webp
tags:
- artillery
- tests
---

Artillery to oparte o Node.js narzędzie do wykonywania testów wydajnościowych, które może być prostszą alternatywą dla np. Gatlinga. 
Charakteryzuje się ono prostotą użycia, wspiera różne technologie (np. HTTP API, WebSockety), daje możliwość testowania rozproszonego oraz 
może być rozszerzane przez pluginy.

## Instalacja
Artillery można zainstalować poprzez:

```shell
npm install -g artillery@latest
```

lub używając odpowiedniego obrazu Dockerowego. Same testy pisane są w YAMLu lub w JavaScripcie.

## Przykładowy test

Załóżmy, że nasza aplikacja wystawia trzy usługi:

- `GET /get-projects` – zwracająca listę projektów
- `GET /get-sprints?project={{nazwa_projektu}}` – zwracająca listę trwających sprintów dla danego projektu
- `POST /add-task` – pozwalająca na dodanie zadania do sprintu

Chcemy przetestować dwa scenariusze:

1. Użytkownik wchodzi na listę projektów, wyświetla listę sprintów dla projektu TEST-PROJECT, a następnie po dwóch sekundach dodaje zadanie do pierwszego sprintu z listy.
2. Użytkownik dodaje po kolei 10 zadań do losowych dostępnych sprintów.

Dodatkowo zakładamy trzy fazy:
- pierwsza, rozgrzewkowa - 5 wirtualnych użytkowników na sekundę, zwiększających się do 10 na koniec fazy,
```yaml
    duration: 60
    arrivalRate: 5
    rampTo: 10
    name: Warm up phase
```
- druga, stopniowo zwiększająca obciążenie do 50 użytkowników,
```yaml
    duration: 60
    arrivalRate: 10
    rampTo: 50
    name: Ramp up load
```

- trzecia testująca duży przypływ użytkowników - 50 użytkowników co sekundę.
```yaml
    duration: 30
    arrivalRate: 50
    name: Spike phase
```

## Konfiguracja testu

W sekcji `config` tworzymy podstawową konfigurację testu – definiujemy, na jaki adres będą kierowane żądania, fazy testu oraz zmienne, 
które możemy wykorzystać w ramach scenariuszy.
Dodatkowo zdefiniowany jest plugin rozszerzający wyniki oraz procesor – czyli plik zawierający funkcje JavaScript, które mogą być wykorzystane w teście.

```yaml
config:
  target: http://localhost:8080
  phases: [...]
  plugins:
    metrics-by-endpoint: {}
  processor: "./functions.js"
  variables:
    project: "TEST-PROJECT"
```

## Scenariusze i flow

Sekcja `scenarios` zawiera definicje scenariuszy testowych. Każdy scenariusz ma określony `weight`, który decyduje o tym, jak często będzie wybierany przez wirtualnych użytkowników. W ramach `flow` określone są kroki scenariusza, w których możemy wykorzystywać zmienne zdefiniowane w konfiguracji lub tworzyć je na bieżąco, np. na podstawie odpowiedzi usług.

```yaml
scenarios:
  # 9 na 10 użytkowników wybierze ten scenariusz
  - name: "Standard scenario - add single task"
    weight: 9
    flow:
      - get:
          url: "/get-projects"
      - get:
          url: "/get-sprints"
          qs:
            project: "{{project}}"
          capture:
            json: "$.sprints[0].sprintId"
            as: "sprintId"
      - think: 2
      - post:
          url: '/add-task'
          json:
            name: "Example task"
            type: "TECHNICAL"
            sprintId: "{{sprintId}}"
  # 1 na 10 użytkowników wybierze ten scenariusz
  - name: "Rare scenario - add multiple tasks"
    weight: 1
    flow:
      - get:
          url: "/get-projects"
      - get:
          url: "/get-sprints"
          qs:
            project: "{{project}}"
          capture:
            json: "$.sprints"
            as: "sprints"
      - think: 2
      - loop:
        - post:
            beforeRequest: "setAddTaskBody"
            url: '/add-task'
        count: 10
```

## Funkcje pomocnicze (processor)

Plik `functions.js` z funkcjami pomocniczymi:

```javascript
module.exports = {
  setAddTaskBody
}

function setAddTaskBody(requestParams, context, ee, next) {
  const type = Math.random() < 0.75 ? "BUG" : "TECHNICAL"
  const name = randomString();
  const sprints = context.vars["sprints"];
  const randomSprint = sprints[Math.floor(Math.random() * sprints.length)];

  const task = {
    name,
    type,
    sprintId: randomSprint.sprintId
  }
  requestParams.json = task;
  return next();
}

function randomString() {
  return (Math.random() + 1).toString(36).substring(7);
}
```

## Hooki w Artillery

Artillery pozwala na wykorzystywanie hooków, które są funkcjami JavaScriptowymi zawartymi w pliku będącym procesorem. Wyróżniamy następujące hooki:

- `beforeScenario` i `afterScenario` – przed/po wykonaniu scenariusza przez wirtualnego użytkownika
- `beforeRequest` – przed wysłaniem requestu (można ustawić parametry takie jak URL, ciasteczka, nagłówki czy ciało żądania)
- `afterResponse` – po otrzymaniu odpowiedzi (np. zdefiniować zmienne na dalsze potrzeby testu)
- `function` – funkcja wywoływana w dowolnym miejscu scenariusza

W powyższej implementacji scenariusza wykorzystany został `beforeRequest`, będący funkcją w której ustawiamy body żądania na podstawie wcześniej zapisanej zmiennej. 
Funkcja ta przyjmuje cztery parametry:

- `requestParams` – obiekt żądania
- `context` – kontekst wirtualnego użytkownika; za pośrednictwem `context.vars` mamy dostęp do wszystkich zdefiniowanych zmiennych
- `ee` – event emitter do bezpośredniej komunikacji z Artillery
- `next` – obowiązkowy callback, dzięki któremu test jest kontynuowany

## Uruchamianie testów

Aby uruchomić taki scenariusz wystarczy użyć komendy:

```shell
artillery run scenario.yml
```

Można zapisać wyniki testu do formatu JSON dodając flagę `--output`:

```shell
artillery run --output results.json scenario.yml
```

## Raportowanie wyników

Plik ten można wykorzystać do wygenerowania raportu HTML za pośrednictwem komendy:

```shell
artillery report results.json
```

Fragment wygenerowanego raportu, przedstawiający czasy odpowiedzi (ich minimalną i maksymalną wartość, a także medianę oraz percentyle 95 i 99) dla wszystkich żądań HTTP wysłanych w ramach scenariuszy:

<img src="/assets/img/posts/2026-02-13-czy-wiesz-czym-jest-narzedzie-artillery/http_response_time.png" alt="Fragment raportu wygenerowanego przez Artillery" />

## Podsumowanie

Poniżej pełny przykład pliku testowego YAML oraz procesora JS, zbierający wszystkie elementy opisane powyżej:

```yaml
config:
  target: http://localhost:8080
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 10
      name: Warm up phase
    - duration: 60
      arrivalRate: 10
      rampTo: 50
      name: Ramp up load
    - duration: 30
      arrivalRate: 50
      name: Spike phase
  plugins:
    metrics-by-endpoint: {}
  processor: "./functions.js"
  variables:
    project: "TEST-PROJECT"
scenarios:
  - name: "Standard scenario - add single task"
    weight: 9
    flow:
      - get:
          url: "/get-projects"
      - get:
          url: "/get-sprints"
          qs:
            project: "{{project}}"
          capture:
            json: "$.sprints[0].sprintId"
            as: "sprintId"
      - think: 2
      - post:
          url: '/add-task'
          json:
            name: "Example task"
            type: "TECHNICAL"
            sprintId: "{{sprintId}}"
  - name: "Rare scenario - add multiple tasks"
    weight: 1
    flow:
      - get:
          url: "/get-projects"
      - get:
          url: "/get-sprints"
          qs:
            project: "{{project}}"
          capture:
            json: "$.sprints"
            as: "sprints"
      - think: 2
      - loop:
        - post:
            beforeRequest: "setAddTaskBody"
            url: '/add-task'
        count: 10
```

```javascript
module.exports = {
  setAddTaskBody
}

function setAddTaskBody(requestParams, context, ee, next) {
  const type = Math.random() < 0.75 ? "BUG" : "TECHNICAL"
  const name = randomString();
  const sprints = context.vars["sprints"];
  const randomSprint = sprints[Math.floor(Math.random() * sprints.length)];

  const task = {
    name,
    type,
    sprintId: randomSprint.sprintId
  }
  requestParams.json = task;
  return next();
}

function randomString() {
  return (Math.random() + 1).toString(36).substring(7);
}
```

Artillery to proste i przyjemne narzędzie, które posiada także wiele innych funkcjonalności niewykorzystanych w powyższym przykładzie – można się z nimi zapoznać w dokumentacji. 
Potencjalnym problemem może być jednak brak wsparcia dla równoległych requestów wywoływanych przez jednego wirtualnego użytkownika – chociaż teoretycznie w kodzie Artillery znaleźć można opcję `parallel`, 
to w praktyce nie do końca ona działa. W takiej sytuacji obejściem może być np. odpowiednie zdefiniowanie dodatkowych scenariuszy, które zasymulują takie współbieżne żądania.

## Dokumentacja
- [Artillery – oficjalna dokumentacja](https://www.artillery.io/docs)
