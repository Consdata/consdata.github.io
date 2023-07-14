---
layout:    post
title:     "Czy wiesz, jak obsługiwać błędy w Angular w scentralizowany sposób?"
date:      2023-10-06T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: dmejer
image: /assets/img/posts/2023-10-06-czy-wiesz-jak-obslugiwac-bledy-w-angular-w-scentralizowany-sposob/error_handling.webp
description: W Angularze istnieje ErrorHandler, jest to hook do scentralizowanej obsługi błędów. Domyślny ErrorHandler wyświetla jedynie błędy na konsoli. Jeżeli chcemy wyłapać i obsłużyć nieobsłużone błędy, należy dodać implementację ErrorHandlera...
tags:
- angular
- errorhandler
---

W Angularze istnieje ErrorHandler, jest to hook do scentralizowanej obsługi błędów. Domyślny ErrorHandler wyświetla jedynie błędy na konsoli. Jeżeli chcemy wyłapać i obsłużyć nieobsłużone błędy, należy dodać implementację ErrorHandlera. Pokażę jak to zrobić na prostym przykładzie.

W module, należy dodać providera:
```typescript
providers: [
    {provide: ErrorHandler, useClass: GlobalErrorHandler}
]
```

Przykładowa implementacja GlobalErrorHandlera z serwisem, który może być używany przez komponenty:
```typescript
export interface ErrorWrapper {
  sourceModule: string;
  error: Error;
}
 
@Injectable()
export class ErrorService {
  private error$: Subject<ErrorWrapper> = new Subject<ErrorWrapper>();
 
  public publishError(error: ErrorWrapper): void {
    this.error$.next(error);
  }
 
  public takeError$(): Observable<ErrorWrapper> {
    return this.error$.asObservable();
  }
 
}
 
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
 
  constructor(private errorService: ErrorService) {
  }
 
  handleError(error: Error): void {
    const wrappedError: ErrorWrapper = {sourceModule: 'application', error: error};
    this.errorService.publishError(wrappedError);
  }
 
}
```

Użycie w komponencie:
```typescript
@Component({
  selector: 'app',
  template: `
        <div *ngIf="!(error$ | async) else error">
          <p>Aplikacja działa!</p>
        </div>
        <ng-template #error>
          <p>Błąd!</p>
        </ng-template>
  `
})
export class AppComponent {
 
  error$: Observable<boolean> = this.errorService.takeError$().pipe(
    startWith(false)
  );
 
  // ...
}
```

Powyższa implementacja jest tylko uproszczonym przykładem ale pokazuje, jak można obsłużyć niespodziewane wyjątki.


