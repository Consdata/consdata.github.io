---
layout:    post
title:     "Czy wiesz, jak wykonać profilowanie aplikacji za pomocą JDK Flight Recorder?"
date:      2026-06-24T08:00:00+02:00
published: true
didyouknow: true
lang: pl
author: jwilczewski
image: /assets/img/posts/2026-06-24-czy-wiesz-jak-wykonac-profilowanie-aplikacji-za-pomoca-jdk-flight-recorder/thumbnail.webp
description: "Podczas przeprowadzania testów wydajnościowych czasami napotykamy sytuację, w której ich wyniki nie są zadowalające. Pojawia się wtedy pytanie, jak sprawdzić, co dzieje się wewnątrz aplikacji i na co zużywa ona najwięcej czasu."
tags:
- jdk-flight-recorder
- java
- visual-vm
- profiling
---

Podczas przeprowadzania testów wydajnościowych czasami napotykamy sytuację, w której ich wyniki nie są zadowalające.
Pojawia się wtedy pytanie, jak sprawdzić, co dzieje się wewnątrz aplikacji i na co zużywa ona najwięcej czasu.
W takiej sytuacji możemy np.:

- analizować logi,
- analizować metryki, jeżeli aplikacja takie posiada,
- zbierać metryki za pomocą agenta OpenTelemetry.

Innym sposobem jest uruchomienie samplera zbierającego statystyki z wątków pracujących w aplikacji. 
W tym celu możemy użyć np. [VisualVM](https://visualvm.github.io/). Kiedyś wchodził on w skład JDK, dlatego jest dość popularny.
Ma jednak pewną wadę - trzeba go podłączyć do działającego procesu javy, co może być utrudnione, jeżeli testy przeprowadzamy na środowisku,
do którego nie mamy takiego dostępu.

Wtedy z pomocą może przyjść nam [JDK Flight Recorder](https://dev.java/learn/jvm/jfr/configure/) – narzędzie wbudowane w JDK. 
Warto zaznaczyć, że posiadają je także JDK budowane przez niezależnych dostawców.

## Zbieranie danych

Aby uruchomić zbieranie danych za pomocą JFR, konieczne jest dodanie opcji uruchomieniowych dla testowanej aplikacji.
Na przykład jeżeli aplikacja wdrażana jest na serwerze Tomcat, możemy to zrobić poprzez edycję pliku `bin/setenv.sh`. 
Do zmiennej `CATALINA_OPTS` dodajemy odpowiednią konfigurację:

```bash
CATALINA_OPTS="$CATALINA_OPTS -XX:+FlightRecorder -XX:StartFlightRecording=filename=/var/log/profiling/profiling.jfr,delay=240s,duration=300s"
```

W tym przypadku dane profilowania zostaną zapisane w pliku `/var/log/profiling/profiling.jfr`. 
Profilowanie rozpocznie się po 240 sekundach od uruchomienia aplikacji (parametr delay) i potrwa 300 sekund (parametr duration). 
Ważne, aby aplikacja miała uprawnienia do zapisu we wskazanym pliku. 
Opóźnienie rejestrowania jest przydatne, ponieważ zazwyczaj nie chcemy profilować samego startu aplikacji.

Opis poszczególnych parametrów możemy znaleźć na stronie [DEV Java - Configuring the JDK Flight Recorder](https://dev.java/learn/jvm/jfr/configure/).

## Analiza danych

Zebrane dane możemy analizować za pomocą narzędzia JDK Mission Control dostępnego na stronie [Oracle](https://www.oracle.com/java/technologies/jdk-mission-control.html). 
Z punktu widzenia analizy tego, gdzie aplikacja spędziła najwięcej czasu, interesować nas może ekran Java Application→Method Profiling, 
który pokazuje najczęściej używane metody podczas samplowania wątków. Pamiętać należy o tym, żeby podczas zbierania danych uruchomione były testy, 
które obciążają aplikację.

![Analiza aplikacji z narzędzia JDK Mission Control](/assets/img/posts/2026-06-23-czy-wiesz-jak-wykonac-profilowanie-aplikacji-za-pomoca-jdk-flight-recorder/jdk-mission-control.png)
