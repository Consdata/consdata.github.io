---
layout:    post
title:     "Kouncil - nowoczesny frontend do Kafki"
date:      2021-08-30 6:00:00 +0100
published: false
didyouknow: false
lang: pl
author:    jgrobelny
image:     /assets/img/posts/2021-08-30-kouncil-introduction/kouncil_dashboard.png
description: "Kouncil to nowoczesny frontend do Kafki, wyposażony w wiele niezbędnych programiście funkcjonalności."
tags:
- kouncil
- programming
- kafka
- event sourcing
- tool
---

Niespełna dwa lata temu w artykule [Kafka Companion]({% post_url pl/2019-10-03-kafka-companion.md %}) pisałem o narzędziu, które stworzyliśmy rozwijając system oparty o event sourcing na Kafce. Kafka Companiona już nie ma, ale jest to dobra informacja, gdyż jego miejsce zajął Kouncil. Nowa wersja narzędzia oferuje wszystkie funkcje, które posiadał poprzednik i jednocześnie wprowadza nowe. Oprócz rzucającego się w oczy całkowitego redesignu aplikacji pojawiły się nowe funkcjonalności, które w szczegółach zostaną opisane w kolejnych wpisach na tym blogu.

Motywacja opisana w poprzednim artykule nie uległa zmianie. Nadal uważamy, że żaden z dostępnych darmowych interfejsów graficznych do Kafki nie spełnia naszych oczekiwań. A trzeba przyznać, że kilka ich powstało. Przez ostatnie lata pracy z Kafką wypracowaliśmy szereg wzorców i dobrych praktyk, które Kouncil pozwala nam nadzorować. Przedstawię teraz poszczególne funkcjonalności, kładąc szczególny nacisk na to, co zmieniło się w stosunku do poprzednika.

## Podgląd kondycji klastra
Ekran pozwala podejrzeć listę węzłów w klastrze. Został rozbudowany o podstawowe statystyki maszyny, na której węzeł jest osadzony. Co więcej, po wybraniu elementu z listy, istnieje możliwość przeglądu wartości wszystkich parametrów konfiguracyjnych. Warto też w tym miejscu zwrócić uwagę na możliwość obsługi wielu klastrów, których przełączanie odbywa się w prawym górnym rogu.  

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_brokers.png)

## Podgląd i dodawanie wiadomości do topiku
Tabelaryczna prezentacja wiadomości w topiku jest tym, od czego zaczęliśmy budować narzędzie w pierwszej kolejności. Nic więc dziwnego, że nadal duży nacisk położony jest na funkcjonalność i użyteczność tego widoku. Pojawiły się tutaj możliwości wyczekiwane przez wielu użytkowników Kouncila, czyli:
* stronicowanie,
* możliwość przejścia do dowolnego offsetu,
* obsługa natywnych nagłówków wiadomości.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_topic_details_border.png)

## Podgląd stanu grup konsumentów
Ten ekran był funkcjonalnie kompletny w poprzedniej wersji, więc niewiele się tutaj zmieniło, poza bardziej czytelną prezentacją tempa, w którym odbywa się konsumpcja komunikatów.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_consumer_group.png)

## Śledzenie wiadomości
Zupełnie nowa funkcjonalność, która zdecydowanie wyróżnia nas na tle konkurencji. Więcej o motywacji oraz możliwościach tego ekranu będzie można przeczytać w kolejnym wpisie.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_event_tracking_result.png)

## Podsumowanie
Bardzo mi miło zaprezentować efekt naszej intensywnej pracy. Kouncil jest nadal darmowy i dostępny [na naszym githubie](https://github.com/consdata/kouncil). A jeżeli zrzuty ekranu nie są wystarczająco zachęcające, to na koniec pozostawiłem jeszcze jedną niespodziankę. Przygotowaliśmy [demo narzędzia](https://kouncil-demo.web.app/#/topics) osadzone w infrastrukturze GCP. I tak jak poprzednio, zachęcam do pobrania, testowania i zgłaszania uwag.   
