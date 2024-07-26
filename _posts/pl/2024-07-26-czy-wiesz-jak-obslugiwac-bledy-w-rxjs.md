---
layout:    post
title:     Czy wiesz, jak obsługiwać błedy w rxjs?
date:      2024-07-26T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: ptatarski
image: /assets/img/posts/2024-07-26-czy-wiesz-jak-obslugiwac-bledy-w-rxjs/thumbnail.webp
tags:
- rxjs
- javascript
---

Biblioteka rxjs dostarcza kilka mechanizmów, które ułatwiają reagowanie na nieprzewidziane sytuacje występujące podczas procesowania strumienia danych w aplikacji.

## Operator catchError

Jednym z najpopularniejszych jest operator `catchError`. Operator ten pozwala nam zareagować na sytuację, kiedy w strumieniu z jakiegoś powodu nagle wystąpi błąd. Zamiast brzydkiego błędu w konsoli możemy w `catchError` dostarczyć `Observable`, który będzie przetwarzany dalej w strumieniu.

Ważne, aby `catchError` znajdował się po operacji, w której wystąpi błąd. Inaczej nie nie zostanie przechwycony.

Przykładowy kod:
```javascript
of(1, 2, 3, 4, 5)
  .pipe(
    catchError(() => of(99)), // Ten catchError nie obsłuży błędu występującego niżej
    map((num) => {
      if (num === 4) {
        throw new Error('test');
      }
      return num;
    }),
    catchError((error) => of(`Złapano błąd ${error}`))
  )
  .subscribe({
    next: console.log,
    error: (err) => console.log('error', err.message),
    complete: () => console.log('completed'),
  });
// 1
// 2
// 3
// Złapano błąd Error: test
// completed
```
Jak widać, błąd został złapany i nigdy nie wpadł w obsługę `error observera`.

## Operator retry

Kolejnym operatorem pozwalającym na obsługę błędów jest operator `retry`. Jak sama nazwa wskazuje, operator ten pozwala na ponowienie operacji. Jest to przydatne, jeżeli zakładamy, że operacja w strumieniu może się zakończyć niepowodzeniem z przyczyn niezależnych od użytkownika, np. niedostępności usługi. `retry` ponowi wtedy obsługę, zaczynając od początku strumienia.

Retry nie tylko pozwala nam zdefiniować liczbę (`count`) ponownych wywołań, lecz także odstęp między nimi (`delay`). Parametr `delay` może przyjmować wartość w milisekundach między wywołaniami lub funkcję zwracającą strumień.
- Jeżeli strumień w `delay` wyemituje wartość lub zakończy się bez emitowania wartości - `retry` ponowi operacje.
- Jeżeli strumień w `delay` zakończy się błędem - `retry` przerwie ponawianie operacji.

```javascript
of(1, 2, 3, 4, 5)
  .pipe(
    map((num) => {
      if (num === 4) {
        throw new Error('testowy error');
      }
      return num;
    }),
    retry({
      count: 3,
      delay: (error, retryCount) => {
        console.log(`delay ${1000 * retryCount}`);
        return timer(1000 * retryCount);
      },
    })
  )
  .subscribe({ error: (err) => console.log('error', err.message) });
    
// delay 1000
// delay 2000
// delay 3000
// error testowy error
```
W powyższym przykładzie nastąpiła trzykrotna próba ponowienia operacji, ale z każdą kolejną próbą odstęp między nimi jest zwiększany o sekundę.

## Przydatne linki
- Dokumentacja operatora `retry`: [https://rxjs.dev/api/index/function/retry](https://rxjs.dev/api/index/function/retry)
- Dokumentacja operatora `catchError`: [https://rxjs.dev/api/index/function/catchError](https://rxjs.dev/api/index/function/catchError)
- Wykonywalne kody z przykładów: [https://stackblitz.com/edit/rxjs-vmvukg?devtoolsheight=60&file=index.ts](https://stackblitz.com/edit/rxjs-vmvukg?devtoolsheight=60&file=index.ts), [https://stackblitz.com/edit/rxjs-mgmtg5?devtoolsheight=60&file=index.ts](https://stackblitz.com/edit/rxjs-mgmtg5?devtoolsheight=60&file=index.ts) 