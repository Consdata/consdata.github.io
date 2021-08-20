---
layout:    post
title:     "Czy wiesz, że WebRTC korzysta z serwera STUN, aby umożliwić połączenie P2P?"
date:      2021-08-20 6:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    jgoszczurny
image:     /assets/img/posts/2021-08-20-stun-server/handshake.png
tags:
- webrtc
- stun
- p2p
---
Czy wiesz że WebRTC korzysta z serwera STUN, aby umożliwić połączenie P2P, a w ostateczności z serwera TURN aby przepuścić ruch przez niego i umożliwić połączenie?

Ponieważ rzadko kiedy zwykły użytkownik posiada na swoim komputerze publiczne IP, więc z tego powodu przekazanie informacji drugiej osobie "moje ip to 192.168.0.X" nie umożliwi połączenia P2P,

![Nieudane połączenie P2P](/assets/img/posts/2021-08-20-stun-server/p2p.png)

Dopiero wykorzystanie serwera STUN, do określenia publicznego IP oraz ewentualnych ograniczeń, może w większości przypadków pomóc przy zestawieniu połączenia P2P.

![Wykorzystanie serwera STUN](/assets/img/posts/2021-08-20-stun-server/stun.png)

Dzięki temu użytkownik A i B mogą przesłać do siebie adresy przez serwer pośredniczący (tzw. signaling) i ustanowić połączenie P2P.

Niestety w niektórych przypadkach, samo wykorzystanie STUN nie umożliwia połączenia P2P (np. kiedy użytkownik jest za symetrycznym NATem).

Wtedy możliwe jest wykorzystanie serwera TURN, który będzie działał jak proxy dla przesyłanych pakietów.

Niestety wiąże się to z większym wykorzystaniem zasobów oraz łącza sieciowego przy przesyłaniu pakietów przez dostawcę usługi WebRTC.


![Wykorzystanie serwera TURN](/assets/img/posts/2021-08-20-stun-server/turn.png)

W tym wariancie, połączenie bezpośrednie nie było możliwe, ale przesyłanie pakietów przez TURN pozwala użytkownikom nadal się połączyć z przez WebRTC.

Połączenie w tym wypadku nadal będzie bezpieczne, ponieważ pakiety są szyfrowane i TURN nie ma możliwości ich odczytania, służy tylko jako pośrednik.

Darmowym serwerem STUN/TURN jest coTURN ([**https://github.com/coturn/coturn**](https://github.com/coturn/coturn)). A jeśli chcesz zobaczyć, pod jakim adresem Cię widać z zewnątrz możesz wykorzystać to narzędzie online: [**https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/**](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/).

### Źródła
[**https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols**](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols)
[**https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/**](https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
[**https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/**](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)
