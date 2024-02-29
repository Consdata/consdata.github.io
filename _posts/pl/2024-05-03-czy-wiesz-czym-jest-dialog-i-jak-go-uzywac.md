---
layout:    post
title:     "Czy wiesz, czym jest dialog i jak go używać?"
date:      2024-05-03T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2024-05-03-czy-wiesz-czym-jest-dialog-i-jak-go-uzywac/html.webp
tags:
- html
- dialog
---

Okna dialogowe od dawna pełnią istotną rolę na różnorodnych stronach internetowych, jednak często ich implementacja niosła za sobą pewne wyzwania. Można było wykorzystać istniejące biblioteki JavaScript, ale wprowadzało to dodatkową złożoność w projekcie i powodowało zwiększenie jego rozmiaru. Z tego względu szczególnie ekscytującym jest wprowadzenie nowego elementu dialogowego do HTML. Dzięki niemu, znacząco uprości się sposób tworzenia dialogów.

Wspomniany wyżej element HTML `<dialog>` jest używany do tworzenia okien dialogowych. Okna dialogowe są wykorzystywane do wyświetlania treści na wierzchu aktualnej strony, zazwyczaj w celu uzyskania interakcji użytkownika, pobrania informacji lub wykonywania określonych działań.

Co więcej, element ten jest obsługiwany w każdej nowoczesnej przeglądarce, co oznacza, możemy go używać za każdym razem gdy potrzebujemy utworzyć okno dialogowe.

## Użycie elementu dialog
Aby utworzyć okno dialogowe należy wykorzystać tag `<dialog>`.

Okno dialogowe może być otwarte lub zamknięte. Wykorzystywany jest do tego atrybut open
Przykładowy kod:
```html
<dialog>
  Dialog zamknięty
</dialog>
 
<dialog open>
  Dialog otwarty
</dialog>
```

### Stylizowanie dialogu
Stylizowanie dialogu nie różni się niczym innym od stylizowania innych elementów HTML.
```css
dialog {
  padding: 15px;
  background: Azure;
  border: none;
  border-radius: 1rem;
}
```

Dodatkowo można stylizować tło, które pojawia się za oknem dialogowym, bez użycia dodatkowego kodu HTML lub JavaScript. Można to zrobić tylko w przypadku modalnego okna dialogowego. W tym celu trzeba wykorzystać pseudoelement `::backdrop`.
```css
dialog::backdrop {
  background-color: rgba(255, 0, 0, 0.2);
}
```

### API JavaScript
HTMLDialogElement posiada trzy główne metody dotyczące dialogów:
```javascript
dialog.show()      // otwiera dialog niemodalny
dialog.showModal() // otwiera dialog modalny
dialog.close()     // zamyka dialog
```

## Rodzaje dialogów

Istnieją dwa główne rodzaje dialogów:
- modalne
- niemodalne

### Dialogi modalne
W tym trybie można wchodzić w interakcje tylko z zawartością okna dialogowego. Okna dialogowe są wyświetlane nad zawartością strony. Reszta strony jest domyślnie zasłonięta przez półprzezroczyste tło.
Można go otworzyć za pomocą metody `showModal()`.
Po otwarciu istnieją trzy sposoby zamknięcia okna dialogowego:
- klawiszem `Escape`,
- zatwierdzenie formularza za pomocą przycisku z ustawionym atrybutem: `method="dialog"`,
- wywołanie metody `close()`.

Przykładowy kod:
```html
<h2>Dialog modalny</h2>
<button onclick="showModalDialog()">Otwórz dialog</button>
<br>
<button onclick="closeModalDialog()">Hej! Nie możesz mnie kliknąć kiedy dialog <b>modalny</b> jest otwarty 😞</button>
 
<dialog id="modalDialog">
  Witaj 👋! <br> Możesz zamknąć mnie przy użyciu poniższych przycisków lub przy użyciu klawisza "Escape" <br>
   
  <button onclick="closeModalDialog()">Zamknij przy użyciu metody close()</button>
   
  <form method="dialog">
    <button>Zamknij przy użyciu method="dialog"</button>
  </form>
   
</dialog>
 
<script>
    const modalDialog = document.getElementById('modalDialog');
 
    function showModalDialog() {
      modalDialog.showModal();
    }
 
    function closeModalDialog() {
      modalDialog.close();
    }
</script>
```

Jako, że typ modalny posiada tło wyświetlane za dialogiem, możne narodzić się pytanie, czy istnieje możliwość zamknięcia dialogu poprzez kliknięcie w tło? Okazuje się, że tak, ale potrzebne jest wykorzystanie JavaScriptu.
Na dialog musimy dodać listener nasłuchujący na kliknięcie. Następnie użycie metody `getBoundingClientRect()` pozwoli nam otrzymać informacje o rozmiarze i położeniu elementu okna dialogowego w viewpoint. Potem pozostaje sprawdzenie czy kliknięcie było poza dialogiem i wywołanie funkcji `close()`.
Przykładowy kod:
```javascript
dialog.addEventListener("click", event => {
  const dialogPosition = dialog.getBoundingClientRect()
  if (
    event.clientY < dialogPosition.top ||
    event.clientY > dialogPosition.bottom ||
    event.clientX < dialogPosition.left ||
    event.clientX > dialogPosition.right
  ) {
    dialog.close()
  }
})
```

### Dialogi niemodalne
W przeciwieństwie do modalnych, można wchodzić w interakcje z zawartością poza oknem dialogowym. Należy pamiętać, że klawisz `Escape` nie zamyka dialogu tego rodzaju.
Można go otworzyć za pomocą metody `show()`.
Przykładowy kod:
```html
<h2>Dialog niemodalny</h2>
<button onclick="showNonModalDialog()">Otwórz dialog</button>
<br>
<button onclick="closeNonModalDialog()">Hej! możesz mnie kliknąć kiedy dialog <b>niemodalny</b> jest otwarty 😃</button>
 
<dialog id="nonModalDialog">
  Witaj 👋! <br> Nie możesz użyć klawiszu "Escape", aby mnie zamknąć 🤪<br>
   
  <button onclick="closeNonModalDialog()">Zamknij przy użyciu metody close()</button>
   
  <form method="dialog">
    <button>Zamknij przy użyciu method="dialog"</button>
  </form>
   
</dialog>
 
<script>
    const nonModalDialog = document.getElementById('nonModalDialog');
 
    function showNonModalDialog() {
    nonModalDialog.show();
    }
 
    function closeNonModalDialog() {
    nonModalDialog.close();
    }
</script>
```

## Przydatne linki
- [https://caniuse.com/dialog](https://caniuse.com/dialog)
- [https://jsfiddle.net/wstolarski_consdata/cbh5rfo1/21/](https://jsfiddle.net/wstolarski_consdata/cbh5rfo1/21/)
- [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [https://web.dev/learn/html/dialog/](https://web.dev/learn/html/dialog/)