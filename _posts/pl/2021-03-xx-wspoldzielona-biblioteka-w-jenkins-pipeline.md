---
layout:    post
title:     "Współdzielona biblioteka w jenkins pipeline"
published: true
lang:      pl
date:      2021-02-xx 08:00:00 +0100
author:    dkubiak
image:     /assets/img/posts/2021-03-xx-xx/xx.jpg
tags:
- jenkins
- devops
- pipeline
- shard library

---
W tym artykule zapoznamy się z mechanizmem bibliotek współdzielonych (Pipeline: Shared Groovy Libraries), które stanowią
zależność do szeroko stosowanej wtyczki jenkinsowej pipelines (https://www.jenkins.io/doc/book/pipeline/).

Każdy z nas podczas modelowania procesów CI/CD spotkał się z pewnymi podobieństwami pomiędzy projektami. Niewątpliwie
jednym z takich procesów może być release projektu. W naszej firmie prawie każdy projekt budowany jest przy użyciu
mavena. Tym samym release takich projektów jest procesem bardzo zunifikowanym. W związku z tym jest to idealnym
kandydat, do zamknąć go w bibliotekę, ustawić na półkę i używać jak zajdzie taka potrzeba.

Zakładając, że każdy projekt w procesie wydawniczym (pipeline) ma krok pod tytułem release. Wystarczy, że zbudujemy
współdzieloną bibliotekę, którą użyjemy w kroku bez wchodzenia w sposób działania.

Biblioteka ma zapewnić nam:

- pobicie wersje w POMie do stabilnej
- upload artefaktów (binarki) do repozytorium
- ustalić nową wersję developerską + commit do głównej gałęzi.

# Tworzenie biblioteki

W nowo utworzonym repozytorium kodu tworzymy strukturę katalogów. W naszym przykładzie git@git.consdata/consdata-shared-lib

```
(root)
+- src
|   +- com.consdata.shared.library
|    +- VersionBumper.groovy  # klasa(pomocnicza) odpowiedzialna za wygenerowanie wersji artefactu
+- vars
|   +- release.groovy # zasadnicza definicja zmiennej ‘release’ dostępna z poziomu pipelinu
```

W ten sposób stworzyliśmy zmienną globalną o nazwie release, aby była ona dostępna z poziomu kroku w pipeline, musi
zaimplementować metodę call.

```groovy
//vars/release.groovy
import com.consdata.shared.library.VersionBumper

def call(String branchName, String gitCredentialId, String versionToBump) {

    script {
        def current_version = readMavenPom().getVersion()

        def bumper = new VersionBumper(current_version)

        releaseVersion = current_version.minus("-SNAPSHOT");
        snapshotVersion = bumper.bump(versionToBump)
    }

    sh "mvn clean versions:set -DnewVersion=\"$releaseVersion\" -DgenerateBackupPoms=false"
    sshagent(credentials: [gitCredentialId]) {
        sh("git commit -a -m 'Release $releaseVersion'")
    }
    script {
        releaseShaCommit = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
    }
    echo "SHA Commit $releaseShaCommit"
    sh "mvn clean versions:set -DnewVersion=\"$snapshotVersion\"-SNAPSHOT -DgenerateBackupPoms=false"
    sshagent(credentials: [gitCredentialId]) {
        sh("git commit -a -m 'Snapshot $snapshotVersion'-SNAPSHOT")
        sh("git push origin HEAD:$branchName")
        sh("git checkout $releaseShaCommit")
    }
    script {
        sh "mvn clean deploy"
    }
    sshagent(credentials: [gitCredentialId]) {
        sh("git tag $releaseVersion")
        sh("git push --tags")
    }
}
```

W kodzie powyżej wykorzystaliśmy klasę VersionBumper, która dostarcza nam funkcjonalność wyliczania nowej wersji. Na
potrzeby tego artykułu, implementacja została pominięta.

# Definiowanie biblioteki

Tak przygotowaną bibliotekę musimy dodać do jenkinsa. Ponieważ biblioteka będzie stosowana globalnie na poziomie każdego
projektu. Tym samym zdefiniujemy ją na najwyższym poziomie.

```Zarządzaj Jenkinsem → Skonfiguruj system → Global Pipeline Libraries``` (Uwaga: Należy zweryfikować, czy plugin
jenkins Pipeline: Shared Groovy Libraries - https://plugins.jenkins.io/workflow-cps-global-lib jest aktywny.)

![mainConfigJenkins](/assets/img/posts/2021-03-xx-wspoldzielona-biblioteka-w-jenkins-pipeline/mainConfigJenkins.png)

![mainConfigJenkins](/assets/img/posts/2021-03-xx-wspoldzielona-biblioteka-w-jenkins-pipeline/globalPipelineShardJenkins.png)

# Użycie w pipeline

Przechodzimy do ostatniego etapu wykorzystania biblioteki wewnątrz pliku Jenkinsfile.

```groovy
@Library(['consdata-shared-lib']) _ //Adontacja określająca nazwę biblioteki

pipeline {
    agent any
    stages {
        stage('Release') {
            steps {
                release("master", "$GIT_CREDENTIAL_ID", "MINOR")
                //nazwa 'release' wynika z konwencji, jest to nazwa pliki w repozytorium biblioteki /vars/release.grovy
            }
        }
    }
}
```

# Podsumowanie

W artykule zastosowaliśmy tylko niewielki wycinek mechanizmu współdzielonych bibliotek. Szerszy kontekst dostępny jest
bezpośrednio w dokumentacji: https://www.jenkins.io/doc/book/pipeline/shared-libraries