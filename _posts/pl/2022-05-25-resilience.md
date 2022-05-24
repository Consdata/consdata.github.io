---
layout:    post
title:     "Czy wiesz czym są Resilience4j, CircuitBreaker, RateLimiter i inne?"
date:      2022-05-24 08:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    rmastalerek
image:     /assets/img/posts/2022-05-25-resilience/resilience.jpg
tags:
- Resilience4j
- CircuitBreaker
- RateLimiter
- Java
- Spring Boot
---

## Co to i po co?
Aplikacja nie odpowiada, pod leży, baza padła...

Chyba nikogo nie dziwi, że aplikacje czasem nie działają. Jedną z najlepszych rzeczy, jaką możemy zrobić to przygotować się na taki stan i ograniczyć straty w pozostałych częściach systemu.
Z pomocą przychodzi nam biblioteka Resilience4j, czyli lekka biblioteka udostępniająca narzędzia dla tworzenia systemów tolerujących awarię, zainspirowana przez Netflix Hystrix, ale zaprojektowana dla Javy 8 i programowania funkcjonalnego.

Główne moduły biblioteki to: CircuitBreaker, Bulkhead, RateLimiter, Retry, TimeLimiter oraz Cache. Biblioteka opiera się na dekoratorach, których możemy użyć na lambdzie, metodzie, lub interfejsie funkcyjnym.
Zobaczmy, co one oferują i jak można ich użyć.

## Jak możemy tego użyć?
Każdego z modułów można użyć jako osobnej zależności, ale tu przedstawimy najszybszy i najprostszy sposób użycia Resilencje4j w połączeniu ze SpringBoot.

Aby dodać w naszej aplikacji Resilience4j, wystarczy dodać zależność na resilience4j-spring-boot2 (dodatkowo wymagane są  spring-boot-starter-actuator oraz spring-boot-starter-aop).

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
</dependency>
```

W ten sposób w aplikacji możemy korzystać z CircuitBreaker, Bulkhead, RateLimiter, Retry oraz TimeLimiter. Funkcjonalności możemy konfigurować w konfiguracji aplikacji oraz dodawać dekoratory za pomocą adnotacji. Możliwa jest także utworzenie i konfiguracja modułów bezpośrednio w kodzie. 

## CircuitBreaker
W dosłownym tłumaczeniu bezpiecznik, który otwiera się, gdy wykryje, że funkcjonalność, zwykle zewnętrzna usługa, jest tymczasowo niedostępna. Pozwala to odciążyć usługę i pozwolić jej na powrót do świata żywych.

CircuitBreaker ma 3 stany:
* zamknięty - normalne działanie, w trakcie którego monitorujemy działanie,
* otwarty - stan po wykryciu niedostępności, przez określony czas zwracany jest błąd bez wywoływania oznaczonego kodu,
* w połowie otwarty -  stan występujący po otwarciu w którym sprawdzamy czy funkcjonalność zaczęła działać.

Konfiguracja CircuitBreaker:
```yaml
resilience4j.circuitbreaker:
    instances:
        backendA:
            registerHealthIndicator: true
            slidingWindowSize: 100
        backendB:
            registerHealthIndicator: true
            slidingWindowSize: 10
            permittedNumberOfCallsInHalfOpenState: 3
            slidingWindowType: TIME_BASED
            minimumNumberOfCalls: 20
            waitDurationInOpenState: 50s
            failureRateThreshold: 50
            eventConsumerBufferSize: 10
            recordFailurePredicate: io.github.robwin.exception.RecordFailurePredicate
```

Najważniejszymi parametrami, które możemy konfigurować, są rodzaj i wielkość okna, w którym sprawdzamy procent błędów, oraz parametr określający, od jakiej ilości błędów otwieramy nasz bezpiecznik. Po skonfigurowaniu instancji CircuitBreakera możemy dodać adnotację na metodzie, która nas interesuje.

Adnotacja:
```java
@CircuitBreaker(name = "backendA", fallbackMethod = "fallback")
public Mono<String> method(String param1) {
    return Mono.error(new NumberFormatException());
}
public Mono<String> fallback(String param1, IllegalArgumentException e) {
    log.error("Error for backendA", e);
}
```

## Retry
Jeśli usługi, które wywołujemy, są idempotentne i nie jesteśmy pewni czy udało się wywołać daną funkcjonalność, możemy pokusić się o ponowienie takiej operacji, licząc na to, że za chwilę zacznie działać.

Moduł Retry pozwala zrobić to w łatwy sposób.

Konfiguracja Retry:
```yaml
resilience4j.retry:
    instances:
        backendA:
            maxAttempts: 3
            waitDuration: 10s
            enableExponentialBackoff: true
            exponentialBackoffMultiplier: 2
            retryExceptions:
                - org.springframework.web.client.HttpServerErrorException
                - java.io.IOException
            ignoreExceptions:
                - io.github.robwin.exception.BusinessException
```

Użycie Retry:
```java
@Retry(name = "backendA", fallbackMethod = "fallback")
public Mono<String> method(String param1) {
    return Mono.error(new NumberFormatException());
}
```

## Time Limitter
Moduł TimeLimiter pozwala nam na ograniczenie maksymalnego czasu trwania żądania.

Konfiguracja Retry:
```yaml
resilience4j.timelimiter:
    instances:
        backendA:
            timeoutDuration: 2s
            cancelRunningFuture: true
```

## Rate Limiter
Jeśli nie chcemy zbyt mocno obciążać danej części systemu, możemy ograniczyć liczbę wywołań danej metody w czasie.

Konfiguracja Retry
```yaml
resilience4j.ratelimiter:
    instances:
        backendA:
            limitForPeriod: 10
            limitRefreshPeriod: 1s
            timeoutDuration: 0
            registerHealthIndicator: true
            eventConsumerBufferSize: 100
```

## Składanie wielu dekoratorów
Wszystkie z wymienionych dekoratorów możemy stosować równocześnie.

```java
@CircuitBreaker(name = BACKEND, fallbackMethod = "fallback")
@RateLimiter(name = BACKEND)
@Bulkhead(name = BACKEND)
@Retry(name = BACKEND, fallbackMethod = "fallback")
@TimeLimiter(name = BACKEND)
public Mono<String> method(String param1) {
    return Mono.error(new NumberFormatException());
}
```
