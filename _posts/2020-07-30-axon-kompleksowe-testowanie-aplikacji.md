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
### Agregaty
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
    @Test
    public void shouldToggleWatchedEventAppear() {
        fixture.given(
                    new MovieCreatedEvent(movieId, searchPhrase), // 1
                    new MovieSavedEvent(movieId, externalMovie))
                .when(new ToggleWatchedCommand(movieId, new Watched(true))) // 2
                .expectEvents(new ToggleWatchedEvent(movieId, new Watched(true))) // 3
                .expectState(state -> assertThat(state.getWatched().isWatched()).isTrue());
    }
```
Druga ścieżka do sprawdzenia to brak emisji zdarzenia w momencie zmiany stanu na ten sam.
Dorzućmy więc do **given** wystąpienie eventu **ToggleWatchedEvent** - wtedy agregat nie powinien wyemitować nic nowego:
```java
    @Test
    public void shouldNotToggleWatchedEventAppear() {
        fixture.given(
                    new MovieCreatedEvent(movieId, searchPhrase),
                    new MovieSavedEvent(movieId, externalMovie),
                    new ToggleWatchedEvent(movieId, new Watched(true)))
                .when(new ToggleWatchedCommand(movieId, new Watched(true)))
                .expectNoEvents();
    }
```

### Sagi

# Testy integracyjne
- Problem testów integracyjnych (znaleźć wpis axoniq mówiący o tym, że jest to niemożliwe?)
- Rozwiązanie problemu - przykładowa implementcja (jakie problemy napotkałem po drodze, być może na trello mam gdzieś zapisane, ale na pewno kwestia namiarów na axon-server + uwaga żeby nie podłączyć się do 'produkcyjnego')

# Automatyzacja
- Przedstawienie Travisa i jego możliwości, zalety
- Przykładowy config z omówieniem
- Screenshoty z działającej instalacji
