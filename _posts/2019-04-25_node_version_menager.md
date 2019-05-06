layout:    post
title:     "Korzyści wynikające użycia Node Version Manager"
date:      2019-05-10 14:00:00 +0100
published: true
author:    kczechowski
tags:
    - nvm
    - node


# Krótkie wprowadzenie do nvm
JavaScript i cały ekosystem z nim związany jest bardzo rozbudowany i wydaje się że wcale nie zamierza przestać się rozrastać. Można czasem usłyszeć, że tydzień w którym nie powstał nowy framework do JS’a jest tygodniem straconym. Masa bibliotek w różnych wersjach, kolejne języki rozbudowujące możliwości JavaScriptu i zmieniające to jak go postrzegamy np.: TypeScript czy CoffeeScript, do tego jeszcze Node.js i różne silniki w przeglądarkach i mamy całkiem sporą listę i coraz więcej pracy związanej z zarządzaniem tym wszystkim.

Dlatego tym bardziej warto zainteresować się rozwiązaniami które mają na celu ułatwić nam życie.
Jednym z takich rozwiązań jest nvm czyli Node Version Manager, który ma nam pomóc zarządzać wersjami Node.js.
Cel jest prosty umożliwić na szybkie i latwe przeskakiwanie między wersjami Node nie wymagające od nas uprawnień administratora.

## Zalety
\+ instalacja nie wymaga uprawnień root'a

\+ dostępne wiele wersji Node

\+ szybkie i wygodne zmiany wersji noda

\+ możliwość wykorzystania różnych wersji Node dla różnych projektów

## Wady

\- nvm manipuluje .bashrc

\- lag na starcie bash.


## Podstawowe polecenia nvm

- wylistowanie wszytskich dostępnych wersji

      nvm ls-remote

- instalacja najnowszej wersji Node

      nvm install Node

- instalacja konkretnej wersji Node (po instalacji aktualnie używaną wersją jest ta ostatnio zainstalowana)

      nvm install {VERSION}

- wylistowanie wszytskich zainstalowanych wersji

      nvm ls

- użycie konkretnej wersji

      nvm use Node {VERSION}

- uruchomienie aplikacji w wybranej wersji Node

      nvm run {VERSION} index.js

- usunięcie wybranej wersji Node

      nvm uninstall {VERSION}


### Ponadto nvmrc.
Warto pamiętać, że w ramach projektu możemy łatwo ustalić jak wersja Node ma być wykorzystywana, a nvm zajmie się resztą.
Do projektu wytarczy dodać plik nvmrc.

      9.0.1
i wystarczy

      nvm use

### Warto pamiętać że:
Nvm dodaje swoje 5 groszy do .bashrc co spowalnia dzialanie termianala, trzeba się zastanowić czy na środowisku produkcyjnym jest to koszt który chcemy ponosić.