---
layout:    post
title:     "Mikroserwisy na Axonie"
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

Znając definicję Event Sourcingu oraz korzyści, jakie nam zapewnia (dla przypomnienia polecam [**wpis Marcina poświęcony częściowo tej tematyce**]({% post_url 2018-11-15-czy-apache-kafka-nadaje-sie-do-event-sourcingu %})) warto rozważyć zastosowanie tego wzorca w swoim projekcie (oczywiście nie wszędzie się on nada).
Osoby zainteresowane tematem z pewnością zostaną postawione przed wyborem technologii, w której rozpoczną implementację. 
Niezależnie od języka programowania, można implementować CQRS oraz Event Sourcing samemu, od A-Z, jednakże byłoby to czasochłonne i może prowadzić do wielu błędów. 
Alternatywą będzie zatem skorzystanie z gotowego frameworku, który od początku tworzony był z myślą o wspomnianych wzorcach (włączając w to mikroserwisy) - mowa tutaj o [**AxonFramework**](https://axoniq.io/).

W tym wpisie przedstawię Axona i omówię wybory, przed którymi stałem w kontekście tego frameworka, oraz drogę migracji z monolitu do mikroserwisów wraz z problemami, na które się natknąłem.

# Krótko o Axonie
AxonFramework to... framework, który czerpie garściami z Domain Driven Design (które jest poza zakresem tego wpisu), wykorzystując również nomenklaturę panującą w tym podejściu, którą także będę się posługiwał w tym wpisie.
Axon bierze na barki zarządzanie przepływem wszystkich informacji między komponentami np. kierowanie commandów do odpowiednich agregatów, czy zapisywanie eventów w event store. 
Jeżeli chodzi o kwestie event store'a to framework zostawia tu pełną dowolność, choć nie każda baza spełni się w tej roli.
Dodatkowym plusem jest bezproblemowa integracja ze Spring Bootem, możliwość skalowania i gotowość produkcyjna, co moim zdaniem plasuje Axona jako mocnego gracza.

# Event store
Fundamentem projektu opartego o Event Sourcing jest oczywiście event store - źródło prawdy całego systemu, stąd wybór narzędzia pod tę funkcję jest kluczowy.

### Może Kafka?
Kafka opiera się na eventach, których kolejność pojawiania się może zostać zachowana - co zapobiega sytuacji, w której wykonamy aktualizację krotki, zanim zostanie ona utworzona.
Ponadto Kafka trzyma dane na topicach, zapamiętując offset (liczbę porządkową) dla każdego eventu. Znając offset istnieje możliwość odtworzenia topica od tego offsetu, aż do końca - umożliwia to odtwarzanie idealnego stanu aplikacji dosłownie na zawołanie (dopóki nie mamy do czynienia z paruset milionami eventów :wink:).
Do tego Kafka bardzo łatwo się skaluje oraz uniemożliwia edycję nałożonych eventów, co niewątpliwie jest plusem. Jest jednak parę punktów, które brakują Kafce, do bycia idealnym kandydatem na event store:
- Problem pojawia się w momencie, gdy chcielibyśmy odtworzyć agregat na podstawie eventów. 
Kafka w tym momencie musiałaby przeiterować cały topic od pewnego offsetu, aż do końca.
W kolejnym kroku konieczne jest odfiltrowanie eventów nie związanych z agregatem, który próbujemy odtworzyć, co wymaga od nas dodatkowej logiki w kodzie, oraz nakłada niepotrzebny dodatkowy narzut na event store (odfiltrowane eventy nie są nam potrzebne).
- Drugim problemem jest brak natywnego wsparcia dla mechanizmu snapshotów, bez którego odtwarzanie stanu przy dużym narzucie zdarzeń może trwać wieki.

Potencjalnym rozwiązaniem pierwszego problemu mógłby być osobny topic dla każdego agregatu, wówczas odpada konieczność filtrowania eventów.
To rozwiązanie jednak może nie sprawdzić się przy ogromnej ilości agregatów. 
Wynika to ze sposobu, w jaki Kafka przechowuje topici (a właściwie partycje) - dla każdej tworzony jest osobny katalog w systemie plików. 
Szczegółowe wyjaśnienie znajduje się w [**filmie**](https://youtu.be/zUSWsJteRfw?t=2179) przygotowanym przez AxonIQ (firma odpowiedzialna za rozwój Axona).

### AxonServer
W kwestii event store AxonIQ wyszedł na przeciw potrzebom dając do dyspozycji swoje narzędzie, które idealnie spełnia się w tej roli - AxonServer:
- Pozwala na dokładanie eventów (z jednoczesnym brakiem możliwości edycji już istniejących).
- Zapewnia stałą wydajność niezależnie od ilości danych przetrzymywanych w event store.
- Umożliwia konstruowanie snapshotów dla agregatów i nakładanie ich (w przypadku dużej ilości eventów rekonstrukcja agregatu bez funkcjonalności snapshotów może trochę trwać).

Po uruchomieniu AxonServera mamy dostęp do dashboardu pokazującego, który mikroserwis jest podpięty pod event store wraz z jego liczbą instancji:
![AxonDashboard](/assets/img/posts/2020-05-11-microservices-on-axon/axon_dashboard.png)
Na samym dashboardzie, funkcjonalności panelu administracyjnego się nie kończą:
- Podgląd konfiguracji wraz z przepustowością (commandy/eventy/query/snapshoty na sekundę).
- Możliwość wyszukiwania eventu przy użyciu zapytań.
- Tabelka ze wskazaniem, który command, ile razy i w jakim serwisie został obsłużony.
- Zarządzanie dostępem do panelu.

Oczywiście AxonFramework jest w pełni kompatybilny z AxonServerem i działa out-of-the-box, bez dodatkowej konfiguracji.

# Najpierw monolit
Zaczynając przygodę z Axonem, nie chciałem skakać na głęboką wodę, zacząłem więc od monolitu, mając jednak z tyłu głowy perspektywę zmigrowania na coś bardziej skalowalnego.
Migracja z monolitu na mikroserwisy nierzadko sprawia wiele problemów, tak było również w moim przypadku z [**tą aplikacją**](https://github.com/matty-matt/movie-keeper-core).
W skrócie pozwala ona na wyszukiwanie filmów po tytułach, wraz z ich obsadą oraz trailerami korzystając z [**API TMDb**](https://developers.themoviedb.org/3/getting-started), zapisywanie wszystkiego w bazie, oznaczanie filmu jako przeczytany oraz sprawdzanie premiery cyfrowego wydania.
Stworzyłem więc agregat filmu wraz z encjami zawierającymi trailery oraz obsadę:
```java
@Aggregate
public class MovieAggregate {
    @AggregateIdentifier
    private MovieId movieId;
    @AggregateMember
    private TrailerEntity trailerEntity;
    @AggregateMember
    private CastEntity castEntity;
    ...
}
```
Pobieranie danych z zewnętrznego serwisu działo się w EventHandlerze, poprzez zawołanie odpowiedniej metody z interfejsu ExternalService:
```java
@Service
public class MovieEventsHandler {
    ...
    @EventHandler
    public void handle(MovieSearchDelegatedEvent event) {
            log.info("Handling {}, id={}", event.getClass().getSimpleName(), event.getMovieId().getId());
            try {
                ExternalMovie externalMovie = externalService.searchMovie(event.getSearchPhrase());
                commandGateway.send(new SaveMovieCommand(event.getMovieId(), externalMovie));
            } catch (NotFoundInExternalServiceException e) {
                queryUpdateEmitter.emit(GetMovieQuery.class, query -> true, new MovieDTO(MovieState.NOT_FOUND_IN_EXTERNAL_SERVICE));
            }
    }
    ...
}
```
Projekt w tym momencie spełniał moje wymagania i składał się z trzech elementów:
1. Aplikacja-monolit
2. Event store - AxonServer
3. Storage, read model - MongoDB
 
Uwidoczniły się poszczególne funkcjonalności, które mogłyby być odrębnymi serwisami - mowa tu o zarządzaniu: filmami, trailerami oraz obsadą (cyfrowe premiery też powinny mieć swój serwis).

# Mikroserwisy
Przyszła pora na przekucie teorii w praktykę wykorzystując wypracowany wcześniej podział odpowiedzialności.
Aplikacja podzielona na mniejsze fragmenty (realizujące skończone funkcjonalności) wyglądałaby w ten sposób:
- proxy-service, odpowiedzialny za pobieranie danych z zewnętrznego serwisu.
- trailer-service, obsługujący zapis/odczyt trailerów, serwujący endpointy do pobierania trailerów.
- cast-service, robiący to samo dla obsady.
- movie-service, odpowiadający za szczegóły dot. filmu wraz z funkcjonalnością cyfrowych premier, serwujący wszystkie endpointy związane z filmem.

Przejście na mikroserwisy wiązało się również ze stworzeniem API Gateway kierującym ruch do odpowiedniego serwisu w zależności od endpointu. 

Na diagramie prezentuje się to następująco:
![AxonDashboard](/assets/img/posts/2020-05-11-microservices-on-axon/diagram_komponentow.png)

### Problemy
Migracja okazała się bezbolesna dla Axon Servera, który bez problemu zaczął wykrywać nowe instancje. 
Pierwsze problemy zaczęły pojawiać się w momencie, gdy chciałem wysłać command do innego mikroserwisu.
Z jakiegoś powodu aplikacja nie potrafiła skorelować commanda o tych samych polach i nazwie w jednym serwisie z identycznym commandem w drugim serwisie.
Okazało się, że problem tkwi w serializacji - commandy były w pakietach o innych nazwach, przez co nie były interpretowane jako ten sam byt.
Nie chcąc tracić czasu, uspójniłem pakiety między commandami i przepływ zaczął działać.

### Usprawnienia
W międzyczasie zastąpiłem EventHandler odpowiadający za pobieranie danych z zewnętrznego serwisu Sagami, które wysyłają commandy do proxy-service, aby wyszukał podany tytuł.
Ten asynchronizm uodpornił aplikację na niedostępność zewnętrznego serwisu lub długi czas odpowiedzi:
- movie-service
```java
@Saga
public class MovieSaga {
    ...
    @StartSaga
    @SagaEventHandler(associationProperty = "movieId")
    public void handle(MovieSearchDelegatedEvent event) {
        log.info("[saga] Handling {}, id={}", event.getClass().getSimpleName(), event.getMovieId());
        movieId = event.getMovieId();
        String proxyId = PROXY_PREFIX.concat(movieId);
        associateWith("proxyId", proxyId);
        commandGateway.send(new FetchMovieDetailsCommand(proxyId, event.getSearchPhrase()));
    }

    @SagaEventHandler(associationProperty = "proxyId")
    @EndSaga
    public void handle(MovieDetailsFetchedEvent event) {
        log.info("[saga] Handling {}, id={}", event.getClass().getSimpleName(), event.getProxyId());

        var movie = event.getExternalMovie();
        if (MovieState.NOT_FOUND_IN_EXTERNAL_SERVICE == movie.getMovieState()) {
            queryUpdateEmitter.emit(GetMovieQuery.class, query -> true, new MovieDTO(MovieState.NOT_FOUND_IN_EXTERNAL_SERVICE));
            end();
        } else {
            commandGateway.send(new SaveMovieCommand(movieId, event.getExternalMovie()));
        }
    }
    ...
}
```
- proxy-service
```java
@Component
public class ProxyCommandHandler {
    ...
    @CommandHandler
    public void handle(FetchMovieDetailsCommand command) {
        ExternalMovie externalMovie;
        try {
            externalMovie = tmdbService.searchMovie(command.getSearchPhrase());
        } catch (NotFoundInExternalServiceException e) {
            externalMovie = ExternalMovie.builder().movieState(MovieState.NOT_FOUND_IN_EXTERNAL_SERVICE).build();
        }

        eventGateway.publish(new MovieDetailsFetchedEvent(command.getProxyId(), externalMovie));
    }
    ...
}
```

Jako że trailers i cast dostały swój własny serwis i nie były już powiązane z agregatem filmu, musiałem przekonwertować je na samodzielne agregaty:
```java
@Aggregate
public class TrailerAggregate {
    @AggregateIdentifier
    private String trailersId;
    private List<Trailer> trailers;
    ...
}
```

# Podsumowanie
Przejście na architekturę mikroserwisów niewątpliwie daje wiele korzyści, jednak bez wyklarowanego dobrego podziału jest to mocno utrudnione.
Axon sam w sobie sprzyja tej architekturze, a korzystając z gotowych narzędzi, można taką migrację przeprowadzić w relatywnie krótkim czasie.

Cały kod znajduje się w moim repozytorium [**tutaj**](https://github.com/matty-matt/movie-keeper-core).

# Źródła
- https://github.com/matty-matt/movie-keeper-core
- https://axoniq.io/
- https://youtu.be/zUSWsJteRfw?t=2179
