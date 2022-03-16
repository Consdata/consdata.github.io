---
layout:     post
title:      "Czy język programowania i region mają wpływ na wydajność Google Cloud Functions?"
date:       2022-02-21 06:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mhoja
image:      /assets/img/posts/2022-02-porownanie-jezykow-programowania-cloud-functions/clouds.jpg
tags:
    - google cloud function
    - google cloud platform
    - gcp
    - cold start
    - googlecloud
    - serverless

description: "W jakim języku programowania pisać funkcje w Google Cloud? Które środowisko uruchomieniowe jest najszybsze i czy ma na to wpływ region? Czy języki interpretowane mają mniejszy cold start?"
---

Jeżeli chociaż raz zastanawiałeś się, w jakim języku programowania napisać funkcję w Google Cloud, to w tym wpisie postaram się pomóc w podjęciu tej decyzji.

Na warsztat weźmiemy wszystkie dostępne na ten moment środowiska uruchomieniowe dla Google Cloud Functions i porównamy czasy odpowiedzi oraz zimne starty (tzw. cold starts).
Porównamy nie tylko środowiska uruchomieniowe, ale również regiony w których osadzone są funkcje.

# Motywacja

Pisząc swoją pierwszą funkcję w GCP zastanawiałem się, w jakim języku ją napisać? Przecież to prosta funkcja, mogę ją napisać w każdym dostępnym języku. Pisać w Javie, której używam na co dzień? A może w Node.js? Przecież TypeScript też jest dla mnie codziennością...

Motywacją do przeprowadzenia testów był przede wszystkim brak odpowiedzi na moje pytania oraz brak porównań środowisk uruchomieniowych dla Cloud Functions w Internecie.

# Środowisko testowe

Google co chwilę rozszerza listę obsługiwanych środowisk uruchomieniowych, dlatego zależało mi na tym, żeby porównanie funkcji było łatwe do przeprowadzenia w przyszłości, z uwzględnieniem nowych języków. Chcąc zautomatyzować całą procedurę i środowisko testowe, wraz z kolegą Jackiem Grobelnym przygotowaliśmy projekt pt. [**Google Coud Functions Comparison**](https://github.com/Michuu93/google-cloud-function-comparison).

Do automatyzacji wykorzystany został Terraform, za pomocą którego przygotowywane jest całe środowisko testowe. Wszystkie osadzane funkcje są definiowane w konfiguracji, dlatego w prosty sposób można uruchomić środowisko testujące wybrane języki oraz regiony.

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

W celu porównania czasów odpowiedzi, każda funkcja była wywoływana przez 10 minut i 20 równoległych użytkowników. Ilość wykonanych żądań jest zatem uzależniona od samej funkcji oraz Gatlinga (a w zasadzie, to mojego laptopa).

Testy zimnych startów zostały wykonane z zapewnieniem braku istnienia aktywnej instancji. Test polegał na wykonaniu 10 żądań do każdej z funkcji, a następnie porównaniu czasu pierwszej odpowiedzi do średniej arytmetycznej czasów pozostałych 9 odpowiedzi.

Każdy test uruchomiłem dwa razy, o tej samej godzinie czasu polskiego dla wszystkich regionów oraz o tej samej godzinie czasu lokalnego w danym regionie. Wszystkie żądania były wykonywane z mojej stacji roboczej w Poznaniu.

Przyjąłem nazewnictwo *język interpretowany* dla języków skryptowych i kompilowanych (nie korzystających z maszyny wirtualnej) oraz *język uruchamiany w maszynie wirtualnej* dla języków kompilowanych i uruchamianych w maszynie wirtualnej.

# Czasy odpowiedzi

<link href="{{ base.url | prepend: site.url }}/assets/css/tabs.css" rel="stylesheet" type="text/css">
<link href="{{ base.url | prepend: site.url }}/assets/css/simple-datatables.css" rel="stylesheet" type="text/css">
<script src="{{ base.url | prepend: site.url }}/assets/js/simple-datatables.js"></script>

## Godziny uruchomienia testów

- `Run #1` - środek tygodnia, 17-23 czasu polskiego
- `Run #2` - środek tygodnia, 20:00 czasu lokalnego w danym regionie:
  - `europe-west3` (Frankfurt, Germany, Europe) - 20:00 o 20:00 czasu polskiego
  - `us-central1` (Council Bluffs, Iowa, North America) - 20:00 o 03:00 czasu polskiego (-7h)
  - `asia-east2` (Hong Kong, APAC) - 20:00 o 13:00 czasu polskiego (+7h)

## Wyniki

{% include post_includes/2022-02-porownanie-jezykow-programowania-cloud-functions/responseTimes.html %}

### Regiony

Wyniki pierwszego testu nieco mnie zaskoczyły, ponieważ bardzo dobrze wypadły tutaj funkcje osadzone w Azji (a nie najbliżej mojej geolokalizacji, jak się spodziewałem).

Dlatego postanowiłem wykonać test ponownie, aby wykluczyć różnice w czasie (ponieważ o godzinie 20:00 czasu Polskiego, w Hong Kongu była godzina 03:00). Dzięki temu mogłem sprawdzić, czy wpływ na wyniki ma tutaj fakt, że w środku nocy obciążenie centrum danych może być mniejsze.

Drugi test wykluczył jednak kwestie godziny w danym regionie, ponieważ i tym razem Azja wypadła najlepiej. Z powodu odległości można zaobserwować znacznie wyższe minimalne i maksymalne czasy odpowiedzi, jednak średnio były one i tak nieco niższe niż w przypadku Frankfurtu. W ciągu 10 minut udało się wykonać sumarycznie więcej żądań.

Najgorzej wypadł region w USA, gdzie pomimo niższych minimalnych czasów odpowiedzi, średnio były one znacznie wyższe (co idealnie pokazuje kolumna z 95 percentylem). W efekcie funkcje uruchomione w USA obsłużyły zauważalnie mniejszą liczbę żądań.

Testy starałem się wykonać w środku tygodnia, aby były jak najbardziej wiarygodne. Pod uwagę należy wziąć jednak fakt, że funkcje były bardzo prymitywne - jedyne co robiły, to odpowiadały "Hello World". Całkiem możliwe, że w przypadku funkcji do których wysyłamy lub które zwracają jakieś dane, wyniki byłyby zupełnie inne. Zależało mi jednak na sprawdzeniu prostych funkcji, ponieważ w tym przypadku łatwo jest porównać środowiska uruchomieniowe (w przypadku bardziej złożonych implementacji duży wpływ na wydajność mogłyby mieć wykorzystane zewnętrzne zależności czy biblioteki).

Podsumowując, gdybym chciał uruchomić prostą funkcję i zależałoby mi na tym, aby obsłużyła jak największy ruch, prawdopodobnie wybrałbym któryś z regionów w Azji.

### Środowiska uruchomieniowe

W przypadku środowisk uruchomieniowych spodziewałem się, że języki interpretowane dają lepsze wyniki niż języki uruchamiane w wirtualnej maszynie.

Wyniki testu częściowo potwierdziły moje podejrzenia, ponieważ najszybciej odpowiadały funkcje napisane w Go, Ruby czy PHP. Dużym zaskoczeniem były dla mnie wyniki Node.js, które są dość przeciętne. Spodziewałem się że JavaScript uplasuje się w czołówce, jednak wyniki były bardziej zbliżone do języków uruchamianych w maszynie wirtualnej.

Kompletnie nie zdziwiły mnie za to wyniki funkcji napisanych w Javie czy .NET, jednak nie spisywałbym ich na straty. Środowiska uruchomieniowe wykorzystujące maszyny wirtualne (takie jak właśnie Java - JVM, czy .NET - CLR) potrafią optymalizować uruchomiony kod, jednak nie zrobią tego od razu, ponieważ potrzebują w tym celu zebrać odpowiednią ilość statystyk. Całkiem możliwe, że funkcje które obsługują bardzo dużo żądań w czasie ciągłym (czyli takim, dzięki któremu instancja funkcji będzie żyła bardzo długo) osiągnęłyby z czasem lepsze wyniki.

Jakie z tego wnioski? Jeżeli piszemy prostą funkcję i nie zależy nam na wydajności (albo spodziewamy się małego ruchu), śmiało możemy napisać ją w języku programowania, który znamy najlepiej. Jeżeli jednak zależy nam na obsłudze jak największej ilości żądań (i jednocześnie wiemy, że instancja funkcji nie będzie długowieczna), najlepszym wyborem będą języki, które nie są uruchamiane w wirtualnej maszynie.

# Zimne starty

## Godziny uruchomienia testów

- `Run #1` - środek tygodnia, 22 czasu polskiego
- `Run #2` - środek tygodnia, 20:00 czasu lokalnego w danym regionie:
  - `europe-west3` (Frankfurt, Germany, Europe) - 20:00 o 20:00 czasu polskiego
  - `us-central1` (Council Bluffs, Iowa, North America) - 20:00 o 03:00 czasu polskiego (-7h)
  - `asia-east2` (Hong Kong, APAC) - 20:00 o 13:00 czasu polskiego (+7h)

## Wyniki

{% include post_includes/2022-02-porownanie-jezykow-programowania-cloud-functions/coldstarts.html %}

### Regiony

W odróżnieniu od wyników czasów odpowiedzi, w przypadku zimnych startów najlepiej wypadł region, który był najbliżej mojej geolokalizacji. Zarówno pierwsza odpowiedź oraz średnia pozostałych, była najniższa w przypadku funkcji osadzonych we Frankfurcie. Najgorzej natomiast wypadła Azja, co pokrywałoby się z poprzednim testem, ponieważ funkcje w Azji miały najwyższy minimalny czas odpowiedzi.

Podobnie jak w poprzednim teście, różnice w czasie między regionami nie miały żadnego znaczenia.

Na co się zdecydować, biorąc pod uwagę wyniki tych testów? Jeżeli potrzebujemy funkcji, która jest rzadko wywoływana (jej instancja jest krótko żyjąca) i zależy nam na jak najszybszej odpowiedzi, najlepiej powinny sprawdzić się funkcje uruchomione najbliżej geolokalizacji użytkownika końcowego. Dzięki bliskości centrum danych, nie tracimy czasu na przesyłanie żądania i odpowiedzi, a wąskim gardłem jest tutaj zimny start, czyli czas potrzebny na uruchomienie instancji funkcji.

### Środowiska uruchomieniowe

Tak samo jak w poprzednim teście, w przypadku różnic między środowiskami uruchomieniowymi spodziewałem się lepszych wyników w przypadku funkcji napisanych w językach interpretowanych, od tych uruchamianych w maszynie wirtualnej. Wyniki jednak mnie zaskoczyły, ponieważ czasami jakieś środowisko uruchomieniowe wypadało bardzo dobrze, a czasami dużo gorzej.

W przypadku zimnych startów na pewno większą rolę odgrywa region, w którym osadzimy funkcję, niż język w którym ją napiszemy. Języki programowania, po których spodziewałem się lepszych wyników (Python i Ruby) nie wypadły wcale lepiej od Javy i .NET, które w teorii powinny potrzebować więcej czasu na uruchomienie.

Patrząc na wyniki testu, nie potrafię jednoznacznie stwierdzić w jakim języku napisałbym funkcję, aby zapewnić jak najkrótszy zimny start. Sytuacja mogłaby ulec zmianie w przypadku bardziej złożonych implementacji i wykorzystania zewnętrznych zależności/bibliotek, ponieważ ich rozmiar i implementacja mogłyby odgrywać tutaj kluczową rolę.

# Podsumowanie

Na zakończenie chciałbym zaznaczyć, że wykonane przeze mnie testy dotyczyły jedynie prostych implementacji funkcji, a wyniki mogłyby być inne w przypadku bardziej złożonych implementacji lub przesyłania większej ilości danych. Mimo wszystko najczęściej spotykam się z bardzo prostymi funkcjami i z tego też powodu przeprowadziłem takie testy. Starając się porównać środowiska uruchomieniowe, musiałem zapewnić zbliżoną implementację funkcji, aby wykluczyć wpływ dostępnych bibliotek i zależności na wyniki.

Zachęcam również do przeprowadzania własnych testów za pomocą narzędzia [**Google Coud Functions Comparison**](https://github.com/Michuu93/google-cloud-function-comparison), ponieważ jak widać, wyniki potrafią być zaskakujące i nieoczywiste.
