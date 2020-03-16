---
layout:    post
title:     "Tomcat - model przetwarzania żądań"
date:      2020-03-19 10:00:00 +0100
published: false
author:    jwilczewski
tags:
    - java
    - tomcat
    - nio
    - connector
---

Tomcat jest jednym z najpopularniejszych serwerów webowych dla aplikacji pisanych w Javie. Jest podstawowym kontenerem aplikacji springboot'owych. Tworząc nowy projekt często polegamy na jego domyślnej konfiguracji. Kiedy projekt dojrzewa do wdrożenia produkcyjnego i musi zmierzyć się, z obsługą dużego ruchu często konieczne okazuje się dostrojenie konfiguracji. W tym artykule skupię się na konfiguracji connectorów na przykładzie pewnego problemu produkcyjnego. Opis konfiguracji Tomcata bazuje na wersji 7.x, ale jest w zasadzie aktualny również dla wyższych wersji.

## Problem z wyczerpaną pulą wątków w Tomcacie

W jednym z systemów, które współtworzyłem wystąpił problem podczas działania produkcyjnego. Problem objawiał się brakiem możliwości połączenia z endpointem wystawionym na Tomcacie. Monitoring i analiza logów jednoznacznie pokazały, że wyczerpała się pula wątków obsługujących żądania http. Dalsza analiza pokazała, że praprzyczyną problemu był w tym przypadku system autoryzacji, z którym łączył się nasz system. W systemie autoryzacji znacząco wzrosły czasy odpowiedzi co powodowało, że wątki Tomcata była bardzo długo zajęte. Tomcat powoływał nowe wątki, ale ostatecznie osiągnął limit 1000 wątków (taki mieliśmy ustawiony na connectorze) i przestał obsługiwać nowe połączenia - również takie, które nie wymagały wywołania systemu autoryzacji.

Co więcej zauważyliśmy i potwierdziliśmy to później w testach, że po całkowitym wysyceniu puli wątków Tomcat nie jest w stanie bez restartu powrócić do prawidłowego działania nawet wtedy kiedy problem z długimi czasami odpowiedzi zostanie wyeliminowany.

Opisana sytuacja skłoniła nas do sprawdzenia czy jesteśmy w stanie zapobiec takiemu zachowaniu Tomcata poprzez modyfikację konfiguracji connectorów. Pojawił się między innymi pomysł zmiany implementacji connectora blokującego (bio) na nieblokujący (nio). W systemie, którego dotyczył problem używany był tomcat 7.x, w którym nomyślnie używana jest implmentacja blokująca.

## Konfiguracja connectorów

Podstawowa konfiguracja Tomcata znajduje się w pliku conf/server.xml i zawiera konfigurację następujących elementów:
* [Server](http://tomcat.apache.org/tomcat-7.0-doc/config/server.html) - konfiguracja całego kontenera, zawiera konfiguracje poszczególnych serwisów.
* [Service](http://tomcat.apache.org/tomcat-7.0-doc/config/service.html) - Zawiera konfigurację poszczególnych connectorów łącząc je silnikiem przetwarzania żądań.
* [Connector](http://tomcat.apache.org/tomcat-7.0-doc/config/http.html) - nasłuchuje na wybranym porcie http i obsługuje połączenia, przekazując żądania do silnika zdefiniowanego w elemencie Engine.
* [Engine](http://tomcat.apache.org/tomcat-7.0-doc/config/engine.html) - przetwarza żądania pochodzące ze wszystkich connectorów zdefiniowanych w elemencie Service.

Z punktu widzenia przetwarzania żądań kluczowe znaczenie ma konfiguracja connectora i parametry:
* protocol - pozwala określić wybraną implementacje connectora (to tutaj możemy zdecydować czy chcemy użyć connectora blokującego czy nieblokującego)
* acceptCount - długość kolejki oczekujących połączeń. Kolejka napełnia się jeżeli wszystkie wątki w puli wątków connectora są zajęte. W przypadku osiągnięcia limitu tej kolejki (domyślnie 100) połączenia klientów będą odrzucane.
* maxConnections - maksymalna liczba połączeń, które mogą być przetwarzane. Po osiągnięciu maksymalnej liczby połączeń, połączenia nadal są przyjmowane i kolejkowane do czasu osiągnięcia limitu wynikającego z parametru acceptCount. Domyślnie maxConnections jest równe maxThreads dla connectora blokującego i 10000 dla nieblokującego.
* maxThreads - maksymalna liczba wątków obsługujących żądania. Parametr ten oznacza ile żądań może być symultanicznie przetwarzanych przez serwer. Domyślna wartość tego parametru to 200. Biorąc pod uawagę problem, którym zajmujemy się w tym artykule jest to najważniejszy parametr.

## Monitorowanie puli wątków

Aktualna liczba wątków przetwarzających żądania jest obok rozmiaru sterty jednym z najważniejszych parametrów, które powinny być objęte monitoringiem. W tym przypadku monitorujemy atrybut `currentThreadsBusy` mbean'a `Catalina:name="http-bio-8080",type=ThreadPool` (nazwa puli może być inna, np.: http-nio-8080 dla connectora nieblokującego, można to sprawdzić listując wszytkie mbeany lub sprawdzając nazwę wątku w logu). 

Do monitoringu można użyć narzędzia [jolokia](https://jolokia.org/), które udostępnia JMX za pomocą protokołu http. W takiej konfiguracji wystarczy regularnie odpytywać o stan puli wątków poprzez wywołanie http GET:
`http://HOST:PORT/jolokia/read/Catalina:name="http-bio-8080",type=ThreadPool/currentThreadsBusy`
W odpowiedzi dostajemy jsona, który w polu value zawiera aktualny rozmiar puli wątków 
```json
{
  "request": {
    "mbean": "Catalina:name=\"http-bio-8080\",type=ThreadPool",
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

W Tomcacie 7.x domyślną implementacją connectora jest implementacja blokująca. W Tomcacie 8 i wyższych domyślny jest connector nieblokujący. Podstawowa różnica w działaniu polega na tym, że **w connectorze blokującym wątek przypisywany jest do połączenia, a w connectorze nieblokuącym do pojedynczego żądania**. Może to mieć duże znaczenie przy zastosowaniu połączeń keep-alive kiedy to jedno połączenie jest wykorzystywane to przesłania wielu żądań i odpowiedzi. W takim modelu wątek na serwerze jest zajęty na cały czas trwania pojedynczego połączenia mimo, że faktyczne przetwarzanie na serwerze zachodzi tylko w obrębie pojedynczego żądania.


### Test

Dla porównania można wykonać prosty test 

### Apache mod_proxy

## Próba rozwiązania problemu