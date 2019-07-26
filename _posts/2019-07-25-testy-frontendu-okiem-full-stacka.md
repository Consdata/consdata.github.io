---
layout:    post
title:     "Testy jednostkowe frontendu okiem programisty full stack"
published: true
date:      2019-07-26 10:00:00 +0100
author:    mmendlik
tags:
    - unit test
    - jasmine
    - angular
---

Niełatwo znaleźć wymówkę, żeby nie pisać testów jednostkowych. Obecność frameworków ułatwiających tę czynność w projektach, z którymi stykamy się na co dzień, nie powinna na żadnym chociaż trochę doświadczonym programiście robić wrażenia i nie trzeba go przekonywać, że **jedne z wielu zalet pisania testów jednostkowych**, to:
* zmuszenie twórcy do zastanowienia się nad zadaniem sprawdzanego kodu (co może potencjalnie poprawić architekturę aplikacji),
* ułatwienie wczesnego wyłapywania błędów,
* ekspozycja przypadków brzegowych,
* ułatwienie zrozumienia działania kodu osobom, które go nie tworzyły.

W wielu nowoczesnych aplikacjach internetowych, w tym np. we wnioskach Eximee, **duża część logiki znajduje się po stronie klienckiej**, hipokryzją byłoby pominięcie testów w tak istotnym elemencie aplikacji, ponieważ najbardziej rzucające się w oczy błędy są właśnie tam. Niemniej nawet przy ogromnej liczbie narzędzi wspomagających proces pisania testów jednostkowych, programiści mogą mieć problem z **wyznaczeniem właśnie tych jednostek**.
## Co testować
Niezależnie od tego jaki framework został użyty w danym projekcie, zawsze możemy z niego wydzielić komponenty. Przeważnie jest to JavaScriptowa klasa z jakimś odniesieniem do szablonu HTML. Akurat w tym artykule jako przykład użyty został Angular. W praktyce możemy podzielić te komponenty na dwa typy: 
* **komponent prezentacyjny**, który **nie posiada logiki biznesowej** i jego jedynymi zadaniami są wyświetlenie szablonu na podstawie wejścia i ew. przekazanie jakiegoś zdarzenia (np. kliknięcia, wciśnięcia klawisza itp.) do komponentu nadrzędnego,
* komponent, który **używa i zarządza innymi komponentami** nie zajmując się jednocześnie zbytnio prezentacją.

Brak tego podziału może znacząco utrudnić pisanie testów jednostkowych, co zresztą okaże się bardzo szybko przy próbie napisania ich do słabo zaprojektowanego komponentu.
Uważam, że testy jednostkowe komponentów prezentacyjnych są zasadne tylko w przypadku, gdy wejście w jakiś sposób zmienia jego zachowanie lub obsługa uaktualnienia widoku jest skomplikowana (np. animacja przeliczając atrybuty elementu w locie). **Najważniejsze jest zwiększenie pokrycia logiki biznesowej.**

## Testowanie logiki biznesowej
W pierwszej kolejności powinniśmy się zastanowić nad tym, czy z komponentu możemy wydzielić logikę, np. do osobnego serwisu, czyli w praktyce klasy odpowiedzialnej za jakąś funkcjonalność z możliwością używania jej w wielu miejsciach (np. serwis zarządzający widocznością popupów w aplikacji). Serwisy testuje się o wiele prościej niż komponenty, ze względu na brak szablonu i związanego z frameworkiem narzutu (serwis może być zwykłą JavaScriptową klasą).

## Praktyka na przykładzie Jasmine i Angulara
Niech przykładem będzie komponent wyboru daty z formatterem - zakładając, że cała logika znajduje się w komponencie, trzeba będzie zadbać o stworzenie jego instancji ze wszystkimi zależnościami pisząc testy dla formattera, następnie zasymulować zdarzenie wpisania danych w pole tekstowe. Gdyby wydzielono wcześniej osobny serwis do formatowania, to wystarczyłoby przetestować tylko jego logikę. Testy całego komponentu możemy przeprowadzić zaślepiając odpowiednie zależności, co znacznie ułatwi pracę.
Tak wyglądałby komponent, jeśli zaniedbalibyśmy wyżej zaproponowany podział:
komponent: 
```typescript
@Component({
    selector: 'date-picker',
    template: `
        <input [value]="formattedValue" (change)="onValueChange($event.target.value)">
    `
})
export class DatePicker implements OnChanges  {
    @Input value: string;
    formattedValue: string;

    constructor(private datePickerRestService: DatePickerRestService) {
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        this.formattedValue = this.format(changes.value.currentValue);
    }
 
    onValueChange(event: string): void {
        ...
    }

    private format(string: value): string {
        ...
    }
    
    private sendValue(value: string): void {
       this.datePickerRestService.send(value);
    }
}
```

test:
```typescript
let fixture: ComponentFixture<DatePicker>;
describe('DatePicker', () => {
    class DatePickerRestServiceMock implements Partial<DatePickerRestService> {
        send(): void {
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DatePicker],
            providers: [
              {
                  provide: DatePickerRestService,
                  useClass: DatePickerRestServiceMock
              }
            ]
        });
        fixture = TestBed.createComponent(DatePicker);
    });

    it('should return formatted date from timestamp', () => {
        // given
        const hostElement = fixture.nativeElement;
        const input: HTMLInputElement = hostElement.querySelector('input');

        // when
        fixture.componentInstance.value = '2018-07-01';
        fixture.detectChanges();

        // then
        expect(input.value).toBe('1 lipca 2018');
    });
});
```
Jak widać testy są słabo czytelne, ponieważ widoczne są detale implementacyjne związane z działaniem frameworku (TestBed, ComponentFixture). Wraz z dodawaniem funkcjonalności i zależności będzie coraz trudniej będzie utrzymać klarowność.

Zaprojektowany w ten sposób komponent pozwoli na przetestowanie głównej funkcjonalności nie przejmując się zależnościami komponentu i jego szablonem. 
```typescript
@Component({
    selector: 'date-picker',
    template: `
        <date-picker-input [value]="formattedValue" (change)="onValueChange($event)"></date-picker-input>
    `
})
export class DatePicker implements OnChanges  {
    @Input value: string;
    formattedValue: string;

    constructor(private service: FormatterService ) {
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        this.formattedValue = this.service.format(changes.value.currentValue);
    }

    onValueChange(event: string): void {
        // ...
    }
}
```

test serwisu formattera mógłby wyglądać następująco:
```typescript
describe('FormatterService', () => {

   beforeEach(() => {
      service = new FormatterService();
   });

   it('should return formatted date from timestamp', () => {
      // given
      const timestamp: string = Date.now('2018-07-01').toString(); 

      // when
      const result = service.format(timestamp);

      // then
      expect(result).toBe('1 lipca 2018');
   });

});
```
Nie trzeba się martwić o dodatkowe zależności, można się skupić tylko na testowaniu funkcjonalności.

Jak widać przy odpowiednim podejściu pisanie testów jednostkowych funkcjonalności na frontendzie nie musi się tak bardzo różnić od tworzenia ich dla części backendowej gdy wie się co i w jaki sposób testować, wtedy samo pisanie testów staje się o wiele prostsze.
