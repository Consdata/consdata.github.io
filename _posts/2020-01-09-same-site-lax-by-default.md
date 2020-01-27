---
layout: post
title: SameSite=Lax by default coraz bliżej - czy jesteś gotowy?
published: true
date:      2020-01-09 08:00:00 +0100
author:    mpogorzelski
tags:
  - cookies
  - security
  - same-site
---

Same site cookies (*First-Part-Only*) to stworzony kilka lat temu mechanizm, który pozwala na zmniejszenie ryzyka ataków typu CSRF.
Zapewnia on, że dane ciasteczko może być wysyłane wyłącznie z żądaniami zainicjowanymi z domeny, dla której zostało zarejestrowane. 
Dokładniejszy opis znajdziesz pod tym adresem: <span class='no-breaking-word'>[https://web.dev/samesite-cookies-explained/](https://web.dev/samesite-cookies-explained/)</span>.

## Skoro atrybut SameSite istnieje tak długo dlaczego nagle stał się dla mnie ważny?

W maju 2019 twórcy przegladarki Chrome zapowiedzieli, że od wersji 80 (planowana wersja wydania to **4 lutego 2020**) dla wszystkich ciasteczek, które nie mają zdefiniowanego atrybutu *SameSite* domyślnie zostanie przyjęta wartość *Lax*. Mozilla i Microsoft również wyraziły chęć wprowadzenia tej zmiany we własnych przeglądarkach, więc możemy się spodziewać, że w nieodległej przyszłości takie zachowanie zostanie również zaimplementowane w Firefoxie i Edge'u.
W praktyce oznacza to, że ciasteczka które nie będą miały jawnie zdefiniowanego atrybutu *SameSite* nie będą wysyłane przy próbach żądań typu cross-site. Wyjątkiem od tej zasady będzie przypadek gdy użyjemy bezpiecznej metody HTTP (*GET*, *HEAD*, *OPTIONS*, *TRACE*) a wykonanie żądania będzie skutkowało tzw. *top-level navigation* (zmiana adresu w pasku przeglądarki). 

## Jak sprawdzić czy ta zmiana dotyczy mnie?
Jednym z najprostszych sposobów jest zajrzenie do narzędzi developerskich przeglądarki. Od wersji 77 przeglądarka Chrome, w przypadku problematycznych żądań, wyświetla w konsoli ostrzeżenie o następującej treści (jeżeli zauważyłeś takie ostrzeżenie w swoim systemie, będziesz musiał podjąć jakąś akcję):

`A cookie associated with a cross-site resource at (cookie domain) was set without the SameSite attribute. A future release of Chrome will only deliver cookies with cross-site requests if they are set with SameSite=None and Secure. You can review cookies in developer tools under Application>Storage>Cookies and see more details at https://www.chromestatus.com/feature/5088147346030592 and https://www.chromestatus.com/feature/5633521622188032`

Dodatkowo, przegladarki Chrome oraz Firefox umożliwiają ręczne włączenie opisywanego wyżej zachowania. 
W Chrome'ie należy ustawić wartość *Enabled* następujacym flagom: *SameSite by default cookies* (*chrome://flags/#same-site-by-default-cookies*) oraz *Cookies without SameSite must be secure* (*chrome://flags/#cookies-without-same-site-must-be-secure*)
W Firefoxie włączymy funkcjonalność wchodząc na adres *about:config* i ustawiając flagi *network.cookie.sameSite.laxByDefault* oraz *network.cookie.sameSite.noneRequiresSecure* na wartość *true*.

Weryfikując swoje systemy warto zwrócić uwagę na następujące elementy:
- treści umieszczone w tagu *<iframe>* (w taki sposób czesto zapewniana jest integracja z systemami zapewniajacymi mapy, video, kontrolki do płatności, kalendarze itp),
- zewnętrzne zasoby używane w naszym systemie (np: obrazki, zewnętrzne skrypty czy arkusze styli),
- wszelkie wejścia do twojego systemu (np: przekierowania z innych stron, publiczne usługi, formularze, które mogą być wysyłane z innych systemów),
- skoki do innych systemów (np: formularze płatności),
- wszelkie elementy wykorzystujące *SSO* (*single sign-on*).

## Jak się przygotować?

Niestety nie istnieje jeden prosty sposób, który rozwiąże wszystkie problemy. Jednak twórcy implementacji atrybutu *SameSite* przewidzieli ewentualne problemy
w istniejących systemach i dodali możliwość ustawienia mu wartości *None*. Takie ciasteczko będzie działało niemalże identycznie jak te przed opisywanymi zmianami -
jedyną różnicą jest konieczność zastosowania atrybutu *Secure* (w przeciwnym razie ciasteczko bedzie zawsze ignorowana przy żadaniach typu cross-site). Należy jednak pamiętać, 
że domyślne ustawienie *SameSite=Lax* zostało wprowadzone ze względów bezpieczeństwa i ustawiajac wartość atrybutu na *None* narażamy się na potencjalne ataki, więc tam
gdzie jest to możliwe powinniśmy unikać tego rozwiązania. Dodatkowo, wartość ta nie jest prawidłowo obsługiwana przez część przegladarek co może być problemem w niektórych systemach.
O części usecase'ów oraz rozwiązań możesz poczytać tutaj: [https://web.dev/samesite-cookie-recipes/](https://web.dev/samesite-cookie-recipes/).

## Przydatne linki

- [https://blog.chromium.org/2019/05/improving-privacy-and-security-on-web.html](https://blog.chromium.org/2019/05/improving-privacy-and-security-on-web.html)
- [https://blog.chromium.org/2019/10/developers-get-ready-for-new.html](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html)
- [https://www.chromium.org/updates/same-site](https://www.chromium.org/updates/same-site)
- [https://web.dev/samesite-cookies-explained/](https://web.dev/samesite-cookies-explained/)
- [https://web.dev/samesite-cookie-recipes/](https://web.dev/samesite-cookie-recipes/)
- [https://tools.ietf.org/html/draft-west-first-party-cookies-07](https://tools.ietf.org/html/draft-west-first-party-cookies-07)
- [https://www.chromestatus.com/feature/5088147346030592](https://www.chromestatus.com/feature/5088147346030592)
- [https://www.chromestatus.com/feature/5633521622188032](https://www.chromestatus.com/feature/5633521622188032)
