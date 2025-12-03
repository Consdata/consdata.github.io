---
layout:    post
title:     Czy wiesz, że TypeScript ma typ bezpieczniejszy niż Any?
description: ""
date:      2025-12-03T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: wstolarski
image: /assets/img/posts/2025-12-03-czy-wiesz-ze-typescript-ma-typ-bezpieczniejszy-niz-any/thumbnail.webp
tags:
- typescript
---

W TypeScript, poza `string` czy `number`, mamy też kilka specjalnych typów do obsługi sytuacji, gdy nie znamy typu danych. Przyjrzyjmy się im z bliska.

## Any i unknown – podobieństwa i różnice

Na pierwszy rzut oka typy `any` i `unknown` wyglądają podobnie. Oba pozwalają przypisać do siebie dowolną wartość. To, co możemy potem z tym zrobić, nieco się różni.

### Typ any – "nie wiemy i nie interesuje nas to"
Typ `any` wyłącza sprawdzanie typów dla danej zmiennej w TypeScript. Kompilator nie sprawdza, co przypisujemy i jak używamy tej zmiennej. Możemy zrobić z nią wszystko, a ewentualny błąd zobaczymy dopiero w trakcie działania aplikacji.

```typescript
let drawer: any = "Old watch";
console.log(drawer.substring(6)); // Działa

drawer = { keys: 3 };
// Kompilator nie zgłasza błędu, ale runtime już tak:
console.log(drawer.substring(6)); // TypeError: drawer.substring is not a function
```

### Typ unknown – "nie wiemy, ale sprawdzimy"
Typ `unknown` jest bezpieczniejszą alternatywą dla `any`. Możemy przypisać dowolną wartość, ale TypeScript wymaga, by przed użyciem sprawdzić typ tej zmiennej. Dzięki temu nie popełnimy błędu w runtime.

```typescript
let box: unknown;
box = "keyboard";
console.log(box.toUpperCase()); 
// TypeScript zgłasza błąd kompilacji: 'box' is of type 'unknown'.

// Rozwiązaniem problemu jest sprawdzenie typu:
if (typeof box === "string") {
  console.log(box.toUpperCase());
}
```

## Typ never – "to się nigdy nie wydarzy"
Typ `never` oznacza, że funkcja nigdy nie zakończy swojego działania normalnie (np. zawsze rzuca wyjątek lub wpada w nieskończoną pętlę). 
Nie należy mylić tego z `void` (funkcja się kończy, ale nic nie zwraca). `never` sygnalizuje, że kod jest nieosiągalny.

### Przypadki użycia
Spójrzmy na kilka przykładów użycia typu `never`:
#### Funkcja, która zawsze rzuca błąd
```typescript
function error(message: string): never {
  throw new Error(message);
}

function fail(): never {
  return error("Something failed");
}
```
Funkcja `error()` nigdy nie zwraca wartości. Zawsze zatrzymuje program, rzucając błędem.

#### Funkcja z nieskończoną pętlą
```typescript
function infiniteLoop(): never {
  while (true) {}
}
```
Funkcja wpada w pętlę, z której nie ma wyjścia. Nigdy nie kończy swojego działania.

#### Sprawdzanie kompletności obsługi wariantów (Exhaustive Check)
```typescript
type Shape = 'circle' | 'square';

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 2;
    case 'square':
      return 4;
    default:
      // Jeśli dodamy nowy kształt, taki jak 'triangle', 
      // do typu, TypeScript wyświetli tutaj błąd,
      // ponieważ nowy kształt nie może być przypisany do never
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
  }
}
```
Typ `never` świetnie pilnuje, czy switch obsługuje wszystkie warianty typu.

## Kiedy i co wybrać?
- **unknown** – używajmy, gdy nie znamy typu danych (np. odpowiedź z API). To bezpieczny wybór, który wymusza weryfikację typu przed użyciem.
- **any** – najlepiej unikajmy `any` całkowicie. Wyłącza ono sprawdzanie typów, co jest głównym celem TypeScriptu. Włączmy w konfiguracji tryb `strict`, a dla nieznanych typów stosujmy bezpieczniejszy `unknown`.
- **never** – używajmy, by zaznaczyć, że dany kod jest nieosiągalny. Świetne do funkcji rzucających błędy i do pilnowania kompletności switcha.

## Dokumentacja
- [TypeScript: any](https://www.typescriptlang.org/docs/handbook/basic-types.html#any)
- [TypeScript: unknown](https://www.typescriptlang.org/docs/handbook/basic-types.html#unknown)
- [TypeScript: never](https://www.typescriptlang.org/docs/handbook/basic-types.html#never)
- [Mimo: never](https://mimo.org/glossary/typescript/never)
