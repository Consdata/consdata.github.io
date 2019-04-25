layout:    post
title:     "Korzyści wynikające użycia Node Version Manager"
date:      2019-04-25 10:11:00 +0100
published: false
author:    Krzysztof Czechowski
tags:
    - node


# Pare zdań dla wygodnej zmiany wersji node


## Na początek, dlaczego warto pamiętać o nvm:

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