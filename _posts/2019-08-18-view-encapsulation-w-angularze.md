---
layout:    post
title:     "View Encapsulation w Angularze - czyli o kapsułkowaniu słów kilka"
published: true
date:     2019-08-18 08:00:00 +0100
author:    mhoja
tags:
    - angular
    - view encapsulation
    - kapsułkowanie
---

Tworząc komponenty w Angularze mamy możliwość zarządzania kapsułkowaniem styli - czyli tym jak style z jednego komponentu wpływają na inne komponenty.  
Zanim omówimy kapsułkowanie, wtyjaśnijmy w kilku słowach czym jest **Shadow DOM**.

## Shadow DOM

**Shadow DOM** wprowadza enksapsulację do DOM'u. Pozwala to odseparować styl i kod potrzebny do wyświetlenia od dokumentu, w którym znajduje się dany element. Przykładem może być np. znacznik HTML `<video>`

```html
<video width="320" height="240">
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.ogg" type="video/ogg">
</video>
```

Po włączeniu opcji wyświetlania Shadow Root w przeglądarce:  
![Devtools Configuration](/assets/img/posts/2019-xx-xx-view-encapsulation/devtools_config_shadow_dom.jpg)

możemy zobaczyć z czego tak naprawdę składa się znacznik `<video>`:  

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

**Shadow DOM** ukrywa całą implementację pod prostym tagiem.  
Dzięki temu style zaaplikowane do naszego elementu nie wpływają na inne elementy DOM'u.

## View Encapsulation w Angularze

Domyślnie Angular korzysta z własnego kapsułkowania styli (**ViewEncapsulation.Emulated**), ale udostępnia jeszcze 2 inne tryby kapsułkowania.  

Aby zmienić domyślny tryb kapsułkowania, wystarczy dodać odpowiednią opcję w dekoratorze `@Component`, np.:  
`encapsulation: ViewEncapsulation.ShadowDom`

Omówimy je na przykładzie kodu z [**projektu demo.**](https://github.com/Michuu93/view-encapsulation-demo)

Projekt demo składa się z 4 komponentów:

* **app-root** - główny komponent zawierający w sobie pozostałe 3 komponenty
* **app-red**
* **app-green**
* **app-blue**

Każdy z komponentów **app-red**, **app-green** oraz **app-blue** składa się z jednego paragrafu z odpowiednim kolorem tekstu dla tego znacznika. Pozwoli to na zobrazowanie nakładania się oraz kapsułkowania styli.

### 1. ViewEncapsulation.None

Brak kapsułkowania, czyli style utworzone w komponencie są globalne (w sekcji `<head>`).  
W tym trybie znaczniki HTML i odpowiadające im selektory CSS wyglądają tak samo jak te, które napisaliśmy w kodzie.  
Może to spowodować niechciane nadpisywanie styli lub dodawanie ich do elementów, które nie posiadają żadnego stylu.

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

![ViewEncapsulation.None](/assets/img/posts/2019-xx-xx-view-encapsulation/view_encapsulation_none_result.jpg)

Jak widzimy, wszystkie style paragrafów zostału dodane w sekcji `<head>`, co spowodowalo nadpisanie tego stylu ostatnim - `color: blue`. W efekcie wszystkie paragrafy mają ten sam kolor, również paragraf z komponentu **app-green**, który nie posiada żadnego stylu i powinien mieć domyślny kolor.

### 2. ViewEncapsulation.Emulated (default)

Domyślny tryb kapsułkowania w Angularze, w którym style są domknięte w komponencie.  
W tym trybie style również znajdują się z sekcji `<head>`, ale posiadają dodatkowe atrybuty które wiążą je ze znacznikami HTML pochodzącymi z tego samego komponentu.  
Dzięki temu na stronie możem istnieć kilka komponentów zawierających znacznik tego samego typu, ale z różnymi stylami.  
**Uwaga!** W tym trybie style rodzica nie mają wpływu na elementy dziecka (ponieważ każdy element otrzymuje własny, unikalny atrybut).

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
    `,
    styles: [`
        p {
            color: green;
        }
    `]
})
export class GreenComponent {
}
```

```typescript
import {Component} from '@angular/core';

@Component({
    selector: 'app-blue',
    template: `
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

```html
<head>
    <style>
        p[_ngcontent-dql-c0] {
            color: red;
        }
    </style>
    <style>
        p[_ngcontent-dql-c1] {
            color: green;
        }
    </style>
    <style>
        p[_ngcontent-dql-c2] {
            color: blue;
        }
    </style>
</head>

<body>
    <app-root ng-version="8.2.2">
        <app-red _nghost-dql-c0="">
            <p _ngcontent-dql-c0="">Red paragraph!</p>
        </app-red>
        <app-green _nghost-dql-c1="">
            <p _ngcontent-dql-c1="">Green paragraph!</p>
        </app-green>
        <app-blue _nghost-dql-c2="">
            <p _ngcontent-dql-c2="">Blue paragraph!</p>
        </app-blue>
    </app-root>
</body>
```

![ViewEncapsulation.Emulated](/assets/img/posts/2019-xx-xx-view-encapsulation/view_encapsulation_emulated_and_shadow_dom_result.jpg)

Domyślny tryb pozwolił nam odseparować style między poszczególnymi komponentami, dzięki czemu uzyskaliśmy oczeiwany efekt - każdy paragraf ma swój kolor zdefiniowany w stylach komponentu.

### 3. ViewEncapsulation.ShadowDom

Kapsułkowanie oparte na **Shadow DOM** (wymaga wsparcia przeglądarki dla Shadow DOM).
W tym trybie style nie są dodawane w sekcji `<head>`, a istnieją w **Shadow Root**.  
**Uwaga!** W tym trybie style rodzica mają wpływ na elementy dziecka (ponieważ style nie posiadają dodatkowych atrybutów i aplikują się do wszystkich elementów z poddrzewa komponentu).

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
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-green',
    template: `
        <p>Green paragraph!</p>
    `,
    styles: [`
        p {
            color: green;
        }
    `],
    encapsulation: ViewEncapsulation.ShadowDom
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
    encapsulation: ViewEncapsulation.ShadowDom
})
export class BlueComponent {
}
```

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
        <app-green>
            #shadow-root
            <style>
                p {
                    color: green;
                }
            </style>
            <p>Green paragraph!</p>
        </app-green>
        <app-blue>
            #shadow-root
            <style>
                p {
                    color: blue;
                }
            </style>
            <p>Blue paragraph!</p>
        </app-blue>
    </app-root>
</body>
```

![ViewEncapsulation.ShadowDom](/assets/img/posts/2019-xx-xx-view-encapsulation/view_encapsulation_emulated_and_shadow_dom_result.jpg)
