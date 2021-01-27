---
layout:    post
title:     "View Encapsulation w Angularze - czyli o kapsułkowaniu słów kilka"
published: true
lang: pl
date:      2019-08-22 08:00:00 +0100
author:    mhoja
image:     /assets/img/posts/2019-08-22-view-encapsulation-w-angularze/View-Encapsulation.jpg
tags:
    - angular
    - view encapsulation
    - kapsułkowanie
---

Tworząc komponenty w Angularze mamy możliwość zarządzania kapsułkowaniem (enkapsulacją) stylów - czyli tym jak style z jednego komponentu wpływają na inne komponenty.  
Zanim omówimy kapsułkowanie, wyjaśnijmy w kilku słowach czym jest **Shadow DOM**.

## Shadow DOM

Shadow DOM wprowadza kapsułkowanie do DOM-u. Pozwala to odseparować styl i kod potrzebny do wyświetlenia elementu od dokumentu, w którym się znajduje. Przykładem może być np. element HTML `<video>`

```html
<video width="320" height="240">
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.ogg" type="video/ogg">
</video>
```

Po włączeniu opcji wyświetlania Shadow Root w przeglądarce (na przykładzie Google Chrome):  
![Devtools Configuration](/assets/img/posts/2019-08-22-view-encapsulation-w-angularze/devtools_config_shadow_dom.jpg)
<span class="img-legend">DevTools > Settings > Preferences > Elements</span>

możemy zobaczyć z czego tak naprawdę składa się element `<video>`:  

```html
<video width="320" height="240">
    #shadow-root
        <div pseudo="-webkit-media-controls" class="sizing-small phase-ready state-stopped">
            <div pseudo="-internal-media-controls-loading-panel" aria-label="buforowanie" aria-live="polite"
                style="display: none;"></div>
            <div pseudo="-webkit-media-controls-overlay-enclosure"><input
                    pseudo="-internal-media-controls-overlay-cast-button" type="button"
                    aria-label="odtwarzanie na urządzeniu zdalnym" style="display: none;"></div>
            <div pseudo="-webkit-media-controls-enclosure">
                <div pseudo="-webkit-media-controls-panel">
                    <div pseudo="-internal-media-controls-scrubbing-message" style="display: none;"></div>
                    <div pseudo="-internal-media-controls-button-panel"><input type="button"
                            pseudo="-webkit-media-controls-play-button" aria-label="odtwórz" class="pause" style="">
                        <div aria-label="upłynęło: 0:00" pseudo="-webkit-media-controls-current-time-display" style="">0:00
                        </div>
                        <div aria-label="pozostało: / 0:12" pseudo="-webkit-media-controls-time-remaining-display" style="">
                            /
                            0:12</div>
                        <div pseudo="-internal-media-controls-button-spacer"></div>
                        <div pseudo="-webkit-media-controls-volume-control-container" class="closed" style="">
                            <div pseudo="-webkit-media-controls-volume-control-hover-background"></div><input type="range"
                                step="any" max="1" aria-valuemax="100" aria-valuemin="0" aria-label="volume"
                                pseudo="-webkit-media-controls-volume-slider" aria-valuenow="100" class="closed"
                                style=""><input type="button" pseudo="-webkit-media-controls-mute-button"
                                aria-label="wyciszenie" style="">
                        </div><input type="button" role="button" aria-label="włącz tryb obrazu w&nbsp;obrazie"
                            pseudo="-internal-media-controls-picture-in-picture-button" style="display: none;"><input
                            type="button" pseudo="-webkit-media-controls-fullscreen-button"
                            aria-label="przejdź do pełnego ekranu" style=""><input type="button"
                            aria-label="pokaż więcej opcji sterowania multimediami" title="więcej opcji"
                            pseudo="-internal-media-controls-overflow-button" style="">
                    </div><input type="range" step="any" pseudo="-webkit-media-controls-timeline" max="12.612"
                        aria-label="pasek czasu odtwarzania filmu 0:00 / 0:12" aria-valuetext="upłynęło: 0:00">
                </div>
            </div>
            <div role="menu" aria-label="Opcje" pseudo="-internal-media-controls-text-track-list" style="display: none;">
            </div>
            <div pseudo="-internal-media-controls-overflow-menu-list" role="menu" class="closed" style="display: none;">
                <label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label=" Odtwórz " style="display: none;"><input type="button"
                        pseudo="-webkit-media-controls-play-button" tabindex="-1" aria-label="odtwórz" class="pause"
                        style="display: none;">
                    <div aria-hidden="true"><span>Odtwórz</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label="przejdź do pełnego ekranu Pełny ekran " style="display: none;"><input type="button"
                        pseudo="-webkit-media-controls-fullscreen-button" aria-label="przejdź do pełnego ekranu"
                        tabindex="-1" style="display: none;">
                    <div aria-hidden="true"><span>Pełny ekran</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label="pobierz multimedia Pobierz " class="animated-1" style=""><input type="button"
                        aria-label="pobierz multimedia" pseudo="-internal-media-controls-download-button" tabindex="-1"
                        style="">
                    <div aria-hidden="true"><span>Pobierz</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label=" Wycisz " class="animated-2" style="display: none;"><input type="button"
                        pseudo="-webkit-media-controls-mute-button" tabindex="-1" aria-label="wyciszenie"
                        style="display: none;">
                    <div aria-hidden="true"><span>Wycisz</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label="odtwarzanie na urządzeniu zdalnym Przesyłaj " class="animated-1"
                    style="display: none;"><input pseudo="-internal-media-controls-cast-button" type="button"
                        aria-label="odtwarzanie na urządzeniu zdalnym" tabindex="-1" style="display: none;">
                    <div aria-hidden="true"><span>Przesyłaj</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label="wyświetlanie menu napisów Napisy " class="animated-0" style="display: none;"><input
                        aria-label="wyświetlanie menu napisów" type="button"
                        pseudo="-webkit-media-controls-toggle-closed-captions-button" tabindex="-1" style="display: none;">
                    <div aria-hidden="true"><span>Napisy</span></div>
                </label><label pseudo="-internal-media-controls-overflow-menu-list-item" role="menuitem" tabindex="0"
                    aria-label="włącz tryb obrazu w&nbsp;obrazie Obraz w&nbsp;obrazie " class="animated-0" style=""><input
                        type="button" role="button" aria-label="włącz tryb obrazu w&nbsp;obrazie"
                        pseudo="-internal-media-controls-picture-in-picture-button" tabindex="-1" style="">
                    <div aria-hidden="true"><span>Obraz w&nbsp;obrazie</span></div>
                </label></div>
        </div>
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.ogg" type="video/ogg">
</video>
```

Shadow DOM ukrywa całą implementację pod prostym tagiem.  
Dzięki temu style zaaplikowane do naszego elementu nie wpływają na inne elementy DOM-u.

![Shadow DOM browser support](/assets/img/posts/2019-08-22-view-encapsulation-w-angularze/shadow-dom-browser-support.png)
<span class="img-legend">Wsparcie Shadow DOM przez główne przeglądarki<br />źródło: <a href="https://www.webcomponents.org">www.webcomponents.org</a> - dostęp: 2019-08-20</span>

## View Encapsulation w Angularze

Domyślnie Angular korzysta z własnego kapsułkowania stylów (`ViewEncapsulation.Emulated`), ale udostępnia jeszcze 3 inne tryby kapsułkowania (w tym jeden deprecated).  

Aby zmienić domyślny tryb kapsułkowania, wystarczy dodać odpowiednią opcję w dekoratorze `@Component`, np.:  
`encapsulation: ViewEncapsulation.ShadowDom`

Omówimy je na przykładzie kodu z projektu demo. [Link do repozytorium](https://github.com/Michuu93/view-encapsulation-demo)

Projekt demo składa się z 4 komponentów:

* [`app-root`](https://github.com/Michuu93/view-encapsulation-demo/blob/master/src/app/app.component.ts) - główny komponent zawierający w sobie pozostałe komponenty
* [`app-red`](https://github.com/Michuu93/view-encapsulation-demo/blob/master/src/app/red-module/red.component.ts)
* [`app-green`](https://github.com/Michuu93/view-encapsulation-demo/blob/master/src/app/green-module/green.component.ts)
* [`app-blue`](https://github.com/Michuu93/view-encapsulation-demo/blob/master/src/app/blue-module/blue.component.ts)

Każdy z komponentów `app-red`, `app-green` oraz `app-blue` składa się z jednego paragrafu z odpowiednim kolorem tekstu dla tego elementu. Oprócz tego istnieją 3 branche, po jednym dla każdego z omawianych trybów, co pozwoli na zobrazowanie nakładania się oraz kapsułkowania stylów.

### ViewEncapsulation.None

Brak kapsułkowania, czyli style utworzone w komponencie są globalne (w sekcji `<head>`).  
W tym trybie elementy HTML i odpowiadające im selektory CSS wyglądają tak samo jak te, które napisaliśmy w kodzie.  
Może to spowodować niechciane nadpisywanie stylów lub dodawanie ich do elementów, które nie posiadają żadnego stylu.

W przykładzie usunęliśmy styl paragrafu w komponencie `app-green`.  
[Link do repozytorium](https://github.com/Michuu93/view-encapsulation-demo/tree/ViewEncapsulation.None)

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-red',
    template: `
        <p>Red paragraph!</p>
    `,
    styles: [`
        p {
            color: red;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class RedComponent {
}
```

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-green',
    template: `
        <p>Green paragraph!</p>
    `,
    encapsulation: ViewEncapsulation.None
})
export class GreenComponent {
}
```

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-blue',
    template: `
        <p>Blue paragraph!</p>
    `,
    styles: [`
        p {
            color: blue;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class BlueComponent {
}
```

Wynikowy kod HTML:

```html
<head>
    <style>
        p {
            color: red;
        }
    </style>
    <style>
        p {
            color: blue;
        }
    </style>
</head>

<body>
    <app-root ng-version="8.2.2">
        <app-red>
            <p>Red paragraph!</p>
        </app-red>
        <app-green>
            <p>Green paragraph!</p>
        </app-green>
        <app-blue>
            <p>Blue paragraph!</p>
        </app-blue>
    </app-root>
</body>
```

![ViewEncapsulation.None](/assets/img/posts/2019-08-22-view-encapsulation-w-angularze/view_encapsulation_none_result.jpg)
<span class="img-legend">Wynik widoczny w przeglądarce</span>

Jak widzimy, style zostały dodane w sekcji `<head>`, co spowodowało nadpisanie pierwszego stylu paragrafu drugim - `color: blue`. W efekcie wszystkie paragrafy mają ten sam kolor, również paragraf z komponentu `app-green`, który nie posiada żadnego stylu i powinien mieć kolor domyślny.

### ViewEncapsulation.Emulated (default)

Domyślny tryb kapsułkowania w Angularze, w którym style są domknięte w komponencie.  
W tym trybie style również znajdują się w sekcji `<head>`, ale posiadają dodatkowe atrybuty które wiążą je z elementami HTML pochodzącymi z tego samego komponentu.  
Dzięki temu na stronie może istnieć kilka komponentów zawierających element tego samego typu, ale z różnymi stylami.

**Uwaga!** W tym trybie style nie mają wpływu na inne elementy na stronie (jednak mogą mieć wpływ na elementy komponentu dziecka - jeśli komponent dziecka posiada tryb kapsułkowania inny niż Shadow DOM), ponieważ są domknięte unikalnymi atrybutami. Globalne style strony (oraz style innych komponentów, które mają wyłączony tryb kapsułkowania) mogą jednak mieć wpływ na ten komponent.

W przykładzie przenieśliśmy komponent `app-green` z komponentu `app-root` do komponentu `app-blue` i usunęliśmy jego style.  
[Link do repozytorium](https://github.com/Michuu93/view-encapsulation-demo/tree/ViewEncapsulation.Emulated)

```typescript
import {Component} from '@angular/core';

@Component({
    selector: 'app-red',
    template: `
        <p>Red paragraph!</p>
    `,
    styles: [`
        p {
            color: red;
        }
    `]
})
export class RedComponent {
}
```

```typescript
import {Component} from '@angular/core';

@Component({
    selector: 'app-green',
    template: `
        <p>Green paragraph!</p>
    `
})
export class GreenComponent {
}
```

```typescript
import {Component} from '@angular/core';

@Component({
    selector: 'app-blue',
    template: `
        <app-green></app-green>
        <p>Blue paragraph!</p>
    `,
    styles: [`
        p {
            color: blue;
        }
    `]
})
export class BlueComponent {
}
```

Wynikowy kod HTML:

```html
<head>
    <style>
        p[_ngcontent-pes-c0] {
            color: red;
        }
    </style>
    <style>
        p[_ngcontent-pes-c1] {
            color: blue;
        }
    </style>
</head>

<body>
    <app-root ng-version="8.2.2">
        <app-red _nghost-pes-c0>
            <p _ngcontent-pes-c0>Red paragraph!</p>
        </app-red>
        <app-blue _nghost-pes-c1>
            <app-green _ngcontent-pes-c1>
                <p>Green paragraph!</p>
            </app-green>
            <p _ngcontent-pes-c1>Blue paragraph!</p>
        </app-blue>
    </app-root>
</body>
```

![ViewEncapsulation.Emulated](/assets/img/posts/2019-08-22-view-encapsulation-w-angularze/view_encapsulation_emulated_result.jpg)
<span class="img-legend">Wynik widoczny w przeglądarce</span>

Domyślny tryb pozwolił nam odseparować style między poszczególnymi komponentami. W kodzie wynikowym widzimy, że style z komponentu rodzica `app-blue` nie zostały zaaplikowane do komponentu dziecka `app-green`, w efekcie czego paragraf ma kolor domyślny. Stało się tak, ponieważ Angular dodał atrybut do stylu. Gdybyśmy dodali styl w runtime, to zostałby zaaplikowany również do komponentu dziecka.

Na przykładzie komponentu `app-red` - Angular dodał atrybut `_ngcontent-pes-c0` do selektora CSS oraz elementu HTML. W ten sposób style dodane w sekcji `<head>` aplikują się tylko do odpowiednich elementów z tego samego komponentu. Oprócz tego, na komponencie dodany został atrybut `_nghost-pes-c0`. Z czego składają się te atrybuty?

* `_ngcontent` - określa typ elementu, w tym przypadku zawartość komponentu
* `_nghost` - określa element `root` komponentu
* `-pes` - oznacza ID aplikacji ([APP_ID](https://angular.io/api/core/APP_ID)), jeśli nie został ustawiony to zostanie przyjęty wygenerowany ciąg znaków - dzięki temu nie nakładają się style między różnymi aplikacjami wyświetlanymi w jednym oknie
* `-c0` - numeruje kolejno elementy w komponencie

### ViewEncapsulation.ShadowDom

Kapsułkowanie oparte na Shadow DOM (wymaga wsparcia przeglądarki dla Shadow DOM).
W tym trybie style nie są dodawane w sekcji `<head>`, a istnieją w **Shadow Root**.

**Uwaga!** W tym trybie style nie mają wpływu na inne elementy na stronie (jednak mogą mieć wpływ na elementy komponentu dziecka - jeśli komponent dziecka posiada tryb kapsułkowania inny niż Shadow DOM). Globalne style strony (oraz style innych komponentów) również nie mają wpływu na ten komponent.

W przykładzie przenieśliśmy komponent `app-green` z komponentu `app-root` do komponentu `app-blue`, usunęliśmy jego style i ustawiliśmy domyślny tryb kapsułkowania.  
[Link do repozytorium](https://github.com/Michuu93/view-encapsulation-demo/tree/ViewEncapsulation.ShadowDom)

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-red',
    template: `
        <p>Red paragraph!</p>
    `,
    styles: [`
        p {
            color: red;
        }
    `],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class RedComponent {
}
```

```typescript
import {Component} from '@angular/core';

@Component({
    selector: 'app-green',
    template: `
        <p>Green paragraph!</p>
    `
})
export class GreenComponent {
}
```

```typescript
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-blue',
    template: `
        <app-green></app-green>
        <p>Blue paragraph!</p>
    `,
    styles: [`
        p {
            color: blue;
        }
    `],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class BlueComponent {
}
```

Wynikowy kod HTML:

```html
<head>
</head>

<body>
    <app-root ng-version="8.2.2">
        <app-red>
            #shadow-root
            <style>
                p {
                    color: red;
                }
            </style>
            <p>Red paragraph!</p>
        </app-red>
        <app-blue>
            #shadow-root
            <style>
                p {
                    color: blue;
                }
            </style>
            <app-green>
                <p>Green paragraph!</p>
            </app-green>
            <p>Blue paragraph!</p>
        </app-blue>
    </app-root>
</body>
```

![ViewEncapsulation.ShadowDom](/assets/img/posts/2019-08-22-view-encapsulation-w-angularze/view_encapsulation_shadow_dom_result.jpg)
<span class="img-legend">Wynik widoczny w przeglądarce</span>

Tryb Shadow DOM również pozwolił nam odseparować style między poszczególnymi komponentami. W sekcji `<head>` nie ma już żadnych stylów, natomiast są ukryte w Shadow Root elementów DOM-u. Na przykładzie widzimy, że style z komponentu rodzica `app-blue` zostały zaaplikowane do komponentu dziecka `app-green`, w efekcie czego paragraf ma kolor niebieski. Gdyby komponent `app-green` również posiadał tryb `ViewEncapsulation.ShadowDom`, to style rodzica nie zostałyby zaaplikowane, ponieważ korzystałby ze stylów z własnego Shadow Root. Tryb Shadow DOM zabezpiecza nasz komponent również przed stylami z komponentu rodzica, dodanymi w runtime.

### ~~ViewEncapsulation.Native~~

Do niedawna zamiast `ViewEncapsulation.ShadowDom` dostępny był tryb `ViewEncapsulation.Native`.  
Działał on w podobny sposób, ale został wycofany z powodu wykorzystywania przestarzałego standardu Shadow DOM.

## Podsumowanie

Ogólnie rzecz biorąc, powinniśmy unikać braku kapsułkowania stylów, ponieważ powoduje to często niechciane efekty.  
Tryb Shadow DOM zapewnia całkowite domknięcie stylów w komponencie, dzięki czemu style globalne oraz inne komponenty nie mają na niego wpływu, tak samo jak komponent w tym trybie nie ma wpływu na inne komponenty na stronie (za wyjątkiem komponentów dzieci które mają włączony tryb kapsułkowania inny niż Shadow DOM).

Niestety nie wszystkie przeglądarki mogą wspierać ten tryb, dlatego Angular domyślnie udostępnił własny, emulowany tryb kapsułkowania. W trybie domyślnym na nasz komponent mają jednak wpływ style globalne, a także mogą mieć wpływ inne komponenty, ponieważ komponent w tym trybie nadal wykorzystuje style z sekcji `<head>`. W większości przypadków tryb domyślny jest wystarczający, więc jeśli zależy nam na jak najlepszym wsparciu przeglądarek i nie mamy problemów z nadpisywaniem stylów przez inne komponenty lub aplikacje, to możemy z powodzeniem z niego korzystać.

Musimy jednak pamiętać, że mieszanie różnych trybów kapsułkowania między komponentami również może spowodować niezamierzone efekty.
