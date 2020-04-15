---
layout: post
title: Haproxy - mała rzecz, a cieszy
published: true
date:      2019-09-16 08:00:00 +0100
author:    tlewandowski
image:     haproxy.png
tags:
  - programming
  - load-balancing
  - ha
  - server
  - network
---

HAProxy to pakiet wolnego oprogramowania, który najczęściej pełni rolę reverse-proxy, zapewniając load-balancing i high-availability serwerów aplikacji. 

Klienci (np. przeglądarki) nie łączą się bezpośrednio z serwerami aplikacji, lecz właśnie z reverse-proxy, które stosując dodatkowe reguły przekazuje żądania do serwerów aplikacji i odpowiedzi z powrotem do klienta.

Projekt jest aktywnie rozwijany od 2002 roku i coraz częściej wykorzystywany z powodu popularyzacji systemów rozproszonych, w szczególności architektur opartych o mikroserwisy. 
Używają go takie tuzy jak Digital Ocean, Github, Dropbox, Instagram, czy StackOverflow. Jest też komponentem platformy kontenerowej OpenShift.

Pakiet jest dostępny dla wszystkich popularnych dystrybucji Linuxa, a także w postaci obrazu Dockerowego.

## Standardowe zastosowania HAProxy.
   
### Zapewnienie Load Balancingu
Jedno z podstawowych zastosowań HAProxy to software'owy load-balancer. Mając kilka węzłów naszej aplikacji chcielibyśmy rozdzielać ruch pomiędzy nimi. 
W konfiguracji HAProxy deklarujemy obiekt zwany backendem, który reprezentuje klaster naszych serwerów aplikacji. 
Następnie deklarujemy obiekt zwany frontendem, na który będą kierowani klienci oraz reguły kierowania ruchu z frontendu do backendu:

```
frontend my-load-balancer
    bind 172.19.0.1:81
    default_backend my-application-servers
    
backend my-application-servers
    balance roundrobin
    server my-app-server-1 172.19.0.2:8080
    server my-app-server-2 172.19.0.3:8080
    server my-app-server-3 172.19.0.4:8080    
```

Powyższa konfiguracja powoduje że połączenia na endpoint 172.19.0.1:81 będą przekierowywane na jeden z trzech podanych serwerów w sposób równomierny.

### Zapewnienie High Availability
HAProxy potrafi monitorować stan serwerów zadeklarowanych w sekcji backend i zaprzestać kierowania ruchu na serwery, które przestały poprawnie funkcjonować.
W konfiguracji serwera możemy określić m.in. jak często HAProxy ma sprawdzać status serwera, ile razy weryfikacja musi się nie udać, żeby serwer został uznany za dysfunkcyjny oraz ile
razy po wykluczeniu serwera weryfikacja musi się powieść, żeby serwer znów został uznany za "zdrowy".
Przykładowo:
```
    server my-app-server-1 172.19.0.2:8080 check inter 5s fall 3 downinter 1m raise 5
```
oznacza że:
* status serwera ma być sprawdzany co 5 sekund (_inter 5s_)
* serwer ma zostać wykluczony jeśli nie powiodą się 3 kolejne sprawdzenia (_fall 3_)
* wykluczony serwer ma być sprawdzany co minutę (_downinter 1m_)
* serwer ma zostać ponownie uznany za sprawny jeśli powiedzie się kolejne 5 sprawdzeń (_raise 5_)

### TLS/SSL
Jeżeli chodzi o obsługę szyfrowanych połączeń TLS/SSL, HAProxy może działać w jednym z trybów:
* zwykłe proxy
* terminacja szyfrowania
* ponowne szyfrowanie ruchu

#### Zwykłe proxy
W tym trybie HAProxy zwyczajnie przekazuje strumień bajtów z frontendu do backendu, nie wnikając w to, że ruch jest szyfrowany.

#### Terminacja szyfrowania
W tym trybie HAProxy otrzymuje szyfrowany ruch z frontendu, odszyfrowuje go (z użyciem klucza prywatnego) i przekazuje do backendu w postaci niezaszyfrowanej. 
Przykładowa konfiguracja:
```
frontend my-terminating-load-balancer
    bind 172.19.0.1:443 ssl crt /etc/ssl/certs/my-certs.pem
    default_backend my-application-servers
    
backend my-application-servers
    balance roundrobin
    server my-app-server-1 172.19.0.2:8080
    server my-app-server-2 172.19.0.3:8080
```

#### Ponowne szyfrowanie ruchu
W tym trybie HAProxy otrzymuje szyfrowany ruch z frontendu, odszyfrowuje go (z użyciem klucza prywatnego), a następnie szyfruje ponownie i przekazuje do backendu. 
Przykładowa konfiguracja:
```
frontend my-terminating-load-balancer
    bind 172.19.0.1:443 ssl crt /etc/ssl/certs/my-certs.pem
    default_backend my-secure-application-servers
    
backend my-secure-application-servers
    balance roundrobin
    server my-secure-app-server-1 172.19.0.2:8443 ssl
    server my-secure-app-server-2 172.19.0.3:8443 ssl
```
W odróżnieniu od trybu zwykłego proxy, dzięki odszyfrowaniu HAProxy może manipulować żądaniami HTTP, które przekierowuje.

### Session affinity
HAProxy pozwala na taką konfigurację, że requesty od danego użytkownika zawsze będą kierowane na ten sam serwer aplikacji. 
Taka potrzeba zachodzi m.in. kiedy używamy lokalnych sesji użytkownika, które istnieją tylko na tym serwerze aplikacji, na którym zostały utworzone.
Przykładowa konfiguracja, która opiera się na prefiksie ciasteczka sesyjnego: 
```
frontend my-sticky-load-balancer
    bind 172.19.0.1:81 
    default_backend my-application-servers
    
backend my-application-servers
    cookie JSESSIONID prefix nocache
    server my-app-server-1 172.19.0.2:8080 cookie node1
    server my-app-server-2 172.19.0.3:8080 cookie node2
```
Przy takiej konfiguracji wszystkie requesty, które niosą ciasteczko sesyjne z prefiksem "node1" będą kierowane na pierwszy serwer aplikacji.

### ACL 
HAProxy pozwala konfigurować reguły (ACL - Access Control List), które określają w jaki sposób poszczególne żądania mają być obsługiwane. 
Przykładowa konfiguracja:
```
frontend my-acl-load-balancer
    bind 172.19.0.1:81 
    acl is-passive method GET
    use_backend my-passive-application-server if is-passive
    default_backend my-active-application-server
    
backend my-passive-application-server
    server my-passive-app-server-1 172.19.0.2:8080 
    
backend my-active-application-server
    server my-active-app-server-1 172.19.0.3:8080 
```
Przy takiej konfiguracji żądania z metodą GET będą kierowane na pasywny serwer aplikacji, a wszystkie pozostałe na aktywny serwer aplikacji.

## Zastosowania w warsztacie programistycznym
Poza klasycznym użyciem jako reverse-proxy zapewniające load-balancing i high-availability, HAProxy może być z powodzeniem wykorzystane w warsztacie programistycznym. 
Przedstawię poniżej kilka zastosowań z własnego doświadczenia.

### Routing, który łatwo zmienić
Rozwijając aplikację, która wywołuje serwisy z innych aplikacji, chcemy niekiedy móc przełączać się między różnymi adresami tych zewnętrznych usług, 
np. możemy chcieć sprawnie przełączać się między prawdziwymi aplikacjami oraz ich zmockowanymi wersjami. 
Często restart naszej aplikacji jest długotrwały, a zmiana namiarów na zewnętrzne usługi wymaga edycji więcej niż jednego pliku.
W takim przypadku HAProxy może nam posłużyć jako wygodna "centralka", w której będziemy się sprawnie przełączać między różnymi wersjami zewnętrznych usług.
Konfigurując HAProxy w ten sposób:
```
frontend my-forward-proxy
    bind 172.19.0.1:81
    default_backend my-external-services
    
backend my-external-services
    server my-external-server-1 172.19.0.2:8080

backend my-mocked-services
    server my-mocked-server-1 172.19.0.3:8080
```
i ustawiając w naszej aplikacji adres zewnętrznych usług na 172.19.0.1:81, 
możemy bez restartu aplikacji zmieniać jej zewnętrzne zależności przez zmianę wartości "default_backend" i szybki "reload" HAProxy.

### Podglądanie TLS/SSL
Jeśli serwisy w naszym systemie przesyłają sobie dane przez szyfrowane połączenia TLS/SSL, może to stanowić przeszkodę w debugowaniu komunikacji przy pomocy analizatorów ruchu sieciowego, 
takich jak tcpdump, czy Wireshark. 
Możemy jednak pomiędzy serwisami ustawić pośrednika w postaci HAProxy, które będzie terminowało szyfrowane połączenie i umożliwiało nam podglądanie ruchu sieciowego.

### Opóźnienia requestów
Podczas rozwijania aplikacji zachodzi czasem potrzeba przetestowania jak zachowa się ona w przypadku dłuższego niż oczekiwane przetwarzania w wywoływanych usługach zewnętrznych.
Jeśli pośrednikiem w dostępie do zewnętrznych usług jest HAProxy, to mamy możliwość zasymulowania takiego opóźnienia.
HAProxy samo w sobie nie posiada takiej funkcjonalności, ale pozwala na rozszerzanie możliwości za pomocą skryptów pisanych w języku Lua.
Przykładowy skrypt dodający opóźnienie:
```
function delay_request(txn)
    core.msleep(15000)
end

core.register_action("delay_request", { "http-req" }, delay_request);
```
Załadowanie skryptu do HAProxy:
```
    lua-load /etc/haproxy/delay.lua
```
i użycie w konfiguracji:
```
frontend my-delay-frontend
    bind 172.19.0.1:81
    mode http
    http-request lua.delay_request
    default_backend my-delay-backend

backend my-delay-backend
    server my-external-server-1 172.19.0.2:8080
```
### Prosty serwer statycznej zawartości
W dość przewrotny sposób możemy wykorzystać HAProxy jako prosty serwer statycznych plików. 
Dla każdego backendu możemy skonfigurować pliki, które mają zostać zaserwowane w przypadku określonych statusów HTTP.
Z drugiej strony, w przypadku gdy w konfiguracji backendu nie zdefiniowano żadnego serwera, HAProxy generuje status HTTP 503.
Łącząc te dwa fakty możemy skonfigurować frontend, który dla określonych requestów będzie zwracał statyczny plik:
```
frontend my-frontend
    bind 172.19.0.1:81
    mode http
    use_backend my-backend-static if { path_end /index.html }
    default_backend my-backend-services

backend my-backend-static
    mode http
    errorfile 503 /etc/haproxy/index.html
    
backend my-backend-services
    server my-external-server-1 172.19.0.2:8080
```

### Podłączanie się do sesji
W środowisku deweloperskim zdarza się, że chcielibyśmy podłączyć się przeglądarką do istniejącej na serwerze sesji użytkownika (znając oczywiście identyfikator/token sesji).
Nowoczesne desktopowe przeglądarki zazwyczaj pozwalają nam ręcznie dodać ciasteczko sesyjne do zbioru ciasteczek danej witryny. 
Co jednak, jeśli musimy obsłużyć również te mniej lubiane przeglądarki albo wersje mobilne? Tu z pomocą również może przyjść nam HAProxy:
```
frontend my-setcookie-frontend
    bind 172.19.0.1:81
    mode http
    default_backend my-setcookie-backend

backend my-setcookie-backend
    mode http
    http-request redirect location http://172.19.0.1:80/\r\nSet-Cookie:\ JSESSIONID=%[urlp(session_id)] code 302
```
Przy takiej konfiguracji, wejście z dowolnej przeglądarki na adres http://172.19.0.1:81/?session_id=123456 spowoduje przekierowanie na http://172.19.0.1:80 z ustawionym już ciasteczkiem sesyjnym 
(wykorzystujemy tu fakt że ciasteczka ustawione dla domeny nie uwzględniają portów).

## Podsumowanie
Jak widać, HAProxy ma wiele klasycznych i mniej klasycznych zastosowań. 

Jego niewątpliwym atutem jest stosunkowo prosta konfiguracja i runtime'owa wydajność oraz "lekkość" (zaczytanie zmienionej konfiguracji odbywa się zwykle w ułamku sekundy).

Jest to narzędzie, które polecam do toolboxa każdego architekta systemów rozproszonych, a także do warsztatu deweloperskiego zwinnego programisty.
