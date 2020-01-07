---
layout:    post
title:     RxJS z Angularem - programowanie reaktywne aplikacji frontendowych
published: true
date:      2020-01-09 08:00:00 +0100
author:    kgabara
tags:
    - Angular
    - rxjs
    - asynchronous
    - reactive
    - reactive extensions
    - rxjs operators
---
## Wprowadzenie
// sredni taki wstep - do zastanowenia co z tym zrobic
Programując aplikację frontendową pisaną z pomocą frameworka Angular na pewno zdarzyło Ci się wykorzystać serwis HttpClient, aby pobrać dane z serwera. Na pewno też używałeś EventEmitter do informowania komponentu rodzica przez dziecko o zmianach. HttpClient udostępnia metody, których typem zwracanym jest Observable. Czy zastanawiałeś się nad tym, czym w zasadzie jest Observable, dlaczego do danego Observable musisz się 'zasubskrybować', aby otrzymać dane? A może już to wiesz, ale chciałbyś dowiedzieć się jak efektywniej wykorzystać bibliotekę RxJS?

Jeżeli tak, to ten artykuł jest dla Ciebie!

## RxJs - czym jest?
_Reactive Extensions for JavaScript_ jest biblioteką udostępniającą implementację paradygmatu reaktywnego dla języka JS. 
// programowanie asynchroniczne

## Strumień danych
W programowaniu reaktywnym istnieje koncept strumienia danych. Możesz wyobrazić sobie dosłownie strumień, w którym płyną poszczególne dane, a Ty jako obserwator obserwujesz te dane z boku.
### Strumień zimny
// zaczyna emitować dane dopiero, gdy ktoś zacznie dany strumień obserwować
### Strumień ciepły
// strumień istnieje niezależnie od ilości obserwatorów

## Observable, wzorzec Observer
// czym jest
// implementacja wzorca Observer
// next, error, complete
### subscribe() i unsubscribe()


## Subject - tworzenie własnych strumieni
czym jest Subject

### ReplaySubject
przechowuje ostatnie N zapisanych danych(migawka strumienia) i odtwarza je dla kolejnych obserwatorow 
### BehaviorSubject
stanowy strumien, rozpoczyna strumien z domyslna wartoscia, odtwarza ostatnio emitowaną wartość dla nowych obserwatorow 
### AsyncSubject
emituje ostatnia wartosc w momencie zamkniecia strumienia i odtwarza ja dla kolejnych obserwatorow
## Operatory - operacje na strumieniu
### map
### withLatestFrom
skrzyzowanie strumienia
### takeUntil
nasluchiwanie na zdarzenie 
### first
wziecie pierwszego zaobserwowanego elementu ze strumienia, odsubskrybowanie
### switchMap
zapobieganie callbackHell
### Więcej operatorów 
Aby poznać więcej operatorów polecamy stronę learnrxjs.io/operators [tutaj link]

## Podsumowanie

