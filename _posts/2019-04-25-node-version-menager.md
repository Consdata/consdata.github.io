layout:    post
title:     "Korzyści wynikające użycia Node Version Manager"
date:      2019-05-10 14:00:00 +0100
published: true
author:    kczechowski
tags:
    - nvm
    - node


# Krótkieee wprowadzenie do nvm
JavaScript i cały ekosystem z nim związany jest bardzo rozbudowany i wydaje się, że wcale nie zamierza przestać się rozrastać. Można czasem usłyszeć, że tydzień, w którym nie powstał nowy framework do JS’a jest tygodniem straconym. Masa bibliotek w różnych wersjach, kolejne języki rozbudowujące możliwości JavaScriptu zmieniające to, jak go postrzegamy np.: TypeScript czy CoffeeScript, do tego jeszcze Node.js oraz różne silniki w przeglądarkach. W rezultacie mamy całkiem sporą listę i coraz więcej pracy związanej z zarządzaniem tym wszystkim.

Dlatego tym bardziej warto zainteresować się rozwiązaniami, które mają na celu ułatwić nam życie.
Jednym z takich rozwiązań jest nvm, czyli Node Version Manager, który ma nam pomóc zarządzać wersjami Node.js.
Cel jest prosty umożliwić na szybkie i latwe przeskakiwanie między wersjami Node niewymagające od nas uprawnień administratora.

## Zalety
\+ instalacja nie wymaga uprawnień root'a,

\+ dostępne wiele wersji Node,

\+ szybkie i wygodne zmiany wersji noda,

\+ możliwość wykorzystania różnych wersji Node dla różnych projektów.

## Wady

\- nvm manipuluje .bashrc,

\- lag na starcie bash.


## Podstawowe polecenia nvm

- wylistowanie wszytskich dostępnych wersji

      nvm ls-remote

    Zwróci nam wynik w postaćl listy dostępnych wersji z zaznaczoną obecnie używaną.

      v0.1.14
      ...
      v10.15.0
      ->  v10.15.1
      v10.15.2
      ...
      v12.2.0

- instalacja najnowszej wersji Node

      nvm install Node

- instalacja konkretnej wersji Node (po instalacji aktualnie używaną wersją jest ta ostatnio zainstalowana).

      nvm install {VERSION}

- wylistowanie wszytskich zainstalowanych wersji

      nvm ls
      
    zwraca nam listę aktualnie zainstalowanych wersji
    
      v8.6.0
      ->  v10.15.1
      v12.1.2
      default -> 10.* (-> v10.15.1)
      node -> stable (-> v10.15.1) (default)
      stable -> 10.15 (-> v10.15.1) (default)


- użycie konkretnej wersji

      nvm use Node {VERSION}

- uruchomienie aplikacji w wybranej wersji Node

      nvm run {VERSION} index.js

- usunięcie wybranej wersji Node

      nvm uninstall {VERSION}


### Ponadto nvmrc.
Warto pamiętać, że w ramach projektu możemy łatwo ustalić jak wersja Node ma być wykorzystywana, a nvm zajmie się resztą.
Do projektu wystarczy dodać plik nvmrc.

      9.0.1

i wykonać polecenie

      nvm use

### Uwaga na koniec
Nvm zwiększa objętość pliku .bashrc co spowalnia działanie termianala, trzeba się zastanowić czy na środowisku produkcyjnym jest to koszt, który chcemy ponosić.