---
layout:    post
title:     "Budowanie aplikacji Angular CLI + Spring Boot"
date:      2017-01-05 08:00:00 +0100
published: true
lang: pl
author:    glipecki
image:     /assets/img/posts/2017-01-05-budowanie-aplikacji-angular-cli-spring-boot/angular-spring-boot.webp
tags:
    - angular
    - spring boot
description: "Każda nietrywialna aplikacja potrzebuje backendu. O ile obecnie to nie jest prawda, to na potrzeby tego artykułu przyjmijmy, że tak jest. A jak backend współpracujący z aplikacją webową to REST, a jak REST to Spring i Spring Boot. W kilku kolejnych akapitach stworzymy i z sukcesem przygotujemy gotowy do wdrożenia artefakt składający się z aplikacji webowej w Angular 2 i backendu usługowego wykorzystującego Spring Boot."
---

Każda nietrywialna aplikacja potrzebuje backendu. O ile obecnie to nie jest prawda, to na potrzeby tego artykułu przyjmijmy, że tak jest. A jak backend współpracujący z aplikacją webową to _REST_, a jak _REST_ to _Spring_ i _Spring Boot_. W kilku kolejnych akapitach stworzymy i z sukcesem przygotujemy gotowy do wdrożenia artefakt składający się z aplikacji webowej w _Angular 2_ i backendu usługowego wykorzystującego _Spring Boot_.

_Artykuł zakłada podstawową znajomość Angular CLI, Spring Boot i Maven._

_Wszystkie przedstawione kroki są commitami do testowego repozytorium, dzięki temu sam możesz prześledzić proces tworzenia aplikacji oraz rozwiać wszelkie wątpliwości. Link do repozytorium: [demo@github](https://github.com/glipecki/spring-with-angular-cli-demo)._

## Stworzenie minimalnego projektu

Nowy projekt najłatwiej stworzymy wykorzystując _Spring Initializer_, możemy to zrobić wchodząc [http://start.spring.io/](http://start.spring.io/) i wyklikując konfigurację projektu, lub możemy to zrobić w stylu prawdziwego geeka - _curlem_.

```bash
$ cd demo
$ curl https://start.spring.io/starter.tgz \
  -d groupId=net.lipecki.demo \
  -d packageName=net.lipecki.demo \
  -d artifactId=demo \
  -d dependencies=web \
  | tar -xzvf -

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 50190  100 50104  100    86  54925     94 --:--:-- --:--:-- --:--:-- 54878
x mvnw
x .mvn/
x .mvn/wrapper/
x src/
x src/main/
x src/main/java/
x src/main/java/net/
x src/main/java/net/lipecki/
x src/main/java/net/lipecki/demo/
x src/main/resources/
x src/main/resources/static/
x src/main/resources/templates/
x src/test/
x src/test/java/
x src/test/java/net/
x src/test/java/net/lipecki/
x src/test/java/net/lipecki/demo/
x .gitignore
x .mvn/wrapper/maven-wrapper.jar
x .mvn/wrapper/maven-wrapper.properties
x mvnw.cmd
x pom.xml
x src/main/java/net/lipecki/demo/DemoApplication.java
x src/main/resources/application.properties
x src/test/java/net/lipecki/demo/DemoApplicationTests.java
```

W efekcie dostajemy minimalną aplikację _Spring Boot_, którą możemy zbudować i uruchomić. Do testów dorzućmy prosty kontroler.

```bash
$ curl -L https://goo.gl/MbWM8s -o src/main/java/net/lipecki/demo/GreetingRestController.java
$ cat src/main/java/net/lipecki/demo/GreetingRestController.java
package net.lipecki.demo;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetingRestController {

	@RequestMapping("/greeting")
	public String greeting() {
		return "Welcome!";
	}

}
```

Całość możemy zbudować wykorzystując _Maven_. W zależności od preferencji możemy zbudować aplikację wykorzystując globalnie zainstalowaną w systemie instancję lub skorzystać z dostarczanego ze szkieletem _Maven Wrappera_. Stosowanie _Wrappera_ pozwala pracować z aplikacją nie zmieniając zainstalowanych w systemie pakietów oraz zapewnia, że możemy różne projekty budować różnymi wersjami _Mavena_. _Wrapper_ w razie potrzeby ściągnie odpowiednią wersję bibliotek przy pierwszym uruchomieniu.

```bash
./mvnw clean package
 .
 .
 .
[INFO] --- spring-boot-maven-plugin:1.4.2.RELEASE:repackage (default) @ demo ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 4.929 s
[INFO] Finished at: 2016-12-07T20:43:32+01:00
[INFO] Final Memory: 28M/325M
[INFO] ------------------------------------------------------------------------
```

uruchomić

```bash
$ java -jar target/demo-0.0.1-SNAPSHOT.jar
 .
 .
 .
2016-12-07 20:44:13.392  INFO 70743 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2016-12-07 20:44:13.397  INFO 70743 --- [           main] net.lipecki.demo.DemoApplication         : Started DemoApplication in 2.271 seconds (JVM running for 2.643)
```

i przetestować

```bash
$ curl http://localhost:8080/greeting && echo
Welcome!
```

## Docelowa struktura projektu

W przypadku najprostszego podejścia wystarczające byłoby dorzucenie tylko kodów części webowej do aktualnego szkieletu i zadbania o jego poprawne budowanie. Jednak dla nas wystarczające to za mało, od razu przygotujemy strukturę która będzie miała szansę wytrzymać próbę czasu.

Minimalny sensowny podział to przygotowanie dwóch modułów:

- artefaktu wdrożeniowego z usługami REST,
- aplikacji webowej.

Taki podział aplikacja pozwala nam na dodatkową separację części _backend_ i _frontend_ (w pogoni za ideałem możemy przygotować jeszcze ciekawszą strukturę, szczegóły w jednym z ostatnich akapitów wpisu).

W tym celu:

- dodajemy do projektu dwa moduły,
  - demo-app,
  - demo-web,
- przenosimy dotychczasową konfigurację budowania i kody do demo-app.

Całość zmian możemy zweryfikować w commicie do testowego repozytorium _GitHub_: [commit](https://github.com/glipecki/spring-with-angular-cli-demo/commit/2ee4efcdddf5c6f68e9191607a429f574f58e371).

Po tych zmianach, nadal możemy budować i uruchamiać aplikację, jednak tym razem z poziomu modułu demo-app.

```bash
$ ./mvnw clean package
 .
 .
 .
[INFO] Reactor Summary:
[INFO]
[INFO] demo ............................................... SUCCESS [  0.141 s]
[INFO] demo-app ........................................... SUCCESS [  4.909 s]
[INFO] demo-web ........................................... SUCCESS [  0.002 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 5.329 s
[INFO] Finished at: 2016-12-07T21:15:51+01:00
[INFO] Final Memory: 30M/309M
[INFO] ------------------------------------------------------------------------

$ java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
 .
 .
 .
2016-12-07 21:16:30.569  INFO 71306 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2016-12-07 21:16:30.574  INFO 71306 --- [           main] net.lipecki.demo.DemoApplication         : Started DemoApplication in 2.732 seconds (JVM running for 3.117)
```

## Dodanie i budownie części web

Projekt części webowej najłatwiej stworzyć z wykorzystaniem Angular CLI, w tym celu wykonujemy:

```bash
$ pwd
/tmp/demo/demo-web/
$ rm -rf src
$ ng init --style=scss
 .
 .
 .
Installing packages for tooling via npm.
Installed packages for tooling via npm.
```

Standardowy _Angular CLI_ będzie budował aplikację do folderu _dist_. Jednak konwencja budowania przez _Maven_ zakłada, że wszystkie zasoby, czy to pośrednie, czy docelowe, wygenerowane w trakcie procesu budowania trafią do odpowiednich podfolderów katalogu _target_. Preferowanie konwencji ponad konfigurację to zawsze dobry pomysł. W tym celu zmieniamy standardową konfigurację folderu budowania z _dist_ na _target/webapp_ w _angular-cli.json_: [commit](https://github.com/glipecki/spring-with-angular-cli-demo/commit/3edaecb08c40e93d5bf0c24da06f140ecefa0d74).

W tym momencie możemy już swobodnie pracować z aplikacją uruchamiając ją za pomocą _ng serve_. Kolejnym krokiem będzie zintegrowanie procesu budowania _ng build_ z budowaniem modułu _Maven_. W tym celu wykorzystamy plugin _frontend-maven-plugin_.

Plugin _frontend-maven-plugin_ pozwala:

- zainstalować niezależną od systemowej wersję _node_ i _npm_,
- uruchomić instalację zależności _npm_,
- uruchomić budowanie aplikacji za pomocą _ng_.

Całość konfiguracji wprowadzamy definiując dodatkowe elementy _execution_ konfiguracji pluginu.

Przed dodaniem konfiguracji poszczególnych kroków dodajemy do sekcji _build.plugins_ definicję samego pluginu:

```xml
<plugin>
  <groupId>com.github.eirslett</groupId>
  <artifactId>frontend-maven-plugin</artifactId>
  <version>1.3</version>
  <configuration>
    <installDirectory>target</installDirectory>
  </configuration>
  <executions>
    <!-- tutaj będą konfiguracje kroków budowaia -->
  </executions>
</plugin>
```

W pierwszym kroku instalujemy wskazaną wersję runtime _node_ i menadżera pakietów _npm_. Całość jest instalowana lokalnie w folderze _target_. Dzięki lokalnej instalacji minimalizujemy listę wymagań wstępnych do pracy z naszym projektem, co jest szczególnie ważne przy wykorzystaniu systemów _CI/CD_.

```xml
<execution>
  <id>install node and npm</id>
  <goals>
    <goal>install-node-and-npm</goal>
  </goals>
  <configuration>
    <nodeVersion>v6.9.1</nodeVersion>
  </configuration>
</execution>
```

W drugim kroku plugin za pomocą _npm_ instaluje wszystkie zdefiniowane w _package.json_ zależności naszego projektu. Jest to odpowiednik wykonania _npm install_ w katalogu głównym projektu.

```xml
<execution>
  <id>npm install</id>
  <goals>
    <goal>npm</goal>
  </goals>
</execution>
```

Ostatni krok to wykonanie właściwego procesu budowania aplikacji z wykorzystaniem _Angular CLI_.

W celu uproszczenia konfiguracji dodajemy nowy task o nazwie _build_ w pliku _package.json_. Ręczne zdefiniowanie taska jest o tyle ważne, że w ten sposób będziemy się mogli uniezależnić od systemowej instancji _Angular CLI_ i stosować lokalną wersję zainstalowaną na podstawie definicji w _package.json_.

```json
"scripts": {
  "build": "node node_modules/angular-cli/bin/ng build"
}
```

Oraz dodajemy wykonanie nowo utworzonego tasku przez plugin.

```xml
<execution>
  <id>node build app</id>
  <phase>prepare-package</phase>
  <goals>
    <goal>npm</goal>
  </goals>
  <configuration>
    <arguments>run-script build</arguments>
  </configuration>
</execution>
```

> Nazwa tasku _build_ jest czysto umowna, jedyne wymaganie to używanie tej samej w _package.json_ i _pom.xml_. Jednak trzymanie się konkretnej konwencji, np. build, ułatwi pracę pomiędzy różnymi projektami.

Tak przygotowana konfiguracja pozwala zintegrować budowanie aplikacji web z fazami cyklu życia _Maven_. Dodatkowo dostajemy uspójniony sposób uruchomienia za pomocą polecenia _npm build_. Dzięki wykorzystaniu _frontend-maven-plugin_ uniezależniamy proces budowania od środowiska, wszystkie wymagane biblioteki (_node_, _npm_, _angular-cli_) są instalowane i wykonywane lokalnie w folderze projektu.

Całość zmian z tego kroku możemy obejrzeć w commicie _GitHub_: [commit](https://github.com/glipecki/spring-with-angular-cli-demo/commit/03f54e8ad670555e23f45d617b8642d7f8c48a64).

## Składanie artefaktu z częścią web

Kolejnym krokiem jest umożliwienie spakowania modułu odpowiedzialnego za część web do pojedynczego artefaktu, gotowego do wykorzystania jako zależność lub przesłania do repozytorium artefaktów.

Standardowo _Maven_ obsługuje najpopularniejsze typy artefaktów, np. _jar_, _war_, _ear_. Dla tych typów znany jest sposób ich budowania, struktura archiwów jest odgórnie ustalona i niezmienna pomiędzy projektami. Jednak my chcemy przygotować archiwum w postaci pliku _zip_, więc wykorzystując _maven-assembly-plugin_ będziemy mogli sami określić jakie pliki i w jaki sposób zbierać budując wynikowy artefakt.

Do _pom.xml_ modułu _demo-web_ dodajemy definicję _maven-assembly-plugin_ zawierającą docelową nazwę artefaktu oraz plik assembly opisujący sposób jego składania.

W sekcji _build.plugins_ dopisujemy:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-assembly-plugin</artifactId>
  <configuration>
    <descriptor>assembly.xml</descriptor>
    <finalName>demo-web-${project.version}</finalName>
    <appendAssemblyId>false</appendAssemblyId>
  </configuration>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>single</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

Następnie dodajemy plik _assembly.xml_ (obok pliku _pom.xml_), w którym określamy docelowy format (_zip_) oraz które pliki, z którego katalogu spakować do artefaktu (wszystkie z folder _target/webapp_).

```xml
<assembly>
  <id>zip</id>
  <formats>
    <format>zip</format>
  </formats>
  <includeBaseDirectory>false</includeBaseDirectory>
  <fileSets>
    <fileSet>
      <directory>target/webapp</directory>
      <outputDirectory></outputDirectory>
      <includes>
        <include>**</include>
      </includes>
    </fileSet>
  </fileSets>
</assembly>
```

Całość możemy przetestować wykonując:

```bash
$ pwd
/tmp/demo
$ ./mvnw clean package
 .
 .
 .
$ ls demo-web/target/demo-web-0.0.1-SNAPSHOT.zip
demo-web/target/demo-web-0.0.1-SNAPSHOT.zip
```

Commit zawierający zmiany: [commit](https://github.com/glipecki/spring-with-angular-cli-demo/commit/6e0e6a99badc0ed27846c5a62316fe0ad31d77e4).

## Składanie artefaktu wdrożeniowego

Ostatnie co musimy zrobić żeby nasza aplikacja składała się w pojedynczy wykonywalny artefakt to skonfigurować moduł _demo-web_ jako zależność w projekcie _demo-app_ oraz skonfigurowanie pluginu _maven-dependency-plugin_, który będzie odpowiadał za odpowiednie rozpakowanie zasobów.

Definiujemy zależność na moduł _demo-web_ w _pom.xml_ w sekcji _dependencies_:

```xml
<dependency>
  <groupId>net.lipecki.demo</groupId>
  <artifactId>demo-web</artifactId>
  <version>${project.version}</version>
  <type>zip</type>
</dependency>
```

> Standardowo _Maven_ szuka zależności typu _jar_, jednak nasz moduł _web_ jest typu _zip_, co możemy jawnie wskazać definiując zależność.

Aplikacja Spring Boot poza serwowaniem zdefiniowany servletów i usług _REST_ hostuje również wszystkie zasoby, które znajdują się na zdefiniowanych ścieżkach zasobów statycznych. W standardowej konfiguracji, jedną z takich ścieżek są zasoby wewnątrz samego _jara_ aplikacji. Korzystając z tej wiedzy skonfigurujemy plugin _maven-dependency-plugin_ w taki sposób, żeby rozpakowywał archiwum modułu _web_ do odpowiedniego katalogu budowania.

W sekcji _build.plugins_ dodajemy:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-dependency-plugin</artifactId>
  <executions>
    <execution>
      <id>unpack</id>
      <phase>generate-resources</phase>
      <goals>
        <goal>unpack</goal>
      </goals>
      <configuration>
        <artifactItems>
          <artifactItem>
            <groupId>net.lipecki.demo</groupId>
            <artifactId>demo-web</artifactId>
            <version>${project.version}</version>
            <type>zip</type>
          </artifactItem>
        </artifactItems>
        <outputDirectory>${project.build.directory}/classes/resources</outputDirectory>
      </configuration>
    </execution>
  </executions>
</plugin>
```

W tym momencie mamy już kompletny proces budowania aplikacji. Po jego wykonaniu i uruchomieniu aplikacji możemy zarówno wywołać testową usługę _REST_, jak i obejrzeć szkielet _Angular 2_.

```bash
$ ./mvnw clean package
 .
 .
 .
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] demo ............................................... SUCCESS [  0.120 s]
[INFO] demo-web ........................................... SUCCESS [ 18.459 s]
[INFO] demo-app ........................................... SUCCESS [  5.797 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 24.644 s
[INFO] Finished at: 2016-12-07T22:06:14+01:00
[INFO] Final Memory: 37M/346M
[INFO] ------------------------------------------------------------------------

$ java -jar demo-app/target/demo-app-0.0.1-SNAPSHOT.jar
 .
 .
 .
2016-12-07 22:08:02.937  INFO 72316 --- [           main] s.b.c.e.t.TomcatEmbeddedServletContainer : Tomcat started on port(s): 8080 (http)
2016-12-07 22:08:02.942  INFO 72316 --- [           main] net.lipecki.demo.DemoApplication         : Started DemoApplication in 2.681 seconds (JVM running for 3.077)

$ curl http://localhost:8080/greeting && echo
Welcome!

$ curl http://localhost:8080/
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>DemoWeb</title>
  <base href="/">

  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root>Loading...</app-root>
<script type="text/javascript" src="inline.bundle.js"></script><script type="text/javascript" src="styles.bundle.js"></script><script type="text/javascript" src="vendor.bundle.js"></script><script type="text/javascript" src="main.bundle.js"></script></body>
</html>
```

Komplet dotychczasowych zmian możemy podsumować w repozytorium _GitHub_: [repozytorium](https://github.com/glipecki/spring-with-angular-cli-demo/tree/4042649049dd65bf66e438779c0b8966d57d097f).

## Obsługa routingu z wykorzystaniem history.pushState (html5 url style)

Poza samym budowaniem i uruchamianiem aplikacji, warto jeszcze zadbać o wsparcie dla nowych sposobów nawigacji. Całość można łatwo zrealizować wykorzystując mechanizmy generowania stron błędów w _Springu_. Zanim przejdziemy do kodu, kilka słów wprowadzenia teoretycznego.

Dotychczas aplikacje web można było łatwo rozpoznać po routingu opartym o #... w url. Taki sposób nawigacji nie narzuca żadnych ograniczeń na stronę serwerową aplikacji, jednak tworzy kilka niemożliwych do rozwiązania problemów, np. renderowanie po stronie serwerowej, czy wsparcie dla SEO.

Obecnie, większość nowoczesnych przeglądarek dostarcza nowe _API_ _history.pushState_ pozwalające zrealizować nawigację z pominięciem znaku #. Po szczegóły odsyłam do oficjalnej dokumentacji _Angular_, natomiast w kolejnych akapitach zajmiemy się konfiguracją Spring Boot wspierającą tę strategię.

Całość jest o tyle ważna, że nawigacja bez _#_ jest zalecaną przez zespół _Angular 2_ konfiguracją. Przez to jest stosowana zarówna w dokumentacji, oficjalnym guide oraz wszystkich szablonach projektów, w tym również _Angular CLI_. To jednak oznacza, że do serwera usług będą generowane żądania oparte o ścieżki, które fizycznie nie są nigdzie zdefiniowane, co zakończy się błędami 404. **W tej sytuacji, bez dostosowania naszego projektu, nie będziemy w stanie w ogóle uruchomić aplikacji oferującej nawigację opartą o routing.**

W założeniu przedstawiony problem możemy uprościć do zwracania treści _index.html_ zawsze wtedy, kiedy standardowo zwrócilibyśmy błąd _404_. Rozwiązanie powinno uwzględniać zarówno istnienie zdefiniowanych w aplikacji mapowań, jak i pobieranie zasobów dostępnych w lokalizacjach zasobów statycznych.

Najprostszym rozwiązaniem jest zdefiniowanie własnego _ErrorViewResolver_, który dla błędów _404_ wykona przekierowanie na zasób _/index.html_.

W tym celu dodajemy do kontekstu beana _customErrorViewResolver_, który wszystkie żądania standardowo zwracając _HttpStatus.NOT_FOUND_ przekieruje na _index.html_.

```java
@Bean
public ErrorViewResolver customErrorViewResolver() {
  final ModelAndView redirectToIndexHtml = new ModelAndView("forward:/index.html", Collections.emptyMap(), HttpStatus.OK);
    return (request, status, model) -> status == HttpStatus.NOT_FOUND ? redirectToIndexHtml : null;
}
```

_Przy takim podejściu warto zadbać o to, żeby zawsze jakiś index.html mógł się rozwiązać!_

Sposób wprowadzenia zmiany można prześledzić w commicie GitHub: [57149a4](https://github.com/glipecki/spring-with-angular-cli-demo/commit/57149a404989fc44a012628f4506b7c556d4b36d).

Wykorzystanie własnego _ErrorViewResolver_ dodatkowo zapewnia nam wsparcie dla rozróżniania żądań na podstawie nagłówka _HTTP_ _produces_. To znaczy, że żądania z przeglądarek (zawierające produces = "text/html") zostaną obsłużone zawartością zasobu _/index.html_, natomiast pozostałe (np. curl) odpowiedzą standardowym błędem _404_.

## Możliwe rozszerzenia

Wartym rozważenia rozszerzeniem projektu może być wydzielenie trzeciego modułu i dodatkowe podzielenie aplikacji:

```
demo
\-- demo-rest
\-- demo-app
\-- demo-web
```

Gdzie moduły:

- demo-web - zawiera zasoby aplikacji web,
- demo-rest - zawiera samodzielnie uruchamialną aplikację dostarczającą komplet usług _REST_,
- demo-app - jest złączeniem modułów web i rest w jeden wykonywalny artefakt.

Przy takim podziale uzyskujemy dużą separację pomiędzy modułami. Część _backend_ odpowiedzialna ze udostępnienie usług _REST_ i jest całkowicie niezależna od modułu _demo-web_. Moduł _demo-web_ także nie ma żadnej zależności. To oznacza, że możemy je rozwijać, wersjonować oraz osadzać rozdzielnie. Dodatkowo wprowadzenie modułu _app_ pozwala pisać usługi _REST_ w oderwaniu od produkcyjnego osadzania, np. możliwe jest lokalne uruchamianie modułu _demo-rest_ jako _fat jar_ z _Jetty_, podczas gdy produkcyjnie moduł _demo-app_ będzie osadzany jako _war_ na _Tomcat_.


## Codzienna praca z aplikacją

Pełnię możliwości duetu Spring Boot i Angular CLI poczujemy dopiero odpowiednio przygotowując środowisko codziennej pracy.

Część kliencką uruchamiamy przez _ng serve_, dzięki temu dostajemy kompilację i budowanie aplikacji po każdej zmianie kodów źródłowych oraz dodatkowo powiadomienia _live reload_ i odświeżanie aplikacji w przeglądarce. Część serwerową uruchamiamy w _IDE_ wspierającym _hot swap_ kodów.

Przy takiej konfiguracji aplikacja webowa jest dostępna na porcie _4200_, a backend _REST_ na porcie _8080_. Musimy jeszcze umożliwić dostęp do usług _REST_ w sposób identyczny z docelowym, w tym celu na porcie _4200_ skonfigurujemy proxy do usług.

Dla wygody konfiguracji przenosimy wystawione usługi pod prefix _/api_ i tworzymy plik mapowań proxy w _demo-web/proxy.conf.json_:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

_We wszystkich zdefiniowanych adnotacjach @RequestMapping dopisałem prefix /api w mapowanym url._

Część serwerową uruchamiamy w _IDE_ (lub dowolny inny sposobów), natomiast część web uruchamiamy przez _Angular CLI_:

```bash
$ ng serve --proxy-config proxy.conf.json
 .
 .
 .
webpack: bundle is now VALID.
$ curl http://localhost:8080/api/greeting && echo
Welcome!
$ curl http://localhost:4200/api/greeting && echo
Welcome!
```

Dodakowo konfigurację uruchomienia wspierającą proxy usług warto zdefiniować w pliku _package.json_, w sekcji _scripts_ modyfikujemy polecenie skrypt _start_:

```json
"scripts": {
  "start": "ng serve --proxy-config proxy.conf.json",
}
```

Dzięki temu nie musimy pamiętać przełączików i parametrów, a całość możemy uruchamiać jednym poleceniem:

```bash
$ npm start
 .
 .
 .
webpack: bundle is now VALID.
```

W ten sposób pracujemy z aplikacją wystawioną pod adresem http://localhost:4200/, a wszystkie zmiany w części serwerowej i webowej możemy mieć odświeżane na bieżąco, zaraz po ich wprowadzeniu.

[Commit opisujący wprowadzone zmiany.](https://github.com/glipecki/spring-with-angular-cli-demo/commit/e1e66fe641a33d061227dd47e53a6f83c442f72f)

## Podsumowanie

Jeżeli na co dzień pracujesz z projektami opartymi o _Spring Boot_ i _Maven_ ich integracja z aplikacjami pisanymi w _Angular CLI_ nie będzie stanowić dużego wyzwania. W podstawowej realizacji pomoże Ci plugin _maven-frontend-plugin_, natomiast wykorzystując dodatkowo _maven-assembly-plugin_ i _maven-dependency-plugin_ możliwe jest przygotowanie dużo bardziej złożonych procesów budowania aplikacji.

Ostateczną wersję aplikacji możemy obejrzeć na GitHub: [demo@github](https://github.com/glipecki/spring-with-angular-cli-demo).

_Na sam koniec chciałbym podziękować **Krysi**, **Jackowi** i **Marcinowi**. Bez Was nie byłoby tego wpisu, dzięki!_

## Materiały
- [https://github.com/glipecki/spring-with-angular-cli-demo](https://github.com/glipecki/spring-with-angular-cli-demo)
- [http://www.consdata.pl/blog/7-szybki-start-z-angular-cli](http://www.consdata.pl/blog/7-szybki-start-z-angular-cli)
- [https://angular.io/docs/ts/latest/guide/router.html#!#browser-url-styles](https://angular.io/docs/ts/latest/guide/router.html#!#browser-url-styles)
- [http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#common-application-properties](http://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#common-application-properties)
