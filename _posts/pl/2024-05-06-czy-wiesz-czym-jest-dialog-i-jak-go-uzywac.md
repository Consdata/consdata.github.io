---
layout:    post
title:     "Czy wiesz, czym jest dialog i jak go używać?"
date:      2024-05-06T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: wstolarski
image: /assets/img/posts/2024-05-06-czy-wiesz-czym-jest-dialog-i-jak-go-uzywac/html.webp
tags:
- html
- dialog
---

Okna dialogowe od dawna pełnią istotną rolę na różnorodnych stronach internetowych, jednak ich implementacja często niesie za sobą pewne wyzwania. Można wykorzystać istniejące biblioteki JavaScript, ale powoduje to zwiększenie złożoności i rozmiaru projektu. Z tego względu szczególnie ekscytującym jest wprowadzenie nowego elementu dialogowego do HTML. Dzięki niemu, znacząco uprości się sposób tworzenia dialogów.

Element HTML `<dialog>` jest używany do tworzenia okien dialogowych. Okna dialogowe wyświetlają treści na wierzchu aktualnej strony, zazwyczaj w celu skłonienia użytkownika do interakcji, pobrania informacji lub wykonywania określonych działań.

Co więcej, element ten jest obsługiwany w każdej nowoczesnej przeglądarce, co oznacza, że możemy go używać za każdym razem gdy potrzebujemy utworzyć okno dialogowe.

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

### Stylowanie dialogu

Stylowanie dialogu nie różni się niczym od stylowania innych elementów HTML.
```css
dialog {
  padding: 15px;
  background: Azure;
  border: none;
  border-radius: 1rem;
}
```

W przypadku modalnego okna dialogowego można dodatkowo stylować tło za oknem bez użycia dodatkowego kodu HTML czy JavaScript. Można to zrobić tylko w przypadku modalnego okna dialogowego. W tym celu trzeba wykorzystać pseudoelement `::backdrop`.
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
Można je otworzyć za pomocą metody `showModal()`.
Okno dialogowe można zamknąć na trzy sposoby:
- klawiszem `Escape`,
- zzatwierdzając formularz za pomocą przycisku z ustawionym atrybutem: `method="dialog"`,
- wywołując metodę `close()`.

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

W przypadku typu modalnego tło jest wyświetlane za dialogiem, więc nasuwa się pytanie, czy można zamknąć dialog klikając w tło? Okazuje się, że tak, ale trzeba zastosować JavaScript.
Na dialog musimy dodać listener nasłuchujący na kliknięcie. Następnie użycie metody `getBoundingClientRect()` pozwoli nam otrzymać informacje o rozmiarze i położeniu elementu okna dialogowego w viewpoint. Potem pozostaje sprawdzić, czy kliknięcie było poza dialogiem i wywołać metodę `close()`.
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
W przypadku dialogów niemodalnych, można wchodzić w interakcje z zawartością poza oknem dialogowym. Należy pamiętać, że klawisz `Escape` nie zamyka dialogu tego rodzaju.
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

## Playground
- [https://jsfiddle.net/wstolarski_consdata/cbh5rfo1/21/](https://jsfiddle.net/wstolarski_consdata/cbh5rfo1/21/)

## Przydatne linki
- [https://caniuse.com/dialog](https://caniuse.com/dialog)
- [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [https://web.dev/learn/html/dialog/](https://web.dev/learn/html/dialog/)
