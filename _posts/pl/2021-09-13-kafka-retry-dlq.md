---
layout:    post
title:     "Niezawodne dostarczanie zdarzeń w Apache Kafka oparte o ponawianie i DLQ"
date:      2021-09-13 6:00:00 +0100
published: false
didyouknow: false
lang: pl
author:    jgrobelny
image:     /assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq4.png
description: "Dlaczego w Kafce nie ma DLQ? Zacznijmy zatem od odpowiedzi na pytanie. Większość popularnych systemów kolejkowych takich jak RabbitMQ czy ActiveMQ ma wbudowane systemy odpowiedzialne za niezawodne dostarczanie komunikatów. Dlaczego zatem Kafka nie oferuje takowego."
tags:
- kouncil
- programming
- kafka
- event sourcing
- tool
- dlq
---

W każdym dostatecznie złożonym systemie informatycznym dochodzimy w pewnym momencie do miejsca, w którym musimy sobie odpowiedzieć na pytanie: a co jeśli coś pójdzie nie tak. Jeśli mamy szczęście, to może się okazać, że rozwiązania, które wybraliśmy, dostarczają nam gotowe narzędzia do radzenia sobie w sytuacjach wyjątkowych. Może też się okazać, że nie mieliśmy tyle szczęścia i wybraliśmy Kafkę...
 
 W niniejszym wpisie znajdziesz odpowiedź na to, dlaczego w Kafce nie ma DLQ (ang. Dead Letter Queue) oraz jak sobie poradzić w sytuacji, gdy potrzebujesz takiego mechanizmu w swoim systemie. 

## Dlaczego w Kafce nie ma DLQ?
Zacznijmy zatem od odpowiedzi na to pytanie. Większość popularnych systemów kolejkowych takich jak RabbitMQ czy ActiveMQ ma wbudowane systemy odpowiedzialne za niezawodne dostarczanie komunikatów. Dlaczego zatem Kafka nie oferuje takowego? Odpowiedź na to pytanie ściśle związana jest z jednym z rozwiązań architektonicznych leżących u podstaw działania Kafki: głupi broker i sprytny konsument (ang. dumb broker / smart consumer). Wzorzec ten sprowadza się do tego, że ciężar logiki związanej z obsługą odczytów przenoszony jest na konsumenta. Konsekwencją takiego podejścia jest brak gotowego rozwiązania mogącego wspomóc konsumenta w przypadku wystąpienia problemu podczas przetwarzania komunikatu. Broker jest zainteresowany tylko jedną informacją: pozycją, na której konsument zakończył przetwarzanie (ang. committed offset). 
Oczywiście zawsze można rzec, że w tej sytuacji należy dobrać odpowiednie narzędzie do problemu i zastosować system kolejkowy mający takie wsparcie. Nie zawsze jednak mamy nieograniczoną swobodę wprowadzania wielu rozwiązań w jednym systemie. Jeśli tak jak ja wybraliście Kafkę jako silnik rejestrujący zdarzenia, to w przypadku wystąpienia opisywanego problemu musicie poradzić sobie sami i odpowiednio go oprogramować. 
   
## Jak sobie radzić z błędami
 Wyobraźmy sobie sytuację, w której elementem procesu obsługi zdarzenia jest komunikacja z zewnętrznym systemem. Musimy podjąć decyzję, jak ma zachować się konsument w momencie, gdy zewnętrzny system odpowiada w inny sposób, niż się spodziewaliśmy albo, co gorsza — w ogóle nie odpowiada. Jest wiele strategii obsługi takiej sytuacji. Ja na potrzeby tego artykułu wybrałem cztery. 
### Brak obsługi

![2019-09-05-Kafka-DLQ-Strategy01.png](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq1.png)

Bardzo popularna i często stosowana strategia obsługi sytuacji wyjątkowych, to brak reakcji. Może to potwierdzić każdy programista. Na powyższym rysunku prostokąty oznaczają kolejne wiadomości w topiku. Gdy konsument napotka problem z przetwarzaniem komunikatu o offsecie 4, ignoruje go i przechodzi do następnego. I mimo że takie podejście wydaje się niezbyt rozsądnym rozwiązaniem, to istnieją sytuacje, gdy utrata części komunikatów nie niesie za sobą ryzyka. Za przykład można podać wszelkie rozwiązania przechowujące i analizujące zachowanie użytkowników w aplikacji. Ponieważ zadaniem takiego systemu jest zbieranie danych statystycznych, utrata pojedynczych zdarzeń nie wpłynie znacząco na wyniki. Ważne jest jednak, żeby dysponować skutecznym monitoringiem, który wychwyci sytuację, w której utrata komunikatów przekracza pewien arbitralnie ustalony poziom.
 
### Nieskończone ponawianie w miejscu

![2019-09-05-Kafka-DLQ-Strategy02.png](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq2.png)

Gdy nie możemy pozwolić sobie na utratę komunikatów, najprostszym podejściem jest ponawianie do skutku. Oczywistą konsekwencją jest tzw. zatrzymanie świata. Dopóki błąd nie zostanie poprawiony albo zewnętrzny system udrożniony — żaden kolejny komunikat nie zostanie przetworzony. Takie rozwiązanie jest konieczne w przypadku, gdy chcemy zachować kolejność przetwarzania zdarzeń systemie. W ten scenariusz tym bardziej wpisuje się potrzeba stałego monitoringu.
 
### Skończone ponawianie w miejscu z topikiem błędów

![2019-09-05-Kafka-DLQ-Strategy03.png](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq3.png)

Omawiane do tej pory strategie zachowują kolejność przetwarzania zdarzeń. Jest to niezwykle istotne w sytuacji, gdy zdarzenia są od siebie zależne i spójność naszego systemu opiera się na kolejności przetwarzania. Nie zawsze jednak zdarzenia mają taką właściwość i brak konieczności zachowania kolejności otwiera przed nami nowe możliwości. Wyobraźmy sobie, co się stanie, jak nieco poluzujemy wymaganie bezwzględnego zachowania kolejności. Załóżmy, że próbujemy przez jakiś czas ponawiać, ponieważ statystyka i doświadczenie podpowiada nam, że 99% problemów z przetwarzaniem komunikatów jest chwilowych i samoczynnie ustępuje po pewnym czasie. Dodatkowo komunikaty, których nie udało się przetworzyć, **kopiujemy** na oddzielny topic traktowany jako DLQ. Dzięki temu mamy od razu wyłuskane problematyczne wiadomości i możemy uruchomić na nich osobną grupę konsumentów. Problematyczny komunikat numer 4 zatrzymuje na chwilę przetwarzania, po czym kopiowany jest na topic wiadomości zepsutych eventsDLQ. Z kolei komunikat numer 7 tylko przez chwilę jest ponawiany i po poprawnym przetworzeniu, przetwarzanie jest wznawiane. 

Krótkie wyjaśnienie, dlaczego komunikaty są **kopiowane** a nie przenoszone. Odpowiedź jest bardzo prosta — nie mogą być przenoszone. Wynika to z kolejnego fundamentu architektonicznego Kafki, czyli niezmienności topików (ang. topics immutability). Niezależnie jaka była przyczyna błędu, komunikat na zawsze pozostanie utrwalony. Istnieją sposoby na radzenie sobie z tym tematem i wrócimy do tego później. 
 
### Skończone ponawianie na wydzielonym topiku

![2019-09-05-Kafka-DLQ-Strategy04.png](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq4.png)

Dochodzimy niniejszym do naszego ostatecznego rozwiązania. Skoro mamy osobny topic dla zepsutych wiadomości to może warto wprowadzić kolejny, na którym odbywa się ponawianie. W tym modelu jeszcze bardziej luzujemy konieczność zachowania kolejności, ale dostajemy w zamian możliwość bezprzerwowego przetwarzania głównego topiku. W konsekwencji nie zatrzymujemy świata, a wiadomości kaskadowo kopiowane są najpierw na topic wiadomości ponawianych a w przypadku niepowodzenia — topic DLQ (technicznie powinniśmy nazwać go DLT, ale zostańmy przy akronimie DLQ, jako że jest on dobrze kojarzony z tego rodzaju technikami). 

W systemie, na podstawie którego powstał ten wpis, występuje wszystkie cztery opisywane warianty postępowania w sytuacji awaryjnej. Wyzwanie polega na dopasowania odpowiedniej metody do natury danych przetwarzanych w topiku. Warto też zaznaczyć, że należy uczyć się od największych i dwa ostatnie modele są mocno inspirowane sposobem, w jaki Kafkę w swoich systemach używa Uber. 

## Śledzenie przebiegu eventu
Jakiekolwiek rozwiązanie wybierzemy, pewne jest jedno, potrzebujemy narzędzia, które pozwoli nam śledzić i podglądać, jak zachowuję się eventy na topikach. Kouncil, którego rozwijamy od jakiegoś czasu, szczególnie wpasowuje się w sytuację, gdy wybrana została strategia z topikiem retry oraz dlq. Korzystając z widoku track i mając zapewniony identyfikator korelującym, możemy szybko zweryfikować ścieżkę przetwarzania eventu. Wiemy na przykład, że zdarzenie o identyfikatorze `h57z2z` zostało poprawnie przetworzone, czyli przeszło przez topiku `event-in` oraz `events-out`, co widać na załączonym zrzucie ekranu.

![Proper flow](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq5.png)

Może tak się zdarzyć, że dostaniemy zgłoszenie dotyczące niedostarczenia komunikatu o identyfikatorze `oCvD19i`. Szybki rzut oka pozwala potwierdzić, że event najpierw trafił na topic do ponawiania, a ostatecznie wylądował w dlq. 

![Retry-dlq-flow](/assets/img/posts/2021-09-13-kafka-retry-dlq/kafka-retry-dlq6.png)

Więcej na temat śledzenia przebiegu eventów można przeczytać w artykule Marcina Mergo [Event Tracking, czyli jak znaleźć igłę w stogu siana]({% post_url pl/2021-09-08-kouncil-event-tracking-kafka %})

## DLQ a grupy konsumentów
Pozostaje jeszcze jeden istotny aspekt, czyli jak wdrożyć to rozwiązanie w sytuacji wielu grup konsumentów. Na pierwszy rzut oka mogłoby się wydawać, że podobnie jak w RabbitMQ, topic ponawiający i DLQ są ściśle powiązane z głównym topikiem. Nic bardziej mylnego. Koncepcja grup konsumentów działających w Kafce na tym samym topiku, ale mających inną implementację powoduje, że mechanizm ponawiający musi być powiązany z konkretną grupą. W szczególności różne grupy mogą mieć inną logikę ponawianie i obsługi błędów. Sytuacja jeszcze bardziej się komplikuje, gdy grupy konsumentów są w jakiś sposób od siebie zależne. Jedna grupa może bazować na fakcie, że inna grupa poprawnie przetworzyła dany komunikat. Trzeba wtedy bardzo rozważnie dostosować mechanizmy ponawianie i obsługi błędów tak, aby zachować spójność przetwarzania komunikatów.  

## Sprzątanie.
Na zakończenie pozostaje jeszcze rozwiązanie problemu związanego z redundancją danych wynikającą z faktu kopiowania wiadomości pomiędzy topikami. W przypadku głównego topika mamy sytuację, że każda wiadomość, która ostatecznie trafiła do DLQ, uznawana jest za uszkodzoną. Jeśli w naszej aplikacji jest możliwość **ponownego przetworzenia** strumienia wiadomości, to musimy jakoś obsłużyć tę sytuację. Istnieją co najmniej dwa rozwiązania: 
* rejestr uszkodzonych wiadomości — może być budowany automatycznie na podstawie wiadomości trafiających do DLQ. Składają się na niego offsety wiadomości z głównego topiku. Podczas ponownego przetworzenia konsument, wiedząc o rejestrze, pomija wszystkie oznaczone w nim wiadomości,
* kompaktowanie — napisałem wcześniej, że nie można zmieniać i usuwać wiadomości w topiku. Jest od tej reguły wyjątek — mechanizm kompaktowania topiku. W największym skrócie działa to w ten sposób, że broker uruchamia cyklicznie zadanie, które przegląda topik, zbiera wiadomości o tym samym kluczu i pozostawia tylko tą najnowszą. Trik polega na tym, żeby wstawić do strumienia wiadomość o tym samym kluczu co uszkodzona, ale o pustej treści. Konsument musi wcześniej być przygotowany na obsługę takich wiadomości.
Można obie techniki stosować jednocześnie, należy jednak pamiętać, że offsety skompaktowanych wiadomości znikną bezpowrotnie z topiku. 

Topic retry zawiera wiadomości, które po przetworzeniu nie mają żadnej wartości, więc w tym przypadku wystarczy skonfigurować retencję, czyli czas życia wiadomości. Trzeba tylko pamiętać, żeby retencja nie była krótsza, niż najdłuższy możliwy czas przetwarzania pojedynczej wiadomości. 

Topic DLQ powinien zawierać wiadomości dopóki, dopóty nie zostaną zdiagnozowane a system — poprawiony. Jako że ten czas nie jest łatwy do ustalenia, to nie wchodzi w rachubę retencja. Stąd też trik z kluczami opartymi na datach. Jeśli uznajemy, że incydenty z określonego dnia zostały rozwiązane, to wprowadzamy do DLQ pusty komunikat z kluczem takim jak dzień i przy najbliższej sesji kompaktowania — wszystkie wiadomości zostaną usunięte z DLQ. 

## Podsumowanie
W ten oto sposób dobrnęliśmy do końca. Liczę, że udało mi się zaprezentować na tym prostym przykładzie, że iteracyjne podejście do problemu potrafi doprowadzić nas do ciekawych i skutecznych rozwiązań.
