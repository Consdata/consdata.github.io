---
layout:    post
title:     "Inteligentny dom dla programisty, czyli DIY Smart Home"
date:      2022-02-05 08:00:00 +0100
published: true
lang:      pl
author:    aswarcewicz
image:     /assets/img/posts/2022-02-05-smarthome/smarthome.jpg
tags:
    - smarthome
    - homeassistant
    - zigbee2mqtt
    - zigbee
    - homekit
    - heysiri
    - heygoogle
    - heyalexa
description: "DIY dla Smart Home, z przykładami automatyzacji, treściwym przeglądem systemów i narzędzi dla inteligentnego domu."
---

Jakiś czas temu trafiłem na artykuł, którego głównym tematem był wzrost popularności Smart Home w czasach pandemii. 
Od tamtej pory obiecuję sobie, że w końcu się zbiorę i w tzw. pigułce opiszę, z jakich urządzeń ja korzystam, 
co udało mi się z ich pomocą osiągnąć i jakie problemy napotkałem.

## Integracje / Automatyzacje

Zanim jednak przejdę do detali i wszystkich technicznych kwestii związanych ze Smart Home, opowiem o swoich przykładach automatyzacji inteligentnego domu dla programisty.

### Oświetlenie

Przygodę ze Smart Home zacząłem od oświetlenia, a inspiracją do zmian były przełączniki w niewygodnych miejscach.
Na start wziąłem przedpokój, jako idealne miejsce do zastosowania czujnika ruchu. Teraz wystarczy wejść, aby światło z automatu się zapaliło i zgasiło po około 40 sekundach bez ruchu. 
Oczywiście nie „odciąłem” standardowego włącznika na ścianie, a jego użycie zaprogramowałem tak, żeby ręczne włączenie nie brało pod uwagę braku ruchu i było zapalone „na stałe".
Moje czujniki ruchu działają na baterie i są bardzo małe, można więc je sprytnie ukryć, zachowując estetykę pomieszczenia.
Poniżej przykład czujnika ruchu, który zapala światło w przedpokoju. Umieściłem go nad lewą szafką, dzięki czemu jest niewidoczny.

![Czujnik ruchu umieszczony w szafce](/assets/img/posts/2022-02-05-smarthome/czujnikruchu.jpg){: width="250" }

Doświadczenie z czujnikami ruchu wykorzystałem też w innych miejscach. Dla przykładu jeden z nich zapala taśmę LED pod łóżkiem w sypialni, dając ciekawy efekt.

Kolejne pomieszczenie, w którym chciałem zadbać o ergonomię związaną z użyciem przełącznika oświetlenia, była kuchnia.
Tak jak wcześniej, standardowy przełącznik na ścianie pozostawiłem, ale dołożyłem drugi „przyklejany” na magnes pod okapem kuchennym.
Może nieco mniej smart niż poprzednie rozwiązanie, za to komfort zdecydowanie większy.
Dosyć często zapominam o wyłączeniu oświetlenia w kuchni, planuję więc dołożyć jeszcze czujnik, który po kilku minutach bez ruchu automatycznie wyłączy światło nad blatem.

Kolejna oświetleniowa automatyzacja, którą warto rozważyć, to taka zależna od zachodu słońca (zmiennego w zależności od daty i położenia geograficznego).
Automatyzacja „zapala mi” zewnętrzne lampki świąteczne po zachodzie słońca, a wyłącza tuż przed północą.

I jeszcze jedna „oświecona” podpowiedź na koniec. Z użyciem odpowiedniej automatyzacji, bazującej na położeniu telefonów domowników, 
za każdym razem, kiedy wszyscy są poza domem, mam pewność, że wszystkie światła są pogaszone.

### Ogrzewanie

W moim inteligentnym domu zmieniło się też sporo w kwestii ogrzewania.
Poranek zawsze zaczyna się od wpuszczenia świeżego powietrza, wiec otwarcie okna z automatu zakręca głowice na kaloryferach,
a odkręca po 10 minutach od ich zamknięcia w celu unormowania temperatury.
Podobnie jak w przypadku oświetlenia tak i tutaj, gdy wszyscy domownicy są poza domem, to upewniam się, że grzanie jest zakręcone.

### Ostrzeżenia / alarmy

Z użyciem Smart Home i wcześniej wspomnianych czujników ruchu, możemy stworzyć własny system alarmowy,
który pod nieobecność domowników włączy alarm i przekaże nam odpowiedni komunikat.
W moim przypadku bardzo przydatne okazały się czujniki informujące o wycieku.
Przy użytkowaniu zmywarki okazało się, że na jednym z połączeń jest mała nieszczelność i dopiero pod koniec zmywania pojawiały się pojedyncze kropelki, które czujnik na szczęście wykrył.
Innym razem, w tajemniczy sposób pękło połączenie silikonowe między wanną a ścianą, przez co pod prysznicem powoli zbierała się woda.
Tak jak w przypadku zmywarki, tak i tutaj były to dosłownie pojedyncze kropelki.
Do przetarcia wystarczał jeden listek ręcznika papierowego.
Nie mniej jednak dzięki alarmowi wiedziałem, że coś trzeba poprawić.

### Centrum sterowania Smart Home

Mając już zestaw narzędzi do samodzielnego wdrożenia Smart Home (nasze DoItYourself), wszystko możemy spiąć tak, aby nasz telefon stał się „centrum sterowania” inteligentnego domu dla programisty.
Możemy też korzystać z coraz bardziej popularnego sterowania głosowego.
Z odpowiednimi urządzeniami wystarczy „Hey Google” lub „Hey Siri” oraz konkretna komenda, aby nasz asystent włączył światło, zmienił jego kolor czy zasłonił okna.
Poniżej przykład z integracji HomeKit na telefonach wyposażonych w iOS.

![HomeKit](/assets/img/posts/2022-02-05-smarthome/homekit1.jpg){: width="250" }
![HomeKit](/assets/img/posts/2022-02-05-smarthome/homekit2.jpg){: width="250" }

Jeśli ktoś posiada stary telefon, tablet czy czytnik kindle z wifi, może mu nadać nowe życie. Takie nasze programistyczne zero waste ;)
Stare urządzenie można umieścić w centralnym miejscu, prezentując aktualny stan temperatury, światła lub tego, co nam nasza kreatywność podpowie.
Wydaje mi się, że ogranicza nas tylko wyobraźnia. Poniżej znowu moje przykłady:

![HomeAssistant](/assets/img/posts/2022-02-05-smarthome/ha-temperature.png){: width="250" }
![HomeAssistant](/assets/img/posts/2022-02-05-smarthome/ha-light.png){: width="250" }

## Co siedzi pod „maską”?

Zanim zaczniesz ze Smart Home, przejrzyj dostępne rozwiązania i zwróć uwagę na ich ograniczenia.
Wiadomo, że najłatwiej uczyć się na błędach i sukcesach innych, opiszę więc swoją ścieżkę do optymalnego rozwiązania.
Na starcie wybrałem Xiaomi, bo było dostępnych najwięcej urządzeń w przyzwoitych cenach.
Dodatkowo miałem już czujnik do kwiatka i żarówkę RGB od tego producenta.
Kupiłem bramkę Xiaomi Gateway v3 działającą po Zigbee oraz Bluetooth i kilka czujników.
Niedługo później zaczęły się schody.
Okazało się, że do sensownego działania bramka potrzebuje stałego dostępu do internetu, komunikuje się z chińskimi serwerami (bo taką wersję kupiłem) i pojawiają się opóźnienia na automatyzacjach.

Wtedy zrobiłem mały krok wstecz i zacząłem szukać rozwiązania, które w pełni będzie działało w sieci lokalnej oraz będzie obsługiwało sensory ZigBee, które już mam.
Tak trafiłem na HomeAssistant i tzw. uniwersalne bramki Zigbee, do których można podłączyć większość sprzętu od różnych producentów.

### Bramka Zigbee

W kwestii bramek uniwersalnych popularnych jest kilka układów. Tym razem, przed zakupem dokładniej prześledziłem opinie użytkowników.
Po analizie wybór padł na [ZZH](https://electrolama.com/projects/zig-a-zig-ah/). To właśnie to urządzenie miało najlepsze oceny użytkowników i spełniło moje oczekiwania.
Mam to urządzenia od jakichś dwóch lat i dla mnie to był bardzo dobry wybór. Nigdy nie miałem z nim problemów.

### Komputer pod automatyzację

Skoro mamy już koncepcje i narzędzia dla naszego Smart Home, przyszedł czas na wybór software,
który będzie obsługiwać uniwersalną bramkę oraz pozwoli nam tworzyć automatyzację.
Software trzeba na czymś zainstalować, więc trzeba wybrać odpowiedni komputer. Tutaj też miałem małe potknięcie.
Akurat miałem wolne Raspberry Pi2 i postanowiłem z niego skorzystać, pomimo że producenci poniższego softu na swoich stronach wprost to odradzali.
Jak się szybko przekonałem, mieli rację.
Pomijam już problemy techniczne z zasilaniem mojego egzemplarza Raspberry, które po jakimś czasie freez’owało...
Większą bolączką okazał się ponowny start HomeAssistant'a, potrzebujący kilkunastu minut, aby podnieść całe oprogramowanie do Smart Home.
To było stanowczo za długo, a urządzeń oraz automatyzacji miałem zdecydowanie mniej niż teraz.
Aktualnie korzystam z wirtualki z 2GB RAM, ale wiem, że Raspberry Pi4 też spokojnie daje radę.

### Zigbee2MQTT

Czujniki oraz uniwersalną bramkę trzeba jakoś sparować. Zigbee2MQTT jest oprogramowaniem, które za pomocą uniwersalnej bramki łączy się z urządzeniami ZigBee, publikuje ich zdarzenia na kolejkę MQTT,
a także w drugą stronę, zdarzenia z kolejki wysyła do urządzeń.

### HomeAssistant

Jak już mamy coś, co komunikuje się z naszymi urządzeniami za pomocą bramki, to możemy wyświetlić stan naszych urządzeń, a także na ich podstawie zrobić automatyzacje,
do tego właśnie służy HomeAssistant. Na tym etapie warto wspomnieć, że instalację Zigbee2MQTT oraz MQTT osobno można pominąć i skorzystać z rozwiązań dostarczanych lub instalowanych przez wyklikanie ich w HomeAssitant.
Ja poszedłem jednak drogą osobnych komponentów. 
Jak zaczynałem swoją przygodę, natrafiłem na informację, że Zigbee2MQTT wspiera więcej urządzeń niż sam HomeAssitant, a dodatkowo zyskałem możliwość niezależnej aktualizacji poszczególnych komponentów.

## Urządzenia wykonawcze, czujniki, przyciski i tak dalej...

Tę sekcję podzielę na trzy podsekcje, ponieważ w swoim Smart Home korzystam głównie z trzech sposobów komunikacji.
Pierwszy ze sposobów to Wi-Fi, drugi to Bluetooth, trzeci to Zigbee.

### Komunikacja po Wi-Fi

Zaletą tego sposobu komunikacji jest jego powszechność i łatwość integracji. 
Każdy ma Wi-Fi, obsługa jest łatwa, wadą natomiast jest zasięg.
Nie każdy ma odpowiednie wzmacniacze sygnału i może się okazać, że zasięg w wybranym miejscu jest mało stabilny, przez co urządzenie też nie działa, tak jakbyśmy tego chcieli.
Dodatkowo Smart Home to też ciągle rosnąca liczba urządzeń, która może spowodować problemy wydajnościowe na „pierwszym lepszym” punkcie dostępowym.
Ze swojego doświadczenia mogę powiedzieć, że pomimo bardzo dobrego zasięgu zdarzyło mi się kilka problemów z urządzeniami Wi-Fi.
Ostatni z problemów, który pamiętam to taki, że przekaźnik Shelly zintegrowany po MQTT przestał być widoczny przez HomeAssistant’a po zaniku zasilania.
Wymagane było odpowiednie skonfigurowanie i wydaje mi się, że od tamtej pory jest już ok.
Poniżej podrzucam listę przykładowych urządzeń działających po Wi-Fi, których używam w swoim Smart Home:

#### Taśma LED Yeelight 

![Taśma Yeelight](/assets/img/posts/2022-02-05-smarthome/yellightstrip.png){: width="250" }

Zalety — ładnie świeci, możliwy wybór koloru, łatwo się przedłuża.

Wady — maksymalna długość taśmy w niektórych przypadkach może nie wystarczyć.
Łączenie kolejnych „kawałków” jest zrobione dosyć dużym wtykiem, w porównaniu do taśm, które lutujemy i może spowodować problem z umieszczeniem całości w aluminiowym profilu na taśmy.

#### Przekaźnik Shelly 2.5

![Przekaźnik Shelly](/assets/img/posts/2022-02-05-smarthome/shelly25.png){: width="250" }

Zalety — duża liczba dostarczanych danych, a także różne sposoby integracji (API lub MQTT).
Każdy z dwóch kanałów może być osobno konfigurowany pod względem rodzaju podłączonego klawisza (dzwonkowy, stanowy).
Dla każdego z kanałów mamy też osobny zestaw informacji o aktualnym poborze prądu.
Możemy skonfigurować stan przekaźnika po powrocie zasilania (dla mnie to ważne, aby pod nieobecność domowników nie okazało się, że w całym mieszkaniu mamy zapalone światła).
No i ostatnie — mieści się w puszce, niestety część urządzeń nie przewiduje umieszczania w europejskich okrągłych puszkach.

Wady — komunikacja Wi-Fi i wszystko, co z nią się wiąże.
Z doświadczenia preferuje Zigbee, tym bardziej że urządzenia Zigbee na stałe podłączone do prądu z automatu przedłużają zasięg sieci.

#### ESP32

![Esp32](/assets/img/posts/2022-02-05-smarthome/esp32.png){: width="250" }

Mały, tani, ale potężny układ. Na standardowym wyposażeniu używanej przeze mnie wersji „devkit v1” znajduje się Wi-Fi oraz Bluetooth.
Dzięki popularności układu łatwo można znaleźć projekty obudowy do samodzielnego wydrukowania na drukarce 3D.
W moim Smart Home pracują dwa rodzaje takich układów:
- Pierwszy z nich ma na pokładzie [OpenMQTTGateway](https://docs.openmqttgateway.com/). Wykorzystuje go do odczytywania danych z czujników Bluetooth, jak czujnik w kwiatku (o czym dalej) czy zegarek z wyświetlaczem eInk.
- Drugi z nich ma na pokładzie [EspHome](https://esphome.io/) i podłączony odbiornik oraz nadajnik podczerwieni. Myślę, że podłączone elementy już dobrze reprezentują jego przeznaczenie. 
  W dalszych planach mam też przetłumaczenie sygnałów podczerwieni z indukcji Electrolux Hob2Hood na okap firmy Globalo (sprzęt, jaki posiadam).
  Wyzwanie stanowi brak w okapie opcji „ustaw wentylator na 3" (taki sygnał nada indukcja). Jedynym sposobem osiągnięcia tego stanu jest klikanie w +/-.


### Komunikacja po Bluetooth

O tym sposobie integracji z pewnością można powiedzieć, że jego największą wadą jest mały zasięg.
Wcześniej wspomniany układ Esp32 z OpenMQTTGateway może okazać się niezbędnym narzędziem, celem zebrania danych z różnych zakątków domu.
Ciekawostką może być to, że sensory Bluetooth Low Energy, póki są niepołączone z konkretnym urządzeniem, nadają informacje o swoim stanie w taki sposób,
że każdy może je odczytać. Stąd odbieram dane z zegarka Xiaomi sąsiadów...

Urządzenia Bluetooth, z których korzystam:

#### Xiaomi Flora flower monitor

![Czujnik do roślin](/assets/img/posts/2022-02-05-smarthome/flowermonitor.png){: width="250" }

Zalety — duża liczba danych, zarówno o glebie, jak i otoczeniu. Z danych otoczenia mamy np. temperaturę oraz jasność.

Wady — to na pewno komunikacja bluetooth i to, z czym się wiąże.

#### Zegarek z wyświetlaczem eInk (lywsd02mmc)

![Zegar z wyświetlaczem eInk](/assets/img/posts/2022-02-05-smarthome/einkclock.png){: width="250" }

Zalety — na pewno czytelny wyświetlacz i dodatkowe dane o wilgotności oraz temperaturze w pomieszczeniu.

Wady — takie jak każdego urządzenia Bluetooth (m.in zasięg).

### Komunikacja po ZigBee

Mój ulubiony sposób komunikacji, bo najmniej zawodny oraz łatwo zwiększa się zasięg.
Dodatkowo są to urządzenia, które bardzo długo wytrzymują na baterii.
Urządzeń o tym sposobie komunikacji mam najwięcej, wiec zbiorę je w kilku grupach.

#### Przekaźniki oraz gniazdka

Pozwoliłem sobie zebrać te wszystkie urządzenia w jedną grupę, bo ich głównym przeznaczeniem jest włączenie/wyłączenie zasilania. 
Różnią się jedynie wspieranymi funkcjami. Do których można zaliczyć wybór typu klawisza (w przypadku przekaźników), 
liczbę i rodzaj raportowanych danych. Wybrane informują o poborze energii, temperaturze, a także pozwalają ustawić stan po powrocie zasilania. 
Warto zwrócić też uwagę na to, aby mieściły się w europejskich puszkach (jeśli są to przekaźniki).
Tak jak wcześniej już wspomniałem, zaletą tych urządzeń jest to, że większość z nich wzmacnia zasięg sieci ZigBee.

![Przekaźnik](/assets/img/posts/2022-02-05-smarthome/relay.png){: width="250" }
![Gniazdko](/assets/img/posts/2022-02-05-smarthome/socket.png){: width="250" }


#### Sterowniki taśm led

Sterowniki taśm led, czyli urządzenia, które pozwalają nam na wybór koloru oraz jasności.
W swoim Smart Home mam tylko jedno takie urządzenie, które działa prawie bez zastrzeżeń.
Jedyną wadą jest to, że po powrocie zasilania jest domyślnie włączone i musiałem to „ograć” dodatkowym przekaźnikiem i automatyzacją.
Z zalet — podłączamy dowolną taśmę LED oraz dowolny zasilacz (oczywiście dobieramy urządzenia w zależności od potrzebnej mocy i napięcia).
W moim wypadku jest to taśma LED zasilona z 24V na dwóch końcach (dla równomiernego podświetlenia, w przypadku większych długości).

![Sterownik taśmy LED](/assets/img/posts/2022-02-05-smarthome/ledcontroller.png){: width="250" }


#### Przyciski

W przypadku przycisków podobnie jak i w przypadku przekaźników jest w czym przebierać.
Szczególnie lubię te najmniejsze urządzenia z dwoma przyciskami, pochodzące z rodziny IKEA Tradfri. 
Są dosyć tanie, poza krótkim przyciśnięciem obsługują także te długie, więc możemy wykorzystać je nawet do ściemniania i rozjaśniania.
W moim przypadku z ich pomocą dołożyłem obsługę głównego oświetlenia kuchennego w bardziej wygodnym miejscu — pod okap.
Przyciski mają wbudowany magnes, więc nie było problemu z ich przymocowaniem w tym miejscu.
Zanim odkryłem te przyciski, miałem kostkę Aqara Cube. Dosyć fajny gadżet z dużą liczbą zdarzeń.
Przewrócenie o 90°, 180°, obrót ze wskazaniem kąta, podwójne uderzenie.
Jednak jest dużo mniej intuicyjny od standardowych przycisków i trzeba wiedzieć, co kryje się pod każdą z akcji na kostce.

![Przycisk IKEA Tradfri](/assets/img/posts/2022-02-05-smarthome/tradfriswitch1.png){: width="250" }
![Przycisk IKEA Tradfri](/assets/img/posts/2022-02-05-smarthome/tradfriswitch2.png){: width="250" }
![Kostka Aqara](/assets/img/posts/2022-02-05-smarthome/aqaracube.png){: width="250" }


#### Czujniki ruchu

W moich automatyzacjach używam jedynie czujników ruchu od Xiami/Aqara.
Mogę o nich powiedzieć, że są dosyć małe, dlatego łatwo je wpasować je w każde pomieszczenie.
Mogą się jednak nie sprawdzić w domyślnej konfiguracji, zwłaszcza we wszystkich automatyzacjach, ponieważ raportują swój stan co około minutę-półtora.
Na szczęście istnieją poradniki, jak można łatwo wprowadzić je w tryb testowy, gdzie będą raportować wykryty ruch co 5 sekund.
Korzystam z takiego rozwiązania przy czujniku, który zapala mi światło w przedpokoju. Hack działa już od kilku miesięcy, bez widocznego wpływu na baterię.
W kwestii modyfikacji mogę dodać, że pierwszy czujnik po takiej zmianie działał 2 dni, po czym z nieznanych przyczyn przestał.
Być może przegrzałem go przy lutowaniu, a być może po prostu „nastał jego czas”. Link do modyfikacji: [https://community.smartthings.com/t/making-xiaomi-motion-sensor-a-super-motion-sensor/139806](https://community.smartthings.com/t/making-xiaomi-motion-sensor-a-super-motion-sensor/139806)

![Czujnik ruchu](/assets/img/posts/2022-02-05-smarthome/motionsensor.png){: width="250" }


#### Sensory otwartych okien/drzwi

Podobnie jak w przypadku czujników ruchu, tak i tutaj używam czujników tylko jednego rodzaju. 
Szukałem jak najmniejszych, żeby nie rzucały się w oczy i po analizie kilku wybór padł na te od Aqara.
Ciężko powiedzieć o nich coś więcej niż to, że dobrze spełniają swoją funkcję.
Zasięg między magnesem a czujnikiem może się wahać, w zależności od tego jak ustawimy urządzenia, skierowane do siebie frontem czy bokiem.
Mam urządzenia umieszczone w obydwu wariantach. Odległość między nimi zazwyczaj wynosi około 1 cm i nie zaobserwowałem jeszcze żadnych problemów.

![Głowica termostatyczna](/assets/img/posts/2022-02-05-smarthome/windowsensor.png){: width="250" }

#### Głowice termostatyczne

Temat głowic termostatycznych może być nieco bardziej zawiły, ponieważ mamy sporo wariantów do wyboru. 
Ja wybrałem [Moes BRT-100-TRV](https://www.zigbee2mqtt.io/devices/BRT-100-TRV.html). Przy wyborze kierowałem się liczbą wystawianych informacji oraz zapewnieniem producenta, 
że działają na baterii dłużej niż inne warianty.
Szczegółowe informacje o wystawianych danych dostępne są na stronach projektu [Zigbee2MQTT](https://www.zigbee2mqtt.io/supported-devices/).
Jedna z moich głowic raportuje stan baterii 91%, druga 83%. Obydwie działają od listopada, a w momencie sprawdzania tego stanu mieliśmy połowę stycznia.
W kwestii baterii mogę dodać tylko, że ze względu na różnice w napięciu między bateriami a akumulatorami (1.2V vs 1.5V), konieczne może być używanie zwykłych baterii.

![Głowica termostatyczna](/assets/img/posts/2022-02-05-smarthome/trv.png){: width="250" }

#### Czujniki wycieku wody

Konstrukcyjnie dosyć proste urządzenia. Na ich spodzie znajdują się dwie elektrody, których zwarcie powoduje zmianę stanu czujnika.
W przypadku czujników Xiaomi/Aqara elektrody możemy wykręcić, zmniejszając tym samym poziom, od którego reagują.
Najstarszy z moich czujników ma już dwa lata, a ciągle raportuje stan baterii na 100%, więc bez obaw można umieszczać je w trudno dostępnych miejscach.

![Czujnik wycieku wody](/assets/img/posts/2022-02-05-smarthome/leaksensor.png){: width="250" }

#### Czujniki temperatury

Jedne z moich pierwszych czujników, a jak wspominałem, zaczynałem z bramką od Xiaomi, stąd wybór też tego producenta.
Dużą zaletą kwadratowych czujników temperatury Xiaomi jest to, że poza temperaturą oraz wilgotnością, raportują też ciśnienie atmosferyczne.

![Czujnik temperatury](/assets/img/posts/2022-02-05-smarthome/temperaturesensor.png){: width="250" }

## Bezpieczeństwo i prywatność

W mojej ocenie w całej zabawie w Smart Home warto zwrócić uwagę na prywatność oraz bezpieczeństwo.
Nie wyobrażam sobie trzymać w sieci urządzeń, które zbierają dane i wysyłają je na azjatyckie, niesprawdzone serwery.
W sieci można znaleźć wiele przykładów kamerek, które albo miały słabe zabezpieczenia, albo luki w bezpieczeństwie i pozwalały każdemu na zdalny dostęp.
Dla mnie podstawowym wymaganiem przy tego typu rozwiązaniach jest praca w sieci lokalnej.
Wszystkie systemy i narzędzia dla Smart Home w moim domu mają wycięty dostęp do internetu, a pozwalam na niego jedynie przy okresowych aktualizacjach.
W przyszłości zastanawiam się nad poluźnieniem tej restrykcji dla wybranych serwerów i urządzeń, ponieważ koliduje to nieco z integracją od pralki LG oraz zmywarki Bosch.
Aktualnie, jeśli mam potrzebę dostępu z zewnątrz, to zapewniam sobie ten dostęp sam. Zawsze za pomocą rozwiązań, które uważam za godne zaufania. 
Przykładem takiego dostępu jest VPN, który sam wystawiam oraz integracja HomeKit od iOS.
Zdalny dostęp od Apple (przez HomeKit) dostałem tak naprawdę „out of the box". 
W domu mam zawsze tablet od Apple i tak długo, jak jest naładowany, pozwala innym domownikom z urządzeniami tego samego producenta na zdalny dostęp,
spinając całość przez chmurę Apple.

## To na tyle...

Zabawa w SmartHome nie należy do najtańszych i najłatwiejszych. Mam jednak nadzieję, że lektura tego artykułu nieco przybliży Wam temat inteligentnego domu dla programisty.
To już Wasza decyzja, czy chcecie zająć się całością sami, czy może skorzystać z pomocy specjalistycznych firm.
Jeśli zdecydujecie się na wybór jakieś firmy, to ten artykuł nakieruje Was na możliwe opcje, tak aby nie żałować wydanych pieniędzy.