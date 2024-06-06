---
layout:    post
title:     Czy wiesz, jak używać operatorów "?" i "!" w JavaScript i TypeScript?
date:      2024-04-19T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-04-19-czy-wiesz-jak-uzywac-operatorow-w-javascripcie-i-typescripcie/question-marks.webp
tags:
- javascript
- typescript
---

Wykrzykniki i znaki zapytania mogą czasami wprawić w zakłopotanie, ponieważ dalece im w kodzie od swojego interpunkcyjnego znaczenia.

Na początek spójrzmy na wykrzyknik. W TypeScript może być on używany jako tzw. non-null assertion operator. Oznacza to, że znak `!` możemy potraktować jako informację dla kompilatora, że dana zmienna nie będzie miała wartości `null` ani `undefined` w momencie użycia. 
```typescript
let dlugosc: number = zmienna.length;  // Błąd kompilacji, ponieważ zmienna może być null
let dlugosc: number = zmienna!.length; // Kompilator taką linijkę kodu przepuści
```
Jest to do pewnego stopnia obejście mechanizmu sprawdzania typów i powinno się go używać z rozwagą. Taki kod staje się mniej czytelny, a kompilator przestaje kontrolować miejsca, które mogą spowodować wystąpienie błędu w czasie działania programu. Rozważniejszym podejściem jest weryfikowanie, czy zmienna nie ma wartości `null` lub `undefined` i osobna obsługa takich sytuacji.

W czystym JavaScript `!` przed zmienną działa jako operator negacji logicznej. Kiedy używamy go przed wyrażeniem lub zmienną, neguje wartość logiczną tego wyrażenia. Na przykład:
```javascript
let prawda = true;
let falsz = !prawda; // falsz = false
```

Operator neguje wartość zmiennej, dodatkowo konwertując ją na zmienną typu boolean. Wiedząc to, możemy używać podwójnego zaprzeczenia `!!`, aby konwertować wartości na korespondującą z nimi wartości boolean. Poniżej kilka przykładów:
```javascript
!!""        // zwraca false
!!"wartość" // zwraca true
!!0         // zwraca false
!!1         // zwraca true
!![1, 2]    // zwraca true
!![]        // zwraca... true
```
`!!` występuje w kodzie raczej rzadko, ale warto wiedzieć, co oznacza.

Pozostał nam jeszcze znak zapytania. Zacznijmy od TypeScript. Możemy się nim posłużyć definiując interfejs, aby wskazać, które pola są opcjonalne:
```typescript
interface Person {
  name: string;
  age?: number; // age jest opcjonalne
}
 
const person: Person = { name: 'John' }; // Nie powoduje błędu kompilacji
```

Z kolei w JavaScript może służyć jako operator warunkowy do zapisywania wyrażenia `if-else` w skróconej formie:
```javascript
const age = 20;
const canVote = age >= 18 ? true : false;
```

W przypadku prostych warunków, które weryfikują istnienie wartości, warto wykorzystać operator `??` (null coalescing operator), który zwróci wartość po lewej stronie operatora jeśli jest ona różna od `null` i `undefined`, a w przeciwnym wypadku - po prawej stronie.
```javascript
null ?? "hello"      // "hello"
undefined ?? "hello" // "hello"
"world" ?? "hello"   // "world"
"" ?? "hello"        // ""
0 ?? "hello"         // 0
```
Warto tutaj wspomnieć, że operator alternatywy `||` działa bardzo podobnie, ale dla dwóch ostatnich przykładów zwróciłby inną wartość (opiera się on na wartości logicznej a nie `null` czy `undefined`), więc nie można tych operatorów stosować zamiennie.
```javascript
"" || "hello"        // "hello"
0 || "hello"         // "hello"
```

Znak zapytania jest używany również jako operator zabezpieczający przed błędami, który pozwala na dostęp do właściwości obiektu, nawet jeśli nie jest ona zdefiniowana (optional chaining).
```typescript
const person = {
  name: 'John',
  address: {
    city: 'New York',
  },
};

 const country = person.address?.country; // Jeśli address nie istnieje, zwróci undefined i nie spowoduje wystąpienia błędu
```



Przydatne linki:
- [https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator)
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT)
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator)
- [https://www.typescriptlang.org/docs/handbook/2/objects.html#property-modifiers](https://www.typescriptlang.org/docs/handbook/2/objects.html#property-modifiers)