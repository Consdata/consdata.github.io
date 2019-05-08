---
layout:    post
title:     "Korzyści wynikające użycia z Node Version Manager"
date:      2019-05-10 14:00:00 +0100
published: true
author:    kczechowski
tags:
    - nvm
    - node
---

## Krótkie wprowadzenie do nvm

JavaScript i cały ekosystem z nim związany jest bardzo rozbudowany i wydaje się, że wcale nie zamierza przestać się rozrastać. Można czasem usłyszeć, że tydzień, w którym nie powstał nowy framework do JS’a jest tygodniem straconym. Masa bibliotek w różnych wersjach, kolejne języki rozbudowujące możliwości JavaScriptu zmieniające to, jak go postrzegamy np.: TypeScript czy CoffeeScript, do tego jeszcze Node.js oraz różne silniki w przeglądarkach. W rezultacie mamy całkiem sporą listę i coraz więcej pracy związanej z zarządzaniem tym wszystkim.

Dlatego tym bardziej warto zainteresować się rozwiązaniami, które mają na celu ułatwić nam życie.
Jednym z nich jest nvm, czyli Node Version Manager, który ma nam pomóc zarządzać wersjami Node.js.
Cel jest prosty - umożliwić nam szybkie i łatwe przeskakiwanie między wersjami Node niewymagające uprawnień administratora.

## Zalety
\+ instalacja nie wymaga uprawnień root'a,

\+ dostęp do wielu wersji Node,

\+ szybkie i wygodne zmiany wersji noda,

\+ możliwość wykorzystania różnych wersji Node dla różnych projektów.

## Wady

\- nvm manipuluje .bashrc,

\- lag na starcie bash.


## Podstawowe polecenia nvm

- wylistowanie wszystkich dostępnych wersji

      nvm ls-remote

    Zwróci nam wynik w postaci listy dostępnych wersji z zaznaczoną obecnie używaną.

      v0.1.14
      ...
      v10.15.0
      ->  v10.15.1
      v10.15.2
      ...
      v12.2.0

- instalacja najnowszej wersji Node

      nvm install Node
      
    w rezultacie otrzymamy informacje jak poniżej
    
      $ nvm install node
      Downloading and installing node v12.2.0...
      Downloading https://nodejs.org/dist/v12.2.0/node-v12.2.0-linux-x64.tar.xz...
      ######################################################################### 100,0%
      Computing checksum with sha256sum
      Checksums matched!
      Now using node v12.2.0 (npm v6.9.0)

- instalacja konkretnej wersji Node (po instalacji aktualnie używaną wersją jest ta ostatnio zainstalowana)

      nvm install {VERSION}
      
    tu rezultat wygląda bardzo podobnie
      
      $ nvm install 8.6.0
      Downloading and installing node v8.6.0...
      Downloading https://nodejs.org/dist/v8.6.0/node-v8.6.0-linux-x64.tar.xz...
      ######################################################################### 100,0%
      Computing checksum with sha256sum
      Checksums matched!
      Now using node v8.6.0 (npm v5.3.0)

- wylistowanie wszystkich zainstalowanych wersji

      nvm ls

    zwraca nam listę aktualnie zainstalowanych wersji

      v10.15.0
      ->  v10.15.1
      v10.15.2

- użycie konkretnej wersji

      nvm use Node {VERSION}
      
    nvm potwierdzi nam zmianę wersji
    
      $ nvm use 12.2.0
      Now using node v12.2.0 (npm v6.9.0)
  

- uruchomienie aplikacji w wybranej wersji Node

      nvm run {VERSION} index.js
      
    tu również nie będziemy mieć wątpliwości z jaką wersją uruchomiliśmy aplikację
    
      $ nvm run 8.6.0 index.js 
      Running node v8.6.0 (npm v5.3.0)


- usunięcie wybranej wersji Node

      nvm uninstall {VERSION}
      
    potwierdzenie usunięcia
    
      $ nvm uninstall 8.6.0
      Uninstalled node v8.6.0


### Ponadto .nvmrc.
Warto pamiętać, że w ramach projektu możemy łatwo ustalić jak wersja Node ma być wykorzystywana, a nvm zajmie się resztą.
Do projektu wystarczy dodać plik nvmrc.

      9.0.1

i wykonać polecenie

      nvm use

### Uwaga na koniec
Nvm zwiększa objętość pliku .bashrc co spowalnia działanie terminala, trzeba się zastanowić czy na środowisku produkcyjnym jest to koszt, który chcemy ponosić.

### Link do projektu
<https://github.com/nvm-sh/nvm/blob/master/README.md>
