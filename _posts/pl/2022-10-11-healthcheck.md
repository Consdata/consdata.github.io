---
layout:    post
title:     "Czy wiesz co to healthcheck i jak z niego korzystać?"
date:      2022-10-11 06:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    kczarnecki
image:     /assets/img/posts/2022-10-11-healthcheck/healthcheck.jpg
tags:

- liveness probe
- heathcheck
- kubernetes

---

# Czy wiesz co to healthcheck i jak z niego korzystać?

Health check pozwala na monitorowanie działania aplikacji. Mechanizm ten w Kubernetesie pozwala sprawdzić nie tylko, czy
kontener działa (czy node port jest dostępny), ale także czy aplikacja wciąż działa (czy odpowiada). W tym wpisie
poruszany jest temat mechanizmu Liveness Probe.

## Liveness Probe

Służy do identyfikacji, czy aplikacja uruchomiona na kontenerze jest sprawna. W przypadku identyfikacji braku działania
aplikacji kontener zostaje automatycznie zrestartowany. Detekcja działania aplikacji sprowadza się do cyklicznego
wysłania zapytań HTTP na wcześniej zdefiniowany endpoint wystawiony w aplikacji lub wywoływania komendy w kontenerze.

Fragment pliku `.yaml` z konfiguracją Liveness Probe'a opartą na zapytaniach HTTP:

```yaml
spec:
  containers:
    livenessProbe:
      httpGet:
        path: /health-check # ścieżka do health-check'a
        port: 8080 # port na którym wystawiony jest kontener
      initialDelaySeconds: 3 # po ilu sekundach od uruchomienia kontenera włączyć health-checka 
      periodSeconds: 3 # co ile serwować zapytanie do /health-check
```

## Przykład interaktywny:

Poniżej przedstawiono polecenia, dzięki którym można samodzielnie zobaczyć, jak działa Liveness Probe. Zamieszczony
przykład zawiera definicję Pod'a, który po 30 sekundach od uruchomienia przestaje odpowiadać na health-check'a. W tym
przypadku zdecydowano się na definicję health-check'a przy użyciu wywołania komendy w kontenerze.

Uruchomienie kontenera:

```shell
kubectl apply -f https://k8s.io/examples/pods/probe/exec-liveness.yaml
```

Przy użyciu poniższego polecenia możliwe jest śledzenie stanu poda. Należy zauważyć, że po czasie 30 sekund od
uruchomienia, pod zostaje zrestartowany, dlatego, że usunięty zostaje plik, który odpowiada za poprawne zwracanie
odpowiedzi dla health-check'a:

```shell
watch -n 1 kubectl get pods
```

Aby prześledzić historię zdarzeń (restartu) wykonajmy polecenie:

```shell
kubectl describe pod liveness-exec
```

Jeśli nastąpił przynajmniej jeden restart, polecenie zwraca informację o przyczynie restartu:

```shell
(...)
Normal   Pulled     78s                kubelet            Successfully pulled image "k8s.gcr.io/busybox" in 990.617406ms
Warning  Unhealthy  35s (x3 over 45s)  kubelet            Liveness probe failed: cat: can't open '/tmp/healthy': No such file or directory
Normal   Killing    35s                kubelet            Container liveness failed liveness probe, will be restarted
Normal   Pulling    5s (x2 over 79s)   kubelet            Pulling image "k8s.gcr.io/busybox"
(...)
```

### Źródła:

- [https://github.com/wardviaene/kubernetes-course](https://github.com/wardviaene/kubernetes-course)
- [https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [https://www.educba.com/kubernetes-liveness-probe](https://www.educba.com/kubernetes-liveness-probe)