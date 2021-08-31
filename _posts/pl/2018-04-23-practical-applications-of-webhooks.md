---
layout:    post
title:     "Praktyczne zastosowanie webhook"
date:      2018-04-23 08:00:00 +0100
published: true
lang: pl
lang-ref:  practical-applications-of-webhooks
author:    bradlinski
image:     /assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/webhook.png
tags:
    - sonarqube
    - webhook
description: "Każdy programista prędzej czy później ma do czynienia z jakąś formą API (ang. application programming interface). API to określony interfejs, którym dwie niezależne aplikacje mogą porozumiewać się między sobą. W tym artykule chciałbym przedstawić Wam nieco inne podejść do takiej komunikacji między aplikacjami."
---

Każdy programista prędzej czy później ma do czynienia z jakąś formą API (ang. application programming interface). API to określony interfejs, którym dwie niezależne aplikacje mogą porozumiewać się między sobą. W tym artykule chciałbym przedstawić Wam nieco inne podejść do takiej komunikacji między aplikacjami.

## Czym są webhooki?
Przyjmijmy, że napisaliśmy aplikację A. Chcielibyśmy także, aby wyświetlała ona pewne dane z aplikacji B - niech będzie to lista aktywnych użytkowników. W tym celu aplikacja B udostępnia nam API pozwalające na pobranie listy aktywnych użytkowników. W konwencjonalnym podejściu musielibyśmy odpytywać aplikację B o aktualną listę aktywnych użytkowników. Znacznie lepiej byłoby, gdyby to aplikacja B poinformowała naszą aplikację o zmianie na liście aktywnych użytkowników. W tym miejscu z pomocą przychodzą nam webhooki.

Webhook - jest to nieco inne podejście do komunikacji między aplikacjami. Mechanizm webhooków jest często nazywany Reverse API, ponieważ zwykle nie wymaga interakcji ze strony klienckiej (w naszym przykładzie aplikacji A). Prościej rzecz ujmując, webhooki pozwalają na powiadomienie aplikacji klienckiej o wystąpieniu pewnych zdarzeń.

Od strony implementacyjnej, webhooki są nieco prostsze, gdyż polegają de facto na wysłaniu request po zadanej strukturze, pod zadany adres, w wyniku wystąpienia jakiegoś zdarzenia. Integracja aplikacji klienckiej polega na wskazaniu adresu, na który ma zostać wysłany request.

Podsumowując, webhooki są bardzo przydatne w sytuacjach, gdy oczekujemy od aplikacji zewnętrznej informacji w wystąpieniu zdarzenia, gdyż pozwalają nam na uniknięcie aktywnego czekania po stronie naszej aplikacji.

Jeśli chodzi o wady webhooków, można wyróżnić dwie:
- w momencie wystąpienia błędu w aplikacji możemy stracić zewnętrzne dane, gdyż nie mamy gwarancji, że zewnętrzna aplikacja w jakikolwiek sposób zareaguje na zgłoszony przez nas błąd - w przypadku klasycznego API moglibyśmy ponownie odpytać aplikację zewnętrzną,
- przy obsłudze webhooków musimy wziąć po uwagę, iż zdarzenia, o których jesteśmy powiadamiani, mogą występować bardzo często - zwykle nie mamy nad tym kontroli.

## Przykład integracji
Zintegrujemy SonarQube Compoaniona z komunikatorem Slack. Efektem integracji będzie wiadomość na kanale w komunikatorze z informacją, jak w ciągu ostatniego dnia zmieniła się liczba naruszeń zespołu.

### Wymagania wstępne:
- zapoznanie się z artykułem o SonarQube Companionie,
- skonfigurowany SonqrQube Companion,
- komunikator Slack.

Na początek musimy skonfigurować webhooka po stronie komunikatora. Aby to zrobić, przechodzimy do ustawień integracji Slack’a. Dodajemy konfigurację aplikacji „Incoming WebHooks” i definiujemy, na jaki kanał chcemy wysyłać wiadomości:

![Konfiguracja komunikatora](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/1.png)

Po pomyślnej konfiguracji, w widoku wybranego kanału, powinno ukazać nam się powiadomienie o pomyślnej konfiguracji:

![Komunikat komunikatora](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/2.png)

Kolejnym krokiem będzie skonfigurowanie webhooka po stronie SonarQube Companiona.

W SonarQube Companionie mamy nieco bardziej rozbudowany model definiowania webhooków. Każda ze zdefiniowanych grup może zawierać swoją własną definicję webhooków. Definicja każdego webhooka składa się z trzech podstawowych elementów:
- **action** – akcje to określone zdarzenie / zachowanie, jakie ma zostać wykonane,
- **trigger** – triggery definiują, kiedy akcja ma zostać wykonana,
- **callback** – w jakiej formie aplikacja kliencka ma zostać poinformowana o wynikach akcji.
Pełna dokumentacja dostępnych akcji, triggerów i callbacków znajduje się na: [https://github.com/Consdata/sonarqube-companion/wiki/Webhooks](https://github.com/Consdata/sonarqube-companion/wiki/Webhooks).

W ramach przykładu, zdefiniujemy webhooka, który sprawdzi, jak zmieniła się liczba naruszeń w obrębie grupy, w ciągu ostatniego dnia. W zależności od wyniku, wyślemy stosowny komunikat na kanał komunikatora.

Na początku definiujemy, w wyniku jakiej akcji mamy wysłać wiadomość. Aby to zrobić, w węźle webhooks definiujemy akcję dla nowego webhooka:
```json
"webhooks": [{
    "action": {
    "type": "NO_IMPROVEMENT",
    "period": "DAILY",
    "severity": ["blockers", "criticals", "majors"]
    }
}]
```
Zdefiniowaliśmy w ten sposób akcję, która sprawdzi, czy w przeciągu ostantiego dnia poprawie uległa ilość naruszeń w obrępie projektów grupy. Dodatkowo, pod uwagę weźmie tylko naruszenia o priorytetach: blocker, critical oraz major.

Kolejnym krokiem będzie zdefiniowanie triggera akcji. W naszym przykładzie, dla ułatwienia, chcielibyśmy, aby akcja wykonywana była co minutę. Definiujemy trigger typu CRON:
```json
"trigger": {
    "type": "CRON",
    "definition": "0 */1 * * * *"
},
```

Na koniec definicja faktycznej integracji z komunikatorem. W tym celu definiujemy callback typu POST, w definicji którego podajemy URL pozyskany z panelu konfiguracyjnego Slack'a w polu "Webhook URL":
```json
"callbacks": [
    {
        "type": "POST",
        "url": "https://hooks.slack.com/services/*/*",
        "body" : {
            "no_improvement": "{ 'text': 'http://gph.is/1RFg2r3 Brak poprawy'}",
            "improvement": "{ 'text': 'http://gph.is/1a7RlDR Poprawiono ${diff}'",
            "clean": "{ 'text': 'https://gph.is/1IH3RW6 Czysto'}"
        }
    }
]
```

W sekcji body definiujemy treść wiadomości, jaka ma zostać wysłana w zależności od stanu grupy. Przykładowo, w przypadku, gdy stan naruszeń uległ poprawie (odpowiedź "improvement"), wyślemy gifa wraz z krótkim komentarzem zawierającym predefiniowaną zmienną akcji - ${diff}. W ten sposób, na kanale pojawi się informacja o liczbie poprawionych naruszeń w ciągu ostatniego dnia.

Całość konfiguracji przedstawia się następująco:
```json
"webhooks": [
    {
        "action": {
        "type": "NO_IMPROVEMENT",
        "period": "DAILY",
        "severity": ["blockers", "criticals", "majors"]
        },
        "trigger": {
            "type": "CRON",
            "definition": "0 */1 * * * *"
        },
        "callbacks": [
          {
            "type": "POST",
            "url": "https://hooks.slack.com/services/*/*",
            "body" : {
                "no_improvement": "{ 'text': 'http://gph.is/1RFg2r3 Brak poprawy'}",
                "improvement": "{ 'text': 'http://gph.is/1a7RlDR Poprawiono ${diff}'",
                "clean": "{ 'text': 'https://gph.is/1IH3RW6 Czysto'}"
            }
          }
        ]
    }
]
```
W ten sposób, co minutę SonarQube Companion sprawdzi stan naruszeń grupy i w zależności od wyniku, wyśle określoną wiadomość na kanał komunikatora.

W rezultacie otrzymujemy wiadomość na kanale o braku poprawy jakichkolwiek naruszeń:
![Wiadomość w komuniaktorze](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/3.png)

Po poprawie jednego naruszenia, w kolejnej minucie otrzymujemy stosowne powiadomienie:
![Wiadomość w komuniaktorze](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/4.png)

W ten sposób zintegrowaliśmy dwie, niezależne aplikacje za pomocą mechanizmu webhooków, bez potrzeby pisania choćby linijki kodu.

## Podsumowanie
W artykule przedstawiłem koncepcję webhooków oraz pokazałem Wam, jak w prosty i szybki sposób można dzięki nim zintegrować dwie niezależne aplikacje. Zamierzamy stopniowo rozszerzać SonarQube Companiona o nowe akcje, np. przesyłanie cotygodniowego raportu o naruszeniach, poszczególnym użytkownikom - dlatego zalecam regularne odwiedzanie strony projektu :)

## Przydatne linki:
- [https://github.com/Consdata/sonarqube-companion](https://github.com/Consdata/sonarqube-companion)
- [https://github.com/Consdata/sonarqube-companion/wiki/Webhooks](https://github.com/Consdata/sonarqube-companion/wiki/Webhooks)
