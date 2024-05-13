---
layout:    post
title:     "Domain Driven Design w oparciu o Axon Framework - odpowiedzi na pytania!"
date:      2021-02-10 08:00:00 +0100
published: true
lang:      pl
author:    mkociszewski
image:     /assets/img/posts/2021-02-10-odpowiedzi-na-pytania-cd-tech-5/thumbnail.webp
tags:
- ddd
- axon
- consdata tech
- cdtech#5
description: "Zgodnie z obietnicą, przyszedł czas odpowiedzieć na pytania, które pozostały bez odpowiedzi podczas naszego minionego eventu - Consdata Tech."
---

Zgodnie z obietnicą, przyszedł czas odpowiedzieć na pytania, które pozostały bez odpowiedzi podczas naszego minionego eventu - Consdata Tech.
{% include youtube.html movie="-b626JY4d20" %}
Nie przedłużając więc, przejdę do części właściwej. ;)

## Jeśli replayEvents jest wyłączony, to czy framework przy starcie aplikacji potrafi odczytać stan np. Issue z bazy danych i dalej na nim operować?
Zacznę od pytania, przy którym zatrzymam się trochę dłużej, bo jest tu parę kwestii do omówienia.
Należałoby na samym początku rozróżnić odtwarzanie zdarzeń na dwie podgrupy:
- Odtwarzanie stanu agregatu
- Odtwarzanie stanu systemu (replay)

Pierwszy typ odtwarzania służy do skonstruowania stanu agregatu (na podstawie wszystkich zdarzeń lub snapshota + delty zdarzeń), w momencie, gdy pojawia się nowy command w systemie.
Jest to konieczne, aby sprawdzić niezmienniki/warunki i w odpowiedzi na command wyemitować zdarzenie, lub też nie.
Na ten mechanizm nie mamy wpływu i nie da się go wyłączyć.

Drugi typ odtwarzania to właśnie te "replay events", którego zapewne tyczy się pytanie.
Tu już jak najbardziej mamy wiele możliwości konfiguracyjnych w Axonie.

Wszystko rozbija się o Event Processory i składowanie Tracking Tokenów w Token Store.
W momencie, gdy odpalimy aplikację na domyślnej konfiguracji, wszystkie Tokeny trafiają do InMemoryTokenStore, czyli siłą rzeczy po restarcie aplikacji przepadają.
Ta wiedza pozwoliła mi zaprezentować EventSourcing na ostatniej prelekcji.

Oczywiście domyślne konfiguracje nie są zalecane na produkcji, a dokumentacja jawnie mówi o wymogu dostarczenia implementacji Token Store do konfiguracji.
Możemy to zrobić samemu lub wykorzystać gotowca, jeśli istnieje (np dla Mongo istnieje taki Token Store).
W momencie, gdy dostarczymy takową implementację, wówczas Tracking Tokeny zaczną trafiać do bazy.
Nadal jednak można będzie wykonać replay events (np zapiąć jakiś endpoint na taką akcję), o ile nie wyłączymy tego całkowicie w konfiguracji (opisuję to w kolejnym akapicie).

## Czy można wyłączyć domyślne zachowanie Axona w kontekście odtwarzania eventów przy starcie aplikacji?
Tak, odpowiedziałem na to pytanie podczas webinaru, lecz w tej chwili mogę wrócić już z konkretnym przykładem w kodzie.
Podczas transmisji wspominałem o tym, że taka możliwość istnieje i można wręcz wskazać w konfiguracji Event Processor (czyli obiekt odpowiadający za przetwarzanie zdarzeń), który ma być ignorowany podczas odtwarzania.

Event Processory domyślnie dostają nazwę stworzoną na podstawie javowego package, w którym się znajdują (zdaje się, że wyjątkiem są tu Sagi).
Możemy je też jawnie nazywać z użyciem adnotacji **`@ProcessingGroup`**.
Mając nazwę processora, w konfiguracji można wykluczyć go z akcji odtwarzania stanu, poprzez sprytne wskazanie, aby Tracking Tokeny dla niego tworzyły się na końcu "jego kolejki".
Wygląda to następująco:
```java
@Configuration
public class AxonConfig {

    @Autowired
    public void customTrackingConfig(EventProcessingConfigurer configurer) {
        var trackingProcessorConfig = TrackingEventProcessorConfiguration
                .forSingleThreadedProcessing()
                .andInitialTrackingToken(StreamableMessageSource::createHeadToken);

        // This prevents from replaying in MovieSaga
        configurer.registerTrackingEventProcessor("MovieSagaProcessor",
                org.axonframework.config.Configuration::eventStore,
                c -> trackingProcessorConfig);

        // This prevents from replaying MultipleMoviesRefreshedEvent in RefreshEventHandler
        configurer.registerTrackingEventProcessor("com.kociszewski.moviekeeper.notreplayable",
                org.axonframework.config.Configuration::eventStore,
                c -> trackingProcessorConfig);
    }
}
```
Opisując powyższy kod językiem ludzkim: klasa **MovieSaga** oraz wszystkie klasy obsługujące zdarzenia, które znajdują się w package'u **com.kociszewski.moviekeeper.notreplayable** zostaną pominięte podczas operacji replay events.
Uwaga! Jeśli wskażecie package za wysoko, to nie zadziała - musi to być nazwa package'u, w którym znajdują się klasy obsługujące zdarzenia (zagnieżdżenia nie będą uwzględniane).

Namiary na projekt podane są na końcu, jest to ten sam projekt, który omawiałem we wcześniejszych [**wpisach**](https://blog.consdata.tech/authors/mkociszewski.html).

## Jak sobie radzicie w Consdacie z organizacją Event Stormingów w czasach pracy zdalnej?
Z pełnym spokojem mogę polecić [**miro**](https://miro.com) - świetne narzędzie z mnóstwem możliwości.
Na koncie bezpłatnym można naprawdę wiele zdziałać. 
Oczywiście to wciąż nie to samo, co 'realne' spotkanie w grupie projektującej, ale większość zalet Event Stormingu wyciągniemy nawet w remote. 

## Co w momencie, gdy Axon zacznie odtwarzać zdarzenia z klasy, która wrzuca lub aktualizuje coś w bazie?
Tutaj jest kilka możliwych rozwiązań. Najprostszym z nich jest opatrzyć klasę/metodę adnotacją **`@DisallowReplay`**, powinno to skutecznie zatrzymać Event Processor.

Jeśli jednak chcielibyśmy, aby klasa/metoda brała udział w odtwarzaniu zdarzeń (przykładowo chcemy móc migrować na inną bazę, ale nie chcemy aby nam się duplikowały krotki w bazie), to widzę tu dwa rozwiązania.
Jednym z nich jest konfiguracja sterowana profilem - powinno zadziałać, ale nie sprawdzałem.
Drugi sposób to obsługa takiego przypadku ręcznie, samemu:
```java
public class MovieProjection {
    ...
    @EventHandler
    public void handle(MovieSavedEvent event) {
        movieRepository.findByExternalMovieId(event.getExternalMovie().getExternalMovieId()).ifPresentOrElse(
                movie -> handleMovieDuplicate(),
                () -> persistMovie(event));
    }
    
    private void handleMovieDuplicate() {
        notifySubscribers(new MovieDTO(MovieState.ALREADY_ADDED));
    }
    ...
}
```
W tym przypadku wywołanie notifySubscribers powoduje wyemitowanie (przy użyciu queryUpdateEmittera) nowego filmu z ustawionym statusem ALREADY_ADDED.
Pojawienie się filmu o takim statusie jest obsługiwane wyżej i skutkuje zwróceniem kodu błędu 409, mówiącym o konflikcie.

## Co dalej?
Jeśli szukacie projektów związanych z tematem DDD i Axona, to zerknijcie tu:
  - [Repozytorium, które omawiałem na Consdata Tech](https://github.com/matty-matt/ddd-helpdesk)
  - [Repozytorium, które cytuję tutaj](https://github.com/matty-matt/movie-keeper-core)

