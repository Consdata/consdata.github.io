---
layout:    post
title:     "Sonarqube - wprowadzenie do statycznej analizy kodu"
date:      2016-12-08 08:00:00 +0100
published: true
author:    jgrobelny
tags:
    - sonarqube
    - jakość kodu
---

<blockquote>“It is not enough for code to work.” <span>Robert C. Martin, Clean Code</span></blockquote>

Pamiętam jak kilka lat temu z uporem maniaka integrowałem biblioteki statycznej analizy kodu do każdego pom.xml, który wpadł w moje ręce. Do dzisiaj wiele osób za to mnie szczerze nienawidzi. Modyfikacja pomów, konfiguracja w repozytorium każdego projektu i długie instrukcje na wiki związane z integracją IDE. Patrząc z perspektywy czasu przyznaję, że było to dość pracochłonne przedsięwzięcie. Na szczęście pojawiło się narzędzie, które nie tylko uprościło proces statycznej analizy kodu, ale także znacznie tę analizę upowszechniło.

## Konfiguracja

SonarQube, bo o nim mowa, powstał jako system do integracji raportów z różnych bibliotek i wizualizacji wyników. Twórcy byli rozczarowani tempem zmian w popularnych bibliotekach statycznej analizy kodu, dlatego zaczęli na własną rękę przygotowywać zestaw reguł, które ich zdaniem powinien spełniać dobry kod. W wyniku tego procesu dostaliśmy kompleksowe narzędzie do zbierania analiz i raportowania jakościowych zmian projektu w czasie.
W erze przeddokerowej, takie wprowadzenie zajęłoby pewnie kilka ekranów poleceń i czynności konfiguracyjnych. Ja pokażę, że cały proces konfiguracji i pierwszego użycia można zamknąć w 4 poleceniach, z których jedno to zmiana bieżącego katalogu.
Ściągnięcie i uruchomienie serwera w domyślnej konfiguracji osiągniemy wydając polecenie:

```bash
docker run -d --name sonarqube -p 9000:9000 -p 9092:9092 sonarqube
```

Następnie potrzebujemy projekt, który poddamy analizie. Dla celów pokazowych weźmy szkielet aplikacji, który każdy z nas niejednokrotnie użył:

```bash
mvn archetype:generate
    -DgroupId=com.mycompany.app
    -DartifactId=my-app
    -DarchetypeArtifactId=maven-archetype-quickstart
    -DinteractiveMode=false
```

Na koniec pozostaje nam zmienić katalog i uruchomić analizę:

```bash
cd my-app
mvn sonar:sonar
```

(Ostatnie polecenie zadziała w takiej formie wyłącznie na systemach operacyjnych, w których Docker uruchamiany jest natywnie, czyli na chwilę powstawania tego wpisu Linux i Windows 10. W pozostałych przypadkach konieczne jest przekazanie w parametrach namiarów na Dockera ukrytego pod warstwą wirtualizacji. Więcej szczegółów znajdziecie w linkach załączonych na końcu wpisu.)

Po zakończeniu przechodzimy na stronę *localhost:9000* i powinniśmy zobaczyć gotowy raport. Tym, co nas na początku najbardziej interesuje są smrodki znalezione w kodzie czyli Code Smells:

![SonarQube](/assets/img/posts/2016-12-08-sonarqube-wprowadzenie-do-statycznej-analizy-kodu/1.png)

Code Smells w interfejsie SonarQube
Jak możemy zobaczyć, w tak niewielkim fragmencie kodu, SonarQube namierzył aż trzy naruszenia! Nawigując po interfejsie możemy przeanalizować okoliczności, w jakich zostało wprowadzone każde naruszenie oraz zapoznać się z bardzo szczegółową dokumentacją. Każdy zdiagnozowany problem ma nie tylko opisaną przyczynę zakwalifikowania go jako Code Smell, ale także przykłady i instrukcje, jak takie naruszenie można z kodu wyeliminować. I to właśnie tutaj ukryte są niezgłębione pokłady wiedzy na temat filozofii czystego kodu.

Należy w tym momencie zaznaczyć, że przedstawiona powyżej metoda jest odpowiednia do lokalnej metody analizy kodu. Jeśli zdecydujemy się wdrożyć w projekcie SonarQube jako narzędzie używane przez wielu programistów, warto poświecić trochę czasu i dokonfigurować takie elementy jak uwierzytelnianie, autoryzacja oraz dedykowana baza danych.

## Środowisko developerskie
Przeglądanie raportów i statystyk projektu pozostawmy jednak w gestii managerów. To, czego potrzebują programiści, to integracji na poziomie środowiska IDE możliwie jak najbliżej kodu. I tutaj z pomocą przychodzi nam plugin SonarLint, dostępny na wszystkie liczące się środowiska programistyczne. Wystarczy, że wskażemy mu serwer:
![Konfiguracja IDE](/assets/img/posts/2016-12-08-sonarqube-wprowadzenie-do-statycznej-analizy-kodu/2.png)

Powiążemy bieżący projekt z projektem założonym na serwerze:
![SonarQube](/assets/img/posts/2016-12-08-sonarqube-wprowadzenie-do-statycznej-analizy-kodu/3.png)

Jeśli integracja przebiegnie poprawnie, wszystkie naruszenia na serwerze powinny zostać naniesione na plik otwarty w edytorze:

![SonarQube](/assets/img/posts/2016-12-08-sonarqube-wprowadzenie-do-statycznej-analizy-kodu/4.png)

I to w zasadzie wszystko co jest nam potrzebne, aby zacząć przygodę ze statyczną analizą kodu źródłowego naszych aplikacji.

Uncle Bob nieprzypadkowo pojawił się na początku tego wpisu. Opisywane tutaj narzędzia są naturalnym rozszerzeniem idei czystego kodu. Grzegorz Huber, kolega z pracy, podzielił się ze mną bardzo trafną uwagą - SonarQube w IDE to prawie tak, jak Uncle Bob siedzący na krzesełku obok.

## Podsumowanie
Zachęcam każdego, aby uruchomił lokalnie SonarQube i przeskanował swoje projekty (o ile jeszcze tego nie robi). Wiedza, jaka płynie z takiej operacji jest nie do przecenienia. Jeżeli zainteresuje was ten sposób analizy kodu, warto zgłębić inne funkcjonalności jakie posiada SonarQube. Znajdziemy tam między innymi:
- analizę pokrycia kodu testami
- wykrywanie copy'n'paste
- złożoność cyklomatyczną

## Bibliografia
- Robert C. Martin, Clean Code.
- [https://hub.docker.com/\_/sonarqube/](https://hub.docker.com/_/sonarqube/)
- [https://about.sonarqube.com/get-started/](https://about.sonarqube.com/get-started/)
