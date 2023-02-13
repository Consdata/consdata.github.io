---
layout:    post
title:     "Figma - narzędzie do projektowania interfejsu użytkownika"
date:      2023-01-16 06:00:00 +0100
published: true
didyouknow: false
lang: pl
author: jlavrinovics
image: /assets/img/posts/2023-01-16-uiux-tools/uiux-tools.jpg
tags:

- ui/ux
- figma

---

Figma - jest bardzo popularnym i mocno rozwijającym się narzędziem do projektowania i prototypowania zaawansowanych interfejsów aplikacji mobilnych oraz stron internetowych. W Figmie mogą współpracować projektanci, marketerzy, menedżerowie oraz programiści, wspólnie tworząc lub też omawiając na bieżąco wygląd powstającej aplikacji. Figma zyskała swoją przewagę na rynku przed innymi rozwiązaniami dzięki interaktywnym widokom, prostemu i intuicyjnemu interfejsowi oraz bogatej funkcjonalności.

## Interfejs

Interfejs Figmy składa się z wielu różnych elementów pogrupowanych według funkcjonalności. W narzędziu tym łatwo jest tworzyć różnorodne kształty o dowolnym stopniu trudności, które możemy skalować, eksportować i na ich podstawie tworzyć zaawansowane komponenty widoków. Można użyć grafiki wektorowej, gdy trzeba tworzyć proste ilustracje, w tym przyciski, logo, ikonki. Figma pozwala również na tworzenie dynamicznych efektów np. klikalnych przycisków, rozwijanych list, tworzenie animacji przejść przez widoki lub też interakcji komponentów z użytkownikiem.

## Komponenty

Komponenty w Figmie pomagają zastosować zmiany do grupy elementów. Oszczędza to czas projektanta podczas zmiany całej makiety. Załóżmy, że stworzyliśmy makietę składającą się z 50 widoków, a klient chciał zmienić w nim kolor przycisków. W przypadku komponentów wystarczy wprowadzić zmianę do jednego obiektu, po czym nowy kolor zostanie zastosowany do wszystkich przycisków jednocześnie.
Aby utworzyć komponent, wystarczy zaznaczyć te elementy lub grupy elementów, z których chcemy go utworzyć, po czym kliknąć prawym przyciskiem myszy i wybrać <i>"Create Component" (lub Ctrl+Alt+K)</i>. Teraz tworząc kopię, uzyskujemy komponenty potomne. Wszystkie zmiany dotyczące rodzica zostaną przeniesione na komponenty od niego pochodzące.

![](/assets/img/posts/2023-01-16-uiux-tools/components.gif)

## Auto Layout
Funkcja <i>Auto Layout</i> jest jedną z najważniejszych i najczęściej używanych właściwości w Figmie, która odróżnia ją od innych narzędzi projektowych. Krótko mówiąc, <i>Auto Layout</i> pozwala na strukturyzację komponentów i ramek w sposób, który może automatycznie się rozszerzać lub zmniejszać, dzięki czemu obiekt złączony z innych obiektów dostosowuje się do wielkości jego zawartości lub też w inną stronę. <i>Auto Layout</i> pozwala na określenie kierunku ułożenia elementów (pionowo lub poziomo), pozwala także na określenie dynamicznego ustawiania odstępów, ograniczenia wielkości, szerokości, długości obiektów oraz automatyczne wyrównywanie położenia. Jeżeli znasz się na stylowaniu <i>CSS</i>, to możesz słusznie zauważyć pewne podobieństwo <i>Auto Layout</i> do <i>Flexbox</i.

Aby zastosować <i>Auto Layout</i> wystarczy wydzielić obiekty, które chcemy uzależnić od siebie, po czym wcisnąć skrót klawiszowy <i>Shift+A</i> albo wybrać opcję <i>Auto Layout</i> w prawym menu.

![](/assets/img/posts/2023-01-16-uiux-tools/auto-layout.gif)
## Prototypowanie

Funkcje prototypowania w Figmie umożliwiają tworzenie interaktywnych przepływów pomiędzy makietami, co przybliża makietę do prawdziwej aplikacji w porównaniu do zwykłych statycznych ekranów. Prototypy replikują sposób, w jaki użytkownicy mogą wchodzić w interakcję z zaprojektowanym interfejsem aplikacji. Możemy łączyć elementy na wybranym ekranie lub też poszczególne ekrany między sobą w celu utworzenia przepływu, czyli pełnej  interaktywnej ścieżki. Np. w przypadku makiety witryny e-Commerce, jesteśmy w stanie zamodelować za pomocą przepływów wszystkie możliwe interakcje użytkownika - tworzenie konta, dodawanie elementów do koszyka, wylogowania się itd.
Przepływ składa się z trzech części:
* Hotspot (punkt wejściowy) - to jest miejsce, w którym użytkownik rozpoczyna interakcję. Możemy utworzyć punkt wejściowy na dowolnym przycisku, ikonce lub nagłówku.
* Connection (połączenie) - strzałka, która łączy hotspot z miejscem docelowym. Zarówno interakcja, jak i animacja są określane przez połączenie.
* Destination (punkt wyjściowy) - miejsce docelowe, kolejny krok w przepływie, w którym kończy się połączenie.

Po utworzeniu połączenia można zdefiniować rodzaj interakcji, czyli jakie działanie uruchomi utworzony przepływ. Może to być naciśnięcie/najechanie myszką, wciśnięcie klawisza, interakcja w momencie puszczenia myszki lub wiele innych. Jest też możliwość zdefiniowania akcji, czyli w jaki sposób dany przepływ zostanie wykonany. Możemy wybrać spośród wielu różnych akcji, m.in. nawigacji, zmiany obiektu (interaktywny komponent), otwierania linku, przejścia wstecz lub też przewijania do poszczególnych miejsc.

![](/assets/img/posts/2023-01-16-uiux-tools/prototypowanie.png)

## Rozwiązania konkurencyjne wobec Figmy
### Sketch
Jest oprogramowaniem znanym większości projektantów interfejsu użytkownika. Od lat uznawany za złoty standard w projektowaniu makiet, jest docelowym konkurentem Figmy, jednak dostęp do niego mają wyłącznie użytkownicy korzystający z systemu macOS. Dodatkowo, by móc cieszyć się z jego pełnej wersji, musimy płacić pewną kwotę roczną.

**Różnica Figma a Sketch**

<style>
td,th {
   border-color: #611661;
   border-style: groove;
   border-width: 2px;
}
</style>

|       **Różnice**        |                                                                        **Figma**                                                                       |                                                            **Sketch**                                                            |
|:--------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------:|
|    Kompatybilność    |                                                              Przeglądarka internetowa                                                              |                                                    System operacyjny macOS                                                   |
|        Cennik        |                                             Wersja darmowa, professional, organization oraz enterprice                                             |                                   Jednorazowa wpłata albo opłata per edytor w Sketch Teams                                   |
|        Style         |                   Tworzenie style dla różnorodnych elementów, które mogą być mieszane i dopasowywane do innych zestawów elementów                  |                       Ma dwa typy stylów: tekst lub warstwa. Elementy są ustalane dla każdego ze styli                       |
| Symbole i komponenty |      Komponenty są przepływowe, gdy główny komponent jest zmieniany, to każda instancja utworzona na podstawie komponentu głównego się zmieni      |      Wszelkie modyfikacje wprowadzane na zakładce Symbols automatycznie odnoszą się do każdego wystąpienia tego symbolu      |
| Narzędzia wektorowe  | Vector Networks w Figmie pozwala projektantowi rysować wektorowe ścieżki w dowolnym kierunku bez konieczności połączenia się z punktem pierwotnym | Podczas korzystania z narzędzi wektorowych w Sketchu, projektant obowiązkowo musi połączyć koniec ciągu punktów z początkiem |
|       Pluginy        |                                 Wprowadzono w 2019 roku. Zachęca programistów do tworzenia większej liczby pluginów                                |                                        Oferuje większa liczbę pluginów od innych firm                                        |
|    Prototypowanie    |  Wbudowana integracja z Principle. Obsługuje overlays podczas łączenia obiektów oraz ma większa liczbę triggerów używanych podczas prototypowania  |                                Obsługuje większość zaawansowanych aplikacji do prototypowania                                |
|         Współpraca   |                              Oparta na chmurze, obsługuje wielu projektantów do pracy i edycji dokumentu jednocześnie                              |                     W 2021 roku wprowadzono możliwość współpracy różnych projektantów w tym samym czasie                     |

**Zalety Sketch wobec Figmy - według twórców Sketcha**
 1. Zawiera potężną natywną aplikację Mac.
 2. Pełny przepływ pracy w trybie offline.
 3. Użytkownik sam kontroluje, kto widzi jego pracę.
 4. Ścisła kontrola nadpisywania dla systemów projektowych.
 5. Otwarty format plików.
 6. Zaawansowane zarządzanie kolorami.
 7. Praca z lokalnymi dokumentami.
 8. Szablony obszaru roboczego.
 9. Brak limitu rozmiaru dokumentu (jedyne ograniczenie poprzez RAM).
 10. Rozliczenia bez niespodzianek.
 11. Kompletna platforma jedynie za 9$/miesiąc.
 12. Karta kredytowa nie jest wymagana do pełnego funkcjonowania bezpłatnego okresu próbnego.
 13. Niezalażność.


 **Zalety Figma wobec Sketch - według twórców Figmy**
 1. Szybsza dzięki chmurze.
 2. Multiplatformowa.
 3. Mniej znaczy więcej - używając Sketch musisz również korzystać z InVision, Abstract lub Zeplin. Figma ma to wszystko w sobie.
 4. Lepsza praca zespołowa - wszyscy współpracownicy w Sketch muszą mieć płatną subskrypcję. Funkcja współpracy w Sketch jest bardzo świeża i jej użycie, tak samo jak użycie całego oprogramowania Sketh, jest możliwe tylko na komputerach Mac.
 5. Lepsza wydajność dzięki 2D WebGL renderingu.
 6. Bardzo prosta migracja - import plików Sketch do Figmy automatycznie przekształca Symbole w Komponenty i utrzymuje warstwy w nienaruszonym stanie.

### PenPot
Jest pierwszą Open Source platformą do projektowania i prototypowania interfejsów. To bardzo świeża aplikacja dostępna w przeglądarce, której interfejs mocno przypomina interfejs konkurencyjnej Figmy. Jednak z tego względu, że technologia dopiero się rozwija, odczuwalny jest brak większości funkcjonalności:
* W PenPot nie ma możliwości utworzenia komponentów, czyli obiektów potomnych, które zmieniają się wraz z dokonanymi zmianami w komponencie rodzica.
* Brak Auto Layout'u.
* Brak pluginów (W Figmie mamy mnóstwo różnych pluginów wspomagających tworzenie makiet - np. Iconify, Unsplash itd.)

### Quant UX 
Tak samo jak w przypadku PenPot, mamy tu do czynienia z narzędziem Open Source dostępnym w przeglądarce. Interfejs narzędzia Quant UX jest zbliżony do interfejsu Figmy i pozwala tworzyć różne obiekty na podstawie kształtów. Wyróżnia się ogromnym wyborem wcześniej utworzonych widget'ów, możemy wykorzystać gotowe komponenty i na ich podstawie stworzyć makietę. Wśród gotowych widgetów mamy takie obiekty jak: przyciski BootStrap'owe, wykresy, checkbox, slider, date picker i wiele innych. Możemy utworzyć własny widget i dodać go do kolekcji, żeby potem re-użyć. Narzędzie Quant UX, w porównaniu do Figmy, mocno koncentruje się na interaktywności i testowaniu. Możemy włączyć tryb Symulacji, po czym wszystkie dodane widget'y będą klikalne, np. lista się rozwinie, checkbox'y można będzie zaznaczyć itd. Quant UX pozwala na pisanie skryptów w języku JavaScript, wprowadzając logikę i przekazanie danych pomiędzy obiektami makiety za pomocą Databinding'u. Testowanie w tym narzędziu możemy przeprowadzić za pomocą tak zwanej Heat Map, która pokazuje statystyki, w jakie miejsca w aplikacji użytkownicy klikają najrzadziej/najczęściej. Jeżeli zależy nam na szybkim utworzeniu makiety z wysoką interaktywnością elementów oraz możliwością przetestowania zachowania użytkowników, Quant UX może być dobrym rozwiązaniem.

## Zestaw materiałów do nauki z narzędzia Figma:

Kursy Figma na Udemy:

* [https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/](https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/)
* [https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/](https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/)

Tutoriale Figma na Youtube:

* [https://www.youtube.com/watch?v=kbZejnPXyLM](https://www.youtube.com/watch?v=kbZejnPXyLM)
* [https://www.youtube.com/watch?v=FTFaQWZBqQ8](https://www.youtube.com/watch?v=FTFaQWZBqQ8)
* [https://www.youtube.com/watch?v=Gu1so3pz4bA](https://www.youtube.com/watch?v=Gu1so3pz4bA)

Źródła:

* [https://www.figma.com/about/](https://www.figma.com/about/)
* [https://www.figma.com/pricing/](https://www.figma.com/pricing/)
* [https://www.youtube.com/watch?v=yzO31hMTkus&t=479s](https://www.youtube.com/watch?v=yzO31hMTkus&t=479s)
* [https://www.imaginarycloud.com/blog/figma-vs-sketch/](https://www.imaginarycloud.com/blog/figma-vs-sketch/)
* [https://kinsta.com/blog/figma-vs-sketch/](https://kinsta.com/blog/figma-vs-sketch/)
* [https://www.sketch.com/vs/figma/](https://www.sketch.com/vs/figma/)
* [https://www.figma.com/figma-vs-sketch/](https://www.figma.com/figma-vs-sketch/)
