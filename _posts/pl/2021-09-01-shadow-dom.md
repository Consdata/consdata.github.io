---
layout:    post
title:     "Czy wiesz, czym jest Shadow DOM?"
date:      2021-09-01 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    pgrobelny
image:     /assets/img/posts/2021-09-01-shadow-dom/shadow.webp
tags:
- javascript
---
Pewnie czytając o Web Componentach dane było Ci słyszeń o **Shadow DOM**. Pozwala on na przyczepienie się do istniejących elementów DOM (które stają się Shadow Hostem) i wyjście z nich z nowym drzewem DOM.

### Jak korzystać z Shadow DOM
Aby to zrobić, potrzebujemy utworzyć uchwyt do elementu z DOM, np.:

```javascript
var host = document.getElementById("host");
```

a następnie przypiąć do niego **Shadow Root**, czyli miejsce, z którego będziemy mogli wyjść z Shadow DOMem:

```javascript
var root = host.attachShadow({'mode': 'open'});
```

`mode` pozwala ustalić, czy z zewnątrz Shadow DOM będziemy mogli mieć do niego dostęp. Może on przyjąć wartość open lub closed.

Na sam koniec do Shadow Root przypinamy kawałek HTMLa:

```javascript
root.innerHTML = "jestem w shadow DOM!";
```

### Przykład
Całość można zobaczyć na przykładzie:
<p class="codepen" data-height="400" data-default-tab="html,result" data-slug-hash="abWLrwm" data-user="Porkite" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/Porkite/pen/abWLrwm">
  Shadow DOM</a> by Porkite (<a href="https://codepen.io/Porkite">@Porkite</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

Przykład ten pokazuje również, że z Shadow DOM można korzystać jako z samodzielnego feature, bez udziału Web Componentu.

### Co nam to wszystko daje? 
Umożliwia nam to pisać Web Componenty (lub jak widać na przykładzie - niezależne dodatkowe struktury DOM), które **ukrywają swoją strukturę**, aby ułatwić czytanie html utworzonej strony. 

Dzięki nim możemy też **enkapsulować stylizację**: style dla naszej aplikacji nie będą wpływać na nasze Shadow DOM-y, a style zadeklarowane w ich wnętrzu nie zmienią wyglądu tego, co znajduje się na zewnątrz.
