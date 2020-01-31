---
layout:    post
title:     Angular APP_INITIALIZER
published: true
date:      2020-02-19 08:00:00 +0100
author:    dmejer
tags:
    - Angular
    - APP_INITIALIZER
---

`APP_INITIALIZER` to wbudowany w Angulara `InjectionToken`.
Dzięki `APP_INITIALIZER` możliwe jest wykonanie funkcji, lub zestawu funkcji, które zostaną wykonane przed uruchomieniem aplikacji (bootstraping).

## Przykład
Prosty przykład wywołania dwóch funkcji przed startem aplikacji:
``` js
export function appInit1() {
  return () => console.log('Hello from APP_INITIALIZER 1!');
}

export function appInit2() {
  return () => console.log('Hello from APP_INITIALIZER 2!');
}

@NgModule({
// (...)
providers: [{
  provide: APP_INITIALIZER,
  useFactory: appInit1,
  multi: true
},
{
  provide: APP_INITIALIZER,
  useFactory: appInit2,
  multi: true
}],
// (...)
})
export class AppModule { }
```
Na kosoli przeglądarki pojawią się poniższe komunikaty:
```
Hello from APP_INITIALIZER 1!
Hello from APP_INITIALIZER 2!
```

## Przykład z Promise
Do `APP_INITIALIZER` można także przekazać funkcje, która zwróci Promise! Angular poczeka, aż wszystkie zwrócone Promise'y zostaną resolve.
```js
export function appInit() {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Hello from APP_INITIALIZER');
      resolve();
    }, 2000);
  })
}

@NgModule({
// (...)
providers: [{
  provide: APP_INITIALIZER,
  useFactory: appInit,
  multi: true
}],
// (...)
})
export class AppModule { }
```
W rezultacie, po 2 sekundach, na konsoli zostanie wyświetlona wiadomość: `Hello from APP_INITIALIZER`.

## Zaawansowany przykład
Do funkcji uruchamianej przed bootstrapem aplikacji, możliwe jest przekazanie serwisu. 
W poniższym przykładzie, aplikacja frontendowa ściąga konfigurację wymaganą do poprawnego działania.
Na backendzie wystawiony jest plik conf.json, serwowany przez http-server.
Interface Configuration jest modelem danych z pliku conf.json, zawiera tylko pole name.
Serwis `AppInitService` wywołuje GET na `/api/conf.json`. 

```js
export interface Configuration {
  name;
}

@Injectable()
export class AppInitService {

  constructor(private httpClient: HttpClient) {
  }

  init(): Promise<Configuration> {
    return this.httpClient.get<Configuration>('api/conf.json')
           .toPromise();
  }
}
```
```js
export function appInit(appInitService: AppInitService) {
  return () => appInitService.init().then(configuration => console.log(configuration));
}

@NgModule({
// (...)
providers: [
  AppInitService,
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [AppInitService],
    multi: true
  }]
// (...)
})
export class AppModule { }
```
Powyższy kod wyświetli na konsoli konfigurację z pliku conf.json.
```
{name: "Test App name"}
```

## Implementacja w Angularze
Przyjrzyjmy się, jak `APP_INITIALIZER` został zaimplementowany w samym Angularze.
W pliku `application_init.ts` znajduje się definicja `InjectionToken`.
```js
export const APP_INITIALIZER = new InjectionToken<Array<() => void>>('Application Initializer');
```
Początek bootstrapowania aplikacji w Angular, wygląda następująco:
##### *`platformRef#bootstrapModuleFactory()`*
``` js
return _callAndReportToErrorHandler(exceptionHandler, ngZone !, () => {
       const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
       initStatus.runInitializers(); // (1)
       return initStatus.donePromise.then(() => {
         this._moduleDoBootstrap(moduleRef); // (2)
         return moduleRef;
       });
```
W punkcie (1) w serwisie ApplicationInitStatus wywołana jest funkcja runInitializers. Po zakończeniu ApplicationInitStatus, Angular przeprowadza bootstrap komponentu.
Metoda runInitializers, sprawdza które wywołania zwróciły Promise i czeka aż wszystkie funkcje zostaną zakończone (resolve).
##### *`ApplicationInitStatus#runInitializers()`*
```js
  runInitializers() {
    // (...)
    const asyncInitPromises: Promise<any>[] = [];

    if (this.appInits) {
      for (let i = 0; i < this.appInits.length; i++) {
        const initResult = this.appInits[i]();
        if (isPromise(initResult)) {
          asyncInitPromises.push(initResult);
        }
      }
    }

    Promise.all(asyncInitPromises).then(() => { complete(); }).catch(e => { this.reject(e); });

    // (...)
  }
```

## Zastosowania
Do czego jeszcze można zastosować `APP_INITIALIZER`?
* Obsługa powiadomień push z serwera (comety)
* Pobranie konfiguracji np. CSRF token
* Monitorowanie aktywności użytkownika
* Keep alive
* Keycloak - polecam świety wpis Michała na ten temat [link](https://blog.consdata.tech/2020/02/05/keycloak-z-angularem-i-keycloakiem.html)

Nawet, jeżeli w swojej aplikacji nie używamy `APP_INITIALIZER`, sam Angular wykorzystuje go do poprawnego działania.
Pryzkłady użycia w Angularze:
* routing (RouterModule), używany jest do poprawnej pracy Guard'ów.  [źródło](https://github.com/angular/angular/blob/e35d9eaa7d5267e9ea4d3fe2b85b88e28aae3f22/packages/router/src/router_module.ts#L510)
* Web Worker (WorkerAppModule)
* ServiceWorkerModule
* NgProbe (BrowserTestingModule). Angular 9 wprowadza [Ivy](https://angular.io/guide/ivy) i mechanizm NgProbe przestanie działać. [źródło](https://github.com/angular/angular/blob/8b88269ae1c0d609e098964e60d08e8472f5aa40/packages/platform-browser/src/dom/debug/ng_probe.ts#L41)
