---
layout:    post
title:     "Mikroserwisy na Axonie"
date:      2020-05-11 08:00:00 +0100
published: true
author:    mkociszewski
image:     
tags:
    - java
    - microservices
    - axon
    - event-sourcing
    - spring-boot
---

Znając definicję Event Sourcingu oraz korzyści, jakie nam zapewnia (dla przypomnienia polecam [**wpis Marcina poświęcony częściowo tej tematyce**]({% post_url 2018-11-15-czy-apache-kafka-nadaje-sie-do-event-sourcingu %})) warto rozważyć zastosowanie tego wzorca w swoim projekcie (oczywiście nie wszędzie się on nada).
Osoby zainteresowane tematem jednak z pewnością zostaną postawione przed wyborem technologii, w której rozpoczną implementację. 
Niezależnie od języka programowania, można implementować CQRS oraz Event Sourcing samemu, od A-Z, jednakże byłoby to czasochłonne i mogłoby prowadzić do wielu błędów. 
Alternatywą może okazać się skorzystanie z gotowego frameworku, który od początku tworzony był z myślą o wspomnianych wzorcach - mowa tutaj o [**AxonFramework**](https://axoniq.io/).

W tym wpisie przedstawię moje podejście do tematu na konkretnych przykładach, drogę z monolitu do mikroserwisów oraz porównanie Axona z Kafką.

# Krótko o Axonie
AxonFramework to... framework, który czerpie garściami z Domain Driven Design (które jest poza zakresem tego wpisu), wykorzystując również nomenklaturę panującą w tym podejściu, którą także będę się posługiwał w tym wpisie.
Axon bierze na barki zarządzanie przepływem wszystkich informacji między komponentami np. kierowanie commandów do odpowiednich agregatów, czy zapisywanie eventów w event store. 
Jeżeli chodzi o kwestie event store'a to framework zostawia tu pełną dowolność, choć nie każda baza spełni się w tej roli.
Dodatkowym plusem jest bezproblemowa integracja ze Spring Bootem, możliwość skalowania i gotowość produkcyjna co moim zdaniem plasuje Axona jako mocnego gracza.

# Event store
Fundamentem projektu opartego o Event Sourcing jest oczywiście event store - źródło prawdy całego systemu, stąd wybór narzędzia pod tą funkcję powinien być dokonany z rozwagą.

### Może Kafka?
Kafka opiera się na eventach, których kolejność pojawiania się może zostać zachowana - co zapobiega sytuacji, w której wykonamy aktualizację krotki, zanim zostanie ona utworzona.
Ponadto Kafka trzyma dane na topicach, zapamiętując offset (liczbę porządkową) dla każdego eventu. Znając offset istnieje możliwość odtworzenia topica od tego offsetu, aż do końca - umożliwia to odtwarzanie idealnego stanu aplikacji dosłownie na zawołanie (dopóki nie mamy do czynienia z paruset milionami eventów :wink:).
Do tego Kafka bardzo łatwo się skaluje oraz uniemożliwia edycję nałożonych eventów, co niewątpliwie jest plusem. Jest jednak parę punktów, które brakują Kafce, do bycia idealnym kandydatem na event store:
- Problem pojawia się w momencie, gdy chcielibyśmy odtworzyć agregat na podstawie eventów. 
Kafka w tym momencie musiałaby przeiterować cały topic od pewnego offsetu, aż do końca.
W kolejnym kroku trzeba by odfiltrować te eventy, które nie dotyczą agregatu, który próbujemy odtworzyć, co wymaga od nas dodatkowej logiki w kodzie, oraz nakłada niepotrzebny dodatkowy narzut na event store (odfiltrowane eventy nie są nam potrzebne).
- Drugim problemem jest brak natywnego wsparcia dla mechanizmu snapshotów, bez którego odtwarzanie stanu przy dużym narzucie zdarzeń może trwać wieki.

Potencjalnym rozwiązaniem pierwszego braku mógłby być osobny topic dla każdego agregatu, wówczas odpada konieczność filtrowania eventów.
To rozwiązanie jednak może nie sprawdzić się przy ogromnej ilości agregatów. 
Wynika to ze sposobu, w jaki Kafka przechowuje topici (a właściwie partycje) - dla każdej tworzony jest osobny katalog w systemie plików. 
Szczegółowe wyjaśnienie znajduje się w [filmie](https://youtu.be/zUSWsJteRfw?t=2179) przygotowanym przez AxonIQ (firma odpowiedzialna za rozwój Axona).

### AxonServer
W kwestii event store AxonIQ wyszedł na przeciw potrzebom dając do dyspozycji swoje narzędzie, które idealnie spełnia się w roli event store'a - AxonServer:
- pozwala na dokładanie eventów (z jednoczesnym brakiem możliwości edycji nałożonych już eventów)
- zapewnia stałą wydajność niezależnie od ilości danych przetrzymywanych w event store
- umożliwia konstruowanie snapshotów dla agregatów i nakładanie ich (w przypadku dużej ilości eventów rekonstrukcja agregatu bez funkcjonalności snapshotów może trochę trwać)

Po uruchomieniu AxonServera mamy dostęp do dashboardu pokazującego który mikroserwis jest podpięty pod event store wraz z jego liczbą instancji:
![AxonDashboard](/assets/img/posts/2020-05-11-microservices-on-axon/axon_dashboard.png)
Na samym dashboardzie funkcjonalności panelu administracyjnego się nie kończą:
- podgląd konfiguracji wraz z przepustowością (commandy/eventy/query/snapshoty na sekundę)
- możliwość wyszukania eventu używając ichniego języka zapytań
- tabelka ze wskazaniem, który command, ile razy i w jakim serwisie został obsłużony
- zarządzanie dostępem do panelu

Oczywiście AxonFramework jest w pełni kompatybilny z AxonServerem i działa out-of-the-box, bez dodatkowej konfiguracji.
# Mikroserwisy
- że poprę swoim projektem
- najpierw powinno się wypracować monolit 
- tu powinien wlecieć diagram
- przy mikroserwisach wspomnieć o tym, że eventy powinny być w tej samej package (a może nie? może serializator coś zjebał? muszę to sprawdzić)

# Podsumowanie
pierdu pierdu, niebawem kolejne wpisy itd
