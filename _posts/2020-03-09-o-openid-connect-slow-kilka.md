---
layout:    post
title:     "O OpenID Connect słów kilka"
published: true
date:      2020-03-09 08:00:00 +0100
author:    mhoja
image:     oauth.png
tags:
    - openid connect
    - oauth 2
    - keycloak
    - uwierzytelnianie użytkownika
---

W nawiązaniu do mojego poprzedniego wpisu pt.:  
[**"Keycloak - uwierzytelnianie i autoryzacja użytkownika w aplikacji Angular/Spring Boot"** 🔗]({% post_url 2020-02-01-keycloak-uwierzytelnianie-autoryzacja-springboot-angular %})  
chciałbym krótko opisać standard [OpenID Connect](https://openid.net/connect/), który został wykorzystany podczas logowania do aplikacji przy użyciu serwera uwierzytelniania [Keycloak](https://www.keycloak.org/).

## Wstęp

Najpopularniejszymi standardami wykorzystywanymi do uwierzytelniania/autoryzacji są `OAuth 2.0`, `OpenID Connect` oraz `SAML`.  
O OAuth 2.0 zostało już napisanych wiele artykułów, których nie ma sensu powielać. Jednak aby przedstawić OpenID Connect, musiałbym opisać [OAuth 2.0](https://oauth.net/2/) oraz [JWT](https://jwt.io/).

W celu zapoznania się ze standardem OAuth 2.0 odeślę do artykułu pt.:  
[**"OAuth 2.0 – jak działa / jak testować / problemy bezpieczeństwa"** 🔗](https://sekurak.pl/oauth-2-0-jak-dziala-jak-testowac-problemy-bezpieczenstwa/)  
autorstwa Marcina Pioska z portalu [Sekurak](https://sekurak.pl/), w którym została opisana terminologia, sposoby pozyskiwania tokenu oraz zasada działania standardu.

O JWT natomiast możemy przeczytać w dokumencie [RFC7519](https://tools.ietf.org/html/rfc7519).

Dlaczego więc do integracji naszej aplikacji z serwerem uwierzytelniania Keycloak użyliśmy OpenID Connect?

## Uwierzytelnianie a autoryzacja

Poruszając temat zabezpieczania zasobów i dostępu do nich, mówimy o takich pojęciach jak **uwierzytelnianie** (ang. authentication) oraz **autoryzacja** (ang. authorization).

- `uwierzytelnianie` to proces polegający na potwierdzeniu tożsamości, czyli w skrócie - *kim jestem?*;
- `autoryzacja` to proces nadawania uprawnień (dostępu do zasobu), czyli w skrócie - *co mogę zrobić?*.

OAuth 2.0, według oficjalnej dokumentacji, nie powinien służyć do uwierzytelniania, a jedynie do autoryzacji ([źródło 🔗](https://oauth.net/articles/authentication/)):
> OAuth 2.0 is not an authentication protocol.

Jeśli potrzebujemy mechanizmu pozwalającego na poprawne zaimplementowanie uwierzytelniania, z pomocą przychodzi OpenID Connect.

## OpenID Connect

OpenID Connect jest prostą warstwą tożsamości opartą na OAuth 2.0.  
Umożliwia klientom weryfikację tożsamości użytkownika końcowego na podstawie uwierzytelnienia przeprowadzonego przez serwer autoryzacji, a także uzyskanie podstawowych informacji o jego profilu. Rozszerza OAuth 2.0, umożliwiając **uwierzytelnianie stowarzyszone** (ang. federated authentication):

- **Federated Authentication** - użytkownik loguje się do serwisu Spotify przy użyciu konta na portalu Facebook (`OpenID Connect`);
- **Delegated Authorization** - Spotify próbuje uzyskać dostęp do listy znajomych na Facebooku, aby zaimportować ją do swojej bazy danych (`OAuth 2.0`).

Przepływ procesu jest podobny do OAuth 2.0, ale dodatkowo w procesie bierze udział **ID Token**.

## ID Token

ID Token przypomina koncepcję dowodu osobistego w formacie JWT, podpisanego przez dostawcę OpenID (OP). Spełnia założenia standardu JWT, więc składa się z nagłówka, zawartości oraz
sygnatury. Jego zawartość może więc wyglądać następująco:

```json
{
  "jti": "e78b5f41-e769-4353-8874-44302f4a17c3",
  "exp": 1583205992,
  "nbf": 0,
  "iat": 1583169992,
  "iss": "http://localhost:8180/auth/realms/SpringBootAngular",
  "aud": "developer",
  "sub": "c3c3755a-e499-4782-b119-a19bede0ace8",
  "typ": "Serialized-ID",
  "nonce": "02c0b033-bfac-4030-a317-c18aec3cb2db",
  "auth_time": 1583169991,
  "acr" : "1",
  "session_state": "8b66127b-4474-41bd-8e36-5d18286df73f",
  "state_checker": "HZZmC4no-TEqiCf31Mk1MtONDqyxkk81ZXZCwANQb9Y",
  "name": "Jan Nowak",
  "email": "jan.nowak@example.pl"
}
```

**W skrócie, ID Token m.in.:**

- potwierdza tożsamość użytkownika, zwanego podmiotem w OpenID (`sub`);
- określa organ wydający (`iss`);
- jest generowany dla określonej grupy odbiorców - klienta (`aud`);
- może zawierać losowy ciąg służący do identyfikowania pochodzenia żądania (`nonce`);
- może określać kiedy (`auth time`) i jak, pod względem siły (`acr`) użytkownik został uwierzytelniony;
- posiada znacznik czasu wydania (`iat`) oraz czas ważności (`exp`);
- może zawierać dodatkowe informacje takie jak imię, nazwisko (`name`) oraz adres email (`email`);
- jest podpisany cyfrowo, dzięki czemu może zostać zweryfikowany;
- opcjonalnie może zostać zaszyfrowany w celu zapewnienia poufności danych.

Więcej informacji na ten temat znajdziemy w [oficjalnej dokumentacji 🔗](https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken).

## Podsumowanie

Dzięki wykorzystaniu `ID Token`, OpenID Connect nadaje się do uwierzytelniania użytkownika, w przeciwieństwie do OAuth 2.0, który najlepiej sprawdzi się podczas autoryzacji dwóch aplikacji komunikujących się między sobą przez API.

Wiemy już, że Federated Authentication ma zastosowanie, kiedy użytkownik loguje się do serwisu przy użyciu wspólnego konta.  
OpenID Connect wydaje się więc być naturalnym kandydatem do uwierzytelniania użytkowników w różnego rodzaju serwisach społecznościowych czy aplikacjach internetowych ([jak w przykładzie logowania do aplikacji za pośrednictwem Keycloaka]({% post_url 2020-02-01-keycloak-uwierzytelnianie-autoryzacja-springboot-angular %})).

Delegated Authorization natomiast ma zastosowanie, kiedy klient (aplikacja) próbuje uzyskać dostęp do zasobów innej aplikacji. Użytkownik musi jedynie zaakceptować uprawnienia przyznawane aplikacji klienckiej, czyli np. odczyt listy znajomych na Facebooku, o który ubiega się Spotify.  
Tutaj do autoryzacji Spotify w Facebooku najlepiej spisze się OAuth 2.0.

**Standardy wymienione we wstępie można podsumować następująco:**

- **OAuth 2.0** - stworzony w 2006 roku przy współpracy Twittera i Google, otwarty standard autoryzacji oparty o format JSON. Główne zastosowanie to autoryzacja API między dwoma aplikacjami;
- **OpenID Connect 1.0** - stworzony w 2014 roku przez OpenID Foundation, otwarty standard uwierzytelniania oparty o format JSON. Główne zastosowanie to SSO dla aplikacji konsumenckich;
- **SAML 2.0** - stworzony w 2001 roku przez OASIS, otwarty standard autoryzacji i uwierzytelniania oparty o format XML. Główne zastosowanie to SSO dla aplikacji enterprise.
