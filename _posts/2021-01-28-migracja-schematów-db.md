---
layout:    post
title:     Migracja schematów DB
date:      2021-01-28 08:00:00 +0100
published: false
author:    jgoszczurny
image:
tags:
    - migration
    - database
    - liquibase
    - flyway
    - kubernetes
    - job
    - initContainers
---

Nie możliwe jest rozwijanie aplikacji bez równoczesnego rozwijania schematu bazy danych.

Tak jak podczas rozwijania naszej aplikacji, stosujemy wzorce projektowe przy pisaniu kodu, tak w przypadku rozwijania schematów baz danych również powinniśmy stosować się do takich wytycznych, aby rozwijanie bazy danych było przyjemnością a nie ostatecznością

## Ewolucyjny projekt bazy danych (eng. Evolutionary Database Design)
Aby umożliwić proste rozwijanie naszej bazy danych możemy skorzystać z przetestowanego już zbioru zaleceń [🔗¹](https://www.martinfowler.com/articles/evodb.html) [🔗²](https://en.wikipedia.org/wiki/Evolutionary_database_design) , dzięki którym zmiany będą mniej inwazyjne a a nawet bezprzerwowe (zero downtime deployment).

### Przechowywanie zmian w repozytorium kodów
Pod tym pojęciem nie kryje się tylko trzymanie zmian w repozytorium, ale powinno się trzymać wszystkie zmiany dotyczące tej bazy w jednym miejscu.

Jeśli kilka projektów korzysta z bazy, to wtedy nadal zmiany powinny być robione tylko na tym jednym głównym (może być nawet osobnym repozytorium).

Dzięki temu mamy możliwość zweryfikowania zmian i odtworzenia bazy (np. lokalnie), dodatkowo zmiany trzymane w jednym miejscu umożliwiają prostsze utrzymywanie kolejności. Dzięki temu uzyskamy zawsze dokładnie ten sam schemat bazy.

### Każda zmiana schematu powinna być migracją
Każdorazowe modyfikowanie schmatu, powinno odbywać się za pomocą migracji którą zapiszemy w repozytorium, unikając ręcznego modyfikowania schematu.

Dzięki temu nie będzie sytuacji w której po odtworzeniu bazy, będzie się ona różnić od oryginału.

Dodatkowo zmiany wykonane na boku, mogą wpłynąć na późniejsze jego wykonanie za pomocą migracji, np. wykonujemy CREATE TABLE bezpośrednio na bazie, a później dodajemy migrację która to robi, w takim wypadku dostaniemy błąd że taka tabela już istnieje.

### Wersjonowanie (rosnące) każdej zmiany
* Każda zmiana powinna być wersjonowana, np. w osobnych plikach w których zachowanie kolejności będzie wykonane za pomocą podbijania licznika z przodu pliku, lub dodając znacznik czasu.
  Jest to bardzo ważne, ponieważ inna kolejność uruchomienia migracji może całkowicie zmienić jej sens albo nawet uniemożliwić migrację.
* Zalecane jest aby każda zmiana była jak najmniejsza i najlepiej możliwa do odwrócenia. 
  Przykładowo tworząc indeksy na istniejących tabelach, najlepiej rozbić ich tworzenie do osobnych wersji, 
  np. tworząc indeks A który zajmuje 5 minut i drugi B który też zajmuje 5mint, to w idealnym przypadku wszystko będzie ok, ale w przypadku kiedy pojawi się błąd przy tworzeniu indeksu B, wtedy wycofamy również indeks A i ponownie poświęcimy dodatkowe 5minut, 
  a gdyby były osobno, wtedy cofnięty byłby tylko indeks B. 
* Wykonywane zmiany powinny być przyrostowe, czyli zmiana dla danej wersji powinna być uruchomiona tylko raz.

#### Przykładowe biblioteki
* Liquibase
  * [liquibase.org](https://www.liquibase.org/)
* FlywayDB
  * [flywaydb.org](https://flywaydb.org/)
* MyBatis Migration
  * [mybatis.org/migrations](https://mybatis.org/migrations)
* w przypadku bazy MongoDB
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
Jest to szczególnie ważne jeśli chcemy bezprzerwowo aktualizować naszą bazę danych, w takim wypadku aktualizacja bazy danych nie powinna spowodować że starsza wersja aplikacji przestanie działać.

Przykładowo nowa kolumna powinna mieć domyślną wartość lub przyjmować null-e.

Zmiana nazwy kolumny lub jej usunięcie powinno być rozbite na kilka etapów, tak aby jej prawdziwe usunięcie było wykonane nie w docelowej wersji tylko np. w następnej iteracji, jak będziemy pewni że żadna aplikacja z niej nie korzysta.

## Aplikowanie zmian
Aplikowania zmian wykonanych w ramach ewolucyjnej bazy danych, jest już zależne od konkretnego przypadku.

Jeśli baza danych jest ściśle związana jedną z aplikacją, możemy ją uruchamiać bezpośrednio z kodu [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#running-migrations-on-application-startup) .

W przypadku gdy aplikacja jest rozproszona i nie chcemy blokować wszystkich instancji aplikacji na czas migracji, lub kilka różnych aplikacji korzysta z tej bazy danych, możemy uruchamiać migrację niezależnie od aplikacji.

1. Wykonywanie zmian uruchamianych za pomocą CI/CD (np. automatycznie po otrzymaniu nowej wersji)
   wykonujemy merge z migracjami do master → Jenkins wykrywa zmianę na repo → Uruchamia migrację na bazie wskazanej w konfiguracji.
2. Z wykorzystaniem mechanizmów dostarczonych przez platformę na której będzie to uruchamiane
   * w Kubernetes
     * wykorzystanie initContainers aby odpalić migrację przed uruchomieniem docelowego kontenera z aplikacją (w takim wypadku każda replika odpali migrację, i to mechanizm migracji musi zapewnić lock oraz to że raz wykonana migracja nie wykona się ponownie) [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#init-containers) ,
     * wykorzystanie do tego celu Jobów, które jednorazowo uruchomią migrację (a w przypadku problemów wykonają automatyczne ponowienie n-razy) [🔗³](https://cloud.google.com/solutions/addressing-continuous-delivery-challenges-in-a-kubernetes-world#related_kubernetes_concepts_2) [🔗⁴](https://kubernetes.io/docs/concepts/workloads/controllers/job/) [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#jobs) ,
     * wykorzystanie dwóch powyższych mechanizmów [🔗⁵](https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/#combining-jobs-and-init-containers-to-handle-migrations) ,
       uruchomienie job-a aby wykonał migrację 
       wykorzystanie initContainers tak aby czekał na zakończenie migracji .

### Teoria
#### Kubernetes
 - przykłady ...

## Bibliografia
1. https://www.martinfowler.com/articles/evodb.html
2. https://en.wikipedia.org/wiki/Evolutionary_database_design
3. https://cloud.google.com/solutions/addressing-continuous-delivery-challenges-in-a-kubernetes-world#related_kubernetes_concepts_2
4. https://kubernetes.io/docs/concepts/workloads/controllers/job/
5. https://andrewlock.net/deploying-asp-net-core-applications-to-kubernetes-part-7-running-database-migrations/
