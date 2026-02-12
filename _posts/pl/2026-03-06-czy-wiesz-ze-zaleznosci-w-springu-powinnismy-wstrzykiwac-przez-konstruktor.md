---
layout:    post
title:     "Czy wiesz, że zależności w Springu powinniśmy wstrzykiwać przez konstruktor?"
date:      2026-02-12T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: bpietrowiak
image: /assets/img/posts/2026-03-06-czy-wiesz-ze-zaleznosci-w-springu-powinnismy-wstrzykiwac-przez-konstruktor/thumbnail.webp
description: "Poznaj zalety tego podejścia, przykłady kodu i wskazówki dotyczące testowania oraz bezpieczeństwa aplikacji."
tags:
- spring boot
- java
---

Czy wiesz, że sposób wstrzykiwania zależności w Springu może mieć ogromny wpływ na jakość Twojego kodu, jego bezpieczeństwo i łatwość testowania? 
Jeśli chcesz pisać lepsze aplikacje, warto poznać najważniejsze techniki i wybrać tę, która naprawdę robi różnicę.

## Czym jest wstrzykiwanie zależności?

Wstrzykiwanie zależności (ang. *Dependency Injection*, DI) w Springu to kluczowy mechanizm, 
który umożliwia automatyczne zarządzanie zależnościami pomiędzy obiektami w aplikacji. 
Jest to część szerszego podejścia do programowania, znanego jako *Inversion of Control* (IoC), 
w którym zarządzanie tworzeniem obiektów i ich zależnościami przekazywane jest z aplikacji do kontenera IoC (w Springu jest nim Spring Container).

## Metody wstrzykiwania zależności

Możemy wyróżnić kilka sposobów wstrzykiwania zależności, z których każdy ma swoje zalety i ograniczenia. 
Poniżej przedstawiam najpopularniejsze techniki DI:

- Wstrzykiwanie przez konstruktor z jawnie zdefiniowanym konstruktorem
```java
@Component
public class ServiceA {
    private final ServiceB serviceB;

    public ServiceA(final ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}
```

- Wstrzykiwanie przez konstruktor z wykorzystaniem adnotacji `@RequiredArgsConstructor`
```java
@Component
@RequiredArgsConstructor
public class ServiceA {
    private final ServiceB serviceB;
}
```
*Adnotacja `@RequiredArgsConstructor` pochodzi z biblioteki Lombok i automatycznie generuje konstruktor przyjmujący wszystkie pola oznaczone jako `final` 
lub z adnotacją `@NonNull`.*

- Wstrzykiwanie przez konstruktor z wykorzystaniem adnotacji `@RequiredArgsConstructor` oraz `@Qualifier`
```java
@Component
@RequiredArgsConstructor
public class ServiceA {
    @Qualifier("serviceB")
    private final ServiceB serviceB;
}
```
*Adnotacja `@Qualifier` jest przydatna, gdy w kontekście Springa istnieje wiele beanów tego samego typu i chcemy wskazać, 
który z nich ma zostać wstrzyknięty.*

W pliku `lombok.config` należy dodać wpis:

```
lombok.copyableAnnotations += org.springframework.beans.factory.annotation.Qualifier
```

- Wstrzykiwanie przez settery (metody ustawiające)
```java
@Component
public class ServiceA {
    private ServiceB serviceB;

    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}
```
*Wstrzykiwanie przez settery może być uzasadnione, gdy zależność jest opcjonalna lub gdy pracujemy z kodem legacy, gdzie nie możemy zmienić konstruktora.*

- Wstrzykiwanie przez pola
```java
@Component
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}
```
*Wstrzykiwanie przez pola jest najmniej zalecane, ponieważ utrudnia testowanie i nie pozwala na oznaczenie zależności jako finalne. 
Może być stosowane w wyjątkowych przypadkach, np. w bardzo prostych klasach lub kodzie legacy.*

## Którą metodę powinniśmy wykorzystywać i dlaczego?

Rekomendowanym podejściem jest wykorzystywanie wstrzykiwania przez konstruktor. Oto powody, dla których to podejście jest preferowane:

- **Wymuszenie przekazania zależności podczas tworzenia obiektu** – wstrzykiwanie przez konstruktor gwarantuje, 
że wszystkie wymagane zależności zostaną dostarczone w momencie tworzenia instancji obiektu. Dzięki temu unikamy sytuacji, 
w której klasa może być używana bez pełnych zależności, co mogłoby prowadzić do błędów w czasie działania.
- **Niezmienność obiektu** – przypisanie zależności poprzez konstruktor oznacza, że pola te mogą być oznaczone jako `final`,
co zapewnia ich niezmienność i chroni przed niepożądanymi modyfikacjami w trakcie cyklu życia obiektu. Taka konstrukcja promuje czystszy i bardziej bezpieczny kod.
- **Testy jednostkowe** – wstrzykiwanie przez konstruktor ułatwia testowanie, 
ponieważ możemy ręcznie dostarczać zależności (np. mocki) bez potrzeby używania narzędzi wspomagających, jak refleksja. 
To pozwala na łatwiejsze pisanie testów jednostkowych i zachowanie pełnej kontroli nad zależnościami podczas testowania.


Wstrzykiwanie przez konstruktor wspiera zasady **SOLID**, w szczególności:

- **Single Responsibility Principle (SRP)** – dzięki tej metodzie klasa ma jasno zdefiniowane odpowiedzialności, 
a zarządzanie zależnościami odbywa się na poziomie konstrukcji obiektu.
- **Dependency Inversion Principle (DIP)** – poprzez konstruktor, zależności są wprowadzane od zewnątrz, 
co wzmacnia niezależność od szczegółowych implementacji.

Wstrzykiwanie przez konstruktor sprawia, że zależności klasy są jasno widoczne i wyraźnie zadeklarowane w jej definicji. 
Programista, przeglądając kod, natychmiast widzi, jakie komponenty są wymagane do działania klasy.

W przypadku wstrzykiwania przez konstruktor łatwiej jest zidentyfikować brakujące zależności lub problemy z ich konfiguracją podczas uruchamiania aplikacji, 
ponieważ Spring od razu poinformuje nas o braku zależności, której nie można dostarczyć.

Konstruktor pozwala lepiej unikać problemów z cyklicznymi zależnościami, które mogą występować w innych formach wstrzykiwania (np. wstrzykiwanie przez pola). 
Spring będzie w stanie zidentyfikować takie sytuacje już na etapie konfigurowania obiektów, co ułatwia ich eliminację.

## Podsumowanie

Wstrzykiwanie zależności przez konstruktor to najlepsza praktyka w aplikacjach Spring. 
Zapewnia bezpieczeństwo, czytelność kodu, łatwość testowania i zgodność z zasadami SOLID. 
Warto stosować to podejście zawsze, gdy to możliwe, a inne metody rezerwować dla szczególnych przypadków (opcjonalne zależności, legacy code). 
Dzięki temu Twój kod będzie bardziej niezawodny i łatwiejszy w utrzymaniu.
