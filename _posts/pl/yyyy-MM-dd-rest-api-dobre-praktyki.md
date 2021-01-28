---
layout:    post
title:     "REST API - dobre praktyki w praktyce (tytuł roboczy)"
date:      2021-01-11 08:00:00 +0100
published: true
lang:      pl
author:    bmitan
image:
tags:
    - rest
    - rest api
---


// TODO wstęp

## GET z dużą liczbą parametrów
### Opis problemu
O ile standard nie określa ograniczenia na rozmiar URI, to poszczególne implementacje już je mają. Zazwyczaj jest to między 2 KB a 8 KB i o ile po stronie serwerowej mamy nad tym kontrolę (w zależności od stosowanych technologii), o tyle przeglądarki mają różne ograniczenia. Bezpiecznie jest więc trzymać się dolnej granicy, jest to często poniżej 2048 znaków, można spotkać się z zaleceniami, żeby utrzymać tę wartość poniżej 2000 znaków. Czy w ogóle tak długie URLe są potrzebne, czytelne i wskazane? Odpowiadając na pierwszą wątpliwość, mogą być dosyć częste przy wyszukiwaniach po wielu kryteriach, dodatkowo z paginacją i sortowaniem. Niewątpliwie czytelność parametrów w URI jest dużo mniejsza niż przy przekazaniu parametrów w ciele żądania w formacie json czy XML. Wyszukiwanie nie zmienia stanu zasobów, czyli powinniśmy skorzystać i zazwyczaj korzystamy z GETa do pobierania danych. Metoda ta jest idempotentna, możemy korzystać z gotowych  mechanizmów zapewniających nam cache'owanie lub powtórne wywołanie GETa w przypadku błędu sieciowego. I jak najbardziej wydaje się odpowiednia, skoro chcemy pobrać dane.

// TODO przykład

Całym sednem problemu jest jednak to, że standard zakłada, że parametry będą przekazane w URLu, a nie w ciele metody. Co więc w przypadku, gdy naszych parametrów jest za dużo, żeby trzymać się tego standardu? Rozwiązań jest kilka i każde ma swoje wady i zalety.

### GET i parametry przekazywanie nie w URI, a w ciele żądania
Pierwszy pomysł rozwiązania tego problemu to przekazanie parametrów w ciele metody GET. Każda metoda HTTP może mieć ciało, ale w przypadku GETa pojawia się kilka wątpliwości.

Nie jest to zgodne z założeniami i praktyką. Co prawda standard pozwala na to, żeby dowolna metoda HTTP miała ciało, ale przez wiele lat i w wielu implementacjach założono, że ciało metody GET będzie ignorowane przez serwer. Znajdziemy się więc w dosyć dziwnym miejscu, w którym w zasadzie nie jesteśmy niezgodni ze standardem, ale też standard obecnie pomija kwestię, jak powinno być traktowane ciało metody GET. W związku z tym również konkretne implementacje nie będą wspierać tego rozwiązania.
Wiele implementacji po stronie frontu i serwera nie wspiera GETa z ciałem. Część bibliotek HTTP (np. JavaScript) nie wspiera wysyłania żądań GET z ciałem. Różne serwery i proxy mogą ignorować dane przekazane w ten sposób.
Tracimy łatwe wsparcie dla cache'owania, ponieważ działa one na podstawie URLa, a nie ciała metody.
Rozwiązanie może stworzyć problemy związane z konfiguracją blokującą takie żądania na WAFie (Web application firewall), jeśli osoby odpowiedzialne za konfigurację WAFa uznały, że żądania GET nie powinny mieć ciała.
// TODO przykład

Czy takie rozwiązania są spotykane w praktyce? Tak, warto przeczytać, że twórcy Elasticsearch są zwolennikami stosowania GETa w ten sposób, argumentując to tutaj. W swoim Search API umożliwiają zarówno skorzystanie z metody GET, jak i z metody POST, którą omówimy za chwilę.

### POST
Drugi pomysł, będący obejściem na problemy poprzedniego rozwiązania, to skorzystanie z innej metody HTTP - POST.  Jest to dosyć pragmatyczne podejście. Tracimy wtedy zalety, które dawał nam GET z parametrami w URLu.

Tracimy łatwe wsparcie dla cache'owania. Co prawda standard RFc 7234 zakłada wsparcie dla metod GET, HEAD i POST, ale większość implementacji wspiera tylko metody GET i HEAD.
Tracimy wsparcie dla ponawiania żądania przez kliencką bibliotekę HTTP przy błędzie sieciowym.
Tracimy zgodność ze standardem. Można też spierać się o to, na ile to rozwiązanie jest nieeleganckie lub czy nie wprowadzi osób korzystających z naszego API w błąd.
// TODO przykład
Czy takie rozwiązanie są spotykane w praktyce? Tak, np. zdecydowali się na to twórcy Dropboxa, argumentując swoją decyzję tutaj.

### GET i POST
Trzeci pomysł to próba połączenia dwóch poprzednich rozwiązań w taki sposób, żebyśmy byli zgodni ze standardem i intuicyjnym rozumieniem metod (czyli do pobierania danych ma służyć GET, a nie POST). Najpierw tworzymy zapytanie wyszukiwania, przekazując w ciele POSTa parametry wyszukiwania. W odpowiedzi otrzymujemy id naszego wyszukiwania. Korzystamy z GETa i ze zwróconego wcześniej id, aby otrzymać nasz wynik.

Wprowadzamy nadmiernie skomplikowany mechanizm, a przecież chcemy jedynie otrzymać wynik wyszukiwania. W tym celu konieczne będą aż dwa wywołania usług i cały mechanizm na serwerze zapisujący gdzieś te wyniki wyszukiwania.
Można w tej koncepcji wprowadzić cache'owanie, ale nadal nie jest to wsparcie, które mamy standardowo przy metodzie GET.
Jesteśmy zgodni ze standardem.
// TODO przykład

Na pewno nie jest to popularne rozwiązanie, jest najbardziej kosztowne i ryzykowne, a zyskujemy zgodność ze standardem.

### Wnioski

## Rozróżnianie między niewłaściwą ścieżką, nieistniejącym zasobem, brakiem uprawnień...

Częstym błędem w odpowiedzi na żądania jest zwracanie nieprawidłowego (niezgodnego ze standardem) kodu błędu.  Należy pamiętać, że odpowiedź musi być zrozumiała i łatwa w interpretacji dla użytkownika naszego API, a z drugiej strony nie można zapomnieć o kwestiach związanych z bezpieczeństwem.

Zacznijmy od przykładu.

```
GET /films/1234
Response: 404
```

Co będzie oznaczała odpowiedź z kodem błędu 404? Może nie ma takiego zasobu, może zasób istnieje, ale nie mamy uprawnień do niego, a może ścieżka jest niewłaściwa? Dlatego część osób uważa, że należy zwracać inny kod błędu w każdym z tych przypadków.

Załóżmy więc, że będziemy zwracać 403, jeśli zasób istnieje, a użytkownik nie ma do niego dostępu. W ten sposób można łatwo poprzez enumerację i przekazywanie kolejnych id, dowiedzieć się, ile jest zasobów danego typu i poznać ich identyfikatory.

```
GET /films/1
Response: 403
```

```
GET /films/2
Response: 404
```

...


Dlatego też w zależności od tego, czy jest bezpieczne ujawnianie takich informacji klientowi, możemy zwracać albo 403 i 404, żeby rozróżnić te 2 przypadki, albo zawsze 404, żeby nie było takiej możliwości. Jeśli wystawiamy serwisy wewnętrznie, to o wiele przydatniejsze będzie skorzystanie z kodu 403.  Warto pamiętać, że kod 404 to najlepszy kod błędu, kiedy nie chcemy ujawniać, czemu nie zwrócimy zasobu.



Przejdźmy do innego przykładu. Czy 404 oznacza, że zasób nie istnieje, czy że ścieżka jest niewłaściwa? Trudno powiedzieć, jeśli zwrócimy jedynie kod błędu 404.

```
GET /firms/100
Response: 404
```

```
GET /films/100
Response: 404
```
W tym przypadku zalecane jest pozostanie przy kodzie 404, ale dodanie do odpowiedzi przyczyny błędu. Inny sposób - z dwoma różnymi kodami błędu, jest niezgodny ze standardem.

```
GET /firms/100
Response: 404
Invalid path: /firms
```

```
GET /films/100
Response: 404
No film with id: 100
```

### PATCH i blokowanie na WAF

Metoda PATCH została wprowadzona do standardu w RFC 5789 w 2010 roku, nie był to jednak wówczas nowy pomysł. Koncepcja opiera się na tym, że w przeciwieństwie do metody PUT, nie przekażemy całego zasobu, a jedynie zmiany. W związku z tym metoda nie jest idempotentna w przeciwieństwie do metody PUT, to znaczy, że metoda PUT wywołana dowolną liczbę razy da w efekcie zawsze taki sam stan zasobu. W przypadku PATCHa nie zawsze tak będzie.

// TODO przykład PUT i PATCH

Chcąc więc być spójni ze standardem i stosując tę metodę HTTP w odpowiednim przypadku, mamy poprawne rozwiązanie, przetestowane na środowisku deweloperskim. Dopiero na kolejnym etapie okazuje się, że żądania PATCH trafiające na nasz serwer są po drodze wycinane - blokowane przez WAF. WAF, którego celem jest zapewnienie bezpieczeństwa, jest konfigurowany zazwyczaj przez inny zespół, czasem z innej firmy lub przez klienta, dla którego dostarczamy rozwiązanie. Dlatego tego typu problemy są dosyć częste. Konfiguracja WAF, oparta na blokowaniu niedozwolonych żądań i odpowiedzi lub akceptowaniu tylko dozwolonych, to niezwykle istotny element bezpieczeństwa.

Czy w opisanym przypadku blokowanie żądań, które korzystają z metody PATCH było uzasadnione? Zapewne wynikało z tego, że konfiguracja była zawężona najbardziej, jak się dało. W tym przypadku można oczywiście zmienić konfigurację WAF, ale nierzadko w tego typu sytuacjach w praktyce dostosowujemy się do infrastruktury klienta, któremu dostarczamy oprogramowanie i decydujemy się na zmianę np. na PUT. W ten sposób nie jesteśmy już zgodni ze standardem. Widać tu wyraźnie różnicę między sytuacją, gdy wystawiamy API dla potencjalnie wielu klientów i trzymanie się standardów ułatwi innym zrozumienie naszego API a sytuacją, gdy tworzymy rozwiązanie dla jednego klienta, które działa na jego infrastrukturze i staramy się być elastyczni. W drugim przypadku jakość naszego API będzie dużo niższa. Nie można jednak zapominać, że zazwyczaj reguły na WAFie służą poprawie bezpieczeństwa i zabezpieczeniem przed znanymi i dobrze opisanymi atakami. Dlatego często to właśnie brak trzymania się standardów doprowadzi do problemów na WAFie.
