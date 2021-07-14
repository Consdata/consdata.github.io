---
layout:    post
title:     "Pozycjonowanie zależne od scrolla"
date:      2019-02-26 08:00:00 +0100
published: true
lang: pl
author:    glipecki
image:     /assets/img/posts/2019-02-26-pozycjonowanie-zale-ne-od-scrolla/pozycjonowanie-scroll.webp
tags:
    - frontend
    - javascript
description: "Custom Elements to jedna z zestawu czterech specyfikacji występujących pod wspólną nazwą Web Components - wspólnie pozwalają one na tworzenie własnych typów elementów DOM."
---

Czasem zachodzi potrzeba uzależnienia pozycji elementu od scrolla okna, czy to na potrzeby przyklejenia w widocznym obszarze, czy też stworzenia efektu paralaksy lub niestandardowego flow nawigacji. Temat wydawałby się oczywisty, gdyby nie to, że celowo wprowadzimy sobie dodatkowe ograniczenia (co wcale nie jest takie niecodziennie, uwzględniając fantazję działów UI/UX ;-)).

## Podejście 1: tylko CSS
Mamy dwa sposoby przyklejenia elementu do ekranu wykorzystujące tylko CSS. Oba opierają się o zmianę pozycjonowania:

* `position: fixed`,
* `position: sticky`.

Oba też mają swoje problemy i ograniczenia.

Stosując pozycjonowanie fixed:
* musimy uwzględnić pozostawione przez niego miejsce w oryginalnym fragmencie drzewa DOM,
* jeżeli element będzie wyższy niż viewport to nie będziemy mieli możliwości obejrzeć niemieszczącej się zawartości,
* fixed zawsze tworzy nowy stacking context.

Stosując pozycjonowanie sticky:
* jeżeli element będzie wyższy niż viewport, to nie będziemy mieli możliwości obejrzeć niemieszczącej się zawartości,
* sticky zawsze tworzy nowy stacking context,
* sticky czasem może zaskoczyć swoim działaniem (przykładowo [issue w3c](https://github.com/w3c/csswg-drafts/issues/865)).

O ile uwzględnienie oderwanego przez fixed elementu w layoucie nie stanowi wyzwania, o tyle brak wsparcia dla przewijania treści i zmiana stacking context (co wpłynie np. na liczenie kolejności na osi z) mogą stanowić już zbyt duże ograniczenia.

W wielu przypadkach fixed lub sticky załatwią problem. Jeśli jednak potrzebujesz czegoś więcej, czytaj dalej.

## Podejście 2: JavaScript
„Nie ma takiej rzeczy, której bym nie napisał w JavaScript.” 😉

Przeglądarki oferują nam zdarzenie związane ze scrollowaniem treści. Na zdarzenie możemy nasłuchiwać przez zdefiniowanie własności `target.onscroll`, czy też bardziej elastycznie, dodając listener przez `target.addEventListner(’scroll’)`. Teoretycznie wystarczyłoby już tylko przeliczać pozycję przyklejanego elementu, obsłużyć przewijanie w dwóch kierunkach i nie zapomnieć o użyciu najmniej obciążającej metody przesuwania elementów po ekranie. Co może pójść źle? Sprawdźmy prosty przykład.

Implementujemy proste przeliczanie pozycji nasłuchując na zdarzenie scroll:

<iframe width="100%" height="300" src="//jsfiddle.net/gregorry/gof6we57/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

Uzyskany efekt:
{% include youtube.html movie="86dZ7HguQWY" %}

Okazuje się, że funkcjonalnie możemy uzyskać wszystko, czego potrzebujemy, jednak jakość rozwiązania nie jest zadowalająca. Gdy przyjrzymy się sprawie bliżej, zauważymy, że na różnych przeglądarkach mamy różne problemy z płynnym rysowaniem UI. Obserwujemy lekki pościg naszego elementu względem reszty strony - to stanowczo nie jest efekt, z którym chcemy być kojarzeni.

Możemy jeszcze raz przeanalizować nasze kody, przekonać się, że ani throttlowanie zdarzeń, ani przesuwanie transformem, ani nawet wymyślne funkcje wygładzające nic nie dają. Okazuje się, że odpowiedź jest równocześnie dobra i zła, dobra - bo z naszym kodem nie ma większych problemów; zła - bo tak po prostu działają przeglądarki, na co niespecjalnie mamy wpływ!

Całe zamieszanie wynika z tego, że większość nowoczesnych przeglądarek obsługuje rysowanie oraz scrollowanie w osobnych wątkach. W praktyce oznacza to, że pozycja strony oraz jej zawartość liczone są w różnych momentach. Brak synchronizacji na tych operacjach objawia się skakaniem przesuwanego elementu. O ile takie rozwiązanie ułatwia przeglądarkom uzyskiwać upragnione 60 fps przy renderowaniu, o tyle dla nas oznacza skreślenie tego rozwiązania z listy wartościowych.

## Co dalej?
Czy to oznacza, że jeśli rozwiązanie z pozycjonowaniem CSS oferuje za mało funkcjonalności, a na lag przy rysowaniu z JavaScript nie możemy sobie pozwolić, to musimy rozłożyć ręce? Oczywiście, że nie! Na początek chwyćmy się wyjaśnienia z poprzednich akapitów - problemem jest, że scroll viewportu i DOM strony rysowane są niezależnie, w różnych momentach czasu. Gdybyśmy jednak potrafili zapewnić, że obie te rzeczy będą się działy synchronicznie? O ile nie możemy do tego zmusić przeglądarki, o tyle możemy ją oszukać 😉

Załóżmy że:
* to nie przeglądarka odpowiada za przewijanie treści strony,
* scroll przeglądarki wyraża jedynie intencję, w którym miejscu strona ma się znajdować,
* faktyczne przesuwanie treści odbywa się w naszym kodzie,
* również w naszym kodzie znajduje się obsługa przesuwania przyklejonych elementów,
* obliczenia wykonujemy co żądanie klatki animacji.

Przy takich założeniach możliwe okazuje się uzyskanie płynnego przewijania i przyklejania elementów. Dodatkowo, proponowane rozwiązanie poza przyklejaniem pierwszy raz oferuje opcję realizacji paralaksy czy niestandardowych przejść strony (kto powiedział, że kolejne ekrany nie mają być po skosie lub na spirali ;-)).

## Rozwiązanie
Przykładowe rozwiązanie może wyglądać następująco:
* dotychczasową strukturę DOM opakowujemy we wrapper,
* wrapper pozycjonujemy jako fixed na cały ekran (`top, bottom, left, right` na 0),
    * to będzie nadrzędny element strony odpowiedzialny za prezentowanie viewport, w tym obsługę przewijania,
* obok wrappera definiujemy sztuczny element replikujący wysokość wrappera,
    * to będzie element odpowiedzialny za symulowanie wysokości strony, dzięki niemu przeglądarka będzie wyświetlała prawidłowy pasek przewijania i poprawnie rozgłaszała związane z nim zdarzenia,
* definiujemy metodę renderującą ekran co klatkę animacji,
    * odpowiada za faktycznie rysowanie pozycji elementów, zarówno standardowo przewijanej zawartości, jak i przyklejonych elementów,
* zawartość wrappera przewijamy zgodnie z bieżącym scrollem,
* przyklejony element przewijamy odwrotnie, kompensując przesunięcie wrappera.

Przykładowa implementacja

<iframe width="100%" height="300" src="//jsfiddle.net/gregorry/yatd97hv/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

Przedstawione rozwiązanie jest najprostszym z możliwych potwierdzających teoretyczne założenia.

W docelowym rozwiązaniu na pewno warto pomyśleć o rozdzieleniu funkcji pętli od faktycznego rysowania, wygładzaniu przesunięcia scrolla, dorzuceniu wskazówki `will-change` dla przesuwanych elementów, czy ogólnym sposobie na nasłuchiwanie na zmiany scrolla globalnie.

Po wprowadzeniu zmian nasz rozwiązanie prezentuje się znacznie lepiej:
{% include youtube.html movie="GqopRJ1vuC8" %}

## Sukces?
Samodzielna obsługa scrollowania może być kusząca przy realizacji niestandardowych przepływów ekranów, animacji, czy skomplikowanych interfejsów użytkownika. Zawsze jednak należy pamiętać, że przerzucamy na siebie ciężar obsługi czegoś, co jest robione dobrze przez każdą przeglądarkę. Czasem lepszym rozwiązaniem będzie znalezienie uproszczeń w wymaganiach, a czasem będziemy mogli wziąć na siebie taki trade-off 🙂

Czy ktoś stosuje takie podejścia? Tak, przykładem niech będzie apple.com, gdzie przewijane początkowo jest pionowe, następnie poziome i na końcu znowu pionowe 😉
{% include youtube.html movie="wMdNDHM2wrc" %}

## Przydatne linki
- [Scroll-linked effects @ MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects)
- [The stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [Własności pozycjonowania elementów drzewa DOM @ MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [What No One Told You About Z-Index](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/)
