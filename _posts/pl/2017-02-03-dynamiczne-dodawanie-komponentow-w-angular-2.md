---
layout:    post
title:     "Dynamiczne dodawanie komponentów w Angular 2"
date:      2017-02-03 08:00:00 +0100
published: true
lang: pl
author:    glipecki
image:     /assets/img/posts/2017-02-03-dynamiczne-dodawanie-komponentow-w-angular-2/angular-2.jpg
tags:
    - angular
description: "Od pewnego czasu pracuję nad świeżym projektem opartym o Angular 2. Częścią projektu jest prezentowanie użytkownikowi dynamicznie generowanych elementów interfejsu. Nie jesteśmy w stanie zaprojektować z wyprzedzeniem ekranów, nie znając ani ich struktury, ani konkretnych kontrolek."
---
Od pewnego czasu pracuję nad świeżym projektem opartym o Angular 2. Częścią projektu jest prezentowanie użytkownikowi dynamicznie generowanych elementów interfejsu. Nie jesteśmy w stanie zaprojektować z wyprzedzeniem ekranów, nie znając ani ich struktury, ani konkretnych kontrolek.

Standardowo aplikację budujemy korzystając z komponentów używających komponentów, które używają komponentów, i tak dalej... Komponenty określają selektory, którymi możemy je osadzać oraz szablony HTML opisujące sposób prezentacji. Korzystając z tego zestawu, w kolejnych szablonach osadzamy kolejne komponenty wykorzystując ich selektory, zupełnie jakby były to natywne elementy HTMLa.

Co jednak, jeżeli nie jesteśmy w stanie ustalić konkretnego komponentu na etapie pisania aplikacji, a dopiero w trakcie jej wykonania? Musimy wymyślić coś kreatywnego :wink:

## Szybkie rozwiązanie

Pierwsze, co może nam przyjść do głowy, to wykorzystanie _ngIf_ i opisanie widoku w formie frontendowego _switch'a_.

Spójrzmy na przykład:

```typescript
@Component({
    selector: 'app',
    template: `
        <div>
            <book-details  *ngIf="model.type === 'book'"></book-details>
            <movie-details *ngIf="model.type === 'movie'"></movie-details>
            <comic-details *ngIf="model.type === 'comic'"></comic-details>
        </div>
    `
})
class AppComponent {}
```

Na pierwszy rzut oka wszystko wygląda nieźle - w zależności od typu prezentowanego obiektu potrafimy wyświetlić odpowiedni komponent prezentujący szczegóły. Nawet jesteśmy z siebie zadowoleni, w końcu mamy komponenty, a przecież mogliśmy zaszyć prezentację typów bezpośrednio w szablonie :wink:

Spójrzmy jednak krytycznie na nasz twór, a zauważymy potencjalne problemy.

Po pierwsze, dodanie nowego typu komponentu za każdym razem wiąże się z modyfikacją wszystkich szablonów komponentów zależnych. Dodając nową funkcjonalność do systemu, będziemy musieli zmienić wiele, teoretycznie niezależnych, fragmentów kodu. W praktyce, podążając tą drogą, szybko dotrzemy do _wzorca Copy'ego i Paste'a_. Stąd już blisko, żeby trafić na projektowy _wall of shame_ za klasyczny [_Shotgun surgery_](https://en.wikipedia.org/wiki/Shotgun_surgery).

Kolejny, być może nawet bardziej narzucający się problem, to wypłynięcie warstwy logiki do warstwy prezentacji. Mieszanie logiki z prezentacją to nigdy nie jest dobry pomysł. W szczególności w świecie frontendu, gdzie szukanie referencji czy refaktoryzacja pomiędzy HTMLem a JS/TSem to zawsze loteria.

## Lepsze podejście

A co gdybyśmy mogli przenieść logikę wyboru komponentu do klasy? I dodatkowo wskazać w szablonie, gdzie komponent ma zostac wyrenderowany? Nadal nie tracąc niczego z komponentowego podejścia, w tym wstrzykiwania zależności? Dokładnie tak możemy to zrobić :wink:

### Przygotowanie szablonu widoku

W pierwszym kroku przerobimy szablon komponentu:

```typescript
@Component({
    selector: 'app',
    template: `
        <div>
            <div #details></div>
        </div>
    `
})
class AppComponent {}
```

Dotychczasowe definicje konkretnych komponentów zastępujemy pojedynczym _div'em_ pełniącym funkcję placeholdera. Dodatowo oznaczamy go jako zmienną lokalną o nazwie _details_. Dzięki temu w kolejnym kroku będziemy mogli odnieść się do niego z kontrolera komponentu.

```typescript
@Component(...)
class AppComponent {
    @ViewChild('details', {read: ViewContainerRef})
    private placeholder: ViewContainerRef;
}
```

Stosując dekorator _@ViewChild_ wstrzykujemy element _DOMu_ do kontrolera komponentu. Pierwszy parametr może przyjąć klasę oczekiwanego elementu lub selektor. Dodatkowo przekazujemy, jakiej klasy element nas interesuje. W przypadku wstrzykiwania po selektorze standardowo jest to obiekt klasy _ElementRef_, nas jednak interesuje obiekt typu _ViewContainerRef_.

### Tworzenie komponentów w locie

Klasa _ViewContainerRef_ jest o tyle ciekawa, że dostarcza metodę pozwalającą tworzyć komponenty w locie na podstawie dostarczonej fabryki:

```typescript
createComponent(
	componentFactory: ComponentFactory<C>,
    index?: number,
    injector?: Injector,
    projectableNodes?: any[][]
) : ComponentRef<C>
```

Zmienna oznaczona dekoratorem _@ViewChild_ zostanie uzupełniona w trakcie tworzenia widoku - to znaczy, że możemy się nią posługiwać dopiero w fazie _ngAfterViewInit_. W efekcie możemy napisać kolejny kawałek naszego komponentu:

```typescript
@Component(...)
class AppComponent implements AfterViewInit {

    @ViewChild('details', {read: ViewContainerRef})
    private placeholder: ViewContainerRef;

    private componentRef: ComponentRef<any>;

    ngAfterViewInit():void {
        this.componentRef = this.placeholder.createComponent(this.componentFactory);
    }

}
```

### Pobieranie fabryki komponentów

Teraz pozostaje nam już tylko uzyskanie fabryki komponentów. Gotową do działania fabrykę najlepiej uzyskać z obiektu _ComponentFactoryResolver_. Sam komponent możemy bez problemu wstrzyknąć z kontekstu _DI_, a następnie wywołać na nim metodę _resolveComponentFactory_, podając interesującą nas klasę komponentu.

```typescript
@Component(...)
class AppComponent implements OnInit {

    private componentFactory: ComponentFactory<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit():void {
        this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.componentClass);
    }

}
```

W ten sposób możliwe jest stworzenie dowolnego komponentu osiągalnego z kontekstu _DI_ aplikacji.

### Sprzątanie po komponencie

Przy ręcznym tworzeniu komponentów warto też pamiętać o poprawnym zamknięciu utworzonych obiektów. W tym celu możemy wykorzystać fazę _ngOnDestroy_ cyklu życia komponentu.

```typescript
@Component(...)
class AppComponent implements OnDestroy {

    private componentRef: ComponentRef<any>;

    ngOnDestroy(): void {
        this.componentRef.destroy();
    }

}
```

### Definiowanie dynamicznych komponentów w kontekście _DI_

Kolejna rzecz, o której musimy pamiętać, to odpowiednie oznaczenie komponentów tworzonych dynamicznie na poziomie definicji kontekstu _DI_. Standardowo Angular generuje kod jedynie dla tych komponentów, dla których zostały zdefiniowane referencje w kodzie. Takie referencje są tworzone automatycznie dla komponentów użytych w ramach metody bootstrap, w routingu, czy też po użyciu w szablonach widoków. Wszystkie pozostałe komponenty, nawet jeżeli zostały zdefiniowane w sekcji _declarations_, zostaną pominięte - dzięki temu mechanizm _tree shaking_ będzie miał możliwość pominąć je przy budowaniu produkcyjnej wersji kodu. Komponenty dodawane dynamicznie musimy sami wskazać jawnie, na poziomie definicji modułu. W tym celu używamy pola _entryComponents_ dekoratora _@NgModule_.

```typescript
@NgModule({
    imports: [...],
    declarations: [BookDetails, MovieDetails, ComicDetails],
    exports: [...],
    entryComponents: [BookDetails, MovieDetails, ComicDetails]
})
export class ItemDetailsModule {
}
```

### Przekazywanie wartości do i z dynamicznego komponentu

Ostatnią rzeczą, na którą warto zwrócić uwagę, jest przekazywanie wartości do i z komponentu. W przypadku ręcznego dodawania komponentów do _DOM_ nie możemy skorzystać ze standardowego przekazywania wartości przez dekoratory _@Input()_ i _@Output()_. Komunikację z komponentem musimy oprogramować ręcznie. Jednak nie jest to trudne, bo obiekt _ComponentRef_ zawiera referencję na faktyczną instancję stworzonego komponentu. Wykorzystując ją możemy zarówno ustawić wartości, jak i nasłuchiwać na zmiany.

```typescript
@Component(...)
class AppComponent implements AfterViewInit {

    private componentRef: ComponentRef<any>;

    ngAfterViewInit():void {
        this.componentRef = this.placeholder.createComponent(this.componentFactory);
        this.componentRef.instance.inputVal = 'Hello world';
        this.componentRef.instance.outputVal.subscribe((...) => { ... });
    }

}
```

### Kompletny przykład

Na koniec kompletny kod źródłowy omawianego przykładu.

_Komponent wrappera kontrolek_
```typescript
import {
    Component, Input, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, Type, AfterViewInit,
    OnDestroy, ComponentRef
} from '@angular/core';

@Component({
    selector: 'control-wrapper',
    template: `
        <div *ngIf="componentClass">
            <div #componentHolder></div>
        </div>
    `
})
export class ControlWrapper implements OnInit, AfterViewInit, OnDestroy {

    private model: any;
    @Input()
    private controlFactory: IControlFactory;
    @ViewChild('componentHolder', {read: ViewContainerRef})
    private componentHolder: ViewContainerRef;
    private componentClass: Type<IControl>;
    private componentRef: ComponentRef<IControl>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    }

    ngOnInit(): void {
        this.componentClass = this.controlFactory.getControlClass(this.model.type);
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
        if (this.componentClass && this.componentHolder) {
            let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.componentClass);
            this.componentRef = this.componentHolder.createComponent(componentFactory);
            this.updateControlModel();
        }
    }

    private updateControlModel() {
        this.componentRef.instance.setModel(this.model);
    }

}
```

_Przykładowa fabryka klas komponentów na podstawie modelu_
```typescript
export class ItemDetailsControlFactory implements IControlFactory {

    getControlClass(type: string): Type<IControlFactory> {
        if (type === 'movie') {
            return BookDetails;
        } else if (type === 'book') {
            return MovieDetails;
        } else if (type === 'comic') {
            return ComicDetails;
        } else {
            return null;
        }
    }

}
```

_Definicja modułu dynamicznych komponentów_
```javascript
import {NgModule} from '@angular/core';

@NgModule({
    imports: [...],
    declarations: [BookDetails, MovieDetails, ComicDetails],
    exports: [BookDetails, MovieDetails, ComicDetails],
    entryComponents: [BookDetails, MovieDetails, ComicDetails]
})
export class ItemDetailsModule {
}
```

## tl;dr

Wykorzystując najnowszą wersję frameworka Angular 2 możemy bez problemu tworzyć elementy interfejsu w locie, w trakcie działania aplikacji. Serwis _ComponentFactoryResolver_ i adnotacja _@ViewChild_ pozwalają programowo tworzyć i dodawać komponenty do drzewa DOM, bez potrzeby zmieniania szablonów HTML komponentów.

## Źródła

- [Komunikacja pomiędzy komponentami, w tym oznaczanie jako zmienne lokalne i odwołania z kontrolerów.](https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#parent-to-child-local-var)
- [Dokumentacja dekoratora _@ViewChild_](https://angular.io/docs/ts/latest/api/core/index/ViewChild-decorator.html)
- [Dokumentacja klasy _ViewContainerRef_](https://angular.io/docs/ts/latest/api/core/index/ViewContainerRef-class.html)
- [Cykl życia komponentu](https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html)
- [FAQ na temat konieczności używania _entryComponents_](https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-why-entry-components)
