---
layout: post
title: Kafka Companion
published: true
lang: pl
date:      2019-10-03 08:00:00 +0100
author:    jgrobelny
image:     /assets/img/posts/2019-10-03-kafka-companion/thumbnail.webp
tags:
  - programming
  - kafka
  - event sourcing
  - tool
description: "Stalo się standardem, że współczesne narzędzia i biblioteki dystrybuowane są z mniej lub bardziej zaawansowanym interfejsem graficznym. RabbitMQ, będący najpopularniejszym obecnie systemem kolejkowym, wita nas po zainstalowaniu przejrzystym i funkcjonalnym panelem administracyjnym. Może więc budzić zdziwienie, że Apache Kafka nie została wyposażona w żadne GUI. Do dyspozycji dostajemy jedynie zestaw skryptów bashowych, które co prawda pozwalają wykonać wiele czynności administracyjnych, to jednak korzystanie z nich nie należy do przyjemnych. Sprawiają wrażenie pisanych przez różne zespoły developerskie, ponieważ te same parametry potrafią mieć inne nazwy. W dodatku skrypty są bezstanowe - każde wywołanie musi mieć pełen zestaw parametrów identyfikujących serwer i zasoby do których chcemy się odwołać. Naturalnym jest zatem, że do wygodnej i wydajnej pracy warto wdrożyć rozwiązanie, które pozwala w łatwy sposób podejrzeć stan serwera oraz topików na Kafce. Z kolei ze względu na prostotę testowania i diagnostyki, warto mieć możliwość dodawania nowych komunikatów."
---

Stalo się standardem, że współczesne narzędzia i biblioteki dystrybuowane są z mniej lub bardziej zaawansowanym interfejsem graficznym. RabbitMQ, będący najpopularniejszym obecnie systemem kolejkowym, wita nas po zainstalowaniu przejrzystym i funkcjonalnym panelem administracyjnym. Może więc budzić zdziwienie, że Apache Kafka nie została wyposażona w żadne GUI. Do dyspozycji dostajemy jedynie zestaw skryptów bashowych, które co prawda pozwalają wykonać wiele czynności administracyjnych, to jednak korzystanie z nich nie należy do przyjemnych. Sprawiają wrażenie pisanych przez różne zespoły developerskie, ponieważ te same parametry potrafią mieć inne nazwy. W dodatku skrypty są bezstanowe - każde wywołanie musi mieć pełen zestaw parametrów identyfikujących serwer i zasoby do których chcemy się odwołać. Naturalnym jest zatem, że do wygodnej i wydajnej pracy warto wdrożyć rozwiązanie, które pozwala w łatwy sposób podejrzeć stan serwera oraz topików na Kafce. Z kolei ze względu na prostotę testowania i diagnostyki, warto mieć możliwość dodawania nowych komunikatów.

## Dlaczego piszemy własne narzędzie
Poszukując administracyjnego frontendu do naszej Kafki, zainstalowaliśmy i przetestowaliśmy szereg dostępnych w sieci darmowych aplikacji. Niestety żadna z nich nie spełniła wszystkich wyspecyfikowanych wymagań. Nie pozostało nam zatem nic innego, jak przygotować własne narzędzie. Tak oto powstał Kafka Companion. Uważni czytelnicy naszego bloga zauważą pewnie, że nie jest to pierwszy Companion, który powstał w naszej firmie. Podobne pobudki doprowadziły chociażby do implementacji SQCompaniona, o którym pisał Grzegorz Lipecki w artykule [Monitorowanie zespołowych trendów jakości kodu]({% post_url pl/2018-02-22-monitorowanie-zespolowych-trendow-jakosci-kodu %})

## Podstawowe funkcjonalności
Aplikacja podzielona jest na trzy moduły dostarczające istotnych funkcjonalności podczas codziennej pracy developerskiej z Kafką.

### Podgląd kondycji klastra
Ekranem, od którego należałoby rozpocząć, jest lista wszystkich węzłów w klastrze. Znając topologię możemy upewnić się, czy węzły klastra są żywe oraz jakie mają identyfikatory.
![2019-10-03-kafka-companion_brokers.png](/assets/img/posts/2019-10-03-kafka-companion/2019-10-03-kafka-companion_brokers.png)

### Podgląd i dodawanie wiadomości do topiku
Możliwość podglądania stanu kolejek oraz dodawania nowych wiadomości jest niezwykle istotna podczas rozwijania oraz testowania systemu. W naszym rozwiązaniu wszystkie wiadomości są JSONami, więc dodatkowo widok wiadomości próbuje rozłożyć je do postaci tabeli tak, aby można było przejrzyście zaprezentować stan topiku.  Prezentowane są także metadane związane z numerem partycji oraz offsetem wiadomości.
![2019-10-03-kafka-companion_messages_list.png](/assets/img/posts/2019-10-03-kafka-companion/2019-10-03-kafka-companion_messages_list.png)

W każdej chwili możemy zarzucić topik dowolną liczbą wiadomości. Wprowadziliśmy także placeholdery pozwalające na różnicowanie wiadomości dodawanych w jednej serii.
![2019-10-03-kafka-companion_messages_new.png](/assets/img/posts/2019-10-03-kafka-companion/2019-10-03-kafka-companion_messages_new.png)

### Podgląd stanu grup konsumentów
Ostatnim ekranem jest podgląd grup konsumentów.
![2019-10-03-kafka-companion_consumers_list.png](/assets/img/posts/2019-10-03-kafka-companion/2019-10-03-kafka-companion_consumers_list.png)

 Dowiadujemy się z niego kto konsumuje wiadomości z topików oraz, co bardzo ważne, czy wiadomości są konsumowane na bieżąco.
![2019-10-03-kafka-companion_consumers_details.png](/assets/img/posts/2019-10-03-kafka-companion/2019-10-03-kafka-companion_consumers_details.png)

## Podsumowanie
Kafka Companion jest darmowy i dostępny na naszym [Githubie](https://github.com/Consdata/kafka-companion). Zachęcam do pobrania, testowania i zgłaszania uwag.

## Zaproszenie na 4developers
Jeżeli zainteresowała was tematyka poruszana w tym artykule to serdecznie zapraszam na moje wystąpienie na 4Developers, gdzie wykorzystam Kafka Companiona podczas mojej prezentacji. Wielkopolska edycja 4Developers odbędzie się 18.11. Ścieżki tematyczne, jakie pojawią się w Poznaniu, to: .NET, Architektury Aplikacji, Java, JavaScript

[Tutaj zdobędziecie bilety](https://evenea.pl/event/4developerspoznan2019/)
