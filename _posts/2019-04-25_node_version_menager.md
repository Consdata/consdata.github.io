layout:    post
title:     "Korzyści wynikające użycia Node Version Manager"
date:      2019-04-25 10:11:00 +0100
published: false
author:    kczechowski
tags:
    - nvm
    - node


# Krótkie wprowadzenie do nvm
JavaScript i cały ekosystem z nim związany jest bardzo rozbudowany i wydaje się że wcale nie zamierza przestać, można czasem usłyszeć że tydzień w którym nie powstał nowy framework do JS’a jest tygodniem straconym. Masa bibliotek w różnych wersjach, kolejne języki rozbudowujące możliwości JavaScriptu i zmieniające to jak go postrzegamy np.: TypeScript czy CoffeeScript, do tego jeszcze Node.js i różne silniki w przeglądarkach i mamy całkiem sporą listę i coraz więcej pracy związanej z zarządzaniem tym wszystkim.

Dlatego tym bardziej warto zainteresować się rozwiązaniami które mają na celu ułatwić nam życie i prace z tym związane.
Jednym z takich rozwiązań jest nvm czyli Node Version Manager, który ma nam pomóc zarządzać wersjami node.js.
Cel jest prosty umożliwić na szybkie i latwe przeskakiwanie między wersjami node ni wymagając od nas uprawnien administratora.

## Poniżej najważniejsze zalety i wady:

### Zalety:
\+ instalacja nie wymaga uprawnień root'a

\+ dostępne wiele wersji node

\+ szybkie i wygodne zmiany wersji noda

\+ możliwość wykorzystania różnych wersji node dla różnych projektów

### Wady:

\- nvm manipuluje .bashrc

\- lag na starcie bash.


## Co i jak możemy zrobić:

- wylistowanie wszytskich dostępnych wersji

      nvm ls-remote

- instalacja najnowszej wersji node

      nvm install node

- instalacja konkretnej wersji node (po instalacji aktualnie używaną wersją jest ta ostatnio zainstalowana)

      nvm install {VERSION}

- wylistowanie wszytskich zainstalowanych wersji

      nvm ls

- użycie konkretnej wersji

      nvm use node {VERSION}

- uruchomienie aplikacji w wybranej wersji node

      nvm run {VERSION} index.js

- usunięcie wybranej wersji node

      nvm uninstall {VERSION}


### Ponadto nvmrc.
Warto pamiętać że w ramach projektu możemy łatwo ustalić jak wersja node ma być wykorzystywana, a nvm zajmie się resztą.
Do projektu wytarczy dodać plik nvmrc.

      9.0.1
i wystarczy

      nvm use

### Warto pamiętać że:
Nvm dodaje swoje 5 groszy do .bashrc co spowalnia dzialanie termianala, trzeba się zastanowić czy na środowisku produkcyjnym jest to koszt ktory chcemy ponosić.