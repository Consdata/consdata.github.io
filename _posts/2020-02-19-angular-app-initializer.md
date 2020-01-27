---
layout:    post
title:     Angular APP_INITIALIZER
published: true
date:      2020-02-19 08:00:00 +0100
author:    dmejer
tags:
    - Angular
    - APP_INITIALIZER
    - Angular init
---

## Wprowadzenie
`APP_INITIALIZER` to wbudowany `InjectionToken` w Angulara. Dzięki niemu, możliwe, jest wykonanie funkcji lub zestawu funkcji, które zostaną wykonane przed uruchomieniem applikacji.

## Przykłady
Prosty przykład:
``` js
export function appInit1() {
  return () => console.log('Hello from APP_INITIALIZER 1!');
}

export function appInit2() {
  return () => console.log('Hello from APP_INITIALIZER 2!');
}
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
```
Rezultat:
```
// Hello from APP_INITIALIZER 1!
// Hello from APP_INITIALIZER 2!
```

Ok, mało praktyczny przykład. Co jeszcze można zrobić? Do `APP_INITIALIZER` można także przekazać funkcje, która zwróci Promise! Angular poczeka, aż wszystkie funkcje zostaną resolve.
```js
export function appInit() {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Hello from APP_INITIALIZER');
      resolve();
    }, 2000);
  })
}
// (...)
providers: [{
  provide: APP_INITIALIZER,
  useFactory: appInit1,
  multi: true
}],
// (...)
```
Rezultatem będzie wyświetlenie na konsoli wiadomości po 2 sekundach.
Ponadto, możliwe jest także, przekazanie serwisów do naszej funkcjonalności.
Serwis `AppInitService` wywoła get na `/api/conf.json`. Na backend wystawiłem sobie plik conf.json, serwowany przez static [link].
```js
export interface Configuration {
  name;
}

@Injectable()
export class AppInitService {

  constructor(private httpClient: HttpClient) {
  }

  init(): Promise<Configuration> {
    return this.httpClient.get<Configuration>( 'api/conf.json')
           .toPromise();
  }
}
```

```js
export function appInit(appInitService: AppInitService) {
  return () => appInitService.init().then(configuration => console.log(configuration));
}

providers: [
  AppInitService,
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [AppInitService],
    multi: true
  }],
```
Powyższy kod wyświetli na konsoli konfigurację dla powyższej aplikacji.
```
{name: "Test App name"}
```

## Kody w Angularze
No dobrze, a jak to działa "pod maską"?
`APP_INITIALIZER` to po prostu `InjectionToken`.
##### *`application_init.ts`*
```js
export const APP_INITIALIZER = new InjectionToken<Array<() => void>>('Application Initializer');
```

##### *`platformRef#bootstrapModuleFactory()`*
``` js
return _callAndReportToErrorHandler(exceptionHandler, ngZone !, () => {
       const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
       initStatus.runInitializers(); // w tym momencie, serwis ApplicationInitStatus, wykonuje wszystkie funkcje, które dostarczyliśmy przez APP_INITIALIZER
       return initStatus.donePromise.then(() => {
         this._moduleDoBootstrap(moduleRef); // a teraz bootstrap
         return moduleRef;
       });
```

##### *`ApplicationInitStatus#runInitializers()`*
```js
runInitializers() {
    // (...)
    const asyncInitPromises: Promise<any>[] = [];

    Promise.all(asyncInitPromises).then(() => { complete(); }).catch(e => { this.reject(e); });

    // (...)
  }
```

Nawet, jeżeli w swojej aplikacji nie używamy `APP_INITIALIZER`. To sam Angular tego używa!
* routing (RouterModule) [as|https://github.com/angular/angular/blob/e35d9eaa7d5267e9ea4d3fe2b85b88e28aae3f22/packages/router/src/router_module.ts#L510]
  * First, we start the navigation in a `APP_INITIALIZER` to block the bootstrap if
* a resolver or a guard executes asynchronously.


* Web Worker (WorkerAppModule)
* ServiceWorkerModule
* ng Probe (BrowserTestingModule)(z aktualizacja Angular9 zostanie wyrzucone.)
/**
 * In Ivy, we don't support NgProbe because we have our own set of testing utilities
 * with more robust functionality.
 *
 * We shouldn't bring in NgProbe because it prevents DebugNode and friends from
 * tree-shaking properly.
 */

SERVER_TRANSITION_PROVIDERS

*
## Zastosowania
Do czego można jeszcze zastosować `APP_INITIALIZER`? Keycloak, inicjalizacja atmopshere.js, pobranie konfiguracji, która jest wymagana do poprawnego działania aplikacji
* Keycloak
* obsługa powiadomień z serwera (comety)
* pobranie konfiguracji np. CSRF token
* monitorowanie aktywności użytkownika
* keep alive
