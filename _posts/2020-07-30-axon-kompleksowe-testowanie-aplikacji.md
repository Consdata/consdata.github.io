---
layout:    post
title:     "Axon - Kompleksowe testowanie aplikacji"
date:      2020-07-30 08:00:00 +0100
published: true
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
Myślę, że warto zacząć od przetestowania domeny, czyli logiki biznesowej zawartej w obiektach domenowych.
W Axonie jest to ułatwione, poprzez gotowe narzędzia, które dostajemy w pakiecie z frameworkiem.
## Agregaty
Zostając przy aplikacji z poprzedniego wpisu, weźmy jako przykład oznaczanie filmu jako obejrzany/nieobejrzany.
Niezmiennik agregatu mówi, że gdy film jest już oznaczony jako obejrzany, to nie możemy tego zrobić ponownie (zmienić stan na ten sam i odwrotnie).
Wystąpienie takiej anomalii odnotowywane jest w logu, a **ToggleWatchedEvent** nie zostaje wyemitowany.
```java
@Aggregate
public class MovieAggregate {
    ...
    @CommandHandler
    public void handle(ToggleWatchedCommand command) {
        if (this.watched.isWatched() == command.getWatched().isWatched()) {
            log.info("Cannot toggle to the same state, skipping..");
            return;
        }
        apply(new ToggleWatchedEvent(command.getMovieId(), command.getWatched()));
    }
    ...
}
```
Rozważmy tzw. happy path w testach dla tego przypadku biznesowego. 
Będziemy potrzebować obiektu **FixtureConfiguration**, który zasymuluje nam sytuację, w której może znaleźć się nasz agregat.
```java
public class MovieAggregateTest {
    ...
    private FixtureConfiguration<MovieAggregate> fixture;

    @BeforeEach
    public void setup() {
        this.fixture = new AggregateTestFixture<>(MovieAggregate.class);
        ...
    }
}
```
Test piszemy w następujący sposób:
1. Określamy "punkt startowy" dla naszego agregatu, czyli jakie eventy zostały zastosowane w agregacie do tej pory (jest to **given** w podejściu behawioralnym).
2. Wpisujemy command, który chcemy poddać testom (odpowiednio - **when**). W naszym przypadku to **ToggleWatchedCommand**
3. Definiujemy stan oczekiwany i/lub wyemitowane eventy (**then/expect**).

```java
public class MovieAggregateTest {
    ...
    @Test
    public void shouldToggleWatchedEventAppear() {
        fixture.given(                                                              // 1
                    new MovieCreatedEvent(movieId, searchPhrase),
                    new MovieSavedEvent(movieId, externalMovie))
                .when(new ToggleWatchedCommand(movieId, new Watched(true)))         // 2
                .expectEvents(new ToggleWatchedEvent(movieId, new Watched(true)))   // 3
                .expectState(                                                       // 3
                    state -> assertThat(state.getWatched().isWatched()).isTrue());
    }
}
```
Druga ścieżka do sprawdzenia to brak emisji zdarzenia w momencie zmiany stanu na ten sam.
Dorzućmy więc do **given** wystąpienie eventu **ToggleWatchedEvent** - wtedy agregat nie powinien wyemitować nic nowego:
```java
public class MovieAggregateTest {
    ...
    @Test
    public void shouldNotToggleWatchedEventAppear() {
        fixture.given(
                    new MovieCreatedEvent(movieId, searchPhrase),
                    new MovieSavedEvent(movieId, externalMovie),
                    new ToggleWatchedEvent(movieId, new Watched(true)))
                .when(new ToggleWatchedCommand(movieId, new Watched(true)))
                .expectNoEvents();
    }
}
```

## Sagi
Drugim obiektem domenowym, który poddam testom, jest Saga, w której umieściłem logikę, która ma się wykonać po wyemitowaniu eventu (lub kilku eventów) przez konkretny agregat.
W mojej aplikacji zdarzeniem otwierającym sagę dla filmu jest **MovieCreatedEvent** wyemitowany przez MovieAggrate - po jego pojawieniu się, wysyłam command, który zostanie obsłużony w mikroserwisie (*proxy-service*) odpowiedzialnym za pobieranie szczegółów filmu z zewnętrznego źródła:
 ```java
public class MovieSaga {
    ...
    @StartSaga
    @SagaEventHandler(associationProperty = MOVIE_ID)
    public void handle(MovieCreatedEvent event) {
        movieId = event.getMovieId();
        String proxyId = PROXY_PREFIX.concat(movieId);
        associateWith("proxyId", proxyId);
        commandGateway.send(new FetchMovieDetailsCommand(proxyId, event.getSearchPhrase()));
    }
    ...
}
```
Proces ten może trochę potrwać (niedostępność zewnętrznego źródła, timeouty, problemy z łączem), dlatego też zdecydowałem się na sagę, która jest rozwiązaniem nieblokującym.
Gdy *proxy-service* wyemituje odpowiedź w postaci **MovieDetailsEvent**, to w zależności czy film został znaleziony, ślę command z uzupełnionymi szczegółami dla filmu (lub nie), a saga powinna się zakończyć:
```java
public class MovieSaga {
    ...
    @SagaEventHandler(associationProperty = PROXY_ID)
    @EndSaga
    public void handle(MovieDetailsEvent event) {
        var movie = event.getExternalMovie();
        if (MovieState.NOT_FOUND_IN_EXTERNAL_SERVICE == movie.getMovieState()) {
            // handle when movie not found
        } else {
            commandGateway.send(new SaveMovieCommand(movieId, event.getExternalMovie()));
        }
    }
    ...
}
```
Do przetestowania tego przypadku znów będziemy potrzebować **fixture**, tyle że tym razem skrojony pod sagi:
```java
public class MovieSagaTest {
    ...
    private SagaTestFixture<MovieSaga> fixture;

    @BeforeEach
    public void setup() {
        fixture = new SagaTestFixture<>(MovieSaga.class);
        ...
    }
}
```
Testy mają sprawdzić czy odpowiednie commandy zostaną wyemitowane, oraz czy saga "wystartowała", bądź zakończyła się pod pewnymi warunkami.
Struktura prezentuje się następująco:
1. Mając agregat X o identyfikatorze równym **movieId**.
2. Wiedząc, że X nie wyemitował żadnego eventu / wyemitował konkretny event.
3. To gdy agregat X.
4. Wyemituje konkretny event.
5. Oczekujemy aktywnej/nieaktywnej sagi oraz opublikowany command / nieopublikowanie niczego.
```java
public class MovieSagaTest {
    ...
    @Test
    public void shouldDispatchFetchMovieDetailsCommand() {
        fixture.givenAggregate(movieId)                                      // 1
                .published()                                                 // 2
                .whenAggregate(movieId)                                      // 3
                .publishes(new MovieCreatedEvent(movieId, searchPhrase))     // 4
                .expectActiveSagas(1)                                        // 5
                .expectDispatchedCommands(                                   
                    new FetchMovieDetailsCommand(proxyId, searchPhrase));
    }
    @Test
    public void shouldDispatchSaveCastCommand() {
        fixture.givenAggregate(movieId)                                       // 1
                .published(new MovieCreatedEvent(movieId, searchPhrase))      // 2
                .whenAggregate(proxyId)                                       // 3
                .publishes(new MovieDetailsEvent(proxyId, externalMovie))     // 4
                .expectActiveSagas(0)                                         // 5
                .expectDispatchedCommands(                                    
                    new SaveMovieCommand(movieId, externalMovie));
    }
}
```

# Testy integracyjne
- Problem testów integracyjnych (znaleźć wpis axoniq mówiący o tym, że jest to niemożliwe?)
- Rozwiązanie problemu - przykładowa implementcja (jakie problemy napotkałem po drodze, być może na trello mam gdzieś zapisane, ale na pewno kwestia namiarów na axon-server + uwaga żeby nie podłączyć się do 'produkcyjnego')

# Automatyzacja
- Przedstawienie Travisa i jego możliwości, zalety
- Przykładowy config z omówieniem
- Screenshoty z działającej instalacji
