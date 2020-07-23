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

W tym poście (drugim [z trzech] z serii o Axonie) chciałbym przedstawić jak wygląda testowanie jednostkowe apki na axonie (agregaty, sagi). Ponadto pokażę jak poradziłem sobie z testami integracyjnymi (nigdzie nie znalazłem w internecie przykładu, a AxonIQ zarzeka się, że nie bardzo jest sposób na to, otóż jest). Ostatni akapit miałby dotyczyć integracji z Travisem, jako bonus.
