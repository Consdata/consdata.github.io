---
layout:    post
title:     "WebSocket fallbacks - SockJS"
date:      2020-05-18 08:00:00 +0100
published: true
author:    jgoszczurny
image:     websocket_fallback_main_post_image.png
tags:
    - java
    - spring
    - javascript
    - js
    - websocket
    - fallback
    - sockjs
    - atmosphere
---

# Wprowadzenie
W ramach projektu udostępniającego ekran za pomocą przeglądarki z wykorzystaniem WebRTC, 
zrobiliśmy moduł "signaling" który przekazuje komunikaty między użytkownikami.

Najbardziej logicznym i wygodnym podejściem do tego jest wykorzystanie WebSocket. 
W większości przypadków sprawdza się idealnie, chociaż może się zdarzyć że użytkownik 
nie będzie miał możliwości ustanowienia połączenia WebSocket (np. nieskonfigurowane proxy, które nie przekazuje poprawnie komunikatów WebSocket, wycinając nagłówki), 
z tego powodu konieczne było znalezienie sposobu, który to ominie.

Początkowo w ramach prac badawczych, miał być zbadany Atmosphere, ponieważ pobieżnie był już wykorzystany w innym projekcie. 
Wstępne zapoznanie z biblioteką pokazało że może ona zrobić WebSocket fallback za nas.


# Biblioteki
Podczas przeglądu literatury udało się również znaleźć bibliotekę SockJS,
która wyglądała na mniejszą bibliotekę i uprościła zintegraowanie z istniejącym projektem.


## Atmosphere
Jest to framework, który dostarcza komponenty dla klienta i serwera umożliwiające zbudowanie aplikacji webowej. 
Jest możliwe wpięcie go w Spring, chociaż wymaga to więcej pracy do wykonania.

Wspiera on transparentnie metody komunikacji takie jak:
* WebSockets,
* Server Sent Events (SSE),
* Long-Polling,
* HTTP Streaming (Forever frame)
* JSONP

Można uruchomić tą bibliotekę na serwerze, który wspiera servlety.

## SockJS
Biblioteka dekorująca WebSocket, dzięki czemu umożliwia fallback w przypadku gdy WebSocket nie jest dostępny.

Wygodna w użyciu ponieważ w JS działa ona tak samo jak zwykły WebSocket, 
czyli jeśli w istniejącym projekcie, jest używany `new WebSocket()`, 
to wystarczy zastąpić go `new SockJS()` i już można używać jego funkjonalności bez zmian w kodzie.

Tak samo prosto używa się go w Springu, chociaż same endpointy nie są już wtedy kompatybilne ze sobą, 
więc po integracji serwera z SockJS na tym samym endpoint, konieczne jest użycie SockJS w frontend.

Endpointy nie sa kompatybilne ze sobą, ponieważ:
* WebSocket-owy wystawia końcówkę (np. `/endpoint`) dla połączenia WebSocket
* a SockJs wystawia końcówkę (HTTP, np. `/endpoint`) w celu negocjacji parametrów połączenia,<br />
  chociaż klient również ma mozliwośc połączenia się za pomocą WebSocket bez instalowania SockJS wykorzystując do tego `/endpoint/websocket`

## Praktyka
Ostatecznie został wybrany SockJS z powodu prostoty wykorzystania go w istniejącym springowym projecie.

### Wersja przed poprawkami z użyciem czystego WebSocket
#### Backend
* pom.xml
{% highlight xml %}
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
{% endhighlight %}

* WebSocketConfig.java
{% highlight java %}
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private SocketHandler socketHandler;

    public WebSocketConfig(SocketHandler socketHandler) {
        this.socketHandler = socketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(socketHandler, "/signaling");
    }
}
{% endhighlight %}

#### Frontend
* web-socket-manager.ts
{% highlight typescript %}
export class WebSocketManager {
    private webSocket?: WebSocket;
    constructor() {
        this.webSocket = this.initWebSocket();
    }
     
    initWebSocket(): WebSocket {
        return new WebSocket('https://localhost/signaling');
    }
}
{% endhighlight %}


### Wersja po poprawkach z użyciem SockJS
* pom.xml (bez zmian)
{% highlight diff %}
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
</dependencies>
{% endhighlight %}

* WebSocketConfig.java
{% highlight diff %}
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private SocketHandler socketHandler;

    public WebSocketConfig(SocketHandler socketHandler) {
        this.socketHandler = socketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
-       registry.addHandler(socketHandler, "/signaling");
+       registry.addHandler(socketHandler, "/signaling")
+           .withSockJS();
    }
}
{% endhighlight %}

* web-socket-manager.ts
{% highlight diff %}
+import * as SockJS from 'sockjs-client';
+
 export class WebSocketManager {
    private webSocket?: WebSocket;
    constructor() {
        this.webSocket = this.initWebSocket();
    }
    
    initWebSocket(): WebSocket {
-      return new WebSocket('https://localhost/signaling');
+      return new SockJS('https://localhost/signaling');
    }
 }
{% endhighlight %}

I teoretycznie to wystarczy do działania, chociaż w celu zostawienia kompatybilności wstecz 
oraz rozwiązania problemów kiedy wykorzystujemy SockJS w bibliotece wybudowanej za pomocą RollUp,
konieczne było zmodyfikowanie kodu. 

W przypadku komaptybilności wstecz, został dodany dodatkowy endpoint wykorzystujący wersjonowanie.
Problemy z RollUp zostały rozwiązane poprzez załadowanie biblioteki SockJS już po stronie klienta.


### Wersja po uwzględnieniu poprawek
#### Backend
pom.xml
{% highlight diff %}
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
+   <dependency> <!-- własna wersja sockjs jest opcjonalna :) -->
+       <groupId>org.webjars.npm</groupId>
+       <artifactId>sockjs-client</artifactId>
+       <version>1.4.0</version>
+   </dependency>
</dependencies>
{% endhighlight %}

WebSocketConfig.java
{% highlight diff %}
@Configuration
@EnableWebSocket
+@EnableWebMvc
-public class WebSocketConfig implements WebSocketConfigurer {
+public class WebSocketConfig implements WebSocketConfigurer, WebMvcConfigurer {
    private SocketHandler socketHandler;

    public WebSocketConfig(SocketHandler socketHandler) {
        this.socketHandler = socketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
-       registry.addHandler(socketHandler, "/signaling");
+       registry.addHandler(socketHandler, "/signaling"); // pozostawione dla kompatybilności wstecz :)
+       registry.addHandler(socketHandler, "/v2/signaling/sockjs-server") // endpoint dla SockJS
+               .withSockJS()
+               // SockJS wykorzystuje iframe w specyficznych przypadkach
+               // i tutaj "nadmiarowo" podajemy własną wersję biblioteki JS z własnego serwera,
+               // zamiast https://cdn.jsdelivr.net/sockjs/1.0.0/sockjs.min.js
+               .setClientLibraryUrl("/v2/signaling/sockjs-static/sockjs-client/sockjs.min.js");
    }
+   @Override
+   public void addResourceHandlers(ResourceHandlerRegistry registry) {
+       // tutaj również nadmiarowo wystawiamy statyczny zasób z biblioteką SockJS
+       registry.addResourceHandler("/v2/signaling/sockjs-static/sockjs-client/*.min.js")
+               .addResourceLocations("classpath:/META-INF/resources/webjars/sockjs-client/1.4.0/dist/")
+               .setCachePeriod(3600)
+               .resourceChain(true)
+               .addResolver(new PathResourceResolver());
+    }
}
{% endhighlight %}

#### Frontend
web-socket-manager.ts
{% highlight diff %}
import {SockjsScriptLoader} from 'websocket/sockjs-script-loader';
 
export class WebSocketManager {
   private webSocket?: WebSocket;
   constructor() {
-       this.webSocket = this.initWebSocket();
+       new SockjsScriptLoader().loadSockJs()
+               .then(() => {
+                   this.webSocket = this.initWebSocket();
+               })
+               .catch(error => {
+                   this.webSocket = this.initWebSocket();
+               });
   }

    initWebSocket(): WebSocket {
+       // @ts-ignore
+       if (typeof SockJS === 'function') { // objeście problemu z RollUp ;)
+           // @ts-ignore
+           return new SockJS('https://localhost/v2/signaling/sockjs-server');
+       } else {
-           return new WebSocket('https://localhost/signaling');
+           return new WebSocket('https://localhost/v2/signaling/sockjs-server/websocket');
+       }
    }
}
{% endhighlight %}



{% highlight typescript %}
export class SockjsScriptLoader {
    private sockJsScript = '/v2/signaling/sockjs-static/sockjs-client/sockjs.min.js';
    private state: ('loaded'|'loading'|'unloaded'|'error') = 'unloaded';

    public loadSockJs(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.state === 'loaded') {
                resolve();
            } else if (this.state === 'loading') {
                reject(new Error('Loading in progress...'));
            } else {
                this.state = 'loading';
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = this.sockJsScript;

                script.onload = () => {
                    this.state = 'loaded';
                    resolve();
                };
                script.onerror = () => {
                    this.state = 'error';
                    reject(new Error('Error when try load SockJS script...'));
                };
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        });
    }
}
{% endhighlight %}


# Testy
Rozwiązanie zostało przetestowane na dwa sposoby:

1. Ustawiając max-connection na 0 w firefox <br />
    https://stackoverflow.com/a/47027433 <br />
    `about:config` → `network.websocket.max-connections`
2. Symulując problem z proxu, w którym nie wszystkie nagłówki są przesyłane (wykorzystując do tego proxy na nginx).

W obu przypadkach test przebiegł pozytywnie i przy negatywnej próbie połączenia do WebSocket, SockJS przełączył się na Long-pooling.

Poprawność rozwiązania została sprawdzona za pomocą narzędzi deweloperskich w przeglądarce.


# Podsumowanie
Można powiedzieć że biblioteki tego typu, upraszczają proces implementacji fallback i prawdopodobnie zostanie to wykorzystane w projekcie, 
chociaż na pewno warto będzie pozbyć się wykorzystanego obejścia problemu z RollUp.


# Bibliografia
#### WebSocket
*  [https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
*  [https://en.wikipedia.org/wiki/WebSocket](https://en.wikipedia.org/wiki/WebSocket)
*  [https://www.ably.io/blog/websockets-vs-long-polling/](https://www.ably.io/blog/websockets-vs-long-polling/)

#### Atmosphere
*  [https://github.com/Atmosphere/atmosphere](https://github.com/Atmosphere/atmosphere)
*  [https://github.com/Atmosphere/atmosphere-javascript](https://github.com/Atmosphere/atmosphere-javascript)
*  [https://github.com/Atmosphere/atmosphere-samples](https://github.com/Atmosphere/atmosphere-samples)
*  [https://github.com/Atmosphere/atmosphere/wiki/Configuring-Atmosphere-as-a-Spring-Bean](https://github.com/Atmosphere/atmosphere/wiki/Configuring-Atmosphere-as-a-Spring-Bean)

#### SockJS
*  [https://github.com/sockjs/sockjs-client](https://github.com/sockjs/sockjs-client)
*  [https://spring.io/guides/gs/messaging-stomp-websocket/](https://spring.io/guides/gs/messaging-stomp-websocket/)
*  [https://www.baeldung.com/websockets-spring](https://www.baeldung.com/websockets-spring)
*  [https://github.com/sockjs/sockjs-client/issues/446](https://github.com/sockjs/sockjs-client/issues/446)
*  [https://stomp-js.github.io/guide/stompjs/rx-stomp/ng2-stompjs/using-stomp-with-sockjs.html](https://stomp-js.github.io/guide/stompjs/rx-stomp/ng2-stompjs/using-stomp-with-sockjs.html)

#### Inne
*  [https://groups.google.com/forum/#!topic/vertx/jbW3SxyMwW0](https://groups.google.com/forum/#!topic/vertx/jbW3SxyMwW0)
*  [https://allegro.tech/2015/11/real-time-web-application-with-websockets-and-vert-x.html](https://allegro.tech/2015/11/real-time-web-application-with-websockets-and-vert-x.html)

