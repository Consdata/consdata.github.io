---
layout:    post
title:     "W chmurze czyli jak? O możliwych kierunkach rozwoju aplikacji chmurowych"
date:      2020-10-21 08:00:00 +0100
published: true
lang: pl
author:    glipecki
image:     /assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/cloud.jpeg
tags:
    - cloud
    - iaas
    - caas
    - paas
    - faas
    - gcp
    - aws
    - azure
description: "Co to znaczy być w chmurze? Co to właściwie jest IaaS, PaaS, CaaS, FaaS? Jak przenieść się do chmury? Czy jestem już wystarczająco zachmurzony? Jeżeli nie znasz odpowiedzi na którekolwiek z powyższych pytań, to ten wpis jest stworzony specjalnie dla Ciebie!"
---

Co to znaczy być w chmurze? Co to właściwie jest IaaS, PaaS, CaaS, FaaS? Jak przenieść się do chmury? Czy jestem już wystarczająco zachmurzony? Jeżeli nie znasz odpowiedzi na którekolwiek z powyższych pytań, to ten wpis jest stworzony specjalnie dla Ciebie!

Czym właściwie jest chmura? W uproszczeniu możemy powiedzieć, że to dowolna usługa (lub zestaw usług), która dostarcza mechanizmy automatycznego tworzenia zasobów na żądanie i rozliczania ich zgodnie z faktycznym ich wykorzystaniem ([The NIST Definition of Cloud Computing](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf)). Sama definicja jest rozległa i możemy pod nią umieścić wiele skrajnie różnych rozwiązań. W kolejnych akapitach przyjrzymy się krótkiej charakterystyce podejść oferowanych przez wiodących dostawców chmur publicznych.

## On-premises - własna infrastruktura

Zanim omówimy podejścia do migracji w chmurze, określmy zgrubnie punkt wyjścia, do którego będziemy odnosić kolejne modele wdrożeniowe:

![Charakterystyka wdrożeń on-premises](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/desc-on-premises.png)

Powyższy diagram przedstawia uproszczony model elementów, za które jesteś odpowiedzialny wdrażając system we własnej serwerowni.

## IaaS - Infrastructure as a service

Dostawca chmury przejmuje odpowiedzialność za fizyczny sprzęt potrzebny do uruchomienia infrastruktury. Użytkownik zarządza systemem na poziomie konkretnych maszyn wirtualnych.

![Charakterystyka wdrożeń IaaS](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/desc-iaas.png)

W najbardziej oczywistym aspekcie mówimy o zakupie serwerów, ale należy uwzględnić też fizyczną ochronę serwerowni, serwis i utrzymanie sprzętu, budowę sieci, koszty pomieszczeń, opłat bieżących i licencji. Do tego dochodzi koszt zatrudnienia i szkolenia administratorów o odpowiednich kompetencjach, koszt wypracowania standardów i konfiguracji, kończąc na takich kwestiach, jak procedury migracji, disaster recovery czy tworzenie strategii rozwoju uwzględniających zakup sprzętu potencjalnie potrzebnego w przyszłości.

W uproszczeniu, IaaS zdejmuje z Ciebie takie zmartwienia, jak umierające dyski SSD czy telefon w środku nocy (bo  np. zabrakło prądu lub włączył się alarm przeciwpożarowy) oraz ograniczenia sprzętowe przy eksperymentowaniu czy planowaniu nowych produktów.

W praktyce oznacza to, że na żądanie możesz tworzyć dowolnie skonfigurowane instancje maszyn wirtualnych spiętych w wirtualne sieci o dowolnej topologii. Dla maszyn, poza technicznymi parametrami, możesz określać dostępność w sieci czy szczegółowe uprawnienia dostępu.

Migrując w modelu IaaS zyskujesz:
- fizyczne zabezpieczenie serwerowni,
- bezpieczeństwo i ciągłość działania serwerów,
- bezpieczny storage,
- stabilność i bezpieczeństwo sieci,
- audytowalność zmian i monitoring infrastruktury,
- skalowanie liczby i rozmiaru maszyn pod bieżące potrzeby.

Nadal jednak musisz zajmować się bezpieczeństwem, aktualizacjami i konfiguracją systemów operacyjnych wdrożonych maszyn wirtualnych.

W przypadku migracji systemu do modelu IaaS mówimy o podejściu rehosting i jest to najprostszy model wdrożenia do chmury. Zakłada jedynie przerzucenie (czy nawet import) systemów z aplikacjami do infrastruktury dostawcy. Koszt migracji jest minimalny, a dla legacy systemów drastycznie niższy niż w pozostałych modelach wdrożenia. Pomimo pierwszych zalet, w modelu IaaS trudno mówić o wdrożeniu chmurowym. Nadal nie wykorzystujesz w pełni możliwości niskokosztowej i skalowalnej infrastruktury.

Model IaaS może być prostym pierwszym krokiem, który pozwoli szybko wskoczyć do publicznej chmury i otworzyć możliwości szerszej integracji z systemami dostawcy i przyrostowych zmian we wdrażanym systemie (ewolucja przez refaktoring, podmiana pojedynczych elementów czy integracja z konkretnymi usługami zamiast długotrwałego przepisywania całego systemu od podstaw).

## CaaS - Container as a service

Dostawca chmury przejmuje odpowiedzialność za utrzymanie maszyn wirtualnych obsługujących infrastrukturę. Użytkownik zarządza systemem na poziomie kontenerów aplikacji.

![Charakterystyka wdrożeń CaaS](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/desc-caas.png)

Najpopularniejszym rozwiązaniem w tej kategorii jest klaster Kubernetes w pełni zarządzany przez dostawcę chmury. W praktyce zarządzanie maszynami wirtualnymi zostaje ograniczone do zdefiniowania ich rozmiaru i liczby, a czasem wręcz do określenia limitów minimalnej i maksymalnej liczby węzłów. Aktualizację, konfigurację, zabezpieczenie czy  monitorowanie systemów maszyn wirtualnych oddajesz w ręce specjalistów. Dzięki temu możesz skupić się na tworzeniu niezawodnego oprogramowania.

Migrując w modelu CaaS zyskujesz:
- aktualizacje i konfiguracje systemów maszyn wirtualnych,
- bezpieczeństwo zainstalowanych na maszynach systemów operacyjnych,
- aktualizacje, konfiguracje i bezpieczeństwo klastra dostarczanego przez dostawcę,
- równoważenie obciążenia hostów klastra i optymalizację kosztów działania systemu,
- możliwości skalowania i niezawodność systemu wynikające z łatwego powielania instancji aplikacji i węzłów klastra.

Dzięki abstrakcji na infrastrukturę, którą zapewnia konteneryzacja aplikacji możesz skorzystać z gotowych usług dostarczanych przez dostawcę chmury. W zależności od operatora dostępne będą np. load balancer z firewallem i ochroną przed DDoS, bezpieczny storage w postaci persistent volumes czy centralne zarządzanie logami lub metrykami działania systemu. Dodatkowo, takie mechanizmy, jak kontrola uprawnień czy skalowanie systemu, są już w standardzie.

Jednym z najważniejszych ograniczeń w przypadku CaaS jest konieczność pełnej obsługi stosu aplikacyjnego. Przykładowo, udostępniając usługi HTTP musisz zadbać o uruchomienie, konfigurację i bezpieczeństwo serwera WWW, kontrolę dostępu do usługi czy poprawną konfigurację liczby wątków i połączenia do bazy danych, a nawet definicję odpowiednich portów serwera i przygotowanie certyfikatów SSL. Migrowane aplikacje często będą wymagały zmiany w konfiguracji, czy nawet kodzie źródłowym, w celu dostosowania do infrastruktury i dostępnych usług. Bez tych zmian nie będzie możliwe pełne wykorzystanie potencjału wdrożenia w chmurze.

Dodatkowo należy pamiętać, że po stronie użytkownika pozostaje zapewnienie bezpieczeństwa i stabilności dostarczanego kontenera. Przykładowo: przeprowadzanie analizy kontenerów pod kątem znanych podatności, aktualizowanie oprogramowania i obrazów bazowych oraz rozwiązywanie problemów wynikających z błędnie zdefiniowanych obrazów i deskryptorów wdrożenia.

W przypadku modelu CaaS możemy już mówić o strategii migracji typu refactoring. Nawet jeżeli unikniesz zmian funkcjonalnych w kodzie, będziesz modyfikował sposób wdrażania aplikacji. W ramach migracji należy przeprowadzić konteneryzację przenoszonych aplikacji i przygotować deskryptory wdrożenia. Koszt migracji jest większy niż w przypadku modelu IaaS, ale możliwe jest przygotowanie się do migracji w ramach istniejących wdrożeń przed rozpoczęciem faktycznych migracji w chmury. Należy oczywiście zauważyć, że systemy już wdrażane w kontenerach lub klastrach Kubernetes dostają możliwość migracji do chmury przy minimalnych kosztach zmian.

Model CaaS pozwala w praktyce wdrożyć wiele rozwiązań kojarzonych z publicznymi chmurami obliczeniowymi - skalowanie, niezawodność, szybkość zmian. Dla wielu będzie to docelowy model wdrożenia w chmurze, optymalnie łączący koszt i zakres zmian z natychmiastowymi zyskami i możliwościami dalszego rozwoju. Ewolucyjna natura podejścia, możliwość migracji do innego dostawcy czy nawet powrót do wdrożeń _on-premises_ będą przemawiać za modelem CaaS.

## PaaS - Platform as a service

Dostawca chmury przejmuje odpowiedzialność za wdrożenie i utrzymanie aplikacji. Użytkownik zarządza systemem na poziomie pojedynczych aplikacji.

![Charakterystyka wdrożeń PaaS](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/desc-paas.png)

W modelu PaaS to dostawca chmury odpowiedzialny jest za budowanie i osadzanie aplikacji oraz utrzymanie kompletnej infrastruktury. Platforma dostarcza rozszerzenia zapewniające prostą konfigurację i integrację tworzonych aplikacji z usługami dostępnymi w chmurze. Osadzana usługa będzie miała zapewnione wsparcie dla monitorowania, uwierzytelniania czy komunikacji HTTPS na poziomie platformy (bez zmian w samej osadzanej aplikacji).

Aplikacje są automatycznie zarządzane przez platformę. Wersjonowanie, load balancing i automatyczne skalowanie to tylko niektóre z dostępnych funkcjonalności. Jako użytkownik nie musisz zarządzać procesem budowania aplikacji. W przypadku platformy PaaS możemy myśleć jedynie o aplikacjach, a wszystkie aspekty ich wdrożenia i klastrowania są zarządzane przez systemy chmury.

Migrując w modelu PaaS zyskujesz:
- aktualizację i bezpieczeństwo kontenerów uruchamiających tworzone aplikacje,
- w pełni zarządzaną infrastrukturę  wspierającą wersjonowanie i skalowanie na żądanie,
- koszty wynikające wprost z czasu działania systemu,
- wdrożenia gotowe do obsługi produkcyjnego ruchu - bez konieczności znajomości zagadnień DevOps,
- brak kosztów związanych z zarządzaniem infrastrukturą.

Właściwie wszystkie elementy wdrożenia chmurowego są już ukryte przed użytkownikiem. W praktyce oznacza to, że oddając coraz więcej elastyczności tworzonej aplikacji obniżyłeś do minimum konieczność zarządzania systemem. Koncepty, którymi nadal zajmuje się użytkownik, wynikają już ze stosowanych narzędzi i frameworków oraz natury tworzonej aplikacji.

Platforma PaaS najczęściej określa języki i frameworki, dla których dostarcza wsparcie w postaci automatycznego procesu budowania i osadzania, narzędzi i bibliotek wspierających tworzenie usług oraz automatycznej konfiguracji frameworków.

W przypadku migracji systemu w modelu PaaS możemy wpaść w jedną z dwóch ścieżek: dla aplikacji tworzonych we wspieranym przez chmurę języku/frameworku możliwa będzie refaktoryzacja, jednak dla pozostałych aplikacji konieczne może być ich przepisanie.

Model sprawdzi się dobrze w aplikacjach webowych i serwerach usług HTTP - wszędzie tam, gdzie przejście na model FaaS nie jest możliwe ze względu na jego ograniczenia.

## FaaS - Function as a service

Dostawca chmury przejmuje odpowiedzialność za wdrożenie i utrzymanie pojedynczych funkcji. Użytkownik zarządza systemem na poziomie kodu źródłowego konkretnych funkcji.

![Charakterystyka wdrożeń FaaS](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/desc-faas.png)

W modelu FaaS dostawca chmury odpowiedzialny jest za wszystkie aspekty uruchomienia funkcji biznesowej w chmurze. Platforma dostarcza nie tylko infrastrukturę systemu, ale też obsługuje np. elementy stosu HTTP. Model funkcyjny jest modelem zdarzeniowym - użytkownik skupia się na obsłudze zdarzeń w systemie, np. zdarzeniem żądania HTTP, pojawieniem się komunikatu w kolejce czy utworzeniem nowego konta użytkownika lub pliku w storage.

Przykładowo, dla funkcji HTTP, abstrahowane są nie tylko sposób uruchomienia, obsługa wątków, SSL czy port, na którym uruchomiona jest usługa, ale też adres publikacji endpointu HTTP, obsługiwane metody jego wywołania czy parsowanie żądania i odpowiedzi. Z punktu widzenia użytkownika wywołanie funkcji HTTP niewiele różni się od wywołania jej przez inny proces. Nawet konkretny serwer obsługujący żądania HTTP jest ukryty przed użytkownikiem i może ulec zmianie na poziomie infrastruktury dostawcy.

Każda osadzona funkcja jest:
- niezależnie budowana i wersjonowana (zarówno jej kod, jak i deployment), 
- wykonywana z niezależnym zestawem zależności (bibliotek),
- obsługiwana niezależnie przez load balancer,
- niezależnie skalowana,
- zabezpieczona dedykowanymi dla niej regułami uwierzytelniania i autoryzacji.

Podsumowując, każda funkcja jest traktowana jak niezależny artefakt i należy ją postrzegać jako samodzielną aplikację.

Migrując w modelu FaaS zyskujesz:
- zerowy koszt utrzymania i zarządzania infrastrukturą,
- ograniczenie tworzenia kodu niepowiązanego bezpośrednio z realizowaną funkcjonalnością,
- skalowanie od zera do dowolnego obciążenia,
- błyskawiczne tempo wprowadzania nowych zmian i eksperymentów.

Model FaaS zakłada analizę i fundamentalne przeprojektowanie systemu. Zmiana myślenia o architekturze i przetwarzaniu sprawia, że dotychczasowe problemy będziesz mógł rozwiązać na nowe sposoby. Użytkownicy mogą w całości skupić się na tworzeniu funkcjonalności biznesowych, drastycznie skracając czas potrzebny do wdrażania nowych rozwiązań.

Warto też zauważyć, że skalowanie systemu pozwala nie tylko obsługiwać użytkowników na środowiskach produkcyjnych, ale też skalować środowiska programistyczne i testowe. Jeżeli koszt infrastruktury wprost wynika z liczby użytkowników, to nie ma powodu tworzyć uproszczonych wersji środowisk testowych i można wewnętrznie zapewnić infrastrukturę w pełni zgodną z produkcyjnym wdrożeniem.

W przypadku FaaS należy pamiętać, że z największymi możliwościami i prostotą pojawiają się największe ograniczenia (największe uzależnienie kodu od konkretnej chmury). Tworzona funkcja będzie w pełni polegać na środowisku uruchomieniowym dostawcy. Kod będzie tworzony w języku programowania i w ramach frameworków wskazanych przez usługę FaaS. Często lokalne testowanie będzie utrudnione lub będzie wymagało emulatora. Jednym z największych ograniczeń wielu popularnych chmur jest czas zimnego startu funkcji, tj. natychmiastowe skalowanie od zera do w zasadzie dowolnego obciążenia wiąże się z częstym tworzeniem nowych instancji usługi. To oznacza, że część użytkowników trafiających na nową usługę może zauważyć dłuższe czasy odpowiedzi. W praktyce problem jest zauważalny w systemach o małym ruchu lub gdy niedopuszczalne są nawet pojedyncze żądania przekraczające założony czas odpowiedzi.

FaaS najlepiej sprawdza się w przetwarzaniu opartym o zdarzenia. Zastosowanie funkcji do tworzenia aplikacji webowych lub usług API należy poprzedzić analizą wymagań, ocenić np. dopuszczalne SLA usługi przy uwzględnieniu czasu zimnego startu. Możliwość skalowania usług od zera do dowolnego obciążenia oraz ograniczenie czasu tworzenia nowych funkcjonalności do minimum sprawia, że FaaS to zawsze opcja warta rozważenia.

Niskie koszty utrzymania infrastruktury, wysokie tempo wprowadzania zmian i wzorowe możliwości skalowania pozwolą Twojemu produktowi zyskać przewagę nad konkurencją.

## Migracja a rozwój

Przytaczane do tej pory koszty związane z migracją zakładały dostosowanie i wdrożenie działających systemów. Przy ich ocenie zakładałem, że zespół nie posiada wiedzy i doświadczenia w tworzeniu aplikacji w chmurze. W takiej sytuacji koszt szkoleń, prób i błędów oraz faktycznego wdrożenia rośnie wraz ze wzrostem "chmurowości" rozwiązania.

Sytuacja będzie wyglądać zupełnie inaczej dla zespołu tworzącego i utrzymującego już istniejące rozwiązania chmurowe. W takim wypadku koszt nowej technologii został już poniesiony i nie wpływa na koszt przygotowywania nowych rozwiązań. Dla doświadczonych zespołów koszt dostarczenia nowej funkcjonalności w środowisku chmurowym będzie wyraźnie niższy niż w tradycyjnym podejściu ze względu na:
- abstrakcję infrastruktury,
- minimalny koszt wdrożenia i utrzymania aplikacji,
- przeniesienie ciężaru na rozwój funkcjonalny aplikacji,
- dostępność gotowych do integracji z systemem usług w modelu SaaS

## Vendor lock-in

Planując migrację do chmury musisz zmierzyć się z tematem uzależnienia kodu od konkretnego dostawcy.

Czy _vendor lock-in_ jest zły? Zagadnienie warto traktować jako ryzyko, a nie zagrożenie jako takie. Dla ryzyk możliwe jest zaplanowanie ścieżek przeciwdziałania i przygotowanie planu wyjścia z chmury (czy to do innego dostawcy, czy zupełnie w kierunku chmury prywatnej lub rozwiązania _on-premises_).

Dla podejść IaaS i CaaS możemy przyjąć, że ryzyko wyjścia z chmury niesie za sobą minimalne koszty - w szczególności, gdy system nie korzysta z natywnych usług oferowanych przez chmurę obliczeniową.

W przypadku PaaS i FaaS prawdopodobnie zaprojektowałeś system pod kątem oferty konkretnej chmury. Najwięksi dostawcy zapewniają ujednoliconą ofertę produktów. O ile różnice pomiędzy oferowanymi rozwiązaniami w wielu przypadkach uniemożliwiają migrację systemu bez żadnych zmian, to jednak znajdziemy pomiędzy nimi odpowiadające sobie rozwiązania pozwalające zrealizować system w podobnej architekturze.

Warto zauważyć, że problem _vendor lock-in_, jako poważne ryzyko migracji do chmury, często jest adresowany wprost przez dostawców. Przykładowo w Google Cloud Platform większość produktów jest zbudowana w oparciu o otwarte standardy oraz narzędzia open-source. Przykładowo Google Kubernetes Engine do działania wykorzystuje platformę Kubernetes, Cloud Bigtable jest zgodny z HBase, itd. Podobne podejście jest stosowane przez wiodących dostawców chmur publicznych.

Szacując koszty wyjścia z chmury powinieneś rozważyć również utracone zyski wynikające z obaw przed _vendor lock-in_. Obawa przed uzależnieniem może doprowadzić do zwiększenia złożoności systemu, zwiększenia kosztu produkcji i utrzymania systemu, utraty funkcjonalności dających przewagę, itp. Czy ew. koszt wyjścia z chmury będzie większy niż oszczędności wynikające z jej wykorzystania? W przypadku dużego prawdopodobieństwa lub wysokiego kosztu wyjścia z chmury warto rozważyć ograniczenie migracji do modelu CaaS.

## On-prem, IaaS, CaaS, PaaS, FaaS

Mając już w głowie argumentacje i przykłady wszystkich podejść, możemy nakreślić podsumowanie odpowiedzialności w różnych modelach.

![Porównanie modeli wdrożeń](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/compare-xaas.png)

Im bardziej zaadaptujemy rozwiązania chmurowe, tym więcej odpowiedzialności przerzucimy na stronę dostawcy.

## Dojrzałość chmurowa

Znając system możemy pokusić się o ocenę jego dojrzałości chmurowej. Z jednej strony mamy klasyczne rozwiązania _on-premises_, a z drugiej rozwiązania w pełni serverless. Podsumowując wady i zalety opisywanych do tej pory podejść naszkicujmy prosty diagram szans i ryzyk zależny od stopnia migracji do chmury:

![Porównanie modeli wdrożeń](/assets/img/posts/2020-10-22-modele-wdrozenia-w-chmurze/native-vs-metrics.png)

Im bardziej zbliżymy się do podejść serverless, tym więcej korzyści osiągniemy z migracji. Należy jednak zwrócić uwagę, że im dalej się przesuwamy, tym droższa będzie migracja oraz wzrośnie ryzyko uzależnienia się od konkretnego dostawcy.

## Cele migracji

Podsumowując, zanim wybierzesz odpowiedni kierunek migracji do chmury, powinieneś zidentyfikować kluczowe problemy, które starasz się rozwiązać. Na ich podstawie możesz ustalić cele i ograniczenia, które pomogą Ci wybrać odpowiednią strategię dla Twojego systemu.

Rzućmy okiem na kilka przykładowych celów. Pokażę Ci, jakie decyzje mógłbyś rozważyć, stojąc przed nimi:
- "Chcemy być w chmurze" - przy minimalnym nakładzie pracy możesz wskoczyć we wdrożenia w ramach IaaS i z sukcesem odhaczyć wymaganie. Jednak, o ile ten cel nie ma ukrytej intencji, samo przeniesienie do chmury dla prestiżu nie wydaje się być sensownie obraną strategia rozwoju.
- "Chcemy obniżyć koszty sprzętu"- wdrożenia IaaS mogą obniżyć koszt sprzętu, jednak koszt utrzymania pojedynczej wirtualnej maszyny odpowiadającej już posiadanym maszynom może być większy.
- "Chcemy obniżyć koszty administrowania" - wdrożenia CaaS zdejmują z użytkownika potrzebę administrowania systemami operacyjnymi maszyn wirtualnych. Przejście na model PaaS i FaaS pozwala dalej radykalnie ograniczać te koszty.
- "Chcemy obniżyć koszty infrastruktury" - model CaaS wyraźnie zwiększa utylizację infrastruktury. Dodatkowo przejście na PaaS i FaaS pozwala nie utrzymywać infrastruktury w ogóle gdy nie jest potrzebna.
- "Chcemy zwiększyć skalowalność systemu" - każdy kolejny etap migracji zwiększa standaryzację wdrażanych rozwiązań, przez co pozwala dostawcy chmury na efektywniejsze skalowanie systemu bez naszego udziału.
- "Chcemy poprawić bezpieczeństwo systemu" - każdy kolejny model (CaaS, PaaS, FaaS) poprawia bezpieczeństwo systemu przenosząc odpowiedzialność za utrzymanie i zarządzanie kolejnymi elementami przez dostawcę infrastruktury.
- "Chcemy obniżyć koszty wprowadzenia nowych zmian" - modele chmurowe sprzyjają szybkiemu wprowadzaniu zmian i prowadzeniu eksperymentów przy minimalnym narzucie związanym z wdrożeniem i administracją.
- "Nie chcemy płacić za infrastrukturę" - cel zdefiniowany przewrotnie, jednak jego intencją jest pokrycie kosztów infrastruktury przez użytkowników - gdy nie używają systemu, to ten nie generuje kosztów utrzymania. Jak się już pewnie domyślasz, docieramy do Graala rozwiązań chmurowych. W tym miejscu łakomie zerkasz już w stronę serverless, kuszą Cię jego możliwości skalowania do zera, brak stałych kosztów utrzymania i możliwość określenia precyzyjnego kosztu obsługi każdego użytkownika w systemie :) 

Potraktuj przykładowe cele jako inspiracje i przygotuj własną listę oczekiwań i driverów migracji do chmury. Znając problemy i oczekiwania, skuteczniej ocenisz potencjalne zyski i sensowność wybranego podejścia.

## Co wybrać?

To co ostatecznie wybrać? Wszystko po trochu!

Sposób migracji aplikacji należy dobierać do jej potrzeb, ograniczeń i szans na rozwój. Naturalnym podejściem będzie wdrożenie części systemów wymagających minimalnych czasów odpowiedzi do użytkownika w modelu CaaS lub PaaS oraz zaprojektowanie procesów biznesowych w modelu zdarzeniowym przy wsparciu FaaS.

Migracja do chmury uczy nas myślenia nie tylko w kategoriach kodu, ale też optymalizacji kosztów i szybkości wdrażania zmian. Przykładowo, jeśli tworzysz aplikację bota integrującego się z platformą Slack, możesz uruchomić webhook w oparciu o PaaS, który zleca dalsze operacje do kolejki zdarzeń obsługiwanych przez infrastrukturę FaaS. W takim podejściu usługa PaaS zapewnia nam stałe działanie usługi nieobarczonej kosztem zimnego startu, a FaaS zapewnia infrastrukturę przetwarzania operacji, za którą płacimy tylko w trakcie obsługi. W takim podejściu poniesiemy minimalny koszt zawsze czekającej usługi (co jest wymaganiem od strony UI użytkownika) i zerowy koszt funkcji działających tylko wtedy, gdy jest dla nich zadanie do wykonania. Dzięki takiej analizie możemy optymalizować koszt działania systemu przeznaczając środki w miejscach, w których niosą realną wartość (szybki czas odpowiedzi usługi do użytkownika) i obniżając je tam, gdzie możliwe są oszczędności (przetwarzanie zadań w tle).

Podsumowując -  przy wyborze modelu wdrożenia w chmurze ważne jest określenie rozwiązywanych problemów i celów, które chcesz osiągnąć. Na tej podstawie będziesz mógł świadomie wybrać najlepsze narzędzia do zadanego problemu. Nie bój się eksperymentować i mieszać podejść, aby uzyskać infrastrukturę skrojoną idealnie pod Twoje potrzeby.
