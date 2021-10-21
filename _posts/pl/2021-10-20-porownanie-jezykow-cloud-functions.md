---
layout:     post
title:      "Title"
date:       2021-10-20 6:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mhoja
image:      /assets/img/posts/2021-10-20-porownanie-jezykow-cloud-functions/clouds.jpg
tags:
    - cloud
    - functions
    - cloud function
    - gcp
    - googlecloud
    - google
    - lambda
    - serverless
    - aws
    - azure

description: "W jakim języku programowania pisać funkcje w Google Cloud? Które środowisko uruchomieniowe jest najszybsze, czy ma na to wpływ region? Czy języki skryptowe mają mniejszy cold start?"
---

Jeżeli chociaż raz zastanawiałeś się, w jakim języku programowania napisać funkcję w Google Cloud, to w tym wpisie postaram się pomóc w podjęciu tej decyzji.

Na warsztat weźmiemy wszystkie dostępne na ten moment środowiska uruchomieniowe dla Google Cloud Functions i porównamy czasy odpowiedzi oraz zimne starty (tzw. cold starts).
Porównamy nie tylko środowiska uruchomieniowe, ale również regiony w których osadzone są funkcje.

# Motywacja

Pisząc swoją pierwszą funkcję w GCP zastanawiałem się, w jakim języku ją napisać? Przecież to prosta funkcja, mogę ją napisać w każdym dostępnym języku. Pisać w Javie, której używam na codzień? A może w Node.js? Przecież TypeScript też jest dla mnie codziennością...

Motywacją do przeprowadzenia testów był przede wszystkim brak odpowiedzi na moje pytania oraz brak porównań środowisk uruchomieniowych dla Cloud Functions w Internecie.

# Środowisko testowe

Google co chwilę rozszerza listę obsługiwanych środowisk uruchomieniowych, dlatego zależało mi na tym, żeby porównanie funkcji było łatwe do przeprowadzenia w przyszłości, z uwzględnieniem nowych języków. Chcąc zautomatyzować całą procedurę i środowisko testowe, wraz z kolegą Jackiem Grobelnym przygotowaliśmy projekt pt. **Google Coud Functions Comparison**.

Do automatyzacji wykorzystany został Terraform, za pomocą którego przygotowywane jest całe środowisko testowe. Wszystkie deployowane funkcje są definiowane w konfiguracji, dlatego w prosty sposób można uruchomić środowisko testujące wybrane języki oraz regiony.

Testy czasów odpowiedzi zostały napisane w Gatlingu, który listę funkcji odczytuje z tej samej konfiguracji, przez co nie wymaga żadnej dodatkowej ingerencji. Testy zimnych startów wykonywane są natiomiast bezpośrednio przez kod napisany w Scali a wyniki wyświetlane są w formie tabeli ASCII.

Kody wszystkich funkcji znajdują się w folderze `/functions` i są to podstawowe funkcje odpowiadające *"Hello World"*, takie same jak przykładowe funkcje tworzone z poziomu Cloud Console.

Projekt znajduję się na GitHubie - [link do repozytorium.](https://github.com/Michuu93/google-cloud-function-comparison)

## Testowane języki

W testach udział wezmą funkcje napisane we wszystkich dostępnych dla Cloud Functions językach programowania i wersjach środowiska:

- .NET Core 3.1
- Go 1.16 (Preview)
- Go 1.13
- Java 11
- Node.js 16 (Preview)
- Node.js 14
- Node.js 12
- Node.js 10
- PHP 7.4
- Python 3.9
- Python 3.8
- Python 3.7
- Ruby 2.7
- Ruby 2.6

# Czasy odpowiedzi

## Metodyka

W celu porównania czasów odpowiedzi, każda funkcja będzie wywoływana przez 10 minut, przez 20 równoległych użytkowników. Ilość wykonanych requestów będzie się zatem róznić w zależności od języka oraz działania samego Gatlinga.

Pierwszy test dotyczyć będzie regionu `europe-west3-a` (Frankfurt, Germany Europe), kolejny test zostanie ograniczony do 3 środowisk uruchomieniowych, ale za to porówna 5 różnych regionów.

## Wyniki

// TODO przykładowa tabelka

| Runtime       | Requests | Min | 95th pct | Max  | Mean | Std Dev |
|---------------|----------|-----|----------|------|------|---------|
| .NET Core 3.1 | 50000    | 80  | 1000     | 2000 | 500  | 200     |
| Go 1.13       | 60000    | 90  | 1200     | 2400 | 550  | 240     |
| Node.js 14    | 55000    | 100 | 1400     | 2600 | 580  | 280     |
| Java 11       | 45000    | 150 | 1600     | 2800 | 670  | 320     |

## Regiony

# Cold start

## Metodyka

W celu sprawdzenia zimnego startu, całe środowisko testowe zostanie uruchomione na nowo, żeby mieć pewność że nie istnieje żadna aktywna instancja funkcji. Test polega na wykonaniu 10 requestów do każdej z funkcji, a następnie porównaniu czasu pierwszej odpowiedzi do średniej arytmetycznej czasów pozostałych 9 odpowiedzi.

Pierwszy test dotyczyć będzie regionu `europe-west3-a` (Frankfurt, Germany Europe), kolejny test zostanie ograniczony do 3 środowisk uruchomieniowych, ale za to porówna 5 różnych regionów.

// TODO pamiętać o tym, że nie każde środowisko uruchomieniowe jest dostępne we wszystkich regionach.

## Wyniki

// TODO przykładowa tabelka

| Runtime       | 1st time | Avg remaining | Diff |
|---------------|----------|---------------|------|
| .NET Core 3.1 | 500      | 80            | 420  |
| Go 1.13       | 400      | 90            | 310  |
| Node.js 14    | 350      | 1000          | 650  |
| Java 11       | 200      | 1500          | 1300 |

## Regiony

# Podsumowanie