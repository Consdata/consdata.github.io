---
layout:    post
title:     "Czy wiesz, że zależności w Springu powinniśmy wstrzykiwać przez konstruktor?"
date:      2026-03-12T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: bpietrowiak
image: /assets/img/posts/2026-03-12-czy-wiesz-ze-zaleznosci-w-springu-powinnismy-wstrzykiwac-przez-konstruktor/thumbnail.webp
description: "Poznaj zalety tego podejścia, przykłady kodu i wskazówki dotyczące testowania oraz bezpieczeństwa aplikacji."
tags:
- spring boot
- java
---

Czy wiesz, że sposób wstrzykiwania zależności w Springu może mieć ogromny wpływ na jakość Twojego kodu, jego bezpieczeństwo i łatwość testowania? 
Jeśli chcesz pisać lepsze aplikacje, warto poznać najważniejsze techniki i wybrać tę, która przynosi najlepsze efekty.

## Czym jest wstrzykiwanie zależności?

Wstrzykiwanie zależności (ang. *Dependency Injection*, DI) w Springu to kluczowy mechanizm, 
który umożliwia automatyczne zarządzanie zależnościami pomiędzy obiektami w aplikacji. 
Jest to część szerszego podejścia do programowania, znanego jako *Inversion of Control* (IoC), 
w którym zarządzanie tworzeniem obiektów i ich zależnościami przekazywane jest z aplikacji do kontenera IoC (w Springu jest nim Spring Container).

## Metody wstrzykiwania zależności

Możemy wyróżnić kilka sposobów wstrzykiwania zależności, z których każdy ma swoje zalety i ograniczenia. 
Poniżej przedstawiam najpopularniejsze techniki DI:

- Wstrzykiwanie jawnie zdefiniowanym konstruktorem
```java
@Component
public class OrderService {
    private final PaymentService paymentService;

    public OrderService(final PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

- Wstrzykiwanie przez konstruktor z wykorzystaniem adnotacji `@RequiredArgsConstructor`
```java
@Component
@RequiredArgsConstructor
public class OrderService {
    private final PaymentService paymentService;
}
```
*Adnotacja `@RequiredArgsConstructor` pochodzi z biblioteki Lombok i automatycznie generuje konstruktor przyjmujący wszystkie pola oznaczone jako `final` 
lub z adnotacją `@NonNull`.*
- Wstrzykiwanie przez pola
```java
@Component
public class OrderService {
    @Autowired
    private PaymentService paymentService;
}
```
*Wstrzykiwanie przez pola jest najmniej zalecanym podejściem, ponieważ utrudnia testowanie i nie pozwala na oznaczenie zależności jako finalne. 
Może być stosowane w wyjątkowych przypadkach, np. w bardzo prostych klasach lub kodzie legacy.*


### @Qualifier - kiedy i jak używać?

Adnotacja `@Qualifier` służy do wskazania konkretnego beana, gdy w kontekście Springa istnieje wiele beanów tego samego typu.
Technicznie działa w każdym stylu wstrzykiwania, ale podejścia różnią się czytelnością i łatwością testowania.

Najbardziej czytelnie: `@Qualifier` w konstruktorze
```java
@Component
public class OrderService {
    private final PaymentService paymentService;

    public OrderService(@Qualifier("paymentService") PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

Gdy zależność jest opcjonalna: `@Qualifier` w setterze
```java
@Component
public class OrderService {
    private PaymentService paymentService;

    @Autowired
    public void setPaymentService(
            @Qualifier("paymentService") PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

Najmniej zalecane: `@Qualifier` na polu
```java
@Component
public class OrderService {
    @Autowired
    @Qualifier("paymentService")
    private PaymentService paymentService;
}
```

Jeśli używasz Lombok (`@RequiredArgsConstructor`), możesz pozostać przy stylu konstruktorowym i jednocześnie oznaczyć pole adnotacją `@Qualifier`:

```java
@Component
@RequiredArgsConstructor
public class OrderService {
    @Qualifier("paymentService")
    private final PaymentService paymentService;
}
```

W takim wariancie dodaj w pliku `lombok.config`:

```
lombok.copyableAnnotations += org.springframework.beans.factory.annotation.Qualifier
```

Dzięki temu Lombok przeniesie `@Qualifier` z pola do parametru wygenerowanego konstruktora.

- Wstrzykiwanie przez settery (metody ustawiające)
```java
@Component
public class OrderService {
    private PaymentService paymentService;

    @Autowired
    public void setPaymentService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```
*Wstrzykiwanie przez settery może być uzasadnione, gdy zależność jest opcjonalna lub gdy pracujemy z kodem legacy, gdzie nie możemy zmienić konstruktora.*


## Którą metodę powinniśmy wykorzystywać i dlaczego?

Rekomendowanym podejściem jest wykorzystywanie wstrzykiwania przez konstruktor. Oto powody, dla których to podejście jest preferowane:

- **Wymuszenie przekazania zależności podczas tworzenia obiektu** – wstrzykiwanie przez konstruktor gwarantuje, 
że wszystkie wymagane zależności zostaną dostarczone w momencie tworzenia instancji obiektu. Dzięki temu unikamy sytuacji, 
w której klasa może być używana bez pełnych zależności, co mogłoby prowadzić do błędów w runtime.
- **Niezmienność obiektu** – przypisanie zależności poprzez konstruktor oznacza, że pola te mogą być oznaczone jako `final`,
co zapewnia ich niezmienność i chroni przed niepożądanymi modyfikacjami w trakcie cyklu życia obiektu. Taka konstrukcja promuje czystszy i bardziej bezpieczny kod.
- **Testy jednostkowe** – wstrzykiwanie przez konstruktor ułatwia testowanie, 
ponieważ możemy ręcznie dostarczać zależności (np. mocki) bez potrzeby używania takich narzędzi wspomagających, jak refleksja.
To ułatwia pisanie testów jednostkowych i pozwala na zachowanie pełnej kontroli nad zależnościami podczas testowania.


Wstrzykiwanie przez konstruktor wspiera zasady **SOLID**, w szczególności:

- **Single Responsibility Principle (SRP)** – dzięki tej metodzie klasa ma jasno zdefiniowane odpowiedzialności, 
a zarządzanie zależnościami odbywa się na poziomie konstrukcji obiektu.
- **Dependency Inversion Principle (DIP)** – poprzez konstruktor, zależności są wprowadzane od zewnątrz, 
co wzmacnia niezależność od szczegółowych implementacji.

Wstrzykiwanie przez konstruktor sprawia, że zależności klasy są jasno widoczne i wyraźnie zadeklarowane w jej definicji. 
Programista, przeglądając kod, natychmiast widzi, jakie komponenty są wymagane do działania klasy.

W przypadku wstrzykiwania przez konstruktor łatwiej jest zidentyfikować brakujące zależności lub problemy z ich konfiguracją podczas uruchamiania aplikacji, 
ponieważ Spring od razu poinformuje nas o braku zależności, której nie można dostarczyć.

Konstruktor pomaga w szybszym wykrywaniu problemów z cyklicznymi zależnościami, które mogą występować w innych formach wstrzykiwania (np. wstrzykiwanie przez pola). 
Spring będzie w stanie zidentyfikować takie sytuacje już na etapie konfigurowania obiektów, co ułatwia ich eliminację.

## Podsumowanie

Wstrzykiwanie zależności przez konstruktor to najlepsza praktyka w aplikacjach Spring. 
Zapewnia bezpieczeństwo, czytelność kodu, łatwość testowania i zgodność z zasadami SOLID.
Warto przyjąć to podejście jako domyślny standard w każdym projekcie, a inne metody rezerwować dla szczególnych przypadków (opcjonalne zależności, legacy code). 
Dzięki temu Twój kod będzie bardziej niezawodny i łatwiejszy w utrzymaniu.
