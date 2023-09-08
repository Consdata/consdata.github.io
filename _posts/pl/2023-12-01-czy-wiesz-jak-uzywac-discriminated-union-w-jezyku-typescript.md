---
layout:    post
title:     "Czy wiesz jak używać discriminated union w języku TypeScript?"
date:      2023-12-01T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: kczechowski
image: /assets/img/posts/2023-12-01-czy-wiesz-jak-uzywac-discriminated-union-w-jezyku-typescript/code.webp
description: "Discriminated union  to połączenie takich typów, z których każdy posiada jedno wspólne pole, po którym możemy określić, z którym z nich mamy do czynienia..."
tags:
- typescript
- discriminated union
- literal type
---
Discriminated union (pol. *unia dyskryminacyjna*) to połączenie takich typów, z których każdy posiada jedno wspólne pole, po którym możemy określić, z którym z nich mamy do czynienia. Zgodnie z ogólnie przyjętą konwencją jest to pole `type`, które jest typu **Literal Type**, czyli jego typ opisuje się za pomocą stringa.

Zdefiniujmy unię dyskryminacyjną oraz funkcję anonimową przypisaną do `getPrice` rozpoznającą jej typ i wykonującą zależny od niego kod:
```typescript
type Invoice = {
  type: 'INVOICE',
  number: string,
  date: Date
  positions: {
    name: string
    price: number
    quantity: number
  }[],
   
}
 
type Bill = {
  type: 'BILL',
  date: Date,
  totalPrice: number
}
 
type CompanyPurchase = Invoice | Bill;
 
const getPrice = (purchase: CompanyPurchase): number => {
  switch(purchase.type) {
    case 'INVOICE':
      return purchase.positions.reduce((acc, item) => acc + item.price * item.quantity, 0);
    case 'BILL':
      return purchase.totalPrice;
    default:
      return 0;
  }
}
```
Typy `Invoice` oraz `Bill` mają wspólne pole `type`. Dzięki zastosowaniu unii dyskryminacyjnej TypeScript sam rozpoznaje konkretny typ parametru `purchase` w funkcji anonimowej przypisanej do zmiennej `getPrice`, rzutowania są zbędne.

Przykład działania: [https://www.typescriptlang.org/play#code/C(...)A](https://www.typescriptlang.org/play#code/C4TwDgpgBAkgdgNwPYEsDG0C8UDeBYAKCilEgC4oByGAOQDUB5GAYQFFKAaQ4uAVwFsARhABOFAM7ARKOAHMuRKABMAhsAgUAImojcoYJOJTAUSOOIr5FPFfw1RJ0uXuJhpGCnyGiXUAI68KnAmoJ4CwiJ6AL4A2gC6CsSEUYSEpNAAQigANtlQ2FbE6RSUGTAAMuWceqrqWjqJJEjAKtkACu72XhHJqQTpUMxI-GBBIG28ImgAFiriWLCIqBhQAD5QWbkA3H1oZpJQshDAHegLABRgkzNz9kMjYxNTs-MAlGHeIvkAfLh64gB3YwzS7XF4QAB06Vef2sUDQtyotEYLHYZF8xBEx0mcH0YNuEIMRhM+whWKUvAw53OKjQaA4UGMEH4MMwv1paCgAGpGep+ITOlAAFS85kQgJBEIgBkABleOzhCPmVDKlUo6LhmOxIlxV2eBOAzVapwwCuIxCUEAAZipeNlgBrzebsscoAAPfJ4-XzM1OqBY4A4qAy30pAhRIA)