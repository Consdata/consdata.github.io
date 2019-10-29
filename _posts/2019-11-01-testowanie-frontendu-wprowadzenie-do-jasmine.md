---
layout: post
title: Testowanie frontendu - Cz. 1. Wprowadzenie do Jasmine - konfiguracja i przykładowe testy
published: true
date:      2019-10-29 08:00:00 +0100
author:    mmendlik
tags:
  - javascript
  - test
  - jasmine
---

Mój poprzedni wpis był o tym [**co** testować w projektach frontendowych](https://blog.consdata.tech/2019/07/26/testy-frontendu-okiem-full-stacka.html), teraz przyszedł czas aby wybrać odpowiednie narzędzia, zakasać rękawy i przejść do praktyki. Pokażę jak zainstalować i używać frameworka Jasmine w projekcie Node'owym.

### Node
#### Instalacja za pomocą nvm
Aby zainstalować lokalnie Node'a, można posłużyć się nvm, więcej w [artykule autorstwa Krzysztofa Czechowskiego na łamach naszego bloga](https://blog.consdata.tech/2019/05/09/node-version-menager.html).
Do używania frameworka będzie potrzebny projekt Node'owy, w przypadku jego braku można w dowolnym katalogu taki stworzyć za pomocą polecenia
```bash
npm init
```

### Jasmine
Framework
Jasmine jest frameworkiem służącym do testowania napisanym w duchu behaviour-driven development, nie ma dodatkowych zależności oraz, jak twierdzą twórcy, dostajemy go z bateriami, czyli powinien zawierać wszystko, co jest potrzebne do pisania testów jednostkowych w naszym projekcie.

#### Instalacja
Instrukcja instalacji jest zwięźle opisana w [dokumentacji](https://jasmine.github.io/setup/nodejs.html). Aby zainstalować framework w projekcie, należy:

dodać zależność w devDependencies,

npm:
```bash
npm install --save-dev jasmine
````

yarn:
```bash
yarn add jasmine --dev
```

inicjować lokalnie zainstalowany framework, polecenie utworzy domyślną konfigurację w katalogu *spec*, domyślnie Jasmine będzie wykonywał testy w plikach w katalogu *spec*, kończące swoją nazwę na *spec.js* lub *Spec.js*.


```bash
node node_modules/jasmine/bin/jasmine init
```

framework zainicjował się z domyślną konfiguracją:
```json
{
  "spec_dir": "spec",
  "spec_files": [
    "**/*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
}

```

następnie należy dodać wpis do package.json,
```json
"scripts": { "test": "jasmine" }
```

zweryfikować instalację.
```bash
npm test
```
albo
```bash
yarn test
```

### Angular CLI
W przypadku użycia frameworka Angular CLI mamy już dostępny framework Jasmine i nie wymaga on dalszej konfiguracji. Wymagana jest jedynie [inna konwencja nazewnicza plików z testami](https://angular.io/guide/testing#test-file-name-and-location).

### Struktura testu

Testy są znajdowane przez Jasmine na podstawie ścieżki i nazwy pliku, są to po prostu pliki o strukturze: 

```javascript
describe("A suite is just a function", () => {
  let a;

  it("and so is a spec", () => {
    a = true;

    expect(a).toBe(true);
  });
});
```

```bash
Randomized with seed 12095
Started
.


1 spec, 0 failures
Finished in 0.008 seconds
Randomized with seed 12095 (jasmine --random=true --seed=12095)

```

Nawet doświadczonemu programiście przyzwyczajonemu do testów backendu powyższy przykład może wydawać się mało intuicyjny, na szczęście jest to tylko złudzenie.

**describe** - to funkcja opisująca zestaw testów, jako pierwszy parametr przyjmuje opis zestawu, jako drugi funkcję zawierającą poszczególne przypadki testowe.

**it** - funkcja opisująca pojedynczy przypadek testowy, tak samo jako **describe** pierwszym parametrem jest opis, drugim funkcja zawierający faktyczny test.

**expect** - przyjmuje bieżącą wartość i porównuje ją za pomocą wbudowanych metod porównujących z oczekiwaną wartością, w powyższym przypadku jest to **toBe**, ale są dostępne bardziej specyficzne porównania albo ich zaprzeczenia (np. **not.toBeNull**, **toBeUndefined** etc.)

Dostępne są również funkcje wykonujące się przed lub po wszystkich testach, lub każdym (**beforeEach**, **afterEach**, **beforeAll**, **afterAll**), przykładowo:

```javascript
describe("Test for resetting value before each test", () => {
  let value;

  beforeEach(() => {
    value = 0;
  });

  it("value should be 1", () => {
    value = value + 1;
    expect(value).toBe(1);
  });
  
  it("value should be 0", () => {
    expect(value).toBe(0);
  });

});
```

```bash
Randomized with seed 22493
Started
..


2 specs, 0 failures
Finished in 0.009 seconds
Randomized with seed 22493 (jasmine --random=true --seed=22493)
```

Jeśli chcemy wyłączyć dany zestaw testów, lub pojedynczy przypadek testowy, możemy posłużyć się funkcjami **xdescribe** lub **xit**, **fdescribe** oraz **fit** służą po to, by wyłączyć resztę testów, a zostawić te oznaczone właśnie tą literką f (od *focus*). Jest to szczególnie przydatne gdy pracujemy nad nowymi funkcjonalnościami i nie chcemy marnować czasu na wykonywanie testów, które w tym momencie są nieistotne.

Jak widać na powyższych przykładach podstawy frameworka Jasmine są proste, sama instalacja i konfiguracja nie jest specjalnie skomplikowana, a w przypadku Angulara CLI wszystko mamy już dostępne po instalacji. Ten wpis jest wprowadzeniem do testów jednostkowych we frontendzie, w następnej odsłonie pokażemy jak mockować lub stubować zależności w komponentach angularowych i serwisach. 


