---
layout:    post
title:     "Czy wiesz, że z pomocą @starting-style można animować elementy z display: none za pomocą samego CSS?"
description: ""
date:      2025-03-31T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: ptatarski
image: /assets/img/posts/2025-03-31-starting-style/thumbnail.webp
tags:
- angular
---
Do tej pory, aby wykonać animację po przejściu z `display: none` na inną wartość (pozwalającą wyrenderować element) konieczne było użycie dodatkowych trików. Dzięki regule `@starting-style` ten krok jest już zbędny i można uzyskać ten sam efekt, stosując jedynie CSS.

Przykład:
```css
.popup {
  display: none;
  transition: display 0.7s, translate 0.7s;
}
 
.popup.open {
  display: block;
  translate: 0 0;
  @starting-style {
    /* 
    Tutaj definiujemy początkowy styl elementu zaraz 
    po przejściu z display: none na display:block  
    */
    translate: 0 50vh;
  }
}
```
Link do interaktywnego przykładu: [https://jsfiddle.net/xg2sLrwk/27/](https://jsfiddle.net/xg2sLrwk/27/)

Analogicznie możemy postępować z elementami, które domyślnie mają ustawione `display: none` takimi jak `popover` czy `dialog`.

Przykład:
```html
<button popovertarget="popover">Open Popover</button>
<div popover id="popover">Popover</div>

<style>
    #popover::backdrop {
      background: black;
      opacity: .5;
    }
     
    #popover {
      transition: background 3s;
      background: red;
    }
     
    #popover:popover-open {
      /* 
      Gdybyśmy po prostu ustawili tutaj background na blue, element 
      wyświetliłby się niebieski pomijając animacje
      background: blue; 
      */
      @starting-style {
        background: blue; 
      }
    }
</style>
```
Link do interaktywnego przykładu: [https://jsfiddle.net/vazq9Lje/11/](https://jsfiddle.net/vazq9Lje/11/)

## Przydatne linki
- [https://caniuse.com/mdn-css_at-rules_starting-style](https://caniuse.com/mdn-css_at-rules_starting-style)
- [https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)