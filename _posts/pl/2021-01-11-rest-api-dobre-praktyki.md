---
layout:    post
title:     "Standard HTTP i REST - dobre i złe praktyki"
date:      2021-01-11 08:00:00 +0100
published: true
lang:      pl
author:    bmitan
image:
tags:
    - http
    - rest
    - rest api
---


## HTTP i REST - czy zawsze dobrze je stosujemy?
Jakie są częste błędy przy doborze metod HTTP?  Kiedy trzymać się standardu, a kiedy może to być problemem? O czym pamiętać projektując swoje REST API? Choć ani standard HTTP, ani REST nie są nowością w świecie IT, to pewne twierdzenia ich dotyczące są błędnie powielane przez wiele osób. Czasem znów okazuje się, że deweloperzy z powszechnie znanych firm podchodzą do tego samego problemu w inny sposób. Zapraszam na podróż w znane, ale wciąż jeszcze nie zawsze przestrzegane standardy HTTP i REST. 

## Kiedy POST, a kiedy PUT? 

### POST do tworzenia, a PUT do modyfikacji? Niekoniecznie
Często można spotkać się z prostym wyjaśnieniem, kiedy używać metody POST, a kiedy PUT. Kiedy tworzymy nowy zasób — POST, kiedy modyfikujemy istniejący — PUT. Jest to jednak znaczne uproszczenie i pierwszy mit, z którym chcę się rozprawić.

Zacznijmy od tego, że PUT również może tworzyć zasób, więc nie jest to wcale różnica między PUT i POST wynikająca ze standardu HTTP. Co więcej, POST ma o wiele szersze zastosowanie niż działanie na zasobach. Może np. być użyty do przekazania danych z formularza lub innych danych, wiadomości, które zostaną przetworzone przez serwer praktycznie w dowolny sposób. Niekoniecznie celem jest utworzenie (lub też modyfikacja) czegokolwiek, efektem może być np. wysłanie wiadomości, rozpoczęcie procesu. W wyniku żądania może, lecz nie musi, powstać zasób identyfikowany przez URI. Jeśli powstanie, należy zwrócić kod odpowiedzi 201 (Created). Jeśli nie powstanie taki zasób, należy zwrócić kod 200 (OK) lub 204 (No Content). Natomiast metoda PUT odnosi się do konkretnego zasobu, który w jej wyniku może zostać zastąpiony reprezentacją zawartą w przekazanych danych (wówczas zwracamy 200 (OK) lub 204 (No Content)). Jeśli taki zasób nie istnieje, w zależności od naszej decyzji możemy do utworzyć, zwracając 201 (Created) lub odpowiedzieć kodem błędu, jeśli nie chcemy wspierać takiej obsługi. GET wykonany tuż po przetworzeniu metody PUT zwróci nam dokładnie tę samą reprezentację, która była przekazana w metodzie PUT. Warto jednak podkreślić, że PUT może mieć wpływ na inne powiązane zasoby.

Na razie więc widzimy, że choć POST i PUT mają ze sobą dużo wspólnego, POST może mieć szersze zastosowanie i może w dowolny sposób przetwarzać przekazane dane. Natomiast PUT odnosi się do konkretnego zasobu określonego przez jego identyfikator i powinien być obsłużony przez zastąpienie obecnej reprezentacji zasobu reprezentacją przekazaną w żądaniu. Nie tłumaczy to jednak głównej różnicy między POST a PUT, którą możemy zawrzeć w haśle „idempotentność".

### Idempotentność
Termin ten, wywodzący się z matematyki, oznacza tutaj, że operacja idempotentna wykonana wielokrotnie nie doprowadzi do błędu, a jej wynik będzie za każdym razem taki sam. PUT jest idempotentny, natomiast POST nie. Przy okazji warto zauważyć, że dwie inne popularne metody HTTP — GET i DELETE — są również idempotentne.

Parokrotne wywołanie metody PUT spełnia te zasady (o ile nasza implementacja jest zgodna ze standardem).
```
PUT /messages/1234
{
"title": "Hello!",
"text": "Do you know that PUT is indempotent?"
}
```

## POST bez ciała (body)?
Biorąc pod uwagę to, że metoda POST ma bardzo szerokie zastosowanie i nie jest idempotentna, w skrajnym przypadku możemy nie chcieć przekazywać żadnych danych. Nasze żądanie może być np. jedynie wyzwalaczem (trigger) jakiegoś procesu i nie potrzebujemy przekazywać nić więcej. W innym przypadku możemy przekazać potrzebne informacje w nagłówkach HTTP, a ponieważ reprezentacja to połączenie nagłówków z danymi, to reprezentacja interpretowana przez serwer nie będzie wcale pusta. Nie będzie to sprzeczne ze standardem HTTP. Należy jedynie pamiętać o poprawnej interpretacji w zależności od technologii, z której korzystamy, zarówno po stronie serwera, jak i klienta. Jeśli np. standardowo posługujemy się formatem application/json i tu też posłużymy się takimi nagłówkami, puste żądanie może być uznane za niepoprawne w przeciwieństwie do przekazania {}. Problem może wystąpić również na innym poziomie infrastruktury, przykładowo tak spreparowane żądanie może zostać zablokowane na WAF-ie (Web application firewall), jeśli została ustalona reguła, którą będzie ono łamać.

## GET z dużą liczbą parametrów
### Opis problemu
O ile standard nie określa ograniczenia na rozmiar URI, to poszczególne implementacje już je mają. Zazwyczaj jest to między 2 KB a 8 KB i o ile po stronie serwerowej mamy nad tym kontrolę (w zależności od stosowanych technologii), o tyle przeglądarki mają różne ograniczenia. Bezpiecznie jest więc trzymać się dolnej granicy, jest to często poniżej 2048 znaków, można spotkać się z zaleceniami, żeby utrzymać tę wartość poniżej 2000 znaków. Czy w ogóle tak długie URLe są potrzebne, czytelne i wskazane? Odpowiadając na pierwszą wątpliwość, mogą być dosyć częste przy wyszukiwaniach po wielu kryteriach, dodatkowo z paginacją i sortowaniem. Niewątpliwie czytelność parametrów w URI jest dużo mniejsza niż przy przekazaniu parametrów w ciele żądania w formacie json czy XML. Wyszukiwanie nie zmienia stanu zasobów, czyli powinniśmy skorzystać i zazwyczaj korzystamy z GETa do pobierania danych. Metoda ta jest idempotentna, możemy korzystać z gotowych mechanizmów zapewniających nam cache'owanie lub powtórne wywołanie GETa w przypadku błędu sieciowego. I jak najbardziej wydaje się odpowiednia, skoro chcemy pobrać dane.

Przykładowy GET:

```
GET /locations/?country=France,Italy,Greece,......,Brazil&minimum_population=250000&type=city,village&max_height=1300&min_area=100000&.......
```

Całym sednem problemu jest jednak to, że standard zakłada, że parametry będą przekazane w URL-u, a nie w ciele metody. Co więc w przypadku, gdy naszych parametrów jest za dużo, żeby trzymać się tego standardu? Rozwiązań jest kilka i każde ma swoje wady i zalety.

### GET i parametry przekazywanie nie w URI, a w ciele żądania
Pierwszy pomysł rozwiązania tego problemu to przekazanie parametrów w ciele metody GET. Każda metoda HTTP może mieć ciało, ale w przypadku GETa pojawia się kilka wątpliwości.

- Nie jest to zgodne z założeniami i praktyką. Co prawda standard pozwala na to, żeby dowolna metoda HTTP miała ciało, ale przez wiele lat i w wielu implementacjach założono, że ciało metody GET będzie ignorowane przez serwer. Znajdziemy się więc w dosyć dziwnym miejscu, w którym w zasadzie nie jesteśmy niezgodni ze standardem, ale też standard obecnie pomija kwestię, jak powinno być traktowane ciało metody GET. W związku z tym również konkretne implementacje nie będą wspierać tego rozwiązania.
- Wiele implementacji po stronie frontu i serwera nie wspiera GET-a z ciałem. Część bibliotek HTTP (np. JavaScript) nie wspiera wysyłania żądań GET z ciałem. Różne serwery i proxy mogą ignorować dane przekazane w ten sposób.
- Tracimy łatwe wsparcie dla cache'owania, ponieważ działa one na podstawie URL-a, a nie ciała metody.
- Rozwiązanie może stworzyć problemy związane z konfiguracją blokującą takie żądania na WAF-ie (Web application firewall), jeśli osoby odpowiedzialne za konfigurację WAF-a uznały, że żądania GET nie powinny mieć ciała.

```
GET /locations
{
    "country": "France,Italy,Greece,......,Brazil",
    "minimum_population": 250000,
    "type": "city, village",
    "max_height": 1300,
    "min_area": 100000,
    ....
}
```


```
"locations": [
"id": "2443", "name": "Rome",
"id": "6789", "name": "Paris",
...
]
```

Czy takie rozwiązania są spotykane w praktyce? Tak, warto przeczytać, że twórcy Elasticsearch są zwolennikami stosowania GETa w ten sposób, argumentując to tutaj. W swoim Search API umożliwiają zarówno skorzystanie z metody GET, jak i z metody POST, którą omówimy za chwilę.

### POST
Drugi pomysł, będący obejściem na problemy poprzedniego rozwiązania, to skorzystanie z innej metody HTTP — POST.  Jest to dosyć pragmatyczne podejście. Tracimy wtedy zalety, które dawał nam GET z parametrami w URLu.

- Tracimy łatwe wsparcie dla cache'owania. Co prawda standard RFC 7234 zakłada wsparcie dla metod GET, HEAD i POST, ale większość implementacji wspiera tylko metody GET i HEAD.
- Tracimy wsparcie dla ponawiania żądania przez kliencką bibliotekę HTTP przy błędzie sieciowym.
- Tracimy zgodność ze standardem. Można też spierać się o to, jak bardzo to rozwiązanie jest nieeleganckie lub czy nie wprowadzi osób korzystających z naszego API w błąd.

```
POST /locations/search
{
    "country": "France,Italy,Greece,......,Brazil",
    "minimum_population": 2500000,
    "type": "city, village",
    "max_height": 1300,
    "min_area": 100000,
    ....
}
```

```
"locations": [
"id": "2443", "name": "Rome",
"id": "6789", "name": "Paris",
...
]
```

Czy takie rozwiązanie są spotykane w praktyce? Tak, np. zdecydowali się na to twórcy Dropboxa, argumentując swoją decyzję tutaj.

### GET i POST
Trzeci pomysł to próba połączenia dwóch poprzednich rozwiązań w taki sposób, żebyśmy byli zgodni ze standardem i intuicyjnym rozumieniem metod (czyli do pobierania danych ma służyć GET, a nie POST). Najpierw tworzymy zapytanie wyszukiwania, przekazując w ciele POST-a parametry wyszukiwania. W odpowiedzi otrzymujemy id naszego wyszukiwania. Korzystamy z GETa i ze zwróconego wcześniej id, aby otrzymać nasz wynik.

- Wprowadzamy nadmiernie skomplikowany mechanizm, a przecież chcemy jedynie otrzymać wynik wyszukiwania. W tym celu konieczne będą aż dwa wywołania usług i cały mechanizm na serwerze zapisujący gdzieś te wyniki wyszukiwania.
- Można w tej koncepcji wprowadzić cache'owanie.
- Jesteśmy zgodni ze standardem.

```
POST /locations/search
{
    "country": "France,Italy,Greece,......,Brazil",
    "minimum_population": 2500000,
    "type": "city, village",
    "max_height": 1300,
    "min_area": 100000,
    ....
}
```

```
"id": "1297612456456"
```

```
GET /locations/search?id=1297612456456
```

```
"locations": [
"id": "2443", "name": "Rome",
"id": "6789", "name": "Paris",
...
]
```

Na pewno nie jest to popularne rozwiązanie, jest najbardziej kosztowne i ryzykowne, a zyskujemy zgodność ze standardem.


## Obsługa błędów
### Rozróżnianie między niewłaściwą ścieżką, nieistniejącym zasobem, brakiem uprawnień...

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

```
...
```

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
W tym przypadku zalecane jest pozostanie przy kodzie 404, ale dodanie do odpowiedzi przyczyny błędu. Inny sposób — z dwoma różnymi kodami błędu, jest niezgodny ze standardem.

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

### Szczegóły błędu
Jeśli wystawiamy puliczne API, z którego korzystać będzie wielu deweloperów, możemy chcieć podzielić się bardzo dokładnym szczegółem błędu. W innym przypadku możemy ze względów bezpieczeństwa nie przekazywać w wersji produkcyjnej tak szczegółowych informacji na temat błędu. W ogólności poza obowiązkowym kodem błędu można zaproponować dodatkowe pola, przedstawione w poniższym przykładzie.

```
Response: 400
{
  "errorCode" : "12355",
  "developerMessage" : "Message for developers of your API",
  "userMessage" : "Message for end user",
  "moreInfo" : "http://www.myapi.com/help/errors/12355"
}
```

### Poprawne odpowiedzi
Poza kodem odpowiedzi często zwracamy dane. Warto trzymać się następujących zasad:
- nie zwracamy kluczy i wartości związanych z wewnętrzną ,
- nie zw

### PATCH i blokowanie na WAF

Metoda PATCH została wprowadzona do standardu w RFC 5789 w 2010 roku, nie był to jednak wówczas nowy pomysł. Koncepcja opiera się na tym, że w przeciwieństwie do metody PUT, nie przekażemy całego zasobu, a jedynie zmiany. W związku z tym metoda nie jest idempotentna w przeciwieństwie do metody PUT, to znaczy, że metoda PUT wywołana dowolną liczbę razy da w efekcie zawsze taki sam stan zasobu. W przypadku PATCH-a nie zawsze tak będzie.

// TODO przykład PUT i PATCH

Chcąc więc być spójni ze standardem i stosując tę metodę HTTP w odpowiednim przypadku, mamy poprawne rozwiązanie, przetestowane na środowisku deweloperskim. Dopiero na kolejnym etapie okazuje się, że żądania PATCH trafiające na nasz serwer są po drodze wycinane — blokowane przez WAF. WAF, którego celem jest zapewnienie bezpieczeństwa, jest konfigurowany zazwyczaj przez inny zespół, czasem z innej firmy lub przez klienta, dla którego dostarczamy rozwiązanie. Dlatego tego typu problemy są dosyć częste. Konfiguracja WAF jest oparta na blokowaniu niedozwolonych żądań i odpowiedzi lub akceptowaniu tylko dozwolonych.

Czy w opisanym przypadku blokowanie żądań, które korzystają z metody PATCH, było uzasadnione? Zapewne wynikało z tego, że konfiguracja była zawężona najbardziej, jak się dało. W tym przypadku można oczywiście zmienić konfigurację WAF, ale nierzadko w tego typu sytuacjach w praktyce dostosowujemy się do infrastruktury klienta, któremu dostarczamy oprogramowanie i decydujemy się na zmianę np. na PUT. W ten sposób nie jesteśmy już zgodni ze standardem. Widać tu wyraźnie różnicę między sytuacją, gdy wystawiamy API dla potencjalnie wielu klientów i trzymanie się standardów ułatwi innym zrozumienie naszego API a sytuacją, gdy tworzymy rozwiązanie dla jednego klienta, które działa na jego infrastrukturze i staramy się być elastyczni. W drugim przypadku jakość naszego API będzie dużo niższa. Nie można jednak zapominać, że zazwyczaj reguły na WAFie służą poprawie bezpieczeństwa i zabezpieczeniem przed znanymi i dobrze opisanymi atakami. Dlatego często to właśnie brak trzymania się standardów doprowadzi do problemów na WAF-ie.

## POST i cache'owanie ?

// TODO
