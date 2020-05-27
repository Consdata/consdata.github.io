---
layout:    post
title:     "Na co nam ta chmura?"
date:      2020-06-01 08:00:00 +0100
published: true
author:    mhoja
image:     /assets/img/posts/2020-06-01-na-co-nam-ta-chmura/cloud.png
tags:
    - cloud
    - google cloud platform
    - gcp
    - serverless
---

Chmury obliczeniowe prężnie się rozwijają i zyskują coraz większą popularność. Wiele firm decyduje się na skorzystanie z produktów oferowanych przez Google, Amazon czy Microsoft.

Z inicjatywy PKO Banku Polskiego powstaje [Chmura Krajowa](https://chmurakrajowa.pl/), która nawiązuje współpracę z Google. [Google Cloud otwiera nowy region w Warszawie. 🔗](https://itwiz.pl/operator-chmury-krajowej-google-cloud-otwieraja-region-google-cloud-warszawa-buduja-data-center/)

W ostatnich latach bardzo dużo się dzieje w świecie Cloud Computing. Coraz częściej rezygnujemy z rozwiązań on-premise na rzecz platform chmurowych, migrujemy swoje infrastruktury do takich gigantów jak AWS, Microsoft Azure, czy Google Cloud. Ale dlaczego?

### Na co nam ta chmura?

W tym wpisie chciałbym przedstawić kilka powodów, dla których warto skorzystać z [**Google Cloud Platform**](https://cloud.google.com/), jednak wiele elementów pokrywa się również z innymi usługodawcami, czy ogólną ideą chmury.

## Wydajność

Infrastruktura Google Cloud Platform zapewnia nam wydajność kilkudziesięciu centrów danych oraz własnej sieci internetowej.

Sieć Google jest odpowiedzialna za 40% ruchu całego internetu i jest największa siecią tego typu na świecie. Komunikacja między usługami Google Cloud odbywa się przez wewnętrzną infrastrukturę sieciową, co zapewnia bardzo wysoką przepustowość oraz niską latencję.

![Google Cloud Network](/assets/img/posts/2020-06-01-na-co-nam-ta-chmura/google-cloud-network.png)

## Niezawodność

Usługi Google Cloud oferują wysoką dostępność na poziomie SLA powyżej 99%.

Przykładowo dla Cloud Storage jest to (w zależności od klasy) od 99,0% do 99,95% SLA, a dla Compute Engine od 99,5% do 99,99% SLA.

Aby zminimalizować przerwy w świadczeniu usług z powodu awarii sprzętu, klęsk żywiołowych lub innych incydentów, Google zbudował wysoce redundantną infrastrukturę. Jeśli awarii ulegnie nawet całe centrum danych, nasze dane i usługi będą nadal dostępne, ponieważ Google posiada centra danych rozmieszczone na całym świecie, a nasze dane są replikowane.

Korzystając z chmury nie musimy więc przejmować się awariami sprzętu (np. wymianą dysków), zanikami energii elektrycznej, pożarami oraz fizycznymi włamaniami do serwerowni.

## Bezpieczeństwo

Google Cloud oferuje bezpieczeństwo, o które ciężko w przypadku on-premise. Składa się na to wiele elementów, między innymi:

1. Bieżące aktualizacje bezpieczeństwa, które odbywają się bez przerw w dostępie do usługi;

2. Ponad 500 ekspertów bezpieczeństwa Google, w tym czołowych ekspertów na świecie którzy pracują przez całą dobę, aby wcześniej wykryć zagrożenia i zareagować;

3. Szyfrowanie danych przesyłanych między Google a klientami oraz między centrami danych, a także szyfrowanie danych zapisanych w chmurze;

4. Automatyczna rotacja kluczy [(**Cloud KMS**);](https://cloud.google.com/kms/docs/key-rotation)

5. Zarządzanie rolami i uprawnieniami [**(Cloud Identity and Access Management)**;](https://cloud.google.com/iam)

6. Zabezpieczenie przed atakami DDoS [**(Cloud Armor)**;](https://cloud.google.com/armor)

7. Bezpieczeństwo fizyczne centrów danych Google, które odwiedzić może jednie niewielka część pracowników firmy;

8. Wieloletnie doświadczenie zdobyte podczas ataków na usługi wyszukiwarki Google, Gmail, oraz YouTube;

9. Wykorzystanie niestandardowego sprzętu oraz podpisów kryptograficznych na wszystkich niskopoziomowych komponentach (takich jak BIOS, Bootloader, Kernel).

Google posiada rozbudowaną warstwę bezpieczeństwa, która zabezpiecza infrastrukturę od sprzętu aż po system operacyjny. Nie wszystko jest jednak dostępne out-of-the-box.

Musimy pamiętać, że niektóre elementy muszą zostać przez nas poprawnie skonfigurowane. Mam na myśli na przykład uprawnienia/role czy reguły firewall. Jeśli tego nie zrobimy, to może się okazać, że nasz system będzie dostępny dla osób nieupoważnionych z poziomu internetu.

## Elastyczność

Jednym z największych atutów chmury jest jej elastyczność.

Nie jesteśmy ograniczeni przez sprzęt, który posiadamy. Zasoby są dostępne na żądanie, więc jeśli przyjdzie potrzeba zwiększenia pamięci RAM czy wielkości dysku, to możemy to zrobić w każdej chwili.

Wykorzystujemy tylko tyle zasobów, ile potrzebujemy w danej chwili. Jest to szczególnie ważne, jeśli nasza infrastruktura ma być gotowa na chwilowy, zwiększony ruch. W przeciwieństwie do on-premise, nasze zasoby nie marnują się w przypadku nie korzystania z nich.

## Skalowalność

W przypadku usług w modelu SaaS, takich jak np. Cloud SQL czy Cloud Function, nie musimy się przejmować skalowaniem czy wydajnością. Google zapewni nam dostępność oraz wydajność usługi niezależnie od obciążenia. Nie musimy więc zajmować się klastrowaniem własnej bazy danych.

Jeśli uruchomimy naszą aplikację w modelu PaaS, np. korzystając z usługi App Engine (w wersji standard), Google automatycznie będzie skalował ją w zależności od obciążenia. Większą kontrolę nad skalowaniem naszej aplikacji zapewni nam Kubernetes Engine, który jest hybrydą między IaaS a PaaS.

Również w przypadku modelu IaaS, korzystając z maszyn wirtualnych Compute Engine, mamy możliwość automatycznego skalowania. W tym wypadku musimy jednak skonfigurować grupę instancji i ustalić minimalną/maksymalną liczbę maszyn wirtualnych oraz na jakiej podstawie usługa ma być skalowana (np. obciążenie CPU). W zamian otrzymujemy największą kontrolę nad tym w jaki sposób odbywa się skalowanie.

## Obniżenie kosztów

W przypadku modelu IaaS, jeśli zmigrujemy się do chmury strategią "Lift and Shift", czyli mówiąc prościej, przeniesiemy nasze serwery na maszyny wirtualne Compute Engine, może okazać się, że miesięczny koszt infrastruktury będzie wyższy niż w przypadku on-premise.

Sytuacja zmienia się w przypadku modeli PaaS czy SaaS, a także hybrydy w postaci Google Kubernetes Engine. Ponieważ zasoby w chmurze są dostępne na żądanie, to płacimy tylko za te, które faktycznie wykorzystujemy.

Jeśli nasz system przyjmuje wzmożony ruch np. przez kilka dni w każdym miesiącu, to w tych dniach zostaną przydzielone dodatkowe zasoby. Jak ruch spadnie, to zasoby zostaną zredukowane, dzięki czemu nie będziemy płacić za to, czego w danej chwili nie potrzebujemy.

**Google Cloud oferuje również zniżki:**

- [**Sustained use discounts**](https://cloud.google.com/compute/docs/sustained-use-discounts) - zniżki za uruchamianie określonych zasobów przez znaczną część miesiąca;
- [**Committed use discounts**](https://cloud.google.com/compute/docs/instances/signing-up-committed-use-discounts) - zniżki w ramach umowy z Google, jeśli zobowiązujemy się do korzystania z zasobów przez określony czas.

[**a także darmowe limity. 🔗**](https://cloud.google.com/free)

Zaoszczędzimy również na utrzymaniu infrastruktury, ponieważ nie potrzebujemy już administratorów opiekujących się naszymi serwerami.

Dzięki automatyzacji jaką daje nam chmura możemy być mniej DevOps, a bardziej NoOps.
