---
layout:    post
title:     "Czy wiesz jak z CSS Grid definiować układ strony?"
date:      2023-09-22T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: kpowrozek
image: /assets/img/posts/2023-09-22-czy-wiesz-jak-z-css-grid-definiowac-uklad-strony/grid.jpg
tags:
- css
- grid
- frontend
---

Gdy pomyślimy o narzędziu CSS, które pozwala na elastyczne tworzenie responsywnych układów stron internetowych, naszym pierwszym skojarzeniem może być dobrze znany CSS Flexbox. W niniejszym wpisie spróbujemy przyjrzeć się jego bardziej złożonej alternatywie, jaką jest CSS Grid, poznać jej podstawy oraz wykonać drobną analizę porównawczą między tymi narzędziami.

## Porównanie teoretyczne

CSS Grid jest zasadniczo bardziej zaawansowany i pozwala na tworzenie skomplikowanych układów, podczas gdy Flexbox jest idealnym narzędziem do projektowania prostych układów, które wymagają elastyczności. Flexbox pozwala na ustawienie elementów wzdłuż jednej osi - oznacza to, że można ustawić elementy wzdłuż osi poziomej lub pionowej, ale nie można ich ustawiać wzdłuż obu osi jednocześnie. CSS Grid pozwala na tworzenie bardziej złożonych układów, w których elementy mogą być ułożone wzdłuż dwóch osi - kolumn i wierszy. CSS Grid pozwala na łatwe tworzenie siatki, której elementy będą mieć różne rozmiary i kształty. Jest to szczególnie przydatne w przypadku tworzenia stron z dużą liczbą niebanalnie rozłożonych elementów.

## CSS Grid - podstawy

A więc by jeszcze dalej wyjść poza ograniczający HTMLowy box model, definiujemy "siatkę", na której będziemy umieszczać nasze elementy zgodnie ze współrzędnymi na naszym kontenerze:
```css
.container {
    display: grid;
}
```

Do zdefiniowania jaki rozkład ma nasza siatka, służą nam 2 podstawowe właściwości:
- grid-template-columns
- grid-template-rows

Możemy im przekazać wartość i w dowolnych jednostkach. Każda kolejna wartość opisuje kolejną kolumnę lub rząd. Przykład:
```css
.container {
    display: grid;
    grid-template-columns: 100px 2rem 30% 2fr;
}
```

Zatem zgodnie z tym rozkładem pierwsza kolumna będzie miała szerokość 100 pikseli, druga kolumna 2 REMy, trzecia będzie zajmowała 30% szerokości kontenera, a czwarta - no właśnie?

## Jednostka "fr"

Jednostka "fr" (z ang. fraction, a więc ułamek) to jednostka charakterystyczna dla CSS Grid. Służy do określania proporcji rozmiarów kolumn i wierszy. Jest to względna jednostka, która odnosi się do dostępnego miejsca w kontenerze siatki CSS Grid. Każda jednostka "fr" dzieli dostępną przestrzeń w kontenerze siatki Grid w proporcji do innych jednostek "fr" lub innych jednostek rozmiarów (np. pikseli, em czy procentów), które zostały zdefiniowane wraz z jednostkami "fr". Dla przykładu jeśli kontener ma 1000px, a my dodamy mu właściwość "grid-template-rows: 1fr 2fr 1fr", to pierwszy i ostatni rząd otrzymają po 1/4 dostępnej przestrzeni, a środkowy otrzyma 2/4, czyli połowę przestrzeni.

## Pomocnicze funkcje
### repeat()
Umożliwia ona łatwe zdefiniowanie jednej szerokości dla wielu kolumn. Pierwszy argument to liczba kolumn, drugi to ich szerokość, np.
```css
.container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
}
```
Każda element będzie zajmował 1/12 dostępnego miejsca w orientacji kolumnowej.

### minmax()
Umożliwia zdefiniowanie minimalnej lub maksymalnej szerokości lub wysokości wierszy lub kolumn. Pierwszy argument to wartość minimalna, drugi to wartość maksymalna, np:
```css
.container {
    display: grid;
    grid-template-columns: minmax(200px, auto);
}
```
Czyli minimalna szerokość kolumny będzie wynosić 200px, a maksymalna szerokość ustawi się automatycznie w zależności od zawartości elementu.

## Rozmiary i położenie elementów w kontenerze
Do definiowania położenia elementu znajdującego się w środku gridowego kontenera używane są właściwości grid-column-start, grid-column-end, grid-row-start i grid-row-end. Określają one, na którym miejscu w siatce rozpoczyna się i kończy dany element. Jednak wpisywanie obu wartości (-start i -end dla wybranej orientacji) dla każdego elementu na stronie może być dość uciążliwe.

Istnieje skrócona właściwość grid-column, która akceptuje obie wartości za jednym razem, rozdzielone przez ukośnik, co wydaje się bardziej intuicyjne, gdyż w jednej linijce definiujemy rozciągłość elementu w danej osi. Zapis:
```css
.item {
    grid-column: 1 / 4;
}
```
oznacza, że element zajmuje trzy kolumny: od pierwszej do trzeciej i jest równoznaczny z zapisem:
```css
.item {
    grid-column-start: 1;
    grid-column-end: 4;
}
```
Warto jeszcze zwrócić uwagę na możliwość użycia słowa kluczowego "span" do określenia rozciągłości elementu. Odpowiadającym zapisem do powyższych z jego użyciem będzie zapis:
```css
.item {
    grid-column: 1 / span 3;
}
```
czyli element zajmuje 3 kolumny siatki (rozciąga się na 3 kolumny), począwszy od kolumny pierwszej.

Słowo kluczowe "span" można również używać od drugiej strony, tj to samo osiągniemy dzięki:
```css
.item {
    grid-column: 3 span / 4;
}
```
co z gridowego na nasze będzie znaczyło "zakończywszy na 4 kolumnie (a mówiąc precyzyjniej zakończywszy przed 4 kolumną), zajmij 3 kolumny" - czyli tak jak w każdym z przykładów w tym podpunkcie kolumny 1, 2 i 3.

## Ćwiczenia
Funkcjonalność CSS Grid można łatwo i przyjemnie poćwiczyć pod niniejszym adresem: [https://cssgridgarden.com/#pl](https://cssgridgarden.com/#pl)