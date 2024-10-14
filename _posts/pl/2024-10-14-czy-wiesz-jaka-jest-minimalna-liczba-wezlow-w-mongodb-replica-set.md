---
layout:    post
title:     Czy wiesz, jaka jest minimalna liczba węzłów w MongoDB replica set?
description: "Krótko o tym, jak działa algorytm wyboru nowego węzła PRIMARY w replice MongoDB i jaka jest rola węzłów SECONDARY."
date:      2024-10-14T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: jwilczewski
image: /assets/img/posts/2024-10-14-czy-wiesz-jaka-jest-minimalna-liczba-wezlow-w-mongodb-replica-set/thumbnail.webp
tags:
- mongodb
- replica set
---

Aby skorzystać z korzyści, które daje replica set potrzebne są przynajmniej trzy węzły. Warto jednak wyjaśnić dlaczego tak jest. Taka sytuacja jest ściśle powiązana z algorytmem wyboru nowego węzła `PRIMARY` w replice. W replice MongoDB jeden z węzłów pełni rolę węzła `PRIMARY` i tylko on obsługuje operacje zapisu. Pozostałe węzły (`SECONDARY`) odczytują zapisane operacje z operation loga i nanoszą je na swoje zbiory danych.

Wybór nowego węzła `PRIMARY` następuje w przypadku:
- dodania nowego węzła do repliki,
- zainicjowania repliki,
- działań administracyjnych np. `rs.stepDown()` lub `rs.reconfig()`,
- sytuacji, w której węzły `SECONDARY` utracą połączenie do węzła `PRIMARY`.

W powyższych sytuacjach uruchamiany jest algorytm głosowania mający wyłonić nowy węzeł `PRIMARY`. Algorytm ten mówi, że węzeł może zostać węzłem `PRIMARY` jeżeli zdobędzie co najmniej `(n / 2) + 1` głosów, gdzie `n` jest aktualną liczbą głosujących węzłów w replice (replika może posiadać do 7 węzłów biorących udział w głosowaniu).

<div class="img-with-legend">
<img alt="Wybór nowego węzła PRIMARY" src="/assets/img/posts/2024-10-14-czy-wiesz-jaka-jest-minimalna-liczba-wezlow-w-mongodb-replica-set/1.svg" />
<span class="img-legend">Źródło: <a href="https://www.mongodb.com/docs/manual/core/replica-set-elections/">www.mongodb.com</a> - dostęp: 2024-08-12</span>
</div>

Rozważmy teraz sytuację repliki zawierającej trzy węzły, w której tracimy węzeł `PRIMARY`. W takiej sytuacji w replice pozostają dwa węzły głosujące, a więc potrzebne są `(2 / 2) + 1 = 2` głosy, aby węzeł przejął rolę `PRIMARY`.

W przypadku repliki, która miałby mieć tylko dwa węzły, utrata jednego z nich doprowadza do sytuacji, w której wymagane są `(1 / 2) + 1 = 1.5` głosy, czyli nie jest możliwy wybór nowego węzła `PRIMARY`. Takie zachowanie ma sens, gdyż w przypadku braku komunikacji między dwoma węzłami w replice, każdy z węzłów mógłby określić się jako węzeł `PRIMARY`. Co za tym idzie potrzebujemy co najmniej dwóch węzłów do skutecznego wyboru węzła `PRIMARY`,a więc jeżeli chcemy zabezpieczyć replikę na wypadek utraty jednej z maszyn potrzebujemy ich co najmniej trzy.

W przypadku, w którym występują ograniczenia sprzętowe i nie jesteśmy w stanie posiadać węzła `PRIMARY` i dwóch pełnoprawnych, przechowujących dane węzłów `SECONDARY` możemy zastosować architekturę, w której jeden z węzłów `SECONDARY` zastępujemy węzłem typu `ARBITER`. Taki węzeł nadal bierze udział w głosowaniu, ale nie przechowuje danych, może więc być zainstalowany na maszynie o niskich zasobach sprzętowych.

## Przydatne linki
- [https://www.mongodb.com/docs/manual/replication/](https://www.mongodb.com/docs/manual/replication/)
- [https://www.mongodb.com/docs/manual/core/replica-set-elections/](https://www.mongodb.com/docs/manual/core/replica-set-elections/)
- [https://www.mongodb.com/docs/manual/core/replica-set-architecture-three-members/](https://www.mongodb.com/docs/manual/core/replica-set-architecture-three-members/)