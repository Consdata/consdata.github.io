---
layout:    post
title:     "Współdzielona biblioteka w Jenkins pipeline"
published: true
lang:      pl
date:      2021-04-14 08:00:00 +0100
author:    dkubiak
image:     /assets/img/posts/2021-04-14-wspoldzielona-biblioteka-w-jenkins-pipeline/jenkins-shard-pipeline.webp
tags:
- jenkins
- devops
- pipeline
- shared library
description: "W tym artykule zapoznamy się z mechanizmem bibliotek współdzielonych (Pipeline: Shared Groovy Libraries), które stanowią zależność do szeroko stosowanej wtyczki jenkins pipeline"
---
W tym artykule zapoznamy się z mechanizmem bibliotek współdzielonych (Pipeline: Shared Groovy Libraries), które stanowią
zależność do szeroko stosowanej wtyczki jenkinsowej pipelines (https://www.jenkins.io/doc/book/pipeline/).

Każdy z nas podczas modelowania procesów CI/CD spotkał się z pewnymi podobieństwami pomiędzy projektami. Niewątpliwie
jednym z takich procesów może być release projektu. W naszej firmie prawie każdy projekt budowany jest przy użyciu
mavena. Tym samym release takich projektów jest procesem bardzo zunifikowanym. W związku z tym jest to idealny
kandydat, by zamknąć go w bibliotece, ustawić na półkę i używać, gdy zajdzie taka potrzeba.

Zakładając, że każdy projekt w procesie wydawniczym (pipeline) ma krok pod tytułem "release", wówczas wystarczy, że zbudujemy współdzieloną bibliotekę, którą użyjemy w kroku bez zagłębiania się w sposób działania.

Biblioteka ma zapewnić nam:

- podbicie wersje w POMie do stabilnej,
- upload artefaktów (binarki) do repozytorium,
- ustalenie nowej wersji developerskiej + commit do głównej gałęzi.

## Tworzenie biblioteki w Jenkins pipeline

W nowo utworzonym repozytorium kodu tworzymy strukturę katalogów. W naszym przykładzie git@git.consdata/consdata-shared-lib

```
(projekt)
+- src
|  +- com.consdata.shared.library
|   +- VersionBumper.groovy  # klasa(pomocnicza) generuje wersje artefactu
+- vars
|  +- release.groovy # Definicja zmiennej ‘release’ dostępna z pipelinu
```

W ten sposób stworzyliśmy zmienną globalną o nazwie release. Aby można było ją wywołać bezpośrednio po nazwie wewnątrz Jenkins pipeline, definiujemy funkcję `call`.

```groovy
//vars/release.groovy
import com.consdata.shared.library.VersionBumper

def call(String branchName, String gitCredentialId, String versionToBump) {

    def currentVersion = readMavenPom().getVersion()
    def bumper = new VersionBumper(currentVersion)

    releaseVersion = currentVersion.minus("-SNAPSHOT");
    snapshotVersion = bumper.bump(versionToBump)

    sh "mvn clean versions:set -DnewVersion=\"$releaseVersion\" -DgenerateBackupPoms=false"

    sshagent(credentials: [gitCredentialId]) {
        sh("git commit -a -m 'Release $releaseVersion'")
    }

    releaseShaCommit = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
    echo "SHA Commit $releaseShaCommit"

    sh "mvn clean versions:set -DnewVersion=\"$snapshotVersion\"-SNAPSHOT -DgenerateBackupPoms=false"

    sshagent(credentials: [gitCredentialId]) {
        sh("git commit -a -m 'Snapshot $snapshotVersion'-SNAPSHOT")
        sh("git push origin HEAD:$branchName")
        sh("git checkout $releaseShaCommit")
    }

    sh "mvn clean deploy"

    sshagent(credentials: [gitCredentialId]) {
        sh("git tag $releaseVersion")
        sh("git push --tags")
    }
}
```

W kodzie powyżej wykorzystaliśmy klasę VersionBumper, która dostarcza nam funkcjonalność wyliczania nowej wersji. Na
potrzeby tego artykułu, implementacja została pominięta.

## Definiowanie biblioteki

Tak przygotowaną bibliotekę musimy dodać do Jenkinsa. Ponieważ biblioteka będzie stosowana globalnie na poziomie każdego
projektu. Tym samym zdefiniujemy ją na najwyższym poziomie.

`Zarządzaj Jenkinsem → Skonfiguruj system → Global Pipeline Libraries` (Uwaga: Należy zweryfikować, czy plugin
Jenkins pipeline: Shared Groovy Libraries - https://plugins.jenkins.io/workflow-cps-global-lib jest aktywny.)

![Główne okno konfiguracji Jenkins](/assets/img/posts/2021-04-14-wspoldzielona-biblioteka-w-jenkins-pipeline/mainConfigJenkins.png)

![Sekcja konfiguracji pipeline-shard](/assets/img/posts/2021-04-14-wspoldzielona-biblioteka-w-jenkins-pipeline/globalPipelineShardJenkins.png)

## Użycie w pipeline

Przechodzimy do ostatniego etapu wykorzystania biblioteki wewnątrz pliku Jenkinsfile.

```groovy
@Library(['consdata-shared-lib']) _ //Adnotacja określająca nazwę biblioteki

pipeline {
    agent any
    stages {
        stage('Release') {
            steps {
                release("master", env.GIT_CREDENTIAL_ID, "MINOR")
                //nazwa 'release' wynika z konwencji,
                //jest to nazwa pliku w repozytorium biblioteki /vars/release.groovy
            }
        }
    }
}
```

## Podsumowanie

W artykule zastosowaliśmy tylko niewielki wycinek mechanizmu współdzielonych bibliotek i wykorzystaliśmy go w Jenkins pipeline. Szerszy kontekst dostępny jest
bezpośrednio w [dokumentacji](https://www.jenkins.io/doc/book/pipeline/shared-libraries).
