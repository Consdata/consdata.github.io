---
layout:    post
title:     "Czy wiesz, czym jest HTTP idempotency?"
date:      2021-12-14 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    fphilavong
image:     /assets/img/posts/2021-12-14-http-idempotency/http-idempotency.jpg
tags:
- http
---

Właściwość pewnych operacji, która umożliwia ich wielokrotne stosowanie bez zmiany wyniku, nazywamy trudnym polskim słowem ;) - idempotentność. Częściej spotkaliście się pewnie z angielskim tłumaczeniem - idempotency i też będziemy go tutaj używać.
Twórcy różnego rodzaju systemów rozproszonych, bardzo chętnie korzystają z idempotentnych rozwiązań. Kiedy nie mamy pewności czy jakaś konkretna operacja doszła do skutku, łatwiej jest przecież powtórzyć jej wykonanie, zamiast ją weryfikować.

# HTTP idempotency, czyli Idempotentność w metodach HTTP
Jeśli przy projektowaniu API stosujemy się do zasad `REST`, otrzymujemy HTTP idempotency dla `GET`, `PUT`, `DELETE`, `HEAD`, `OPTIONS` i `TRACE`. Tylko interfejsy `POST` nie będą idempotentne.

|Metoda HTTP|Idempotentność|
|-----------|--------------|
|OPTIONS    |tak           |
|GET        |tak           |
|HEAD       |tak           |
|PUT        |tak           |
|POST       |nie           |
|DELETE     |tak           |
|TRACE      |tak           |

W jaki sposób powyższe metody HTTP stają się idempotentne i dlaczego `POST` nią nie jest? Sprawdźcie konkretne metody i ich możliwości.

## POST
Metoda `POST` służy zazwyczaj do tworzenia nowego zasobu na serwerze, chociaż nie jest to reguła. Kiedy wywołamy to samo żądanie POST N razy, otrzymamy N nowych zasobów na serwerze. Tak więc POST nie jest idempotentny.

## GET, HEAD, OPTIONS oraz TRACE
Metody `GET`, `HEAD`, `OPTIONS` i `TRACE` nie zmieniają stanu zasobów na serwerze. Służą one wyłącznie do pobierania reprezentacji zasobów lub metadanych w danym momencie. W związku z tym, wywoływanie wielu żądań nie będzie miało żadnej operacji zapisu na serwerze, co sprawia, że `GET`, `HEAD`, `OPTIONS` i `TRACE` są idempotentne.

## PUT
Najczęściej do aktualizacji stanu zasobów używa się metody `PUT`. (I tutaj, tak jak w przypadku POST, nie musi to być to regułą). Jeśli wywołamy metodę PUT N razy, pierwsze żądanie zaktualizuje zasób. Wówczas reszta żądań N-1 będzie po prostu nadpisywać ten sam stan zasobów, raz za razem, niczego nie zmieniając. Dlatego właśnie `PUT` jest idempotentny.

## DELETE
Gdy z kolei zawołamy *N* podobnych żądań `DELETE`, pierwsze żądanie usunie zasób, a odpowiedź będzie wynosić `200 (OK)` lub `204 (Brak treści)`. Inne żądania *N-1* zwrócą `404 (Nie znaleziono)`. Oczywiście odpowiedź różni się od pierwszego żądania, ale nie dochodzi do zmiany stanu żadnego zasobu po stronie serwera, ponieważ pierwotny zasób został już usunięty. Tak więc `DELETE` jest idempotentny.
