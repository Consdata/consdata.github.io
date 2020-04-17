---
layout:    post
title:     "Hystrix - praktyczne użycie circuit breaker'a"
date:      2016-12-22 08:00:00 +0100
published: true
author:    jwilczewski
image:     hystrix.png
tags:
    - hystrix
    - circuit breaker
---

## Awaria:
Do katastrofy prowadzi często splot różnych czynników, które w pojedynkę nie stanowią większego zagrożenia. Wymieńmy więc:
- system, z którym się komunikujemy miewa od czasu do czasu długi czas odpowiedzi - no, cóż zdarza się, cztery dziewiątki to wciąż 0,01% możliwych faili, przy 0.5 miliona requestów dziennie, wychodzi jakieś 5000 - rozwiązanie: dłuższe timeouty;
- zdarzają się dłuższe przerwy, np. system nie działa parę minut - brak bezprzerwowych wdrożeń, problemy ze stabilnością środowiska - póki nie wpływa to bezpośrednio na user experience jest do ogrania, np. za pomocą kolejek;
- ograniczona liczba wątków w kontenerze aplikacji - sprzęt kosztuje czy to w chmurze czy we własnej serwerowni.

Całkiem prawdopodobny scenariusz awarii: System zewnętrzny przestaje odpowiadać. Z racji tego, że timeouty mamy dosyć wysokie do obsługi rosnącej liczby requestów w naszej aplikacji przydzielane są kolejne wątki kontenera. Dochodzimy do momentu, w którym wszystkie wątki są w użyciu (np. w Tomcacie domyślnie jest 100). Jeżeli w tym samym kontenerze działają inne usługi to obsługa requesta w każdej z nich czeka na wolny wątek. Co za tym idzie wywołania usług, które do tej pory odpowiadały bardzo szybko i nie potrzebują do swojego działania systemu zewnętrznego są de facto od niego zależne. Awaria występuje dosyć szybko do wykorzystania 100 wątków wystarczy ruch 50 requestów/s i timeout 2000 ms.

Poniżej filmik z przykładowego scenariusza takiej awarii. W lewym oknie widzimy czasy odpowiedzi aplikacji niezależnej od systemu zewnętrznego, w prawej aplikacja korzystające z tego systemu z timeoutem 800 ms. W celach przykładu liczba wątków serwera webowego została ograniczona do pięciu. W 25 sekundzie zewnętrzny system zostaje wyłączony. Aplikacja korzystająca z niego, co zrozumiałe zwiększa czasy odpowiedzi do 800 ms. Niestety z powodu zajętości wątków serwera aplikacja niezależąca od zewnętrznego systemu (lewe okno) zwiększa czasy odpowiedzi z 12 ms do prawie 50 ms. Czyli czas odpowiedzi wydłuża się 4 krotnie.

{% include youtube.html movie="2_jwbTviNoI" %}

Czy można jakoś takiej sytuacji zaradzić? Co chcielibyśmy osiągnąć?

## Próba ograniczenia skutków:
Po pierwsze: Spróbujmy ograniczyć propagację awarii na pozostałe komponenty systemu. Skoro system zewnętrzny nie odpowiada w przewidzianym przez nas czasie nie ma sensu bombardowania go kolejnymi requestami. Może jeżeli damy mu trochę czasu dojdzie do ładu. Załóżmy, że system nie działa i nie czekajmy 800 ms na odpowiedź. Co jakiś czas sprawdźmy czy czasem nie wstał.

Taki model działania realizuje [circuit breaker opisany przez Martina Fowlera](http://martinfowler.com/bliki/CircuitBreaker.html). Implementację możemy znaleźć np. w [hystrixie](https://github.com/Netflix/Hystrix), bibliotece wchodzącej w skład stacka Netflix'a.

W testowanym przykładzie posługujemy się prostą spring boot'ową aplikacją składającą się z kontrolera:
```java
package pl.consdata.hystrix.example.hystrixservice;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RandomGeneratorController {

    private final RandomGeneratorServiceClient randomGeneratorServiceClient;

    public RandomGeneratorController(RandomGeneratorServiceClient randomGeneratorServiceClient) {
        this.randomGeneratorServiceClient = randomGeneratorServiceClient;
    }

    @RequestMapping("/random")
    String getRandom() throws InterruptedException {
        return randomGeneratorServiceClient.getRandom();
    }
}
```
klienta serwisu zewnętrznego:
```java
package pl.consdata.hystrix.example.hystrixservice;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;

@FeignClient(name = "random-generator-service", url = "http://localhost:8080")
public interface RandomGeneratorServiceClient {

    @RequestMapping
    String getRandom();
}
```
Sama klasa aplikacji spring boot wygląda tak:
```java
package pl.consdata.hystrix.example.hystrixservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.feign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class HystrixApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(HystrixApplication.class, args);
    }
}
```
Używamy klienta [Feign](https://github.com/OpenFeign/feign) pochodzącego również z biblioteki Netflixa. Feign zawiera w sobie wiele predefiniowanych konfiguracji co znacznie upraszcza powstający kod, aczkolwiek czasami utrudnia nieco zrozumienie co się dzieje w programie ;-) - szczegóły poniżej.

W przykładowej aplikacji potrzebny jest jeszcze plik application.properties zawierający następujące ustawienia:
```bash
server.port=8090                #zmiana portu serwera webowego
feign.hystrix.enabled=false     #wyłączenie domyślnej konfiguracji hystrixa
server.tomcat.max-threads=5     #ograniczenie liczby wątków serwera dla celów naukowych (NIE UŻYWAJ NA PRODUKCJI!!!)
```

## Dodajemy circuit breaker'a:
Aby dodać circuit breakera do naszej aplikacji należy:

- Dodać klasę opakowującą klienta serwisu zewnętrznego komendą hystrixową (adnotacje dostarczane są przez bibliotekę [javanica](https://github.com/Netflix/Hystrix/tree/master/hystrix-contrib/hystrix-javanica)):
    ```java
    package pl.consdata.hystrix.example.hystrixservice;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;

    @Service
    public class RandomGeneratorServiceClientHystrixAware {

        final private RandomGeneratorServiceClient randomGeneratorServiceClient;

        @Autowired
        public RandomGeneratorServiceClientHystrixAware(RandomGeneratorServiceClient randomGeneratorServiceClient) {
            this.randomGeneratorServiceClient = randomGeneratorServiceClient;
        }

        @HystrixCommand(commandKey = "randomCommand")
        public String getRandom() {
            return randomGeneratorServiceClient.getRandom();
        }
    }
    ```
- W kontrolerze zastąpić wywołania RandomGeneratorServiceClient'a wywołaniami RandomGeneratorServiceClientHystrixAware:
    ```java
    package pl.consdata.hystrix.example.hystrixservice;

    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    @RestController
    public class RandomGeneratorController {

        private final RandomGeneratorServiceClientHystrixAware randomGeneratorServiceClient;

        public RandomGeneratorController(RandomGeneratorServiceClientHystrixAware randomGeneratorServiceClient) {
            this.randomGeneratorServiceClient = randomGeneratorServiceClient;
        }

        @RequestMapping("/random")
        String getRandom() throws InterruptedException {
            return randomGeneratorServiceClient.getRandom();
        }
    }
    ```
- Dodać adnotację @EnableCircuitBreaker do konfiguracji aplikacji:
    ```java
    package pl.consdata.hystrix.example.hystrixservice;

    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;
    import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
    import org.springframework.cloud.netflix.feign.EnableFeignClients;

    @EnableCircuitBreaker
    @EnableFeignClients
    @SpringBootApplication
    public class HystrixApplication {

        public static void main(String[] args) throws Exception {
            SpringApplication.run(HystrixApplication.class, args);
        }
    }
    ```
- Dodać konfigurację hystrixa w pliku application.properties:
    ```bash
    server.port=8090
    feign.hystrix.enabled=false
    server.tomcat.max-threads=5

    hystrix.command.randomCommand.execution.isolation.thread.timeoutInMilliseconds=800  #timeout komendy hystrixowej "randomCommand" zdefinowanej w klasie RandomGeneratorServiceClientHystrixAware adnotacją @HystrixCommand(commandKey = "randomCommand")
    hystrix.command.randomCommand.circuitBreaker.requestVolumeThreshold=10              #liczba requestów, dla których musi wystąpić timeout w 10 sekundowym oknie, aby circuit breaker otworzył obwód
    hystrix.command.randomCommand.metrics.rollingStats.timeInMilliseconds=10000         #czas okna, w którym zliczane są błędne requesty
    ```
- Dodać zależność na biblioteki hystrixowe:
    ```xml
    <project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>

        <groupId>pl.consdata.hystrix.example</groupId>
        <artifactId>hystrixservice</artifactId>
        <version>1.0-SNAPSHOT</version>

        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-feign</artifactId>
                <version>1.2.2.RELEASE</version>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-hystrix</artifactId>
                <version>1.2.3.RELEASE</version>
            </dependency>
        </dependencies>

        <dependencyManagement>
            <dependencies>
                <dependency>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-dependencies</artifactId>
                    <version>1.4.2.RELEASE</version>
                    <type>pom</type>
                    <scope>import</scope>
                </dependency>
            </dependencies>
        </dependencyManagement>
    </project>
    ```

Poniższy film pokazuje jak zachowuje się zmodyfikowana aplikacja. W lewym oknie czas odpowiedzi aplikacji niekorzystającej z systemu zewnętrznego. W prawej tak jak poprzednio czasy aplikacji korzystającej z tego systemu.

{% include youtube.html movie="i535Xhhwabc" %}

W 20 sekundzie filmu wyłączony zostaje system zewnętrzny. Skutkuje to wzrostem czasów odpowiedzi aplikacji z niego korzystającej do 800 ms. Czasy odpowiedzi aplikacji niezależnej również wzrastają - do tej pory jeszcze nic się nie zmieniło względem pierwotnego zachowania. Po około 10 sekundach circuit breaker otwiera obwód i klient od razu odpowiada, że system jest niedostępny - czasy wywołania spadają, czasy wywołania niezależnej aplikacji wracają do normy. Co jakiś czas widać w prawym oknie nieco dłuższe czasy wywołania - to hystrix sprawdza czy system zewnętrzny jest już dostępny. Około 50 sekundy system zewnętrzny zostaje ponownie włączony.

## Próba zachowania funkcjonalności:
Hystrix umożliwia nam podjęcie akcji naprawczej w momencie wystąpienia błędu. Aby skonfigurować taką akcję należy uzupełnić pole fallbackMethod w adnotacji HystrixCommand:
```java
package pl.consdata.hystrix.example.hystrixservice;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;

@Service
public class RandomGeneratorServiceClientHystrixAware {

    final private RandomGeneratorServiceClient randomGeneratorServiceClient;

    @Autowired
    public RandomGeneratorServiceClientHystrixAware(RandomGeneratorServiceClient randomGeneratorServiceClient) {
        this.randomGeneratorServiceClient = randomGeneratorServiceClient;
    }

    @HystrixCommand(commandKey = "randomCommand", fallbackMethod = "getRandomFallback")
    public String getRandom() {
        return randomGeneratorServiceClient.getRandom();
    }

    private String getRandomFallback() {
        return String.valueOf(new Random().nextInt());
    }
}
```
W tym przykładzie jako fallbackMethod podaliśmy metodę prywatną getRandomFallback, która bierze na siebie odpowiedzialność generowania liczby losowej. Taka implementacja powoduje, że każdy request do naszej aplikacji zwróci poprawną odpowiedź. Nawet kiedy system zewnętrzny będzie niedostępny. Od chwili wystąpienia awarii do momentu otworzenia obwodu przez circuit breakera czasy odpowiedzi będą zbliżone do timeoutu skonfigurowanego dla systemu zewnętrznego. Po otworzeniu obwodu metoda fallbackowa będzie wywoływana od razu - co oznacza, że czasy wywołania powrócą do standardowych lub niższych wartości.

## Ciekawostki:
### Konfiguracja klienta Feign:
FeignClient dostarcza wielu standardowych konfiguracji. W zasadzie wystarczy gdy w adnotacji wypełnimy pole url. Jeżeli chcemy jednak zmienić jakiś parametr konfiguracji możemy uzupełnić pole configuration podając nazwę klasy zawierająca springową konfigurację beanów. Jeżeli chcemy np. zmodyfikować standardową konfigurację timeoutów dodajemy beana:
```java
@Bean
Request.Options options() {
    return new Request.Options(750, 200);
}
```
Pierwszy parametr konstruktora to connection timeout, drugi read timeout. Dostarczając taką konfigurację spodziewalibyśmy się, że po 750 ms dostaniemy timeout połączenia i tu niespodzianka, ...dostaniemy go po 3750 ms. A to dlatego, że FeignClient zawiera w sobie retryer'a, który domyślnie 5 razy powtarza wywołanie. Aby to zmienić należy dostarczyć w klasie konfiguracji beana:
```java
@Bean
Retryer.Default retryer() {
    return new Retryer.Default(10000L, 3000, 1);
}
```
Ostatni parametr to liczba powtórzeń.

### Leniwa inicjalizacja komend hystrixa:
Zainstancjonowanie komendy hystrixowej odbywa się podczas pierwszego jej użycia. Może nieść to ze sobą pewne przykre konsekwencje, gdyż inicjalizacja takiej komendy co ciekawe potrafi trwać dość długo. Hystrix próbuje na różne sposoby ustalić wszystkie parametry komendy (jest ich dużo). W produkcyjnej konfiguracji zdarzało się czas ten wynosił nawet 1000 - 2000 ms. Oznacza to, że po restarcie serwera czas pierwszego wywołania komendy może się znacznie różnić od kolejnych i może to doprowadzić do przekroczenia jakiegoś ustalonego czasu odpowiedzi. Implementując w ten sposób usługi synchroniczne warto moim zdaniem rozważyć wprowadzenie specjalnego 'pustego' wywołania, które spowoduje zainicjalizowanie krytycznych komend. Takie rozwiązanie wydaje się być nieco infantylne, ale rzeczywiście nie ma na to rady.
