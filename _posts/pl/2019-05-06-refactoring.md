---
layout:    post
title:     "Przykłady refaktoryzacji na podstawie książki Martina Fowlera i Kenta Becka 'Refactoring'"
published: true
lang: pl
date:      2019-05-06 9:15:00 +0100
author:    sucuncu
image:     /assets/img/posts/2019-05-06-refactoring/refactoring.jpg
tags:
    - refaktoryzacja
    - javascript
---

Książka "Refactoring" Martina Fowlera i Kenta Becka została po raz pierwszy wydana w 1999 roku i często określana jest jako pozycja wybitna, ponadczasowa, jako must read każdego programisty. 
Dodatkowo w tym roku wyszła jej druga edycja. Po co? 

Martin podkreśla przecież, że notatki z lat dziewięćdziesiątych, które tworzył i ogólnie zasady refaktoryzacji wciąż są aktualne i wciąż sam ich używa. Mimo to wszystkie jej rozdziały zostały przepisane, a przede wszystkim zmienił się język wykorzystany w przykładach - wtedy wybrali Javę, tym razem postawili na JavaScript.

Dominująca część tej pozycji to katalog reguł refaktoryzacji wraz z motywacją, sposobem jej wykonania i oczywiście kodem. 
Zanim jednak tam dotrzemy, Fowler próbuje wytłumaczyć, po co w ogóle refaktoryzować i kiedy to robić.
I to, co najbardziej wyniosłam z tej lektury to podejście, które przewija się w niej bardzo często: mianowicie, że refaktoryzacja powinna być "częścią naturalnego flow programisty". 

Gdy podchodzimy do zadania, chcemy dodać nową funkcjonalność, powinniśmy móc ją wprowadzić w zastany kod w sposób łatwy i ładny. Jeśli jednak jego stan nam na to nie pozwala, może powinniśmy pokusić się o jego reorganizację, tak żebyśmy mogli później szybko i bez wyrzutów sumienia wprowadzać zmiany. Bardzo trafnie opisuje to cytat:

<blockquote>"It's like I want to go 100 miles east but instead of just traipsing through the woods, I'm going to drive 20 miles north to the highway and then I'm going to go 100 miles east at three times the speed I could have if I just went straight there. When people are pushing you to just go straight there, sometimes you need to say 'Wait, I need to check the map and find the quickest route'."</blockquote>
Zanim przejdziemy do przykładów, jeszcze jedna motywacja, czyli to, jak określa sam siebie Kent Beck: 

<blockquote>"I'm not a great programmer. I'm just a good programmer with great habits."</blockquote>

## Przykład pierwszy

```typescript
function solveIdealRocketEquation(specificImpulse, initialMass, finalMass) {
	const exhaustVelocity = specificImpulse * 9.81;
	const massFraction = initialMass/finalMass;
	return exhaustVelocity * Math.log(massFraction)
}
```
Refaktor powyższego przykładu rozpoczniemy od zastosowania wyodrębnienia metod (Extract Function).

```typescript
function solveIdealRocketEquation(specificImpulse, initialMass, finalMass) {
	const exhaustVelocity = specificImpulse * 9.81;
	const massFraction = initialMass/finalMass;
	return calculateVelocity(exhaustVelocity, massFraction)
}

function calculateVelocity(exhaustVelocity, massFraction){
	return exhaustVelocity * Math.log(massFraction)
}
```

Następnie wprowadzimy strukturę służącą do komunikacji (Introduce Parameter Object).

```typescript
function solveIdealRocketEquation(specificImpulse, initialMass, finalMass) {
	const exhaustVelocity = specificImpulse * 9.81;
	const massFraction = initialMass/finalMass;
	const velocityData = {exhaustVelocity: exhaustVelocity, massFraction: massFraction}
	return calculateVelocity(velocityData)
}

function calculateVelocity(velocityData){
	return velocityData.exhaustVelocity * Math.log(velocityData.massFraction)
}
```

I z tak posprzątanymi parametrami, możemy wydzielić dwie, niezależne fazy naszych obliczeń (Split Phase).
```typescript
function solveIdealRocketEquation(specificImpulse, initialMass, finalMass) {
	const velocityData = calculateVelocityData(specificImpulse, initialMass, finalMass)
	return calculateVelocity(velocityData)
}

function calculateVelocity(velocityData){
	return velocityData.exhaustVelocity * Math.log(velocityData.massFraction)
}

function calculateVelocityData(specificImpulse, initialMass, finalMass){
	const exhaustVelocity = specificImpulse * 9.81;
	const massFraction = initialMass/finalMass;
	return {exhaustVelocity: exhaustVelocity, massFraction: massFraction}
}
```

## Przykład drugi


```typescript
function aggregateStarsData(stars){
    let highestTemperature = stars[0] ? stars[0].temperature : 0;
    let totalMass = 0;
    for (const s of stars) {
	    if (s.temperature > highestTemperature) {
		highestTemperature = s.temperature
	    }
	totalMass += s.mass
    }
    return {highestTemperature: highestTemperature, totalMass: totalMass}
}
```
W powyższym przykładzie obliczamy łączną masę gwiazd oraz znajdujemy gwiazdę, której temperatura jest najwyższa. Wyliczenia te przetwarzane są w tej samej pętli, chociaż są od siebie niezależne. Minusem tego podejścia jest to, że za każdym razem, gdy będziemy chcieli taką pętlę zmodyfikować, będziemy musieli zrozumieć obie te rzeczy. Podzielmy ją więc na dwie, tak abyśmy mogli próbować zrozumieć tylko tę część, którą musimy zmodyfikować (Split Loop).
```typescript
function aggregateStarsData(stars){
    let highestTemperature = stars[0] ? stars[0].temperature : 0;
    for (const s of stars) {
	    if (s.temperature > highestTemperature) {
		    highestTemperature = s.temperature
	    }
    }
    let totalMass = 0;
        for (const s of stars) {
	        totalMass += s.mass
    }
    return {highestTemperature: highestTemperature, totalMass: totalMass}
}
```

Następnie powydzielajmy metody (Extract Function).
```typescript
function aggregateStarsData(stars){
	return {highestTemperature: highestTemperature(stars), totalMass: totalMass(stars)}
}

function highestTemperature(stars){
	let highestTemperature = stars[0] ? stars[0].temperature : 0;
	for (const s of stars) {
		if (s.temperature > highestTemperature) {
			highestTemperature = s.temperature
		}
	}
	return highestTemperature;
}

function totalMass(stars){
	let totalMass = 0;
	for (const s of stars) {
		totalMass += s.mass
	}
	return totalMass;
}

```
I użyjmy jeszcze dwóch metod refaktoryzacji: Replace Loop with Pipeline oraz Subsitute Algorithm. 
```typescript
function aggregateStarsData(stars){
	return {highestTemperature: highestTemperature(stars), totalMass: totalMass(stars)}
}

function highestTemperature(stars){
    return Math.max(...stars.map(s=> s.temperature))
}

function totalMass(stars){
    return stars.reduce((totalMass, s) => totalMass += s.mass, 0);
}
```

## Podsumowanie

"Refactoring" Fowlera i Becka to książka, którą na pewno docenią osoby, które pracują przy dużych i długofalowych projektach. Wtedy bowiem potrzeba refaktorowania jest bezdyskusyjna, jednak jest on czasochłonny i ryzykowny. Łatwo wpaść w pułapkę, w której zmiany, które dodajemy, wprowadzają bałagan do kodu i tłumaczone są pośpiechem. Jednak czas, który zaoszczędzimy przy jej dodawaniu, zostanie zjedzony w całości, a pewnie i przekroczony, gdy kolejna osoba będzie musiała wejść w nasze klasy i zrozumieć, jak to właściwie działa.

Podejdźmy więc do problemu zdrowo i po prostu - zawsze zostawiajmy kod choć odrobinę lepszym, niż ten który zastaliśmy;)
