---
layout:    post
title:     "Czy wiesz, jak analizować i optymalizować zależności w bundle?"
date:      2026-05-18T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: aburzec
image: /assets/img/posts/2026-06-02-czy-wiesz-jak-analizowac-i-optymalizowac-zaleznosci-w-bundle/thumbnail.webp
description: ""
tags:
- frontend
- javascript
- angular
---

Przy budowaniu projektu Angularowego można natrafić na poniższy błąd:

```text
Application bundle generation complete. [28.317 seconds]

▲ [WARNING] bundle initial exceeded maximum budget. Budget 2.00 MB was not met by 1.89 MB with a total of 3.89 MB.
```

Rozpoczynamy śledztwo od zbudowania aplikacji z flagą `statsJson`. Ustawiamy ją w `angular.json`/`project.json` lub uruchamiamy z nią build.

Po zbudowaniu tak aplikacji, w katalogu wynikowym pojawi się dodatkowy, wygenerowany plik - `stats.json`.

W zależności, czy używamy `esbuild`, czy `webpack`, należy użyć odpowiedniego narzędzia:

- `esbuild-visualizer`
- `webpack-bundle-analyzer`

Po otwarciu pliku można zobaczyć poniższy ekran:

![Interfejs narzędzia do analizy rozmiaru bundle'a JavaScript](/assets/img/posts/2026-06-02-czy-wiesz-jak-analizowac-i-optymalizowac-zaleznosci-w-bundle/interface.png)

Przyjrzyjmy się w takim razie plikowi, który zajmuje sporo miejsca, czyli w naszym przypadku będzie to `lodash.js`. Przed zmianami wyglądał tak:

![Analiza rozmiaru i importów biblioteki lodash w bundle'u JavaScript](/assets/img/posts/2026-06-02-czy-wiesz-jak-analizowac-i-optymalizowac-zaleznosci-w-bundle/loadash.png)

Jest to spowodowane tym, że importowana jest cała biblioteka przez użycie niepoprawnego importu w plikach, co powoduje załadowanie całej zależności.

```ts
import {uniqWith, isEqual} from 'lodash';
import lodash from 'lodash';
```

Możemy to zoptymalizować na dwa sposoby.

1. (Common JS) Zawężanie importu

    Należy zawęzić import do rzeczy, które są używane:
    
    ```ts
    import uniqWith from 'lodash/uniqWith';
    import isEqual from 'lodash/isEqual';
    import unset from 'lodash/unset';
    ```
    
    po zmianach:
    
    ![Zredukowany rozmiar biblioteki lodash w narzędziu do analizy bundle'a po zastosowaniu selektywnych importów](/assets/img/posts/2026-06-02-czy-wiesz-jak-analizowac-i-optymalizowac-zaleznosci-w-bundle/po-optymalizacji.png)

    z ~75KB na ~21KB, czyli prawie 4 krotna optymalizacja bundle dla wybranej zależności!

2. (ESM) Korzystanie z odpowiedniej zależności

    Zamiast korzystać z zależności AMD/Common JS, można zaimportować zależność modułową (ES). Lodash udostępnia taką wersję: `lodash-es`
    
    Wtedy import wygląda tak:
    
    ```ts
    import {uniqWith, isEqual, unset} from 'lodash-es';
    ```
    
    Tree shaking sprawia, że ładowane są tylko używane zależności, zmniejszając przy tym rozmiar bundla.

### Przydatne linki
- [esbuild-visualizer](https://www.npmjs.com/package/esbuild-visualizer)
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Lodash](https://lodash.com/)