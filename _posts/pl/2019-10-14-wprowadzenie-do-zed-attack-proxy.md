---
layout: post
title: Wprowadzenie do Zed Attack Proxy
published: true
lang: pl
date:      2019-10-14 03:00:00 +0100
author:    amak
image:     /assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/zed-attack-proxy.jpeg
tags:
  - programming
  - pentest
  - pentesting
  - tool
  - OWASP
  - security
description: "ZAP (Zed Attack Proxy) jest opensourcowym narzędziem tworzonym przez organizację OWASP wspomagającym testy penetracyjne, które służy do znajdowania podatności bezpieczeństwa w aplikacjach webowych. Działa na zasadzie proxy, dzięki czemu pozwala nie tylko na podglądanie żądań wysyłanych do serwera aplikacji i odpowiedzi z serwera otrzymywanych, ale daje również możliwość debugowania, modyfikowania oraz wysyłania własnych żądań. Jest narzędziem dostosowanym do obsługi HTTP, oferuje prosty sposób na rozszyfrowanie HTTPS poprzez dodanie własnego certyfikatu do przeglądarki. Dostarcza automatyczne skanery, jak również narzędzia pomagające manualnie testować aplikację."
---

ZAP (Zed Attack Proxy) jest opensourcowym narzędziem tworzonym przez organizację OWASP wspomagającym testy penetracyjne, które służy do znajdowania podatności bezpieczeństwa w aplikacjach
webowych. Działa na zasadzie proxy, dzięki czemu pozwala nie tylko na podglądanie żądań wysyłanych do serwera aplikacji i odpowiedzi z serwera otrzymywanych, ale daje również
możliwość debugowania, modyfikowania oraz wysyłania własnych żądań. Jest narzędziem dostosowanym do obsługi HTTP, oferuje prosty sposób na rozszyfrowanie HTTPS poprzez dodanie własnego
certyfikatu do przeglądarki. Dostarcza automatyczne skanery, jak również narzędzia pomagające manualnie testować aplikację.

## Instalacja oraz konfiguracja

[Link do pobrania ZAPa](https://github.com/zaproxy/zaproxy/wiki/Downloads)

By móc korzystać ze wszystkich funkcjonalności jakie dostarcza nam ZAP powinniśmy zacząć pracę od konfiguracji przeglądarki, tak by łączyła się ona przez proxy (lokalnie odpalonego ZAPa).
Z uwagi na prostą konfigurację polecaną przeglądarką jest Firefox. W menu przeglądarki odnajdujemy Preferencje → Sieć i wchodzimy w Ustawienia. Zaznaczamy "Ręczna konfiguracja
serwerów proxy". Domyślne wartości dla serwera to 127.0.01, a dla portu 8080.

![2019-09-30-zap-01.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-01.png)

Od tego momentu ZAP działa jako proxy, wszystkie żądania, które wysyłamy do aplikacji oraz wszystkie odpowiedzi, które otrzymujemy, przechodzą od teraz przez ZAPa.

### HTTPS

W poprzednim kroku skonfigurowaliśmy przeglądarkę, by móc podglądać ruch HTTP w sieci. Aby używać ZAPa na stronach wymagających HTTPS, musimy dodać certyfikat ZAPa do naszej
przeglądarki. Certyfikat znajdziemy w Options → Dynamic SSL Certificates.

![2019-09-30-zap-02.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-02.png)

W przeglądarce importujemy certyfikat w Preferencje → Prywatność i bezpieczeństwo → Certyfikaty → Wyświetl certyfikaty... → Importuj. Certyfikat ten jest certyfikatem CA - zaimportowanie
go spowoduje dodanie OWASP Root CA do listy organów certyfikacji w naszej przeglądarce:

![2019-09-30-zap-03.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-03.png)

Teraz już możemy podglądać zarówno ruch nieszyfrowany jak i szyfrowany pomiędzy przeglądarką i serwerami, z którymi się łączy. Musimy pamiętać, że od tej chwili nasza przeglądarka jest podatna
na atak Man in the middle i nie powinniśmy z niej korzystać w innych celach, niż do testowania. Przejdźmy zatem do zabawy ZAPem.

## ZAP - wprowadzenie

Do prezentacji działania ZAPa wykorzystamy inne narzędzie: [Webgoat](https://github.com/WebGoat/WebGoat), które jest celowo podatną aplikacją opensourcową napisaną w Javie umożliwiającą testowanie często spotykanych błędów
bezpieczeństwa w aplikacjach korzystających z popularnych opensourcowych komponentów.Korzystając z tych dwóch aplikacji musimy pamiętać, by jedną z nich uruchomić z innym portem
niż domyślny 8080. Po stronie ZAPa port możemy zmienić w ustawieniach Options → Local Proxies.

![2019-09-30-zap-04.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-04.png)

Po uruchomieniu aplikacji Webgoat możemy podglądać całą komunikację z serwerem. W zakładce History widzimy historię wszystkich zapytań. Możemy wykluczyć wewnętrzne zapytania Webgoata
z historii komunikacji, dzięki czemu stanie się ona bardziej przejrzysta. W tym celu klikamy prawym przyciskiem myszy na jeden z wpisów w historii, wybieramy Exclude from → Proxy
i dodajemy URLe, które będą ignorowane (możemy w tym celu użyć wyrażeń regularnych).

![2019-09-30-zap-05.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-05.png)

Z lewej strony programu umiejscowione jest menu. W zakładce Sites, podobnie jak w History, znajdują się wszystkie zapytania do serwera, jednak tutaj mamy zachowaną strukturę zasobów
na serwerze aplikacji. W tym miejscu możemy zauważyć również zakładkę Contexts. Konteksty umożliwiają testowanie aplikacji na różnych poziomach dostępu w tym samym momencie - by to osiągnąć
dodajemy kontekst dla poszczególnych użytkowników. Możemy też w tym miejscu w zakładce Structure skonfigurować parametry URL.

![2019-09-30-zap-06.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-06.png)

## Debugowanie oraz modyfikacja zapytań

W zakładce Request oraz Response możemy podejrzeć żądanie i odpowiedź z serwera. ZAP umożliwia przechwytywanie zapytań oraz ich modyfikację. By przetestować działanie tej funkcjonalności
ustawiamy breakpointy za pomocą okrągłej zielonej ikonki umieszczonej w górnym pasku menu.

![2019-09-30-zap-08.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-08.png)

Klikając na ikonkę ustawimy breakpointy na każdym zapytaniu oraz odpowiedzi - ikonka po kliknięciu zmienia kolor na czerwony. Następnie w aplikacji Webgoat wprowadzamy dane wejściowe w dowolnym polu
do tego przeznaczonym, np. w sekcji General -> HTTP Basics. Na potrzeby naszego testu wprowadziłam tekst "Consdata".

![2019-09-30-webgoat-01.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-webgoat-01.png)

Szczegóły zapytania w trybie debugowania otwierają się w zakładce Break, a poniżej okna z żądaniem znajduje się pole, w którym możemy je modyfikować.

![2019-09-30-zap-07.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-07.png)

Modyfikujemy żądanie wprowadzając tekst "123" w miejsce "Consdata":

![2019-09-30-zap-09.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-09.png)

W rezultacie otrzymamy odpowiedź z serwera zawierającą zmodyfikowane przez nas dane "The server has reversed your name: 321", co możemy zaobserwować w ZAPie oraz Webgoacie.

![2019-09-30-zap-10.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-10.png)

![2019-09-30-webgoat-02.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-webgoat-02.png)

## Funkcjonalności wspierające testy penetracyjne

ZAP posiada szereg funkcji umożliwiających przeskanowanie aplikacji w poszukiwaniu różnych zasobów i podatności oraz wykonanie ataków. Jest to jednak narzędzie wspomagające pracę pentestera,
bez manualnego przeklikania się przez aplikację nie jest możliwe znalezienie wszystkich podatności. Narzędzia umożliwiające wykonanie skanów oraz ataków znajdziemy klikając prawym przyciskiem
myszy w zakładce Sites na folderze, który chcemy przetestować lub w zakładce History na interesującym nas endpointcie (bądź kilku) w sekcji Attack albo w górnym pasku menu w zakładce Tool.

### Spider
Jedynym z początkowych etapów testów penetracyjnych jest manualne przeszukanie aplikacji w celu znalezienia zasobów znajdujących się na serwerze. Narzędziem, które może zautomatyzować część
pracy jest Spider. Skanuje on aplikację w poszukiwaniu ukrytych zasobów. W przypadku, gdy chcemy przeszukać zasoby pobierane asynchronicznie powinniśmy użyć skanera AjaxSpider. Należy jednak
zwrócić uwage na fakt, że narzędzie to nie zastąpi ręcznego przeszukania aplikacji, ponieważ przechodzi jedynie przez HTMLowe linki na stronie. Nie sprawdzi się również w przypadku aplikacji,
gdzie DOM jest generowany dynamicznie, nie obsłuży też eventów innych niż standardowe. Po uruchomieniu narzędzia w aplikacji pojawia się sekcja Spider, w której możemy znależć wyniki skanu.

![2019-09-30-zap-11.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-11.png)

### ActiveScan
ActiveScan jest narzędziem aktywnie skanującym aplikację, wykonującym serię ataków, którego zadaniem jest znalezienie podatności. Wysyła żądania do kolejnych endpointów automatycznie modyfikując
ich treść, analizuje odpowiedzi i określa na ich podstawie podatności. Jednak tak jak przy Spiderze, tak i tutaj nie obędzie się bez ręcznego przejścia aplikacji. ActiveScan nie potrafi bowiem
samodzielnie wyszukać wszystkich endpointów, trzeba mu je wskazać. Dopiero gdy znajdą się one w historii komunikacji mamy pewność, że skaner je przetestuje. Gdy skaner znajdzie podatność
zobaczymy czerwoną flagę przy endpointcie, a w zakładce Alerts znajdą się informacje na temat znalezionej podatności.
Działanie ActiveScan przetestujemy w miejscu, o którym wiemy, że zawiera błąd bezpieczeństwa. W Webgoacie otwieramy sekcję Injection Flaws → SQL Injection (introduction) → krok 11 i wprowadzamy
dowolne dane w widocznych polach.

![2019-09-30-webgoat-03.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-webgoat-03.png)

Po wprowadzeniu danych zobaczymy w ZAPie w sekcji History URL: http://localhost:9000/WebGoat/SqlInjection/attack8 i będziemy mogli podejrzeć żądanie.

![2019-09-30-zap-12.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-12.png)

ActiveScan uruchomimy na tym endpoincie, by skrócić czas skanowania. Po uruchomieniu narzędzia w ZAPie pojawi się zakładka Active Scan, w której będziemy mogli zobaczyć wszystkie żądania wysyłane
do serwera przez ActiveScan, np.:

![2019-09-30-zap-13.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-13.png)

Jeśli zostaną znalezione błędy, zobaczymy je w zakładce Alerts. Widzimy tu informacje dotyczące URLa, w którym ActiveScan znalazł błąd, jakie dane wejściowe sprowokowały błąd, opis błędu,
dodatkowe informacje, proponowane rozwiązanie oraz referencje.

![2019-09-30-zap-14.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-14.png)

W panelu Sites pojawi się również czerwona flaga w miejscu, w którym znaleziony zostal błąd.

### ForcedBrowse
ForcedBrowse jest narzędziem, który szuka plików o znanych lub łatwych do przewidzenia nazwach na serwerze aplikacji korzystając z odpowiednich słowników. W ten sposób możemy znaleźć zasoby,
które na serwerze nie powinny się znaleźć i stanowią zagrożenie. Może to na przykład być repozytorium, pliki konfiguracyjne, pliki z backupem, panel administracyjny, itp. W ZAPie wbudowanych
jest kilka podstawowych słowników, jednak bardziej rozbudowane można znaleźć na githubie, na przykład:

[https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt](https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt)

Słownik możemy dodać wybierając z górnego menu Tools -> Options -> ForcedBrowse -> Add custom Forced Browse file. Po uruchomieniu narzędzia w ZAPie pojawi się zakładaka Forced Browse, w której
widzimy pasek postępu zadania, plik z jakiego pobierane są dane oraz wyniki skanu.

![2019-09-30-zap-15.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-15.png)

W rzeczywistości ForcedBrowse bazuje na narzędziu DirBuster, które zostało wbudowane w ZAPa. Czas trwania skanu jest uzależniony od wielu czynników - wydajnosci serwera, wielkosci słownika
i zastosowanych na sererze mechanizmów zabezpieczających. Warto zaznaczyć, że skan może zająć nawet do kilkudziesięciu godzin.

### Fuzz
Narzędzie Fuzz wykonuje atak za pomocą techniki fuzzingu, czyli wysyłaniu do aplikacji predefiniowanych lub dynamicznie generowanych danych wejściowych w celu sprowokowania błędów.
By przeprowadzić ten atak należy wywołać żądanie, zaznaczyć na nim element, który będziemy poddawać modyfikacji, wybrać Fuzz z bocznego menu oraz dodać dane wejściowe (Payloads).

![2019-09-30-zap-16.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-16.png)


Mamy możliwość zdefiniowana różnego rodzaju danych wejściowych w Fuzz -> Payloads -> Add. Mogą to być na przykład stringi, wyrażenia regularne, skrypty, pliki ze zdefiniowanymi wejściami. Następnie
należy ustawić odpowiednie kodowanie w zależności od formy w jakiej dane mają być dostarczone do aplikacji.

![2019-09-30-zap-17.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-17.png)

Po ukończeniu fuzzowania należy przeanalizować odpowiedzi na wysyłane żądania - nietypowe odpowiedzi, na przykład zawierające komunikaty o błędach, mogą zasugerować obecność podatności danego typu
(na przykład błędy SQL sugerują, że możemy testować SQL injection). Odpowiedzi znajdują się w zakładce Fuzzer, która otwiera się podczas przeprowadzania ataku.

![2019-09-30-zap-18.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-18.png)

W analizie odpowiedzi pomaga posegregowanie ich po wielkości. Większy rozmiar odpowiedzi sugeruje, że możemy znaleźć tam interesujący błąd. W przypadku naszego testu otrzymaliśmy w odpowiedzi dane
z bazy danych oraz informację potwierdzającą nasz suckes: "You have succeeded! You successfully compromised the confidentiality of data by viewing internal information that you should not have
access to. Well done!".

![2019-09-30-zap-19.png](/assets/img/posts/2019-10-14-wprowadzenie-do-zed-attack-proxy/2019-09-30-zap-19.png)


## Podsumowanie
ZAP jest narzędziem dostosowanym do obsługi protokołu HTTP i oferującym łatwy sposób na rozszyfrowanie HTTPS. Dzięki funkcji proxy daje możliwość nie tylko podglądania, ale też modyfikowania i wysyłania
własnych żądań. Posiada również wiele dodatkowych funkcjonalności ułatwiających przeprowadzenie testów penetracyjnych. Musimy jednak pamiętać o ograniczeniach podczas korzystania z tego typu narzędzi.
Żadne narzędzie nie zautomatyzuje w pełni procesu testowania bezpieczeństwa aplikacji. Wyszukiwanie ewentualnych błędów bezpieczeństwa nie obędzie się bez manualnego przejścia aplikacji i umiejętnej
analizy oraz interpretacji odpowiedzi serwera.

## Materiały źródłowe
* [https://github.com/zaproxy/zaproxy/wiki/Downloads](https://github.com/zaproxy/zaproxy/wiki/Downloads)
* [https://github.com/zaproxy/zaproxy/wiki](https://github.com/zaproxy/zaproxy/wiki)
* [https://owasp-academy.teachable.com/p/owasp-zap-tutorial](https://owasp-academy.teachable.com/p/owasp-zap-tutorial)
* [https://github.com/zaproxy/zap-core-help/wiki/HelpIntro](https://github.com/zaproxy/zap-core-help/wiki/HelpIntro)
* [https://github.com/WebGoat/WebGoat](https://github.com/WebGoat/WebGoat)
* [https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt](https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt)
