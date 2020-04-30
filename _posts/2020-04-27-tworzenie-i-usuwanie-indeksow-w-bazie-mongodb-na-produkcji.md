---
layout:    post
title:     "Tworzenie i usuwanie indeksów w bazie MongoDB na produkcji"
date:      2020-04-22 07:00:00 +0100
published: true
author:    mgucki
tags:
    - tech
    - mongodb
    - index
---

Rankingi baz danych pokazują, że już dobrych kilka lat wśród baz typu NoSQL króluje MongoDB i nic nie wskazuje na to, aby miało się to szybko zmienić. Trudno się temu dziwić - MongoDB jest dokumentową bazą danych, ale oferuje dużo więcej poza funkcjonalnościami dodawania i pobierania dokumentów.

Dysponujemy bogatym zestawem narzędzi do zapytań w postaci mechanizmu agregacji. Mamy też możliwość nasłuchiwania na zmiany danych w bazie poprzez strumień zmian (_change stream_). Możemy również walidować schemat kolekcji poprzez dostarczony przez nas zestaw reguł. Wersja 4.0 MongoDB dostarcza transakcje obejmujące więcej niż jeden dokument. Już wcześniejszy mechanizm transakcji na poziomie pojedyneczego dokumentu pozwala na tworzenie produkcyjnych aplikacji przy wykorzystaniu funkcji typu znajdź i usuń, podmień oraz zaktualizuj (_findOneAndDelete_, _findOneAndReplace_, _findOneAndUpdate_). W tym przypadku musimy zaprojektować odpowiedni schemat bazy.

Dzięki shardingowi MongoDB pozwala przechowywać i przetwarzać ogromne ilości danych bez znacznego spadku wydajności. Poza tym dzięki redundancji w klastrze (_replica set_) dane są niemalże zawsze dostępne. Co więcej, dokumentacja MongoDB wprost mówi, że klaster z redundacją danych powinien być podstawą każdej instalacji produkcyjnej.

Każdy system jest rozwijany i zmienia się w odpowiedzi na nowe wymagania biznesowe. Z tego powodu może się zdarzyć, że konieczne będą zmiany w zapytaniach do bazy i co za tym idzie również mogą być wymagane zmiany indeksów. Staniemy wtedy przed wyzwaniem zmiany indeksów w systemie produkcyjnym. Może się zdarzyć, że jeden okaże się niepotrzebny i będziemy chcieli go usunąć, aby zwolnić miejsce. Drugi indeks trzeba będzie stworzyć, aby przyspieszyć wykonywanie nowych zapytań. Tworzenie indeksu może trwać bardzo długo. Nie chcemy na ten czas wyłączać produkcji. Poniższy tekst wyjaśnia, jak stworzyć nowy i usunąć stary indeks bez większych zawirowań na produkcji.

Aby cała operacja odbyła się bez problemów, powinniśmy wykonać ją w następującej kolejności:
- utworzenie indeksu pod nowe zapytania w systemie;
- aktualizacja części biznesowej systemu;
- usunięcie starego indeksu, o ile nie jest już używany.

# Tworzenie indeksu w MongoDB w sposób _rolling_

Tworzenie indeksu w sposób _rolling_ dotyczy tylko i wyłącznie bazy z redundacją danych w klastrze. Ta metoda pozwala na tworzenie nieunikalnych indeksów. Przeprowadzana jest dla każdego węzła w klastrze:
- węzeł jest odłączany od klastra i uruchamiany w trybie standalone;
- tworzony jest indeks na tym węźle;
- węzeł jest dołączany do klastra.

W czasie tworzenia indeksu pozostałe węzły klastra cały czas działają produkcyjnie i co za tym idzie dane się zmieniają. Węzeł, który był uruchomiony w trybie standalone, i na którym tworzony był indeks, po włączeniu do klastra będzie musiał się zsynchronizować i pobrać wszytkie zmiany, które zaszły w czasie, kiedy był odłączony. Aby cała procedura odbyła się bez problemu, należy zapewnić, aby oplog miał odpowiedni rozmiar. Oplog przechowuje ostatnie zmiany danych, które zaszły w węźle primary i jeżeli nie będzie odpowiednio duży, to węzeł który jest dołączany do klastra, nie będzie w stanie się zsynchronizować. Więcej informacji o tym, jak dobrać rozmiar oplog jest w [dokumentacji MongoDB](https://docs.mongodb.com/manual/core/replica-set-oplog/#replica-set-oplog-sizing).

Procedurę zaczynamy od węzłów secondary, a na końcu przeprowadzamy ją dla węzła primary. Należy zwrócić uwagę na _write concern_. Przykładowo jeżeli mamy klaster złożony z 3 węzłów i write concern równe 3, to z pukntu widzenia aplikacji baza będzie niedostępna po odłączeniu węzła. Wszystkie zapisy będą się kończyć błędem.

## Odłączenie węzła od klastra

Odłączenie węzła od klastra wymaga 2 kroków:
- zmiany w konfiguracji, aby węzeł po restarcie nie podłączył się do klastra,
- restartu węzła.

W konfiguracji musimy zmienić port, wykomentować konfigurację repliki oraz wyłączyć odświeżanie sesji. Przykładowo fragment pliku z konfiguracją może wyglądać tak:
```yaml
net:
  bindIp: 127.0.0.1
  port: 28017
#   port: 27017
#replication:
#   replSetName: rs0

# Wyłącz odświeżanie sesji
setParameter:
   disableLogicalSessionCacheRefresh: true
```

Uwaga! Jeżeli węzeł jest primary, to musimy wykonać operację _step down_ przed restartem, aby stał się secondary, a klaster wybrał inny węzeł jako primary. Służy temu polecenie `rs.stepDown()`.

Po zmianach w konfiguracji restartujemy węzeł. W tym momencie węzeł jest odłączony od klastra i działa w trybie standalone. Teraz możemy utworzyć indeks.

## Tworzenie indeksu

Po restarcie węzła i uruchomieniu w trybie standalone, podłączamy się do niego i wykonujemy polecenie tworzące indeks zgodnie z [dokumentacją](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/). Tworzenie indeksu może okazać się czasochłonne. Aktualnie wykonywane operacje na bazie sprawdzimy, uruchamiając polecenie `db.currentOp()` w powłoce MongoDB. To pozwoli dowiedzieć się, czy indeks nadal się buduje.

## Dołączenie węzła do klastra

Po zbudowaniu indeksu dołączamy węzeł do klastra. Polega to na wycofaniu zmian w konfiguracji oraz restarcie węzła. W tym momencie węzeł będzie się aktualizował względem klastra (węzła primary), czyli pobierał zmiany, które zaszły w czasie kiedy był odłączony.

Informacje o klastrze są zwracane przez polecenia:
- `rs.status()` - zwraca status klastra względem węzła, na którym polecenie zostało uruchomione;
- `rs.printSlaveReplicationInfo()` - zwraca informacje o węzłach secondary łącznie z opóźnieniem względem węzła primary.

# Usuwanie indeksu

Procedura usunięcia indeksu zależy od wersji MongoDB. Od wersji 4.2 wystarczy usunąć indeks na węźle primary. Całą resztą, czyli usunięciem indeksu z węzłów secondary, zajmie się baza. Jeżeli pracujemy z wcześniejszą wersją, to indeks należy usunąć podobnie jak tworzymy indeks w sposób rolling. Jedyną różnicą jest to, że indeks usuwamy, a nie tworzymy.

W jednym i drugim przypadku musimy jednak się upewnić, że żadne zapytanie nie korzysta z danego indeksu. Inaczej zapytanie zakończy się błędem.

# Zarządzanie indeksami a automatyzacja

Zazwyczaj chcemy ułatwić sobie życie i wiele rzeczy automatyzujemy. Można również się pokusić o automatyczne usuwanie i tworzenie indeksów podczas wdrażania kolejnej wersji systemu. Doświadczenie pokazuje, że można pochopnie umieścić w skryptach dwa polecenia usunięcia i stworzenia indeksu na węźle primary. Najprawdopodobniej skończy się to poważnym błędem i jeżeli operację przeprowadzamy na produkcji, to produkcja będzie niedostępna do czasu naprawy. Czas przestoju będzie znaczący, jeżeli kolekcja będzie znaczących rozmiarów.

Zmiany w indeksach powinniśmy przeprowadzać manualnie z planem działania w ręku.

# Podsumowanie

MongoDB jest dokumentową bazą danych oferującą bogatą funkcjonalność i jednocześnie na tyle elastyczną, że pozwala przeprowadzać zadania administracyjne bez przerwy w działaniu. To się tyczy również tworzenia oraz usuwania indeksów, co nie jest operacją trudną.