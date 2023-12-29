---
layout:    post
title:     "Czy wiesz czym jest i jak działa WebWorker?"
date:      2024-02-23T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-02-23-czy-wiesz-czym-jest-i-jak-dziala-webworker/code.webp
tags:
- javascript
- webworkers
---
JavaScript, który wywołujemy na naszych stronach w postaci skryptów jest jednowątkowy. Jeżeli zdecydujemy się używać go do wykonywania zasobożernych obliczeń, może spowodować to, że interfejs użytkownika stanie się nieresponsywny.

Z pomocą przychodzą nam webworkery. Jest to natywny mechanizm HTML5 API, który możemy wykorzystać bez żadnych dodatkowych bibliotek. Polega on na oddelegowywaniu operacji do specjalnie utworzonych wątków działających niezależnie od naszej aplikacji.

Aby utworzyć nowy wątek należy stworzyć instancję klasy `Worker`:
```javascript
var worker = new Worker('worker.js');
```

Dane można wysyłać do niego metodą `postMessage()`:
```javascript
worker.postMessage(dataToSend);
```

Z kolei sam worker musi nasłuchiwać na dane za pomocą listenera (znajduje się on w skrypcie `worker.js` przekazanym jako parametr do konstruktora)
```javascript
self.addEventListener('message', (event) => {
    // obsługa wejścia
});
```

Worker utworzony w ten sposób zostaje zakończony razem z zamknięciem strony, która powołała go do życia. Możemy również sami go zakończyć za pomocą polecenia:
```javascript
worker.terminate();
```

Workery mają pewne ograniczenia:
- nie mamy dostępu do naszej struktury DOM, ani obiektów `window` i `document`,
- obiekt `location` jest tylko do odczytu, nie będziemy mogli z poziomu workera przekierowywać strony, ani tworzyć nowej zakładki,
- worker nie może istnieć sam w oderwaniu od strony, która go utworzyła.

Poniżej kilka typowych przykładów użyć webworkerów:
- obliczenia w tle: webworkery są wykorzystywane do wykonywania długo trwających obliczeń w tle, takich jak przetwarzanie dużych zestawów danych czy złożone algorytmy, które mogłyby spowolnić działanie interfejsu użytkownika,
- manipulacja na multimediach: webworkery są stosowane do manipulacji obrazami, dźwiękiem i wideo w tle. Mogą pomóc w przetwarzaniu, optymalizacji, tworzeniu miniatur czy konwersji formatów,
- asynchroniczne żądania sieciowe: webworkery pozwalają na wykonywanie asynchronicznych żądań sieciowych, takich jak pobieranie danych z serwera czy przetwarzanie odpowiedzi HTTP,
- WebAssembly: webworkery są również używane w połączeniu z WebAssembly, umożliwiając wykonywanie bardziej zaawansowanych obliczeń, które są zoptymalizowane pod kątem wydajności.

## Przydatne linki
- Can I use dla Web Workers: [https://caniuse.com/webworkers](https://caniuse.com/webworkers)
- Dokumentacja na MDN: [https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API?retiredLocale=pl](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API?retiredLocale=pl)