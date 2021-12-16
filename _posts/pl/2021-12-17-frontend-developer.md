---
layout:    post
title:     "Frontend Developer"
date:      2021-12-16 08:00:00 +0100
published: true
lang:      pl
author:    glipecki
image:     /assets/img/posts/2021-12-17-frontend-developer/frontend.webp
tags:
    - frontend
    - pogadajmy
description: "Czy Frontend Developer w Consdata robi stronki? Przeczytaj kim jest, czym się zajmuje i jak historycznie doszliśmy do obecnego kształtu tej roli. W bonusie krótki przegląd naszych projektów i opowieść dlaczego mamy frontendowca obok full-stacka?! :)"
---

Ostatnio ktoś mnie zapytał o naszą ofertę na Frontend Developera słowami "_To co, robicie stronki?_".

Czy Frontend Developer w Consdata robi stronki? #takżetego 😀

Korzystając z okazji, chciałbym przybliżyć trochę projekty, którymi się zajmujemy i opowiedzieć, jak wygląda przeciętny sprint frontend/fullstack developera. Przełom roku to dla wielu moment postanowień i zmian - może poniższy opis to impuls, którego właśnie szukasz? ;-)

## Frontend developer, czyli kto?

Czym właściwie zajmuje się frontend developer w Consdata? Jeżeli obstawiałeś, że praca na froncie to głównie pisanie CSSków to muszę Cię rozczarować (albo uspokoić, różnie ludzie na to patrzą ;-)). Wielu naszych developerów może przez całe sprinty nie dotykać HTMLa czy CSSów, a nadal być pewnym, że robią zadania na froncie.

Jakieś 15 lat temu świat był prosty. Jak się chciało mieć aplikację web to zapewne była to statycznie generowana strona HTML+CSS podparta backendem i jakąś formą budowania HTMLa po stronie serwera. Wtedy większość z nas ignorowała cały obszar frontu, zostawiając to komuś kto jest "gdzieś" i zajmuje się takimi rzeczami. Dobrze było, jak ktoś od frontu był w ogóle na miejscu, równie często mogła być to osoba spoza firmy wskakująca na praktycznie gotowy fragment systemu. Powiedzmy, że "ktoś później wpadnie zrobić CSSki" ;-)

Kolejne kilka lat i okazało się, że świat nie kończy się na użytkownikach oglądających białe ekrany w oczekiwaniu na załadowanie kolejnej strony. Część z nas odkryła, że w przeglądarce da się wykonać kod i istnieje coś takiego jak JavaScript. Oczywiście, szkoda było czasu uczyć się nowych rzeczy, a JavaScript coś podobnie brzmi jak Java i radośnie wskoczyliśmy w GWT. Niby to fronty ale jednak w większości programiści Java nie specjalnie przejmowali się czy to Swing, czy GWT, w końcu autorzy postarali się o zbliżone API i wszystko było po staremu. Frontendowiec nadal był gdzieś obok, tylko miał trudniej. Trudniej uruchomić, trudniej ogarnąć strukturę, trudniej dopisać wstawkę w JSie. Nadal można było funkcjonować w modelu "ktoś później wpadnie zrobić CSSki" ;-)

Zapewne domyślasz się co wprost wynika z takiego podziału? Backend developerzy produkują coś, co nie jest do końca tym czym miało być, a frontend developerzy radzą sobie z tym jak mogą osiągając jedynie fragment jakości potencjalnego rozwiązania. Brak komunikacji, zrozumienia potrzeb i ograniczeń "drugiej strony" wprost prowadzi do systemów niskiej jakości. Z obu stron "coś wyszło" i jakoś trzeba to zgrać w ramach QA ;-)

To co, do trzech razy sztuka? Za trzecim podejściem w końcu pogodziliśmy się, że z tematem należy się zmierzyć i nie taki diabeł straszny jak go malują. Obecnie aplikacje webowe mogą mieć znacznie więcej kodu niż wspierające je usługi. Od rozbudowanego backendu ze szczątkowym UI dochodzimy do miejsca, w którym to UI jest rozbudowany, a usługi są upraszczane i służą jedynie zaspokojeniu potrzeb frontu.

Złożoność aplikacji doprowadziła nawet do dalszego rozróżniania specjalizacji!

- programista (java/type/coffe/...)script, frontend developer,
- programista ui,

Tak, to te stanowiska potocznie nazywane frontendem i backendem frontendu. Dinozaury z serwerowymi korzeniami nie odpuszczają łatwo swoich nazw stanowisk ;-)

Skuteczny frontend developer łączy nie tylko te dwie funkcje, ale też potrafi sięgnąć głębiej i pracować z backendem. Takie holistyczne podejście pozwala mu swobodnie podejmować decyzje dążące do optymalnej realizacji oraz świadomie wybierać konkretne rozwiązania, znając ich konsekwencje i zalety. Dzięki temu swobodnie żongluje technikami backendu i frontendu, żeby osiągnąć zamierzony efekt i nigdy nie da sobie powiedzieć "tak musi być" czy "nie da się inaczej". Mimo lekkiego tonu, warto jednak zapamiętać tę myśl, bo zdarza się, że znając tylko jedną stronę równania dążymy do rozwiązywania wszystkiego znanymi sobie narzędziami. Tak jak ten cieśla, który mając młotek wszędzie widzi gwoździe, tak i nam zdarzyło się wszędzie widzieć fabryki obiektów zamiast po prostu zmienić interfejs DTO ;-)

## Odpowiedzialności Frontend developera w świecie Full-Stacków

Czyli muszę znać UI, architekturę aplikacji i jeszcze backend? Przecież mamy też full-stacków, to jaka jest różnica?

Bycie full-stackiem oznacza bycie wszechstronnym i zdolnym do podjęcia wszystkich wyzwań stawianych przed zespołem (w uproszczeniu, bo taki wątek poboczny zdominowałby cały wpis, a już [byłem gościem podcastu na ten temat](https://porozmawiajmyoit.pl/poit-069-full-stack-developer/) :)).

To znaczy, że w zależności od specjalizacji i zainteresowań, full-stack swobodnie porusza się we froncie w zakresie pracy, nazwijmy to, użytkowej. Umiejętność rozwoju zastanego kodu, realizacja tematów o znanym sposobie rozwiązania czy okazjonalne rozwiązywanie problemów z gatunku x-files, o ile szalenie ważna dla samodzielności zespołu, nadal nie zapewnia kompletu kompetencji.

Frontend developer to osoba specjalizująca się w tworzeniu aplikacji web. Potrafi wyznaczyć długoterminową roadmapę rozwoju, określić kierunek technologiczny i dobrać najlepsze rozwiązania do napotkanych problemów. W gestii frontend developera jest dbanie o ciągły rozwój technologiczny, budowanie rozwiązań referencyjnych i wskazywanie innym sposobu pracy tam, gdzie kończą się znane przykłady i rozwiązania.

To, czego możemy nauczyć się z krótkiej historii frontendu z początku artykułu to to, że silne rozdzielanie odpowiedzialności i stawianie jasnej granicy między frontend a backend developerami nie jest najlepszym pomysłem. Dlatego frontend-developer w Consdata w praktyce jest stanowiskiem zbieżnym z full-stackiem, jednak o nacisku położonym na część "ponad RESTem". Tak jak od full-stacka oczekujemy, że poradzi sobie z typowymi tematami frontu, tak samo liczymy, że frontendowiec nie będzie się czuł zagubiony przy przeciętnych zagadnieniach backendu.

Zrozumienie obu stron problemu jest kluczowe w zapobieganiu przerzucania się "u mnie działa" (ew. unikania sytuacji ["szach mat frontendowcy"](https://www.youtube.com/watch?v=USaxePzTmTs) ;)).

## Ok, nie CSSki, to co?

Padło już wiele okrągłych zdań próbujących opisowo wytłumaczyć kontekst i motywację, pora zatem na kilka reprezentatywnych przykładów typowych zadań.

- Rozbudowa aplikacji o współdzielony pomiędzy komponentami stan:
    - integracja biblioteki NgRx z aplikacją Angular,
    - przygotowanie konfiguracji lokalnej i produkcyjnej,
    - referencyjna implementacja obsługi stanu w jednym z modułów funkcjonalnych,
    - wypracowanie utili i wytycznych określających zalecany sposób implementacji i dobre praktyki,
    - przedstawienie implementacji zespołom i wskazanie materiałów poszerzających wiedzę.
- Wsparcie równoległej pracy wielu użytkowników nad pojedynczym elementem domeny:
    - zbudowanie mechanizmu wprowadzania zmian sterowanego zdarzeniami,
    - przygotowanie synchronizacji delt zmian klient-serwer,
    - podsystemu redukowania zdarzeń do projekcji bieżącego stanu po stronie aplikacji klienckiej,
    - propagowanie wiedzy i edukacja zespołu w zakresie wykorzystania rozwiązania.
- Możliwość rozbudowy aplikacji rozszerzeniami funkcjonalnymi dostarczanymi przez klienta w runtime:
    - określenie api i specyfikacji osadzania webcomponentów,
    - implementacja ładowania i obsługi cyklu życia komponentów klienta,
    - rekomendacje i współpraca w budowaniu gateway dla webcomponentów z uwzlędnieniem modelu uprawnień,
    - przygotowanie przykładów komponentów w oparciu o LitElement,
    - eksponowanie elementów UI aplikacji nadrzędnej jako webcomponenty dostępne dla komponentów rozszerzeń.
- Budowanie kreatora wieloetapowej akceptacji operacji asynchronicznych:
    - przygotowanie generycznego mechanizmu wieloetapowej akceptacji na wiele rąk,
    - referencyjna implementacja funkcjonalności potwierdzania paczek transakcji,
    - uogólnienie kodu na potrzeby przyszłych funkcjonalności i przygotowanie funkcjonalnych prototypów Storybook.
- Komponent tworzenia wiadomości oferujący funkcjonalność formatowania treści:
    - opracowanie komponentu edytora WYSIWYG z przykładami w UI guideline,
    - wykorzystanie komponentu na ekranie tworzenia wiadomości,
    - integracja wysyłki z istniejącą usługą REST z uwzględnieniem praktyk UI/UX i optymistycznego potwierdzania operacji.

I tak dalej. To tylko kilka z przykładów kompetencji i umiejętności których szukamy u osób specjalizujących się w obszarze Frontend Developer.

## Czym można się zająć w Consdata?

W Consdata, w zależności od zespołu, możesz pracować przy jednej lub kilku z naszych kluczowych aplikacji web. W kolejnych punktach przejrzymy razem co, i w jakiej skali, budujemy dla naszych klientów.

W zależności od wybranego projektu, pojawiające się w nim wyzwania będą bliżej domeny lub stosowanej technologii.

![Projekty Consdata](/assets/img/posts/2021-12-17-frontend-developer/os-projektow.webp)
<span class="img-legend">Projekty Consdata z uwzględnieniem charakterystyki nacisku na domenę lub technologię</span>

### iBiznes

iBiznes to złożony system kompleksowej obsługi klienta korporacyjnego. Głównym wyznacznikiem projektu jest jego złożoność biznesowa.

Mimo że dziedzina stanowi główne wyzwanie, to jednak nie brakuje w nim wyzwań technologicznych, takich jak np. wielomodułowa architektura zbudowana z myślą o niezależnych wdrożeniach obszarów funkcjonalnych, równoczesna praca wielu klientów nad pojedynczymi obiektami domeny czy optymalizacja z badaniami UX/UI i dbanie o czytelność złożonych biznesowo operacji.

Jeżeli szukasz wyzwania w projekcie, który skupia się na domenie i jego złożoność leży w implementowanych funkcjonalnościach, to iBiznes jest właśnie dla Ciebie!

iBiznes w liczbach to ~300k linii kodu TypeScript i ~30k linii SASS samego frontendu napisanego w Angularze!

### Mailbox

Skłaniasz się bardziej w stronę *cutting edge* technologii, o których tyle słyszysz na konferencjach? Twój wzrok powinien paść na projekty Mailbox. Nie da się mówić o Mailbox nie mówiąc o skali! Codzienna komunikacja z milionami klientów uczy nowego spojrzenia na nawet najprostsze problemy (zdziwiłbyś się ile daje optymalizacja aktualizacji licznika nieprzeczytanych wiadomości o, w praktyce, nieograniczonej liczbie użytkowników).

Udział w projekcie Mailbox oferuje zrównoważoną dawkę złożoności biznesowej i wyzwań technologicznych.

Dodatkowym atutem jest możliwość pochwalenia się znajomym i rodzinie co się ostatnio robiło, wystarczy, że są klientami jednego z naszych klientów, a że klienci duzi to i szansa na bycie ich klientem spora ;-)

~45k linii TypeScript z ~8k linii SASS stojących na froncie przed klastrem Kafki i Solara brzmi kusząco? Mailbox jest dla Ciebie!

### Eximee

Praca z domeną Cię nie kręci? Zawsze od tematów biznesowych bardziej kręciły Cię wyzwania czysto technologiczne?

Może warto spojrzeć na nasz system obsługi wniosków i procesów? Eximee na każdym kroku projektowane jest jako framework, z którego nasi klienci korzystają budując własne rozwiązania biznesowe.

W Eximee nigdy nie ma jednego słusznego rozwiązania problemu, wszystko jest warunkowe, "zależy" i "oczywiście, że można zrobić inaczej". Podstawą pracy jest, z jednej stronie naginanie tego co założyli twórcy, a z drugiej projektowanie systemu podatnego na naginanie. Skala systemu leży w jego generyczności i rozszerzalności. Samo Eximee jest uruchomione w kilkunastu wariantach wdrożeniowych u różnych klientów, często w wielu kanałach równolegle!

Wszystko to sprawia, że Eximee to głównie wyzwanie technologiczne i poligon nowych rozwiązań testowanych u klientów w publicznie dostępnych systemach!

Ale to nie wszystko, w projekcie budujemy też narzędzia graficznego projektowania procesów i wniosków, obsługi backoffice i inne. Poznaj potrzeby systemu spełniającego oczekiwania od klienta, przez obsługę backoffice, po pracę programistów oraz projektantów tworzących biznesowe rozwiązania oparte o dostarczaną przez Ciebie platformę.

Twoi znajomi pewnie już korzystali z systemu który tworzysz, zapewne nie raz ;-)

Być może Eximee z ~250k linii TypeScript i ~130k linii SASS frameworku to coś dla Ciebie.

### Consdata OSS

Gdy nabierzesz ochoty na eksperymenty, prototypu i ogólnie luźniejsze podejście, zawsze możesz zaplanować swój czas na rozwój lub budżet chapterowy na wsparcie jednego z naszych projektów open source skupionych na GitHub: [https://github.com/orgs/Consdata/repositories](https://github.com/orgs/Consdata/repositories).

Tylko z nazwy warto wspomnieć o:

- [kouncil](https://github.com/Consdata/kouncil) - ui do Kafki zbudowany na bazie doświadczeń naszych i naszych klientów,
- [sonarqube-companion](https://github.com/Consdata/sonarqube-companion) - agregat naruszeń SonarQube rozumiejący strukturę zespołów i śledzący trendy analizy statycznej,
- inne narzędzia jak logger, aplikacje intranetowe do newsletterów, rezerwacji parkingu, czy śledzenia feedbacku i zbierania ankiet.

W Open Source nie ograniczamy się żadnymi wytycznymi, to nasze poligony. Firebase? Angular czy React? Node czy Java? Spring czy Quarkus? Nie ma znaczenia! Zrealizuj funkcjonalność i powiedz innym jak poszło!

## Dołączysz?

Czujesz, że frontend to może być miejsce dla Ciebie? Zainteresował Cię któryś z naszych projektów? Czujesz, że podołasz? Chciałbyś uczestniczyć w wyznaczaniu architektury i projektowaniu aplikacji web z szerokiego portoflio?

Sprawdź nasze oferty, u nas każdy znajdzie coś dla siebie ;-)

Prowadzimy obecnie rekrutację na stanowisko Frontend Developer. Poszukujemy osób biegłych w tworzeniu aplikacji web, które pomogą nam wyznaczyć dalszy kierunek rozwoju i rozpędzić toczące się już zmiany w naszych aplikacjach. Kluczowa jest dla nas wiedza z poziomu projektowania aplikacji, wierzymy, że braki w tworzeniu komponentów czy jedynie ogólne wyczucie "tych backendów" to tematy, nad którymi możemy już pracować razem.

Jeśli tylko czujesz się na siłach, a w backendzie chociaż "wiesz co piszczy", to nie czekaj dłużej, daj mi się zaprosić na rozmowę rekrutacyjną ;)

[https://consdata.com/pl/kariera/trwajace-rekrutacje/poznan/senior-frontend-fullstack-developer-angular](https://consdata.com/pl/kariera/trwajace-rekrutacje/poznan/senior-frontend-fullstack-developer-angular)

PS. Jeśli masz jakiekolwiek pytania - nie wahaj się znaleźć mnie LinkedIn i pisać w dowolnej sprawie.