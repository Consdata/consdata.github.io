---
layout:     post
title:      "Zarządzanie stanem aplikacji frontendowej na przykładzie NgRx"
date:       2021-09-21 6:00:00 +0100
published:  true
didyouknow: false
lang:       pl
author:     mchrapkowicz
image:      
tags:
- frontend
- redux
- state management
- zarzadzanie stanem
- angular
- react
---

## Wprowadzenie
W miarę rozwijania złożonych aplikacji webowych ważnym i nieoczywistym zagadnieniem staje się projektowanie przepływu informacji pomiędzy komponentami. Często mamy do czynienia z wieloma źródłami danych - mogą to być na przykład najróżniejsze zewnętrzne serwisy, czy polecenia wprowadzane przez użytkownika. Podstawowym rozwiązaniem jest przekazywanie tych danych przy pomocy rozwiązań dostarczanych przez wykorzystywany framework (na przykład data binding w Angularze), jednak bardzo łatwo można wyobrazić sobie sytuację, w której informacje, z których chcemy skorzystać znajdują się w zupełnie innej części aplikacji, a przed nami stoi zadanie „przepchania" ich aż do interesującego nas miejsca. Jest to oczywiście rozwiązanie nieskalowalne, trudne w utrzymaniu i niezbyt eleganckie.

Z pomocą przychodzą narzędzia pomagające w agregowaniu danych pochodzących z różnych źródeł do jednego, globalnego stanu, dostępnego z każdego miejsca aplikacji. Zwiększa to przewidywalność danych, pozwala łatwo testować zachowanie aplikacji, jak również umożliwia łatwe jej skalowanie. W tym wpisie postaram się nieco przybliżyć architekturę Redux wykorzystującą koncepcję globalnego stanu oraz pokażę przykład jej zastosowania w bibliotece NgRx. 

### Czy na pewno potrzebujesz osobnej biblioteki?
Zanim zaczniemy chciałbym jeszcze zwrócić uwagę, że nie każda aplikacja jest tak rozbudowana i złożona, żeby potrzebować całego mechanizmu zarzadzania stanem. W ustaleniu czy tak jest pomaga zasada SHARI zaprezentowana chociażby w oficjalnej dokumentacji NgRx. Warto sobie odpowiedzieć, czy potrzebujemy stanu, który jest:
- *S*hared - współdzielony pomiędzy wiele komponentów i serwisów.
- *H*ydrated - trwały i z możliwością ponownego zasilenia z zewnętrznego źródła.
- *A*vailable - dostępny przy ponownym wejściu w określoną ścieżkę.
- *R*etrieved - 
- *I*mpacted - 


## Architektura Redux
Kilka słów i obrazków pokazujących reduxowe spojrzenie na świat (opis store, akcji, reducerów, selektorów i efektów, ale tylko w teorii)

## Implementacja Redux w NgRx
Mięsko, to znaczy snippety kodu, w których chcę pokazać zasadę działania na prostym przykładzie wykorzystującym jakieś dwa źródła prawdy i pchający informacje do store, żeby potem wyświetlać je użytkownikowi. Cel: pokazanie elementów architektury z poprzedniego punktu w akcji

## Inne podejścia
Spoko byłoby wspomnieć, że istnieją inne rozwiązania niż NgRx, a nawet inne architektury, niż Redux i myślę, że to będzie dobre miejsce na kilka linków.

## Podsumowanie
Wysnucie wniosków z pokazanego przykładu, podsumowanie "do's and dont's", link do repo z projektem, podziękowania i oklaski.
