---
layout:    post
title:     "Ansible - jak uporządkować chaos?"
date:      2020-07-03 15:00:00 +0100
published: true
author:    rmastalerek
image:     /assets/img/posts/2020-07-03-ansible-jak-uporzadkowac-chaos/chaos.png
tags:
    - ansible
    - automation
    - devops
---

Czy istnieje możliwość usprawnienia istniejących procesów instalacji aplikacji lub nawet całych systemów mimo, że te sprawdzają się już od wielu lat? Okazuje się, że tak. Można dzięki temu zaoszczędzić trochę czasu na analizę występujących problemów, a także zwiększyć czytelność skryptów wykorzystywanych do instalacji. Ponadto można z administratora zdjąć obowiązek orientowania się w konfiguracji dziesiątek serwerów. 

Wystarczy w tym celu zastosować oprogramowanie do automatyzacji procesów. Takim narzędziem może być Ansible od Red Hat’a. W poniższym artykule opisano przykłady wykorzystania Ansible’a do instalacji platformy Eximee oraz kilku mikroserwisów wykorzystywanych przez klientów firmy. Opisane zostały podstawowe elementy oprogramowania i ich wykorzystanie. Wspomniano o sytuacjach, które można było zrobić lepiej podczas implementacji. Na koniec wymieniono główne zalety migracji ze skryptów bashowych na Ansible.

## Jak było kiedyś?
Zręczność tworzenia skryptów w bashu od dawna jest ważną umiejętnością administratorów systemów informatycznych i osób działających w obszarze DevOps. Pozwala automatyzować dowolne zadania od tworzenia plików i nadawania im odpowiednich uprawnień, po wdrażanie i konfigurowanie gotowych aplikacji na docelowych serwerach. Skoro więc istnieją już sprawdzone i stosowane od wielu lat sposoby automatyzacji procesów, to czy warto je modyfikować lub usprawniać? Innymi słowy, czy jest sens zmieniać coś, co działa?

Platforma Eximee, którą rozwijamy, instalowana była właśnie przy użyciu skryptów bashowych. Wszystkie wykorzystywane tam funkcje przez lata zostały doszlifowane, aby spałniały konkretne wymagania klientów i były na tyle uniwersalne, aby ograniczyć liczbę wprowadzanych w nich zmian. Napisany kod spełniał wszystkie założenia – tworzył odpowiednią strukturę katalogów, nadawał uprawnienia, zastępował placeholdery odpowiednimi wartościami z pliku konfiguracyjnego, startował poszczególne aplikacje osadzone wcześniej w katalogach docelowych, itp. 

Choć proces wydaje się prosty, to nie każda instalacja platformy kończyła się sukcesem. Przyczyn bywało kilka – niechęć instalującego do dokładnego zapoznania się z dokumentacją, czy choćby brak wcześniejszego doświadczenia we wdrażaniu platformy. Zawsze mogła zdarzyć się sytuacja, że nie wszystkie parametry instalacyjne zostały ustawione. Także użytkownik, z którego uruchamiano skrypt był nie bez znaczenia. Musiał on posiadać wszystkie uprawnienia do wykonania zawartych w kodzie instrukcji. Każda z wymienionych przyczyn wymagała analizy. Aby ta była możliwa konieczne było logowanie poszczególnych etapów wykonania skryptu i wartości, które miały wpływ na nieudaną instalację. Fakt ten wymagał przygotowania dodatkowych instrukcji tworzących plik z logiem i wypisujących stan instalacji na ekran konsoli użytkownika, tym samym zwiększajac złożoność i rozmiar skryptu. 

Sam start instalacji był dość prosty. Wystarczyło rozpakować archiwum ZIP, zawierające piki instalacyjne platformy Eximee i wykonać znajdujący się tam skrypt, przekazując plik z ustawieniami dostosowanymi dla danego serwera. Plik z ustawieniami tworzony był po stronie klienta i rozwijany w oparciu o załączane instrukcje. 

Uruchomienie skryptu instalacyjnego:
```bash
$ ./update.sh ~/config/settings.sh
```

Co działo się po uruchomieniu skryptu update.sh? Zasadniczo za każdym razem to samo. Zatrzymywane były kluczowe procesy (Tomcat, Servicemix, itd.), usuwane były „ślady” po poprzedniej instalacji, rozpakowywana była zawartość archiwum, a wszystkie pliki trafiały do ustalonej struktury katalogów na serwerze klienta. Na koniec ponownie uruchamiane były kluczowe aplikacje. Przykładowa funkcja usuwająca dotychczas wyglądała tak:

```bash
function cleanOldVersion {
     	log "Czyszczenie poprzedniej instalacji"
    	
   	CONFIGS="${installSettings['ROOT']}/${installSettings['CONFIG_FOLDER']}"
    	BINS="${installSettings['ROOT']}/${installSettings['BINARIES_FOLDER']}"
    
   	log "Usuwanie: $CONFIGS/eximee/bundles_config"
    	rm -rf $CONFIGS/eximee/bundles_config || fail "Blad przy czyszczeniu poprzedniej instalacji"
    
   	log "Usuwanie: $CONFIGS/eximee/logback"
    	rm -rf $CONFIGS/eximee/logback || fail "Blad przy czyszczeniu poprzedniej instalacji"
    
   	log "Usuwanie: find $CONFIGS/eximee/ -maxdepth 1 -type f -name \*.xml"
    	find $CONFIGS/eximee/ -maxdepth 1 -type f -name *.xml | grep -v "konfiguracja-partnera" | 
   	grep -v 	"knowledge-base" | xargs rm -rf || fail "Blad przy czyszczeniu 	poprzedniej instalacji"
    
   	log "Czyszczenie tomcata.\nUsuwanie plików i katalogów bez webapps"
    	find $BINS/tomcat/ -maxdepth 1 -mindepth 1 -not -name "webapps" | xargs rm -rf
    
   	log "Usuwanie aplikacji bez knowledgebase"
    	find $BINS/tomcat/webapps/ -maxdepth 1 -mindepth 1 -not -name "knowledgebase*" | 	xargs rm -rf
   
   	log "Czyszczenie tomcata 9 na JVM 11.\nUsuwanie plików i katalogów bez webapps"
    	find $BINS/tomcat-jvm11/ -maxdepth 1 -mindepth 1 -not -name "webapps" | xargs rm -rf
    
   	log "Usuwanie aplikacji bez knowledgebase"
    	find $BINS/tomcat-jvm11/webapps/ -maxdepth 1 -mindepth 1 -not -name "knowledgebase*" | 	xargs rm -rf
   
    	log "Usuwanie: $BINS/eximee/bundles/\*"
    	rm -rf $BINS/eximee/bundles/* || fail "Blad przy czyszczeniu poprzedniej instalacji"
    
   	log "Usuwanie: $BINS/eximee/bundles-jvm11/\*"
    	rm -rf $BINS/eximee/bundles-jvm11/* || fail "Blad przy czyszczeniu poprzednieji instalacji"
    
   	if [ -d $BINS/servicemix/data/cache/bundle212 ]; then
     		log "Usuwanie: $BINS/servicemix/data/cache/bundle212"
     		rm -rf $BINS/servicemix/data/cache/bundle212 || fail "Blad przy czyszczeniu 				poprzedniej instalacji"
    	fi
    
   	log $PHASE_SEPARATOR
    
   	log "Czyszczenie zalezne od platformy"
    	cleanSystemBased || fail "Blad czyszczenia czesci zaleznej od platformy"
    	log $PHASE_SEPARATOR
   }
```
Niby nic nadzwyczajnego, a jednak na samo logowanie postępu i usunięcie plików, które i tak zostaną ponownie wgrane na środowisko wraz z nową paczką, przeznaczono jakieś 30 linii kodu. Choć logowanie niekoniecznie było niezbędne, to jednak pozwalało śledzić kolejne etapy procesu instalacji, dając większą wiedzę osobom analizującym ewentualne przyczyny nieudanej instalacji.

W takim razie, co miał zrobić administrator systemu, który chciałby skrócić proces i zainstalować tylko te komponenty, które uległy zmianie? No cóż, musiał on wykazać się nie lada cierpliwością i pewnością siebie, modyfikując dołączony do paczki skrypt instalacyjny lub po prostu pogodzić się z faktem, że nie da się tego zrobić „na skróty”. 

Jakby tego było mało, chcąc zainstalować kompletną platformę na „świeżym” środowisku konieczna była praca z kilkoma archiwami zip, które zawierały poszczególne składowe systemu. Osobno bowiem dostarczano strukturę bazy danych, frontend, backend czy aplikacje do zarządzania systemem plików. W skrócie, aby administrator zainstalował platformę Eximee musiał co najmniej 4 razy powtórzyć podobny proces dla każdej części platformy. 

## Era Ansible ![Logo Ansible](/assets/img/posts/2020-07-03-ansible-jak-uporzadkowac-chaos/ansible.png)
Już od wczesnych lat studiów programistom wpaja się, aby dążyć do utrzymania eleganckiej i czytelnej struktury swoich aplikacji (`KISS – Keep it simple, stupid`). Doskonale w ten trend wpasowuje się **Ansible**. To kupione przez firmę **Red Hat** opensource’owe oprogramowanie m.in. do automatyzacji procesu wdrażania aplikacji i zarządzania konfiguracją. Za pomocą języka **YAML**, w prosty sposób pozwala opisać wzajemne relacje między systemami. 

Czytając dokumentację dostajemy obietnicę ujednolicenia konfiguracji, organizacji złożonych procesów i jednocześnie łatwą do zarządzania architekturę. Ponadto czytamy, że Ansible pozwala osiągnąć wzrost wydajności i nie nakłada dodatkowych wymagań na otoczenie, w którym działa. 

Do pracy z Ansible wymagane jest tylko, aby na maszynie sterującej zainstalowane były: 
- Python 2.7 lub Python 3.5+
- Ansible (np. przy użyciu Python Package Manager’a) 

Ansible wymaga hasła lub klucza SSH w celu rozpoczęcia zarządzania systemami i może rozpocząć zarządzanie nimi bez instalowania oprogramowania agenta, unikając problemu „zarządzania zarządzaniem” powszechnego w wielu systemach do automatyzacji.

Ansible łączy się z systemami poprzez mechanizmy transportowe – SSH (Unix) lub PowerShell (Windows). **Moduły**, które są małymi programami, zawierające uzupełnione argumenty, przenoszone są do tymczasowego katalogu przez wspomniane mechanizmy na zarządzane maszyny. Tam są wykonywane, a następnie usuwane w ramach jednej akcji. Moduły zwracają obiekty JSON na standardowe wyjście, a te z kolei przetwarzane są przez program Ansible na maszynie sterującej. Mogą one zarządzać idempotentnymi zasobami. Oznacza to, że moduł działa w sposób deklaratywny, czyli może zdecydować np. czy dany pakiet powinien zostać zainstalowany w określonej wersji lub nie wykonać żadnej akcji, gdy system jest już w pożądanym stanie. Można je też uruchamiać pojedynczo (imperatywnie).

Do zarządzania administrowanymi systemami służą pliki **inventory**. Pozwalają one na grupowanie serwerów i definiowanie zmiennych, które później wykorzystywane będą w tzw. **playbookach**. Plik inventory może być użyty globalnie, gdzie zainstalowano Ansible lub wykorzystać lokalne pliki inventory dedykowane dla konkretnego projektu. Przykładowy fragment pliku inventory wygląda następująco:
```yaml
# eximee-ansible/settings/settings-template.yml

### Ogólne parametry instalacji

validation_protocol: http
validation_host: eximee-validation
validation_port: 8080
services_protocol: http
services_host: eximee-services
services_port: 8080
servicemix_host: eximee-servicemix
{% raw %}validation_url: "{{ validation_protocol }}://{{ validation_host }}:{{ validation_port }}/osgi-bridge/validation/"
services_url: "{{ services_protocol }}://{{ services_host }}:{{ services_port }}/osgi-bridge/serviceproxy/"
eximee_status_url: "{{ eximee_status_protocol }}://{{ eximee_status_host }}:{{ eximee_status_port }}/eximee-status/"
repository_url: "{{ repository_protocol }}://{{ repository_host }}:{{ repository_port }}/repository/"{% endraw %}
repository_username: UZUPELNIJ
repository_password: UZUPELNIJ
mongodb_host: eximee-mongo
mongo_db_auth: MONGODB-CR
...
```
W pliku inventory znajdują się zatem dane dotyczące hostów, używanych portów czy dane uwierzytelniające. W inventory warto umieścić również takie zmienne, które są częściej wykorzystywane w playbookach lub zależne są np. od serwerów, na którym instalujemy aplikację. Nie powinno się bowiem modyfikować playbooków przy okazji każdej instalacji, a utrzymywać dla danego serwera odpowiednią konfigurację. W przypadku platformy Eximee takimi zmiennymi są np. adresy URL różnych aplikacji. Warto też zwrócić uwagę, że adresy w powyższym przykładzie nie są zdefiniowane „na sztywno”. Zawierają one odwołania do kilku innych zmiennych tworząc nową wartość, na co również pozwala Ansible.

Wiedząc już czym jest moduł oraz gdzie należy umieścić konfigurację, potrzebna jest jeszcze wiedza, jak definiować pewien stan systemu, który chcemy osiągnąć. Do tego właśnie służą **playbooki**. Definicja takiego stanu dzieli się na taski. Zwiększa to nie tylko czytelność kodu playbooka, ale też oddziela od siebie niezależne etapy instalacji. 
```yaml 
# eximee-ansible/platform.yml

---
- name: Create installation_tmp dir
  hosts: localhost
  become: no
  connection: local
  tasks:
    - file:
        path: "{{ eximee_platform_dest }}/installation_tmp"
        state: directory

- import_playbook: check-settings.yml
- import_playbook: eximee-common.yml
- import_playbook: dmzzew.yml
- import_playbook: dmz.yml
- import_playbook: formstore.yml

- name: Remove installation_tmp dir
  hosts: localhost
  become: no
  gather_facts: false
  connection: local
  tasks:
    - file:
        path: "{{ eximee_platform_dest }}/installation_tmp"
        state: absent
```
W powyższym przykładzie widoczne są dwa proste zadania. Pierwsze, o nazwie Create installation_tmp dir tworzy tymczasowy katalog instalacyjny installation_tmp w lokalizacji, która zdefiniowana została pod zmienną eximee_platform_dest. Drugie (`Remove installation_tmp dir`) ten katalog usuwa. Pomiędzy tymi zadaniami zaimportowane zostały odseparowane logicznie playbooki. Każdy z nich instaluje odrębną część platformy, a ich rozdzielenie jeszcze bardziej zwiększa czytelność kodu. Co ciekawe, również importowane playbooki zostały odpowiednio podzielone na **role**, które, na podstawie określonej struktury plików, pozwalają na automatyczne ładowanie zmiennych czy tasków. Ponadto, grupowanie zadań w role pozwala na ich łatwe reużywanie.

Jak uruchomić taki skrypt instalacyjny? Nic prostszego – wystarczy poniższa instrukcja: 
```bash
$ ansible-playbook nazwa_playbooka.yml
```

Docelowo więc pierwotna struktura paczki wdrożeniowej, składającej się ze skryptów bashowych, domyślnych parametrów konfiguracyjnych i plików z platformą, nabrała nowego charakteru. Wprowdzone modyfikacje pozwoliły na wydzielenie wielu plików z odseperowanymi logicznie zadaniami, które nie musiały już być rozpakowywane na maszynie docelowej, a jedynie uruchomione z odpowiednim użytkownikiem z poziomu maszyny kontrolnej:
```
eximee-ansible
|──common
|──roles                                   # katalog agregujący role
|   |──java8                               # rola java8
|   |   |──tasks                           # taski zdefiniowane w ramach roli java8
|   |   |   |  ensure-dir-exists.yml     
|   |   |   |  install.yml
|   |   |   |  main.yml
|   |   |   |  unarchive.yml
|   |──java11
|   |   |──tasks                           # taski zdefiniowane w ramach roli java11
|   |   |   |  ...
|   |──tomcat-server                       # rola tomcat-server
|   |   |──tasks                           # taski zdefiniowane w ramach roli tomcat-server
|   |   |   |  main.yml
|   |   |   |  server.yml
|   |   |   |  setup.yml
|   ...
|──settings                                # ogólne parametry instalacji 
|   |   settings-template.yml             
|   check-settings.yml                     # playbook weryfikujący czy wszystkie wymagane parametry instalacyjne zostały zdefiniowane
|   formstore.yml                          # playbook instalacyjny dla roli formstore
|   platform.yml                           # główny playbook instalacyjny
|   ...
```

Jakie korzyści niosła za sobą taka zmiana? Tych było kilka:
- idempotenetność stanu docelowego – nie instalujemy czegoś, co już jest w pożądanym stanie;
- możliwość zarządzania konfiguracjami poszczególnych komponentów platformy Eximee;
- platforma dostarczana jest jedną paczką, zawierającą wszystkie komponenty;
- instalacja odbywać się będzie bardzo podobnie, jak miało to miejsce w przypadku skryptów bashowych – uruchamiany będzie główny playbook wraz ze wskazanaiem pliku konfiguracyjnego;
- możliwość uruchomienia skryptów z poziomu maszyny sterującej – system będzie wiedział na jakim serwerze ma zostać zainstalowana platforma;
- instalowane będą tylko te aplikacje, których konfiguracja się zmieniła;
- wbudowany mechanizm logowania postępu instalacji;
- znaczna poprawa czytelności;
- łatwa możliwość rozszerzerzania skryptów – np. o tagi, pozwalające na wykonanie skryptów tylko dla danego komponentu lub grupy komponentów.

## Ansible, a instalacja mikroserwisów
Przejście na nowy sposób instalacji wykonane zostało nie tylko dla komponentów platformy, ale też dla mikroserwisów dostarczanych dla jednego z klientów. W każdym takim mikroserwisie, będącym klasyczną aplikacją Spring Bootową, wydzielono dodatkowy moduł, w którym zdefiniowano taski odpowiedzialne za:
  - kopiowanie wykonywalnego jara na docelowe środowisko, pod określoną w konfiguracji lokalizację;
  - utworzenie katalogu z konfiguracją;
  - kopiowanie konfiguracji do utworzonego katalogu;
  - utworzenie katalogu z logami;
  - kopiowanie konfiguracji logback’a na środowisko docelowe;
  - restart aplikacji, jeżeli ta jest już uruchomiona na środowisku;
  - weryfikację działania aplikacji.

Instalacja takiego mikroserwisu sprowadzała się do uzupełnienia parametrów konfiguracyjnych w pliku hosts-template.yml oraz wykonania polecenia: 
```bash
$ ansible-playbook -i hosts-template.yml microservice-x.yml -vvvv
```

Plik microservice-x.yml to nic innego, jak główny playbook grupujący w rolach wszystkie powyższe zadania. Playbook jest bardzo prosty i wygląda następująco:
```yaml
---
- name: deploy microservice-x
  hosts: lan
  become: '{{ switch_user }}'
  become_user: '{{ switched_user }}'
  roles:
    - microservice-x
```
Już na pierwszy rzut oka widać, że wspomniane taski mogły zostać z powodzeniem wydzielone do osobnego projektu. Ten odrębny byt mógłby stać się wspólnym elementem dla wszystkich mikroserwisów po to, by nie powielać kodu i zmniejszyć złożoność dodatkowego modułu. W takich kwestiach bardzo pomocny jest rozdział poświęcony dobrym praktykom w samej dokumentacji Ansible, dostępny pod adresem: [**dobre praktyki**](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html).

Podczas pierwszych wdrożeń na środowisku klienckim okazało się, że konieczne jest wprowadzenie dodatkowej konfiguracji. Powyższa definicja playbooka jest już w nią zaopatrzona. Chodzi bowiem o dyrektywy `become` oraz `become_user`. Pierwsze instalacje aplikacji kończyły się niepowodzeniem z powodu braku odpowiednich uprawnień. Dyrektywa `become` pozwala na ich tzw. eskalację czyli wykonanie zadania z uprawnieniami innego użytkownika, niż obecnie zalogowany (zdalny). Innymi słowy zastosowanie dyrektywy `become` pozwala na wykonanie poleceń przy użyciu takich narzędzi jak sudo, su, runas, itd. Jeżeli zdefiniowana zostanie jedynie dyrektywa `become`, użytkownik domyślnie otrzymuje uprawnienia root’a. Problem w tym, że nie zawsze to właśnie ten użytkownik był tym pożądanym. Tu z pomocą przyszła dyrektywa `become_user`, która pozwala na zdefiniowanie nazwy użytkownika, z którym mamy np. wykonać odpowiednie zadanie. Wykorzystanie w powyższym przykładzie playbooka następujących wartości: 
```yaml
switch_user: yes            # włączenie eskalacji uprawnień
switched_user: tomcat       # przełączenie na użytkownika o nazwie tomcat
```
pozwoli na wykonanie zadań z poziomu użytkownika o nazwie tomcat, a nie tego, który jest obecnie zalogowany na serwerze.

## Śledzenie postępów instalacji
Ansible dostarcza wbudowany mechanizm logowania, pozwalający na śledzenie postępów instalacji oraz uzyskanie informacji, które zadania zostały wykonane, a które nie. Przykładowy log procesu instalacji mikroserwisu wygląda następująco:
```
PLAY [deploy microservice-x] ********************************************************************************************************************************************************************************

TASK [Gathering Facts] **********************************************************************************************************************************************************************************
[WARNING]: Platform linux on host lan is using the discovered Python interpreter at /usr/bin/python, but future installation of another Python interpreter could change this. See
https://docs.ansible.com/ansible/2.9/reference_appendices/interpreter_discovery.html for more information.
ok: [lan]

TASK [microservice-x : copy microservice-x jar] *****************************************************************************************************************************************************************
[WARNING]: Unable to find '../files/bundles' in expected paths (use -vvvvv to see paths)

TASK [microservice-x : create config directory] *************************************************************************************************************************************************************
ok: [lan]

TASK [ microservice-x : copy application properties] *********************************************************************************************************************************************************
ok: [lan] => (item=/home/users/rmastalerek/Projects/Eximee/microservice-x/microservice-x-deploy/src/main/ansible/install/roles/microservice-x/files/../templates/application.properties.j2)

TASK [microservice-x : make sure logs directory exists] *****************************************************************************************************************************************************
ok: [lan]

TASK [microservice-x : create logs directory] ***************************************************************************************************************************************************************
skipping: [lan]

TASK [microservice-x : make sure sensitive logs directory exists] *******************************************************************************************************************************************
ok: [lan]

TASK [microservice-x : create sensitive logs directory] *****************************************************************************************************************************************************
skipping: [lan]

TASK [microservice-x : copy logback conf] *******************************************************************************************************************************************************************
ok: [lan]

TASK [microservice-x : get pid of microservice-x] ***************************************************************************************************************************************************************
changed: [lan]

TASK [microservice-x : kill microservice-x processes] ***********************************************************************************************************************************************************
changed: [lan] => (item=14454)

TASK [microservice-x : wait_for] ****************************************************************************************************************************************************************************
ok: [lan] => (item=14454)

TASK [microservice-x : stop microservice-x] *********************************************************************************************************************************************************************

TASK [microservice-x : start/restart microservice-x] ************************************************************************************************************************************************************
changed: [lan]

TASK [microservice-x : check if microservice-x process exists] **************************************************************************************************************************************************
ok: [lan]

TASK [microservice-x : report status of service] ************************************************************************************************************************************************************
skipping: [lan]

TASK [microservice-x : report status of service] ************************************************************************************************************************************************************
ok: [lan] => {
    "msg": "Microservice-x works"
}

PLAY RECAP **********************************************************************************************************************************************************************************************
lan             : ok=12   changed=3    unreachable=0    failed=0    skipped=5    rescued=0    ignored=0 
```
Sposób prezentowania informacji przez Ansible jest dość czytelny. Instalację rozpoczyna uruchomienie playbooka o nazwie deploy microservice-x. Następnie wykonywany jest domyślny, ansible’owy task `Gathering Facts`, który zbiera informację o hostach, na których wykonywane będą zmiany. Później już wykonywane są wszystkie zadania zdefiniowane w playbooku i wykorzystywanych rolach. Każde zadanie kończy się pewnym statusem. Na powyższym przykładzie widać, że zadania uzyskały takie statusy, jak: **ok**, **changed** czy **skipping**. Dzięki wspomnianej na początku idempotentności niektóre zadania zostały pominięte, ponieważ system był już w pożądanym stanie. Tym zadaniom system przypisał status **ok**. Taski, które wymagały wykonania jakiejś zmiany na serwerze oznaczone zostały statusem **changed**. Status **skipping** został przypisany zadaniom, których wykonanie zostało oparte o pewien warunek, a ten z kolei nie został spełniony. 

Każde wykonanie playbooka kończy się podsumowaniem. Zawiera ono zbiorczą informację dotyczącą wszystkich zadań oraz ich końcowych statusach. Gdyby okazało się, że jeden z kluczowych tasków nie może zostać wykonany, np. z powodu braku połączenia z serwerem docelowym, to skrypt zakończyłby swoje wykonanie na tym zadaniu, np.:
```
PLAY [deploy microservice-x] ********************************************************************************************************************************************************************************

TASK [Gathering Facts] **********************************************************************************************************************************************************************************
fatal: [lan]: UNREACHABLE! => {"changed": false, "msg": "Failed to connect to the host via ssh: ssh: Could not resolve hostname some.host.consdata.local: Temporary failure in name resolution", "unreachable": true}

PLAY RECAP **********************************************************************************************************************************************************************************************
lan                        : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0
```
Ansible daje możliwość wykonania playbooka z większą ilością informacji poprzez użycie przełącznika verbose (-vvv lub -vvvv z możliwością debugowania połączenia)

## Podsumowanie
Zgrabne zarządzanie konfiguracją, automatyzacja i uproszczenie procesu instalacji, do tego czytelność i większa kontrola nad procesem wdrażania aplikacji. To główne zalety tego, co udało się wprowadzić zastępując nieco archaiczne podejście oparte o bashowe skrypty. 

Wymienione korzyści wpływają przede wszystkim na skrócenie czasu wykonywania powtarzalnych czynności. Sama automatyzacja pozwala ograniczyć do minimum ryzyko popełnienia błędu ludzkiego podczas instalowania aplikacji. Zapis kroków instalacji aplikacji czy systemu w postaci prostych tasków oraz grupowanie ich w moduły a następnie playbooki pozwala na standaryzację procesu. To z kolei wyklucza niepotrzebne wykonywanie ręcznych zmian i późniejszą, często czasochłonną analizę problemu, gdy taki wystąpi. Dzięki plikom inventory nie jest konieczne utrzymywanie przez administratora konfiguracji do znacznej ilości serwerów i dokumentacji do nich. Niewątpliwą zaletą Ansible jest przewidywalność. Zapewnia ona efektywną pracę administratora czy DevOpsa i ogranicza wystąpienie nieoczekiwanych problemów. 