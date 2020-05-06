---
layout:    post
title:     Testowanie frontendu - Cz. 4 Testy jednostkowe kodu działającego asynchronicznie
published: true
date:      2019-12-19 08:00:00 +0100
author:    amarszalek
image:     /assets/img/posts/2019-12-20-testowanie-frontendu-asynchronicznego/testowanie-frontendu-asynch.png
tags:
    - Jasmine
    - Angular
    - async unit testing
    - unit test
    - komponent
---
Kończąc serię dotyczącą testowania komponentów Angularowych przy pomocy Jasmine, chciałbym poruszyć temat testów kodu wykonywanego asynchronicznie. 

Testy jednostkowe asynchronicznych aplikacji frontendowych często wydają się być zagadką dla developerów. Na szczęście twórcy narzędzi pomyśleli również o tym i dostarczyli nam narzędzia, które zdecydowanie ułatwiają pracę z testowaniem takiego kodu.

W tym wpisie jednak nie poruszę kwestii testowania opartego na mockowaniu/stubowaniu kodu. Jeśli jesteś zainteresowany tym tematem, zachęcam do zajrzenia do artykułu Krzysztofa Czechowskiego o [testowaniu serwisów]({% post_url 2019-11-20-testowanie-komponentow-i-serwisow %}).

## Kod poddany testom

W celu sprawdzenia możliwości testowania asynchronicznych wywołań weźmy na warsztat przykładowy komponent:
```typescript
@Component({
  selector: 'app-company',
  template: '<div *ngIf="messageVisible" id="welcomeMessage">Hello!</div>',
})
export class CompanyComponent {
  messageVisible: boolean = false;

  getCompany(): Promise<string> {
    return Promise.resolve("company");
  }

  showMessage() {
    setTimeout(() => {
      this.messageVisible = true;
    }, 2000)
  }
}
```
Posiada on dwie metody: jedną, która zwraca Promise z nazwą firmy oraz drugą, która wykonuje zmianę widoczności flagi po dwóch sekundach. Na podstawie tej flagi wyświetlana jest wiadomość w templacie HTML.

Klasa testowa, do której będą dodawane test-case'y. W tym przypadku jest ona w 100% standardowa:
```typescript
describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
      fixture = TestBed.createComponent(AppComponent);
      debugElement = fixture.debugElement;
  }));
 });
```

## Testowanie metod zwracających Promisy
   Jeśli chcemy przetestować metodę, która zwraca wartość opakowaną w Promise, oraz której wynik nie jest zależny od dostępności zewnętrznych usług, możemy w łatwy sposób sprawdzić zwracane przez nie wartości przy pomocy mechanizmu async/await:
```typescript
it('resolves company using async/await', async function () {
    const company = await fixture.componentInstance.getCompany();
    expect(company).toEqual("company");
});
```
Jeśli z jakiegoś powodu nie możesz wykorzystać async/await, to wówczas zastosowanie znajdzie tradycyjne rozwiązywanie Promisów:
```typescript
it('resolves company promise manually', function () {
    fixture.componentInstance.getCompany().then(company => {
        expect(company).toEqual("company");
    });
});
```

## Oczekiwanie na wykonanie metody przy użyciu fakeAsync
Metoda `showMessage()` z naszego komponentu ma narzucony czas dwóch sekund oczekiwania przed jej wykonaniem.
W teście możemy powtórzyć ten zabieg i po wywołaniu metody uruchomić asercje wewnątrz `setTimeout()`. Jednak wprowadzanie realnego czasu oczekiwania nie jest efektywnym rozwiązaniem i bardzo spowolni nasze testy. Dzięki Angularowemu `fakeAsync` możemy testować kod asynchroniczny, w synchroniczny sposób.

Zobaczmy:
```typescript
it("tests the message visibility", fakeAsync(() => {
  fixture.componentInstance.showMessage();
  tick(2000);
  fixture.detectChanges();
  fixture.whenStable().then(() => {
    const helloMessage = fixture.debugElement.query(By.css("#welcomeMessage"));
    expect(helloMessage).toBeTruthy();
    expect(helloMessage.nativeElement.innerHTML).toBe('Hello!');
  })
}));
````
   Spoglądając od góry:
   - najpierw opakowujemy nasz test jednostkowy w blok fakeAsync(), który pozwala nam oszukać asynchroniczny przepływ,
   - wywołujemy asynchroniczną metodę,
   - symulujemy upływ czasu - w rzeczywistości nie trwa to dwóch sekund, jednak aplikacja "myśli", że tyle upłynęło,
   - wykrywamy zmiany, a kiedy detekcja zmian się zakończy, robimy tradycyjne asercje.
   
   A co jeśli nie znamy czasu, który powinien upłynąć zanim wykonamy asercje? W miejscu `tick(2000)`, możemy wykorzystać `flush()` i efekt będzie dokładnie taki sam. Czym się charakteryzuje `flush()`? Podobnie jak tick, symuluje on upływ czasu, jednak robi do momentu opustoszenia kolejki macrotasków (czyli m.in. setTimeout, setInterval).

## Testowanie kodu asynchronicznego - podsumowanie

Dzięki uzbrojeniu JavaScriptu w wygodne mechanizmy oraz ułatwieniom ze strony Angulara, testowanie jednostkowe kodu działającego asynchronicznie staje się nawet nie tyle proste, co całkiem przyjemne.
