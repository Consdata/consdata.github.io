---
layout:    post
title:     "Czy wiesz co się dzieje, kiedy nie stawiasz średników w JS?"
date:      2021-07-19 8:00:00 +0100
published: false
didyouknow: true
lang: pl
author:    pgrobelny
image:     /assets/img/posts/2021-07-19-sredniki-w-js/semicolon.jpg
tags:
- javascript
---
Każdemu zdarza się czasem zapomnieć postawić średnika na końcu linijki. Powinny to wyłapywać reguły zawarte w narzędziach takich jak TSLint, ESList, lecz czasami mimo ich pomocy zapominamy o tym. I co wtedy? Niby nic się nie dzieje, a kod dalej działa według naszej myśli, tylko dlaczego z jakiegoś powodu wszyscy każą stawiać te średniki?

### Automatic Semicolon Insertion
JavaScript nie wymaga od nas stawiania średników. Posiada automat (Automatic Semicolon Insertion, w skrócie ASI), który interpretuje nasz kod i wstawia je za nas. Opiera się w skrócie na kilku zasadach: kiedy kończymy linijkę używając "}", kiedy jest to koniec pliku, kiedy w linijce użyjemy któregoś z słów kluczowych: return, break, throw, continue oraz kiedy nowa linijka powoduje błąd w połączeniu z następną.

Nie powinniśmy jednak opierać w pełni na tych zasadach, bo łatwo można popełnić błąd, który ASI zinterpretuje w zaskakujący sposób:

```javascript
const test = 12
['c','d'].forEach((letter) => console.log(letter))
// Cannot read property 'forEach' of undefined
```
Dzieje się tak, ponieważ JS spróbował połączyć ze sobą 12 i ['c','d'].

Podobny przykład:
```javascript
var a = 1
var b = a
(a+b).toString()
// Uncaught TypeError: a is not a function
```
Co powinniśmy w takim razie robić? Nie opierać się na ASI ponieważ, nie jesteśmy w stanie całkowicie zdać się na niego. Stawiajmy wszędzie średniki, żeby uniknąć niekonsekwencji w naszym kodzie.

Po więcej informacji odsyłam do [dokumentacji](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion).
