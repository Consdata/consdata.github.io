---
layout:    post
title:     "Tworzenie wydajnych obrazów dockerowych w Springu"
date:      2024-05-22T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: bpietrowiak
image: /assets/img/posts/2024-07-12-tworzenie-wydajnych-obrazów-dockerowych-w-springu/docker.jpg
description: Sprawdź jak zaoszczędzić miejsce budując kolejne wersje aplikacji.
tags:
- spring boot
- java
- gradle
- maven
- docker
---

## Jak działa budowanie obrazów Dockerowych?
Budowanie obrazów Dockerowych polega na tworzeniu niemodyfikowalnych "szablonów" aplikacji i jej zależności, które mogą być uruchamiane w izolowanych kontenerach. Proces ten jest zautomatyzowany za pomocą plików o nazwie Dockerfile.

Każdy plik Dockerfile zawiera listę instrukcji wykonywanych w podanej kolejności w momencie budowania obrazu. Docker otrzymaną listę instrukcji konwertuje na warstwy składające się na budowany obraz i posiadające określony rozmiar w przestrzeni dyskowej.

![Schemat budowania obrazu](/assets/img/posts/2024-07-12-tworzenie-wydajnych-obrazów-dockerowych-w-springu/builder.png)

Podczas uruchomienia budowania builder podejmuję próbę ponownego wykorzystania warstw z poprzednich wersji. Jeśli warstwa obrazu się nie zmieni, builder wyciąga ją z cache, a jeśli warstwa uległa zmianie tworzy ją na nowo.
Ponowne tworzenie warstwy wiążę się również z unieważnieniem cache dla wszystkich następnych warstw. Jeśli plik .jar ulegnie zmianie, to schemat warstw przedstawia się następująco:

![Schemat budowania obrazu z cache](/assets/img/posts/2024-07-12-tworzenie-wydajnych-obrazów-dockerowych-w-springu/cache.png)

W tym wypadku bardzo ważna jest kolejność deklarowania instrukcji tak, aby największa ich ilość była pobierania z cache. Dla powyższego przykładu możemy wykonać optymalizację:
![Schemat budowania obrazu z cache optymalizacja](/assets/img/posts/2024-07-12-tworzenie-wydajnych-obrazów-dockerowych-w-springu/cache2.png)

Dzięki temu przy następnym budowaniu trzy warstwy zostaną ponownie wykorzystane zamiast dwóch.

## Klasyczne podejście do budowania

W poprzedniej sekcji został pokazany standardowy plik Dockerfile dla zbudowania aplikacji Spring Bootowej. Jedną z zawartych w nim instrukcji jest przekopiowanie pliku .jar do obrazu. Standardowo wykonuje się to za pomocą jednej instrukcji co powoduje, że każda zmiana w jakimkolwiek pliku aplikacji wymaga utworzenia warstwy od nowa. 

Jest to bardzo niekorzystne, ponieważ niesie to za sobą wykorzystywanie nadmiernej przestrzeni dyskowej. Przyjmując, że plik .jar waży około 20 MB (gdzie większość to zależności aplikacji) wykonanie 10 wersji aplikacji zajmie nam 200 MB, pomimo że zmiany, jakie wykonaliśmy, były bardzo niewielkie i dotyczyły tylko kodów źródłowych (ważących kilkanaście KB). 

Tutaj naprzeciw wyszli nam twórcy Spring Boota, dodając od wersji 2.3 możliwość budowania warstwowego pliku jar (eng. **layered jars**).

## Jak działa Spring Boot layered jar?
Spring Boot layered jar zmienia sposób budowania pliku .jar, dzieląc jego części na konkretne warstwy. Wykorzystuje w tym celu plik **layers.idx**. Plik ten zawiera listę warts oraz części pliku .jar, które są w niej zawarte. Warstwy w pliku zapisane są w kolejności, w jakiej powinny zostać dodane do obrazu Dockerowego. Domyślnie plik składa się z poniższych warstw:
- **dependencies** - zawiera zależności aplikacji, które nie są w wersji SNAPSHOT
- **spring-boot-loader** - zawiera klasy ładujące plik .jar (odpowiadające za uruchomienie aplikacji)
- **snapshot-dependencies** - zawiera zależności aplikacji, które są w wersji SNAPSHOT
- **application** - zawiera kod źródłowy aplikacji

Dzięki takiemu rozwiązaniu jesteśmy w stanie podzielić instrukcję kopiowania pliku .jar na kilka mniejszych instrukcji i zapewnić wykorzystanie ponownych warstw, gdy zmienimy tylko kod źródłowy aplikacji.

## Jak skonfigurować Spring Boot layered jar?
1. Modyfikujemy sposób budowania aplikacji:
   - Dla budowania Gradle w zadaniach budujących naszą aplikację dodajemy:
      ```groovy
     tasks {
        bootJar {
            layered
        }
     }
     ```
   - Dla budowania Mavenem w konfiguracji plugina spring-boot-maven-plugin dodajemy:
     ```xml
      <build>
       <plugins>
         <plugin>
           <groupId>org.springframework.boot</groupId>
           <artifactId>spring-boot-maven-plugin</artifactId>
           <configuration>
             <layers>
               <enabled>true</enabled>
               <includeLayerTools>true</includeLayerTools>
             </layers>
           </configuration>
         </plugin>
       </plugins>
      </build>
     ```
2. Modyfikujemy sposób budowania obrazu w pliku Dockerfile:
   - Przykładowy plik wygląda następująco:
    ```dockerfile
    FROM eclipse-temurin:17.0.9_9-jre-alpine as builder
    WORKDIR /work
    COPY dockerfile-example-snapshot.jar application.jar
    RUN java -Djarmode=layertools -jar application.jar extract
    FROM eclipse-temurin:17.0.9_9-jre-alpine
    WORKDIR /app
    COPY --from=builder /work/dependencies/ ./
    COPY --from=builder /work/spring-boot-loader/ ./
    COPY --from=builder /work/snapshot-dependencies/ ./
    COPY --from=builder /work/application/ ./
    ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
   ```

Jak widać wyżej, budowanie zostało podzielone na dwa etapy:
1. Skopiowanie oraz wypakowanie pliku .jar
2. Skopiowanie warstw pliku .jar oraz zadeklarowanie polecenia, które zostanie wykonane przy starcie kontenera


## Zastosowanie w praktyce
Do zaprezentowania działania wykorzystam przykładowy plik Dockerfile wskazany powyżej.
1. Budujemy obraz:
```shell
docker build . --tag service1
```
2. Wykonujemy polecenie listujące warstwy:
```shell
docker history service1
```
3. Rezultat polecenia:
```
IMAGE          CREATED              CREATED BY                                      SIZE
a59bcc935804   About a minute ago   /bin/sh -c #(nop)  ENTRYPOINT ["java" "org.s…   0B
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:bdb78666255cc63e7…   3.71kB
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:f782fe956cf5892f5…   0B  
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:3d769b9b5528fa54f…   387kB
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:24195f786b612de17…   19.5MB
<​missing>      About a minute ago   /bin/sh -c #(nop) WORKDIR /app                  0B
<​missing>      8 days ago           ENTRYPOINT ["/__cacert_entrypoint.sh"]          0B
<​missing>      8 days ago           COPY entrypoint.sh /__cacert_entrypoint.sh #…   1.17kB
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     echo "Verifying…   0B
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     ARCH="$(apk --p…   140MB
<​missing>      8 days ago           ENV JAVA_VERSION=jdk-17.0.11+9                  0B
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     apk add --no-ca…   17.3MB
<​missing>      8 days ago           ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_AL…   0B
<​missing>      8 days ago           ENV PATH=/opt/java/openjdk/bin:/usr/local/sb…   0B
<​missing>      8 days ago           ENV JAVA_HOME=/opt/java/openjdk                 0B
<​missing>      3 months ago         /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B
<​missing>      3 months ago         /bin/sh -c #(nop) ADD file:37a76ec18f9887751…   7.37MB
```

4. Wykonujemy zmianę kodu źródłowego aplikacji i ponownie budujemy obraz z nowym tagiem:
```shell
docker build . --tag service2
```
5. Wykonujemy polecenie listujące warstwy:
```
docker history service2
```
6. Rezultat polecenia:
```
IMAGE          CREATED          CREATED BY                                      SIZE
e027785c6f71   34 seconds ago   /bin/sh -c #(nop)  ENTRYPOINT ["java" "org.s…   0B
<​missing>      34 seconds ago   /bin/sh -c #(nop) COPY dir:0c4cebea0bf1ba4e8…   3.7kB
<​missing>      2 minutes ago    /bin/sh -c #(nop) COPY dir:f782fe956cf5892f5…   0B
<​missing>      2 minutes ago    /bin/sh -c #(nop) COPY dir:3d769b9b5528fa54f…   387kB
<​missing>      2 minutes ago    /bin/sh -c #(nop) COPY dir:24195f786b612de17…   19.5MB
<​missing>      2 minutes ago    /bin/sh -c #(nop) WORKDIR /app                  0B
<​missing>      8 days ago       ENTRYPOINT ["/__cacert_entrypoint.sh"]          0B
<​missing>      8 days ago       COPY entrypoint.sh /__cacert_entrypoint.sh #…   1.17kB
<​missing>      8 days ago       RUN /bin/sh -c set -eux;     echo "Verifying…   0B
<​missing>      8 days ago       RUN /bin/sh -c set -eux;     ARCH="$(apk --p…   140MB
<​missing>      8 days ago       ENV JAVA_VERSION=jdk-17.0.11+9                  0B
<​missing>      8 days ago       RUN /bin/sh -c set -eux;     apk add --no-ca…   17.3MB
<​missing>      8 days ago       ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_AL…   0B
<​missing>      8 days ago       ENV PATH=/opt/java/openjdk/bin:/usr/local/sb…   0B
<​missing>      8 days ago       ENV JAVA_HOME=/opt/java/openjdk                 0B
<​missing>      3 months ago     /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B
<​missing>      3 months ago     /bin/sh -c #(nop) ADD file:37a76ec18f9887751…   7.37MB
```

Na powyższym przykładzie widzimy, że zależności naszej aplikacji ważą około 20 MB. Wykonując drugi obraz, warstwa zależności została pobrana z cache, dzięki czemu zamiast wykorzystania 40 MB na dwa obraz wykorzystamy 20 MB.


## Definiowanie własnych warstw zależności

Jeżeli domyślna konfiguracja warstw jest dla nas niewystarczająca, jesteśmy w stanie określić własne warstwy zawierające konkretne zależności. Pozwoli to na wydzielenie zależności, co do których jesteśmy pewni, że są one podstawowe i na przykład wykorzystane w kilku projektach.

### Konfiguracja
W powyższym przykładzie wydzielimy zależności pakietu javax.xml.bind do osobnej warstwy.

#### Maven
1. W katalogu /src/resources tworzymy plik layers.xml określający strukturę warstw naszego pliku .jar:

```xml
<layers xmlns="http://www.springframework.org/schema/boot/layers"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/boot/layers
        https://www.springframework.org/schema/boot/layers/layers-{spring-boot-xsd-version}.xsd">
    <application>
        <into layer="spring-boot-loader">
            <include>org/springframework/boot/loader/**</include>
        </into>
        <into layer="application" />
    </application>
    <dependencies>
        <into layer="snapshot-dependencies">
            <include>*:*:*SNAPSHOT</include>
        </into>
        <into layer="jaxb-dependencies">
            <include>javax.xml.bind:*:*</include>
        </into>
        <into layer="dependencies"/>
    </dependencies>
    <layerOrder>
        <layer>dependencies</layer>
        <layer>spring-boot-loader</layer>
        <layer>snapshot-dependencies</layer>
        <layer>jaxb-dependencies</layer>
        <layer>application</layer>
    </layerOrder>
</layers>
```

2. Do plugina tworzącego warstwowego jarka dodajemy wskazanie na pliku z konfiguracją warstw

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
            <configuration>${project.basedir}/src/resources/layers.xml</configuration>
        </layers>
    </configuration>
</plugin>
```

#### Gradle
1. Konfigurujemy plugin, określając nowe warstwy. W pliku build.gradle.kts umieszczamy:
```groovy
tasks {
    bootJar {
        layered {
            application {
                intoLayer("spring-boot-loader") {
                    include("org/springframework/boot/loader/**")
                }
                intoLayer("application")
            }
            dependencies {
                intoLayer("snapshot-dependencies") {
                    include("*:*:*SNAPSHOT")
                }
                intoLayer("jaxb-dependencies") {
                    include( "javax.xml.bind:*:*")
                }
                intoLayer("dependencies")
            }
            layerOrder = listOf("dependencies", "spring-boot-loader", "snapshot-dependencies", "application", "jaxb-dependencies")
        }
    }
}
```
W pliku dockerfile dodajemy kopiowanie nowej warstwy:
```dockerfile
FROM eclipse-temurin:17.0.11_9-jre-alpine as builder
WORKDIR /work
COPY dockerfile-example-snapshot.jar application.jar
RUN java -Djarmode=layertools -jar application.jar extract
FROM eclipse-temurin:17.0.11_9-jre-alpine
WORKDIR /app
COPY --from=builder /work/dependencies/ ./
COPY --from=builder /work/spring-boot-loader/ ./
COPY --from=builder /work/snapshot-dependencies/ ./
COPY --from=builder /work/jaxb-dependencies/ ./
COPY --from=builder /work/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

### Rezultat
1. Budujemy obraz:
```shell
docker build . --tag service1
```
2. Wykonujemy polecenie listujące warstwy:
```shell
docker history service1
```
3. Rezultat polecenia:
```
IMAGE          CREATED              CREATED BY                                      SIZE
53a56b52bb9d   About a minute ago   /bin/sh -c #(nop)  ENTRYPOINT ["java" "org.s…   0B
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:dd5854b870089072a…   6.32kB
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:a0166562a093edeb6…   128kB
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:f782fe956cf5892f5…   0B
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:3d769b9b5528fa54f…   387kB
<​missing>      About a minute ago   /bin/sh -c #(nop) COPY dir:5e9e8ed2b7656fb9f…   19.6MB
<​missing>      About an hour ago    /bin/sh -c #(nop) WORKDIR /app                  0B
<​missing>      8 days ago           ENTRYPOINT ["/__cacert_entrypoint.sh"]          0B
<​missing>      8 days ago           COPY entrypoint.sh /__cacert_entrypoint.sh #…   1.17kB
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     echo "Verifying…   0B
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     ARCH="$(apk --p…   140MB
<​missing>      8 days ago           ENV JAVA_VERSION=jdk-17.0.11+9                  0B
<​missing>      8 days ago           RUN /bin/sh -c set -eux;     apk add --no-ca…   17.3MB
<​missing>      8 days ago           ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_AL…   0B
<​missing>      8 days ago           ENV PATH=/opt/java/openjdk/bin:/usr/local/sb…   0B
<​missing>      8 days ago           ENV JAVA_HOME=/opt/java/openjdk                 0B
<​missing>      3 months ago         /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B
<​missing>      3 months ago         /bin/sh -c #(nop) ADD file:37a76ec18f9887751…   7.37MB
```
4. Wykonujemy zmianę wersji zależności z pakietu jaxb.xml.bind i ponownie budujemy obraz z nowym tagiem:
```shell
docker build . --tag service2
```
5. Wykonujemy polecenie listujące warstwy:
```shell
docker history service2
```
6. Rezultat polecenia:
```
IMAGE          CREATED             CREATED BY                                      SIZE
0a6326aaf0a6   27 seconds ago      /bin/sh -c #(nop)  ENTRYPOINT ["java" "org.s…   0B
<​missing>      27 seconds ago      /bin/sh -c #(nop) COPY dir:67d2736e371ec6127…   6.22kB
<​missing>      27 seconds ago      /bin/sh -c #(nop) COPY dir:d10e5e52a40c11567…   126kB
<​missing>      About an hour ago   /bin/sh -c #(nop) COPY dir:f782fe956cf5892f5…   0B
<​missing>      About an hour ago   /bin/sh -c #(nop) COPY dir:3d769b9b5528fa54f…   387kB
<​missing>      About an hour ago   /bin/sh -c #(nop) COPY dir:24195f786b612de17…   19.5MB
<​missing>      About an hour ago   /bin/sh -c #(nop) WORKDIR /app                  0B
<​missing>      8 days ago          ENTRYPOINT ["/__cacert_entrypoint.sh"]          0B
<​missing>      8 days ago          COPY entrypoint.sh /__cacert_entrypoint.sh #…   1.17kB
<​missing>      8 days ago          RUN /bin/sh -c set -eux;     echo "Verifying…   0B
<​missing>      8 days ago          RUN /bin/sh -c set -eux;     ARCH="$(apk --p…   140MB
<​missing>      8 days ago          ENV JAVA_VERSION=jdk-17.0.11+9                  0B
<​missing>      8 days ago          RUN /bin/sh -c set -eux;     apk add --no-ca…   17.3MB
<​missing>      8 days ago          ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_AL…   0B
<​missing>      8 days ago          ENV PATH=/opt/java/openjdk/bin:/usr/local/sb…   0B
<​missing>      8 days ago          ENV JAVA_HOME=/opt/java/openjdk                 0B
<​missing>      3 months ago        /bin/sh -c #(nop)  CMD ["/bin/sh"]              0B
<​missing>      3 months ago        /bin/sh -c #(nop) ADD file:37a76ec18f9887751…   7.37MB
```

Widzimy, że podczas tworzenia nowej wersji obrazu trzy ostatnie operacje zostały wykonane ponownie, a operacja kopiowania pozostałych zależności została wykorzystana z cache.


## Podsumowanie 
Wykorzystanie warstwowego budowania plików jar może pomóc z znacznym zmniejszeniu pamięci dyskowaej wykorzystywanej na przechowywanie gotowych obrazów Docker. Warto pamiętać o prawidłowej kolejności operacji w pliku Dockerfile oraz o możliwości definiowania własnych warstw zależności.
