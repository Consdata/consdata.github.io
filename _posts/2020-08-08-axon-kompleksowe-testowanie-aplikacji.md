---
layout:    post
title:     "Axon - Kompleksowe testowanie aplikacji"
date:      2020-08-08 08:00:00 +0100
published: false
author:    mkociszewski
tags:
    - java
    - microservices
    - axon
    - event-sourcing
    - spring-boot
    - tests
---

Powszechnie wiadomo, że kod dobrze pokryty testami jest dużo bardziej podatny na rozwój - wszak nie musimy obawiać się, że nasza zmiana coś zepsuje, a my się o tym nie dowiemy.
[**W poprzednim wpisie**]({% post_url 2020-06-08-microservices-on-axon %}) opisałem swoje zmagania z migracją monolitu do mikroserwisów na Axonie, nie wspomniałem tam jednak ani słowa o testach.
Ten artykuł ma nadrobić zaległości w tej kwestii. Przedstawię dziś parę elementów składających się na kompleksowo przetestowaną aplikację opartą o Axona.

# Testy domenowe
- Testy agregatu i sagi, przykładowa implementacja z wyjaśnieniem

# Testy integracyjne
- Problem testów integracyjnych (znaleźć wpis axoniq mówiący o tym, że jest to niemożliwe?)
- Rozwiązanie problemu - przykładowa implementcja (jakie problemy napotkałem po drodze, być może na trello mam gdzieś zapisane, ale na pewno kwestia namiarów na axon-server + uwaga żeby nie podłączyć się do 'produkcyjnego')

# Automatyzacja
- Przedstawienie Travisa i jego możliwości, zalety
- Przykładowy config z omówieniem
- Screenshoty z działającej instalacji
