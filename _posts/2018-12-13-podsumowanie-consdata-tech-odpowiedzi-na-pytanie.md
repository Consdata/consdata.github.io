---
layout:    post
title:     "Podsumowanie Consdata Tech - odpowiedzi na pytania"
date:      2018-12-13 08:00:00 +0100
published: true
author:    mmergo
tags:
    - tech
    - consdata.tech
    - event sourcing
---

## Czy używacie platformy Kafka Connect? Jeśli tak, czy pozwalacie connectorowi na sterowanie schematem bazy danych? Jeśli nie, jakie macie podejście do ewolucji schematów?

Nie używamy platformy Kafka Connect, w związku z czym nie jestem w stanie odnieść się do pierwszej części drugiego pytania. Odnośnie części drugiej, schemat naszej bazy danych ewoluuje wyłącznie przyrostowo. Nigdy nie usuwamy pól ze schematu, a jedynie dodajemy nowe, niewymagane pola - dzięki temu nie łamiemy wstecznej kompatybilności z istniejącymi już eventami oraz obiektami znajdującymi się na state storze. Nasza domena pozwala na taki rozwój schematu, jednak oczywiście należy mieć na uwadze, że nie zawsze będzie to możliwe. W takich sytuacjach należy rozważyć na przykład wersjonowanie eventów.

## Czy nowe podejście w oparciu o ES miało wpływ na wydajność systemu?

Pośrednio tak, jednak należy w pierwszej kolejności zaznaczyć, że wydajność nie była dla nas celem samym w sobie, gdyż ta, którą osiągaliśmy jeszcze przed wprowadzeniem Event Sourcingu była w zupełności wystarczajaca. Co więcej, w systemach, w których event store (np. Kafka) staje się źródłem prawdy, a state store zasilany jest wyłącznie za jego pomocą, bezpośredni wpływ na wydajność ma głównie state store, a więc na ogół baza danych - gdyż to na niej wykonywana jest większość operacyjnych zapytań w systemie. Natomiast nie wprost, ale Kafka pozwoliła nam poprawić utylizację zasobów, pośrednio przyczyniając się do ogólnej poprawy wydajności - w szczególności poprzez asynchroniczną obsługę wywołań zmieniających stan systemu, co pozwoliło na znacznie lepsze gospodarowanie pulami wątków w systemie.

## Czy Kafka to na pewno dobry wybór do ES?

Na dokładnie to pytanie odpowiada wcześniejszy artykuł na naszym blogu: Czy Apache Kafka nadaje się do Evnet Sourcingu?

## Final, Mass oraz External to faktyczne topici, czy tylko kategorie topiców z jakimi pracujecie?

Są to rozłączne topiki - każdy ze specyficzną dla siebie konfiguracją partycjonowania, retencji, obsługi błędów itp.

## Kafka jako event store. Jak dużo danych ma Kafka w waszym mailboxie?

Działamy w skali około miliarda eventów, co przekłada się to w tej chwili na około kilka terabajtów danych, biorąc oczywiście pod uwagę replikację.

## Czy topic final to trochę taki ESB?

W tym konkretnym ujęciu - nie. Topic final jest dla nas wyłącznie źródłem prawdy w systemie, a nie elementem integrującym różne jego moduły.

## Jak dużo macie sytuacji, w których trzeba ręcznie obsługiwać DLQ na produkcji?

Jak dotąd, po kilkumiesięcznym działaniu na produkcji, trafiliśmy tylko na jeden przypadek, kiedy wiadomości trafiły na DLQ. Większość błędów, które finalnie mogłyby trafić do DLQ wyłapaliśmy na poziomie topiców Retry, skąd automatycznie schodziły w wyniku udrożnienia zależnych komponentów lub systemów.

## Co zrobić, gdy trzeba usunąć eventy np. że względu na RODO? Event store, jako audyt jest niezmienny. Jeżeli usuniemy eventy, to możemy też stracić ciągłość stan

Usuwanie eventów nie jest jedynym sposobem na spełnienie wymagań narzuconych przez RODO. Jednym z możliwych rozwiązań, bardzo naturalnie wynikającym z idei Event Sourcingu, jest dodanie kolejnych eventów wyrażających usunięcie newralgicznych danych. W ten sposób, na aktualnym state storze newralgiczne dane zostaną usunięte, a tym samym przestaną być dostępne w ramach operacyjnego działania aplikacji. Natomiast w przypadku odtwarzania stanu systemu ze strumienia zdarzeń zostaną one ponownie przetworzone w ten sposób, a więc finalnie usunięte - spełniając tym samym zasadę utrzymywania listy wyjątków (1).


**Jeśli zaciekawił Cię temat Event Sourcingu koniecznie zapoznaj się z naszymi materiałami na YouTube, a jeśli chcesz zobaczyć jak wyglądała ta edycja w praktyce lub wziąć udział w kolejnej edycji Consdata Tech to koniecznie dołącz do grupy Consdata Tech, gdzie opublikujemy informację o terminie kolejnego spotkania.**

