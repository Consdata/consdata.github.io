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
APP_INITIALIZER odpowiedzialny jest za wywołanie danego kawałka kodu przed uruchomieniem aplikacji. Brzmi prosto. Ale jak, dlaczego i po co? Zacznijmy od początku!

## proces startu aplikacji Angular'owej
Zastanawialiście się kiedyś po co ten kod? Dlaczego każda aplikacja wygląda w ten sposób?
``` js
platformBrowserDynamic().bootstrapModule(AppModule);
```
Poniżej przykładowy AppModule
``` js
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

AOT vs JIT
[https://stackoverflow.com/questions/41050331/angular-2-bootstrapping-options-aot-vs-jit]

[https://www.lucidchart.com/techblog/2016/12/16/bootstrapping-angular-2-with-ahead-of-time-template-compilation/]
https://angular.io/api/core/PlatformRef#bootstrapmodulefactory

https://github.com/angular/angular/blob/master/packages/core/src/application_ref.ts
https://github.com/angular/angular/blob/master/packages/platform-browser-dynamic/src/platform_providers.ts
https://github.com/angular/angular/blob/master/packages/platform-browser-dynamic/src/platform-browser-dynamic.ts

PlatformBrowserDynamic - contains the client side code that processes templates
https://stackoverflow.com/questions/37993476/angular-platform-browser-vs-angular-platform-browser-dynamic


platformBrowserDynamic() odpowiedzialny jest za zbudowanie PlatformRef. PlatformRef to entry point dla kazdej Angularowej aplikacji webowej. Istnieje tylko jeden PlatformRef, posiada dwie metody

``` js
const exceptionHandler: ErrorHandler|null = moduleRef.injector.get(ErrorHandler, null);
     if (!exceptionHandler) {
       throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
     }
```
Bez BrowserModule nie da się zbootstrapować aplikacji.

##### *`platformRef#bootstrapModuleFactory()`*
``` js
return _callAndReportToErrorHandler(exceptionHandler, ngZone !, () => {
       const initStatus: ApplicationInitStatus = moduleRef.injector.get(ApplicationInitStatus);
       initStatus.runInitializers();
       return initStatus.donePromise.then(() => {
         this._moduleDoBootstrap(moduleRef);
         return moduleRef;
       });
```

##### *`ApplicationInitStatus`*
``` js
constructor(@Inject(APP_INITIALIZER) @Optional() private appInits: (() => any)[]) {
  // (...)
}
```

 *`_moduleDoBootstrap()`* bootstrapuje komponenty wskazane jako bootstrap w module.


[https://github.com/angular/angular/blob/master/packages/platform-browser-dynamic/src/platform-browser-dynamic.ts]
```js
export const platformBrowserDynamic = createPlatformFactory(
    platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

```


## jak używać? usevalue vs usefactory

## przykład? multi false

## rozbudoway przykład multi true atmosphera?
