---
layout:    post
title:     Dostępność w PDF - dokumenty bez barier
description: "PDF (Portable Document Format) to jeden z najczęściej wykorzystywanych formatów do prezentacji tekstu, grafik, tabel czy formularzy. Jego popularność przynosi jednak konkretne pytania dotyczące dostępności., Czy każdy tego typu dokument możemy nazwać dostępnym? Czy będzie on dostosowany pod kątem różnego typu ograniczeń i niepełnosprawności ruchowych, sensorycznych, oraz kognitywnych. Czy jego przygotowanie umożliwia takim osobom samodzielne korzystanie z niego? Wymogi te są określane poprzez wytyczne WCAG."
date:      2025-04-28T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: khoffman
image: /assets/img/posts/2025-04-28-dostepnosc-w-pdf-dokumenty-bez-barier/thumbnail.webp
tags:
- WCAG
---
PDF (Portable Document Format) to jeden z najczęściej wykorzystywanych formatów do prezentacji tekstu, grafik, tabel czy formularzy. Jego popularność przynosi jednak konkretne pytania dotyczące dostępności., Czy każdy tego typu dokument możemy nazwać dostępnym? Czy będzie on dostosowany pod kątem różnego typu ograniczeń i niepełnosprawności ruchowych, sensorycznych, oraz kognitywnych. Czy jego przygotowanie umożliwia takim osobom samodzielne korzystanie z niego? Wymogi te są określane poprzez wytyczne WCAG.

Warto przy tym zaznaczyć, że - przy użyciu wyłącznie narzędzi asystujących oraz bez konieczności skorzystania ze wsparcia osób trzecich - użytkownicy z niepełnosprawnościami powinni mieć możliwość przyswojenia treści z danego dokumentu w takim samym stopniu, co użytkownicy bez niepełnosprawności. Co więc powinno się  brać pod uwagę, aby tworzyć dokumenty PDF bez barier?

## Co dokładnie oznacza “dostępność” dokumentów - krótko o wytycznych WCAG

Kryteria dostępności dokumentów i stron internetowych dla osób z różnymi rodzajami niepełnosprawności zostały określone w wytycznych WCAG. Obejmują one cztery główne kategorie: funkcjonalność, kompatybilność, postrzegalność i zrozumiałość. Do stosowania tego standardu zobowiązane są przede wszystkim instytucje publiczne, ale jego wdrożenie przyniesie korzyści klientom każdego z sektorów.

Więcej informacji na temat tego, czym jest WCAG, jaka jest historia tego standardu oraz szczegółowe informacje dotyczące tego, jakie instytucje powinny go wdrożyć i kto na tym skorzysta, znajdziecie w naszym [artykule wprowadzającym do tematu WCAG](https://consdata.com/pl/blog/biznesowy/co-to-jest-wcag-i-dlaczego-nalezy-wdrozyc-ten-standard-w-swojej-organizacji).


## Tworzenie dostępnych dokumentów PDF
Standard PDF/UA (Universal Accessibility), stworzony przez Międzynarodową Organizację Normalizacyjną (ISO) oraz wytyczne Web Content Accessibility Guidelines (WCAG) opracowane przez organizację W3C określają zasady tworzenia dokumentów umożliwiające każdej osobie dostęp do informacji zawartych w dokumencie PDF.

Przyjrzyjmy się kilku z tych zasad.


### Struktura dokumentu
Struktura dokumentu powinna być zaprojektowana w sposób zapewniający jej właściwą reprezentację w końcowym pliku PDF. Oznacza to, że wszystkie elementy treści, takie jak nagłówki, akapity, listy czy tabele, powinny być odpowiednio oznaczone zgodnie z regułami semantycznymi właściwymi dla używanego narzędzia. W zależności od technologii tworzenia dokumentu, należy stosować odpowiednie techniki, aby zapewnić prawidłową hierarchię i logiczną strukturę treści. Na przykład:
- W edytorach tekstu, takich jak Microsoft Word czy LibreOffice Writer, należy stosować odpowiednie style nagłówków i akapitów, które pozwalają na poprawne rozpoznanie struktury dokumentu.
- W dokumentach tworzonych w LaTeX-u, ważne jest stosowanie odpowiednich znaczników, takich jak `\chapter`, `\section`, które jednoznacznie definiują hierarchię i semantykę treści.
- W dokumentach HTML kluczowe jest stosowanie semantycznych tagów, takich jak `<h1>`, `<p>`, `<ul>`, `<table>`, które określają rolę poszczególnych elementów w strukturze dokumentu.
- W przypadku narzędzi opartych na XML, jak Apache FOP, należy korzystać z odpowiednich ról i atrybutów semantycznych, np. `role="H1"`, które pomagają w prawidłowym przetwarzaniu struktury dokumentu w finalnym pliku PDF.
- Jeśli dokument jest tworzony za pomocą Adobe Acrobat Pro, ważne jest, aby prawidłowo stosować tagi strukturalne, takie jak `<P>`, `<L>`, `<Table>`, które pozwalają na zachowanie logicznej struktury treści i umożliwiają prawidłowe odczytywanie dokumentu przez technologie asystujące.

Niezależnie od wybranego narzędzia, istotne jest, aby finalny dokument PDF wiernie odzwierciedlał strukturę treści, co zapewni prawidłowe jego przetwarzanie przez czytniki ekranu i inne technologie asystujące.

### Alternatywne opisy tekstowe dla elementów nietekstowych
Grafiki istotne dla treści, takie jak wykresy lub diagramy, powinny mieć alternatywny tekst opisujący ich zawartość dla użytkowników czytników ekranu, a linki w dokumencie powinny być odpowiednio oznaczone, na przykład „Pobierz PDF” zamiast „Kliknij tutaj”, aby użytkownicy wiedzieli, dokąd prowadzą.

### Kolor i kontrast
W dokumentach PDF kluczowe jest utrzymanie właściwego kontrastu pomiędzy tekstem a tłem, co ułatwia czytanie osobom z problemami ze wzrokiem. Można go obliczyć w następujący sposób:

Najpierw obliczamy luminancję każdego z kolorów (tekstowego i tła) za pomocą wzoru:
```
L = 0,2126 ⋅ R + 0,7152 ⋅ G + 0,0722 ⋅ B
```
gdzie `R`, `G` i `B` to wartości koloru w przestrzeni RGB. 

Następnie, stosunek kontrastu obliczamy według wzoru podstawiając wcześniej otrzymane wyniki: 
```
Stosunek kontrastu = (L_jaśniejszy + 0.05) / (L_ciemniejszy + 0.05)
```
zgodnie z zaleceniami WCAG, minimalny stosunek kontrastu powinien wynosić 4,5:1 dla tekstu standardowego oraz 3:1 dla dużego tekstu (np. nagłówków).

Więcej informacji: [https://www.w3.org/TR/WCAG20-TECHS/G18.html](https://www.w3.org/TR/WCAG20-TECHS/G18.html)

Dodatkowo należy unikać stosowania jedynie koloru jako sposobu komunikacji (np. czerwony napis na zielonym tle), ponieważ osoby z daltonizmem mogą mieć trudności w odróżnianiu takich elementów.

### Ustawienia dokumentu dla lepszej dostępności
Aby umożliwić czytnikom ekranu prawidłowe odczytywanie tekstów w różnych językach, ważne jest oznaczenie języka zarówno dla całego dokumentu, jak i poszczególnych fragmentów tekstu, które są w innych językach. Dzięki temu czytnik ekranu może przełączyć się na odpowiedni syntezator mowy, zapewniając poprawną wymowę. Podanie tytułu dokumentu może pomóc użytkownikowi w jego zlokalizowaniu i zidentyfikowaniu.

### Unikanie migających elementów
Migające lub szybko zmieniające się elementy w dokumentach mogą powodować niepożądane reakcje, takie jak ataki epilepsji, szczególnie u osób wrażliwych na światło. W związku z tym, aby zminimalizować ryzyko, częstotliwość ich migotania nie powinna przekraczać 3 Hz.

### Multimedia w PDF
W przypadku dokumentów, które zawierają multimedia, takie jak filmy lub nagrania dźwiękowe, kluczowe jest dodanie napisów lub transkrypcji. Dzięki temu osoby niesłyszące lub niedosłyszące mają możliwość korzystania z treści dźwiękowych i wideo. Zgodnie z zasadami WCAG 2.1, wszystkie nagrania audio w zsynchronizowanych multimediach muszą mieć napisy rozszerzone, chyba że stanowią one alternatywę dla tekstu i są w ten sposób oznaczone.

### Ułatwienia dostępu dla osób z trudnościami w nauce
Wsparcie dla osób z trudnościami w nauce i ograniczeniami poznawczymi polega na używaniu prostych, jasnych zwrotów oraz unikaniu skomplikowanego języka. Struktura dokumentu powinna być uporządkowana i spójna, z jasno wyodrębnionymi tytułami oraz sekcjami. Ponadto, pomocne mogą okazać się listy numerowane, tabele oraz różne inne elementy wspierające naukę.

## Czy nasz dokument PDF jest dostępny?
Nawet przestrzegając norm i zasad, na pierwszy rzut oka trudno ocenić czy dany dokument PDF jest w pełni dostępny. Niestety nie istnieje oficjalne przeznaczone do tego narzędzie stworzone przez komisję ISO, ale dostępne są zarówno płatne, jak i bezpłatne aplikacje, które przychodzą nam z pomocą, oferując możliwość przeprowadzenia audytu pod kątem dostępności i na jego podstawie utworzenia raportu, a w przypadku niektórych możliwość ich edycji.

### Adobe Acrobat Pro DC
Jest przykładem jednego z najpopularniejszych płatnych narzędzi do edytowania i sprawdzania dostępności plików PDF. Posiada wbudowane narzędzie "Accessibility Checker", które analizuje dokumenty i wskazuje problemy związane z dostępnością. Pozwala na sprawdzenie struktury dokumentu i zastosowanych znaczników, tekstów alternatywnych dla obrazów czy kontrastu. Przy użyciu tego narzędzia jesteśmy w stanie edytować dokument pod kątem dostępności.

![Widok narzędzia Accessibility Checker w Adobe Reader](/assets/img/posts/2025-04-28-dostepnosc-w-pdf-dokumenty-bez-barier/AdobeAC.webp)


### PAC
PAC jest darmowym narzędziem badającym dostępność dokumentów PDF pod kątem zarówno WCAG i PDF/UA. Daje możliwość podglądu struktury weryfikowanego dokumentu oraz tworzenie podsumowań i szczegółowych raportów błędów wraz ze wskazaniem ich wystąpienia.

![Widok raportu narządzia PAC](/assets/img/posts/2025-04-28-dostepnosc-w-pdf-dokumenty-bez-barier/PAC.webp)

## Jak działają czytniki ekranu w kontekście plików PDF?
Czytniki ekranu to programy wspierające osoby niewidome i słabowidzące w odczytywaniu tekstu wyświetlanego na ekranie komputera. Współpracują z jego systemem operacyjnym, przekształcając informacje w mowę lub alfabet Braille’a tym samym umożliwiając użytkownikom interakcję z komputerem i korzystanie z różnych programów i aplikacji. Czytnik ekranu może odczytać dokument PDF tylko wtedy, gdy jest on odpowiednio przygotowany pod kątem dostępności.

Szczególnie ważne jest wspomniane wyżej prawidłowe i logiczne otagowanie elementów dokumentu, ponieważ są one interpretowane przez czytnik tworząc hierarchię, która umożliwia użytkownikom wygodne nawigowanie po dokumencie i zrozumienie jego zawartości. Oprócz odpowiedniej struktury konieczne jest dodanie alternatywnych tekstów dla obrazów, wykresów czy innych elementów graficznych, aby osoby niewidome mogły zrozumieć zawartość dokumentu. Bez takich opisów czytnik ekranu pominie grafikę lub odczyta jedynie jej nazwę pliku, co nie dostarczy żadnych wartościowych informacji.

Najpopularniejsze czytniki ekranu:
- **Windows**: NVDA (darmowy), JAWS (komercyjny), Narrator (wbudowany)
- **MacOS**: VoiceOver (wbudowany)
- **Linux**: Orca (darmowy, używany w środowisku GNOME)
- **Urządzenia mobilne**: VoiceOver (iOS), TalkBack (Android)

Chociaż istnieją narzędzia do automatycznego sprawdzania dostępności plików PDF, warto również przetestować dokument przy użyciu czytnika ekranu. Tylko w ten sposób można upewnić się, że wszystkie elementy są poprawnie odczytywane i dokument jest w pełni użyteczny dla osób korzystających z technologii wspomagających.

Więcej na temat testowania urządzeń pod kątem dostępności przy użyciu różnych rodzajów czytników ekranu dowiecie się z naszego artykułu o [testowaniu dostępności WCAG](https://consdata.com/pl/blog/biznesowy/testowanie-dostepnosci-wcag).

## Podsumowanie
Decydując się na zapewnienie dostępności naszym dokumentom PDF, oprócz spełniania wymogów prawnych, powinniśmy kierować się także chęcią umożliwienia osobom z niepełnosprawnościami pełnego i samodzielnego dostępu do treści.

Ważne jest, aby pamiętać o obowiązujących zasadach ich tworzenia, o kompleksowym podejściu w momencie weryfikacji dostępności przy użyciu stworzonych w tym celu narzędzi oraz technologii wspomagających wykorzystywanych przez osoby niepełnosprawne takich jak czytniki ekranowe. W ten sposób możemy tworzyć dokumenty PDF dostępne dla wszystkich użytkowników i wyeliminować bariery w dostępie do informacji.