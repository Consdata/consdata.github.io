---
layout:    post
title:     Testy e2e z Cypress
published: true
date:      2020-11-12 08:00:00 +0100
author:    amarszalek
image:     /assets/img/posts/2020-11-19-testy-e2e-cypress/e2e-cypress.jpg
tags:
    - Cypress
    - e2e
    - e2e testing
    - JavaScript
---
Łamy bloga Consdata Tech gościły już wiele wpisów dotyczących testowania aplikacji - jednak żaden z nich nie zajmował się tematem testów e2e (end-to-end). 
Na rynku testów e2e, czyli takich, które sprawdzają funkcjonalność od początku do końca, symulując zachowanie użytkownika i weryfikując UI, stale dominuje Selenium - narzędzie wielu programistom znane, z historią sięgającą 2004 roku. 
Dziś na warsztat wezmę dość młody framework - Cypress, który może okazać się kuszącą alternatywą dla wcześniej wspomnianego narzędzia.

# Kilka słów o Cypressie
Należy zacząć od tego, że Cypress nie jest nakładką na Selenium - jest to całkowicie niezależny byt, w całości bazowany na JavaScripcie.
Również pisanie testów odbywa się w tym języku, a jeśli ktoś miał wcześniej styczności z narzędziami służącymi do pisania testów jednostkowych: Chai oraz Mocha, to będzie czuł się z domu - Cypress zaadoptował i dopasował do swoich potrzeb. Dzięki temu właściwie od pierwszej chwili jesteśmy wyposażenie we wszystko, co jest potrzebne do sprawnego tworzenia kodu.

Wykonywane scenariusze testowe mogą być przez nas podglądane na żywo - są one uruchamiane na wybranej przez nas przeglądarce, może to być Edge, Chrome, Firefox lub wbudowany Electron. Podczas ich wykonywania każdy kolejny krok zapisywany jest pod postacią snapshotów - migawek, do których możemy zajrzeć w każdym momencie i zweryfikować stan aplikacji.
   
W Cypressie developer nie musi pamiętać aby pisać jawne oczekiwanie na zakończenie poleceń (_wait_ znane z Selenium). Jest to zrobione za nas przez twórców frameworka - wszystko dzieje się automatycznie i kolejne polecenia oraz asercje wykonują się w odpowiednim momencie.   

Kolejną z rzeczy wartych wspomnienia jest łatwość użycia i konfiguracji - jedno polecenie instaluje framework, a kolejne uruchamia dashboard, którym posługiwanie się jest intuicyjne.

<div class="img-with-legend">
<img alt="Dashboard Cypress" src="/assets/img/posts/2020-11-19-testy-e2e-cypress/cypress-dashboard.png" />
<span class="img-legend">Rys. 1. Dashboard Cypress</span>
</div>

# Rozpoczynanie pracy
W kwestii wymagań, Cypress nie potrzebuje wiele: wystarczy Node.js oraz ulubione IDE.
Aby umożliwić rozpoczęcie pracy, wystarczy wykonać następujące polecenia w katalogu projektu:
1. `npm init`, aby stworzyć projekt node'owy
2. `npm install cypress --save-dev` dla instalacji Cypressa

Powstanie następująca domyślna struktura:
<div class="img-with-legend">
<img alt="Struktura Cypress" src="/assets/img/posts/2020-11-19-testy-e2e-cypress/struktura-cypress.png" />
<span class="img-legend">Rys. 2. Struktura projektu Cypress</span>
</div>
Objaśnienia:
- `fixtures` - miejsce gdzie możemy przechowywać gotowe zestaw danych, np. służące do zamockowania usług,
- `integration` - lokalizacja testów,
- `plugins` - miejsce do załączania zewnętrznych rozszerzeń dla Cypressa,
- `support` - tutaj znajdą się np. stałe powtarzające się w wielu scenariuszach czy też nowe, customowe polecenia do globalnego reużycia.

Następnie przy pomocy komendy `npx cypress open` możemy uruchomić dashboard i jeden z przykładowych testów.

# Scenariusze testowe
W ramach tego wpisu, na warsztat weźmiemy stronę główną bloga Consdata Tech -  [https://blog.consdata.tech/](blog.consdata.tech) i stworzymy dla niej dwa przypadki testowe.

Pierwszy scenariusz będzie polegał na wejście na stronę, poczekaniu aż się załaduje i zweryfikowaniu kilku elementów, która potwierdzą nam, że portal jest w pełni działający.

Drugi scenariusz, nieco bardziej rozbudowany, dokona kilku interakcji z blogiem.

# Pierwszy test

W katalogu `integration` stwórzmy nowy plik o nazwie `blog.spec.js`, przejdźmy do jego edycji i uzupełnijmy go o następującą treść:
```javascript
describe('Blog Consdata Tech', () => {
    it('should check page fully loaded', () => {
        // ..
    });
})
```
Tak jak wcześniej wspomniałem, jeśli ktoś miał wcześniej styczność z testami w JS, wszystko będzie dla niego jasne.

Idąc od początku, `describe` nazywa nam całościowy kontekst, którego będą dotyczyć poszczególne scenariusze. `it` rozpoczyna konkretny przypadek testowy i to wewnątrz niego będziemy implementować właściwą logikę.

W tym momencie możemy uruchomić dashboard Cypressa. Zobaczymy w nim, że pojawił się nasz plik. Po kliknięciu w niego uruchomi się przeglądarka oraz scenariusz testowy:
<div class="img-with-legend">
<img alt="Cypress scenariusz testowy" src="/assets/img/posts/2020-11-19-testy-e2e-cypress/scenariusz-testowy-cypress.png" />
<span class="img-legend">Rys. 3. Uruchomiony scenariusz w Cypress</span>
</div>
Zostawmy przeglądarkę i dashboard włączony w tle - Cypress nasłuchuje na zmiany i od razu je wykonuje. Dzięki temu mamy ciągłą pętlę zwrotną z informacją czy to co tworzymy przynosi oczekiwane efekty.

Wracając do tworzenia testu, jak wynika z nazwy `should check page fully loaded`, pierwszy z nich będzie sprawdzał czy strona na którą wchodzimy poprawnie się załadowała. Dodajmy ciało do pustej metody:
```javascript
cy.visit('https://blog.consdata.tech/').then(() =>{
    cy.get('.header-logo').should('be.visible');
    cy.get('footer').should('be.visible');
});
```
Jak widać, napisany kod jest właściwie samoopisujący się. W pierwszej linii odwiedzamy podany adres, następnie, gdy to się zadzieje, szukamy w DOM elementu o klasie `header-logo` i sprawdzamy czy jest widoczny. Operacje powtarzamy dla elementu `footer`. W przeglądarce uświadczy nas poniższy obrazek:
<div class="img-with-legend">
<img alt="Dashboard Cypress" src="/assets/img/posts/2020-11-19-testy-e2e-cypress/sukces%20scenariusz%20pierwszy%20cypress.png" />
<span class="img-legend">Rys. 4. Scenariusz testowy zakończony powodzeniem</span>
</div>

# Interakcje

Twórcy Cypressa przygotowali nam zestaw metod, które ułatwią nam wykonywanie operacji na stronie. W skład tych poleceń wchodzi m.in. `click()`, `type()`, `select()` czy `check()`.

Jeszcze zanim przejdziemy do implementacji drugiego scenariusza, trzeba zauważyć, że każdy z nich będzie zaczynał się od tej samej akcji - otworzenia strony. Możemy wynieść ten kawałek kodu to do metody `beforeEach()`, która jest uruchamiana przed każdym testem:
```javascript
beforeEach(() => {
    cy.visit('https://blog.consdata.tech/')
})
```
W ten sposób będziemy zgodni z regułą DRY :)

Wracając do właściwego testu, rzućmy na niego okiem:
```javascript
it('search for a specific post', () => {
       const searchBoxElementId = '#search-box';

       cy.get(searchBoxElementId).should('be.not.visible'); // weryfikacja czy element nie jest widoczny
       cy.get('.desktop-navbar .search-icon').click(); // kliknięcie w ikonę wyszukiwarki
       cy.get(searchBoxElementId).should('be.visible'); // element powinien się pojawić
       cy.get(searchBoxElementId).type('ansible'); // wpisanie wartości
       cy.get(searchBoxElementId).type('{enter}').then(() => { // symulacja wciśnięcia przycisku enter, aby wysłać formularz
           cy.get('.post-title').should('contain', 'Ansible - jak uporządkować chaos?'); // weryfikacja oczekiwanego efektu
       })
   });
```
Podobnie jak poprzednio, idąc linijka po linijce jesteśmy w stanie łatwo rozczytać co tu się dzieje, nawet bez pomocy komentarzy.

Gdy zajrzymy do źródła strony w przeglądarce, okaże się, że w DOMie jest więcej elementów z klasą `post-title`, a mimo tego test przechodzi poprawnie. Jest to oczekiwane zachowanie - łańcuch komend `get().should()` znajduje wszystkie elementy i sprawdza czy w jakimkolwiek z nich znajduje się podana treść. Gdybyśmy chcieli sprawdzić czy pierwszy element zawiera konkretną wartość, możemy wykorzystać `first()`: 
```javascript
  cy.first('.post-title').should('contain', 'Ansible - jak uporządkować chaos?');
```

# Podsumowanie

Przystępność Cypressa (szczególnie dla web developerów, w związku z silnym zakorzenieniem w ekosystemie JavaScript) i minimum czasu potrzebnego na przygotowanie działającej konfiguracji mogą okazać się kluczowe dla osób szukających nietrudnego sposobu na automatyzację testów. Być może będzie to również okazja dla zrażonych do Selenium, by dać testom E2E drugą szansę.

# Źródła
- <https://docs.cypress.io/>
