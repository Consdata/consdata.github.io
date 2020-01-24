---
layout:    post
title:     "Keycloak - uwierzytelnianie i autoryzacja użytkownika w aplikacji Angular/Spring Boot"
published: true
date:      2020-02-05 08:00:00 +0100
author:    mhoja
tags:
    - angular
    - spring boot
    - keycloak
    - keycloak-spring-boot-2-starter
    - keycloak-spring-boot-2-adapter
    - keycloak-angular
    - uwierzytelnianie użytkownika
---

Jak wykorzystać serwer Keycloak do logowania w aplikacji?  
Omówimy to na przykładzie gotowego projektu, który umożliwia użytkownikowi zalogowanie się do aplikacji z poziomu przeglądarki internetowej.

## Czym jest Keycloak?

Keycloak to serwer uwierzytelniania i autoryzacji na licencji open-source. Może zostać podłączony do LDAP/AD lub uwierzytelniać użytkowników przy użyciu Google, Facebooka itd.
Posiada również konsolę administracyjną, w której możemy łatwo skonfigurować chociażby uprawnienia użytkowników.

Więcej informacji na stronie [www.keycloak.org](https://www.keycloak.org/).

## Projekt demo

Projekt aplikacji znajduję się na GitHubie - [link do repozytorium.](https://github.com/Michuu93/spring-angular-keycloak)  
Składa się on z aplikacji backendowej napisanej w Spring Boot (Kotlin) oraz frontendowej napisanej w Angular 8.

Aby przedstawić sposób zaimplementowania uwierzytelniania użytkownika za pomocą serwera Keycloak, zabezpieczymy endpointy na backendzie oraz osobno część frontendową.

### Serwer Keycloak

Wykorzystamy serwer Keycloak uruchomiony na Dockerze. Wykonując w głównym folderze repozytorium polecenie:

```shell
docker run --rm --name keycloak-server -p 8180:8080 \
    -e KEYCLOAK_USER=admin \
    -e KEYCLOAK_PASSWORD=admin \
    -e KEYCLOAK_IMPORT=/realm/realm-export.json \
    -v $(pwd)/realm/:/realm/ \
    jboss/keycloak
```

uruchomimy serwer Keycloak na porcie `8180`.

Konsola administracyjna będzie dostępna pod adresem: [127.0.0.1:8180/auth/admin](http://127.0.0.1:8180/auth/admin/)  
Zalogujemy się do niej przy użyciu loginu i hasła zdefiniowanego w `KEYCLOAK_USER` oraz `KEYCLOAK_PASSWORD`, w naszym przypadku `admin:admin`.

#### Konfiguracja serwera

Sama konfiguracja serwera Keycloak, to temat na osobny wpis, dlatego wkorzystamy przygotowaną wcześniej konfigurację.

Eksport konfiguracji serwera został umieszczony w repozytorium projektu demo (`realm/realm-export.json`) i zostanie załadowany podczas uruchomienia serwera.

**Skonfigurowane zostały:**

- realm `SpringBootAngular`
- client `SpringBootAngularClient`
  - Access Type: `confidential` - podczas logowania musimy przekazać secret skonfigurowany w `SpringBootAngularClient`
    - dostępnę są jeszcze opcje `bearer-only` oraz `public` - więcej na ten temat w dokumentacji [(link)](https://www.keycloak.org/docs/latest/server_admin/#oidc-clients)
  - Valid Redirect URIs: `*` - dla ułatwienia bez ograniczeń
  - Web Origins: `*` - dla ułatwienia bez ograniczeń
- rola `user_role` - tylko użytkownik z tą rolą będzie mógł się autoryzować w aplikacjach
- użytkownik `user` z rolą `user_role` (`user:password`)
- użytkownik `user2` bez roli `user_role` (`user2:password2`)

### Aplikacja backendowa

Aplikacja backendowa składa się z dwóch kontrolerów:

- `MainController` - wystawia zabezpieczone endpointy
  - `/api/hello` - zwraca string `Hello from the Backend!`
  - `/api/logout` - wylogowuje nas po stronie aplikacji backendowej
- `KeycloakController` - wystawia publiczny endpoint
  - `api/keycloak/config` - udostępnia wspólną konfigurację dla frontendu

### Aplikacja frontendowa

Aplikacja frontendowa składa się z trzech komponentów:

- `PublicComponent` - dostępny dla wszystkich bez logowania
- `ProtectedComponent` - zabezpieczony przed nieautoryzowanym użytkownikiem
- `ToolbarComponent` - menu z przyciskami dla wygody

## Uwierzytelnianie na backendzie

### Zależności

Na backendzie wykorzystamy zależności:

- `org.keycloak:keycloak-adapter-core`
- `org.keycloak:keycloak-spring-boot-2-adapter`
- `org.keycloak:keycloak-tomcat-adapter`

Moglibyśmy wykorzystać jedną zależność, zawierającą powyższe adaptery:

- `org.keycloak:keycloak-spring-boot-2-starter`

jednak w najnowszej dostępnej wersji `4.0.0.Final` wykorzystuje ona stare wersje adapterów. Jedną ze zmian w nowszych wersjach adapterów, które wykorzystamy, jest poprawiona walidacja tokenów. Jeśli w przyszłości pojawi się nowa wersja tej zależności, z nowymi wersjami adapterów, to nic nie stoi na przeszkodzie żeby ją wykorzystać.

### Konfiguracja

Oprócz konfiguracji portu aplikacji oraz poziomu logowania adapterów (dzięki czemu zobaczymy w logach co się dokładnie dzieje), musimy skonfigurować `keycloak-adapter-core`.  
Dzięki `keycloak-spring-boot-2-adapter` możemy wszystko skonfigurować w `application.yml`:

```yaml
keycloakRequiredUserRole: user_role
keycloak:
  enabled: true
  auth-server-url: http://localhost:8180/auth
  realm: SpringBootAngular
  resource: SpringBootAngularClient
  security-constraints:
    - authRoles:
        - ${keycloakRequiredUserRole}
      securityCollections:
        - name: protected resource
          patterns:
            - /api/*
    - securityCollections:
        - name: public resource
          patterns:
            - /api/keycloak/config
  credentials:
    secret: "<SECRET>"
  realm-key: "<PUBLIC_KEY>"
```

- `keycloakRequiredUserRole` - dla ułatwienia, ponieważ wykorzystamy tylko jedną rolę, będzie nam łatwiej udostępnić ją przez api (jeśli chcemy wykorzystać więcej ról, to musimy je wyciągąć z listy `authRoles`  
- `keycloak.security-constraints` - tutaj definiujemy ograniczenia endpointów

Możemy zdefiniować ścieżki dostępne publicznie:  
np. `/api/keycloak/config`  
oraz ścieżki które będą wymagały uprawnień  
np. `/api/*`  
które będzie wymagać od użytkownika roli `${keycloakRequiredUserRole}` (czyli `user_role`).

**Konfiguracja Keycloak:**

- `keycloak.enabled` - umożliwi nam łatwe wyłączenie uwierzytelniania;  
- `keycloak.auth-server-url` - adres serwera Keycloak;  
- `keycloak.realm` - nazwa realmu;  
- `keycloak.resource` - nazwa klienta skonfigurowanego dla podanego realmu;  
- `keycloak.credentials.secret` - secret wygenerowany w `SpringBootAngularClient`, możemy go znaleźć w konsoli administracyjnej (`Clients > SpringBootAngularClient > Credentials > Secret`);  
- `keycloak.realm-key` - klucz publiczny realmu, możemy go znaleźć w konsoli administracyjnej (`Realm Settings > Keys > Active > RSA > Public Key`).

### Wystawienie konfiguracji dla frontendu

Ponieważ zabezpieczamy osobno aplikację backendową jak i frontendową, a konfiguracja Keycloak jest taka sama, to możemy wystawić konfigurację z `application.yml` przez api. Dzięki temu unikniemy duplikowania konfiguracji w aplikacji frontendowej.

Konfigurację wystawimy w `KeycloakController` pod adresem `api/keycloak/config`. Będzie ona miała postać:  

```json
{
    "enabled": true,
    "authServerUrl": "http://localhost:8180/auth",
    "realm": "SpringBootAngular",
    "resource": "SpringBootAngularClient",
    "requiredUserRole": "user_role",
    "credentials": {
        "secret": "<SECRET>"
    }
}
```

## Uwierzytelnianie na frontendzie

### Zależności

Po stronie aplikacji frontendowej wykorzystamy bibliotekę `keycloak-angular` [(link)](https://github.com/mauriciovigolo/keycloak-angular#readme).

W `package.json` dodamy zależności:

```json
"keycloak-angular": "^7.0.1",
"keycloak-js": "^6.0.1"
```

### Pobranie konfiguracji z backendu

Konfigurację pobierzemy uderzając na endpoint backendu.  
Przy pierwszym pobraniu konfiguracji z `KeycloakConfigService` zostanie wykonany request, a wynik zostanie zapisany. Kolejne pobrania konfiguracji będą już zwracać zapisaną konfigurację.

```typescript
@Injectable({providedIn: 'root'})
export class KeycloakConfigService {
    private config: KeycloakConfig;

    constructor(private http: HttpClient) {
    }

    getConfig(): Observable<KeycloakConfig> {
        if (this.config) {
            return of(this.config);
        } else {
            const configObservable = this.http.get<KeycloakConfig>('/api/keycloak/config');
            configObservable.subscribe(config => this.config = config);
            return configObservable;
        }
    }
}
```

### Konfiguracja

Pobraną konfigurację wykorzystamy w injection tokenie, definiując w `app.module.ts` provider dla tokenu [`APP_INITIALIZER`](https://angular.io/api/core/APP_INITIALIZER):

```typescript
{
    provide: APP_INITIALIZER,
    useFactory: initializer,
    multi: true,
    deps: [KeycloakService, KeycloakConfigService]
}
```

Jako `initializer` utworzymy funkcję wykorzystującą nasz `KeycloakConfigService` oraz inicjalizującą `KeycloakService` z biblioteki `keycloak-angular`:

```typescript
export function initializer(keycloakService: KeycloakService, keycloakConfigService: KeycloakConfigService): () => Promise<boolean> {
    return (): Promise<boolean> => keycloakConfigService.getConfig()
        .pipe(
            filter(config => config.enabled),
            flatMap(config => {
                return keycloakService.init({
                    config: {
                        url: config.authServerUrl,
                        realm: config.realm,
                        clientId: config.resource,
                        credentials: {
                            secret: config.credentials.secret
                        }
                    },
                    initOptions: {
                        onLoad: 'check-sso',
                        checkLoginIframe: false
                    }
                });
            })).toPromise();
}
```

### Zabezpieczenie route'ów

Aby zabezpieczyć routy, wykorzystamy [`Angular Route Guard`](https://angular.io/guide/router#guards).  
Stworzymy `AppAuthGuard` rozszerzając `KeycloakAuthGuard` oraz implementując [canActivate](https://angular.io/api/router/CanActivate).

W konstruktorze pobierzemy konfigurację z `KeycloakConfigService`, aby zweryfikować czy uwierzytelnianie jest włączone (parametr `keycloak.enabled` w `application.yml`), oraz czy użytkownik posiada wymaganą rolę:

```typescript
@Injectable({
    providedIn: 'root'
})
export class AppAuthGuard extends KeycloakAuthGuard {
    isAuthEnabled: boolean = true;
    requiredUserRole: string;

    constructor(protected router: Router, protected keycloakService: KeycloakService, private keycloakConfigService: KeycloakConfigService) {
        super(router, keycloakService);
        this.keycloakConfigService.getConfig().subscribe(config => {
            this.isAuthEnabled = config.enabled;
            this.requiredUserRole = config.requiredUserRole;
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (!this.isAuthEnabled) {
            return Promise.resolve(true);
        } else {
            return super.canActivate(route, state) as Promise<boolean>;
        }
    }

    isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise(async (resolve) => {
            if (!this.authenticated) {
                return this.keycloakService.login();
            }
            resolve(this.roles.includes(this.requiredUserRole));
        });
    }
}
```

a następnie wykorzystamy naszego guarda w `app-routing.module.ts` do zabezpieczenia routa `protected`:

```typescript
const routes: Routes = [
    {
        path: '',
        component: PublicComponent
    },
    {
        path: 'protected',
        component: ProtectedComponent,
        canActivate: [AppAuthGuard]
    }
];
```

## Testy

### Uruchomienie

Jeśli mamy już uruchomiony serwer Keycloak, możemy zbudować aplikacje i obraz dockerowy, a następnie uruchomić kontener.

W tym celu w głównym folderze repozytorium najpierw budujemy aplikacje:

```shell
./gradlew build
```

po zbudowaniu tworzymy obraz dockerowy:

```shell
docker build -t michuu93/spring-angular-keycloak-demo .
```

a na koniec uruchamiamy kontener:

```shell
docker run --rm --name spring-angular-keycloak-demo --network host michuu93/spring-angular-keycloak-demo
```

Ponieważ zarówno aplikacje z wnętrza kontenera, jak i my z przeglądarki internetowej musimy mieć dostęp do serwera Keycloak pod tym samym adresem, nie wnikając w zasadę działania sieci w dockerze uruchomiliśmy kontener z opcją `--network host`.

Dzięki temu nie musimy wystawiać dodatkowo żadnego proxy ani podmieniać hostów w naszym systemie. Jest to jednak ułatwienie na potrzeby demo i nie powinniśmy go wykorzystywać na produkcji.

### Weryfikacja działania uwierzytelniania

Po uruchomieniu możemy sprawdzić aplikacje w działaniu!

Przechodzimy na stronę [localhost:9082](http://localhost:9082/) i powinniśmy zobaczyć aplikację frontendową, a dokładniej `ToolbarComponent` oraz `PublicComponent`:

![Public component](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/public_component_not_logged.png)

Do dyspozycji mamy menu, z którego możemy przejść do:

- `Public` - niezabezpieczonego route z `PublicComponent`;
- `Protected` - zabezpieczonego route z `ProtectedComponent`;
- `Keycloak Configuration` - niezabezpieczonego endpointu udostępniającego konfiguację Keycloak z backendu;
- `Backend Hello` - zabezpieczonego endpointu zwracającego tekst `Hello from the Backend!`;
- `Logout (backend)` - wylogowania z backendu;
- `Logout (frontend)` - przycisk widoczny tylko po zalogowaniu na frontendzie, który wylogowuje nas z frontendu.

Sprawdźmy więc czy mamy dostęp do `Keycloak Configuration` bez zalogowania:
![Keycloak Configuration](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/keycloak_config.png)

Wygląda na to, że publicznie dostępny route i endpoint api, działają poprawnie.

Jeśli teraz przejdziemy do `Protected`, zostaniemy przekierowani na stronę logowania Keycloak:

http://localhost:8180/auth/realms/**SpringBootAngular**/protocol/**openid-connect**/auth?client_id=**SpringBootAngularClient**&redirect_uri=**http%3A%2F%2Flocalhost%3A9082%2F%23%2F**&state=3e007783-4772-48dd-8b31-4bfe3cc9c42c&response_mode=fragment&response_type=code&scope=openid&nonce=023ab545-32dc-4bdc-9cbf-12cad1d0c944

![Keycloak login](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/keycloak_login.png)

Jak widzimy, adres zawiera informacje, takie jak nazwa protokołu, realm, client czy adres, na który mamy zostać przekierowani po zalogowaniu.

Jeśli zalogujemy się użytkownikiem posiadającym rolę `user_role` (`user:password`), to zostaniemy przekierowani z powrotem do naszej aplikacji:

![Public component](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/public_component_logged.png)

Dodatkowo mamy jeszcze tylko przycisk `Logout (frontend)`. Jesteśmy teraz zalogowani, więc możemy przejść do `Protected`:

![Protected component](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/protected_component.png)

Zadziała również `Backend Hello`:

![Backend Hello](/assets/img/posts/2020-02-05-keycloak-z-angularem-i-keycloakiem/backend_hello.png)

Jeśli wylogujemy się teraz z frontendu - `Logout (frontend)`, to zniknie przycisk `Logout (frontend)` i nie będziemy mieli już dostępu do `Protected`.  
Cały czas jednak będziemy mieli dostęp do `Backend Hello`. Dopiero kiedy wylogujemy się z backendu - `Logout (backend)`, to stracimy dostęp do `Backend Hello`.  
Jednak jeśli będąc zalogowanym użytkownikiem, wylogujemy się z backendu a nie frontendu, to automatycznie zostaniemy również wylogowani z frontendu.

Dlaczego?

O tym jak działa Keycloak i tokeny którymi się posługujemy (a dokładniej standard OpenID Connect) nie jest tematem tego wpisu. Co do kwestii wylogowywania, to temat (ze względu na złożoność implementacji) nadaje się na osobny wpis, szczególnie gdy mówimy o rozproszonych systemach z wieloma instancjami aplikacji, stojącymi za loadbalancerem.

Projekt demo posiada bardzo prosty mechanizm wylogowywania.

Wylogowanie z frontendu wywoła metodę `logout` na serwisie biblioteki `keycloak-angular`:

```typescript
logout = async (): Promise<void> => await this.keycloakService.logout();
```

Natomiast wylogowanie z backendu uderzy na `/api/logout`, co spowoduje wykonanie na backendzie:

```java
fun logout(request: HttpServletRequest, response: HttpServletResponse) {
    request.logout()
    response.sendRedirect("/")
}
```

Na koniec sprawdźmy jeszcze użytkownika bez roli `user_role` (`user2:password2`).

Po zalogowaniu, w aplikacji powinniśmy zobaczyć te same przyciski w menu, co na użytkowniku posiadającym wymaganą rolę.  
Jest tak, ponieważ ukrywanie przycisków uzależniliśmy tylko od tego, czy użytkownik jest zalogowany, a nie czy ma uprawnienia do routa:

```typescript
ngOnInit(): void {
    this.keycloakService.isLoggedIn().then(isLogged => this.isLogged = isLogged);
}
```

Uderzenie na `Backend Hello` również nie zadziała.

Uwierzytelnianie możemy bardzo szybko wyłączyć w obu aplikacjach, ustawiając `keycloak.enabled` w `application.yml` na `false`.  
Może być to przydatne np. na środowiskach testowych.

## Na zakończenie

Mam nadzieję, że udało mi się w przystępny sposób przedstawić integrację aplikacji z serwerem Keycloak.

Nie jest to jedyny sposób implementacji, jeśli nasza aplikacja ma być bardziej elastyczna, możemy wykorzystać implementację standardu OAuth2 przy użyciu `Spring Security`. Dzięki temu nie uzależnimy się od serwera Keycloak i w przyszłości będziemy mogli łatwiej zamienić go na inny serwer uwierzytelniania/autoryzacji.

Keycloak wystawia endpointy pod którymi udostępnia konfigurację [(link)](https://www.keycloak.org/docs/4.8/server_admin/#keycloak-server-oidc-uri-endpoints).  
Znajdziemy je w `Realm Settings > General > Endpoints`, np. dla standardu OpenID Connect będzie to w naszym przypadku:  
[http://127.0.0.1:8180/auth/realms/SpringBootAngular/.well-known/openid-configuration](http://127.0.0.1:8180/auth/realms/SpringBootAngular/.well-known/openid-configuration)  
Mogą być one przydatne, jeśli aplikacja nie wykorzystuje adapterów Keycloak do połączenia z serwerem.

Nie musimy też wykorzystywać logowania do aplikacji przez przeglądarkę - możemy wykorzystać Keycloaka do uwierzytelniania aplikacji między sobą, np. kiedy integrujemy ze sobą różne moduły. Wtedy przydatna będzie opcja `bearer-only` w konfiguracji clienta.
