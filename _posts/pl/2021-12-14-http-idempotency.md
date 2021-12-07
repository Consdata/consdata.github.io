---
layout:    post
title:     "Czy wiesz, czym jest idempotentność w metodach HTTP?"
date:      2021-12-14 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    fphilavong
image:     /assets/img/posts/2021-12-14-http-idempotency/http-idempotency.jpg
tags:
- http
---

Idempotentność to właściwość pewnych operacji, która pozwala na ich wielokrotne stosowanie bez zmiany wyniku. Informatyka, a w szczególności różnego rodzaju systemy rozproszone bardzo chętnie korzystają z idempotentnych rozwiązań. Łatwiej jest w końcu powtórzyć wykonanie operacji, jeśli nie mamy pewności czy doszła do skutku, zamiast ją weryfikować.

# Idempotentność w metodach HTTP
Jeśli przy projektowaniu API stosujemy się do zasad `REST`, otrzymujemy idempotentność dla metod HTTP `GET`, `PUT`, `DELETE`, `HEAD`, `OPTIONS` i `TRACE`. Tylko interfejsy `POST` nie będą idempotentne.

|Metoda HTTP|Idempotentność|
|-----------|--------------|
|OPTIONS    |tak           |
|GET        |tak           |
|HEAD       |tak           |
|PUT        |tak           |
|POST       |nie           |
|DELETE     |tak           |
|TRACE      |tak           |

Przeanalizujmy, w jaki sposób powyższe metody HTTP stają się idempotentne i dlaczego `POST` nią nie jest.

## POST
Zazwyczaj (ale nie musi być to regułą) metoda `POST` służy do tworzenia nowego zasobu na serwerze. Więc kiedy wywołamy to samo żądanie `POST` *N* razy otrzymamy *N* nowych zasobów na serwerze. Tak więc `POST` nie jest idempotentny.

## GET, HEAD, OPTIONS oraz TRACE
Metody `GET`, `HEAD`, `OPTIONS` i `TRACE` nie zmieniają stanu zasobów na serwerze. Służą one wyłącznie do pobierania reprezentacji zasobów lub metadanych w danym momencie. Tak więc wywoływanie wielu żądań nie będzie miało żadnej operacji zapisu na serwerze, co sprawia, że `GET`, `HEAD`, `OPTIONS` i `TRACE` są idempotentne.

## PUT
Zazwyczaj (ale nie musi być to regułą) do aktualizacji stanu zasobów używa się metody `PUT`. Jeśli wywołamy metodę `PUT` *N* razy, pierwsze żądanie zaktualizuje zasób; wtedy reszta żądań *N-1* będzie po prostu nadpisywać ten sam stan zasobów, raz za razem, niczego nie zmieniając. Stąd `PUT` jest idempotentny.

## DELETE
Gdy zawołamy *N* podobnych żądań `DELETE`, pierwsze żądanie usunie zasób, a odpowiedź będzie wynosić `200 (OK)` lub `204 (Brak treści)`. Inne żądania *N-1* zwrócą `404 (Nie znaleziono)`. Oczywiście odpowiedź różni się od pierwszego żądania, ale nie dochodzi do zmiany stanu żadnego zasobu po stronie serwera, ponieważ pierwotny zasób został już usunięty. Tak więc `DELETE` jest idempotentny.
