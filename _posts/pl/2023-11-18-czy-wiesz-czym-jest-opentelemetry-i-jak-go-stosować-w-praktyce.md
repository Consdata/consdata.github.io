---
layout:    post
title:     "Czy wiesz, czym jest OpenTelemetry i jak go stosować w praktyce?"
date:      2023-11-18T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: fphilavong
image: /assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/otel.png
tags:
- OpenTelemetry
- tracing
- span
- trace
- Jaeger
---

## Słowem wstępu

OpenTelemetry to zbiór zestawów SDK i interfejsów API, który pozwala nam gromadzić, generować i eksportować logi, metryki i trace'y aplikacji.

OpenTelemetry umożliwia nam instrumentowanie naszych rozproszonych usług. Instrumentacją nazywamy przechwytywanie danych telemetrycznych ze zdarzeń i operacji w naszym systemie rozproszonym. Jest nam to niezbędne do tego, aby zrozumieć i zbadać zachowanie naszego systemu, znajdować błędy czy debugować problemy związane z wydajnością.

Dla lepszego zrozumienia OpenTelemetry warto wyjaśnić znaczenie następujących pojęć:

**Span** - reprezentuje akcję/operację, która miała miejsce w naszym systemie, może to być żądanie HTTP lub operacja bazy danych, która rozciąga się w czasie. Span zazwyczaj jest rodzicem/dzieckiem innego spana.

**Trace** - reprezentuje drzewo spanów połączonych w relacji dziecko/rodzic. Opisuje postęp żądań w różnych usługach i komponentach w naszym systemie (baza danych, źródła danych, kolejki itp.). Prostym trace'm jest np. zawołanie usługi, które spowodowało wysłanie zapytania do bazy danych.

Koncepcję spanów i trace'ów można przedstawić za pomocą diagramu:
![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/span_trace.png)



## Dlaczego warto stosować OpenTelemetry?

Wśród zalet stosowania OpenTelemetry można wyróżnić następujące trzy:
- przechowywanie danych telemetrycznych w jednym miejscu,
- wykorzystanie automatycznej instrumentacji,
- łatwa integracja z eksporterem.


### Dane telemetryczne w jednym miejscu

OpenTelemetry służy jako pojedyncza biblioteka gromadząca dane w ramach jednej specyfikacji. Mamy więc możliwość zebrania w jednym miejscu:
- logów,
- metryk,
- trace'ów

wykorzystując do tego jedno narzędzie - OpenTelemetry.


### Automatyczna instrumentacja

Integracja OpenTelemetry z naszą aplikacją w ramach automatycznej instrumentacji jest bardzo prosta. W przypadku aplikacji w Javie wystarczy dołączyć do niej agenta JAR. W ten sposób będzie wstrzykiwany kod bajtowy w celu przechwytywania danych telemetrycznych.

Przykładowa konfiguracja:
```bash
java -javaagent:ścieżka/do/opentelemetry-javaagent.jar -jar moja_aplikacja.jar
```

Dla większości przypadków taka instrumentacja out-of-the-box jest całkowicie wystarczająca i nie trzeba nic więcej robić. Czasami jednak jest potrzeba tworzenia ręcznie dedykowanych spanów w kodzie, w tym celu OpenTelemetry dostarcza mechanizm manualnej instrumentacji.

Przykładowy kod:
```bash
import io.opentelemetry.api;
 
//...
 
Tracer tracer =
    openTelemetry.getTracer("instrumentation-library-name", "instrumentation-library-version");
 
Span span = tracer.spanBuilder("custom_span").startSpan();
 
try (Scope ss = span.makeCurrent()) {
  // miejsce na modyfikację spana
} finally {
    span.end();
}
```

### Eksporter

Po utworzeniu spana musimy gdzieś go dostarczyć, OpenTelemetry pozwala np. na zapisanie go w pamięci, wysyłkę do danych wyjściowych konsoli lub narzędzia takiego jak Jaeger czy Zipkin.

Przykład obrazujący uruchomienie OpenTelemetry spiętego z Jaegerem:
```bash
OTEL_SERVICE_NAME=my-service OTEL_TRACES_EXPORTER=jaeger OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:14250 java -javaagent:./opentelemetry-javaagent.jar -jar moja_aplikacja.jar
```
przy czym:

- OTEL_EXPORTER_JAEGER_ENDPOINT to endpoint pod którym wystawiony został Jaeger


## Zastosowanie OpenTelemetry w praktyce

Chcielibyśmy zaprezentować 2 przypadki, w których OpenTelemetry był w stanie pomóc nam znaleźć przyczynę nieefektywnego działania funkcjonalności naszego systemu.

### Przypadek nr 1

Zauważyliśmy problem polegający na pewnym długo wykonującym się zapytaniu. Aby znaleźć przyczynę przeprowadziliśmy analizę w następujących krokach:

1. W narzędziach deweloperskich przeglądarki, w ruchu sieciowym znaleźliśmy problematyczne, długo wykonujące się zapytanie:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_1.png)
   Czas jego wykonania wyniósł ok. 20 sekund:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_2.png)
2. Dysponując informacją, które zapytanie stanowi problem mieliśmy dwa wyjścia:
    - dokonać dogłębnej analizy kodu, metoda po metodzie, w celu znalezienia problematycznego fragmentu kodu,
    - podpiąć na środowisku OpenTelemetry i Zipkina, w celu wyłapania przez nich problematycznego miejsca. To rozwiązanie zostało przez nas wybrane.
3. W Zipkinie bardzo szybko znaleźliśmy powyższe zapytanie:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_3.png)
4. Na wykresie widać od razu, że problematyczne okazały się dwa zapytania do bazy danych, każde z nich trwało po ok. 8 sek:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_4.png)
5. Analiza zapytania wykazała, że jest ono nieoptymalne. Po wykonaniu poprawki ponowiliśmy testy i uzyskaliśmy lepsze rezultaty:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_5.png)


### Przypadek nr 2

Postanowiliśmy przeprowadzić testy wydajnościowe w naszej aplikacji. Przy dużej liczbie użytkowników zauważyliśmy, że niektóre przypadki wykonywały się bardzo długo albo wręcz kończyły niepowodzeniem. Przeprowadziliśmy analizę w następujących krokach:

1. Na początku podpięliśmy Zipkina, OpenTelemetry oraz VisualVM na środowisku, na którym planowaliśmy uruchomić testy wydajnościowe.
2. Uruchomiliśmy testy - w rezultacie widzieliśmy kilka przypadków, które nie zakończyły się poprawnie z powodu długich czasów zapytań. Poszukaliśmy ich w Zipkinie, w ten sposób byliśmy w stanie namierzyć taki request, trwający niespełna 45 sekund:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_2_photo_1.png)
3. OpenTelemetry w ramach automatycznej instrumentacji wspiera bardzo wiele bibliotek, frameworków czy serwerów aplikacji ([pełną listę znajdziemy tutaj](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)). Niestety, w tym przypadku problem znajdował się dość niskopoziomowo, OpenTelemetry nie był w stanie wyłapać bezpośredniego źródła naszych problemów. Tutaj z pomocą przyszło nam narzędzie VisualVM. W Zipkinie widzieliśmy numer wątku, który przetworzył nasze zapytanie (tag "thread.name" w prawym dolnym rogu na zrzucie w punkcie 2), teraz pozostało znaleźć go w VisualVM
4. Analizując stacktrace'y zapytań wykonywanych na wątku o numerze 223 szybko wyłapaliśmy kilka problemów, m.in. problem spędzenia przez nasz wątek aż 54 sekund na zapisie danych do logowania:
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_2_photo_2.png)
   Teraz wystarczyło potwierdzić, że długi czas wykonywania metody _writeBytes()_ ma wpływ na nasz problem. Poszukaliśmy więc na wątku o numerze 223 stacktrace'a wykonywanego przez zapytanie wskazane przez Zipkina w punkcie 2 - _/webforms-rest/formservice/getnextpage_. Zagłębiając się w niego, znaleźliśmy w końcu podejrzewaną przez nas o problemy wydajnościowe metodę _writeBytes()_. VisualVM pokazał, że wykonywała się ona kilka sekund:   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_1_photo_4.png)
   ![](/assets/img/posts/2023-11-18-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/case_2_photo_3.png)
5. Ostatecznie wyciągnęliśmy następujące wnioski:
   Długi czas oczekiwania na odpowiedź systemu wynikał z zastosowania nieefektywnego systemu logowania. Każde ze zdarzeń ze wszystkich wątków było wysyłane na strumień standardowego wyjścia a następnie było przekierowane do pliku. W momencie wysłania na standardowe wyjście zakładany był lock tak, aby inny wątek nie wykonał tego w tym samym czasie. Przy tak dużej ilości wątków oraz zdarzeń oczekiwanie na swoją kolej wynosiło ok. 3-4 sekundy co przy kilku-kilkunastu zdarzeniach logowania podczas jednej operacji systemu znacznie obniżyło prędkość jego działania.

## Podsumowanie

OpenTelemetry to narzędzie dające wiele możliwości w monitorowaniu, analizie i zarządzaniu dystrybuowanymi systemami, dzięki czemu przydaje się w środowiskach chmurowych, mikrousługach i innych zaawansowanych architekturach systemowych.
