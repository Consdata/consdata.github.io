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
[W poprzednim wpisie]({% post_url 2020-06-08-microservices-on-axon %}) opisałem swoje zmagania z migracją monolitu do mikroserwisów na Axonie, nie wspomniałem tam jednak ani słowa o testach.
Ten artykuł ma nadrobić zaległości w tej kwestii. Przedstawię dziś parę elementów składających się na kompleksowo przetestowaną aplikację opartą o Axona.

# Testy domenowe
Zacznijmy od przetestowania domeny, czyli logiki biznesowej zawartej w obiektach domenowych.
W Axonie jest to ułatwione, poprzez gotowe narzędzia, które dostajemy w pakiecie z frameworkiem.
Zaleta tych testów jest taka, że nie podnoszą one żadnego kontekstu, a więc wykonują się bardzo szybko.

## Agregaty
Zostając przy aplikacji z poprzedniego wpisu, weźmy jako przykład oznaczanie filmu jako obejrzany/nieobejrzany.
Niezmiennik agregatu mówi, że gdy film jest już oznaczony jako obejrzany, to nie możemy tego zrobić ponownie - tak samo nieobejrzanego filmu nie możemy "odzobaczyć" ;).
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
3. Definiujemy stan oczekiwany.

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
                .expectState(                                                       
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
Drugim obiektem domenowym, który poddam testom, jest saga (zob. DDD).
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
Gdy *proxy-service* wyemituje zdarzenie **MovieDetailsEvent**, to w zależności od zawartości payloadu, ślę command z uzupełnionymi szczegółami dla filmu lub nie, a saga powinna się zakończyć:
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
Testy mają sprawdzić czy odpowiednie commandy zostaną wyemitowane, oraz czy saga "wystartowała", bądź zakończyła się w odpowiednim momencie.
Szkielet testu wygląda następująco:
1. Mając agregat X z ustalonym identyfikatorem.
2. Wiedząc, że X nie wyemitował żadnego eventu (lub wyemitował konkretny event).
3. To gdy agregat X.
4. Wyemituje konkretny event.
5. Oczekujemy aktywnej (lub nieaktywnej) sagi oraz opublikowany command (lub nieopublikowanie niczego).

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

Jak widać zastosowanie fixture również w przypadku sagi, okazuje się proste i intuicyjne.

# Testy integracyjne
Po testach domenowych, gdy wiemy już, że nasza logika biznesowa jest poprawna (i mamy na to dowody w postaci testów!), można zabrać się za weryfikację trochę większego fragmentu aplikacji.

## Konfiguracja
Testy integracyjne wymagają trochę konfiguracji - twórcy w tym aspekcie akurat nie przygotowali nam rozwiązania.
Na pewnej grupie dyskusyjnej proponują skorzystać z obrazu dockerowego - uruchomić AxonServer z terminala i podłączyć się testami do tej instancji.
Wręcz idealna rola dla [**testcontainers**](https://www.testcontainers.org/) - pomyślałem (po przygotowaniu konfiguracji pod testy, trafiłem na podobne rozwiązanie na stacku).
Stworzyłem klasę umożliwiającą podniesienie potrzebnych kontenerów, aby skorzystać z nich podczas testów:
```java
@ActiveProfiles("test")
public class TestContainers {

    private static final int MONGO_PORT = 29019;
    private static final int AXON_HTTP_PORT = 8024;
    private static final int AXON_GRPC_PORT = 8124;

    public static void startAxonServer() {
        GenericContainer axonServer = new GenericContainer("axoniq/axonserver:latest")
                .withExposedPorts(AXON_HTTP_PORT, AXON_GRPC_PORT)
                .waitingFor(
                        Wait.forLogMessage(".*Started AxonServer.*", 1)
                );
        axonServer.start();

        System.setProperty("ENV_AXON_GRPC_PORT", String.valueOf(axonServer.getMappedPort(AXON_GRPC_PORT)));
    }

    public static void startMongo() {
        GenericContainer mongo = new GenericContainer("mongo:latest")
                .withExposedPorts(MONGO_PORT)
                .withEnv("MONGO_INITDB_DATABASE", "moviekeeper")
                .withCommand(String.format("mongod --port %d", MONGO_PORT))
                .waitingFor(
                        Wait.forLogMessage(".*waiting for connections.*", 1)
                );
        mongo.start();

        System.setProperty("ENV_MONGO_PORT", String.valueOf(mongo.getMappedPort(MONGO_PORT)));
    }
}
```
Należy tu jednak pamiętać o tym, że **withExposedPorts** wystawia porty tylko **wewnątrz kontenera**, potrzebny więc był sposób na pozyskanie portów, do których testy będą mogły się połączyć.
Testcontainers przy każdym restarcie kontenera wystawia go na losowym wolnym porcie z danego zakresu, istnieje jednak metoda na pobranie tych portów w runtime.
Robię to w ostatniej instrukcji, każdej z metod jednocześnie wrzucając znalezione wartości do zmiennych środowiskowych **ENV_AXON_GRPC_PORT** oraz **ENV_MONGO_PORT**.
Zmienne te używam w yamlu konfiguracyjnym pod testy:
```yaml
spring:
  data:
        mongodb:
            uri: mongodb://localhost:${ENV_MONGO_PORT}/moviekeeper
axon:
  axonserver:
        servers: localhost:${ENV_AXON_GRPC_PORT}
```
Metody **startMongo** i **startAxonServer** wykorzystałem w klasie, z której dziedziczą wszystkie testy integracyjne:
```java
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class CommonIntegrationSetup {
    ...
    @BeforeAll
    public static void beforeAll() {
        TestContainers.startAxonServer();
        TestContainers.startMongo();
    }
    ...
}
```
Należy pamiętać o **ustawieniu profilu** i **pliku konfiguracyjnym** pod ten profil - zdarzyło mi się puścić testy (bez tych dwóch rzeczy skonfigurowanych), podczas gdy aplikacja chodziła "produkcyjnie" - można łatwo zgadnąć, do jakiego AxonServera owe testy się podłączyły. :)

## Skonfigurowane. Do dzieła!
W mojej aplikacji w momencie, gdy uda się znaleźć film o żądanym tytule dzieją się dwie operacje:
1. Zwracane są szczegóły znalezionego filmu.
2. Wysyłany jest command, który mówi **znajdź trailery i obsadę dla tego filmu**.

Parę kroków później efektem tego commanda, są kolejne commandy, już skierowane do konkretnego mikroserwisu (odpowiedzialnego za pobranie obsady i trailerów).
Żeby nie było za łatwo, wyszukiwanie czegokolwiek w TMDb zlecam osobnemu mikroserwisowi (zachęcam do spojrzenia na diagram komponentów z [poprzedniego wpisu]({% post_url 2020-06-08-microservices-on-axon %})).
Oczywiście nie chcę, aby test był zależny od jakiegoś serwisu, więc konieczne jest stworzenie mocka (zgodnie z zasadą *duck typingu*):

```java
@Profile("test")
@Slf4j
@Component
@RequiredArgsConstructor
public class MockProxyCommandHandler {

    private final EventGateway eventGateway;

    @CommandHandler
    public void handle(FetchTrailersCommand command) {
        log.info("MOCK fetching...");
        eventGateway.publish(new TrailersDetailsEvent(command.getProxyId(), TRAILERS));
    }
}
```

W teście chcę zasymulować sytuację, w której pojawia się command **CreateTrailersCommand**.
W efekcie aplikacja powinna pobrać trailery dla wskazanego filmu i umieścić je w bazie:
```java
public class TrailersIntegrationTest extends CommonIntegrationSetup {
    @Autowired
    private CommandGateway commandGateway;
    ...

    @BeforeEach
    public void beforeEach() {
        this.movieId = "123";
        this.trailers = generateTrailers(movieId);
    }

    @Test
    public void shouldRetrieveTrailers() {
        // given
        commandGateway.send(new CreateTrailersCommand(trailers.getAggregateId(), trailers.getExternalMovieId(), trailers.getMovieId()));

        await()
            .atMost(FIVE_SECONDS)
            .with()
            .pollInterval(ONE_HUNDRED_MILLISECONDS)
            .until(() -> trailerRepository.findByMovieId(movieId).isPresent());

        // when
        ResponseEntity<TrailerDTO[]> trailerResponse = testRestTemplate
                .getForEntity(
                        String.format(GET_TRAILERS_URL, randomServerPort, movieId),
                        TrailerDTO[].class);
        // then
        assertThat(trailerResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(trailerResponse.getBody()).isNotNull();

        List<TrailerDTO> trailerDTOS = Arrays.asList(trailerResponse.getBody());

        assertThat(trailerDTOS.size()).isEqualTo(2);
        assertThat(trailerDTOS).isEqualTo(trailers.getTrailers());
    }
}
```

Skorzystałem z [**awaitility**](https://github.com/awaitility/awaitility), żeby poczekać chwilę na odpowiedź w razie małej czkawki.  

# Testy E2E
Test user-story, czyli np znalezienie filmu


# Automatyzacja
- Przedstawienie Travisa i jego możliwości, zalety
- Przykładowy config z omówieniem
- Screenshoty z działającej instalacji

# Podsumowanie
Jak widać korzystanie z Axonowych **fixture** bardzo ułatwia testowanie kodu, a i w przypadku testów wymagających szerszego kontekstu również idzie coś zaradzić. 