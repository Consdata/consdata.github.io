---
layout:    post
title:     "Jak zmusić mongodb do użycia indeksu bez zmiany kodu - zastosowanie index filter"
date:      2023-10-01T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: jwilczewski
image: /assets/img/posts/2023-10-06-jak-zmusic-mongodb-do-uzycia-indeksu-bez-zmiany-kodu/mongodb.jpg
tags:
- mongodb
- index
- planCacheSetFilter
- index filter
- query shape
---

## Optymalizotory zapytań

Optymalizator zapytania to element silnika bazy danych, który dba o to, aby zapytanie zostało wykonane w optymalny sposób, uwzględniając zbiór danych przechowywanych w danym momencie w bazie. Pod pojęciem optymalny mamy zazwyczaj na myśli taki sposób, który zwróci nam wynik zapytania w najkrótszym czasie. Optymalizator bierze pod uwagę statystyki gromadzone i aktualizowane na bieżąco podczas działania bazy danych. Optymalizatory są w wbudowane zarówno w bazy SQL'owe jak i bazy NoSQL. Sposób działania optymalizatora dla mongodb możemy znaleźć na stronie: [https://www.mongodb.com/docs/v7.0/core/query-plans/](https://www.mongodb.com/docs/v7.0/core/query-plans/). W znakomitej większości przypadków optymalizatory są dużym ułatwieniem dla programistów, którzy nie muszą poświęcać czasu na analizę rozkładu danych w poszczególnych tabelach/kolekcjch i samodzielnie optymalizować wykonywanych zapytań. Z uwagi na to, że optymalizator działa bez kontroli programisty zdarzają się jednak sytuacje, w których jego zachowanie jest dla nas zaskakujące i może prowadzić do problemów wydajnościowych.   

## Analiza problemów wydajnościowych



## Sprawdzamy plan zapytania

## Dlaczego mongodb nie używa indeksu

## Wymuszenie użycia indeksu na live'ie

## Wnioski

## tl;dr

# Źródła
