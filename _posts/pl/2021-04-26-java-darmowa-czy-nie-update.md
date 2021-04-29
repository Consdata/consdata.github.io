---
layout:    post
title:     "Java darmowa, czy nie? - aktualizacja"
date:      2021-04-26 10:00:00 +0100
published: true
lang: pl
author:    jwilczewski
image:     /assets/img/posts/2021-04-25-java-darmowa-czy-nie-update/java-darmowa.png
tags:
- java
---

_Microsoft dołącza do dystrybutorów JDK. To dobry moment żeby sprawdzić, jak rozwinęła się sytuacja z wydawaniem darmowych dystrybucji od czasu, kiedy Oracle zmienił tryb licencjonowania. Pisaliśmy o tym dwa lata temu w artykule [Java darmowa, czy nie?]({% post_url pl/2019-03-22-java-darmowa-czy-nie %})_

OpenJDK pozostaje miejscem, w którym toczą się prace rozwojowe nad poszczególnymi wersjami Java SE. Szczegółowe plany dla wersji LTS (Long Term Support) można znaleźć na wiki:
* [JDK 8](https://wiki.openjdk.java.net/display/jdk8u/Main)
* [JDK 11](https://wiki.openjdk.java.net/display/JDKUpdates/JDK11u)

Kolejną wersją LTS będzie wersja 17, której pierwsze wydanie planowane jest na wrzesień 2021 roku.

Zgodnie z tym, co pisaliśmy 2 lata temu, Oracle pozostał przy wydawaniu jedynie referencyjnych wersji z każdej, głównej wersji OpenJDK: [https://jdk.java.net/](https://jdk.java.net/). Oczywiście poza wersjami referencyjnymi, Oracle wydaje regularnie komercyjne wersje oparte również na [OpenJDK](https://www.oracle.com/java/technologies/javase-downloads.html).

### AdoptOpenJDK -> Eclipse Adoptium

[AdoptOpenJDK](https://adoptopenjdk.net/) został głównym dostawcą darmowej dystrybucji Javy. Zgodnie z raportem zamieszczonym na stronie [https://snyk.io/blog/jvm-ecosystem-report-2020/](https://snyk.io/blog/jvm-ecosystem-report-2020/) udział OracleJDK w rynku na przestrzeni lat 2018 - 2019, czyli w momencie zakończenia wydawania darmowej wersji, zmalał o 36%. Większa część tych 36% użytkowników zmigrowała się właśnie do wersji wydawanych przez AdoptOpenJDK. Wg raportu z 2020 roku udział AdoptOpenJDK na rynku używanych dystrybucji wyniósł 24%.

W samym AdoptOpenJDK zachodzą natomiast dość istotne zmiany. Społeczność AdoptOpenJDK przechodzi z London Java Community pod skrzydła [Eclipse Foundation](https://www.eclipse.org/org/foundation/). Informacje dot. motywacji, jak i samego procesu można przeczytać na [blogu AdoptOpenJDK](https://blog.adoptopenjdk.net/2020/06/adoptopenjdk-to-join-the-eclipse-foundation/). Nazwa AdoptOpenJDK zostanie zastąpiona przez **Eclipse Adoptium**.

### Microsoft Build of OpenJDK

6 kwietnia Microsoft [opublikował informację o dołączeniu do dystrybutorów darmowej wersji JDK](https://devblogs.microsoft.com/java/announcing-preview-of-microsoft-build-of-openjdk/). Binaria, na razie w wersji *preview*, można pobrać ze strony [https://www.microsoft.com/openjdk](https://www.microsoft.com/openjdk). Wersja Microsoftu oparta jest na źródłach OpenJDK i budowana przy użyciu skryptów Eclipse Adoptium.

Co ciekawe, Microsoft deklaruje, że do końca roku dystrybucja oparta na OpenJDK zostanie domyślną dystrybucją używaną w serwisach dostępnych za pośrednictwem Azure'a. Pozostałe dystrybucje używane przez Microsoft będą również sukcesywnie zastępowane przez wersje pochodzące z OpenJDK.

Polityka wydawania nowych wersji, podobnie jak w przypadku AdoptOpenJDK, zakłada kwartalny cykl wydawniczy. Microsoft planuje wydawać wersję JDK 11 do 2024 roku. Do końca bieżącego roku planują również wydać wersję JDK 17.

### Przydatne linki
- [https://snyk.io/blog/jvm-ecosystem-report-2020/](https://snyk.io/blog/jvm-ecosystem-report-2020/)
- [https://blog.adoptopenjdk.net/2020/06/adoptopenjdk-to-join-the-eclipse-foundation/](https://blog.adoptopenjdk.net/2020/06/adoptopenjdk-to-join-the-eclipse-foundation/)
- [https://devblogs.microsoft.com/java/announcing-preview-of-microsoft-build-of-openjdk/](https://devblogs.microsoft.com/java/announcing-preview-of-microsoft-build-of-openjdk/)
- [https://www.microsoft.com/openjdk](https://www.microsoft.com/openjdk)
- [Java darmowa, czy nie?]({% post_url pl/2019-03-22-java-darmowa-czy-nie %})