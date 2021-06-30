---
layout:    post
title:     Testowanie frontendu - Cz. 2. Testowanie komponentów i serwisów
published: true
lang: pl
date:      2019-11-20 15:00:00 +0100
author:    kczechowski
image:      /assets/img/posts/2019-11-20-testowanie-komponentow-i-serwisow/testowanie_frontendu.jpg
tags:
    - Jasmine
    - Angular
    - unit test
description: "Jeśli zastanawialiście się, jak rozpocząć testy komponentów i serwisu w przypadku kwestii dotyczącej testowania frontendu, to znak że ten wpis jest dla Was."
---

2 tygodnie temu [Marcin Mendlik pisał o konfiguracji Karmy i Jasmine w projekcie]({% post_url pl/2019-11-06-testowanie-frontendu-wprowadzenie-do-jasmine %}).
Dziś będzie o tym, jak rozpocząć testy komponentów i serwisu.

# Wprowadzenie do testowania
[Projekt dostępny jest tutaj](https://github.com/krzysztof83/Angular-testing-services-and-component).
Zaczniemy od *AnimalsComponent* - komponent prezentuje listę zwierząt:

```typescript
@Component({
  selector: 'app-animals',
  templateUrl: './animals.component.html',
  styleUrls: ['./animals.component.scss']
})
export class AnimalsComponent implements OnInit {
  animals$: Observable<Animal[]>;

  constructor(private animalService: AnimalService) { }

  ngOnInit() {
    this.animals$ = this.animalService.getAnimals();
  }
}
```

Na początek sprawdzmy czy komponent zostanie utworzony:

```typescript
describe('AnimalsComponent', () => {
  let component: AnimalsComponent;
  beforeEach(() => {
    component = new AnimalsComponent(null);
  });

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });
});
```

Te testy powinny przejść pozytywnie. *AnimalComponent* potrzebuje *AnimalService*, ale ponieważ z niego nie korzystamy, możemy do konstruktora przekazać null. Jednak jeżeli będziemy chcieli sprawdzić, czy na liście są jakieś zwierzęta, np.:

```typescript
it('should have a animals list with 1 animal', () => {
    component.animals$.subscribe(animals => {
      expect(animals.length).toEqual(1);
      expect(animals).toEqual([fakeAnimal]);
    });
  });
```

Otrzymamy błąd: `TypeError: Cannot read property 'subscribe' of undefined`

Subscribe, wywoływany jest na zmiennej animals$, która inicjowana jest dopiero w metodzie *ngOnInit()*, wywołajmy więc ją na początku naszego nowego testu:

```typescript
it('should have a animals list with 1 animal', () => {
    component.ngOnInit();
    component.animals$.subscribe(animals => {
      expect(animals.length).toEqual(1);
      expect(animals).toEqual([fakeAnimal]);
    });
  });
```

Tym razem mamy błąd: `TypeError: Cannot read property 'getAnimals' of null`

W *ngOnInit()*, które wywołaliśmy, jest metoda: *animalService.getAnimals()*, a do naszego komponentu przekazaliśmy null'a.
Możemy temu zaradzić przekazując spreparowany serwis na początku naszego pliku z testami:

```typescript
const fakeAnimal = {id: 1, name: 'pies'};
let fakeAnimalService;

beforeEach(() => {
    fakeAnimalService = {
      getAnimals: () => of([fakeAnimal]),
      httpClient: {}
    } as any;
    component = new AnimalsComponent(fakeAnimalService);
  });
```

Taki *fakeAnimalService* możemy przekazać do konstruktora. Pusty obiekt *httpClient* nam nie przeszkadza - i tak nie chcemy z niego korzystać. Wykorzystująca go funkcja *getAnimals()* od razu zwróci nam wynik nie korzystając z httpClient'a. Po tych zmianach cała klasa testu wygląda jak poniżej:

```typescript
import {AnimalsComponent} from './animals.component';
import {of} from 'rxjs';

describe('AnimalsComponent', () => {
  let component: AnimalsComponent;
  const fakeAnimal = {id: 1, name: 'pies'};
  let fakeAnimalService;

  beforeEach(() => {
    fakeAnimalService = {
      getAnimals: () => of([fakeAnimal]),
      httpClient: {}
    } as any;
    component = new AnimalsComponent(fakeAnimalService);
  });

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a animals list', () => {
    component.ngOnInit();
    component.animals$.subscribe(animals => {
      expect(animals.length).toEqual(1);
      expect(animals).toEqual([fakeAnimal]);
    });
  });
});
```

Takie testy nie dają nam jednak odpowiedzi na pytania czy nasz serwis został wywołany i ile razy.
Jest to też cenna informacja gdy nasz serwis robi np. jakieś kosztowne obliczenia.

W takiej sytuacji pomoże nam funkcja *createSpyObj*, którą dostarcza nam Jasmine. Do funkcji tej przekażemy dwa parametry: nazwę serwisu i tablicę nazw metod.

`fakeAnimalService = jasmine.createSpyObj('animalService', ['getAnimals']);`

Teraz jeszcze w naszym przypadku testowym musimy ustalić co funkcja *getAnimals* ma zwracać:

`const spy = fakeAnimalService.getAnimals.and.returnValue(of([fakeAnimal]));`

Odpowiedzi których szukaliśmy udzieli nam obiekt *spy*:

```typescript
it('should call getAnimals 1 time without parameters ', () => {
    const spy = fakeAnimalService.getAnimals.and.returnValue(of([fakeAnimal]));
    component.ngOnInit();
    component.animals$.subscribe( () => {
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
```

Istnieje też możliwość skorzystania z prawdziwego serwisu i ustalenia co ma zwrócić dana metoda.

W tym celu dokonamy kilku zmian:

1. `fakeAnimalService = jasmine.createSpyObj('animalService', ['getAnimals']);`
zmienimy na `animalService = new AnimalService(null);`
2. nowy serwis przekarzemy do konstruktora componentu: `animalService = new AnimalService(null);`
3. wykorzystamy też metodę *spyOn()*;
`const spy = spyOn(animalService, 'getAnimals').and.returnValue(of([fakeAnimal]));`

Cały plik z testami wygląda następująco:

```typescript
import {AnimalsComponent} from './animals.component';
import {of} from 'rxjs';
import {AnimalService} from '../animal.service';

describe('AnimalsComponent', () => {
  let component: AnimalsComponent;
  const fakeAnimal = {id: 1, name: 'pies'};
  let animalService;

  beforeEach(() => {
    animalService = new AnimalService(null);
    component = new AnimalsComponent(animalService);
  });

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a animals list', () => {
    spyOn(animalService, 'getAnimals').and.returnValue(of([fakeAnimal]));
    component.ngOnInit();
    component.animals$.subscribe(animals => {
      expect(animals.length).toEqual(1);
      expect(animals).toEqual([fakeAnimal]);
    });
  });

  it('should call getAnimals 1 time without parameters ', () => {
    const spy = spyOn(animalService, 'getAnimals').and.returnValue(of([fakeAnimal]));
    component.ngOnInit();
    component.animals$.subscribe( () => {
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
})
```
## Testy z wykorzystaniem TestBed

Aby pomóc nam w testach Angular dostarcza interfejs *TestBed*.

Na początku, gdy wygenerowaliśmy komponent przy pomocy Angular CLI, zawierał on również testy. Dla komponentu *AnimalsComponent* wyglądały one tak:


```typescript
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalsComponent } from './animals.component';

describe('AnimalsComponent', () => {
  let component: AnimalsComponent;
  let fixture: ComponentFixture<AnimalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });
});
```

Niestety od początku testy wskazywały błędy.

W powyższym teście *TestBed* chce nam dostarczyć cały komponent *AnimalsComponent* wraz z html'em, jednak nie ma wszystkich składowych jak chociażby *AnimalsListComponent*.

Musimy poprawić naszą konfigurację tak aby zawierała wszystkie wymagane elementy:

```typescript
describe('AnimalsComponent', () => {
  let component: AnimalsComponent;
  let fixture: ComponentFixture<AnimalsComponent>;
  let animalService: AnimalService;
  const fakeAnimal = { id: 1, name: 'fake' };

  beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [AnimalsComponent, AnimalsListComponent],
        providers: [
          AnimalService,
          { provide: HttpClient, useValue: {} }]
      })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalsComponent);
    component = fixture.componentInstance;
    animalService = TestBed.get(AnimalService);
  });
});
```

Ta konfiguracja pozwoli nam już otrzymać przygotowany przez *TestBed* komponent:

```typescript
it('should have a component', () => {
    expect(component).toBeTruthy();
  });
```

Jednak test sprawdzający prezentowane zwierzęta ponownie wykaże błędy:

```typescript
  it(`should have a list of animals`, () => {

    component.ngOnInit();
    component.animals$.subscribe(animals => {
      expect(animals).toBeTruthy();
      expect(animals).toEqual([fakeAnimal]);
    });
  });
```

*AnimalService* wywoła *httpClient.get*.

W sekcji providers dostarczamy pusty obiekt jako *httpClient*: `{ provide: HttpClient, useValue: {} }`

Jest dobrze, bo nie chcemy żeby nasz test komunikował się z zewnętrznym serwisem.

Ponownie wykorzystamy *spyOn* który zapewni, że *animalService* zwróci nam dane do testów:

```typescript
  it(`should have a list of animals`, () => {
    spyOn(animalService, 'getAnimals').and.returnValue(of([fakeAnimal]));
    component.ngOnInit();
    component.animals$.subscribe(animals => {
      expect(animals).toBeTruthy();
      expect(animals).toEqual([fakeAnimal]);
    });
  });
```

Dzięki testom z wykorzystaniem *TestBed* możemy przetestować nasz szablon html:

```typescript
it(`should have a button with text "fake"`, (() => {
    spyOn(animalService, 'getAnimals').and.returnValue(of([fakeAnimal]));
    component.ngOnInit();
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('.animal-button'));
    expect(buttons[0].nativeElement.textContent).toEqual('fake');
  }));
```

Poniższe dwie linie pozwalają nam pobrać buttony i sprawdzić, czy są odpowiednio podpisane.
```typescript
const buttons = fixture.debugElement.queryAll(By.css('.animal-button'));
expect(buttons[0].nativeElement.textContent).toEqual('fake');
```
## Testy z wykorzystaniem HttpClientTestingModule

Tymczasem możemy jeszcze wrócić do serwisu i sprawdzić jak przetestować go z wykorzystaniem *TestBed* i *HttpClientTestingModule*:

Ponownie konfigurujemy moduł do testów:

```typescript
describe('AnimalService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AnimalService
      ]
    });
  });

  it('should have a service', inject([AnimalService], (service: AnimalService) => {
    expect(service).toBeTruthy();
  }));

  it('should have a service', () => {
    const service = TestBed.get(AnimalService);
    expect(service).toBeTruthy();
  });

});
```

Powyżej widzimy dwa testy "should have a service". Sprawdzają one to samo, jednak zaprezentowane są dwie różne możliwości dostarczenia serwisu do testu:
1. poprzez `const service = TestBed.get(AnimalService);`
2. `inject([AnimalService], (service: AnimalService)` - funkcja inject przyjmuje dwa parametry:
    - tablicę serwisów do wstrzyknięcia - tu jest to *AnimalService*. Gdybyśmy chcieli wstrzyknąć więcej serwisów byłyby one kolejnymi elementami tablicy, np.: `[AnimalService, NextService]`
    - drugi parametr to funkcja, gdzie określamy referencję do serwisu i jego typ. Dla dwóch serwisów wyglądałoby to tak: `(service: AnimalService, nextService: NextService)`. Ważna jest ich kolejność tak aby była zgodna z kolejnością w tablicy, gdyż do pierwszej referencji będzie wstrzyknięty pierwszy element z tablicy.

Gdy moduł jest gotowy możemy przygotować test, który sprawdzi czy trafimy pod odpowiedni adres - i tylko tam.

```typescript
 describe('getAnimals', () => {

    it('should call get with correct url',
      inject([AnimalService, HttpTestingController], (service: AnimalService, controller: HttpTestingController) => {
        service.getAnimals().subscribe();

        const request = controller.expectOne('http://localhost:3000/animals');
        request.flush({id: 1, name: 'pies'});
        controller.verify();
      }));
  });
```

Przy konfiguracji testów z wykorzystaniem *TestBed* pojawiło się słowo *async*. Ma ono związek z asynchronicznością, o której więcej napisze Adrian. Stay tuned!

Więcej na temat testów Angulara i Jasmine znajdziesz:
* [https://angular.io/guide/testing#service-tests](https://angular.io/guide/testing#service-tests)
* [https://jasmine.github.io/2.0/introduction.html](https://jasmine.github.io/2.0/introduction.html)
