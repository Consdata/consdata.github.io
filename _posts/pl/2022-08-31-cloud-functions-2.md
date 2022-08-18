---
layout:     post
title:      "Google Cloud Functions (2nd gen) - co nowego wprowadza?"
date:       2022-08-18 06:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mhoja
image:      /assets/img/posts/2022-08-cloud-functions-2/clouds.jpg
tags:
    - google cloud function
    - cloud functions gen 2
    - google cloud platform
    - gcp
    - googlecloud
    - serverless
    - eventarc

description: "Od kilku miesięcy dostępna jest nowa generacja Google Cloud Function (2nd gen), początkowo w wersji poglądowej (public preview) a dzisiaj również w wersji ogólnodostępnej (general availability). Jakie zmiany zostały wprowadzone względem poprzedniej generacji?"
---

W lutym tego roku Google wprowadziło w wersji poglądowej (public preview) nową generację usługi Cloud Functions (2nd gen). Architektura Google Cloud Function (2nd gen) została oparta o Cloud Run oraz Eventarc, co wprowadza kilka ciekawych funkcjonalności względem poprzedniej generacji. W sierpniu tego roku druga generacja funkcji przeszła z wersji poglądowej do ogólnodostępnej (general availability, GA).

![Cloud Functions 2nd gen](/assets/img/posts/2022-08-cloud-functions-2/cloud_function_2nd_gen_whats_new.jpg)
<span class="img-legend">Cloud Functions 2nd gen<br />źródło: <a href="https://cloud.google.com/blog/products/serverless/cloud-functions-2nd-generation-now-generally-available">https://cloud.google.com</a> - dostęp: 2022-08-15</span>

## Co nowego?

### Wydłużony czas działania funkcji

W przypadku funkcji wyzwalanych eventem zwiększono maksymalny czas procesowania z 9 do 10 minut, natomiast w przypadku funkcji wyzwalanych żądaniami HTTP zwiększono ten czas z 9 do aż 60 minut. Domyślny czas wynosi 1 minutę, można go zwiększyć za pomocą parametru `--timeout`. Dłuższy czas procesowania może przydać się np. w przypadku przetwarzania danych z Cloud Storage do BigQuery.

[Więcej informacji...](https://cloud.google.com/functions/docs/configuring/timeout)

### Zwiększone maksymalne zasoby dla funkcji

W nowej generacji możemy utworzyć instancję z 4 vCPU / 16GB RAM (w przypadku poprzedniej generacji maksymalnie 2 vCPU / 8GB RAM). W wersji poglądowej pojawiła się również nowa opcja z 8 vCPU / 32GB RAM.

[Więcej informacji...](https://cloud.google.com/functions/docs/configuring/memory)

### Wersjonowanie funkcji i dzielenie ruchu

Czyli coś co daje nam architektura Cloud Run. Możemy wersjonować funkcję i kierować procentowo ruch na różne jej wersje, co pozwala przetestować nową wersję na części użytkowników (Canary Deployment, A/B Testing). Dzięki temu możemy również bardzo szybko przywrócić poprzednią wersję funkcji.

[Więcej informacji...](https://cloud.google.com/functions/docs/configuring/traffic-splitting)

### Przetwarzanie współbieżne

W pierwszej generacji instancja funkcji przetwarzała jednocześnie tylko jedno żądanie, w nowej generacji możemy zdefiniować parametr `--concurrency` i ustalić liczbę jednocześnie przetwarzanych żądań. Dzięki temu możemy zmniejszyć minimalną liczbę instancji i zaoszczędzić czas przy tworzeniu nowych (cold start), co w praktyce przekłada się na niższe koszty. Maksymalna wartość parametru jest uzależniona od środowiska uruchomieniowego, a w przypadku ustawienia wartości większej niż 1 (domyślna wartość) instancja funkcji musi posiadać minimum 1 vCPU.

[Więcej informacji tutaj](https://cloud.google.com/functions/docs/configuring/concurrency) oraz [tutaj...](https://cloud.google.com/run/docs/about-concurrency)

### Minimalna liczba "rozgrzanych" instancji

Możemy zdefiniować liczbę instancji, które mają być cały czas gotowe do obsługi żądań. Pozwala to skrócić czas obsługi żądania w przypadku tworzenia nowej instancji (cold start). Warto pamiętać również o tym, że płacimy za cały czas działania funkcji, również za zimny start.

[Więcej informacji...](https://cloud.google.com/functions/docs/configuring/min-instances)

### Natywne wsparcie dla Eventarc

Nowa generacja wprowadza natywne wsparcie dla platformy [Eventarc](https://cloud.google.com/eventarc/docs/overview), co rozszerza listę dostępnych wyzwalaczy funkcji o ponad [125 nowych](https://cloud.google.com/eventarc/docs/reference/supported-events). Dla porównania, pierwsza generacja obsługuje jedynie [7 wyzwalaczy](https://cloud.google.com/functions/docs/calling#1st-gen-triggers), nie licząc żądań HTTP. Możemy na przykład utworzyć funkcję wyzwalaną zapytaniem BigQuery, która wysyła powiadomienie na Slacka w przypadku zbyt długich zapytań. Eventarc jest zgodny ze standardem [CloudEvents](https://cloud.google.com/eventarc/docs/cloudevents), co pozwala uniknąć tzw. vendor locka. Eventarc wspiera również CMEK ([customer-managed encryption keys](https://cloud.google.com/kms/docs/cmek)), co umożliwia szyfrowanie eventów za pomocą kluczy zarządzanych przez nas samych.

[Więcej informacji...](https://cloud.google.com/functions/docs/calling/eventarc)

### Nowe regiony

Funkcje drugiej generacji są dostępne we wszystkich regionach w których dostępna jest pierwsza generacja oraz w dwóch dodatkowych: europe-north1 (Finlandia), europe-west4 (Holandia).

[Więcej informacji...](https://cloud.google.com/functions/docs/locations)

### Możliwość migracji funkcji

Funkcje drugiej generacji, z racji wykorzystywania architektury Cloud Run, umożliwiają łatwe przeniesienie ich do Cloud Run a nawet do Kubernetesa.

## Podsumowanie

Nowa generacja wprowadza bardzo wiele ciekawych zmian, pozwalających wycisnąć z funkcji jeszcze więcej jednocześnie optymalizując koszty i czasy odpowiedzi. Warto przetestować nowe funkcje na własną rękę, zaczynając np. od [Getting started with Cloud Functions (2nd gen)](https://codelabs.developers.google.com/codelabs/cloud-starting-cloudfunctions-v2).
