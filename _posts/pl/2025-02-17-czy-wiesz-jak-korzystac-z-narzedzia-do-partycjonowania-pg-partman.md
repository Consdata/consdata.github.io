---
layout:    post
title:    Czy wiesz jak korzystać z narzędzia do partycjonowania pg_partman?
description: ""
date:      2024-02-17T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: rmastalerek
image: /assets/img/posts/2025-02-17-czy-wiesz-jak-korzystac-z-narzedzia-do-partycjonowania-pg-partman/thumbnail.webp
tags:
- databases
---

We wpisie [Czy wiesz czym jest partycjonowanie?]({% post_url pl/2025-01-06-czy-wiesz-czym-jest-partycjonowanie %}) dowiedzieliśmy się już czym jest partycjonowanie, do czego służy i jak może ułatwić pracę. W tym wpisie poznamy narzędzie, które upraszcza nam tworzenie i zarządzanie partycjami w PostgreSQL o nazwie PostgreSQL Partition Manager (pg_partman). W skrócie PostgreSQL Partition Manager to rozszerzenie dla PostgreSQL, które automatyzuje proces zarządzania partycjami w bazie danych.

### Korzyści z używania pg_partman
- Automatyczne tworzenie, rotacja i usuwanie partycji
- Wsparcie dla różnych metod partycjonowania (zakresowe i listowe)
- Możliwość dostosowania zachowania `pg_partman` do specyficznych potrzeb aplikacji

### Instalacja
```sql
CREATE EXTENSION pg_partman;
```
- Wykonanie tego polecenia powoduje instalację rozszerzenia `pg_partman` w bazie danych, jeśli to nie zostało wcześniej w tej bazie dodane.
PostgreSQL tworzy odpowiednie wpisy w katalogach systemowych (np. `pg_extension`). 
- Następnie, PostgreSQL tworzy zestaw funkcji, procedur, widoków, tabel i innych obiektów potrzebnych do działania rozszerzenia. Wszystkie te obiekty są instalowane w schemacie, w którym uruchomiono polecenie (zazwyczaj `public`).
- Instalowana jest domyślna wersja rozszerzenia, która znajduje się w katalogu rozszerzeń PostgreSQL (pliki `.control` i `.sql`). Jeżeli później zajdzie potrzeba, można zaktualizować rozszerzenie za pomocą polecenia `ALTER EXTENSION ... UPDATE`.

### Utworzenie tabeli i konfiguracja do partycjonowania
Wyobraźmy sobie tabelę `public_logs`, która służyć będzie do przechowywania logów systemowych lub logów z aplikacji. Tabela będzie potrzebna do monitorowania działania aplikacji, generowania raportów o wydajności i problemach, itp.

Logi są zazwyczaj generowane w bardzo dużej ilości, szczególnie w aplikacjach o dużym ruchu. Bez odpowiedniej optymalizacji, zapytania do tabeli z milionami lub miliardami wierszy mogą stać się mało wydajne. Partycjonowanie pomaga rozwiązać ten problem.

**Zalety:**
- Dzięki podziałowi tabeli na partycje (np. miesięczne, dzienne, itp.), zapytania mogą być kierowane tylko do wybranych partycji zamiast całej tabeli.
- Logi starsze niż określony okres (np. 3 miesiące) mogą być łatwo usuwane przez usunięcie całej partycji, zamiast kasowania poszczególnych wierszy
- Możliwe jest archiwizowanie starych partycji na innych nośnikach
- Partycjonowanie ułatwia reorganizację danych, np. odtworzenie partycji po awarii

```sql
CREATE TABLE public_logs (
    id serial PRIMARY KEY,
    log_date timestamptz NOT NULL,
    log_level text NOT NULL,
    message text
) PARTITION BY RANGE (log_date);
```

Wykonanie powyższego polecenia spowoduje: 
- Utworzenie przez PostgreSQL **nadrzędnej** tabeli `public_logs` (_partitioned_table_), która ma strukturę określoną w poleceniu. W odróżnieniu od zwykłych tabel, tabela nadrzędna nie przechowuje danych. Jest tylko szablonem, który pozwala na logiczne grupowanie partycji.
- Określenie metody partycjonowania: w tym przypadku `PARTITION BY RANGE (log_date)`. Oznacza to, że dane w tej tabeli będą przechowywane w partycjach na podstawie wartości kolumny `log_date`. Każda partycja natomiast będzie odpowiadała pewnemu zakresowi wartości (np. tygodniowi, miesiącowi, itd.).

### Konfiguracja pg_partman do zarządzania partycjami 
```sql
SELECT partman.create_parent('public_logs', 'log_date', 'monthly');
```
Wykonanie powyższego polecenia spowoduje:
- Oznaczenie tabeli `public_logs` jako tabeli nadrzędnej dla partycjonowania zarządzanego przez `pg_partman`.
- Automatyczne utworzenie metody partycjonowania (`RANGE` na podstawie kolumny `log_date`)
- Utworzenie pierwszych partycji zgodnie z określonym interwałem (`monthly`)
- Zarejestrowanie tabeli w konfiguracji `pg_partman`, aby była zarządzana automatycznie 

### Automatyczne tworzenie partycji
`pg_partman` umożliwia automatyczne tworzenie nowych partycji na podstawie harmonogramu. Aby wykonać taką partycję wystarczy wykonać poniższe polecenie. Można wykonać je również w zadaniu cron, aby regularnie tworzyć nowe partycje i usuwać stare.
```sql
SELECT partman.run_maintenance('public_logs');
```

### Przykładowe zapytania
```sql
-- Wstawianie danych
INSERT INTO public_logs (log_date, log_level, message) 
VALUES (NOW(), 'INFO', 'System started');

-- Zapytanie do partycji
SELECT * FROM public_logs WHERE log_date BETWEEN '2023-01-01' AND '2023-01-31';
```

Po wykonaniu operacji `INSERT` PostgreSQL automatycznie przypisuje dane do odpowiedniej partycji na podstawie wartości kolumny partycjonującej, np. daty w przypadku partycjonowania zakresowego. `pg_partman` nie ingeruje bezpośrednio w proces INSERT, ale zapewnia, że odpowiednie partycje są dostępne w momencie wstawiania danych.

### Alternatywy
1. Native PostgreSQL Partitioning - PostgreSQL od wersji 10 ma wbudowane wsparcie dla partycjonowania, które może być wystarczające dla prostszych przypadków użycia
2. `pg_cron` - umożliwia zarządzanie harmonogramem zadań bezpośrednio w PostgreSQL, co może być używane w połączeniu z natywnym partycjonowaniem
3. `pg_slice` - alternatywne rozszerzenie do zarządzania partycjami, bardziej elastyczne dla specyficznych scenariuszy

### Podsumowanie
PostgreSQL Partition Manager (pg_partman) to potężne narzędzie do zarządzania partycjami w dużych tabelach. Dzięki automatyzacji i elastyczności pozwala na efektywne zarządzanie danymi, poprawiając wydajność systemu. Warto rozważyć je tam, gdzie wydajność i skalowalność są kluczowe, zwłaszcza w porównaniu z natywnymi rozwiązaniami PostgreSQL i innymi narzędziami dostępnymi na rynku.