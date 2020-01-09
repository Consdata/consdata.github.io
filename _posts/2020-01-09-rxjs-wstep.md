---
layout:    post
title:     RxJS z Angularem - programowanie reaktywne aplikacji frontendowej
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
Pisząc aplikacje z wykorzystaniem Angulara mamy styczność z obiektami typu Observable. Na pewno zdarzyło Ci się użyć serwisu HttpClient do pobierania danych z serwera albo EventEmittera do komunikacji komponentów rodzic-dziecko. W każdym z tych przypadków użycia masz do czynienia z obiektem Observable. Czy zastanawiałeś się nad tym, czym w zasadzie jest ten typ obiektu, dlaczego musisz go zasubskrybować, aby otrzymać dane? A może już to wiesz, ale chciałbyś dowiedzieć się jak efektywniej wykorzystać bibliotekę RxJS?

Jeżeli tak, to ten artykuł jest dla Ciebie!

## Czym jest RxJS?
_Reactive Extensions for JavaScript (RxJS)_ jest biblioteką ułatwiającą programowanie reaktywne w języku JavaScript. Dzięki tej bibliotece i komponentom, jakie udostępnia tworzenie asynchronicznych programów jest intuicyjne i proste - zaraz przekonasz się jak bardzo!

## Strumień danych
Zacznijmy jednak od podstaw. Czym jest strumień danych w programowaniu reaktywnym? Według definicji, jest on sekwencją danych dostępnych w danym okresie. Taką sekwencję możemy obserwować oraz pobrać z niej potrzebne nam obiekty lub wartości. Dane natomiast mogą pojawić się w każdym momencie jego życia, a o ich pojawieniu się jesteśmy powiadamiani callbackiem (czyli funkcją odwrotną wywoływaną przez strumień). Istnieją dwa typy strumieni - zimny i ciepły.
### Strumień zimny
Strumień zimny nie będzie emitować (produkować) danych aż do momentu, gdy ktoś (obserwator) zacznie go obserwować. Wyemituje odrębną wartość dla każdego nowego obserwatora - te wartości nie są współdzielone. Przykładowo: wysłanie żądania GET do serwera.
```typescript
this.httpClient.get<ServerResponse>('someUrl')
```
### Strumień ciepły
Strumień ciepły, w przeciwieństwie do zimnego, emituje dane niezależnie od tego, czy ktoś na niego nasłuchuje. Każdy obserwator operuje na współdzielonym zasobie danych - dwóch obserwatorów otrzyma tą samą wartość w momencie wyemitowania danej przez strumień. Przykładowo: wydarzenia 'click'
```typescript
import {fromEvent} from 'rxjs';
 
fromEvent(document, 'click')
```

## Observable, wzorzec Obserwator
Mając już wiedzę czym jest strumień i z jakimi rodzajami strumieni możemy się spotkać, warto przejść do opisania podstawowego konceptu RxJS: Observable.
Observable jest obiektem reprezentującym strumień danych. Implementuje wzorzec projektowy _Obserwator_, który zakłada istnienie bytu przechowującego listę obiektów - obserwatorów, nasłuchujących na jakiekolwiek zmiany stanu danego bytu, powiadamiającego każdego z nich o zmianie poprzez wywołanie funkcji przez nich przekazanych (callback).

Najprostszego Observable możemy stworzyć za pomocą funkcji statycznej _of_.
```typescript
// obiekt Observable, emitujący wartości liczbowe od 1 do 5
const numbers$: Observable<number> = of(1,2,3,4,5);

```
Obiekt numbers$ jest definicją strumienia danych typu _number_. Jest to tylko i wyłącznie szablon strumienia. W tym przypadku stworzyliśmy strumień zimny. Znamy zbiór danych (1,2,3,4,5), jednak dane zaczną być emitowane dopiero w momencie rozpoczęcia nasłuchiwania na dany strumień przez obserwatora. Pod strumień 'podłączamy' się za pomocą funkcji subscribe().
### subscribe() i unsubscribe()
Funkcja subscribe jako parametr oczekuje obiektu, który definiuje trzy funkcje: _next_, _error_ oraz _complete_.
```typescript
const subscription = numbers$.subscribe({
    next(value) {},
    error(err) {},
    complete() {}
});
```
Każda z tych funkcji jest _callbackiem_, który jest wywoływany w poszczególnych momentach przepływu danych przez strumień. Funkcja _next(value)_ wywoływana jest za każdym razem, gdy strumień emituje pojedynczą wartość - czyli w naszym przypadku funkcja _next()_ zostanie wywołana 5-krotnie, po razie dla każdej z cyfr z zakresu 1-5. Callback _error(err)_ zostanie wywołany w momencie, gdy strumień zostanie nienaturalnie zamknięty lub przerwany. _Complete_ jest ostatnim callbackiem, który wywoływany jest po zamknięciu strumienia.

Wywołanie funkcji _subscribe()_ dopisuje nas do listy obserwatorów danego strumienia.

W momencie podpięcia się jako obserwator do danego Observable zostaje przekazany nam obiekt typu Subscription, na którym możemy wywołać metodę _unsubscribe()_, która usunie nas z listy obserwatorów. 

Odsubskrybowanie się jest bardzo ważne w przypadku strumieni gorących, które w większości przypadków są nieskończone - emitują wartość przez potencjalnie nieskończoną ilość czasu. Jeżeli zapomnimy o usunięciu nas z listy obserwatorów danego strumienia, referencja do stworzonego przez nas obserwatora będzie istnieć przez cały cykl życia aplikacji - tworząc nieskończoną dziurę w pamięci, która w sytuacji ekstremalnej może doprowadzić do zabicia karty, w której działa nasza aplikacja.
## Subject - tworzenie własnych strumieni
RxJS oferuje nam również możliwość tworzenia własnych strumieni. Możemy to zrobić za pomocą obiektów typu Subject. Subject, tłumacząc na język polski, oznacza dosłownie: _temat_. Taki strumień jest więc tematem, potencjalnie nieskończonym, który emituje nowe wartości w kluczowych dla nas miejscach aplikacji. 
Subject możemy stworzyć bardzo prosto - jak każdy inny obiekt:
```typescript
const subject$ = new Subject<number>();
```
Do danego strumienia możemy teraz się subskrybować jako obserwatorzy:
```typescript
subject$.asObservable()
    .subscribe((value) => console.log('value from subject$: ', value))
```
Zmienna _subject$_ oferuje nam teraz metodę _next(value: number)_, dzięki której możemy rozesłać wszystkim obserwatorom nową wartość liczbową, w taki sposób:
```typescript
subject$.next(5);
// value from subject$: 5
``` 
Strumień, jaki teraz stworzyliśmy jest strumieniem nieskończonym, więc musimy pamiętać o odsubskrybowaniu się po zakończeniu nasłuchiwania! Możemy również zamknąć strumień wywołując metodę _complete()_.

Wyemitowaliśmy w powyższym przykładzie wartość numeryczną '5', którą otrzymał pojedynczy obserwator. Jeżeli w momencie emisji nowej wartości nie istniałby żaden obserwator, to wartość ta przepadła by na wieki. Jest to dosyć smutne. Co w przypadku, gdy ta wartość jest dla nas ważna i nie chcemy jej stracić? Na szczęście z pomocą przychodzą nam specyficzne obiekty rozszerzające typ Subject.
### ReplaySubject
ReplaySubject jest strumieniem, który dla każdego nowego obserwatora odtwarza N ostatnio emitowanych danych. Wartość N możemy przekazać w konstruktorze tego obiektu, o tak:
```typescript
const replaySubject$ = new ReplaySubject<number>(5);
``` 
Jeżeli wcześniej przez ten strumień emitowane były wartości, to przy subskrypcji, zostaną one odtworzone danemu obserwatorowi, ale nie więcej niż 5 ostatnich. Przykładowo:
```typescript
replaySubject$.next(1);
replaySubject$.next(2);
replaySubject$.next(3);
replaySubject$.next(4);
replaySubject$.next(5);
replaySubject$.next(6);
replaySubject$.asObservable()
    .subscribe(replayedValue => console.log(replayedValue));
// 2
// 3
// 4
// 5
// 6
```
### BehaviorSubject
BehaviorSubject jest specyficznym rodzajem strumienia. Zawsze posiada on wartość, gdyż jest ona wymagana przy tworzeniu danego obiektu. Ponadto, strumień ten zawsze przechowuje ostatnio emitowaną wartość i podobnie jak w przypadku ReplaySubject, odtwarza ją każdemu nowemu obserwatorowi.
Tworzymy go w równie prosty sposób: 
```typescript
const behaviorSubject = new BehaviorSubject<boolean>(true);
behaviorSubject.asObservable().subscribe(value => console.log(value))
// true
behaviorSubject.next(false);
behaviorSubject.asObservable().subscribe(value => console.log("drugi obserwator: ", value))
// false
// drugi obserwator: false
```
Teraz, każdy nowy obserwator otrzyma obecnie przechowywaną przez dany strumień wartość - logiczną wartość 'true'.
### AsyncSubject
AsyncSubject jest specyficznym strumieniem, ponieważ wyemituję on ostatnią wartość przekazaną w funkcji next() dopiero po zamknięciu tego strumienia, czyli po wywołaniu na nim funkcji complete(). Po zamknięciu przechowuje on wyemitowaną wartość i wyemituję ją każdemu nowemu obserwatorowi, który spóźnił się z subskrypcją przed zamknięciem strumienia.
```typescript
const asyncSubject = new AsyncSubject<number>();
asyncSubject.asObservable().subscribe(value => console.log("wartosc z async subject: ", value))
asyncSubject.next(1);
asyncSubject.next(2);
asyncSubject.complete();
// wartosc z async subject: 2
asyncSubject.asObservable().subscribe(value => console.log("wartosc z async subject po zamknieciu strumienia: ", value))
// wartosc z async subject po zamknieciu strumienia: 2
```
## RxJS operatory - operacje na strumieniu
Poznaliśmy różne sposoby tworzenia strumieni, co jeśli emitowane dane za każdym razem chcielibyśmy zmodyfikować pod nasz konkretny przypadek biznesowy? Z pomocą oczywiście przychodzi nam RxJS z szerokim wachlarzem operatorów, czyli funkcji operujących na naszym strumieniu. Poniżej przedstawię Ci parę z nich, które uważam za bardzo przydatne w codziennej pracy.

Załóżmy, że operujemy na następującym strumieniu:
```typescript
const strumien$ = new BehaviorSubject<number>(15_000);
const observable$ = strumien$.asObservable();
```
Strumień domyślnie emituje wartość liczbową '15000'.
Możemy operować na danych produkowanych przez nasz strumień, przekazując potrzebne nam operatory jako argumenty funkcji _pipe()_ wywołanej na observable$.
### map
Map jest z pewnością znanym Ci operatorem, chociażby z API JS Arrays.map, którym RxJS się sugerował. Map transformuje dane zwracając nam nowy wynik dla każdej emitowanej danej. Przykładowo:
```typescript
observable$.pipe(map(numerek => numerek*2))
    .subscribe(value => console.log('zmapowana wartosc: ', value))
// zmapowana wartosc: 30000
```

### first
Interesującym operatorem jest operator _first()_, który pobiera pierwszy element ze strumienia, następnie jako efekt uboczny - wypisuje obserwatora z listy obserwujących dany strumień! Jest to bardzo wygodne, jeżeli z danego gorącego strumienia potrzebujemy tylko jednej wartości - nie musimy przejmować się w tym momencie wywołaniem funkcji unsubscribe().
Przykład:
```typescript
observable$.pipe(first())
    .subscribe(value => console.log('pierwsza otrzymana wartosc: ', value))
// pierwsza otrzymana wartosc: 15000
strumien$.next(25000);
// nic sie nie stalo, observable$ odpisal sie z listy obserwatorow
```
### withLatestFrom
Następnym operatorem wartym uwagi jest _withLatestFrom_, który umożliwia nam 'skrzyżowanie strumieni', czyli dołączenie do jednego strumienia ostatnio emitowanej wartości przez drugi strumień. Przykładowo:
```typescript
const otherStream$ = new BehaviourSubject<boolean>(true);
observable$.pipe(withLatestFrom(otherStream$))
    .subscribe(([value, otherStreamValue]) => console.log('otrzymana wartosc z pierwszego strumienia: {}, z drugiego: {}', value, otherStreamValue))
// otrzymana wartosc z pierwszego strumienia: 15000, z drugiego: true
```
### takeUntil
Operator takeUntil jest wygodnym operatorem, jeżeli chcemy w przejrzysty i prosty sposób wypisać się z listy obserwujących dany strumień.
Rzućmy okiem na kod:
```typescript
@Component({
  selector: 'app-some-component',
  template: `
        some template
  `,
  styleUrls: ['some-styles.scss']
})
export class SomeComponent implements OnDestroy, OnInit {
    private destroySubject$ = new Subject<void>();
    private someValues$ = new BehaviourSubject<string>('initial value');
    
    ngOnInit(): void {
       this.someValues$.asObservable().pipe(takeUnitl(this.destroySubject$))
            .subscribe(value => ...)
    }

    ngOnDestroy(): void {
       this.destroySubject.next();
    }   

}
``` 
Powyższy fragment przedstawia nam SomeComponent, który nasłuchuje na wartości ze strumienia _someValues$_ aż do momentu, gdy zostanie wyemitowana wartość z drugiego strumienia: _destroySubject$_. W taki oto sposób nie musimy pamiętać o ręcznym odsubskrybowaniu się z pierwszego strumienia, gdyż zostanie on automatycznie zamknięty w momencie zniszczenia komponentu przez Angulara. :)
### switchMap
Kolejnym przydatnym operatorem może być _switchMap()_, którego zastosowanie pozwala nam zachować czystość i powstrzyma nas przed tworzeniem tzw. _callback hell_, czyli zagnieżdżania wywołań _subscribe()_ tworzących łańcuch wywołań trudny w czytaniu i utrzymywaniu. Dlatego też zamiast pisać:
```typescript
observable$.subscribe(
    value => someService.processValue(value)
        .subscribe(someServiceResponse => andYetAnotherService.processAnotherValue(someServiceResponse)
                .subscribe(yetAnotherResponse => veryImportantService.processVeryImportantValue(yetAnotherResponse)
                    .subscribe(veryImportantResponse => ...))))
```
Każdy z serwisów zwraca Observable do strumienia, z którego potrzebujemy wartości do wywołania kolejnego serwisu. Możemy zamiast tego napisać:
```typescript
observable$.pipe(
    switchMap(value => someService.processValue(value)),
    switchMap(someServiceResponse => andYetAnotherService.processAnotherValue(someServiceResponse)),
    switchMap(yetAnotherResponse => veryImportantService.processVeryImportantValue(yetAnotherResponse)))
        .subscribe(veryImportantResponse => ...)
```
SwitchMap automatycznie subskrybuje nas do kolejnego strumienia, przez co kod staje się czytelniejszy.
Oczywiście zagnieżdżanie strumieni i tak wprowadza narzut przeszkadzający w szybkim zrozumieniu, co dany kod produkuje, lecz jest to bardziej eleganckie podejście.
### Więcej operatorów 
Aby poznać więcej operatorów polecam stronę [learnrxjs](https://www.learnrxjs.io/operators), która świetnie opisuje interesujące operatory udostępnione w bibliotece RxJS.

## Podsumowanie
RxJS jest potężnym narzędziem dającym wiele możliwości napisania kodu, który będzie reaktywny, asynchroniczny i intuicyjny dla czytającego go kolegi lub koleżanki z zespołu. Mam nadzieję, że będziesz kontynuować swoją przygodę z programowaniem reaktywnym i będziesz móc przekuć zebraną przy czytaniu tego artykułu wiedzę w kod asynchroniczny, napawający Cię dumą!
