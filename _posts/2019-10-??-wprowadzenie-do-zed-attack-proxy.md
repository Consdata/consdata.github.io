---
layout: post
title: Wprowadzenie do Zed Attack Proxy
published: false
date:      2019-09-30 03:00:00 +0100
author:    amak
tags:
  - programming
  - pentest
  - pentesting
  - tool
  - OWASP
  - security
---

ZAP (Zed Attack Proxy) jest  opensourcowym narzędziem tworzonym przez organizację OWASP wspomagającym testy penetracyjne, które służy do znajdowania podatności bezpieczeństwa w aplikacjach
webowych. Działa na zasadzie proxy, dzięki czemu pozwala nie tylko na podglądanie żądań i odpowiedzi wysyłanych i otrzymywanych z serwera aplikacji, ale daje również
możliwość debugowania, kmodyfikowania oraz wysyłania własnych żądań. Jest narzędziem dostosowanym do obsługi HTTP, oferuje prosty sposób na rozszyfrowanie HTTPS poprzez dodanie własnego
certyfikatu do przeglądarki.
Dostarcza automatyczne skanery, jak również narzędzia pomagające manualnie testować aplikację.

## Instalacja oraz konfiguracja

Link do pobrania:

https://github.com/zaproxy/zaproxy/wiki/Downloads

By móc korzystać ze wszystkich funkcjonalności jakie dostarcza nam ZAP powinniśmy zacząć pracę od konfiguracji przeglądarki, tak by łączyła się ona przez proxy (lokalnie odpalonego ZAPa).
Z uwagi
na prostą konfigurację najczęściej polecaną przeglądarką jest Firefox. W menu przeglądarki odnajdujemy Preferencje > Sieć i wchodzimy w Ustawienia. Zaznaczamy "Ręczna konfiguracja serwerów
 proxy", domyślne wartości dla serwera to 127.0.01,  a dla portu 8080.

![2019-09-30-zap-01.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-01.png)

Od tego momentu ZAP działa jako proxy, wszystkie żądania, które wysyłamy do aplikacji oraz wszystkie odpowiedzi, które otrzymujemy, przechodzą od teraz przez ZAPa.

### HTTPS

W poprzednim kroku skonfigurowaliśmy przeglądarkę, by móc podglądać ruch HTTP w sieci. Aby używać ZAPa na stronach wymagających HTTPS, musimy dodać certyfikat ZAPa do naszej
przeglądarki. Certyfikat znajdziemy w Options → Dynamic SSL Certificates.

![2019-09-30-zap-02.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-02.png)

W przeglądarce importujemy certyfikat w Preferencje → Prywatność i bezpieczeństwo → Certyfikaty → Wyświetl certyfikaty... → Importuj. Certyfikat ten jest certefikatem CA - zaimportowanie
go spowoduje dodanie OWASP Root CA do listy organów certyfikacji w naszej przeglądarce:

![2019-09-30-zap-03.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-03.png)

Teraz już możemy podglądać zarówno ruch nieszyfrowany jak i szyfrowany pomiędzy przeglądarką i serwerami z którymi się łączy . Musimy pamiętać, że od tej chwili nasza przeglądarka jest podatna na atak Man in the middle i nie powinniśmy
z niej korzystać w innych celach, niż do testowania. Przejdźmy zatem do zabawy ZAPem.

## ZAP  - wprowadzenie

Do prezentacji działania ZAPa wykorzystamy inne narzędzie: Webgoat, które jest celowo podatną aplikacją opensourcową napisaną w Javie, która umożliwia testowanie często spotykanych błędów
bezpieczeństwa w aplikacjach korzystających z popularnych opensourcowych komponentów.  Korzystając z tych dwóch aplikacji musimy pamiętać, by jedną z nich uruchomić z innym portem
niż domyślny 8080. Po stronie Zapa możemy zmienić port w ustawieniach Options → Local Proxies.

![2019-09-30-zap-04.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-04.png)

Po uruchomieniu aplikacji Webgoat możemy podglądać całą komunikację z serwerem. W zakładce History widzimy historię wszystkich zapytań.  Możemy wykluczyć wewnętrzne zapytania Webgoata
z historii komunikacji, dzięki czemu stanie się ona bardziej przejrzysta. W tym celu klikamy prawym przyciskiem myszy na jeden z wpisów w historii i wybieramy  Exclude from → Proxy
i dodajemy URLe, które będą ignorowane (możemy w tym celu użyć wyrażeń regularnych).

![2019-09-30-zap-05.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-05.png)

Z lewej strony programu umiejscowione jest menu. W zakładce Sites, podobnie jak w History, również znajdują się wszystkie zapytania do serwera, jednak tutaj mamy zachowana strukturę zasobów
na serwerze aplikacji. W tym miejscu możemy zauważyć również zakładkę Contexts. Konteksty umożliwiają testowanie aplikacji na różnych poziomach dostępu w tym samym momencie - by to osiągnąć
dodajemy kontekst dla poszczególnych użytkowników. Możemy też w tym miejscu w zakładce Structure skonfigurować parametry URL.

![2019-09-30-zap-06.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-06.png)

## Debugowanie oraz modyfikacja zapytań

W zakladce Request oraz Response możemy podejrzeć żądanie oraz odpowiedź z serwera. ZAP umożliwia przechwytywanie zapytań oraz ich modyfikację. By skorzystać z tej funkcjonalności ustawiamy
breakpointy za pomocą okrągłej zielonej ikonki umieszczonej w górnym pasku menu. Klikając na ikonkę ustawimy breakpointy na każdym zapytaniu oraz odpowiedzi. Szczegóły zapytania w trybie
debugowania otwierają się w zakładce Break, a  poniżej okna z żadaniem znajduje się pole, w którym możemy modyfikować żądanie.

![2019-09-30-zap-07.png](/assets/img/posts/2019-09-30-wprowadzenie-do-zap/2019-09-30-zap-07.png)

## Funkcjonalności wspierające testy penetracyjne

ZAP posiada szereg funkcji umożliwiających przeskanowanie aplikacji w poszukiwaniu różnych zasobów i podatności oraz wykonanie ataków. Jest to jednak narzędzie wspomagające pracę pentestera,
bez manualnego przeklikania się przez aplikację nie jest możliwe znalezienie wszystkich podatności. Narzędzia umożliwiające wykonanie skanów oraz ataków znajdziemy klikając lewym przyciskiem
myszy w  zakładce Sites na folderze, który chcemy przetestować lub w zakładce History na interesującym nas endpointcie (bądź kilku).

### Spider
Spider jest narzędziem, które skanuje aplikację w poszukiwaniu ukrytych zasobów. W przypadku, gdy chcemy przeszukać zasoby pobierane asynchronicznie należy użyć skanera AjaxSpider. Narzędzie
to nie zastąpi manualnego przeszukania aplikacji, ponieważ przechodzi jedynie przez HTMLowe linki na stronie. Nie sprawdzi się również w przypadku aplikacji, gdzie DOM jest generowany
dynamicznie, nie obsłuży też eventów innych niż standardowe.

### ActiveScan
ActiveScan jest narzędziem aktywnie skanującym aplikację, wykonującym serię ataków, którego zadaniem jest znalezienie podatności. Wysyła żadania do kolejnych endpointów automatycznie modyfikując
ich treść, analizuje odpowiedzi i określa na ich podstawie podatności. Jednak tak jak przy Spiderze, tak i tutaj nie obędzie się bez ręcznego przejścia aplikacji. ActiveScan nie potrafi bowiem
samodzielnie wyszukać wszystkich endpointów, trzeba mu je wskazać. Dopiero gdy znajdą się one w historii komunikacji, mamy pewność, że skaner je przetestuje. Gdy skaner znajdzie podatność
zobaczymy czerwoną flagę przy endpointcie, a w zakładce Alerts znajdą się informację na temat znalezionej podatności, jej opis, sugestie dotyczącej rozwiązania problemu oraz referencje.

### ForcedBrowse
ForcedBrowse jest narzędziem, który szuka plików o znanych lub łatwych do przewidzenia nazwach na serwerze aplikacji korzystając z odpowiednich słowników.. W ten sposób możemy znaleźć zasoby,
które na serwerze nie powinny się znaleźć i stanowią zagrożenie. Może to na przykład być repozytorium, pliki konfiguracyjne, pliki z backupem, panel administracyjny, itp.  W ZAPie wbudowanych
jest kilka podstawowych słowników, jednak bardziej rozbudowane można znaleźć na githubie, na przykład:

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt

W rzeczywistości ForcedBrowse bazuje na narzędziu DirBuster, które zostało wbudowane w ZAPa. Czas trwania skanu jest uzależniony od wielu czynników - wydajnosci serwera, wielkosci słownika
i zastosowanych na sererze mechanizmów zabezpieczających. Warto zaznaczyć, że skan może zająć nawet do kilkudziesięciu godzin.

### Fuzz
Narzędzie Fuzz wykonuje atak za pomocą techniki fuzzingu, czyli wysyłaniu do aplikacji predefiniowyanych lub dynamicznie generowanych danych wejściowych w celu sprowokowania błędów.
By przeprowadzić ten atak należy wywołać żądanie, zaznaczyć na nim element, który będziemy poddawać modyfikacji, wybrać Fuzz z bocznego menu oraz dodać dane wejściowe (Payloads). Mamy możliwość
zdefiniowana różnego rodzaju danych wejściowych - mogą to być na przykład stringi, wyrażenia regularne, skrypty, pliki ze zdefiniowanymi wejściami.  Następnie w Fuzz → Payloads → Processors należy
ustawić odpowiednie kodowanie w zależnosci od formy w jakiej dane mają być dostarczone do aplikacji. Po ukończeniu fuzzowania należy przeanalizować odpowiedzi na wysyłane żądania -  nietypowe
odpowiedzi, na przykład zawierające komunikaty o błędach, mogą zasugerować obecność podatności danego typu (na przykład błędy SQL sugerują, że możemy testować SQL injection).

## Materiały źródłowe
https://github.com/zaproxy/zaproxy/wiki/Downloads
https://github.com/zaproxy/zaproxy/wiki
https://owasp-academy.teachable.com/p/owasp-zap-tutorial
https://github.com/zaproxy/zap-core-help/wiki/HelpIntro
https://github.com/WebGoat/WebGoat
https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SVNDigger/all.txt
