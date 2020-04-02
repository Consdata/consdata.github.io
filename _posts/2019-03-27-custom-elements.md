---
layout:    post
title:     "Krótkie wprowadzenie do Custom Elements"
date:      2019-03-27 11:00:00 +0100
published: true
author:    mpogorzelski
image:     webcomponents.png
tags:
    - frontend
    - custom elements
    - web components
---
## Custom element, co to takiego?
Custom Elements to jedna z zestawu czterech specyfikacji występujących pod wspólną nazwą Web Components - wspólnie pozwalają one na tworzenie własnych typów elementów DOM.
Na Web Components składają sie następujące specyfikacje:
- **Templates** - wprowadza element `<template>`, który pozwala na wyrenderowanie jego zawartości dopiero na żądanie stworzenia kopii. Dzięki temu problem z przedwczesnym ładowaniem danych nie występuje, 
- **HTML imports** - tworzone komponenty mogą zawierać szablony (**Templates**) i kod (**Custom elements**), specyfikacja ta pozwala wydzielić obie te części do oddzielnego pliku HTML i importować go za pomocą `<link rel="import" href="plik-komponentu.html" />`,
- **Shadow DOM** - specyfikacja ta pozwala na enkapsulację DOM'u oraz styli. Każdy element może mieć swój shadow root, który jest wyświetlany jako jego zawartość, przy czym zawartość ta jest odseparowana logicznie od pozostałych elementów DOM,
- **Custom Elements** - specyfikuje sposób tworzenia własnych elementów DOM oraz dostarcza obiekty do kontrolowania cyklu życia elementu.
W tym artykule skupimy się jedynie na **Custom Elements** (oraz w mniejszym stopniu na **Shadow DOM**), który jest minimalnym zestawem narzędzi pozwalającym na dodanie własnego elementu HTML niezależnego od wykorzystywanych (lub nie) frameworków czy bibliotek.


## Wsparcie przez główne przeglądarki
<div class="img-with-legend">
<img alt="Wsparcie dla Custom elements przez różne przeglądarki" src="/assets/img/posts/2019-03-28-custom-elements/browser_support.png" />
<span class="img-legend">Wsparcie custom components przez główne przeglądarki<br />źródło: <a href="https://www.webcomponents.org">www.webcomponents.org</a> - dostęp: 2019-03-16</span>
</div>

Custom Elements jest wspierany przez większość najpopularniejszych przeglądarek. Na pozostałych implementację zapewniają polyfille:
- [https://github.com/webcomponents/custom-elements](https://github.com/webcomponents/custom-elements) lub
- [https://github.com/webcomponents/webcomponentsjs](https://github.com/webcomponents/webcomponentsjs)

## CustomElementRegistry
Obiekt typu `CustomElementRegistry` zapewnia metody pozwalające na rejestrowanie oraz pobierania już zarejestrowanych elementów. Instancję klasy `CustomElementRegistry` otrzymamy odwołując się do `window.customElements`. W klasie tej znajdziemy następujące metody:  

### `CustomElementRegistry.define(localName: string, constructor: Function, options?: {extends: string}): void`
Pozwala na zdefiniowanie elementu. Pierwszym parametrem jest nazwa tagu, drugim konstruktor klasy elementu. Dodatkowo, można podać trzeci parametr, który zawiera opcje komponentu. W aktualnej wersji specyfikacji dostępna jest jedynie opcja `extends`, której wartością jest nazwa rozszerzanego elementu (wykorzystujemy ją wyłacznie w przypadku rozszerzania już istniejącego elementu).
Przykładowe zastosowanie:
```javascript
customElements.define('my-element', class extends HTMLElement {
    connectedCallback() {
        this.innerHTML = '<strong>hello world</strong>';
    }
});
```
Tak zdefiniowanego elementu można użyć w następujący sposób:
```html
<my-element></my-element>
```

#### Ograniczenia nazwy tagu
Nazwa naszego elementu musi spełniać następujące wyrażenie regularne: 
```regexp
^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$
```
Innymi słowy tag musi zaczynać się od litery, musi zawierać przynajmniej jeden myślnik, a poza tym może zawierać jedynie litery alfabetu łaińskiego oraz następujace znaki: `_`, `.` i `-`. Taka reguła sugeruje aby stosować konwencję nazewniczą `kebab-case`. 

Dodatkowo, nazwa nie może kolidować z żadną nazw z następującej listy:
- `annotation-xml`,
- `color-profile`,
- `font-face`,
- `font-face-src`,
- `font-face-uri`,
- `font-face-format`,
- `font-face-name`,
- `missing-glyph`.

### `CustomElementRegistry.get(name: string): Function|undefined`
Metoda `get` zwraca constructor utworzonego custom elementu lub `undefined`, jeżeli taki nie został znaleziony.
Przykład:
```typescript
const myElement = customElements.get('my-element');
```

### `CustomElementRegistry.upgrade(root: Node): void`
Metoda `upgrade` pozwala zainicjować element znajdujący się w DOM po tym jak custom element został zarejestrowany.

Przykład:
```javascript
const el = document.createElement("my-element");

class MyElement extends HTMLElement {}
customElements.define("my-element", MyElement);

console.assert(!(el instanceof MyElement)); // not yet upgraded

customElements.upgrade(el);
console.assert(el instanceof MyElement);    // upgraded!
```

### `CustomElementRegistry.whenDefined(): Promise<undefined>`
Zwraca [Promise](https://developer.mozilla.org/pl/docs/Web/JavaScript/Referencje/Obiekty/Promise), który rozwiązany jest w momencie, gdy element zostanie zarejestrowany.

Przykład:
```javascript
customElements.whenDefined('my-element').then(() => {
    // ...
});
```

## Zarządzanie cyklem życia custom elementu
W każdym custom elemencie możemy wykorzystać jeden z predefiniowanych callbacków:
- **connectedCallback** - wywoływany za każdym razem, gdy custom element jest dołączany do dokumentu,
- **disconnectedCallback** - wywoływany zawsze po odłączeniu custom elementu z DOM,
- **adoptedCallback** - wywoływany po przeniesieniu custom elementu do innego dokumentu,
- **attributeChangedCallback** - wywoływany, gdy atrybuty elementu zostaną dodane, usunięte lub zmodyfikowane - jest wywoływany jedynie dla atrybutów, których nazwy zostaną zwrócone ze statycznego pola `observedAttributes`.


## Custom elementy w akcji

### Przykładowy prosty custom element
Załóżmy, że w naszej aplikacji chcemy stworzyć komponent obrazka z podpisem. Do tej pory używaliśmy HTMLa o takiej strukturze:
```html
<div class="image-with-caption">
    <img class="image" src="obrazek.jpg" />
    <div class="image-caption">Podpis obrazka</div>
</div>
<style>
img.image {
   max-width: 100%;
   max-height: 500px;
}
.image-caption {
   font-size: 10px;
}
</style>
```
Chcielibyśmy wydzielić taki fragment kodu, do elementu, który będziemy definiować w następujący sposób:
```html
<image-with-caption src="obrazek.jpg">Podpis obrazka</image-with-caption>
```

Zacznijmy od stworzenia i zarejestrowania komponentu:
```typescript
class ImageWithCaption extends HTMLElement {
    constructor() {
        super();
    }
}
window.customElements.define('image-with-caption', ImageWithCaption);
```

Na tym etapie po dodaniu `<image-with-caption />` zostanie na nim zainicjowany element ImageWithCaption. Zajmijmy się dodaniem obrazka.
Dodajmy do klasy pole `img` typu `HTMLImageElement`:
```typescript
class ImageWithCaption extends HTMLElement {
    private readonly img: HTMLImageElement;
    // ...
}

```
Następnie do konstruktora dopiszmy:
```typescript
constructor() {
    // ...
    this.img = document.createElement('img');
    
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(this.img);
}
```
W ten sposób dodaliśmy do elementu shadow root (dzięki temu style elementu będą odseparowane od dokumentu).
A potem dodajmy metodę `connectedCallback`: 
```typescript
connectedCallback(): void {
    this.img.src = this.getAttribute('src');
}
```
W ten sposób przypiszemy źródło obrazka z atrybutu `src` elementu `<image-with-caption src="...">`. Na tym etapie po osadzeniu naszego elementu pojawi się obrazek, który wskażemy w atrybucie `src`. Niestety jego wartość nie będzie mogła się zmieniać po inicjalizacji elementu. Aby nasłuchiwać na zmiany po inicjalizacji należy zadeklarować, że będziemy nasłuchiwać na zmiany atrybutu `src`:
```typescript
static get observedAttributes(): string[] {
    return ['src'];
}
```
Następnie należy zdefiniować metodę `attributeChangedCallback`, która posłuży do obsługi zmian atrybutu src:
```typescript
attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'src') {
        this.img.src = newValue;
    }
}
```
Dzięki temu możemy zmieniać wartość atrybutu `src` po zainicjowaniu komponentu. Zajmijmy się teraz dodaniem etykiety do obrazka. Do konstruktora dopiszmy następujący kod:
```typescript
const caption: HTMLDivElement = document.createElement('div');
caption.innerHTML = '<slot></slot>';
this.shadowRoot.appendChild(caption);
```
Dodaliśmy do naszego shadow DOM element `<div>`, którego zawartość zdefiniowaliśmy jako `<slot></slot>`. Podczas działania aplikacji `<slot></slot>` zostanie zastąpione zawartością elementu `<image-with-caption></image-with-caption>`.
Zostało nam dodanie styli do naszego komponentu. Dopiszmy do konstruktora:
```typescript
const style: HTMLStyleElement = document.createElement('style');
style.innerHTML = `
    img {
        max-width: 100%;
        max-height: 500px;
    }
    div {
        font-size: 10px;
    }
`;
this.shadowRoot.appendChild(style);
``` 
Dzięki użyciu Shadow DOM style, które właśnie dodaliśmy nie wypływają poza element.

Voilà! 

### Mały bonus - Rozszerzanie istniejących elementów

Poza możliwością zdefiniowania nowego elementu specyfikacja Custom Elements pozwala na rozszerzenie już istniejących elementów. Załóżmy, że chcemy dokonać prostej modyfikacji elementu `<a>` polegającej na tym, że przejście do łącza nastąpi dopiero po potwierdzeniu przez użytkownika. Poniżej kod przykładowego elementu:
```typescript
class LinkWithConfirmation extends HTMLAnchorElement {
    constructor() {
        super();
    }
    
    connectedCallback(): void {
        this.addEventListener('click', (event: MouseEvent) => {
            if (!confirm('Are you sure?')) {
                event.preventDefault();
            }
        });
    }
}
customElements.define('link-with-confirmation', LinkWithConfirmation, { extends: 'a' });
```
Zwróćmy uwagę, że w ostatnim parametrze metody `define` przekazaliśmy obiekt `{ extends: 'a' }`, który informuje, że będziemy rozszerzać element `<a>`.
Aby skorzystać z napisanego elementu musimy użyć elementu `<a>` z atrybutem `is` o wartości `link-with-confirmation`, a nie `<link-with-confirmation>`:
```html
<a is="link-with-confirmation" href="https://consdata.com">consdata.com</a>
```

## Przydatne linki
- [www.webcomponents.org](https://www.webcomponents.org/)
- [Wsparcie dla custom elements](https://caniuse.com/#feat=custom-elementsv1)
- [Dobre praktyki z przykładami](https://developers.google.com/web/fundamentals/web-components/best-practices)
- [O Custom elements na MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
