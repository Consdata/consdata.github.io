---
layout:    post
title:     "Czy wiesz, jak zarządzać wersjami w package.json?"
date:      2023-03-03T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2023-03-30-zarzadzanie-wersjami-w-package-json/keyboard.jpg
tags:
- package.json
- npm
---
`package.json` jest plikiem, który opisuje każdy projekt oparty o Node.js. Jedną z jego najważniejszych ról jest przechowywanie informacji o zależnościach projektu. 
Wersję zależności można wskazać na kilka sposobów używając do tego operatorów - ten wpis przybliża ich znaczenie. Większość operatorów jest przydatna, jeżeli zależna paczka stosuje semantyczne wersjonowanie (major.minor.patch).

## Operatory `>=`, `>`, `=`, `<`, `<=`, `||`
- `>=1.6.7` oznacza wersje od 1.6.7 w górę,
- `>=1.6.7 <2.0.0` wersje od 1.6.7 do 2.0.0, bez 2.0.0,
- `<=2.0.0` wersje do 2.0.0, włącznie z 2.0.0,
- `1.1.1 || >=1.1.3 <2.0.0` 1.1.1, większa od 1.1.3 do 2.0.0, gdy 1.1.2 powodowała problemy i chcemy ją pominąć.

## Operator `-`
- `1.6.7 - 2.0.0`, to samo co `>=1.6.7 <=2.0.0` (czyli, od X do Y włącznie),
- `1 - 2.0.0`, to samo co `>=1.0.0 <=2.0.0` (pierwsza wersja zakresu uzupełniana jest zerami),
- `1 - 2`, to samo co `>=1.0.0 <3.0.0` (druga wersja w zakresie, wszystko poza wersją "major" może ulec zmianie).

## Operator `*` lub `x`
- `1.*`, to samo co `>=1.0.0 <2.0.0`,
- `1.2.x`, to samo co `>=1.2.0 <1.3.0`.

## Operator `~`
Umożliwia zmianę wersji "patch", gdy ustawiona jest na wersji "minor" lub zmianę wersji "major", gdy ustawiona na "major"
- `~1.6.7` oznacza to samo co `>=1.6.7 <1.7.0`,
- `~1.6` jest tym samym co `>=1.6.7 <1.7.0`, to samo co `1.6.*` (pozwala na zmianę wersji "patch"),
- `~1` jest tożsame z `>=1.0.0 <2.0.0`, oraz `1.*` (pozwala na zmianę wersji "minor"),
- `~1.2.3-beta.10`, to samo co `>=1.2.3-beta.10 <2.0.0`, ale np: `1.2.3-beta.11` wpadnie do zakresu, natomiast `1.2.4-beta.1` już nie.  

## Operator `^`
Umożliwia zmianę tylko pierwszej niezerowej wersji. Zmiana pierwszej niezerowej wersji często uznawana jest za "breaking-change", `^` nas przed tym chroni.
- `^1.2.3` jest tym samym co `>=1.2.3 <2.0.0` oraz `1.*`,
- `^0.2.3` oznacza to samo co `>=0.2.3 <0.3.0`, i to samo co `0.*`,
- `^0.0.3`, to samo co `>=0.0.3 <0.0.4`, oraz to samo co `0.0.*`.

