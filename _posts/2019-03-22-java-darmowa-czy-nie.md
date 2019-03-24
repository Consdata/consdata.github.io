---
layout:    post
title:     "Java darmowa, czy nie?"
date:      2019-03-22 08:00:00 +0100
published: true
author:    jwilczewski
tags:
    - tech
    - java
---

15 stycznia tego roku światło dzienne ujrzał JDK 8u202 - ostatni darmowy update JDK 8. Darmowy do zastosowań komercyjnych. Wersja JDK 8 była pierwszą wersją LTS (Long Time Support) i była z nami od marca 2014 roku. Co dalej? Czy można zostać na JDK 8? Czy przesiadać się na kolejną wersję?

![title](/assets/img/posts/2019-03-22-java-darmowa-czy-nie/title.png)

## Oracle JDK vs OpenJDK

W obecnej sytuacji szczególnego znaczenia nabierają różnice pomiędzy JDK releasowanym przez Oracle a OpenJDK.
* [OpenJDK](http://openjdk.java.net/) jest projektem open source dostarczającym implementację  Java Platform, Standard Edition. Projekt działa od 2007 roku, a jednym z głównych kontrybutorów jest Oracle.
* [Oracle JDK](https://www.oracle.com/technetwork/java/javase/overview/index.html) natomiast to implementacja Java Platform dostarczana i supportowana przez Oracle w ramach OTN (Oracle Technology Network).

Obydwie wersję mają w zasadzie ten sam code base. Techniczne różnice są niewielkie i dotyczą głównie narzędzi i deploymentu. Różnice, które z punktu widzenia ostatnich zmian są najbardziej istotnie to licencjonowanie i cykl wydawniczy.

## Licencjonowanie i opłaty

OpenJDK jest projektem open source licencjonowanym w oparciu o GNU General Public License, version 2 with CE.

W Oracle JDK model licencjonowania różni się w zależności od wersji. Wersje z przed wersji 11 licencjonowane są w oparciu o [Oracle BCL (Binary Code Licence)](https://www.oracle.com/technetwork/java/javase/terms/license/index.html). Od wersji 11 Oracle JDK licencjonowane jest w oparciu o [Oracle Java SE OTN License](https://www.oracle.com/technetwork/java/javase/terms/license/javase-license.html), **który nie pozwala na komercyjne użycie**. Jeżeli chcemy używać tej wersji do zastosowań komercyjnych musimy wykupić subskrypcję "[Oracle Java SE subscription](https://www.oracle.com/java/java-se-subscription.html)". Subskrypcja jest rozliczana w cyklu miesięcznym, a końcowa cena zależy od:
* sposobu użycia (desktop/serwer)
* liczby rdzeni
* mnożnika [Oracle Processor Core Factor](http://www.oracle.com/us/corporate/contracts/processor-core-factor-table-070634.pdf)

Wg. aktualnego [cennika](https://www.oracle.com/assets/java-se-subscription-pricelist-5028356.pdf) za jeden obliczony na podstawie mnożnika core zapłacimy 25$ przy założeniu, że corów jest mnie niż 99.

## Cykl wydawniczy

Biorąc pod uwagę powyższe informacje wydaje się, że naturalnym krokiem dla tych, którzy nie chcą płacić za support jest przesiadka na wersję OpenJDK, jest tu jednak pewien haczyk. Aby go odkryć musimy wiedzieć jaki jest cykl wydawniczy poszczególnych wersji.

Jakiś czas temu Oracle postanowił nadać pewien rygor czasowy kolejnym wydawanym wersjom. Kolejne wersje Javy będą ukazywały się co pół roku. Niektóre z nich będą wersjami LTS, a pozostałe będą zastępowane kolejnymi i nie będą dalej rozwijane. Aktualnie wersje LTS to:
* wersja 8 - wspierana do marca 2025 roku,
* wersja 11 - wspierana do września 2026 roku.

Oracle będzie publikował nowe wydania wersji raz na kwartał. Dotyczy to zarówno wersji LTS jak i nie LTS. Niestety w przypadku OpenJDK Oracle nie będzie wydawał więcej niż dwóch wersji również dla wersji LTS. Oznacza to, że jeżeli wybieramy wersję LTS oczekując długiego czasu wsparcia nie możemy polegać na OpenJDK. 

## Skąd wziąć darmową wersję?

Czy jesteśmy zatem skazani na "własnoręczne" budowanie JDK? Na szczęście nie. Istnieje jeszcze kilku dostawców, którzy będą publikować kolejne wydania bazujące na OpenJDK. Z tych bardziej obiecujących warto wymienić:
* [AdoptOpenJDK](https://adoptopenjdk.net/) - warte zainteresowania chociażby ze względu na zróżnicowany zbiór sponsorów (IBM, Microsoft Azure, Azul Systems)
* [Amazon](https://aws.amazon.com/corretto/) - te wersję będą używane w chmurze AWS można więc liczyć na solidny support
* [Azul](https://www.azul.com/products/zulu-enterprise/) - dostarczają darmową implementację JDK z opcją płatnego wsparcia  
* [RedHat](https://access.redhat.com/articles/1299013) - planuje dostarczać pakiety z updateami JDK dla wersji 8 na RHEL 6 i RHEL7 do 2023 roku, a dla wersji 11 na RHEL7 do 2024 roku.

## Przydatne linki
- [Java is still free](https://medium.com/@javachampions/java-is-still-free-2-0-0-6b9aa8d6d244)
- [Oracle Java SE Support Roadmap](https://www.oracle.com/technetwork/java/java-se-support-roadmap.html)
- [Update and FAQ on the Java SE Release Cadence](https://blogs.oracle.com/java-platform-group/update-and-faq-on-the-java-se-release-cadence)