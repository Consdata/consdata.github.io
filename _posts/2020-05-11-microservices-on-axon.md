---
layout:    post
title:     "Mikroserwisy na Axonie w praktyce"
date:      2020-05-11 08:00:00 +0100
published: true
author:    mkociszewski
image:     
tags:
    - java
    - microservices
    - axon
    - event-sourcing
    - spring-boot
---

Znając definicję Event Sourcingu oraz dobrodziejstwa, jakie nam zapewnia (dla przypomnienia polecam [**wpis Marcina poświęcony częściowo tej tematyce**]({% post_url 2018-11-15-czy-apache-kafka-nadaje-sie-do-event-sourcingu %})) chciałoby się zastosować ten wzorzec w swoim projekcie (oczywiście nie wszędzie się on nada).
Osoby zainteresowane tematem jednak z pewnością zostaną postawione przed wyborem technologii, w której chcieliby podjąć się tego zadania. 
Niezależnie od języka programowania, można implementować CQRS oraz Event Sourcing samemu, od A-Z, jednakże byłoby to czasochłonne i mogłoby prowadzić do wielu błędów. 
Alternatywą może okazać się skorzystanie z gotowego frameworku, który od początku tworzony był z myślą o wspomnianych wzorcach - mowa tutaj o [**AxonFramework**](https://axoniq.io/).

W tym wpisie przedstawię moje podejście do tematu na konkretnych przykładach, drogę z monolitu do mikroserwisów oraz porównanie Axona z Kafką.

# Axon Framework
Krótki opis, jedno-dwa zdania, 
proste przykłady podstawowych funkcjonalności (agregaty, commandy, eventy, query, sagi [przy sadze mozna wspomnieć ze tylko inject z pola działa, bo axon wymaga bezparametrowy konstruktor)

# Mikroserwisy
- najpierw powinno się wypracować monolit 
- tu powinien wlecieć diagram
- przy mikroserwisach wspomnieć o tym, że eventy powinny być w tej samej package (a może nie? może serializator coś zjebał? muszę to sprawdzić)

# A co z Kafką?
porównanko


# Podsumowanie
pierdu pierdu, niebawem kolejne wpisy itd
