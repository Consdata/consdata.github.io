---
layout:    post
title:     "Angular - detekcja zmian strategią onPush"
date:      2019-08-08 07:00:00 +0100
published: true
author:    kgabara
tags:
    - angular
    - frontend
---
Każda aplikacja rozwijana odpowiednio długi czas może rozrosnąć się do ogromnych rozmiarów, a konkretniej do sporej liczby komponentów, jeżeli mówimy o aplikacji frontendowej pisanej z wykorzystaniem Angulara. Z czasem przyrost kolejnych funkcjonalności może spowodować, że nasza aplikacja przestanie spełniać oczekiwania odnośnie wydajności. W takim momencie powinniśmy pomyśleć nad możliwościami naprawy tego problemu. W tym artykule pokażemy jedno z możliwych rozwiązań tego problemu - zmiana strategii detekcji zmian.


## Detekcja zmian

Załóżmy, że mamy przed sobą kod aplikacji odpowiedzialnej za zarządzanie hodowlą zwierząt. Przykładowym komponentem odpowiedzialnym za wyświetlanie informacji o krówkach byłby cow-run.component, czyli wybieg krówek, który przekazuje obiekt pojedynczej krówki do cow.component. Z drugiej strony mamy pig-run.component, który spełnia te same założenia co komponent krówek. Przykładowe drzewo komponentów mogłoby wyglądać tak:

<img alt="Zobrazowanie drzewa komponentów" src="/assets/img/posts/2019-05-29-angular-onpush-strategy/components.png" />

Angular dla każdego komponentu tworzy odpowiadający jemu (komponentowi) ChangeDetector. Przejdźmy dalej, czyli jak to działa?

### Jak to działa?
Domyślnie ChangeDetector nasłuchuje na każdą zmianę stanu aplikacji - zmianę inputów, zmianę modelu prezentowanego na templatce, wywołania asynchroniczne, zdarzenia DOM, interwały. Każda taka zmiana powoduje porównanie obecnie prezentowanych w drzewie DOM wartości do tych, które przechowuje komponent - w momencie wykrycia różnic komponent oznaczany jest jako "brudny" - proces ten nazywa się "dirty checking". Następnie dokonywana jest projekcja modelu na drzewo DOM, czyli faktyczne zaktualizowanie widoku.


Detekcja zmian w każdym świeżo utworzonym komponencie ustawiona jest na wartość ChangeDetectionStrategy.Default, co przekłada się na detekcję zmian strategią CheckAlways. Strategia ta sprawia, że podczas każdej zmiany stanu aplikacji - asynchronicznego zapytania wysyłanego do serwera, zdarzenia DOM, interakcji użytkownika z naszą aplikacją sprawdzane jest całe drzewo komponentów. Wyobraźmy sobie sytuację, kiedy zdarzenie DOM zostało wyemitowane przez CowComponent. Angular zanim sprawdziłby komponent, który faktycznie wyemitował zdarzenie, musiałby sprawdzić wszystkie komponenty, zgodnie z utworzonym przez siebie drzewem. Spójrzmy na obrazek:

<img alt="Sprawdzanie komponentów przez mechanizm detekcji zmian" src="/assets/img/posts/2019-05-29-angular-onpush-strategy/change-detection.png" />

Strzałki obrazują kierunek przechodzenia przez drzewo mechanizmu detekcji. Jest to prosty przykład, gdyż drzewo jest bardzo małe. Wyobraźmy sobie jednak drzewo zbudowane z setek komponentów. Z każdą zmianą Angular musiałby na nowo przeszukać całe drzewo komponentów celem znalezienia tego komponentu, który wyemitował zmianę. Dość sporo obliczeń, czyż nie?

## Strategia onPush
Na szczęście Angular pozwala nam na zmianę domyślnej strategii detekcji zmian. Jeżeli nie chcemy korzystać z domyślnego mechanizmu, to na ratunek przychodzi nam strategia onPush! Strategia ta mówi nam, że komponent zależny jest tylko i wyłącznie od swoich inputów. Taki komponent nazywamy "czystym". Zmiana propagowana jest w momencie zmiany referencji inputów komponentu jak i w przypadku wyemitowania zdarzenia DOM w szablonie komponentu (np. kliknięcie w przycisk - event onclick). Co więcej, komponent emitujący zmianę z wykorzystaniem strategii onPush powiadamia mechanizm detekcji Angulara, że to właśnie on wyemitował zmianę! To drastycznie zmniejsza koszt przeszukania drzewa komponentów, gdyż Angular wie, którego komponentu szukać, albo który komponent pominąć. Zdjęcie poniżej pozwoli zobrazować tę sytuację.
<img alt="Sprawdzanie komponentów przez mechanizm detekcji zmian" src="/assets/img/posts/2019-05-29-angular-onpush-strategy/onpush-detection.png" />

### Jak używać?
Używanie takiej strategii wymusza na nas zmiany podejścia odnośnie projektowania naszych komponentów. Inputy czystego komponentu powinny być niezmienialne, co oznacza, że wartości naszych inputów powinny być aktualizowane przez zmianę referencji, a nie wartości. Prosty przykład:
```typescript
@Input() cowDonation: { donation: number };

onClickUpdateDonation() {
    this.cowDonation.donation = 500;
}

```
Powyższa zmiana nie zadziała, ponieważ zmieniamy wartość, a nie referencję. Aby strategia onPush zadziałała, wartość dotacji musimy zmienić poprzez zmianę referencji, czyli przykładowo:
```typescript
@Input() cowDonation: { donation: number };

updateDonation() {
    this.cowDonation = {
        donation: 500
    };
}
```
Zdarzenia DOM są zdarzeniami asynchronicznymi, więc moglibyśmy wyciągnąć wniosek: detekcja zmian zadziała, kiedy użyjemy takich funkcji asynchronicznych jak setTimeout, setInterval albo subskrypcja do Observable'a zwracanego przez serwis HTTP, prawda? Otóż nie. Na szczęście w przypadku bytów typu Observable Angular przychodzi nam z pomocą i udostępnia AsyncPipe. Dlaczego to działa z użyciem AsyncPipe a nie z manualną subskrypcją? Zajrzyjmy więc w kod:
```typescript
_updateLatestValue(async, value) {
    if (async === this._obj) {
        this._latestValue = value;
        this._ref.markForCheck();
    }
}
```
Jak widać powyżej, w momencie aktualizacji wartości wywoływana jest funkcja markForCheck(), która powiadamia mechanizm detekcji zmian o konieczności sprawdzenia danego komponentu.

## Przejęcie kontroli nad mechanizmem detekcji zmian
Co w przypadku, gdy bardzo potrzebujemy użyć funkcji setInterval lub setTimeout, ale jednocześnie chcielibyśmy również używać strategii onPush? Angular daje nam możliwość wstrzyknięcia dedykowanego ChangeDetectora danemu komponentowi, a potem wywołanie na nim funkcji markForCheck() - analogicznie jak w opisywanym przykładzie z AsyncPipe!
Przykładowy kod wyglądałby tak:

```typescript
constructor(private cowService: CowService, private changeDetectorRef: ChangeDetectorRef) {
    this.updateCowDonationWithTimeout();
}

private updateCowDonationWithTimeout() {
    setTimeout(() => {
        this.cowDonation = {
            donation: 500
        };
        this.changeDetectorRef.markForCheck();
    }, 500);
}
```
Przy stworzeniu komponentu zostanie wywołana funkcja zmieniająca wartość dotacji dla krowy na 500 po upływie około 500ms, a wszystko dzięki wywołaniu markForCheck() na referencji do detektora zmian komponentu.

## Na co należy uważać?
Przypomnijmy, że przy korzystaniu ze strategii onPush musimy pamiętać o tym, że:
- zmiany inputów komponentu muszą zachodzić poprzez zmianę referencji, a nie wartości!
- funkcje asynchroniczne (setTimeout, setInterval, manualna subskrypcja do Observable'a) nie wywołują mechanizmu detekcji zmian.

## Kilka słów na zakończenie 
OnPush wymusza na nas projektowanie komponentów w określony sposób - tak, żeby komponent odpowiedzialny był jedynie za prezentację danych na podstawie otrzymanych inputów. Cała skomplikowana logika mogłaby wtedy być przeniesiona do serwisów. Przeniesienie logiki do serwisu umożliwiłoby też łatwiejsze otestowanie kodu - fajnie jest mieć jakieś potwierdzenie, że nasz kod robi to, co powinien :). Pisanie komponentów niezmienialnych (ang. immutable) i ogółem kodu opartego na niezmienialności to tworzenie dobrych przyzwyczajeń, które mogą być wykorzystane przy adaptacji nowych rozwiązań w projekcie - przykładowo kontrolowanie stanu z wykorzystaniem biblioteki ngRx, która również wymusza na programistach pisanie kodu opartego na niezmienialności. Stosowanie strategii onPush z pewnością może zwiększyć wydajność aplikacji, choć zalecałbym korzystanie z tej strategii w nowo tworzonych komponentach, pisanych od początku z myślą o niezmienialności. Wprowadzanie onPush'a na siłę do już istniejących, czasami mocno rozbudowanych komponentów może doprowadzić do niepożądanych zachowań (a w tym przypadku braku reakcji na zmiany :P), więc trzeba wziąć to pod uwagę adaptując tę strategię do już istniejącego kodu.
