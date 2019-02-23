---
layout:    post
title:     "Wireshark - czy to gryzie?"
date:      2017-01-19 08:00:00 +0100
published: true
author:    tlewandowski
tags:
    - tech
    - wireshark
    - networks
---

Z programem Wireshark pierwszy raz zetknąłem się w czasie studiów na zajęciach z sieci komputerowych (dla niewtajemniczonych: Wireshark to aplikacja która umożliwia przechwytywanie i nagrywanie pakietów danych, a także ich dekodowanie i analizowanie). Wówczas odniosłem wrażenie że jest to narzędzie stricte dla administratorów sieci i nie ma większego zastosowania w obszarze wytwarzania i utrzymywania oprogramowania.

Z upływem czasu zrozumiałem że tworzenie systemów to nie tylko pisanie pięknego i czystego kodu, ale także długie godziny spędzone na debugowaniu błędów i analizowaniu problemów. W wielu sytuacjach kluczowa jest możliwość podejrzenia komunikatów przesyłanych między elementami systemu. Do tego właśnie świetnie sprawdziło się narzędzie poznane na studiach.

Poniżej pokażę przykładowe sytuacje w których wykorzystałem Wiresharka, żeby dotrzeć do sedna analizowanego problemu.

## "Dlaczego serwisy się nie dogadują?"
Jakiś czas temu pracowałem przy utrzymaniu systemu zrealizowanego w architekturze rozproszonej, którego moduły komunikowały się za pomocą RESTa. Niestety logi aplikacyjne nie zawsze były wystarczająco szczegółowe. W pewnym przypadku dostawaliśmy w logach wpisy postaci:
```
12:33:52.823 [main] DEBUG org.springframework.web.client.RestTemplate - GET request for "http://172.19.57.4:8080/fin2/acc/balance?accNum=93%201090%200088%205180%205697%201019%203200" resulted in 500 (null); invoking error handler
Exception in thread "main" org.springframework.web.client.HttpServerErrorException: 500 null
    at org.springframework.web.client.DefaultResponseErrorHandler.handleError(DefaultResponseErrorHandler.java:94)
    at org.springframework.web.client.RestTemplate.handleResponse(RestTemplate.java:667)
    at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java:620)
    at org.springframework.web.client.RestTemplate.execute(RestTemplate.java:580)
    at org.springframework.web.client.RestTemplate.getForObject(RestTemplate.java:287)
    at com.brdg.fin2.acc.AccClient.getBalance(AccClient.java:175)
```
Same logi niewiele mówiły, poza tym że serwer nie radzi sobie z obsługą żądania. Serwer raportował konkretną przyczynę niepowodzenia w treści odpowiedzi, jednak ta nie była logowana na kliencie. W takiej sytuacji analiza Wiresharkiem pozwoliła szybko ustalić co faktycznie było nie tak:
```http
GET /fin2/acc/balance?accNum=93%201090%200088%205180%205697%201019%203200 HTTP/1.1
Accept: text/plain, application/json, application/*+json, */*
User-Agent: Java/1.8.0_111
Host: 172.19.57.4:8080
Connection: keep-alive

HTTP/1.1 500
X-Application-Context: application:8080
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Connection: close

b5
{"status":500,"error":"Internal Server Error","exception":"java.lang.NumberFormatException","message":"For input string: \"93 10\"","path":"/fin2/acc/balance"}
0
```
W tym przypadku usunięcie spacji z numeru rachunku pozwoliło wyeliminować problem.

## "Przecież podaję ten parametr, o tu!"
Zdarza się, że pisanie nowego kodu idzie gładko, aż napotykamy na sytuację, w której wydaje nam się że wszystko dobrze zakodowaliśmy, a jednak serwer twierdzi że wysyłane przez nas żądanie jest niepoprawne. Przykład kodu klienta RESTowej usługi, który wydawał mi się poprawny:
```java
WebTarget webTarget = createWebTarget();
webTarget.queryParam("statementNo", statementNumber);
Response response = webTarget.request().get();
```
A jednak serwer uporczywie twierdził że:
```
Required String parameter 'statementNo' is not present.
```
Wyglądało jakby serwer nie potrafił odczytać wysyłanego przeze mnie parametru. Zanim jednak zacząłem obwiniać stronę serwerową, postanowiłem upewnić się że żądanie HTTP w istocie jest poprawne. Szybka analiza Wiresharkiem pokazała:
```http
GET /crwr/statement HTTP/1.1
User-Agent: Jersey/2.23.2 (HttpUrlConnection 1.8.0_79)
Accept: text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2
Connection: keep-alive

HTTP/1.1 400
...
```

Chwila, a gdzie mój parametr? Mając pewność, że problem leży jednak po stronie klienckiej, zacząłem wnikliwiej analizować kod linijka po linijce (tym razem czytając javadoki JAX-RS :) ) :
```java
/**
* Create a new {@code WebTarget} instance by configuring a query parameter on the URI
* of the current target instance.
* ...
* @return a new target instance.
* ...
*/
public WebTarget queryParam(String name, Object... values);
```
No cóż, przynajmniej mam teraz o czym pisać na blogu ;). Ten klient działał zdecydowanie lepiej:
```java
WebTarget webTarget = createWebTarget();
Response response = webTarget.queryParam("statementNo", statementNumber).webTarget.request().get();
```

## Jak zacząć z Wiresharkiem?
Podobnych przykładów mógłbym przywołać więcej, a każdy z nich utwierdza mnie w przekonaniu że warto nauczyć się korzystać z Wiresharka. Tym bardziej że jest to narzędzie niezależne od zastosowanego stosu technologicznego, więc jego znajomość może przydać się w różnych projektach.

Instalacja na Ubuntu sprowadza się do wykonania standardowych poleceń:
```bash
sudo apt-add-repository universe
sudo apt-get update
sudo apt-get install wireshark
```
Dodatkowo Wireshark używa biblioteki dumpcap, która musi dostać uprawnienia do działania na użytkowniku root. Sprawdzamy jej lokalizację:
```bash
sudo which dumpcap
```
a następnie:
```bash
sudo chmod 4711 [lokalizacja]
```

Po uruchomieniu Wiresharka wybieramy opcję "Capture/Options", a następnie interfejs sieciowy, na którym chcemy nasłuchiwać - w większości przypadków najwygodniej jest wybrać opcję "any", czyli nasłuchiwać na wszystkich interfejsach sieciowych. Następnie wpisujemy filtr przechwytywania określający jaki ruch sieciowy nas interesuje. Często wystarczy ograniczyć przechwytywanie do określonego portu, na którym chcemy obejrzeć żądania:

![Opcje przechwytywania](/assets/img/posts/2017-01-19-wireshark-czy-to-gryzie/1.png)

Pozostaje już tylko uruchomić przechwytywanie i wykonać akcję którą chcemy przeanalizować. W oknie Wiresharka powinniśmy zobaczyć zarejestrowany ruch sieciowy:

![Ruch sieciowy](/assets/img/posts/2017-01-19-wireshark-czy-to-gryzie/2.png)

Analizując komunikację HTTP najłatwiej jest wybrać opcję "Follow TCP Stream", co pozwoli nam w przystępny sposób obejrzeć następujące po sobie żądania i odpowiedzi na poziomie HTTP:

![Strumień TCP](/assets/img/posts/2017-01-19-wireshark-czy-to-gryzie/3.png)

## Końcowe przemyślenia
- Powyżej przedstawiłem oczywiście tylko podstawowe możliwości użycia narzędzia (aczkolwiek pokrywające 80% moich deweloperskich potrzeb). Oferuje ono dodatkowo wiele zaawansowanych ficzerów, jak choćby zaawansowane filtrowanie na poziomie przechwytywania i wyświetlania, kolorowanie pakietów, czy statystyki sieci.
- Wireshark nie zawsze może być wykorzystany bezpośrednio na danym hoście, bo np. ten nie posiada graficznego interfejsu, co najczęściej ma miejsce w środowisku serwerowym. Wówczas można posiłkować się narzędziem tcpdump, którym możemy zarejestrować ruch sieciowy do pliku na docelowym środowisku, a następnie plik ten wczytać do analizy w programie Wireshark.
- Istnieje wiele innych narzędzi potrafiących rejestrować ruch HTTP, m.in. Fiddler czy Live HTTP Headers. Wydaje się jednak że Wireshark jest bardziej wszechstronny i jego znajomość można wykorzystać również w innych poza HTTP obszarach, np. dlaczego mój klient LDAP nie działa, a inny tak?
- Używając Wireshark/tcpdump możemy analizować ruch nie tylko na hoście gdzie mamy uruchomione to narzędzie. Poprzez różne techniki, takie jak port mirroring czy ARP poisoning, możemy podsłuchiwać pakiety nie przechodzące bezpośrednio przez naszego hosta.