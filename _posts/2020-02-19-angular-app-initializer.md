---
layout:    post
title:     Angular APP_INITIALIZER
published: true
date:      2020-02-19 08:00:00 +0100
author:    dmejer
tags:
    - Angular
    - APP_INITIALIZER
    - InjectionToken
---

`APP_INITIALIZER` to jeden z wielu wbudowanych w Angulara `InjectionToken`.
`InjectionToken` to token, pod który można zarejestrować wartość, funkcję albo serwis. Taką wartość, można wstrzyknąć do komponentu lub serwisu.
Przykład zdefiniowania `MY_TOKEN`:
```js
export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');
```
Zarejestrowanie wartości `Hello from MY_TOKEN` pod `MY_TOKEN`:
```js
@NgModule({
// (...)
providers: [{
  provide: MY_TOKEN,
  useValue: 'Hello from MY_TOKEN',
}]
// (...)
})
export class AppModule { }
```
Wstrzyknięcie wartości `MY_TOKEN` do serwisu:
```js
@Injectable()
export class MyService {

  constructor(@Inject(MY_TOKEN) public value: string) { 
    console.log(value);
  }

}
```
Natomiast, dzięki tokenowny `APP_INITIALIZER`, możliwe jest wykonanie funkcji, lub zestawu funkcji, które zostaną wykonane przed uruchomieniem aplikacji (bootstraping).

## Przykład
Prosty przykład wywołania dwóch funkcji przed startem aplikacji:
``` js
export function appInit1() {
  return () => console.log('Hello from appInit1!');
}

export function appInit2() {
  return () => console.log('Hello from appInit2!');
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
W konsoli przeglądarki pojawią się poniższe komunikaty:
```
Hello from appInit1!
Hello from appInit2!
```

## Przykład z Promise
Do `APP_INITIALIZER` można także przekazać funkcję, która zwróci Promise! Angular poczeka, aż wszystkie zwrócone Promise'y zostaną rozwiązane (resolved).
```js
export function appInit() {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Hello from appInit');
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
W rezultacie, po 2 sekundach, w konsoli zostanie wyświetlona wiadomość: `Hello from appInit`.

## Zaawansowany przykład
Do funkcji uruchamianej przed bootstrapem aplikacji, możliwe jest wstrzyknięcie serwisu.
W poniższym przykładzie, aplikacja frontendowa ściąga konfigurację wymaganą do poprawnego działania.
Na backendzie wystawiony jest plik conf.json, serwowany przez http-server.
Interface Configuration jest modelem danych z pliku conf.json, zawiera tylko pole name.
Serwis `AppInitService` wywołuje żądanie typu GET na `/api/conf.json`.

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
Powyższy kod wyświetli w konsoli konfigurację z pliku conf.json.
```
{name: "Test App name"}
```

## Implementacja w Angularze
Przyjrzyjmy się teraz, w jaki sposób `APP_INITIALIZER` został zaimplementowany w samym Angularze.
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
Metoda runInitializers sprawdza, które wywołania zwróciły Promise i czeka aż wszystkie funkcje zostaną zakończone (resolve).

## Zastosowania
Do czego można zastosować `APP_INITIALIZER`?
* Obsługa powiadomień push z serwera (comety)
* Pobranie konfiguracji np. CSRF token
* Monitorowanie aktywności użytkownika
* Keep alive
* Keycloak - polecam świetny wpis Michała Hoji na ten temat [źródło](https://blog.consdata.tech/2020/02/01/keycloak-uwierzytelnianie-autoryzacja-springboot-angular.html)

Nawet, jeżeli w swojej aplikacji nie używamy `APP_INITIALIZER`, sam Angular wykorzystuje go do poprawnego działania.
Przykłady użycia w Angularze:
* Routing (RouterModule), używany jest do poprawnej pracy Guard'ów.  [źródło](https://github.com/angular/angular/blob/e35d9eaa7d5267e9ea4d3fe2b85b88e28aae3f22/packages/router/src/router_module.ts#L510)
* Web Worker (WorkerAppModule) [źródło](https://github.com/angular/angular/blob/8.2.x/packages/docs/web_workers/web_workers.md)
* ServiceWorkerModule [źródło](https://github.com/angular/angular/blob/8b88269ae1c0d609e098964e60d08e8472f5aa40/packages/service-worker/src/module.ts#L161)
* NgProbe. Angular 9 wprowadza [Ivy](https://angular.io/guide/ivy) i mechanizm NgProbe przestanie działać. [źródło](https://github.com/angular/angular/blob/8b88269ae1c0d609e098964e60d08e8472f5aa40/packages/platform-browser/src/dom/debug/ng_probe.ts#L41)
