---
layout:    post
title:     Wstęp do tworzenia czytelnych modeli BPMN
description: ""
date:      2025-01-27T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: twozniak
image: /assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/thumbnail.webp
tags:
- bpmn
---

BPMN (Business Process Model and Notation) to graficzna notacja służąca do opisywania procesów biznesowych, stworzona przez OMG (Object Management Group). Jej główną zaletą jest prostota i zrozumiałość dla wszystkich interesariuszy – pod warunkiem, że procesy są modelowane zgodnie z najlepszymi praktykami. Tylko czym są te najlepsze praktyki?

## Najlepsze praktyki w modelowaniu BPMN
Ważne jest, aby zespół i cała organizacja posiadała spójną konwencję tworzenia procesów. Poniżej przedstawione zasady to przykład takiej konwencji, którą można wdrożyć aby poprawić jakość modelowanych procesów i uniknąć potencjalnych błędów.

### Spójne nazewnictwo
Podobnie jak w programowaniu, odpowiednie nazewnictwo w BPMN jest kluczowe. Spójne nazewnictwo ułatwia wszystkim interesariuszom (zarówno technicznym, jak i nietechnicznym) zrozumienie procesu. Czytelne i zrozumiałe nazwy budują przejrzystość i pomagają w komunikacji między działami.

- **Wielkość liter**: Zaczynaj nazwy od wielkiej litery, a kolejne wyrazy pisz małą literą (np. *Sprawdzanie dokumentów*). Wyjątki stanowią nazwy własne i akronimy. Brak konsekwencji (np. raz użycie małych liter, a innym razem dużych) utrudni szybkie rozpoznanie elementów procesu.
- **Unikanie terminów technicznych**: Zamiast używać klas czy metod z kodu, stosuj język zrozumiały dla biznesu. Niejasne lub zbyt techniczne nazwy mogą wprowadzić w błąd, np. zamiast „Weryfikuj dokumenty” użycie „ExecuteDocumentCheck” sprawia, że proces staje się trudniejszy do zrozumienia dla osób nietechnicznych, takich jak menedżerowie czy analitycy biznesowi.

### Jak opisywać komponenty BPMN?

#### **Zadania (Tasks)**
Stosuj dopełnienie i czasownik w bezokoliczniku, aby jasno określić wykonywaną czynność, np.:
- „Sprawdzanie poczty”
- „Weryfikuj dokumenty klienta”

#### Podprocesy (Call Activities)
Opisuj je podobnie jak zadania – jasno i z konkretami, unikając ogólników. Nazwa powinna odzwierciedlać działania w kontekście biznesowym.

#### Zdarzenia (Eventy)
Nazywaj zdarzenia w sposób odzwierciedlający stan obiektu, np.:
- „Faktura do sprawdzenia”
- „Dokumenty zweryfikowane”
- „15 minut (timer)”

#### Bramki (Gateways)
- **Exclusive lub Inclusive Gateway**: Formułuj pytania, a przepływy nazwij odpowiedziami (np. „Tak”, „Nie”). Jeśli pytanie nie jest możliwe, określ warunki wykonania każdej ścieżki.
- **Event-based Gateway**: Upewnij się, że kolejne zdarzenia są poprawnie nazwane. Unikaj używania innych bramek lub podprocesów w tych punktach.

---
![Przykładowy proces reklamacyjny](/assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/BPMNFirstDiagram.webp)

### Zasady modelowania procesów

#### Modelowanie od lewej do prawej
Twórz diagramy w logicznym kierunku od lewej do prawej, dbając o ich przejrzystość. Ludzie naturalnie czytają od lewej do prawej (w większości kultur), dlatego procesy modelowane w tym kierunku są bardziej intuicyjne. Modele stworzone „chaotycznie” (np. z przepływami w różnych kierunkach) są trudne do odczytania i mogą być źródłem nieporozumień

![Proces od lewej do prawej](/assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/BPMNLeftToRight.webp)

#### **Początek i koniec procesu**
Zawsze uwzględniaj zdarzenie początkowe i końcowe. Zgodnie ze standardem BPMN zdarzenia początkowe jest opcjonalne, o ile nie dodamy końcowego, ale ogólnie jest to zła praktyka ponieważ procesy z niejawnymi zdarzeniami początkowymi i końcowymi są niepożądane i mogą doprowadzić do jego błędnej interpretacji. Brak zdarzenia początkowego sprawia, że nie wiadomo, co uruchamia proces (np. zdarzenie zewnętrzne, ręczne działanie, czas). Z kolei brak zdarzenia końcowego sugeruje, że proces trwa wiecznie, co może prowadzić do błędów w projektowaniu.

![Punkty Startowe procesu](/assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/BPMNProcessStartPoint.webp)

#### Przejrzystość bramek
Bramki są kluczowe w podejmowaniu decyzji i rozdzielaniu przepływów. Ich przejrzyste użycie pozwala jasno określić, co dzieje się na każdym etapie procesu.  Chaos w modelowaniu, np. używanie tej samej bramki do rozdzielania i łączenia, może prowadzić do błędnych interpretacji procesu.
Niejasne warunki w bramkach mogą powodować błędy w przepływach procesów, co skutkuje nieprzewidzianymi rezultatami.
Aby bramki były czytelne:
- Używaj bramek zamiast przepływów warunkowych. (1)
- Nie łącz i nie zamykaj procesu tą samą bramką. (2)
- Stosuj ten sam typ bramek do rozdzielania i łączenia przepływów. (3)

![Przejrzystość bramek](/assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/BPMNGatewayVisibility.webp)

#### Happy path
Trzymaj główną ścieżkę procesu („happy path”) w centrum diagramu, utrzymując proste i czytelne sekwencje przepływów. Jej przejrzystość ułatwia analizę i projektowanie. Procesy z chaotycznym przepływem mogą utrudnić identyfikację głównej ścieżki, co zwiększa ryzyko przeoczenia kluczowych kroków.


#### Unikaj modelowania ponowień
Często jest pokusa modelowania ponowień, co ciekawe jest to traktowane jako anty pattern i należy tego unikać. Modelowanie ponowień może niepotrzebnie komplikować proces. Unikanie modelowania ponowień chroni nas przed nadmiernym rozbudowaniem diagramu, które utrudnia jego zrozumienie, poniżej przykładowy antypattern
![Ponowienia](/assets/img/posts/2025-01-27-wstep-do-tworzenia-czytelnych-modeli-bpmn/BPMNRetriesHandle.webp)

## Podsumowanie
Modelowanie procesów w BPMN wymaga uwagi do szczegółów i przestrzegania zasad, które zwiększają ich czytelność i zrozumiałość. Dzięki powyższym praktykom twój diagram będzie bardziej klarowny, spójny i łatwiejszy do zrozumienia dla wszystkich interesariuszy.  