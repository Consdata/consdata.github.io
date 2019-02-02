---
layout:    post
title:     "Monitorowanie zespołowych trendów jakości kodu"
date:      2018-02-22 08:00:00 +0100
published: true
author:    glipecki
tags:
    - tech
    - sonarqube
    - sonarqube companion
    - jakość kodu
---

W jednym z wcześniejszych wpisów omawialiśmy już zalety i zasadność statycznej analizy kodu z pomocą SonarQube ([tutaj]({% post_url 2016-12-08-sonarqube-wprowadzenie-do-statycznej-analizy-kodu %})).

Przyjmijmy więc, że jesteśmy już przekonani do całego przedsięwzięcia, inwestujemy w infrastrukturę i zaczynamy mierzyć. Pierwsze sukcesy zapewne już są na naszym koncie, jakość projektów wzrosła, naruszeń o krytycznych priorytetach mamy coraz mniej, a cały zespół jest zadowolony z dbania o własne podwórko. Powstaje jednak pytanie, jak monitorować trend zmian? Jak ocenić czy prowadzone przez nas prace przynoszą faktyczne efekty? Dodatkowo powstaje problem, jak monitorować statystyki naruszeń na poziomie zespołu utrzymującego wiele projektów?

## SonarQube Companion
W odpowiedzi na zadane pytania, stworzyliśmy aplikację dashboardu dla SonarQube i udostępniliśmy ją wszystkim na [GitHub](https://github.com/Consdata/sonarqube-companion)!

Projekt na pierwszym miejscu stawia zespoły i ich potrzeby. Monitorowane projekty są agregowane w zespoły, zgodnie ze strukturą firmy. Dodatkowo naruszenia możemy śledzić na wykresach z konfigurowalnymi zakresami sprintów, czy nawet naniesionymi ważnymi datami z życia zespołu.

W zależności od oczekiwań, możesz śledzić stan bazy kodu na różnych poziomach. Przykładowo, drzewo projektów pokazuje szybki rzut na stan wszystkich projektów oraz sumaryczny stan firmy / zespołu. Alternatywnie, przeglądając ekran konkretnego zespołu, czy nawet projektu, widzisz obszary na które warto zwrócić uwagę przy codziennej pracy.

## Drzewo zespołów
Drzewo zespołów przedstawia hierarchiczną reprezentację organizacji na projekty oraz pracujące nad nimi zespoły.

![Drzewo zespołów](/assets/img/posts/2018-02-22-monitorowanie-zespolowych-trendow-jakosci-kodu/1.png)

Poszczególne kafle projektów/zespołów przedstawiają ich bieżącą kondycję oraz krótkie podsumowanie statystyk. Celem nadrzędnym jest dążyć do bezwzględnej zielenie na całym ekranie ;-)

Poszczególne kolory są ustalane zgodnie z zasadą:
- kolor czerwony (unhealthy) - występują naruszenia o priorytecie bloker, bezpośrednio w grupie lub jednej z podgrup, wymagana natychmiastowa akcja,
- kolor pomarańczowy (warning) - występują naruszenia o priorytecie krytyczny, bezpośrednio w grupie lub jednej z podgrup, należy planować rozwiązanie problemów,
- kolor zielony (healthy) - brak naruszeń o priorytecie bloker oraz krytyczny, mogą znajdować się naruszenia o niższych priorytetach, wystarczające są codzienne akcje porządkowe.

Zasady kolorystyczne będą się powtarzały przy takich samych ograniczeniach na innych ekranach. Same akcje/interakcje to już wypracowana przez nas indywidualnie polityka i w różnych zespołach może zostać zrealizowana inaczej.

Dodatkowo, dla każdego kafla widzimy szybką statystykę liczby projektów, ogólnej oceny zdrowia i podsumowanie liczby naruszeń.

## Przegląd zespołu
Strona zespołu pozwala na bieżąco śledzić stan projektów nad którymi pracuje zespół, bez dodatkowych rozproszeń związanych z działalnością innych zespołów.

![Podgląd stanu zespołu](/assets/img/posts/2018-02-22-monitorowanie-zespolowych-trendow-jakosci-kodu/2.png)

W ramach ekranu zespołu możemy śledzić:
- szybki przegląd stanu projektu, liczbę projektów, podgrup, itp,
- wykres zmian liczby naruszeń w wybranym przedziale czasu:
    - uwzględniający filtrowanie po różnych typach naruszeń,
    - zaznaczanie na osi wykresu dat i nanoszenie sprintów zespołu,
- przegląd grup, z których składa się bieżąca grupa (w przypadku głębszych hierarchii z dodatkowymi grupami agregującymi),
- listę projektów składających się na grupę:
    - w grupie znajdują się projekty zdefiniowane w niej oraz w grupach pod nią w drzewie,
    - listę projektów można filtrować na podstawie ich statusu, tj. zmiany liczby naruszeń, poprawienia, pogorszenia jakości projektów
    - dla każdego projektu, kolorem zaprezentowana jest jego bieżąca kondycja,
    - dla każdego projektu prezentowana jest bieżąca liczba naruszeń oraz zmian tej wartości w oknie czasowym wybranym na wykresie.

## Przegląd projektu
Możliwe jest również przeglądanie stanu konkretnego projektu, niezależnie od jego przynależności do grup czy zespołów.

![Podgląd stanu projektu](/assets/img/posts/2018-02-22-monitorowanie-zespolowych-trendow-jakosci-kodu/3.png)

Widok pojedynczego projektu jest uproszczonym widokiem zespołu prezentującym jedynie podzbiór danych zasadnych dla tego projektu.

## Realny wpływ na pracę zespołów
Wprowadzenie dodatkowych narzędzi historycznego śledzenia jakości projektów pozwoliło utrzymać motywację zespołów do zmniejszania liczby naruszeń.

Miły dla oka interfejs i możliwość szybkiego porównania wprowadziły mały aspekt rywalizacji oraz pogoni za zielonym wśród programistów.

Wszystko to pozytywnie przełożyło się zarówno na poprawę istniejących, jak i zwiększenie świadomości i zmniejszenie liczby nowych naruszeń.

Wprowadzone narzędzie pozwoliło nam długofalowo monitoroawć zespoły pracujące nad wieloma małymi projektami (co jest nieuniknione przy architekturach typu microservices), jak i utrzymać zaangażowanie oraz zainteresowanie programistów ponad początkową euforię, również w kolejnych, bardziej mozolnych miesiącach.

## Uruchomienie aplikacji
Kompletne kody projektu dostępne są dla każdego na GitHub. Dodatkowo, zbudowane wersje kodów wrzucamy w postaci gotowego do użycia obrazu na Docker Hub.

Nic nie stoi na przeszkodzie, żebyś też skorzystał z naszych doświadczeń. Szczegółowe informacje, jak uruchomić projekt, zarówno produkcyjnie, jak i lokalnie, znajdują się w README projektu na GitHub.

Zachęcamy do skorzystania, zgłaszania uwag i wsparcia przy dalszych pracach rozwojowo/utrzymaniowych.

## Przydatne linki:

- [Projekt GitHub](https://github.com/Consdata/sonarqube-companion)
- [Obraz w Docker Hub](https://hub.docker.com/r/consdata/sonarqube-companion/)
