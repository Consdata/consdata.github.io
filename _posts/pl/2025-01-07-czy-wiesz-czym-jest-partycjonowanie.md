---
layout:    post
title:     Czy wiesz czym jest partycjonowanie?
date:      2025-01-07T08:00:00+01:00
published: true
didyouknow: true
description: ""
lang: pl
author: rmastalerek
image: /assets/img/posts/2025-01-07-czy-wiesz-czym-jest-partycjonowanie/thumbnail.webp
tags:
- databases
---

Partycjonowanie tabel to technika projektowania bazy danych, która pozwala podzielić dużą tabelę na mniejsze, łatwiejsze w zarządzaniu kawałki zwane partycjami.  Każda partycja to oddzielna tabela przechowująca podzbiór oryginalnych danych. 

## Korzyści
- Poprawa wydajności zapytań - partycjonowanie pozwala bazie danych zawęzić dane do konkretnej partycji, zmniejszając ilość danych, które muszą być przeszukane
- Łatwiejsze zarządzanie danymi - dzięki podziałowi na mniejsze zestawy danych zarządzanie nimi jest prostsze
- Szybsze ładowanie danych i indeksowanie - podczas ładowania danych do partycjonowanej tabeli proces może być zrównoleglony, co prowadzi do szybszego pobierania danych
- Tańsze przechowywanie danych - partycjonowanie pozwala przechowywać starsze lub rzadziej używane dane na tańszych nośnikach pamięci, jednocześnie utrzymując często używane dane na szybszych urządzeniach

## Wady
- Złożoność - partycjonowanie może sprawić, że bazy danych będą o wiele bardziej złożone, ponieważ wymaga tworzenia wielu tabel i partycji oraz zarządzania nimi. To z kolei może negatywnie wpłynąć na ich utrzymywanie, zrozumienie ich oraz nawigowanie po ich strukturze
- Partycjonowanie narzutowe - może zwiększyć obciążenie bazy danych, ponieważ wymaga większej liczby zasobów do zarządzania wieloma partycjami. Efektem (takiego działania) może być spowolnione działanie, szczególnie podczas dodawania lub aktualizowania danych
- Złożoność zapytań - zapytania obejmujące wiele partycji mogą być bardziej złożone, ponieważ mogą wymagać łączenia danych z wielu źródeł. To z kolei może doprowadzić do wolniejszego wykonywania zapytań
- Spójność danych - partycjonowanie może utrudnić zapewnienie spójności danych, ponieważ dane są rozproszone na wielu partycjach. Może to utrudnić utrzymanie ograniczeń i zapewnienie integralności danych
- Migracja danych - jeżeli zajdzie potrzeba zmiany strategii partycjonowania lub przeniesienia danych pomiędzy partycjami, to w takim środowisku może to być złożony i czasochłonny proces
- Brak elastyczności - strategie partycjonowania opierają się zwykle na określonej kolumnie lub zestawie kolumn, a ich zmiana lub dostosowanie w przypadku zmiany danych lub wymagań może być trudne

## Metody partycjonowania na przykładzie PostgreSQL

PostgreSQL oferuje 3 metody partycjonowania tabel:

### Partycjonowanie zakresowe (ang. Range partitioning)

Ten rodzaj partycjonowania polega na podziale danych na partycje na podstawie zakresu wartości. Każda partycja przechowuje podzbiór danych, które mieszczą się w określonym zakresie. Przykładowo, jeśli mamy tabelę z datami zamówień od 2000 do 2023 roku, możemy podzielić tę tabelę na partycje, gdzie każda z nich przechowywać będzie zamówienia z jednego roku. W ten sposób, kiedy wykonujemy zapytanie dotyczące zamówień z 2020 roku, PostgreSQL musi przeszukać tylko tę partycję, której dane dotyczą, a nie całą tabelę. 

Przykład:
```sql
-- struktura tabeli
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    sale_date DATE,
    product_id INT,
    quantity INT,
    amount NUMERIC
) partition by range (sale_date);

-- tworzenie partycji
CREATE TABLE sales_2021 PARTITION OF sales
    FOR VALUES FROM ('2021-01-01') TO ('2022-01-01');

CREATE TABLE sales_2022 PARTITION OF sales
    FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');

CREATE TABLE sales_2023 PARTITION OF sales
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- niezbędne ograniczenia
ALTER TABLE sales_2021 ADD CONSTRAINT sales_2021_check
    CHECK (sale_date >= '2021-01-01' AND sale_date < '2022-01-01');

ALTER TABLE sales_2022 ADD CONSTRAINT sales_2022_check
    CHECK (sale_date >= '2022-01-01' AND sale_date < '2023-01-01');

ALTER TABLE sales_2023 ADD CONSTRAINT sales_2023_check
    CHECK (sale_date >= '2023-01-01' AND sale_date < '2024-01-01');

-- przykładowe dane
INSERT INTO sales (sale_date, product_id, quantity, amount)
VALUES ('2021-01-15', 101, 5, 100.00);

INSERT INTO sales (sale_date, product_id, quantity, amount)
VALUES ('2022-02-20', 102, 10, 200.00);

INSERT INTO sales (sale_date, product_id, quantity, amount)
VALUES ('2023-03-10', 103, 8, 150.00);

-- Przykładowe zapytania wykorzystujące utworzone partycje

-- Pobranie danych z 2021 roku
SELECT * FROM sales WHERE sale_date >= '2021-01-01' AND sale_date < '2022-01-01';

-- Pobranie danych z 2022 roku
SELECT * FROM sales WHERE sale_date >= '2022-01-01' AND sale_date < '2023-01-01';

-- Pobranie danych z 2023 roku
SELECT * FROM sales WHERE sale_date >= '2023-01-01' AND sale_date < '2024-01-01';
```

### Partycjonowanie listowe (ang. List partitioning)

Jest to metoda partycjonowania, który polega na podziale danych na partycje na podstawie listy wartości. Każda partycja przechowuje bowiem podzbiór danych, które pasują do określonej wartości lub zestawu wartości. Przykładowo, jeśli mamy tabelę produktów, gdzie każdy produkt może mieć określony typ, możemy podzielić ją na partycje tak, aby każda partycja przechowywała zamówienia tylko jednego typu. Wykonując zapytanie dotyczące określonego typu produktu, PostgreSQL przeszukuje tylko tę partycję, która dotyczy podanego typu. 

Przykład:
```sql
-- struktura tabeli
CREATE TABLE products (
                          product_id SERIAL PRIMARY KEY,
                          category TEXT,
                          product_name TEXT,
                          price NUMERIC
) partition by list(category);

-- tworzenie partycji
CREATE TABLE electronics PARTITION OF products
    FOR VALUES IN ('Elektronika');

CREATE TABLE clothing PARTITION OF products
    FOR VALUES IN ('Odzież');

CREATE TABLE furniture PARTITION OF products
    FOR VALUES IN ('Meble');

-- przykładowe dane
INSERT INTO products (category, product_name, price)
VALUES ('Elektronika', 'Telefon', 500.00);

INSERT INTO products (category, product_name, price)
VALUES ('Odzież', 'T-Shirt', 25.00);

INSERT INTO products (category, product_name, price)
VALUES ('Meble', 'Sofa', 800.00);

-- Przykładowe zapytania wykorzystujące utworzone partycje

-- Wypisz produkty z kategorii Elektronika
SELECT * FROM products WHERE category = 'Elektronika';

-- Wypisz produkty z kategorii Odzież
SELECT * FROM products WHERE category = 'Odzież';

-- Wypisz produkty z kategorii Meble
SELECT * FROM products WHERE category = 'Meble';
```

### Partycjonowanie hashowe (ang. Hash partitioning)

Ta metoda partycjonowania polega na podziale danych na partycje na podstawie wartości hash'owej. Każda partycja przechowuje podzbiór danych, które pasują do określonej wartości wspomnianego hasha. Przykładowo, jeśli mamy tabelę zamówień z różnymi identyfikatorami klientów, możemy podzielić tę tabelę na partycje tak, aby każda z nich przechowywała zamówienia o określonej wartości hasha identyfikatora klienta. W ten sposób, chcąc pobrać zamówienia danego klienta, możemy przeszukać tylko jeden, konkretny podzbiór danych.

Przykład:
```sql
-- struktura tabeli
CREATE TABLE orders (
                        order_id SERIAL PRIMARY KEY,
                        order_date DATE,
                        customer_id INT,
                        total_amount NUMERIC
) partition by hash(customer_id);

-- tworzenie partycji
CREATE TABLE orders_1 PARTITION OF orders
    FOR VALUES WITH (MODULUS 3, REMAINDER 0);

CREATE TABLE orders_2 PARTITION OF orders
    FOR VALUES WITH (MODULUS 3, REMAINDER 1);

CREATE TABLE orders_3 PARTITION OF orders
    FOR VALUES WITH (MODULUS 3, REMAINDER 2);

-- przykładowe dane
INSERT INTO orders (order_date, customer_id, total_amount)
VALUES ('2023-01-15', 101, 500.00);

INSERT INTO orders (order_date, customer_id, total_amount)
VALUES ('2023-02-20', 102, 600.00);

INSERT INTO orders (order_date, customer_id, total_amount)
VALUES ('2023-03-10', 103, 700.00);

-- Przykładowe zapytania wykorzystujące utworzone partycje

-- Pobierz zamówienia dla klienta z ID = 101
SELECT * FROM orders WHERE customer_id = 101;

-- Pobierz zamówienia dla klienta z ID = 102
SELECT * FROM orders WHERE customer_id = 102;

-- Pobierz zamówienia dla klienta z ID = 103
SELECT * FROM orders WHERE customer_id = 103;
```

## Podsumowanie

Warto zauważyć, że partycjonowanie nie zawsze musi być najlepszym rozwiązaniem. Należy pamiętać o tym, aby przeanalizować wszystkie potencjalne wady i zalety wdrożenia tego rozwiązania i na tej podstawie zdecydować, czy jest to właściwe podejście w konkretnym scenariuszu. Ponadto, ważne jest także dokładne zaplanowanie i przetestowanie strategii partycjonowania przed wdrożeniem jej w środowisku produkcyjnym.

W kolejnym wpisie przyjrzymy się bliżej narzędziu do automatyzacji procesu partycjonowania: PostgreSQL Partition Manager