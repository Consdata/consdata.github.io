---
layout:    post
title:     Testowanie frontendu - Cz. 3. Testowanie komponentów angularowych z inputami i outputami
published: true
date:      2019-12-05 08:00:00 +0100
author:    pgrobelny
tags:
    - Jasmine
    - Angular
    - unit test
    - komponent
---
## Wprowadzenie
Czas na kolejną dawkę informacji dotyczących testowania przy użyciu Jasmine. Po przeczytaniu wcześniejszych wpisów ([Cz. 1]({% post_url 2019-11-06-testowanie-frontendu-wprowadzenie-do-jasmine %}) i [Cz. 2]({% post_url 2019-11-20-testowanie-komponentow-i-serwisow %})) pora skupić się na samych komponentach angularowych i testowania ich wejść i wyjść. Przykłady oprzemy o aplikację, która będzie składała się kilku drobnych elementów wzajemnie się ze sobą komunikujących.

Schemat naszej przykładowej aplikacji wygląda następująco:

![diagram komponentów w aplikacji](/assets/img/posts/2019-12-05-testowanie-komponentow-z-inputami-i-outputami/diagram.jpg)

Jest to prosty program mający na celu dodawanie i zapisywanie wyników. Został rozpisany na komponenty tak, aby można było spokojnie przetestować wejścia i wyjścia w różnych wariantach.

Aplikacja zawiera dwa komponenty przekazujące wpisaną liczbę (`CalculatorInputFieldComponent`), liczby wysyłane są do komponentu, który zliczy nam wynik (`CalculatorResultComponent`) i zaprezentuje go w czytelnej formie (`CalucatorResultPresentationComponent`). Z poziomu komponentu prezentującego wyniki możemy je również zapisać (`CalculatorSavedListComponent`). Strzałki na diagramie oznaczają wejścia i wyjścia komponentów. 

## Pisanie testów dotyczących @Input

Na początek weźmy na warsztat komponent pozwalający wyświetlić listę wyników, które chcielibyśmy zapisać.

```typescript
@Component({
  selector: 'calculator-saved-list',
  template: `
      <div class="result">{{getText()}}{{savedValues}}</div>
  `,
})
export class CalculatorSavedListComponent {
  @Input() savedValues: Array<number>;

  getText(): string {
    if (this.savedValues.length === 0) {
      return 'Brak zapisanych wartości';
    } else {
      return 'Zapisane wartości to: ';
    }
  }
}
```

Ciężko sobie wyobrazić prostszy komponent. Mamy tutaj jeden input, który przekazuje listę wyników, jaką chcemy wyświetlić.

Pora na napisanie testu sprawdzającego, czy komponent poprawnie interpretuje przekazane mu wyniki

```typescript
describe('CalculatorSavedListComponent', () => {
  let component: CalculatorSavedListComponent;
  let fixture: ComponentFixture<CalculatorSavedListComponent>;
  let resultText: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalculatorSavedListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorSavedListComponent);
    component = fixture.componentInstance;
    resultText = fixture.debugElement.query(By.css('.result'));
  }));

  it('should show correct text when list is empty', () => {
    component.savedValues = [];
    fixture.detectChanges();
    expect(resultText.childNodes[0].nativeNode.wholeText).toEqual('Brak zapisanych wartości');
  });

  it('should show elements of list with correct text', () => {
    component.savedValues = [12, 3];
    fixture.detectChanges();
    expect(resultText.childNodes[0].nativeNode.wholeText).toEqual('Zapisane wartości to: 12,3');
  });
});
```

Zaczęliśmy tutaj, podobnie jak w poprzednim artykule, od stworzenia `TestBed` i dodatkowo wyciągnęliśmy za pomocą zapytania element html prezentujący tekst umieszczony z poziomu komponentu. Możemy do niego odwołać się na wiele sposobów, na przykład za pomocą klasy czy id.

Mamy tutaj dwa testy, których struktura jest taka sama. Przekazujemy wartości w inpucie i sprawdzamy, czy element umieszczony w html został poprawnie zmieniony. Jeżeli inputów w komponencie mamy więcej, możemy je przetestować w dokładnie ten sam sposób.

## Pisanie testów dotyczących @Output

Następnie napiszmy test do komponentu pozwalającego wpisać liczbę, którą przekazuje do komponentu nadrzędnego.

```typescript
@Component({
  selector: 'calculator-input-field',
  template: `
      <input (keyup)="onKey($event)">
  `,
})
export class CalculatorInputFieldComponent {
  @Output() fieldValue = new EventEmitter<number>();

  onKey(event) {
    this.fieldValue.emit(event.target.value);
  }
}
```

Komponent równie prosty jak poprzedni z takim wyjątkiem, że mamy tutaj do czynienia z outputem.

```typescript
describe('CalculatorInputFieldComponent', () => {
  let component: CalculatorInputFieldComponent;
  let fixture: ComponentFixture<CalculatorInputFieldComponent>;
  let input: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalculatorInputFieldComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorInputFieldComponent);
    component = fixture.componentInstance;
    input = fixture.debugElement.query(By.css('input'));
  }));

  it('should emit correct value on input change', () => {
    component.fieldValue.subscribe((value) => expect(value).toBe('7'));
    input.nativeElement.value = 7;
    document.querySelector('input').dispatchEvent(new KeyboardEvent('keyup'));
  });
});
```

Czyli standardowo, zaczynamy od przygotowania naszego modułu testowego i uchwycenia elementu, który chcemy przetestować. Warto tutaj zaznaczyć, że istnieją inne sposoby na zainicjowanie komponentu niż `TestBed`, wszystko zależy od  tego co, i w jaki sposób, będziemy testować. Na przykład kiedy nie potrzebujemy testować elementów z DOM możemy zostać przy zwykłym inicjalizowaniu komponentów. Więcej szczegółów można znaleźć w [dokumentacji od Angulara](https://angular.io/guide/testing#component-test-basics).

Test zaczynamy od nasłuchiwania na naszą zmienną `fieldValue` po której spodziewamy się, że przekaże nam wartość wpisaną w pole. Następnie uzupełniamy wartość i wywołujemy event, pozwalający na wywołanie metody nasłuchującej na zmiany w naszym polu. Test zakończy się, kiedy zostanie wywołana metoda `expect` sprawdzająca, czy wpisana przez nas wartość zgadza się z oczekiwaniami. Test może się również zakończyć niepowodzeniem, kiedy po upływie danego czasu (domyślna konfiguracja wskazuje na 5s) żaden `expect` nie zostanie wywołany.

Na koniec możemy zebrać naszą wiedzę, i przetestować komponent zawierający wejścia, jak i wyjścia. Poniższy kod przedstawia komponent, który dodaje wskazane liczby oraz opcjonalnie potrafi wysłać dane o wyniku do komponentu 'wyżej'.

```typescript
@Component({
  selector: 'calculator-result',
  template: `
      <calculator-result-presentation [calculationResult]="getCalculationResult()"></calculator-result-presentation>
      <button (click)="saveValue()">Zapisz wartość</button>
  `,
})
export class CalculatorResultComponent {
  @Input() values: Array<number>;
  @Input() text: string;
  @Output() savedValue = new EventEmitter<number>();

  getResult(): number {
    return Number(this.values[0]) + Number(this.values[1]);
  }

  getCalculationResult(): string {
    return `${this.text} ${this.getResult()}`;
  }

  saveValue() {
    this.savedValue.emit(this.getResult());
  }
}
```

Możemy zauważyć, że nasz komponent potrzebuje innego komponentu (`calculator-result-presentation`), któremu przekazuje wynik, jednakże w naszych testach nie będzie miało to dużego znaczenia. Należy tylko pamiętać o jego deklaracji przy tworzeniu `TestBed`.

```typescript
describe('CalculatorResultComponent', () => {
  let component: CalculatorResultComponent;
  let fixture: ComponentFixture<CalculatorResultComponent>;
  let button: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculatorResultComponent,
        CalculatorResultPresentationComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorResultComponent);
    component = fixture.componentInstance;
    button = fixture.debugElement.query(By.css('button'));
  }));

  it('should emit correct value on button', () => {
    component.values = [1, 2];
    component.savedValue.subscribe((value) => expect(value).toBe(3));
    button.nativeElement.click();
  });
});
```

Powyższy test przekazuje wartości do inputów, oraz naciska przycisk. Jeżeli wszystko działa poprawnie, po jego naciśnięciu powinniśmy zostać powiadomieni o wyniku działaniu, który został wyemitowany na output.

## Podsumowanie

Powyższe przykłady przedstawiają najprostsze scenariusze testowe. Jest to jednak dobry punkt wejścia do napisania własnych testów, przy których powyższe przykłady mogą być użyteczne.
