---
layout:    post
title:     Wszystko, co chcielibyście wiedzieć o fontach, ale baliście się zapytać
published: true
date:      2021-02-19 09:00:00 +0100
author:    pgrobelny
lang:      pl
image:     
tags:
    - font
    - czcionka
    - rem
    - woff
    - font-face
---


Osoby pracujące na frontendzie często mają do czynienia z fontami, czy to wrzucają je do projektu, czy po prostu zmieniają sposób, w jaki tekst wyświetla się na stronie.
Na pierwszy rzut oka może się wydawać, że to bajecznie proste.
Jest jednak kilka ważnych rzeczy, na które warto zwracać uwagę i być ich świadomym.

## Sposoby określania wielkości fontów (EM, REM, PX)

Zacznijmy od początku. Jak poprawnie zdefiniować wielkość fontów? W większości przypadków wyboru dokonujemy pomiędzy PX, EM a REM.
Przejdźmy do tego pierwszego.

Piksele są wygodne do definiowania, ponieważ każdy intuicyjnie rozumie jak one działają i jaką przestrzeń zajmują na stronie. Tworzenie animacji, nadawanie ramek czy tworzenie różnych innych elementów graficznych często wydaje nam się prostsze w px. Schody zaczynają się, kiedy będziemy chcieli być przyjaznym dla użytkownika i umożliwić mu zmianę wielkości fontów w przeglądarce (i chodzi tutaj o ustawienia fontów w ustawieniach, a nie funkcjonalność przybliżania i oddalania strony, ona nadal będzie działać poprawnie). Używając pikseli nie jesteśmy w stanie tego obsłużyć i zawsze będziemy nadpisywać preferencje użytkownika. A więc jak można rozwiązać ten problem? Z pomocą przychodzą nam jednostki względne.

Takimi jednostkami są właśnie EM i REM. Nazywamy je względnymi, ponieważ aby dowiedzieć się, jaka jest faktycznie ich wartość, należy spojrzeć, gdzie dana deklaracja się znajduje. W przypadku EM występuje dziedziczenie względem elementu nadrzędnego, a REM dziedziczy po roocie aplikacji. Przy pracy nad większymi projektami często faworyzuje się REM nad EM ze względu na prostotę w utrzymaniu. Przy pracy nad tymi jednostkami warto jednak zwrócić uwagę na kilka rzeczy.

Żeby wyliczyć, na ile ustawić wartość REM, aby odpowiadała konkretnej wartości w pikselach, weźmy przykład:
font-size domyślnie mamy 16px, a potrzebujemy nadać pewnemu elementowi wielkość 10px. Możemy skorzystać
z [internetowego kalkulatora](https://daniellamb.com/experiments/px-to-rem-calc/)
albo rozwiązać równanie, które
naprowadzi nas na poprawną wartość: 16px * x= 10px. Nie brzmi zachęcająco? Warto w takim razie zastanowić się, czy
faktycznie ważne jest, aby było to dokładnie 10px, ponieważ możemy przyjąć wartość 0.6rem, która może się okazać
dostatecznie bliska. Jeżeli nie godzimy się na takie przybliżanie i musimy trzymać się konkretnych wartości,
a korzystamy z preprocessora do CSS, warto napisać metodę, która policzy to za nas, przyjmując w parametrze docelową
wartość w px. Tworzenie zmiennych określających różne wartości REM zawierające w nazwie odniesienie do konkretnych wartość w PX nie jest dobrą
praktyką, ponieważ w przypadku zmiany wielości w root'cie aplikacji wszystkie te zmienne przestają mieć sens.

Przejdźmy jednak do wcześniej przytoczonego problemu z nadpisywaniem preferencji użytkownika dotyczących  wielkości fontów. Tak jak wcześniej wspomniałem, większość przeglądarek ma wartość domyślną fontu ustawioną na 16px. Jeżeli nadpisalibyśmy ją używając px narzucamy własne style ponad ustawienia użytkownika, ale jeżeli będziemy używać jednostek względnych – takiego problemu nie będzie. Przyjrzyjmy się pewnemu przykładowi:

![Przykład 1](/assets/img/posts/2021-02-01-wszystko-co-chcielibyscie-wiedziec-o-fontach-ale-baliscie-sie-zapytac/example1.png)

Na pierwszy rzut oka wszystko wydaje się takie samo, jedyną różnicą jest to, że po prawej stronie zadeklarowaliśmy wielkość fontu,
która jest taka sama jak domyślna. Po zmianie wielkości fontu w ustawieniach przeglądarki nagle widać różnicę:

![Przykład 2](/assets/img/posts/2021-02-01-wszystko-co-chcielibyscie-wiedziec-o-fontach-ale-baliscie-sie-zapytac/example2.png)

Na koniec jedna uwaga  dotyczącą używania pikseli. Na urządzeniach przenośnych piksele są innej wielkości, niż na standardowym monitorze. Mimo iż urządzenie ma większą rozdzielczość, przeglądarka traktują ją, jak gdyby była nawet kilkukrotnie mniejsza. Dzieje się tak, ponieważ ekran na telefonie mamy mały, a zagęszczenie pikseli wysokie. Powoduje to, że co na ekranie monitora jest czytelne, na ekranie komórki jest ledwo zauważalne. Na przykład, kiedy wejdziemy w przeglądarce Chrome w opcje developerskie i ustawimy, aby przeglądarka zmieniła wielkość okna i dopasowała się do iPhone'a X, wyświetli nam się rozdzielczość 375 x 812, gdy realna rozdzielczość urządzenia wynosi 1125 x 2436.

Więc jakie jest rozstrzygnięcie? Czy jesteśmy w stanie wybrać i pozostać przy tylko jednym sposobie określania wielkości? Nie, wszystko zależy od projektu, w jakim pracujemy, doboru narzędzi i makiet dostarczonych przez klienta. Racjonalnym wyborem często stają się jednostki względne, dzięki łatwiejszym możliwościom ich skalowania. W ten sposób szanujemy również użytkownika i pozwalamy mu na dostosowywanie fontów według jego potrzeb. Z kolei kiedy wiemy, że w projekcie będzie dużo elementów graficznych, związanych z animacjami, gdzie wielkość, czytelność fontów i możliwość ich powiększania schodzi na drugi plan – sensowniejszym wyborem staje się użycie px.

Warto też być świadomym, że łączenie obu jednostek nie zawsze jest złe. Czasami chcemy, aby różne elementy powiększały się razem z fontem, a czasami zostały stałe, niezależnie od wielkości elementów dookoła (na przykład wielkości ramek, cieni, czy czasem odstępów pomiędzy elementami, kluczowy jest tutaj kontekst).

## Rozszerzenia fontów

Przejdźmy teraz do rozszerzeń plików z fontami. Kiedy będziemy chcieli użyć na stronie innych fontów niż domyślne, będziemy musieli wrzucić do projektu plik z definicją fontu. Rozszerzeń takich plików jest sporo i często budzi to konsternację: wystarczy pojedynczy plik, czy może po jednym z każdego z rodzaju? Przed odpowiedzeniem na to pytanie przyjrzyjmy się popularnym rozszerzeniom:
- EOT (Embedded OpenType) – przestarzały już format, obsługiwany tylko i wyłącznie przez Internet Explorer. IE w wersji 9+ potrafi już odczytywać inne formaty, więc jeżeli nie zależy nam na starych wersjach IE, to nie musimy się martwić tym rozszerzeniem, tym bardziej, że często fonty o tym rozszerzeniu nie są kompresowane i zajmują więcej miejsca.
- TTF/OFT (TrueType) - fonty o tym rozszerzeniu powinny zawierać w sobie wszystkie możliwe grubości i odmiany danego kroju. Częściej jest on stosowany w programach graficznych, niż do wyświetlania tekstów na stronach internetowych. Może okazać się przydatny dla starszych przeglądarek, szczególnie mobilnych, ale z uwagi na brak kompresji pliki mogą ważyć więcej. OFT jest nowszą odmianą standardu, lecz specyfikację ma bardzo podobną. Jeżeli zależy nam głównie na aktualnych przeglądarkach możemy odpuścić sobie oba rozszerzenia.
- WOFF (Web Open Font Format) – jest to forma TTF, ale z dodaną kompresją i większym wsparciem przeglądarek. Aktualnie jest wspierany przez wszystkie przeglądarki i jest domyślnym wyborem dla używania zewnętrznych fontów w projektach.
- WOFF2 (Web Open Font Format 2) – jak po nazwie można się domyślić, jest ulepszoną wersją WOFF. Oferuje mniejsze wielkości plików i lepszą wydajność. Aktualnie jest wspierany przez wszystkie przeglądarki za wyjątkiem IE.

Dodając fonty do aplikacji możemy ograniczyć się tylko do WOFF i WOFF2, jeżeli chcemy wpierać tylko aktualne przeglądarki. Oferują one małe rozmiary plików, a przeglądarka dobrze sobie radzi z wyświetlaniem ich na stronie. Jeżeli na urządzeniach, na których aplikacja będzie uruchamiana brakuje dla nich wsparcia, warto zostać przy domyślnych systemowych fontach z uwagi na wydajność aplikacji. Jeżeli jednak chcemy rozszerzać wsparcie na tak wiele urządzeń, jak to możliwe i nie boimy się ich wspierania, możemy wtedy skorzystać z plików EOT i TTF/OTF.

## Dołączanie fontów do aplikacji

Na koniec przyjrzyjmy się sposobom dołączania fontów do projektu. Są różne możliwości, a kilka z nich,
razem z ich zaletami i wadami, przedstawiam poniżej:

**@Font-face**

Najbardziej znany i lubiany sposób definiowania nowych fontów, które chcemy użyć w projekcie. Tworzymy nowy plik i wrzucamy do niego ścieżki do fontów (najczęściej w formacie WOFF i WOFF2). Plik ma strukturę, w której definiujemy nazwę i ścieżki do fontów:
```css
@font-face {
  font-family: 'NowyFont';
  src: url('nowyFont.woff2') format('woff2'),
       url('nowyFont.woff') format('woff'),
}
```
Struktura jest czytelna, więc możemy łatwo ją modyfikować i dodawać kolejne fonty. Aplikacja nie czeka aż fonty zostaną załadowane, więc nie musimy się martwić, że wydłużamy czas ładowania aplikacji. Może to być poręczne, ale powoduje również pewne problemy, ponieważ przez to mamy często do czynienia z 'mrugnięciem fontu', czyli z szybką zmianą wyglądu tekstu. Są różne strategie radzenia sobie z tym przez przeglądarki. Najczęściej tekst jest na chwilę niewidzialny i jeżeli po pewnym czasie font nie zostanie załadowany, tekst się wyświetla, ale z użytym domyślnym fontem. W momencie kiedy font się załaduje, tekst 'wskakuje' we właściwy font. Im font więcej waży i im mamy gorszy transfer tym dłużej może to potrwać. Wszystkie żądania odbywają się niezależnie, więc trudno je razem zgrupować, aby mogły załadować się w tym samym momencie.

**font-display**

Na ratunek z pojawiającym się nagle tekstem przychodzi własność font-display: swap, którą możemy ustawić w naszym pliku @font-face. Dzięki niemu nie uświadczymy już dwóch mrugnięć (pojawienie się tekstu i zmiana fontu), a jednego: tekst pojawia się od razu i czeka, aż font zostanie załadowany. Zaletą tego rozwiania jest prostota w konfiguracji. Minusem jest to, że tak naprawdę niewiele nam to jeszcze daje.

**Wczytywanie fontu przed renderowaniem zawartości strony**

Innym sposobem radzenia sobie z ładowaniem fontów jest dołączanie do pliku html linku, wskazującego na font, z którego chcemy skorzystać:

```html
    <link rel="preload" href="https://fonts.gstatic.com/s/opensans/v13/k3k702ZOKiLJc3WVjuplzBampu5_7CjHW5spxoeN3Vs.woff2" as="font" type="font/woff2" crossorigin>
```
Rozwiązanie jest łatwe w implementacji, jeden link i mamy wszystko czego potrzebujemy. Nie musimy się martwić, że teksty na stronie będą źle wyglądać bez fontów. Rozwiązanie to może wydawać się bardzo dobre, za wyjątkiem jednej rzeczy. Przez to, że wczytujemy font wcześniej, opóźniamy wejście na stronę. Czas wejścia na stronę jest dłuższy, ponieważ załadowanie fontu ma wyższy priorytet i odbędzie się przed wyświetleniem aplikacji.

**Wykrywanie momentu załadowania fontów**

Innym rozwiązaniem, potrafiącym rozwiązać problemy, na które możemy napotkać podczas 'wskakujących fontów' jest używanie biblioteki pozwalającej wykryć moment (lub posługując się bezpośrednio CSS Font Loading API), w którym dany font, czy też wszystkie fonty, zostały już załadowane. Przeważnie używamy tego, aby nadać jakąś klasę na najwyższym elemencie struktury html, która poinformuje, że font został załadowany. Będzie to sygnał, który pozwoli nam zmienić dynamicznie wygląd aplikacji. Nie powinno się raczej mieszać javascriptu do zarządzania css, ale czasami nie ma innego rozwiązania. Szczególnie wtedy, kiedy musimy wiedzieć, czy font został już poprawnie załadowany, aby uzależnić od tego określone elementy aplikacji.


Oczywiście istnieją bardziej zaawansowane metody wczytywania fontów, które w inny sposób rozwiązują problemy migającego tekstu (często w sieci nazywane jako FOIT, kiedy mamy do czynienia z pojawiającym się fontem, lub FOUT, kiedy tekst zmienia nagle swój styl), lecz w zdecydowanej większość przypadków wyżej wymienione rozwiązania są w pełni wystarczające. Warto również zwrócić uwagę, że wsparcie fontów w przeglądarkach dynamicznie się zmienia, patrząc chociażby na kolejne wersji najpopularniejszych przeglądarek. Sprawia to, że warto śledzić zmiany, ponieważ prędzej czy później cała zawarta tutaj wiedza może się zdezaktualizować.


...i jeszcze jedna drobna kwestia, stanowiąca bardziej ciekawostkę. W artykule posługiwałem się pojęciem font, unikając słowa czcionka. Przyjęło się używać te słowa zamiennie, aczkolwiek, poprawnym słowem jest font, można też mówić czcionka komputerowa. Samo słowo czcionka oznacz kawałek metalu z pojedynczą literą służącą do dawnych metod drukarstwa. Jest to jednak mało istotne i nie ma to dużego znaczenia w komunikacji, a osoby, które nadmiernie zwracają na to uwagę można oskarżyć o snobizm :)
