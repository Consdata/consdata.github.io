---
layout:    post
title:     "Czy wiesz, że Angular 21 rozszerza API formularzy o Signal Forms?"
description: Wraz z publikacją Angulara w wersji 21 opracowano nowy system definicji formularzy za pomocą sygnałów.
date:      2026-04-24T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: wkulczak
image: /assets/img/posts/2026-04-24-czy-wiesz-ze-angular-21-rozszerza-api-formularzy-o-signal-forms/thumbnail.webp
tags:
- angular
- signals
---

Wraz z publikacją Angulara w wersji 21 opracowano nowy system definicji formularzy za pomocą sygnałów, 
dostępny w pakiecie @angular/forms/signals. Choć jest to obecnie funkcja eksperymentalna, 
wyraźnie wyznacza przyszły kierunek rozwoju frameworka.

To rozwiązanie pozwala na scentralizowany kod, lepsze wsparcie typowania, prostsze definicje własnych komponentów i przejrzystą walidację.

## Dlaczego Signal Forms? Różnica w podejściu do danych
Signal Forms stanowią zmianę paradygmatu w porównaniu do Template-Driven Forms i Reactive Forms. Kluczowe zasady to:

1. **Model jako źródło prawdy**: zamiast wydobywać dane z wewnętrznych struktur frameworka, to Ty dostarczasz własny sygnał, który formularz jedynie odzwierciedla i synchronizuje.
2. **Deklaratywna logika**: logika walidacji jest opisywana w schemacie.
3. **Strukturalne mapowanie**: struktura pól odzwierciedla model danych w stosunku 1:1, a struktura formularza jest automatycznie wyprowadzana z modelu danych.
W tym podejściu formularz to hierarchia pól, z której automatycznie **wyprowadzany jest stan** (błędy, stan disabled, touched itp.).
**Kluczowa różnica**: w Signal Forms model formularza jest **źródłem prawdy** (source of truth), a nie **wynikiem** (output).

**Korzyści w pigułce**:
- **Brak boilerplate'u**: drastyczna redukcja kodu.
- **Silne typowanie**: wyprowadzane jest z modelu.
- **Automatyczne dwukierunkowe wiązanie**: za pomocą dyrektywy `[field]`.
- **Brak subskrypcji**: wykorzystanie wbudowanej reaktywności sygnałów.

## Tworzenie formularza
Rekomendowanym sposobem definiowania formularza jest powiązanie go z dedykowanym interfejsem.

```typescript
export interface UserAccountRegistration {
    email: string;
    password: {
        pw1: string;
        pw2: string;
    }
}
```

```typescript
protected readonly userAccountRegistration = signal(userAccountRegistrationInitValue) // Źródło prawdy
protected readonly userAccountRegistrationForm = form(this.userAccountRegistration, registrationValidationSchema);
```

Metoda `form(model, schema)` tworzy `FieldTree` (drzewo pól), które odzwierciedla model danych. 
Aby uzyskać aktualny stan i wartość danego pola, wywołujemy je jako funkcję, otrzymując `FieldState` (np. `form.email().value()`).

### Komponenty w szablonie
Do połączenia pól formularza z szablonem używamy dyrektywy **Field**.

```html
<input type="email" [field]="userAccountRegistrationForm.email" />
```

### Komponenty formularza (Custom controls)
Tworzenie własnych komponentów formularza jest znacząco przyjemniejsze do implementacji niż w Reactive Forms, gdzie wymagany był `ControlValueAccessor`.

Aby tworzony komponent mógł być użyty jako pole formularza z dyrektywą `[field]`, należy zaimplementować jeden z dedykowanych interfejsów:

1. `FormValueControl<T>`: dla większości pól edytujących pojedynczą wartość (np. pole tekstowe, wybór daty).
2. `FormCheckboxControl`: dla kontrolek typu checkbox lub toggle, które reprezentują stan boolean (w tym przypadku wymagana jest właściwość checked zamiast value).
Oba interfejsy dziedziczą z `FormUiControl` i wymagają jedynie, aby komponent udostępniał właściwość **value** (lub checked) jako `ModelSignal`.

```typescript
@Component({
    selector: 'app-password-strength',
    // ...
})
// Wymagana jest implementacja FormValueControl
export class PasswordStrength implements FormValueControl<string> {
    // Właściwość 'value' musi być model signal. Model signal to połączenie input i output.
    readonly value = model('');
    // Opcjonalne: synchronizacja stanu formularza
    readonly invalid = input<boolean>(false);
    readonly touched = model<boolean>(false);
    readonly label = input('Password');
 
    protected changeInput(input: Event) {
        const target = input.target as HTMLInputElement;
        // Zmiana wartości poprzez set() automatycznie synchronizuje stan z modelem formularza.
        this.value.set(target.value);
    }
 
    protected markAsTouched() {
        this.touched.set(true);
    }
}
```

Dyrektywa `[field]` automatycznie łączy ten model z modelem formularza i przekazuje stany takie jak disabled, invalid, 
required i errors jako opcjonalne sygnały `input()` do komponentu.

## Walidacje: schemat deklaratywny

Walidacje tworzone są za pomocą metody schema, a następnie przekazywane do metody form. Schemat jest definiowany deklaratywnie w jednym miejscu.

Biblioteka wyposażona jest w szereg wbudowanych funkcji walidacyjnych, takich jak `email`, `required`, `minLength`, `maxLength`, `min`, `max` i `pattern`.

```typescript
export const registrationValidationSchema = schema<UserAccountRegistration>((schemaPath) => {
  required(schemaPath.email, {message: 'Email is required'});
  email(schemaPath.email, {message: 'Invalid email address'});
  required(schemaPath.password.pw1, {message: 'Password is required'});
  minLength(schemaPath.password.pw1, 4, {message: 'Password must be at least 4 characters long'})...
}
```

### Walidacja międzypolowa (validateTree)

Możliwe jest powiązanie walidatorów z innymi polami formularza, co jest niezbędne np. do sprawdzania zgodności haseł. Używamy do tego funkcji `validateTree()`.

```typescript
validateTree(schemaPath.password, (ctx) => {
    return ctx.value().pw2 === ctx.value().pw1
        ? undefined
        : {
            field: ctx.field.pw2, // Przypisanie błędu do konkretnego pola
            kind: 'confirmationPassword',
            message: 'Entered password must match with the one specified above'
        }
});
```

### Walidacja asynchroniczna (validateAsync)

Signal Forms wspierają walidację asynchroniczną (np. sprawdzanie dostępności nazwy użytkownika lub e-maila na serwerze) za pomocą `validateAsync`.

```typescript
export const registrationValidationSchema= schema((schemaPath) => {
    ...
    // Przykład walidacji asynchronicznej
    validateAsync(schemaPath.email, {
        params: ({value}) => value(),
        factory: (params) => {
            const registrationService = inject(RegistrationService);
            return resource({
                params,
                loader: async({params}) => {
                    return await registrationService.checkEmailTaken(params)
                }
            });
        },
        onSuccess: (result) => {
            return result ? {
                kind: 'mailTaken',
                message: 'Mail address is already taken. Please choose another one.'
            } : undefined
        },
        onError: () => undefined
    });
});
```

Podczas oczekiwania na wynik walidacji asynchronicznej pole ma ustawiony stan `pending()` na true, co można wykorzystać do wyświetlania informacji zwrotnej w UI.

### Walidacja warunkowa i kontrola stanu

Możemy warunkowo stosować schematy lub kontrolować stan pól (`disabled`, `hidden`, `readonly`) w oparciu o inne wartości w formularzu, używając `applyWhenValue` lub `applyWhen`.

Przykłady kontroli stanu pól:

- Wyłączanie (Disabling):
```typescript
disabled(schemaPath.newsletterTopics, (ctx) => !ctx.valueOf(schemaPath.newsletter));
```
Warto dodać, że w Signal Forms możemy zwracać powód wyłączenia. Powody te są dostępne przez sygnał `disabledReasons()`.

- Ukrywanie (Hiding):
```typescript
hidden(schemaPath.someField, (ctx) => !ctx.valueOf(schemaPath.otherField));
```

Przykładowe użycie:
```typescript
applyWhen(schemaPath, (ctx) => ctx.value().newsletter, (schemaPathWhenTrue) => {
  required(schemaPathWhenTrue.newsletterFrequency, {message: 'Select a frequency'});
})
```

### Debouncing (opóźnianie aktualizacji)

Aby zapobiec nadmiernej liczbie wywołań API podczas szybkiego wpisywania (np. w walidacji asynchronicznej), możemy łatwo zastosować debouncing za pomocą funkcji `debounce()`:

```typescript
// Opóźnienie aktualizacji wartości pola email o 500ms
debounce(schemaPath.email, 500);
validateAsync(schemaPath.email, { ... });
```

Dzięki temu aktualizacje do modelu i walidatory asynchroniczne są uruchamiane dopiero po ustaniu pisania na dany czas.

### Integracja z zewnętrznymi schematami

Zespół Angular umożliwił również walidację za pomocą zewnętrznych bibliotek implementujących reguły walidacyjne w oparciu o **Standard Schema** (np. Zod czy Valibot). 
Odbywa się to za pomocą helpera `validateStandardSchema`.

```typescript
import {z} from 'zod';
validateStandardSchema(schemaPath.phoneNumber, z.e164("Not a phone number!"))
```

## Zarządzanie stanem wysyłania i błędami serwera

Do obsługi wysyłania formularza (szczególnie w przypadku operacji asynchronicznych) zaleca się użycie dedykowanej funkcji `submit()`.

Funkcja `submit()` automatycznie zarządza stanem `submitting()` (dostępnym jako sygnał: `form().submitting()`).

Jeśli podczas zapisu wystąpią błędy serwera, możemy je przypisać z powrotem do konkretnych pól formularza lub do całego formularza, zwracając tablicę obiektów `ValidationErrorWithField`.

```typescript
protected submitForm() {
    submit(this.registrationForm, async (form) => {
        const errors: ValidationErrorWithField[] = [];
        try {
            await this.#registrationService.registerUser(form().value);
        } catch (e) {
            // Przypisanie błędu do konkretnego pola
            errors.push({
                field: form.username,
                kind: 'serverValidation',
                message: 'Username is not available.'
            });
        }
        return errors; // Zwrócone błędy serwera są automatycznie dodawane do stanu formularza.
    });
    return false;
}
```

Dzięki Signal Forms w znacznie prostszy sposób można implementować złożone reguły walidacyjne (np. asynchroniczne czy międzypolowe) w jednym, centralnym schemacie.

Ten nowy, reaktywny model znacząco redukuje boilerplate i gwarantuje silne typowanie - cechy, których brakowało w tradycyjnych Reactive Forms.
Choć Signal Forms pozostają funkcją eksperymentalną w Angular v21, stanowią optymalny wybór dla nowych projektów opartych na sygnałach, 
oferując lepsze doświadczenie deweloperskie i fine-grained reactivity.

## Stan Signal Forms i podsumowanie
Signal Forms (dostępne w @angular/forms/signals) zostały wprowadzone w Angular v21 jako funkcja eksperymentalna.
Oznacza to, że API i funkcjonalność mogą ulec zmianie w przyszłych wydaniach, zanim zostaną ustabilizowane.

Mimo to zespół Angulara rekomenduje Signal Forms do nowych projektów.
Co ważne, nowy model reaktywny z Signal Forms rozwiązuje wiele problemów związanych z Reactive Forms:

| Obszar              | Reactive Forms                             | Signal Forms                                |
|---------------------|--------------------------------------------|---------------------------------------------|
| **Boilerplate**     | Duży (FormGroup, FormControl, FormBuilder) | Bardzo niski (czysty model + schema)        |
| **Typowanie**       | Wymaga jawnych typów lub Typed Forms       | Silne, wyprowadzane z modelu                |
| **Reaktywność**     | Oparta na Observables (subskrypcje)        | Oparta na Signals (Fine-grained reactivity) |
| **Custom Controls** | Wymaga ControlValueAccessor                | Wymaga FormValueControl (znacznie prostsze) |
| **Źródło prawdy**   | Hierarchia FormControl/FormGroup           | Writable Signal Model (dane użytkownika)    |

<br>
Signal Forms demonstrują, w jakim kierunku ewoluuje Angular.
Po Template-Driven Forms i Reactive Forms, Signal Forms stanowią **trzecie główne podejście** do obsługi formularzy w Angularze,
zaprojektowane tak, aby były bardziej bezpieczne pod kątem typowania, reaktywne i deklaratywne.

CodeSandbox: https://codesandbox.io/p/github/wkulczi/ngsignals/master