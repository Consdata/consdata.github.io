---
layout:    post
title:     Migracja schematów bazy danych
date:      2021-01-28 08:00:00 +0100
published: false
lang:      pl
author:    jgoszczurny
image:     /assets/img/posts/2021-01-28-migracja-schematow-bazy-danych/bird-migrations.jpg
tags:
    - migration
    - database
    - liquibase
    - flyway
    - kubernetes
    - job
    - initContainers
---

Niemożliwe jest rozwijanie aplikacji bez równoczesnego rozwijania schematu bazy danych.

Tak jak podczas rozwijania naszej aplikacji, stosujemy wzorce projektowe przy pisaniu kodu, tak w przypadku rozwijania schematów baz danych również powinniśmy stosować się do takich wytycznych, aby rozwijanie bazy danych było przyjemnością, a nie ostatecznością.

## Migracja schematu, czyli ewolucyjny projekt bazy danych (ang. Evolutionary Database Design)
Aby umożliwić proste rozwijanie naszej bazy danych, możemy skorzystać z przetestowanego już zbioru zaleceń [🔗¹](https://www.martinfowler.com/articles/evodb.html) [🔗²](https://en.wikipedia.org/wiki/Evolutionary_database_design), dzięki którym zmiany będą mniej inwazyjne, a nawet bezprzerwowe (zero downtime deployment).

### Przechowywanie zmian w repozytorium kodów
Podobnie jak kod aplikacji, schemat bazy danych jest częścią tworzonego systemu i dobrą praktyką jest przechowywanie go w repozytorium. 
Jako że zmiany schematu bazy danych są przyrostowe, to repozytorium powinno zawierać wszystkie zmiany umożliwiające odtworzenie zawsze tej samej bazy danych.
Dzięki temu uzyskamy szereg korzyści:
* możliwość zweryfikowania zmian,
* prostsze utrzymywanie kolejności zmian schematu bazy danych, dzięki utrzymywaniu zmian w jednym miejscu,
* bezproblemowe odtworzenie zawsze dokładnie takiej samej bazy danych (np. lokalnie do celów testowych).

Jeśli kilka projektów korzysta z bazy, to mimo wszystko zmiany powinny odbywać się tylko na jednym głównym repozytorium (nawet na osobnym).

### Każda zmiana schematu powinna być migracją
Każdorazowe modyfikowanie schematu, powinno odbywać się za pomocą migracji, którą zapiszemy w repozytorium, unikając ręcznego modyfikowania schematu.

Dzięki temu nie będzie sytuacji, w której po odtworzeniu bazy, będzie się ona różnić od oryginału.

Dodatkowo zmiany wykonane na boku, mogą wpłynąć na jego późniejsze wykonanie za pomocą migracji, np. gdy wykonujemy CREATE TABLE bezpośrednio na bazie, a później dodajemy migrację schematu, która to procesuje, to w takim wypadku otrzymamy błąd informujący o tym, że taka tabela już istnieje.

### Wersjonowanie (rosnące) każdej zmiany
* Każda zmiana powinna być wersjonowana, np. w osobnych plikach, w których zachowanie kolejności będzie wykonane za pomocą podbijania licznika lub dodania znacznika czasu z przodu pliku.
  Jest to bardzo ważne, ponieważ inna kolejność uruchomienia migracji schematów bazy danych może całkowicie zmienić jej sens albo nawet całkowicie ją uniemożliwić.
* Zalecane jest, aby każda zmiana była jak najmniejsza i najlepiej możliwa do odwrócenia. 
  Przykładowo tworząc indeksy na istniejących tabelach, najlepiej rozbić ich tworzenie do osobnych wersji.
  Jeśli nie zostaną one wykonane w osobnych migracjach schematu, wtedy narażamy się na ryzyko takie jak opisane niżej:
  * w tej samej migracji schematu bazy danych tworzymy indeks A oraz indeks B,
  * stworzenie indeksu A zajmuje 5 minut i przebiega poprawnie,
  * stworzenie indeksu B zajmuje ponad 5 minut i powoduje błąd TimeoutException,
  * oba indeksy zostają wycofane i indeks A musi być ponownie założony,
  * w przypadku, gdyby tworzenie indeksów było rozdzielone na osobne migracje, wtedy nie będzie konieczności ponownego tworzenia indeksu A (i ponownego poświęcania 5 minut na ten cel).
* Wykonywane zmiany powinny być przyrostowe, czyli zmiana dla danej wersji powinna być uruchomiona tylko raz.

#### Przykładowe biblioteki
* SQL
  * Liquibase
    * [liquibase.org](https://www.liquibase.org/)
  * FlywayDB
    * [flywaydb.org](https://flywaydb.org/)
  * MyBatis Migration
    * [mybatis.org/migrations](https://mybatis.org/migrations)
* NoSQL
  * Mongock
    * [github.com/cloudyrock/mongock](https://github.com/cloudyrock/mongock)
    * [mongock.io](https://www.mongock.io)
  * Migrate-mongo
    * [npmjs.com/package/migrate-mongo](https://www.npmjs.com/package/migrate-mongo)
    * [github.com/seppevs/migrate-mongo](https://github.com/seppevs/migrate-mongo)
  * liquibase-mongodb
    * [github.com/liquibase/liquibase-mongodb](https://github.com/liquibase/liquibase-mongodb)

w powyższych bibliotekach tworzenie i uruchamianie przyrostowe zmian jest wbudowane.

### Zmiany powinny być kompatybilne wstecz
Jest to szczególnie ważne, jeśli chcemy bezprzerwowo aktualizować naszą bazę danych, w takim wypadku aktualizacja bazy danych nie powinna spowodować, że starsza wersja aplikacji przestanie działać.

Przykładowo nowa kolumna powinna mieć domyślną wartość lub przyjmować null-e.

Zmiana nazwy kolumny lub jej usunięcie powinno być rozbite na kilka etapów, tak aby jej prawdziwe usunięcie było wykonane nie w docelowej wersji, tylko np. w następnej iteracji, gdy będziemy pewni, że żadna aplikacja z niej nie korzysta.

## Aplikowanie zmian
Aplikowania zmian wykonanych w ramach ewolucyjnej bazy danych jest już zależne od konkretnego przypadku.

Jeśli baza danych jest ściśle związana z jedną aplikacją, to możemy ją uruchamiać bezpośrednio z kodu [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#running-migrations-on-application-startup) .

W przypadku gdy aplikacja jest rozproszona i nie chcemy blokować wszystkich instancji aplikacji na czas migracji schematu lub gdy kilka różnych aplikacji korzysta z tej bazy danych, możemy uruchamiać migrację niezależnie od aplikacji.
W tym przypadku mamy następujące możliwości:
* Wykonywanie zmian uruchamianych za pomocą CI/CD (np. automatycznie po otrzymaniu nowej wersji).
  Na repozytorium wykonujemy merge z migracjami schematu bazy danych, Jenkins wykrywa zmianę na repozytorium i wykonuje ją na bazie wskazanej w konfiguracji.
* Z wykorzystaniem mechanizmów dostarczonych przez platformę, na której będzie to uruchamiane. Przykładowo dla Kubernetesa możemy:
  * wykorzystać initContainers, celem odpalenia migracji schematu bazy danych przed uruchomieniem docelowego kontenera z aplikacją 
    (w takim wypadku każda replika uruchomi migrację schematu, a to mechanizm migracji musi zapewnić, że zmiany zostaną wykonane wszystkie na jednym kontenerze i do tego jednorazowo) [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#init-containers) ,
  * wykorzystać do tego celu Joby, które jednorazowo uruchomią migrację (a w przypadku problemów, wykonają automatyczne ponowienie n-razy) [🔗³](https://cloud.google.com/solutions/addressing-continuous-delivery-challenges-in-a-kubernetes-world#related_kubernetes_concepts_2) [🔗⁴](https://kubernetes.io/docs/concepts/workloads/controllers/job/) [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#jobs) ,
  * wykorzystać dwa powyższe mechanizmy [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#combining-jobs-and-init-containers-to-handle-migrations),
    uruchomić joba, aby wykonał migrację schematu bazy danych, oraz initContainers tak, aby poczekał na zakończenie migracji schematu
    (a jeśli wszystkie migracje schematu wymagane przez aplikację, są już zaaplikowane, to uruchomienie docelowego kontenera).

### Przykłady - Kubernetes
Przykładowe rozwiązanie łączące mechanizm initContainer oraz job-a, dla różnych bibliotek do migracji schematów bazy danych:
* <a href="https://github.com/Consdata/blog-database-migration-example/tree/master/liquibase" title="Example Liquibase migration in GitHub project consdata/blog-database-migration-example"><svg class="svg-icon" style="color: #586069"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> Liquibase</a>
* <a href="https://github.com/Consdata/blog-database-migration-example/tree/master/flyway" title="Example Flyway migration in GitHub project in consdata/blog-database-migration-example"><svg class="svg-icon" style="color: #586069"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> FlywayDB</a>
* <a href="https://github.com/Consdata/blog-database-migration-example/tree/master/mybatis-migration" title="Example MyBatis migration in GitHub project consdata/blog-database-migration-example"><svg class="svg-icon" style="color: #586069"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> MyBatis Migration</a>
* <a href="https://github.com/Consdata/blog-database-migration-example/tree/master/migrate-mongo" title="Example Migrate-Mongo migration in GitHub project consdata/blog-database-migration-example"><svg class="svg-icon" style="color: #586069"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> Migrate-mongo</a>

## Bibliografia
1. [https://www.martinfowler.com/articles/evodb.html](https://www.martinfowler.com/articles/evodb.html)
2. [https://en.wikipedia.org/wiki/Evolutionary_database_design](https://en.wikipedia.org/wiki/Evolutionary_database_design)
3. [https://cloud.google.com/solutions/addressing-continuous-delivery-challenges-in-a-kubernetes-world#related_kubernetes_concepts_2](https://cloud.google.com/solutions/addressing-continuous-delivery-challenges-in-a-kubernetes-world#related_kubernetes_concepts_2)
4. [https://kubernetes.io/docs/concepts/workloads/controllers/job/](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
5. [https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/)
