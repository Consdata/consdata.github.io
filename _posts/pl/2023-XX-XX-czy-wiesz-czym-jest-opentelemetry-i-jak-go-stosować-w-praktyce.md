---
layout:    post
title:     "Czy wiesz, czym jest OpenTelemetry i jak go stosować w praktyce?"
date:      2023-XX-XXT08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: fphilavong
image: /assets/img/posts/2023-XX-XX-czy-wiesz-czym-jest-opentelemetry-i-jak-go-stosować-w-praktyce/otel.png
tags:
- OpenTelemetry
- tracing
- span
- trace
- Jaeger
---

## Słowem wstępu

OpenTelemetry to zbiór zestawów SDK i interfejsów API, który pozwala nam gromadzić, generować i eksportować logi, metryki i trace'y aplikacji.

OpenTelemetry umożliwia nam instrumentowanie naszych rozproszonych usług. Instrumentacją nazywamy przechwytywanie danych telemetrycznych ze zdarzeń i operacji w naszym systemie rozproszonym. Jest to nam niezbędne do tego, aby zrozumieć i zbadać zachowanie naszego systemu, znajdować błędy czy debugować problemy związane z wydajnością.

Dla lepszego zrozumienia OpenTelemetry warto wyjaśnić znaczenie następujących pojęć:

**Span** - reprezentuje akcję/operację, która miała miejsce w naszym systemie, może to być żądanie HTTP lub operacja bazy danych, która rozciąga się w czasie. Span zazwyczaj jest rodzicem/dzieckiem innego spana.

**Trace** - reprezentuje drzewo spanów połączonych w relacji dziecko/rodzic. Opisuje postęp żądań w różnych usługach i komponentach w naszym systemie (baza danych, źródła danych, kolejki itp.). Prostym trace'm jest np. zawołanie usługi, które spowodowało wysłanie zapytania do bazy danych.

## Zalety

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
java -javaagent:path/to/opentelemetry-javaagent.jar -jar moja_aplikacja.jar
```

Dla większości przypadków taka instrumentacja out-of-the-box jest całkowicie wystarczająca i nie trzeba nic więcej robić. Czasami jednak jest potrzebna tworzenia ręcznie dedykowanych spanów w kodzie, w tym celu OpenTelemetry dostarcza mechanizm manualnej instrumentacji.

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

Po utworzeniu spana musimy gdzieś go dostarczyć, OpenTelemetry pozwala np. zapisać go w pamięci, wysłać do danych wyjściowych konsoli lub narzędzia takiego jak Jaeger czy Zipkin.

Przykład obrazujący uruchomienie OpenTelemetry spiętego z Jaegerem:
```bash
OTEL_SERVICE_NAME=my-service OTEL_TRACES_EXPORTER=jaeger OTEL_EXPORTER_JAEGER_ENDPOINT=http://localhost:14250 java -javaagent:./opentelemetry-javaagent.jar -jar moja_aplikacja.jar
```
przy czym:

- OTEL_EXPORTER_JAEGER_ENDPOINT to endpoint pod którym wystawiony został Jaeger


## Zastosowanie OpenTelemetry w praktyce

Chcielibyśmy zaprezentować 2 przypadki, w których OpenTelemetry był w stanie pomóc nam znaleźć przyczynę nieefektywnego działania funkcjonalności naszego systemu.

### Przypadek nr 1

Otrzymaliśmy zgłoszenie od klienta, że w aplikacji do projektowania wniosków, po kliknięciu na edycję, po bardzo długim czasie (5-6 sekund) pojawiał się przycisk do dodania nowej zmiennej sesyjnej. Okazało się, że również na naszych środowiskach jesteśmy w stanie odtworzyć problem.

#### Analiza problemu

Aby znaleźć przyczynę problemu analiza przebiegła w następujących krokach:

1. W narzędziach deweloperskich przeglądarki, w ruchu sieciowym znaleźliśmy problematyczne, długo wykonujące się zapytanie: 
