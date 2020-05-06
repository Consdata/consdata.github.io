---
layout:    post
title:     "Tomcat - model przetwarzania żądań"
date:      2020-03-18 14:00:00 +0100
published: true
author:    jwilczewski
image:     /assets/img/posts/2020-03-18-tomcat-model-przetwarzania-zadan/Tomcat.png
tags:
    - java
    - tomcat
    - nio
    - connector
---

Tomcat jest jednym z najpopularniejszych serwerów webowych dla aplikacji pisanych w Javie. Jest podstawowym kontenerem aplikacji springbootowych. Tworząc nowy projekt często polegamy na jego domyślnej konfiguracji. Kiedy projekt dojrzewa do wdrożenia produkcyjnego i musi zmierzyć się z obsługą dużego ruchu, często konieczne okazuje się dostrojenie tej konfiguracji. W tym artykule skupię się na konfiguracji connectorów na przykładzie pewnego problemu produkcyjnego. Opis konfiguracji Tomcata bazuje na wersji 7.x, ale jest w zasadzie aktualny również dla wyższych wersji.

## Problem z wyczerpaną pulą wątków w Tomcacie

W jednym z systemów, które współtworzyłem, wystąpił problem podczas działania produkcyjnego. Problem objawiał się brakiem możliwości połączenia z endpointem wystawionym na Tomcacie. Monitoring i analiza logów jednoznacznie pokazały, że wyczerpała się pula wątków obsługujących żądania http. Dalsza analiza ujawniła, że praprzyczyną problemu był w tym przypadku system autoryzacji, z którym łączył się nasz system. W systemie autoryzacji znacząco wzrosły czasy odpowiedzi, co powodowało, że wątki Tomcata były bardzo długo zajęte. Tomcat powoływał nowe wątki, ale ostatecznie osiągnął limit 1000 wątków (taki mieliśmy ustawiony na connectorze) i przestał obsługiwać nowe połączenia - również takie, które nie wymagały wywołania systemu autoryzacji.

Co więcej, zauważyliśmy i potwierdziliśmy to później w testach, że po całkowitym wysyceniu puli wątków, Tomcat nie jest w stanie bez restartu powrócić do prawidłowego działania nawet wtedy, kiedy problem z długimi czasami odpowiedzi zostanie wyeliminowany.

Opisana sytuacja skłoniła nas do sprawdzenia czy jesteśmy w stanie zapobiec takiemu zachowaniu Tomcata poprzez modyfikację konfiguracji connectorów. Pojawił się między innymi pomysł zmiany implementacji connectora blokującego (bio) na nieblokujący (nio). W systemie, którego dotyczył problem używany był tomcat 7.x, w którym domyślnie używana jest implementacja blokująca.

## Konfiguracja connectorów

Podstawowa konfiguracja Tomcata znajduje się w pliku conf/server.xml i zawiera konfigurację następujących elementów:
* [Server](http://tomcat.apache.org/tomcat-7.0-doc/config/server.html) - konfiguracja całego kontenera, zawiera konfiguracje poszczególnych serwisów.
* [Service](http://tomcat.apache.org/tomcat-7.0-doc/config/service.html) - zawiera konfigurację poszczególnych connectorów łącząc je silnikiem przetwarzania żądań.
* [Connector](http://tomcat.apache.org/tomcat-7.0-doc/config/http.html) - nasłuchuje na wybranym porcie http i obsługuje połączenia przekazując żądania do silnika zdefiniowanego w elemencie Engine.
* [Engine](http://tomcat.apache.org/tomcat-7.0-doc/config/engine.html) - przetwarza żądania pochodzące ze wszystkich connectorów zdefiniowanych w elemencie Service.

Z punktu widzenia przetwarzania żądań, kluczowe znaczenie ma konfiguracja connectora i parametry:
* protocol - Pozwala określić wybraną implementacje connectora (to tutaj możemy zdecydować czy chcemy użyć connectora blokującego czy nieblokującego).
* acceptCount - Długość kolejki oczekujących połączeń. Kolejka napełnia się jeżeli wszystkie wątki w puli wątków connectora są zajęte. W przypadku osiągnięcia limitu tej kolejki (domyślnie 100) połączenia klientów będą odrzucane.
* maxConnections - Maksymalna liczba połączeń, które mogą być przetwarzane. Po osiągnięciu maksymalnej liczby połączeń, połączenia nadal są przyjmowane i kolejkowane do czasu osiągnięcia limitu wynikającego z parametru acceptCount. Domyślnie maxConnections jest równe maxThreads dla connectora blokującego i 10000 dla nieblokującego.
* maxThreads - Maksymalna liczba wątków obsługujących żądania. Parametr ten oznacza, ile żądań może być symultanicznie przetwarzanych przez serwer. Domyślna wartość tego parametru to 200. Jest to najważniejszy parametr, zważywszy na problem, który rozwiązujemy w tym artykule.

## Monitorowanie puli wątków

Aktualna liczba wątków przetwarzających żądania jest, obok rozmiaru sterty, jednym z najważniejszych parametrów, które powinny być objęte monitoringiem. W tym przypadku monitorujemy atrybut `currentThreadsBusy` mbean'a 
```
Catalina:name="http-RODZAJ_CONNECTORA-PORT",type=ThreadPool
``` 
(przy czym RODZAJ_CONNECTORA to "bio" dla connectora blokującego i "nio" dla nieblokującego, PORT to numer portu, na którym nasłuchuje connector).

Do monitoringu można użyć narzędzia [jolokia](https://jolokia.org/), które udostępnia JMX za pomocą protokołu http. W takiej konfiguracji wystarczy regularnie odpytywać o stan puli wątków poprzez wywołanie http GET:
```
http://HOST:PORT/jolokia/read/Catalina:name="http-RODZAJ_CONNECTORA-PORT",type=ThreadPool/currentThreadsBusy
```

W odpowiedzi dostajemy jsona, który w polu value zawiera aktualny rozmiar puli wątków 
```json
{
  "request": {
    "mbean": "Catalina:name=\"http-RODZAJ_CONNECTORA-PORT\",type=ThreadPool",
    "attribute": "currentThreadsBusy",
    "type": "read"
  },
  "value": 1,
  "timestamp": 1564763927,
  "status": 200
}
```
Warto skonfigurować alerting, który będzie ostrzegał o wysycaniu się puli połączeń i pozwoli szybciej zdiagnozować problem.

## Porównanie connectorów blokujących (bio) i nieblokujących (nio)

### Różnica w działaniu

W Tomcacie 7.x domyślną implementacją connectora jest implementacja blokująca. W Tomcacie 8 i wyższych domyślny jest connector nieblokujący. Podstawowa różnica w działaniu polega na tym, że **w connectorze blokującym wątek przypisywany jest do połączenia, a w connectorze nieblokującym do pojedynczego żądania**. Może to mieć duże znaczenie przy zastosowaniu połączeń keep-alive, kiedy to jedno połączenie jest wykorzystywane do przesłania wielu żądań i odpowiedzi. W takim modelu wątek na serwerze jest zajęty na cały czas trwania pojedynczego połączenia mimo, że faktyczne przetwarzanie na serwerze zachodzi tylko w obrębie pojedynczego żądania.

### Test

Dla porównania można wykonać prosty test na dwóch rodzajach connectorów. W teście klient raz na sekundę wysyła żądanie do serwera. Łącznie jeden klient wysyła 30 żądań. Uruchamiamy 20 klientów w ciągu 2 sekund. Jednocześnie monitorujemy rozmiar puli wątków.

Tak wygląda wykres czasów odpowiedzi dla connectora blokującego:

![wykres czasów odpowiedzi dla connectora blokującego](/assets/img/posts/2020-03-18-tomcat-model-przetwarzania-zadan/gatling-bio.png)

a tak dla connectora nieblokującego:

![wykres czasów odpowiedzi dla connectora nieblokującego](/assets/img/posts/2020-03-18-tomcat-model-przetwarzania-zadan/gatling-nio.png) 

Nie widać tutaj jakiejś specjalnej różnicy między działaniem connectora bio i nio. Zupełnie inaczej wyglądają natomiast wykresy liczby zajętych wątków w puli. Dla connectora blokującego liczba zajętych wątków podczas trwania testu przekracza 20. Czyli jest zgodna z liczbą klientów wysyłających żądania do serwera. Połączenia keep-alive mają timeout równy 5 sekund więc klient utrzymuje cały czas jedno połączenie do wszystkich żądań:

![wykres liczby zajętych wątków dla connectora blokującego](/assets/img/posts/2020-03-18-tomcat-model-przetwarzania-zadan/threads-bio.png)

Dla connectora nieblokującego żądania są obsługiwane w większości przez jeden wątek:

![wykres liczby zajętych wątków dla connectora nieblokującego](/assets/img/posts/2020-03-18-tomcat-model-przetwarzania-zadan/threads-nio.png)

Test pokazuje, że przy takim modelu przetwarzania żądań za pomocą connectora nieblokującego możemy uzyskać sporą oszczędność zasobów i lepiej zutylizować serwer.

### Użycie mod_proxy zmienia sytuację

Warto zwrócić uwagę na to, że takie wyniki osiągamy w przypadku bezpośredniego połączenia pomiędzy klientem, a serwerem Tomcat. Zdarza się jednak, że mamy jeszcze warstwę pośrednią np. w postaci serwera Apache httpd i modułu mod_proxy. Domyślnie mod_proxy nie ma włączonej opcji keep-alive więc wszystkie połączenia do backendu są zamykane po obsłużeniu pojedynczego żądania. 

Test został przeprowadzony za pomocą narzędzia [Gatling](https://gatling.io/). Więcej o samym narzędziu można przeczytać w osobnym [artykule na naszym blogu]({% post_url 2017-08-01-gatling %}).

## Próba rozwiązania problemu

Podsumowując: Wstępem do rozważań nad konfiguracją connectorów był problem z długimi czasami jakie wątki Tomcata spędzały na komunikacji z systemem autoryzacji. Czy zmiana connectora na nieblokujący pomogłaby w tej sytuacji? Niestety nie. Connector nieblokujący nie wiąże wątku z połączeniem, ale nadal wiąże go z pojedynczym żądaniem. W tym przypadku nadal wątki będą blokowane na długim wywołaniu systemu autoryzacji. Choć zastosowanie connectora nio z pewnością zaoszczędziłoby część zasobów maszyny, to w tym przypadku należałoby raczej rozważyć użycie jakiejś implementacji circuit breaker'a lub też zmienić model obsługi żądań na bardziej reaktywny (np. [webflux](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html)).
