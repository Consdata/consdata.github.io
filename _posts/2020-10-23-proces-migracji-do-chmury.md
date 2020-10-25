---
layout:    post
title:     "Proces migracji do chmury - czyli od czego zacząć?"
date:      2020-10-23 08:00:00 +0100
published: true
author:    mhoja
image:     /assets/img/posts/2020-10-23-proces-migracji-do-chmury/clouds.jpg
tags:
    - cloud
    - serverless
    - gcp
    - aws
    - azure
    - googlecloud
---

Planując migrację systemu informatycznego do chmury, zastanawiamy się *od czego zacząć*? Proces migracji składa się z kilku etapów, które pomogą nam przejść z punktu A (systemu źródłowego), do punktu B (systemu docelowego).

Przed rozpoczęciem lektury warto zapoznać się z wpisem Grzegorza pt.  
[**"W chmurze czyli jak? O możliwych kierunkach rozwoju aplikacji chmurowych"** 🔗]({% post_url 2020-10-22-modele-wdrozenia-w-chmurze %})  
który przedstawia poszczególne modele wdrożenia w chmurze.

Swoją wiedzę opierać będę na doświadczeniach z chmurą Google ([Google Cloud Platform, GCP](https://cloud.google.com/)), dlatego w tekście będę nawiązywał do usług i pojęć związanych z tą platformą.

![Etapy migracji do chmury](/assets/img/posts/2020-10-23-proces-migracji-do-chmury/etapy_migracji.jpg)

# Szacowanie

Pierwszym z etapów migracji jest etap szacowania, na którym przeprowadzona zostaje dokładna analiza istniejącego systemu oraz infrastruktury.
Podczas szacowania analizujemy wykorzystywane zasoby, zależności pomiędzy elementami systemu oraz wymagania.
Wybieramy te elementy systemu, które chcemy przenieść do chmury, co pozwoli na obliczenie dokładnych kosztów utrzymania infrastruktury.
W przypadku kiedy przenosimy maszyny wirtualne, szacujemy zasoby które są nam potrzebne, aby określić np. typ maszyn [Compute Engine](https://cloud.google.com/compute) oraz ich parametry.

Jeśli znamy już dokładnie system źródłowy i jego wymagania, musimy zapoznać się z platformą usługodawcy, do którego będziemy migrować nasz system. Próg wejścia będzie tutaj zależał od modelu wdrożenia, ponieważ w zależności od niego musimy poznać mniej lub bardziej całą platformę.

Pierwszy etap migracji jest tym miejscem, w którym zapoznajemy się z możliwościami chmury oraz zdobywamy potrzebne do migracji kompetencje (na przykład poprzez szkolenia czy certyfikacje).
Pomóc może nam w tym również przetestowanie platformy, wdrożenie PoC oraz eksperymenty, które pozwolą rozwiać wszelkie wątpliwości i przewidzieć potencjalne problemy.

**Rozważyć należy między innymi:**

- porównanie wydajności i możliwości aktualnej bazy danych z usługami bazodanowymi w chmurze (np. [Cloud SQL, Cloud Firestore](https://cloud.google.com/products/databases)),
- przetestowanie opóźnień sieciowych,
- zastąpienie mechanizmów logowania oraz monitorowania aplikacji przez dedykowane usługi (np. [Operations/Stackdriver](https://cloud.google.com/products/operations)),
- przetestowanie wydajności funkcji (np. [Cloud Functions](https://cloud.google.com/functions)) oraz ich problemu z tzw. zimnym startem (cold start), który może zdyskwalifikować wykorzystanie ich w systemie docelowym,
- porównanie czasów budowania, wdrażania i uruchamiania aplikacji (on-premises vs infrastruktura w chmurze),
- koszty migracji i utrzymania systemu docelowego w zależności od zastosowanego modelu ([IaaS, PaaS, CaaS, FaaS]({% post_url 2020-10-22-modele-wdrozenia-w-chmurze %})).

Powinniśmy również ustalić kolejność migrowanych elementów, zaczynając od mniej złożonych aplikacji, co pozwoli nabrać doświadczenia i ograniczyć ryzyko. Zdobytą wiedzę wykorzystamy później podczas migracji bardziej złożonych systemów. Dzięki temu programiści będą mogli uruchamiać i testować pierwsze aplikacje w chmurze, skupiając się na samej migracji a nie złożoności systemu.

**Aplikacje będące dobrymi kandydatami:**

- nie są krytyczne pod względem biznesowym,
- mogą być przydatne do zbudowania bazy wiedzy,
- są wspierane przez zespół developerski, który jest zmotywowany do zdobycia kompetencji w pracy z chmurą,
- są bezstanowe (stateless), czyli nie przechowują żadnych informacji pomiędzy interakcjami (np. sesji użytkownika) i mają małą liczbę zależności.
Takie aplikacje są łatwiejsze do przeniesienia i nie pociągają za sobą potrzeby przeniesienia innych elementów systemu,
- wymagają minimalnych zmian w kodzie i konfiguracji,
- nie wymagają przenoszenia dużych ilości danych,
- nie wymagają innych firm, ponieważ niektórzy dostawcy nie licencjonują swoich produktów w chmurze lub mogą wymagać zmiany typu licencji,
- nie są wrażliwe na przestój spowodowany migracją, co pozwala na łatwiejsze zaplanowanie migracji danych z bazy.

Przydatne mogą okazać się narzędzia takie jak [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) (który pomoże nam obliczyć koszt utrzymania infrastruktury w chmurze Google) czy [CloudPhysics](https://www.cloudphysics.com/) (które pozwoli nam zarządzać własną infrastrukturą, porównać koszty utrzymania infrastruktury on-premises vs chmura oraz wybrać elementy których migracja do chmury przyniesie największe korzyści).

Efektem etapu szacowania jest szczegółowa analiza systemu źródłowego, określone wymagania i wykorzystywane zasoby oraz posiadane licencje na oprogramowanie.
W wyniku takiej analizy może okazać się, że niektóre elementy nie mogą zostać przeniesione do chmury.

**Powody mogą być różne:**

- wymagania co do lokalizacji zapisanych danych;
- specyficzne systemy operacyjne;
- oprogramowanie którego nie oferuje chmura;
- obostrzenia wynikające z licencji
- zbyt duże ryzyko lub brak opłacalności migracji.

# Planowanie

Drugim z etapów migracji jest etap planowania, na którym powstaje podstawowa infrastruktura w chmurze oraz planowane jest przeniesienie systemu.
Planowanie obejmuje takie elementy jak zarządzanie tożsamością, struktura i organizacja projektu w GCP, infrastruktura sieci oraz komunikacja pomiędzy elementami systemu.
Wybrana zostaje również strategia migracji, co zostało opisane w dalszej części.

Etap ten jest ściśle związany z konkretną platformą, ponieważ od niej zależą czynności które należy wykonać.

**W przypadku Google Cloud Platform musimy:**

- skonfigurować użytkowników i konta systemowe (Google Accounts, [Service Accounts](https://cloud.google.com/iam/docs/service-accounts), Google Groups, G Suite domains, [Cloud Identity domains](https://cloud.google.com/iam/docs/overview)),
- zaprojektować strukturę zasobów (organizacje, foldery, projekty),
- zdefiniować grupy i role posiadające uprawnienia do tych zasobów (minimum to: organization admin, network admin, security admin, billing admin),
- zaprojektować topologię sieci i skonfigurować połączenie istniejącego środowiska z chmurą (minimum to przynajmniej jedna sieć [VPC](https://cloud.google.com/vpc)),
Do połączenia własnej infrastruktury z chmurą można wykorzystać połączenia hybrydowe, takie jak: Internet publiczny, [Cloud VPN](https://cloud.google.com/network-connectivity/docs/vpn/concepts/overview), Peering ([Direct](https://cloud.google.com/network-connectivity/docs/direct-peering)/[Carrier](https://cloud.google.com/network-connectivity/docs/carrier-peering)), [Cloud Interconnect](https://cloud.google.com/network-connectivity/docs/interconnect/concepts/overview) (Dedicated/Partner),

Efektem etapu planowania jest gotowy plan migracji oraz architektura systemu w chmurze.
Plan migracji uwzględnia elementy które będą przenoszone do chmury, zasoby które będą wykorzystywane, szacowane koszty utrzymania infrastruktury w chmurze oraz listę rzeczy niezbędnych do wykonania przed rozpoczęciem migracji.

## Strategie migracji

Podczas etapu planowania wybieramy strategię migracji, która wpływa na to jak wyglądać będzie system docelowy, w jakim modelu zostanie on wdrożony, ile będzie kosztowała sama migracja oraz jakie będą płynąć z niej korzyści.

**Na wybór strategii wpływa wiele czynników:**

1. **Infrastruktura źródłowa** - czy jest to on-premises, prywatny hosting czy inna publiczna chmura.
2. **Złożoność systemu** - czy można go łatwo przepisać na natywne rozwiązania chmurowe lub zastąpić usługami SaaS.
3. **Budżet** - czy proces migracji można wydłużyć w czasie, obniżając dzięki temu koszty z nim związane.
4. **Czas** - czy migracja musi odbyć się w określonym czasie, np. w celu zwolnienia zasobów, czy może być wykonywana w dłuższej perspektywie czasu.
5. **Kompetencje** - czy dobrze znana jest platforma docelowa, czy można poświęcić czas na zdobycie nowych kompetencji.

### Strategia "Lift and shift"

![Strategia "Lift and shift"](/assets/img/posts/2020-10-23-proces-migracji-do-chmury/lift_and_shift.jpg)

*Lift and shift* - czyli "podnieś i przesuń", jest strategią w której system przenoszony jest do chmury z minimalną liczbą modyfikacji.
Ewentualne zmiany są związane tylko z przystosowaniem systemu do infrastruktury docelowej.
Jest to najszybszy sposób na migrację, ponieważ ilość zmian jest ograniczona do minimum.

Strategię *lift and shift* wybiera się wtedy, kiedy system ma zostać przeniesiony do chmury w jak najkrótszym czasie.
Również ograniczona możliwość modyfikacji aplikacji (lub jej brak) oraz koszty z tym związane mogą być powodem wyboru te strategii.

**Zalety:**

- szybkość procesu migracji i niskie koszty z tym związane,
- niewielkie ryzyko i niski próg wejścia (programiści wykorzystują znane im rozwiązania, np. migrując maszyny wirtualne do Compute Engine czy kontenery z orkiestracji Kubernetes/OpenShift do [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine)),
- możliwość automatyzacji (np. wykorzystując narzędzie [Migrate for Compute Engine](https://cloud.google.com/migrate/compute-engine)).

**Wady:**

- brak wykorzystania natywnych rozwiązań chmury (np. skalowania horyzontalnego, usług SaaS),
- droższa i trudniejsza w utrzymaniu infrastruktura docelowa,
- duża odpowiedzialność za system docelowy po naszej stronie.

### Strategia "Improve and move"

![Strategia "Improve and move"](/assets/img/posts/2020-10-23-proces-migracji-do-chmury/improve_and_move.jpg)

*Improve and move* - czyli "ulepsz i przenieś", to strategia podczas której dokonywane są modyfikacje unowocześniające system o rozwiązania chmurowe.
Modyfikacje te są wykonywane w celu wykorzystywania natywnych możliwości chmury, a nie tylko przystosowania systemu do nowej infrastruktury.
Pozwalają one ulepszyć system pod kątem wydajności, funkcjonalności, kosztów utrzymania oraz wrażenia na użytkowniku końcowym.

Strategię *improve and move* wybiera się wtedy, kiedy architektura systemu umożliwia łatwe i szybkie zastąpienie pewnych elementów usługami SaaS,
ale nie możemy z jakiegoś powodu przepisać całego systemu, w celu wykorzystania wszystkich rozwiązań chmurowych.

Niezbędne do tego celu jest lepsze poznanie możliwości oferowanych przez chmurę (wyższy próg wejścia) oraz poświęcenie większej ilości czasu
na przystosowanie systemu do nowej infrastruktury.

**Zalety:**

- wykorzystanie niektórych natywnych rozwiązań chmury, które wpływają bezpośrednio na dostępność systemu, jego bezpieczeństwo oraz wydajność,
- niższe koszty utrzymania infrastruktury docelowej niż w przypadku strategii *lift and shift*,
- przeniesienie części odpowiedzialności za system docelowy na operatora chmury,
- podczas modyfikacji można dodatkowo zastosować rozwiązania, które ułatwią w przyszłości migrację do innych platform.

**Wady:**

- dłuższy czas migracji niż w przypadku strategii *lift and shift* oraz wyższe koszty z tym związane,
- nadal brak wykorzystywania pełni możliwości chmury.

### Strategia "Rip and replace"

![Strategia "Rip and replace"](/assets/img/posts/2020-10-23-proces-migracji-do-chmury/rip_and_replace.jpg)

*Rip and replace* - czyli "zniszcz i zastąp", to strategia w której wykorzystujemy w pełni natywne rozwiązania chmury, modyfikując lub całkowicie zastępując elementy systemu źródłowego.
Modyfikacje mogą polegać na przepisaniu aplikacji np. na funkcje lub na zastąpieniu pewnych elementów usługami SaaS (np. bazy danych czy kolejki).

Strategię *rip and replace* wybiera się wtedy, kiedy jakiś element systemu źródłowego nie spełnia oczekiwań lub wymagań i może zostać całkowicie przepisany lub zastąpiony usługą SaaS.
Taka zmiana pozwoli wykorzystać natywne rozwiązania chmury, które zapewnią skalowanie horyzontalne, wysoką wydajność i dostępność systemu, większe bezpieczeństwo, optymalizację kosztów utrzymania oraz minimalną odpowiedzialność po stronie użytkownika ([patrz wykres odpowiedzialności we wpisie Grzegorza]({% post_url 2020-10-22-modele-wdrozenia-w-chmurze %})).

**Zalety:**

- wykorzystujemy w pełni natywne rozwiązania oferowane przez chmurę, które pozytywnie wpływają na wydajność, dostępność i bezpieczeństwo systemu,
- przepisując lub zastępując elementy systemu eliminujemy dług techniczny,
- usługi SaaS zapewniają aktualizacje przeźroczyste dla działania systemu,
- rozwiązania w modelu FaaS/SaaS mogą nie generować żadnych kosztów w przypadku braku ruchu użytkowników, dzięki czemu minimalizujemy koszty utrzymania,
- zmniejszamy naszą odpowiedzialność za system (konfiguracja, zarządzanie, skalowanie, klastrowanie, bezpieczeństwo i wiele więcej), dzięki czemu stajemy się mniej DevOps, a bardziej NoOps.

**Wady:**

- bardzo wysoki próg wejścia, ponieważ musimy dokładnie poznać wszystkie usługi i rozwiązania jakie oferuje dana platforma,
- wysokie ryzyko migracji, ponieważ natywne rozwiązania chmury mogą mieć swoje ograniczenia (np. konkretne API),
- wysoki koszt i czasochłonność migracji,
- uzależnianie się od operatora chmury ([vendor lock-in]({% post_url 2020-10-22-modele-wdrozenia-w-chmurze %})).

# Wdrażanie

Trzecim z etapów migracji jest etap wdrażania, na którym projektujemy, implementuje oraz wdrażamy system docelowy w chmurze.
Część elementów systemu może zostać przeniesiona bez większych zmian, inne zaś wymagać mogą gruntownej refaktoryzacji lub zastąpienia innym rozwiązaniem (np. usługami SaaS).
Niezbędne są również takie elementy jak CI/CD, czyli proces budowania i wdrażania aplikacji (wykorzystujący na przykład [Terraform](https://www.terraform.io/) oraz usługę [Cloud Build](https://cloud.google.com/cloud-build)). Konieczne może okazać się również dopracowanie infrastruktury w chmurze, aby sprostać wymaganiom systemu.

**Do wyboru mamy następujące procesy wdrażania:**

1. **Wdrażanie ręczne** - pozwala na szybkie testowanie i eksperymentowanie z chmurą, ale podatne jest na błędy, często niepowtarzalne.
Zasoby można tworzyć ręcznie z poziomu [Google Cloud Console](https://console.cloud.google.com/), a polecenia mogą być wprowadzane z poziomu terminala lokalnego lub [Cloud Shell](https://cloud.google.com/shell).
2. **Narzędzia do wdrażania** - takie jak [Ansible](https://www.ansible.com/), [Chef](https://www.chef.io/), [Puppet](https://puppet.com/) czy [SaltStack](https://www.saltstack.com/) umożliwiają konfigurowanie środowiska w sposób zautomatyzowany, powtarzalny oraz kontrolowany.
Narzędzia te nie umożliwiają jednak wdrażania bezprzerwowego lub typu [Blue-Green](https://en.wikipedia.org/wiki/Blue-green_deployment) (niektóre umożliwiają implementację własnej logiki wdrażania, ale jest to dodatkowym obciążeniem).
3. **Orkiestracja kontenerów** - jeżeli aplikacje zostaną skonteneryzowane, można skorzystać z usługi [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine).
Kubernetes nie tylko zarządza, automatyzuje i skaluje aplikacje kontenerowe, ale oferuje również wiele metod bezprzerwowego wdrażania.
4. **Automatyzacja wdrażania** - wdrażając proces CI/CD, można zautomatyzować budowanie i wdrażanie aplikacji.
5. **Infrastruktura jako kod ([IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code))** - rozwiązanie to pozwala w sposób deklaratywny tworzyć zasoby i wdrażać aplikacje.
Umożliwia to również utworzenie testów do kodu tworzącego infrastrukturę.
Aby zaimplementować infrastrukturę jako kod, można wykorzystać [Cloud Deployment Manager](https://cloud.google.com/deployment-manager) lub jego alternatywę w postaci Terraform,
który umożliwi wdrożenie nie tylko w chmurze Google.

W przypadku migracji maszyn wirtualnych (VMware vSphere, Amazon AWS, Microsoft Azure) do GCP, możemy skorzystać z narzędzia [Migrate for Compute Engine](https://cloud.google.com/migrate/compute-engine), które zautomatyzuje ten proces.

Efektem etapu wdrażania jest gotowy i działający system w architekturze chmurowej. Skonfigurowane są takie elementy jak sieć, uprawnienia, skalowanie czy monitoring aplikacji.

# Optymalizacja

Ostatnim i trzecim z etapów migracji jest etap optymalizacji, na którym monitorujemy działający system w celu optymalizacji jego działania.
Wykonujemy testy wydajnościowe, które możemy porównać z testami systemu źródłowego oraz konfigurujemy wykorzystywane usługi i zasoby tak, aby system działał stabilnie, bezawaryjnie oraz wydajnie.

Optymalizacja aplikacji w chmurze może być również efektem zmian usług platformy chmurowej - na przykład nowym API, nowymi funkcjami lub nowymi usługami.
Również nabieranie doświadczenia i kompetencji przez zespół programistów może być powodem późniejszych usprawnień systemu w chmurze.

Z czasem coraz więcej elementów infrastruktury zostaje zautomatyzowanych, co redukuje koszty utrzymania oraz czas wdrażania aplikacji.
Zastępowane są również kolejne elementy infrastruktury usługami SaaS, dążąc do w pełni natywnych rozwiązań chmurowych.

Działający system jest optymalizowany pod kątem wykorzystywanych zasobów (na przykład zmieniając typ maszyn Compute Engine), dostosowując je do aktualnych wymagań, a także skonfigurowane
zostaje automatyczne skalowanie.

Przydatne mogą okazać się narzędzia z grupy [Operations/Stackdriver](https://cloud.google.com/products/operations), a także narzędzia i usługi przydatne w automatyzacji infrastruktury i procesu CI/CD (np. Terraform i Cloud Build).

Proces optymalizacji nie ma swojego końca, ponieważ działający system może wymagać okresowych zmian w konfiguracji, aby sprostać nowym wymaganiom i obciążeniu generowanemu przez
użytkowników. Stale analizowane są miesięczne koszty utrzymania, badane trendy i produkty, które są wykorzystywane najczęściej.
Dzięki temu można zmniejszać koszty, na przykład podpisując umowy na korzystanie z Compute Engine ([committed use discounts](https://cloud.google.com/compute/docs/instances/signing-up-committed-use-discounts)), czy zmieniając model płatności za usługę BigQuery na [flat-rate](https://cloud.google.com/bigquery/pricing#flat_rate_pricing).
