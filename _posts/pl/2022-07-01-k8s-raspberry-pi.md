---
layout:    post
title:     "Domowy klaster Kubernetesa na Raspberry Pi"
date:      2022-10-14 08:00:00 +010
published: true
didyouknow: false
lang:      pl
author:    bradlinski
afterhours: true
image: /assets/img/posts/2022-10-03-k8s-raspberry-pi/thumbnail.webp
tags:
- k8s
- kubernetes
- devops
- raspberry-pi

---

W tym artykule pokażę jak postawić klaster kubernetesa na popularnych płytkach Raspberry Pi. Czas post pandemicznego kryzysu półprzewodników, niedoboru płytek oraz ich horrendalnych cen na serwisach aukcyjnych, to idealny moment na taki poradnik ;)

## Przygotowanie płytek

Potrzebne będą co najmniej dwie płytki Raspberry Pi 4+. W ostateczności worker node można postawić na wersji 3B. Niższe
wersje płytek są na architekturze 32-bit. O ile sam klaster można na niej postawić, o tyle aplikacji praktycznie nie ma. Jako bazę wykorzystamy system Raspberry Pi OS w wersji 64-bit. Można użyć
oczywiście dowolnego systemu, byle był 64-bit.
Ze strony [raspberrypi.com](https://www.raspberrypi.com/software/operating-systems/#raspberry-pi-os-64-bit) pobieramy
wersję `lite` systemu, rozpakowujemy archiwum i kopiujemy na kartę microSd (klasy 10).
Zakładając, że karta jest reprezentowana przez urządzenie /dev/sdb:

```shell
dd if=wypakowanyObraz.img of=/dev/sdb bs=4M conv=fsync
```

Bardzo ważne, aby karty sd były w dobrym stanie (idealnie, gdyby były nowe). Najistotniejsza jest karta użyta na maszynie master. Po dłuższym czasie użytkowania (około 2 lat) karta, którą miałem na głównej maszynie uległa degradacji. W efekcie w czasie inicjalizacji klastra otrzymywałem timeouty na requestach do `etcd`. Pomogła wymiana karty na nową.

Po uruchomieniu płytki przechodzimy przez wstępną konfigurację (zależnie od wersji systemu pojawi się konfigurator lub od razu zostaniem zalogowaniu na użytkownika 'pi').

Na początku przystępujemy do konfiguracji ssh. Otwieramy plik `/etc/ssh/sshd_config` i ustawiamy opcję `PermitRootLogin`
na `yes`. Następnie przechodzimy na konto root za pomocą `sudo su` i ustawiamy hasło wykorzystując `passwd`. Możemy
także nie ustawiać hasła i pozostawić domyślna wartość `prohibit-password`. W takim przypadku należy skopiować na płytkę klucz publiczny.
Na koniec włączamy usługę ssh:

```shell
systemctl start ssh && systemctl enable ssh
```

Alternatywnie można wykorzystać narzędzie `raspi-config` i włączyć ssh przechodząc do `Interface Options` > `SSH`.

Jeśli planujemy bezprzewodowe połączenie płytek, możemy skorzystać z tego narzędzia do konfiguracji połączenia —
sekcja: `System Options`

Niezależnie od wybranego interfejsu połączenia musimy zadbać o to, aby adresy IP maszyn były stałe. W tym celu otwieramy
plik `/etc/dhcpcd.conf` usuwamy całą zawartość i podajemy:

```shell
interface eth0
static ip_address=192.168.1.203/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8 8.8.4.4
```

Oczywiście adresy i interfejs dostosowujemy do własnych wymagań. Dla połączenia bezprzewodowego domyślnym interfejsem
jest `wlan0`. Osobiście cały klaster trzymam w podsieci, aby uniknąć konfliktów z innymi urządzeniami. Wykorzystuję
dedykowaną płytkę jako bramę do klastra.

Pozostało zrestartować usługę `dhcpcd`:

```shell
systemctl restart dhcpcd
```

Na koniec weryfikujemy, czy mamy połączenie pomiędzy wszystkimi płytkami i każda z nich ma dostęp do internetu.

Po konfiguracji należy upewnić się, że w `/etc/resolv.conf` wśród serwerów dns nie mamy `127.0.0.1`. Pozostawienie tego wpisu spowoduje błędy poda CoreDNS. Posiada on mechanizmy wykrywania pętli.

## Konfiguracja węzłów

Poniższe instrukcje należy wykonać dla każdej maszyny.

### Konfiguracja systemu

Rozpoczynamy od instalacji potrzebnych pakietów:

```shell
apt-get update && apt-get install
lsb-release \
apt-transport-https \
ca-certificates \
software-properties-common \
arptables \
ebtables \
libseccomp2 \
jq
```

Następnie musimy zapewnić dostępność modułów jądra `overlay` i `br_netfilter`. W tym celu tworzymy
plik `/etc/modules-load.d/k8s.conf`:

```shell
overlay
br_netfilter
```

W ten sposób po każdym restarcie moduły będą wczytane automatycznie.

Aby możliwa była komunikacja między podami musimy jeszcze stworzyć plik `/etc/sysctl.d/k8s.conf`:

```
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward=1
```

Moduł `overlay` pozwala na wykorzystanie systemu plików overlay, dzięki czemu kontenery będą miały "swoją" wersję systemu plików (więcej o overlayFs [tutaj](https://www.kernel.org/doc/html/latest/filesystems/overlayfs.html). 
Moduł `br_netfilter` wraz z ustawieniami z `/etc/sysctl.d/k8s.conf` pozwoli na komunikację między podami. Ruch odbywający się między kontenerami w ramach emulowanego mostu (bridge network) będzie podlegał regułom zawartym w iptables węzła (za konstrukcję reguł odpowiada `kube-proxy`). `net.ipv4.ip_forward` pozwala na przekierowanie pakietów z jednego interfejsu sieciowego na inny (system działa ja router).


Na koniec dodajemy do `/boot/cmdline.txt`: `cgroup_enable=cpuset cgroup_enable=memory swapaccount=1`
`cpuset` oraz `memory` w kontekście k8s pozwala na ograniczenie zasobów poszczególnym podom. Więcej o control groups [tutaj](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/cgroups.html). Włączenie `swapaccount` powoduje śledzenie i ograniczenie wykorzystania pamięci swap w ramach kontenerów. Istotne jest to z tego względu, że k8s nie wspiera obecnie pamięci swap (wsparcie alpha od wersji 1.22). Dlatego też na każdym nodzie musimy wyłączyć pamięć swap za pomocą komendy.

```shell
systemctl disable dphys-swapfile.service
```

Jeśli swap nie będzie wyłączony, inicjalizacja klastra zakończy się błędem.


### Instalacja containerd

Od wersji `1.20` kubernetes przestał wspierać Dockera jako domyślne środowisko uruchamiania dla kontenerów. 
Docker nie implementuje standardu `CRI`. Był wspierany przez kuberenetesa, gdyż nie było wystarczająco dobrych/popularnych
alternatyw (no i na początku standard CRI nawet nie istniał). Obecnie sytuacja jest nieco inna. W obecnym kształcie docker jest tylko pośrednikiem między k8s, a
containerd. Dodatkowo wymaga to utrzymywania dodatkowej warstwy implementującej CRI - docker-shim (został usunięty w wersji 1.24 więcej informacji [tutaj](https://kubernetes.io/docs/tasks/administer-cluster/migrating-from-dockershim/check-if-dockershim-removal-affects-you/)). 

Na naszym klastrze zainstalujemy containerd.

Binarki containerd pobieramy z oficjalnego repozytorium i umieszczamy ja w katalogu `/usr/local`.

```
https://github.com/containerd/containerd/releases/download/vWERSJA/containerd-WERSJA-linux-arm64.tar.gz
```

W moim przypadku `WERSJA=1.6.6`.

Następnie tworzymy katalog `/etc/containerd` i uzupełniamy go domyślną konfiguracją za pomocą:

```shell
containerd config default > /etc/containerd/config.toml
```

W wygenerowanym pliku odnajdujemy `SystemdCgroup = false` i zmieniamy na `SystemdCgroup = true`.

Następnie tworzymy katalog `/usr/local/lib/systemd/system/` i zapisujemy w nim definicję usługi dostępną
na 
```
https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
```

Containerd zarządza obrazami, siecią i storagem.


W kolejnym kroku instalujemy program `runc`.
```
https://github.com/opencontainers/runc/releases/download/vWERSJA_RUNC/runc.arm64
```
W moim przypadku `WERSJA_RUNC=1.1.3` i instalujemy ją pod ścieżką `/usr/local/sbin/runc` z prawami dostępu 755.

Runc to narzędzie najniższego poziomu, odpowiada za tworzenie i uruchamianie kontenerów.


W repozytorium containerd znaleźć można także archiwa z pluginami CNI. Nie musimy ich specjalnie instalować. W dalszych krokach będziemy aplikować do k8s manifest konkretnego pluginu. Po zaaplikowaniu, binarki zainstalowane zostaną automatycznie za pomocą initConteinera (przynajmniej jeśli chodzi o pluginy, które testowałem).



Pozostaje nam już tylko przeładować usługi i włączyć usługę containerd:

```shell
systemctl daemon-reload && systemctl enable --now containerd
```

Po wszystkim restartujemy system.

### Instalacja kubeadm, kubectl i kubelet

Dodajemy klucz repozytorium k8s:

`curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -`

Tworzymy `pliki /etc/apt/sources.list.d/k8s.list`:

```
deb http://apt.kubernetes.io/ kubernetes-xenial main
```

I instalujemy aplikacje:

```shell
apt-get update && apt-get install kubeadm kubectl kubelet
```

Po pomyślnej instalacji uruchamiamy usługę kubelet:

```shell
systemctl restart kubelet
```

## Konfiguracja mastera

Mając już przygotowaną bazę dla wszystkich węzłów, możemy przejść do inicjalizacji mastera. Wykonujemy polecenie:

```shell
kubeadm init 
```

Po poprawnej inicjalizacji zwrócone zostanie polecenie wraz z tokenem, pozwalające na przyłączenie workerów do
klastra. Polecenie to można także wygenerować, uruchamiając na masterze:

```shell
kubeadm token create --print-join-command 2>/dev/null
```

Na koniec pozostaje nam zainstalować jeden z dostępnych pluginów CNI, wymaganych do działania klastra k8s. Osobiście testowałem pluginy:
 - wave ([manifest](https://cloud.weave.works/k8s/net?k8s-version=) - w url manifestu musimy wskazać konkretną wersję pozyskaną za pomocą `$(kubectl version | base64 | tr -d '\n'))`
 - flannel ([manifest](https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml))
 - calico ([manifest](https://docs.projectcalico.org/manifests/calico.yam))


W przypadku pluginu flannel musimy do komendy iniciującej klaster dodać parametr:

```shell
kubeadm init --pod-network-cidr=10.244.0.0/16
``` 
Jest to domyślna pula adresów rezerwowana dla podów w pluginie flannel. Z jakiegoś powodu nie jest on w stanie wykryć puli zaalokowanej przez k8s przy inicjalizacji. 

Co prawda jest to mało prawdopodobne w przypadku domowego klastra, ale należy pamiętać, że pule adresów wskazane w ramach parametrów `pod-network-cidr` (jeśli nie podamy k8s sam zaalokuje adresy) i `service-cidr` (dla tego parametru domyślną wartością jest 10.96.0.0/12) nie powinny być zajęte.


Przed zaaplikowaniem manifestu przygotowujemy konfigurację dla kubectl. W tym celu kopiujemy
plik `/etc/kubernetes/kubelet.conf` pod ścieżkę `/root/.kube/config`

Niezależnie od tego, który plugin wybierzemy, aplikujemy manifest za pomocą:

```shell
kubectl apply -f ścieżka/do/manifestu
```

## Konfiguracja workera

Konfiguracja workera sprowadza się do wywołania komendy wygenerowanej w czasie inicjalizacji klastra, np.: 

```shell
kubeadm join 192.168.1.101:6443 --token et57r8.rezqsvudyqfd0c3z --discovery-token-ca-cert-hash sha256:01e7e5a9a30b7a6d2b8a04465f50c5fe8c43f595b7e30cd325dfb494bd69b624
```

Po dodaniu wszystkich workerów do klastra, na masterze wykonujemy komendę:

```shell
kubect get nodes 
```

W odpowiedzi powinniśmy otrzymać:

```shell
k8s-master-1   Ready    control-plane   165m   v1.24.2
k8s-worker-3   Ready    <none>          159m   v1.24.2
k8s-worker-4   Ready    <none>          159m   v1.24.2
k8s-worker-5   Ready    <none>          159m   v1.24.2
k8s-worker-6   Ready    <none>          159m   v1.24.2
k8s-worker-7   Ready    <none>          159m   v1.24.2
```

I to wszystko, jeśli chodzi o podstawowy klaster k8s. Pozostaje poczekać na start wszystkich podów. Możemy to
zweryfikować za pomocą:

```shell
kubectl get pods --all-namespaces
```

```shell
kube-system            coredns-6d4b75cb6d-cztbh                    1/1     Running            0                167m
kube-system            coredns-6d4b75cb6d-w7n5l                    1/1     Running            0                167m
kube-system            etcd-k8s-master-1                           1/1     Running            7                167m
kube-system            kube-apiserver-k8s-master-1                 1/1     Running            7                167m
kube-system            kube-controller-manager-k8s-master-1        1/1     Running            4                167m
kube-system            kube-flannel-ds-5b29d                       1/1     Running            0                162m
kube-system            kube-flannel-ds-75sqv                       1/1     Running            0                162m
kube-system            kube-flannel-ds-gvr52                       1/1     Running            0                162m
kube-system            kube-flannel-ds-jhfnm                       1/1     Running            0                162m
kube-system            kube-flannel-ds-n5pnn                       1/1     Running            0                162m
kube-system            kube-flannel-ds-vjczl                       1/1     Running            0                167m
kube-system            kube-proxy-6p8hf                            1/1     Running            0                162m
kube-system            kube-proxy-6zmff                            1/1     Running            0                162m
kube-system            kube-proxy-75p5b                            1/1     Running            0                162m
kube-system            kube-proxy-7msjd                            1/1     Running            0                167m
kube-system            kube-proxy-ph9hf                            1/1     Running            0                162m
kube-system            kube-proxy-q7bxw                            1/1     Running            0                162m
kube-system            kube-scheduler-k8s-master-1                 1/1     Running            7                167m

```

W kolejnej części zaprezentuję jak skonfigurować dodatkowe elementy klastra (ingress, dns, loadbalancer itd.), tak aby wycisnąć z niego maksimum możliwości. 

Wszystkie kroki (poza etapem konfiguracji płytek) można znaleźć [tutaj](https://github.com/m87/pi-k8s-base) w formie playbooka Ansible.





