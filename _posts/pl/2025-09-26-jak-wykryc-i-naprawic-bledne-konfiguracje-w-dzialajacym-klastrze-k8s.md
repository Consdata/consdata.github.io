---
layout:    post
title:     Jak wykryć i naprawić błędne konfiguracje w działającym klastrze Kubernetes
description: ""
date:      2025-09-26T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: bdomzalski
image: /assets/img/posts/2025-09-26-jak-wykryc-i-naprawic-bledne-konfiguracje-w-dzialajacym-klastrze-k8s/thumbnail.webp
tags:
- kubernetes
---

**Kubernetes** na dobre wpisał się w krajobraz nowoczesnych technologii. To narzędzie, które usprawnia codzienną pracę zespołów DevOps, 
pozwalając łatwo uruchamiać, skalować i utrzymywać aplikacje oparte na kontenerach. Nic dziwnego, że tak szybko zdobyło popularność – 
daje sporą swobodę i elastyczność w budowaniu usług.

Z drugiej strony, ten komfort ma też swoją cenę. Każdy, kto pracował z większym klastrem, wie, 
że drobna pomyłka w konfiguracji potrafi urosnąć do problemu na ogromną skalę. Skutki bywają różne – 
od chwilowych przerw w działaniu aplikacji, przez otwarte furtki bezpieczeństwa, aż po poważne ryzyko utraty danych. 
A to oznacza nie tylko kłopoty techniczne, ale także realne koszty dla firmy i jej klientów.

## Gdy konfiguracja zawodzi – przykład z Teslą
Najlepszym dowodem na to, że błędne ustawienia mogą mieć realne skutki, jest głośny incydent z 2018 roku, 
gdy hakerzy dostali się do chmurowego środowiska Tesli. Winowajcą okazał się otwarty, **niezabezpieczony dashboard Kubernetes**. 
Intruzom udało się dzięki temu zainstalować koparki kryptowalut i przez długi czas ukrywać swoją działalność – 
maskując ruch przez CloudFlare i korzystając z własnych pulpitów do wydobycia.

Skończyło się nie tylko na wykorzystaniu mocy obliczeniowej Tesli. 
Hakerzy zdobyli też dostęp do danych telemetrycznych testowych pojazdów przechowywanych w Amazon S3. Choć firma szybko zareagowała, 
wizerunkowe i finansowe straty były spore.

Ten przypadek pokazuje, że błędy w konfiguracji nie są abstrakcyjnym problemem technicznym. To realne ryzyko biznesowe.

### Koszt błędów – w liczbach
Według danych z 2024 roku średni koszt wycieku danych w chmurze przekroczył 4,8 mln dolarów. 
W branży finansowej straty bywają jeszcze większe – często sięgają ponad 6 mln dolarów. 
A wiele z tych incydentów zaczyna się właśnie od drobnych niedociągnięć konfiguracyjnych. 
Brak kontroli nad uprawnieniami, niewłaściwe polityki bezpieczeństwa czy otwarte punkty dostępu pozwalają atakującym nie tylko wedrzeć się do klastra, 
ale i swobodnie poruszać się w jego wnętrzu.

## Pierwszy krok: Security Context w Kubernetes
Jednym z najważniejszych, a zarazem często lekceważonych elementów zabezpieczania aplikacji w Kubernetes jest poprawna konfiguracja Security Context. 
Te ustawienia definiujemy w manifestach Podów lub Deploymentów, aby ograniczyć uprawnienia i działanie kontenerów – zarówno na poziomie procesów, 
jak i całego systemu plików.

I tu ważne zastrzeżenie: Security Context nie powinien być traktowany jako „dodatkowe zabezpieczenie”. To absolutna podstawa. 
Bez niego nawet najlepsze mechanizmy – jak polityki sieciowe czy RBAC – tracą na skuteczności.

### Dlaczego to ważne?
Domyślnie kontenery w Kubernetesie uruchamiane są często jako root i z pełnym dostępem do zapisu w systemie plików. W praktyce oznacza to, 
że działają niemal jak mini‑maszyny z nieograniczonymi możliwościami, co tworzy istotne ryzyko bezpieczeństwa. 
Dlatego już podstawowe ustawienia – takie jak `runAsUser`, `allowPrivilegeEscalation: false` czy `readOnlyRootFilesystem` – potrafią znacząco podnieść poziom ochrony.

### Przykład prostego Deploymentu:
Poniżej prosty manifest Poda z ustawieniami Security Context:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-context-demo
spec:
  securityContext:
    runAsUser: 1000    # Użytkownik nieuprzywilejowany
    runAsGroup: 3000   # Ustaw grupę
    fsGroup: 2000      # Właściciel wolumenów
  containers:
  - name: app
    image: nginx:latest
    securityContext:
      allowPrivilegeEscalation: false   # Blokada eskalacji uprawnień
      readOnlyRootFilesystem: true      # Dysk tylko do odczytu
```

### Efekt?
- Kontenery nie działają jako root, lecz jako użytkownik o `UID 1000`.
- System plików jest w trybie „tylko do odczytu”.
- Potencjalni atakujący nie mogą eskalować uprawnień.

To prosty, ale bardzo skuteczny krok, by utrudnić życie hakerom i zwiększyć bezpieczeństwo środowiska.

## Co dalej w tej serii?
Ten wpis otwiera serię, w której krok po kroku będziemy przechodzić przez **proces wykrywania i eliminowania błędnych konfiguracji w Kubernetes**.
Skupimy się na kluczowych obszarach, które są fundamentem bezpiecznego i stabilnego środowiska:
- jak identyfikować niebezpieczne ustawienia w Podach i kontenerach,
- jak korzystać z narzędzi takich jak kube-bench czy OPA Gatekeeper do analizy konfiguracji,
- w jaki sposób weryfikować polityki bezpieczeństwa z poziomu praktycznych przykładów,
- jakie dobre praktyki wdrożyć, aby klaster był odporniejszy na awarie i ataki.

Moim celem nie będzie tylko straszenie konsekwencjami. Chcę pokazać przede wszystkim praktyczne rozwiązania, 
które możesz wdrożyć od razu w swoim środowisku.

## Przydatne linki:
- [Tesla i kopanie kryptowalut w Kubernetes – Portswigger](https://portswigger.net/daily-swig/tesla-becomes-latest-victim-of-cryptojacking-epidemic)
- [Infosecurity Magazine o błędnych konfiguracjach Kubernetes](https://www.infosecurity-magazine.com/news/misconfigured-kubernetes-exposed/)
- [Statystyki bezpieczeństwa w chmurze – SentinelOne](https://www.sentinelone.com/cybersecurity-101/cloud-security/cloud-security-statistics/)
- [Oficjalna dokumentacja Security_Context Kubernetes.io](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [Alternatywna dokumentacja medium.com](https://thekubeguy.com/security-context-e7b0fb083dcb)
- [Alternatywna dokumentacja redhat.com](https://www.redhat.com/en/blog/guide-to-kubernetes-security-context-pod-security-policy-psp)