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
    - cold start
    - gcp
    - googlecloud
    - google
    - serverless

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

Testy czasów odpowiedzi zostały napisane w Gatlingu, który listę funkcji odczytuje z tej samej konfiguracji, przez co nie wymaga żadnej dodatkowej ingerencji. Testy zimnych startów wykonywane są natomiast bezpośrednio przez kod napisany w Scali, a wyniki wyświetlane są w formie tabeli ASCII.

Kody wszystkich funkcji znajdują się w folderze `/functions` i są to podstawowe funkcje odpowiadające *"Hello World"*, takie same jak przykładowe funkcje tworzone z poziomu Cloud Console.

Projekt znajduję się na GitHubie - [link do repozytorium.](https://github.com/Michuu93/google-cloud-function-comparison)

## Metodyka testowania

W testach wykorzystałem funkcje uruchomione w następujących środowiskach uruchomieniowych:

- .NET Core 3.1
- Go 1.13
- Java 11
- Node.js 14
- PHP 7.4
- Python 3.9
- Ruby 2.7

Każda funkcja posiadała maksymalnie jedną instancję, przydzieloną pamięć 128 MB i została uruchomiona w regionach:

- `europe-west3` (Frankfurt, Germany, Europe)
- `us-central1` (Council Bluffs, Iowa, North America)
- `asia-east2` (Hong Kong, APAC)

W celu porównania czasów odpowiedzi, każda funkcja była wywoływana przez 10 minut i 20 równoległych użytkowników. Ilość wykonanych żądań jest zatem uzależniona od samej funkcji oraz Gatlinga.

Testy zimnych startów zostały wykonane z zapewnieniem braku istnienia aktywnej instancji. Test polegał na wykonaniu 10 żądań do każdej z funkcji, a następnie porównaniu czasu pierwszej odpowiedzi do średniej arytmetycznej czasów pozostałych 9 odpowiedzi.

# Czasy odpowiedzi

<link href="{{ base.url | prepend: site.url }}/assets/css/simple-datatables.css" rel="stylesheet" type="text/css">
<style>
    .dataTable-pagination {
        display: none;
    }
</style>
<script src="{{ base.url | prepend: site.url }}/assets/js/simple-datatables.js"></script>

{% include post_includes/2021-10-20-porownanie-jezykow-cloud-functions/responseTimes.html %}

# Zimne starty

{% include post_includes/2021-10-20-porownanie-jezykow-cloud-functions/coldstarts.html %}

# Podsumowanie