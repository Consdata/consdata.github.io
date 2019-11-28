---
layout:    post
title:     "Automat dodający joby do Jenkinsa"
published: true
date:      2019-11-26 08:00:00 +0100
author:    dkubiak
tags:
    - jenkins job
    - jenkins template
    - devops
    - jenkins-job-builder
    - jenkins-jobs
---
## Zastosowanie

W ogarniającym nas świecie mikroserwisów skala projektów do utrzymania staje się ogromna. Każdy z tych projektów musimy przecież: zbudować, przetesować, zdeployować itd. Przy dużej liczbie projektów przestaje to być trywialne. W tym artykule zajmiemy się pierwszym zagadnieniem - automatyzacją buildów, jednak opisany tutaj sposób bez problemu można zastosować do innych aspektów.

Do budowania projektów starajmy się używać jednego narzędzia, ogromnie wpłynie to na proces unifikacji. W tym artykule będziemy posługiwać się mavenem.

Do zautomatyzowania procesu posłuży nam Jenkins.

Przejdźmy do sedna, czyli jak budować dużą liczbę projektów z jak najmniejszym nakładem pracy i ilością kodu do utrzymania.

## Startujemy

Przy założeniu, że projekty budujemy

`mvn clean package`

-/+ jakieś super ważne przełączniki typu` -DskipTes...` ;) jesteśmy w stanie w bardzo prosty i schludny sposób zbudować kod/konfigurację, która zautomatyzuje cały proces.

Automatyzację rozpoczniemy od użycia narzędzia: [jenkins-job-builder](https://docs.openstack.org/infra/jenkins-job-builder/ "jenkins-job-builder")

Instalacja: 
```bash
pip install --user jenkins-job-builder
```

macOS: 
```bash
brew install jenkins-job-builder
```

Definiujemy plik konfiguracyjny dla jenkins-jobs w lokalizacji `/etc/jenkins_jobs/jenkins_jobs.ini`:

    [jenkins]
    query_plugins_info=False
    user=jenkins #Użytkownik Jenkinsowy
    password=93a1160c11dc014b7214d4e8769fe8c9
    url=http://localhost:8080 #Url do jenkinsa

- user - Użytkownik Jenkinsowy
- password - API Token dla swojego użytkownika [link](https://support.cloudbees.com/hc/en-us/articles/115003090592-How-to-re-generate-my-Jenkins-user-token)
- url - Adres URL do Jenkinsa

Tak skonfigurowane narzędzie pozwoli nam utworzyć dowolny job jenkinsowy.
Utwórzmy plik o nazwie `project1-build.yaml` w katalogu `jobs` z zawartością
```yaml
- job:
    name: project-1-build
    project-type: freestyle
    disabled: false
    builders:
        - shell: 'mvn clean package'
```
Zasilenie jenkinsa nowo utworzonym jobem:
`jenkins-jobs update jobs`

Po wykonaniu polecenia, utworzony zostanie pierwszy z projektów jenkinsowych. Good Job!

## Szablony

Uwielbiamy opakowywać wszystko w pewne wzorce, wspólne procesy, reużywać raz dobrze napisany kod. :) Dlatego ten wątek będzię esencją artykułu.
Wiemy już, że projekty budujemy w bardzo podobny sposób. Zbudujmy więc pierwszy szablon.

Utwórzmy szablon o nazwie `project-build-template.yaml` w katalogu `jobs`
```yaml
- job-template:
    name: '{name}-{subname}-build'
    project-type: freestyle
    disabled: false
    builders:
        - shell: 'mvn clean package'
```
Szablon posiada dwie zmienne
    
    name : nazwa projektu
    subname: numer oznaczajacy jeden z koljenych projektów
    
Zwróć uwagę na wartość w polu name `{name}-{subname}-build` jest to pattern, po którym będzie szukany szablon.
    
Aby użyć szablonu tworzymy plik w katalogu `jobs` o nazwie `projects.yaml`
```yaml
- project:
    name: project
    subname:
        - 1
        - 2
        - 3
    jobs:
        - '{name}-{subname}-build'
```
Całość kończymy aktualizacją jobów: `jenkins-jobs update jobs`

W ten sposób jednym ruchem wygenerowaliśmy 3 joby:

    project-1-build
    project-2-build
    project-3-build
    
Każdy z nich zawiera definicję joba opisanego w szablonie o nazwie `{name}-{subname}-build'` czyli wywołanie `mvn clean package`

## Podsumowanie
Cel został osiągnięty! Raz napisana definicja builda została użyta wiele razy (w naszym przykładzie tylko 3 ;) ). Zmniejszyliśmy liczbę zdublowanych konfiguracji, dzięki czemu jesteśmy w stanie lepiej nimi zarządzać.

Był to prosty przykład ukazujący istnienie takiego narzędzia. Jeśli chcesz dowiedzieć się czegoś więcej - zostawiam kilka linków.

[Dokumentacja](https://docs.openstack.org/infra/jenkins-job-builder/)

[Repozytorium projektu](https://opendev.org/jjb/jenkins-job-builder)
