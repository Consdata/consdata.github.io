---
layout:    post
title:     "Micro frontends: czy współdzielić zależności?"
date:      2021-04-16 08:00:00 +0100
published: true
lang:      pl
author:    glipecki
image:     /assets/img/posts/2021-04-16-webpack-externals-vs-bundled/scale.webp
tags:
    - frontend
    - angular
    - webpack
    - micro-frontends
description: "tl;dr To współdzielić zależności w microfrontends czy nie? Nie zawsze! Jeżeli nie natrafiłeś na problemy z rozmiarem bundli, to nie rozwiązuj teoretycznych problemów. Zanim zabierzesz się za optymalizację - oceń, co jest problemem, określ, co chcesz osiągnąć i zastanów się, jakimi krokami możesz tam dotrzeć. Bieżące narzędzia stosują zaawansowane mechanizmy optymalizacji, które mogą zachwiać Twoje intuicyjne rozumienie problemu"
---

_**tl;dr** To współdzielić zależności czy nie? Nie zawsze! Jeżeli nie natrafiłeś na problemy z rozmiarem bundli, to nie rozwiązuj teoretycznych problemów. Zanim zabierzesz się za optymalizację - oceń, co jest problemem, określ, co chcesz osiągnąć i zastanów się, jakimi krokami możesz tam dotrzeć. Bieżące narzędzia stosują zaawansowane mechanizmy optymalizacji, które mogą zachwiać Twoje intuicyjne rozumienie problemu ;-)_

Zarysujmy prosty przykład biznesowo sensownej aplikacji, która posłuży nam do zobrazowania omawianego problemu. Załóżmy, że budujemy system wewnętrznej komunikacji z klientami. Każdy klient ma dostęp do panelu poczty, z którego może przeglądać listę dotychczasowych wątków, prowadzić konwersację oraz przeglądać szczegóły dowolnego wątku i wysłać nową wiadomość, żeby rozpocząć nowy wątek.

Poniższy diagram przedstawia przykładowy system zbudowany w podejściu micro frontends. System składa się z czterech niezależnie rozwijanych i osadzanych webcomponentów:

- mailbox-webcomponent - Aplikacja hosta odpowiedzialna za uwierzytelnianie użytkownika, layout oraz routing komponentów funkcjonalnych.
- thread-webcomponent - Aplikacja prezentująca szczegóły konkretnego wątku.
- threads-webcomponent - Aplikacja prezentująca listę dostępnych wątków.
- new-message-webcomponent - Aplikacja pozwalająca wysłać nową wiadomość.

![Architektura przykładowej aplikacji](/assets/img/posts/2021-04-16-webpack-externals-vs-bundled/sample-app-arch.jpg)

Poszczególne aplikacje są wczytywane lazy, gdy są potrzebne, a konkretna nawigacja i konfiguracja jest realizowana na poziomie aplikacji hosta. Wszystkie aplikacje są zbudowane z wykorzystaniem Angular + Angular Elements oraz korzystają z NgRx i rx.js.

### Angular jest ciężki, a Ty masz 4 kopie?! Szalony!

Naturalnym pierwszych odruchem jest zwątpienie (żeby nie powiedzieć panika) w sensowność takiego podejścia. Przecież to jest właściwie homogeniczny system i niepotrzebnie dostarczamy te same zależności czterokrotnie!

Sprawdźmy, ile ważą zależności i oceńmy potencjalny zysk?

| Aplikacja                 | bundled | vendor.js | angular+rx |
| ------------------------- |:-------:|:---------:|:----------:|
| mailbox-webcomponent      | 505K    | 434K      | 294K       |
| new-message-webcomponent  | 285K    | 248K      | 212K       |
| thread-webcomponent       | 280K    | 248K      | 212K       |
| threads-webcomponent      | 558K    | 378K      | 235K       |


Podsumowując rozmiar zależności Angular+Rx.js w chunku vendor możemy zaryzykować, że do zaoszczędzenia jest nawet 659K!

_Oczywiście, powinna do tego dojść jeszcze kompresja serwer-przeglądarka, ale rozmiar wynikowy będzie malał proporcjonalnie do wartości w tabeli._

_Inne pytanie, czemu angular czasem zajmuje więcej, a czasem mniej? Wrócimy do tego w dalszej części wpisu._

Czy możemy coś z tym zrobić? Oczywiście! Z pomocą przychodzi webpack i konfiguracja _externals_ (https://webpack.js.org/configuration/externals/#externals). Bez większych trudności możemy określić nie tylko, które moduły trafiają do którego bundle (main, polyfills czy vendor), ale wprost wskazać, że część zależności w ogóle ma nie trafić do wynikowych skryptów i obiecać webpackowi: "jakoś to będzie, nie martw się, przyjdą z zewnątrz".

### Konfiguracja współdzielenia zależności pomiędzy aplikacjami

Co właściwie robimy?
1. W osadzanych aplikacjach oznaczamy zależności jako zewnętrzne
2. W aplikacji hosta eksponujemy jego zależności jako globalne

W komponentach threads, thread i new-message oznaczamy zależności jako zewnętrzne:

```js
{
    // ....,
    externals: {
        'rxjs': 'rxjs',
        'rxjs/operators': 'rxjs.operators',
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common.http',
        '@angular/compiler': 'ng.compiler',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/router': 'ng.router',
        '@angular/forms': 'ng.forms',
        '@angular/elements': 'ng.elements'
    }
}
```

W aplikacji hosta dodajemy wymagane skrypty do skryptów globalnie dołączanych do aplikacji.

### Korzyści ze współdzielenia zależności

Zobaczmy zatem, ile faktycznie ugraliśmy wyrzucając Angular i rx.js poza aplikacje.

| Aplikacja               | main.js (bundled) | main.js (externals) | diff  | scripts |
| ----------------------- |:-----------------:|:-------------------:|:-----:|:-------:|
| mailbox-webcomponent    | 505K              | 227K                | 278K  | 1.2M    |
| new-message-webcomponent| 285K              | 101K                | 184K  | -       |
| thread-webcomponent     | 280K              | 95K                 | 185K  | -       |
| threads-webcomponent    | 558K              | 357K                | 201K  | -       |

Okazuje się, że finalnie straciliśmy na całej operacji! Na poszczególnych aplikacjach zaoszczędziliśmy 848K, ale w hoście dołożyliśmy 1.2M skryptów z zależnościami. Mieliśmy oszczędzić 659K, a dołożyliśmy ~350K. W dodatku, w najgorszym możliwym miejscu, bo podczas ładowania pierwszego, początkowego bundla (wcześniej było to rozłożone na bundle ładowane lazy w razie potrzeby).

Co się właściwie stało?

### Bundler, Tree Shaking, minification, AoT i inni

Na początek zastanówmy się, z czego wynikają różnice w wielkości dołączanych bibliotek pomiędzy aplikacjami? W tym celu porównajmy, co trafia do wynikowego kodu przed i po zastosowaniu optymalizacji na zależnościach i bundle.

Poniższe obrazy przedstawiają wizualizację analizy wynikowego bundle webpacka:
- vendor.js - reprezentuje aplikację bez optymalizacji,
- vendor.43b31...js - reprezentuje aplikację z włączonymi optymalizacjami,
- na różowo oznaczone są rozmiary zależności widziane przez webpack, gdzie stat size to rozmiar początkowy, a gzipped size to rozmiar w wynikowym bundle.

![Aplikacja bez optymalizacji](/assets/img/posts/2021-04-16-webpack-externals-vs-bundled/unoptimized.jpg)

![Aplikacja z optymalizacjami](/assets/img/posts/2021-04-16-webpack-externals-vs-bundled/optimized.jpg)

Dla uproszczenia, rozmiary części zależności umieścimy w tabeli:

| Zależność                 | stat (unoptimized) | gzip (unoptimized) | stat (optimized) | gzip (optimized) | gzip (diff) |
| ------------------------- |:------------------:|:------------------:|:----------------:|:----------------:|:-----------:|
| @angular/core/core.js     | 1.26M              | 280K               | 1.26M            | 36K              | 244K        |
| @angular/common           | 215K               | 48K                | 159K             | 6K               | 42K         |
| @angular/forms            | 262K               | 46K                | 222K             | 7K               | 39K         |
| @angular/common/http      | 87K                | 20K                | 82K              | 5K               | 15K         |
| @angular/platform-browser | 85K                | 20K                | 75K              | 4K               | 16K         |
| @angular/elements         | 24K                | 6K                 | 24K              | 2K               | 4K          |
| date-fns                  | 516K               | 100K               | 187K             | 10K              | 90K         |
| rxjs                      | 245K               | 44K                | 92K              | 9K               | 35K         |

Porównując wartości unoptimized i optimized łatwo wychwycimy różnicę w rozmiarach zależności w wynikowej aplikacji. Już te kilka przykładów pokazuje różnicę ~500K w skompresowanym kodzie!

Bundler (np. webpack) w trakcie budowania aplikacji ma okazję skorzystać z wielu technik optymalizacji, takich jak Tree Shaking, importy, AoT compilation, minification, itp., które pozwalają mu:
- zbierać tylko faktycznie używane elementy zależności,
- minifikować nazwy od strony zależności i jej klienta,
- optymalizować wykonania kodu,
- itp.

Możliwe optymalizacje dobrze widać na przykładzie biblioteki _rxjs_ gdzie większość jej operatorów została pominięta, a sam rozmiar biblioteki został zredukowany o ~80%!

![Rx.js po optymalizacji](/assets/img/posts/2021-04-16-webpack-externals-vs-bundled/rxjs-operators.jpg)

Sam proces optymalizacji kodu i jego zależności to zupełnie osobny, rozbudowany temat, któremu nie możemy przyjrzeć się po prostu "przy okazji". Jednak na nasze potrzeby sama świadomość procesu optymalizacji i jej wpływu na wynikowy rozmiar jest wystarczająca.

### Rozmiar zależności w bundle, a rozmiar z npm

Budując konkretną aplikację z konkretnymi zależnościami proces budowania może wykonać ciężką pracę i wyznaczyć minimalny działający zakres kodu. Dodatkowo, taki kod może zostać dalej optymalizowany, bo mamy możliwość modyfikowania zarówno samej zależności, jak i kodu, który z niej korzysta. Możemy nawet przyjąć, z częściowym zaufaniem, że wynikowa aplikacja nie zawiera ani kawałka kodu, który nie jest przez nią faktycznie wykorzystywany w runtime.

Zupełnie inaczej sytuacja wygląda, gdy zależności dostarczamy w runtime. Na etapie buildu nie możemy ani wnioskować, które fragmenty kodu będą potrzebne, ani wprowadzać optymalizacji w źródle. Nie znając potrzeb aplikacji klienckich, ani nie mogąc wpływać na sposób wykorzystania dostarczanych zależności, musimy je dostarczyć as-is w całości.

W naszym przykładzie, różnica między aplikacją przed i po wprowadzeniu externals wynika wprost z tego, że ta druga musi dostarczyć masę kodu, którego nikt nie potrzebuje. W efekcie, realizacja wprost zaprzeczyła założeniom eksperymentu :)

## To kiedy współdzielić zależności?

Zawsze, gdy jest ku temu przesłanka! ;) Jest kilka dodatkowych czynników sugerujących wprowadzenie współdzielenia zależności:
- nie masz kontroli nad aplikacjami klienckimi,
- wykorzystywane zależności nie poddają się łatwo optymalizacji,
- zależności nie poddają się łatwo tree shaking,
- gdy liczba aplikacji sprawia, że oszczędność będzie większa niż narzut,
- gdy stosowana zależność nie lubi być w wielu instancjach w DOM (np. różnego rodzaju globalne zależności).

To, co chcieliśmy pokazać, to że współdzielenie nie jest oczywistą rzeczą, którą "należy zawsze robić". Za każdym razem należy przeanalizować obecne problemy i metody ich rozwiązania. Nie warto wprowadzać rozwiązań problemów, których się nie ma ;)
