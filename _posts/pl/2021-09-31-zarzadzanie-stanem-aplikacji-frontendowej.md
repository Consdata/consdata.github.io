---
layout:     post
title:      "Zarządzanie stanem aplikacji frontendowej na przykładzie NgRx"
date:       2021-10-13 6:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mchrapkowicz
image:      /assets/img/posts/2021-09-31-zarzadzanie-stanem-aplikacji-frontendowej/ngrx.webp
description: "W miarę rozwijania złożonych aplikacji webowych ważnym i nieoczywistym zagadnieniem staje się projektowanie przepływu informacji pomiędzy komponentami. W tym artykule poznamy jedną z implementacji architektury Redux wykorzystującej koncepcję globalnego stanu aplikacji oraz pokażemy przykład jej zastosowania w bibliotece NgRx."
tags:
- frontend
- redux
- state management
- zarządzanie stanem
- store
- reducer
- action
- effect
- angular
- react
---

W miarę rozwijania złożonych aplikacji webowych ważnym i nieoczywistym zagadnieniem staje się projektowanie przepływu informacji pomiędzy komponentami. Często mamy do czynienia z wieloma źródłami danych. Mogą to być na przykład najróżniejsze zewnętrzne serwisy czy interakcje użytkownika z systemem. Nierzadko dane z tych źródeł potrzebne są w różnych obszarach aplikacji, wpływają na wiele aspektów jej działania czy wyglądu. W związku z powyższym muszą zostać rozpropagowane do miejsc, w których zostaną użyte. Można się jednak zastanowić, czy "przepychanie" parametrów po całej aplikacji jest szczytem naszych możliwości. W przypadku rozbudowanych projektów jest to dość żmudne zadanie, a w efekcie bardzo szybko może zabałaganić nasz kod, pomieszać orkiestrację z prezentacją, nie wspominając już o wprowadzeniu trudności w testowaniu logiki opartej o przekazywane dane. 

Jeden z pomysłów adresujących między innymi powyższe problemy wygląda następująco:
* stwórzmy dostępne tylko do odczytu, pojedyncze źródło danych wejściowych, 
* wyraźnie rozgraniczmy logikę aplikacji od jej prezentacji,
* sprawmy, żeby dane wynikały z historii pewnych zdarzeń zachodzących w aplikacji,
* nie przechowujmy danych, które mogą zostać wyliczone na podstawie już przechowywanych - ewaluujmy je w locie.

Te i kilka innych koncepcji zebrano i wymyślono w ten sposób architekturę zwaną Redux. Mając na uwadze problem, który chcemy rozwiązać oraz ogólny zarys rozwiązania, postaram się przedstawić jej składowe oraz implementację w bibliotece NgRx. 

### Czy na pewno potrzebujesz zarządzania stanem aplikacji?
Zanim zaczniemy, zwróćmy uwagę, że nie każda aplikacja jest tak rozbudowana i złożona, żeby potrzebować całego mechanizmu zarządzania stanem. Jeśli "przepychanie parametrów" odbywa się pomiędzy niewielką liczbą komponentów, to nie musimy wytaczać przysłowiowych armat, żeby ustrzelić komara. W ustaleniu, czy dobrze byłoby sobie pomóc zewnętrznym rozwiązaniem, pomaga zasada SHARI zaprezentowana, chociażby, w [oficjalnej dokumentacji NgRx](https://ngrx.io/guide/store/why). Warto sobie odpowiedzieć, czy potrzebujemy stanu, który jest:
- **S**hared - współdzielony pomiędzy wiele komponentów i serwisów.
- **H**ydrated - trwały i z możliwością ponownego zasilenia z zewnętrznego źródła jak np. local storage.
- **A**vailable - dostępny cały czas, niezależnie od sposobu nawigacji po aplikacji, np. podczas przechodzenia i cofania się w aplikacji prezentującej złożony wniosek.
- **R**etrieved - zdolny do przechowywania danych pochodzących z zewnętrznych źródeł, co pozwala na przykład zapisać wynik żądania HTTP i nie wykonywać go po raz kolejny w celu otrzymania tych samych informacji.
- **I**mpacted - zdolny do zmieniania się pod wpływem akcji wykonywanych przez komponenty i serwisy.

## Architektura Redux
Spójrzmy zatem co tak naprawdę kryje się pod tym, być może na razie dość enigmatycznym, pojęciem "Redux". Posłużę się tutaj obrazkiem zaczerpniętym z dokumentacji NgRx.

![Redux](/assets/img/posts/2021-09-31-zarzadzanie-stanem-aplikacji-frontendowej/redux.png)
<span class="img-legend">Architektura Redux z lotu ptaka. Źródło: dokumentacja NgRx</span>

Na razie powyższy diagram może wydawać się nieco tajemniczy. Dla bardziej zaprawionych w bojach po stronie backendowej może się skojarzyć z CQRS. Niemniej już spieszę z wyjaśnieniami.

* Architektura Redux zakłada istnienie globalnego, niemutowalnego bytu, przechowującego stan aplikacji - **store**. Fizycznie jest to obiekt w formacie JSON, którego struktura definiowana jest przez programistę. 
* Podstawowym mechanizmem komunikacji są **akcje** (ang. _actions_). Reprezentują one konkretne zdarzenia zachodzące w systemie i niosą ze sobą określone informacje.
* Akcje mogą być przechwytywane przez **reducery** (ang. _reducers_). Reducerem nazywamy czystą funkcję (ang. _pure function_), która konsumuje akcję i, w zależności od jej przeznaczenia oraz zgodnie z logiką reducera, zastępuje store nowym, z uwzględnioną zmianą. 
* Dane ze store do komponentów trafiają poprzez **selektory** (ang. _selectors_). Selektory powinny otrzymywać wyłącznie dane potrzebne do działania komponentów, w których są używane.
* W przypadkach, kiedy wywołanie akcji powinno pociągnąć za sobą dowolne działanie niezwiązane bezpośrednio z aplikacją (np. zapytanie do bazy danych, czy żądanie do zewnętrznej usługi) - do gry wchodzi **middleware**, które dalej, ze względu na nomenklaturę stosowaną w NgRx, nazywać będziemy **efektami** (ang. _effects_). Podobnie jak reducery, middleware potrafi reagować na konkretne akcje i wykonać przypisane im zadanie, jak również wywołać kolejne akcje.

## Implementacja Redux w NgRx
Przy pierwszym kontakcie wszystkie powyższe pojęcia i pomysły mogą wydawać się nieco skomplikowane i nadmiarowe, zatem na prostym przykładzie pokażę, jak wyglądają fragmenty aplikacji pisanej przy pomocy NgRx. Na końcu wpisu znajduje się link do repozytorium, w którym widać, jak wygląda cała aplikacja oraz jej konfiguracja. Również z tego powodu pomijam instrukcje instalacji biblioteki i konfiguracji środowiska.

Załóżmy, że chcemy stworzyć prosty program pozwalający na zapisywanie sposobów na pokonanie nudy. Jednym z możliwych do podjęcia działań będzie wywołanie API, które na każde żądanie odpowie pomysłem na jakąś aktywność. Drugą opcją będzie dodanie własnej koncepcji poprzez prosty formularz. Zacznijmy zatem.

### Store
Na samym początku procesu, warto uzmysłowić sobie, co tak naprawdę chcemy zapisywać w naszym store, a potem powiedzieć to Typescriptowi tworząc interfejs. W naszej aplikacji będziemy przechowywali w nim jedynie listę czynności potencjalnie zabijających nudę, jednak nawet w tak prostym przypadku warto zwrócić uwagę na to, jaką strukturę planujemy nadać store'owi. Początkowo najprościej jest operować na płaskiej strukturze, w której wszystkie dane znajdują się na tym samym poziomie.
Niestety przy rozwijaniu aplikacji takie podejście staje się bardzo nieefektywne, zarówno pod względem organizacji, jak i, z czasem, również wydajności. Zdecydowanie lepiej jest podzielić store na tak zwane "slice'y", czyli wycinki danych, na przykład dzieląc store według funkcjonalności aplikacji. Zobaczmy takie podejście na przykładzie:

```typescript
export interface State {
    activitiesState: ActivityItemsState;
}

export interface ActivityItemsState {
    activities: ActivityItemModel[];
}

export interface ActivityItemModel {
    name: string;
    participants: number;
}
```

Przejdźmy po powyższych interfejsach po kolei. Pierwszy z nich mówi, że spodziewamy się mieć jeden wycinek danych (slice) typu `ActivityItemsState`, w którym będą przechowywane wszystkie informacje dotyczące aktywności dodanych do aplikacji. Innymi słowy jest to logicznie wydzielony fragment domeny. Następnie definiujemy, co tak naprawdę znajduje się w tym wycinku danych - jest to tablica obiektów typu `ActivityItemModel`, czyli informacji o różnych aktywnościach. Ostatni interfejs to już wyłącznie definicja modelu biznesowego - w naszej aplikacji będziemy mieli do czynienia z nazwą czynności oraz możliwą liczbą jej uczestników.

Taki podział store zapewnia bardzo łatwą jego rozszerzalność, gdyż w przypadku dodania nowej funkcjonalności wystarczy dopisać nowy wycinek danych do store. W bardzo dużych aplikacjach, gdzie obiekt stanu aplikacji jest już dość potężny, to podejście ma jeszcze jedną zaletę - pozwala wykorzystać _lazy loading_, to znaczy wczytywać tylko konkretne wycinki store, potrzebne do aktualnie przetwarzanej części aplikacji. 

### Akcje
Potrzebujemy teraz opcji wywoływania akcji, żeby móc zgłaszać zajście pewnych faktów w systemie. W naszej aplikacji zakładamy możliwość wystąpienia dwóch zdarzeń - wystosowania żądania do API po pomysł na jakieś zajęcie oraz dodania aktywności do listy. 

```typescript
export const activityAddedType = '[activity] Activity added';
export const activitiesRetrievedType = '[activity] Activities retrieved';

export const activityAdded = createAction(activityAddedType, props<ActivityItemModel>());
export const activitiesRetrieved = createAction(activitiesRetrievedType);
```

Każda akcja musi mieć zdefiniowany swój typ. NgRx używa do tego tzw. _literal type_, czyli po prostu używa typu string do identyfikacji akcji (u nas odpowiednio `[activity] Activity added` oraz `[activity] Activities retrieved`). W nazywaniu akcji mamy pełną dowolność. Dodatkowo w przypadku dodawania nowej aktywności do listy musimy ją przekazać w ciele akcji przy pomocy metody `props<>()`. Dzięki wykorzystaniu funkcji `createAction` z biblioteki NgRx tworzenie akcji, jak widać, jest bardzo proste.

### Efekt
Jak wspomniałem, będziemy korzystać z zewnętrznego API. W tym celu napiszemy efekt, który będzie reagował na akcję `[activity] Activities retrieved`, następnie wystosowywał żądanie HTTP, a po otrzymaniu odpowiedzi - dodawał ją do listy.

Pojawia się tutaj dość dużo zagadnień, zatem spójrzmy na ten fragment nieco inaczej. Zastanówmy się najpierw jak, używając dotychczas znanych nam narzędzi (na  przykład RxJs), moglibyśmy napisać logikę wywołującą żądanie na każde kliknięcie przycisku i przekazać je dalej. Jeśli założymy, że zdarzenie kliknięcia pojawia się w Observable `click$`, a strumień, na który ma trafić odpowiedź został nazwany `response$`, wówczas kod mógłby wyglądać tak:

```typescript
this.response$ = this.click$.pipe(
    switchMap(() => this.http.get<ActivityItemModel>('https://www.boredapi.com/api/activity')
      .pipe(
        catchError(() => EMPTY)
      ))
);
```

Jeśli na tym etapie potrzebujesz chwili przerwy na zrozumienie co dzieje się w tym kodzie, to polecam [wpis o RxJs]({% post_url pl/2020-01-09-rxjs-introduction %}) dostępny na łamach naszego bloga.

Wracając do naszego efektu - w zasadzie większość mamy już napisaną! Pozostaje nam tylko kilka rzeczy:
* efekt jest tak naprawdę serwisem, jakie znamy z codziennego pisania w Angularze, tworzymy zatem klasę `ActivityEffect` i dekorujemy ją przy pomocy `@Injectable()`.
* nie powinniśmy reagować bezpośrednio na zdarzenie kliknięcia przycisku, a na zgłoszone wcześniej akcję typu `activitiesRetrievedType`. Mamy do dyspozycji serwis `Actions`, który możemy traktować jak swoistą szynę, na którą trafiają wywołane akcje. Wstrzykujemy go więc przez konstruktor do efektu. Chcąc reagować wyłącznie na określony typ akcji korzystamy z operatora `ofType`. 
* wynik żądania w naszym wypadku nie powinien trafiać do żadnego strumienia, tylko spowodować wywołanie akcji `activityAdded`. Wystarczy dodać  mapowanie w operatorze `pipe()`.

Cały efekt wygląda wówczas tak:

```typescript
@Injectable()
export class ActivityEffect {

  constructor(private actions$: Actions, private http: HttpClient) {
  }

  getActivity$ = createEffect(() => this.actions$.pipe(
    ofType(activitiesRetrievedType),
    switchMap(() => this.http.get<ActivityItemModel>('https://www.boredapi.com/api/activity')
      .pipe(
        map(response => (activityAdded(response))),
        catchError(() => EMPTY)
      ))
  ));
}
```

Podsumowując: w wyniku działania tego efektu każde wywołanie akcji `[activity] Activities retrieved` przy poprawnej odpowiedzi z API wywoła akcję `[activity] Activity added` z otrzymaną czynnością. Można oczywiście tworzyć efekty obsługujące inne operacje, nie trzeba ograniczać się do żądań HTTP.

### Reducer
W reducerach zazwyczaj znajduje się najwięcej logiki ze wszystkich komponentów NgRx. To tutaj trzeba zdecydować jak dodawać do store kolejne dane. Warto pamiętać, że reducery to **czyste funkcje**, które przyjmują jako parametr akcję i obecny stan aplikacji, a następnie zwracają nowy stan, dzięki czemu zachowujemy jego niemutowalność. W naszym przypadku wygląda to tak:

```typescript
const initialState: ActivityItemsState = {activities: []};

export const activityReducer = createReducer(
    initialState,
    on(addActivity, (state, payload) => ({
        ...state,
        activities: state.activities.concat({activity: payload.activity, participants: payload.participants} as ActivityItemModel)
    }))
);
```

W pierwszej linii definiujemy, w jaki sposób ma zostać zainicjowany store (lub - jak ma to miejsce powyżej - jego wycinek). W naszym przypadku będzie to pusta tablica. Następnie wywołujemy funkcję `createReducer`, która w pierwszym parametrze przyjmuje wspomniany stan początkowy, a w drugim (i każdym kolejnym) odpowiednie handlery. W tym przypadku reducer reaguje na akcję `[activity] Activity added` poprzez dodanie do dotychczasowej tablicy `activities` nowego elementu i zwrócenie całości jako wynik wywołania funkcji. 

Reducer jest częścią całej architektury, którą można w bardzo łatwy sposób przetestować i upewnić się, że działa poprawnie. W tym przypadku możemy napisać taki test:

```typescript
describe('Activity reducer test', () => {
  function createState(activities: ActivityItemModel[]): ActivityItemsState {
    return {activities: [...activities]};
  }

  it('should add new activity', () => {
    // given
    const state = createState([]);
    const newActivityName = 'New activity';
    const newActivityParticipants = 2;
    const action = activityAdded({activity: newActivityName, participants: newActivityParticipants});

    // when
    const newState = activityReducer(state, action);

    // then
    expect(newState.activities.length).toBe(1);
    expect(newState.activities[0].activity).toEqual(newActivityName);
    expect(newState.activities[0].participants).toEqual(newActivityParticipants);
  });
});
```
Test przebiega następująco:
* w sekcji `given` tworzymy sztuczny, pusty store oraz akcję `activityAdded`,
* w sekcji `when` wywołujemy interesujący nas reducer i przypisujemy wynik do zmiennej `newState`
* w sekcji `then` sprawdzamy czy w store znajduje się jeden, dodany przez nas element i czy jego właściwości zgadzają sie z tym, co przekazaliśmy w akcji.

Jeśli wszystkie trzy asercje zostaną spełnione, wówczas wiemy, że mechanizm dodawania nowej aktywności do store działa.

### Selektor
Ostatnią częścią układanki w przepływie są selektory. Podobnie jak reducery są one czystymi funkcjami, których zadaniem jest obserwowanie wycinków store i dostarczanie informacji o ich zmianach do komponentów. Warto tu wspomnieć, że są one dobrym miejscem na to, by dane te odpowiednio przygotować, tak, by po trafieniu do komponentu mogły być „wygodnie” użyte. Dzięki temu komponent może całkowicie abstrahować od struktury store. W naszej aplikacji selektor zdefiniowany jest następująco:

```typescript
const getActivitiesFeatureState = createFeatureSelector<ActivityItemsState>('activitiesState');

export const getActivities = createSelector(getActivitiesFeatureState, state => state.activities);
```

Najpierw, przy pomocy funkcji `createFeatureSelector` tworzymy tzw. feature selector pozwalający na wyciągnięcie pojedynczego wycinka (_slice_) danych, nazwanego przez nas `activitiesState`. Następnie używamy go tworząc właściwy selektor przy pomocy funkcji `createSelector` i wskazując go w pierwszym jej argumencie. Drugim parametrem jest funkcja wskazująca, które dane chcemy otrzymać w wyniku działania selektora. W naszym przypadku jest to tablica czynności, o nazwie `activities`. Tak zbudowany selektor jest gotowy do użycia w komponencie.

Na początku tego punktu wspomniałem, że selektory są czystymi funkcjami, co między innymi oznacza, że przy zachowaniu tego samego stanu i dla tych samych parametrów wielu wywołań zawsze zwrócą ten sam wynik. Ta właściwość została wykorzystana w mechanizmie nazywanym „memoization” (zapamiętywanie). Dzięki niemu NgRx zapamiętuje, z jakimi argumentami ostatnio wywoływany był dany selektor. Jeśli nie uległy one zmianie, wówczas zwraca wynik poprzedniego wywołania selektora, nie wykonując logiki pobierania danych ze store.

### Spięcie całości
Mamy już wszystkie potrzebne części logiki NgRx, z których chcemy skorzystać. Pozostaje już tylko dowiedzieć się, jak ich użyć. Pokażę sytuację, w której użytkownik klika przycisk odpowiadający za pobranie przykładowej aktywności z API, przechodząc jednocześnie przez odpowiednie miejsca w kodzie. W trakcie czytania zachęcam do spoglądania na zamieszczony wcześniej w poście diagram przepływu.

1. Zacznijmy od komponentu wywołującego początkową akcję typu `[activity] Activities retrieved`. Budowa klasy tego komponentu może wyglądać następująco (pomijam _template_):
```typescript
export class ActivityApiComponent {

    constructor(private store: Store<State>) {
    }

    getActivity(): void {
        this.store.dispatch(getActivity());
    }
}
```
Jak widać w konstruktorze, wstrzykujemy obiekt Store, na którym wykonujemy metodę `dispatch` podając w jej argumencie typ akcji. Na tym kończy się odpowiedzialność komponentu.

2. Wysłaną akcję przechwytuje efekt, który, zgodnie z kodem zaprezentowanym wcześniej, wysyła żądanie do API, a otrzymawszy odpowiedź przekazuje ją jako argument nowej akcji `[activity] Activity added`.
3. Akcja typu `[activity] Activity added` jest przechwytywana przez reducer, który wyłuskuje z niej przekazaną z API odpowiedź i dodaje do store.
4. W ostatniej kolejności do gry wchodzi selektor, który wykrywa zmianę store wynikającą z działania reducera. Użycie selektora w komponencie może wyglądać następująco:

```typescript
export class ActivityListComponent implements OnInit {

    activities$: Observable<ActivityItemModel[]>;

    constructor(private store: Store<State>) {
    }

    ngOnInit(): void {
        this.activities$ = this.store.select(getActivities);
    }
}
```
W metodzie `ngOnInit` wskazujemy, że chcemy reagować na zmiany store przy pomocy selektora `getActivities`. Zmiennej `activities$` możemy następnie użyć w ciele komponentu przy pomocy async pipe, na przykład:

```html
<div *ngFor="let activity of activities$ | async">
    <!-- wnętrze komponentu listy -->
</div>
```

Tym samym cały proces dobiega końca, a kolejne kliknięcie przycisku wywoła go od nowa.

## Inne podejścia
Warto wspomnieć, że tak, jak dla Angulara istnieje biblioteka NgRx, tak również dla pozostałych frameworków z tzw. wielkiej trójcy znajdziemy implementacje architektury Redux:
- Redux dla Reacta
- Vuex dla Vue

Należy również zaznaczyć, że Redux nie jest jedynym sposobem na zarządzanie stanem. Można tutaj wymienić takie alternatywy, jak:
* [MobX](https://mobx.js.org/README.html) 
* [Cycle.js](https://cycle.js.org/)
* [Flux](https://github.com/facebook/flux) - warto wiedzieć, że Flux był protoplastą Reduxa
* [Apollo](https://www.apollographql.com/)

## Podsumowanie
Łatwo zauważyć, że na pierwszy ogień NgRx, czy szerzej - Redux - potrafią nieco przytłoczyć ilością kodu, którą trzeba napisać, by nawet drobne funkcjonalności działały. Jest to jeden z największych zarzutów wobec tego rozwiązania, więc jeśli takie były Twoje odczucia podczas czytania tego artykułu - gratuluję krytycznego myślenia! Zauważmy jednak, że po przebrnięciu przez początkowe trudności zostajemy z aplikacją, którą bardzo łatwo możemy przetestować, rozszerzać i której działanie jest jasno zdefiniowane. Chcę też zwrócić uwagę, że przytaczane tutaj przykłady były trywialne, w związku z czym stosunek tzw. boilerplate kodu do faktycznej logiki jest duży. W przypadku złożonych aplikacji, w których sens użycia bibliotek takich jak NgRx jest znacznie większy, narzut ten staje się dużo bardziej akceptowalny.

Mam nadzieję, że tym artykułem zainspirowałem nieco do zainteresowania się tematem zarządzania stanem aplikacji frontendowych. Serdecznie zapraszam do rozpoznawania tematu we własnym zakresie, gdyż przedstawiłem tu zaledwie namiastkę możliwości, jakie zapewnia Redux i NgRx.

### Linki
- [Repozytorium z projektem](https://github.com/Chrrapek/BoredNgRx)
- [Dokumentacja NgRx](https://ngrx.io/docs)
