---
layout:    post
title:     Dostępność w PDF - dokumenty bez barier
description: ""
date:      2025-03-27T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: khoffman
image: /assets/img/posts/2025-03-27-dostepnosc-w-pdf-dokumenty-bez-barier/thumbnail.webp
tags:
- WCAG
---
Dokumenty PDF (Portable Document Format) to jeden z najczęściej używanych formatów do prezentacji tekstu, grafik, tabel czy formularzy. Wspominając o ich popularność, pojawia się pytanie, czy każdy tego typu dokument możemy nazwać dostępnym dla wszystkich w rozumieniu zespołu cech i funkcji umożliwiających osobom z różnymi niepełnosprawnościami lub ograniczeniami korzystanie z niego? Takie osoby powinny, bez pomocy innych, w wydajny sposób czerpać z treści tego typu dokumentów równie dużo co osoby bez niepełnosprawności. Co powinniśmy brać pod uwagę, chcąc tworzyć dokumenty PDF bez barier?
## Tworzenie dostępnych dokumentów PDF
Standard PDF/UA (Universal Accessibility), stworzony przez Międzynarodową Organizację Normalizacyjną (ISO) oraz wytyczne Web Content Accessibility Guidelines (WCAG) opracowane przez organizację W3C określają zasady tworzenia dokumentów umożliwiające każdej osobie dostęp do informacji zawartych w dokumencie PDF. Przyjrzyjmy się kilku z tych zasad.
### Struktura dokumentu
Dostępne pliki PDF powinny mieć odpowiednio określoną strukturę dokumentu z nagłówkami, akapitami i tabelami, co pozwala czytnikom ekranu zrozumienie przepływu treści.
- Wszystkie znaczące treści powinny być oznaczone za pomocą tagów
- Tagi w całej utworzonej strukturze powinny odzwierciedlać logiczną kolejność odczytu dokumentu oraz ich przeznaczenie (np. nagłówek - `<h1>`, lista  `<l>`, paragraf `<p>`)
- Do oznaczenia elementów ozdobnych (np. numery stron, grafiki dekoracyjne) nie powinny być używane tagi wykorzystywane dla treści
### Alternatywne opisy tekstowe dla elementów nietekstowych
Grafiki istotne dla treści, takie jak wykresy lub diagramy, powinny mieć alternatywny tekst opisujący ich zawartość dla użytkowników czytników ekranu, a linki w dokumencie powinny być odpowiednio oznaczone, na przykład „Pobierz PDF” zamiast „Kliknij tutaj”, aby użytkownicy wiedzieli, dokąd prowadzą.
### Kolor i kontrast
W dokumentach PDF kluczowe jest utrzymanie właściwego kontrastu pomiędzy tekstem a tłem, co ułatwia czytanie osobom z problemami ze wzrokiem. Zgodnie z zaleceniami WCAG, minimalny stosunek kontrastu powinien wynosić 4,5:1 dla tekstu standardowego oraz 3:1 dla dużego tekstu (np. nagłówków). Trzeba unikać stosowania jedynie koloru jako sposobu komunikacji (np. czerwony napis na zielonym tle), ponieważ osoby z daltonizmem mogą mieć trudności w odróżnianiu takich elementów.
### Ustawienia dokumentu dla lepszej dostępności
Ustawienie języka dokumentu PDF umożliwia niektórym czytnikom ekranu przełączenie bieżącego syntezatora mowy na odpowiedni język, umożliwiając poprawną wymowę treści w różnych językach. Podanie tytułu dokumentu może pomóc użytkownikowi w jego zlokalizowaniu i zidentyfikowaniu.
## Czy nasz dokument PDF jest dostępny?
Nawet przestrzegając norm i zasad, na pierwszy rzut oka trudno ocenić czy dany dokument PDF jest w pełni dostępny. Niestety nie istnieje oficjalne przeznaczone do tego narzędzie stworzone przez komisję ISO, ale dostępne są zarówno płatne, jak i bezpłatne aplikacje, które przychodzą nam z pomocą, oferując możliwość przeprowadzenia audytu pod kątem dostępności i na jego podstawie utworzenia raportu, a w przypadku niektórych możliwość ich edycji.
### Adobe Acrobat Pro DC
Jest przykładem jednego z najpopularniejszych płatnych narzędzi do edytowania i sprawdzania dostępności plików PDF. Posiada wbudowane narzędzie "Accessibility Checker", które analizuje dokumenty i wskazuje problemy związane z dostępnością. Pozwala na sprawdzenie struktury dokumentu i zastosowanych znaczników, tekstów alternatywnych dla obrazów czy kontrastu. Przy użyciu tego narzędzia jesteśmy w stanie edytować dokument pod kątem dostępności.

![Widok narzędzia Accessibility Checker w Adobe Reader](/assets/img/posts/2025-03-27-dostepnosc-w-pdf-dokumenty-bez-barier/AdobeAC.webp)


### PAC
PAC jest darmowym narzędziem badającym dostępność dokumentów PDF pod kątem zarówno WCAG i PDF/UA. Daje możliwość podglądu struktury weryfikowanego dokumentu oraz tworzenie podsumowań i szczegółowych raportów błędów wraz ze wskazaniem ich wystąpienia.

![Widok raportu narządzia PAC](/assets/img/posts/2025-03-27-dostepnosc-w-pdf-dokumenty-bez-barier/PAC.webp)

## Jak działają czytniki ekranu w kontekście plików PDF?
Czytniki ekranu to programy wspierające osoby niewidome i słabowidzące w odczytywaniu tekstu wyświetlanego na ekranie komputera. Współpracują z jego systemem operacyjnym, przekształcając informacje w mowę lub alfabet Braille’a tym samym umożliwiając użytkownikom interakcję z komputerem i korzystanie z różnych programów i aplikacji. Czytnik ekranu może odczytać dokument PDF tylko wtedy, gdy jest on odpowiednio przygotowany pod kątem dostępności. Szczególnie ważne jest wspomniane wyżej prawidłowe i logiczne otagowanie elementów dokumentu ponieważ są one interpretowane przez czytnik tworząc hierarchię, która umożliwia użytkownikom wygodne nawigowanie po dokumencie i zrozumienie jego zawartości. Oprócz odpowiedniej struktury konieczne jest dodanie alternatywnych tekstów dla obrazów, wykresów czy innych elementów graficznych, aby osoby niewidome mogły zrozumieć zawartość dokumentu. Bez takich opisów czytnik ekranu pominie grafikę lub odczyta jedynie jej nazwę pliku, co nie dostarczy żadnych wartościowych informacji.
Najpopularniejsze czytniki ekranu:
- **Windows**: NVDA (darmowy), JAWS (komercyjny), Narrator (wbudowany)
- **MacOS**: VoiceOver (wbudowany)
- **Linux**: Orca (darmowy, używany w środowisku GNOME)
- **Urządzenia mobilne**: VoiceOver (iOS), TalkBack (Android)

Chociaż istnieją narzędzia do automatycznego sprawdzania dostępności plików PDF, warto również przetestować dokument przy użyciu czytnika ekranu. Tylko w ten sposób można upewnić się, że wszystkie elementy są poprawnie odczytywane i dokument jest w pełni użyteczny dla osób korzystających z technologii wspomagających.
## Podsumowanie
Decydując się na zapewnienie dostępności naszym dokumentom PDF, oprócz spełniania wymogów prawnych, powinniśmy kierować się także chęcią umożliwienia osobom z niepełnosprawnościami pełnego i samodzielnego dostępu do treści. Ważne jest, aby pamiętać o obowiązujących zasadach ich tworzenia, o kompleksowym podejściu w momencie weryfikacji dostępności przy użyciu stworzonych w tym celu narzędzi oraz technologii wspomagających wykorzystywanych przez osoby niepełnosprawne takich jak czytniki ekranowe. W ten sposób możemy tworzyć dokumenty PDF dostępne dla wszystkich użytkowników i wyeliminować bariery w dostępie do informacji.