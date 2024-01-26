---
layout:    post
title:     "Czy wiesz, jak wyświetlić devtoolsy na telefonie z Androidem?"
date:      2024-03-08T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pgrobelny
image: /assets/img/posts/2024-03-08-czy-wiesz-jak-wyswietlic-devtoolsy-na-telefonie-z-androidem/debug-mobile.webp
description: Narzędzia developerskie na przeglądarce mobilnej? Tak, to jest możliwe!
tags:
- devtools
- android
---

Często w trakcie naprawy błędów lub implementacji nowych funkcjonalności musimy coś sprawdzić na fizycznym urządzeniu, ponieważ widok mobilny w przeglądarce nie jest dla nas wystarczający (na przykład potrzebujemy skorzystać z natywnego wyboru daty lub dotykowej klawiatury).

Wygodnym rozwiązaniem jest skorzystanie z narzędzia typu *Browserstack*. Możemy w nim wybrać dowolne urządzenie, mamy także dostęp do narzędzi deweloperskich, co pozwala lepiej debuggować aplikację. Wiadomo jednak, że ta usługa ma swoje przestoje i nie zawsze odpowiada na tyle szybko, aby móc wygodnie nawigować po aplikacji. Co możemy wtedy zrobić? Zamiast pisania niemiłych słów do supportu, możemy użyć własnego telefonu.

Możemy skorzystać ze specjalnych wtyczek lub przygotowanych przeglądarek, które umożliwiają na przykład wyświetlenie konsoli. Są też biblioteki, które możemy wciągnąć do projektu, aby wyświetlały nam informacje umieszczone przy, lub na naszej aplikacji. Wszystkie te rozwiązania nie są jednak oficjalnie wspierane i często mogą nam przysporzyć kolejnych problemów.

Najlepszym rozwiązaniem jest skorzystanie z oficjalnego rozwiązania, czyli Remote debug (działającego wyłącznie na urządzeniach z systemem Android). W skrócie wymaga on włączenia opcji developerskich oraz debugowania USB w telefonie ([instrukcja włączenia opcji developerskich](https://developer.android.com/studio/debug/dev-options)), podłączenia go przewodem USB do komputera i połączenia się z nim przez przeglądarkę Chrome lub Edge (dokładne kroki znajdują się w dokumentacji - [dokumentacja Chrome](https://developer.chrome.com/docs/devtools/remote-debugging?hl=pl), [dokumentacja Edge](https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/remote-debugging/)). Dzięki temu na ekranie komputera możemy zobaczyć, co się dzieje na telefonie oraz mamy pełny dostęp do narzędzi developerskich.

![Zrzut ekranu narzędzia Remote Debug](/assets/img/posts/2024-03-08-czy-wiesz-jak-wyswietlic-devtoolsy-na-telefonie-z-androidem/screenshot.png)

Powyżej zrzut ekranu *Remote debug*. Możemy podglądać strukturę DOM, posiadamy dostęp do konsoli, czy funkcji związanych z wydajnością - dokładnie tak samo, jakbyśmy to robili w oknie desktopowej przeglądarki.