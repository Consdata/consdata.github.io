---
layout:    post
title:     "Consdata Tech #5 - odpowiedzi na pytania!"
date:      2021-02-01 08:00:00 +0100
published: true
lang:      pl
author:    mkociszewski
image:     /assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/top.jpg
tags:
- ddd
- axon
- consdata-tech
- cdtech#5
---

Zgodnie z obietnicą, przyszedł czas odpowiedzieć na pytania, które pozostały bez odpowiedzi podczas naszego minionego eventu - Consdata Tech.
Nie przedłużając więc, przejdę do części właściwej. ;)

## Czy można wyłączyć domyślne zachowanie Axona w kontekście odtwarzania eventów przy starcie aplikacji?
Tak, odpowiedziałem na to pytanie podczas webinaru, lecz w tej chwili mogę wrócić już z konkretnym przykładem w kodzie.
Podczas transmisji wspominałem o tym, że taka możliwość istnieje i można wręcz wskazać w konfiguracji package, które ma być ignorowane podczas odtwarzania zdarzeń.
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
Opisując powyższy kod językiem ludzkim: klasa **MovieSaga** oraz wszystkie klasy, które znajdują się w package'u **com.kociszewski.moviekeeper.notreplayable** zostaną pominięte podczas operacji replay events.
Uwaga! Jeśli wskażecie package za wysoko to nie zadziała - musi to być nazwa package'u, w którym znajdują się klasy obsługujące zdarzenia (zagnieżdżenia nie będą uwzględniane).
Namiary na projekt podane są na końcu, ale jest to ten sam projekt, który omawiałem we wcześniejszych [**wpisach**](https://blog.consdata.tech/authors/mkociszewski.html).

## Jak sobie radzicie w Consdacie z organizacją Event Stormingów w czasach pracy zdalnej?
Domain Driven Design i Event Storming w Consdacie wciąż jest w fazie R&D, ale z pełnym spokojem mogę polecić [**miro**](https://miro.com) - świetne narzędzie z mnóstwem możliwości.
Na koncie bezpłatnym można naprawdę wiele zdziałać. 
Oczywiście to wciąż nie to samo, co 'realne' spotkanie w grupie projektującej, ale większość zalet Event Stormingu wyciągniemy nawet w remote. 

## Co w momencie, gdy Axon zacznie odtwarzać zdarzenia z klasy, która wrzuca lub aktualizuje coś w bazie?
Trzeba to mieć na uwadze i w jakiś sposób obsłużyć. Jako przykład mogę podać moje rozwiązanie z projektu, który linkuję w odpowiedzi na pierwsze pytanie.
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

## Jak radzicie sobie z nowymi funkcjonalnościami od biznesu, które wymagają większej analizy? Wracacie do wcześniejszych sesji Event Stormingu i ją wzbogacacie?
Tak jak wspominałem wyżej, nie mamy doświadczeń z produkcyjnym wykorzystaniem Event Stormingu.

## Jeśli replayEvents jest wyłączony, to czy framework przy starcie aplikacji potrafi odczytać stan np. Issue z bazy danych i dalej na nim operować?
Ciekawe pytanie, szczerze mówiąc nigdy się nad tym nie zastanawiałem
- Issue z bazy danych - autor ma na myśli event store?
- Wziąć na tapet skip eventów domenowych (to nic nie zmienia bo i tak leci odtwarzanie stanu dla agregatów - pilnują niezmienników)
- Wziąć na tapet całkowite wyłączenie replay - doczytać

## Co dalej?
Jeśli ktoś z Was ma jeszcze jakieś pytania, które bardzo chciałby mi zadać, a nie zdążył (i nie spisał namiarów na mnie) to śmiało, można się odzywać na mój służbowy adres: 
  - mkociszewski@consdata.com

Jeśli chodzi o projekty związane z tematem to zerknijcie tu:
  - [Repozytorium, które omawiałem na Consdata Tech](https://github.com/matty-matt/ddd-helpdesk)
  - [Repozytorium, które cytuję tutaj](https://github.com/matty-matt/movie-keeper-core)
