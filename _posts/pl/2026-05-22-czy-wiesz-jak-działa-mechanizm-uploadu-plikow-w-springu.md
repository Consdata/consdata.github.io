---
layout:    post
title:     "Czy wiesz, jak działa mechanizm uploadu plików w Springu?"
date:      2026-05-12T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: bpietrowiak
image: /assets/img/posts/2026-05-22-czy-wiesz-jak-działa-mechanizm-uploadu-plikow-w-springu/thumbnail.webp
description: "Poznaj, jak w Springu działa upload plików, które parametry multipart warto ustawić i jak bezpiecznie przechowywać pliki po zakończeniu żądania."
tags:
- spring boot
- java
- file upload
---

## Konfiguracja obsługi plików

Spring umożliwia skonfigurowanie następujących parametrów (prefix `spring.servlet.multipart`):

- `enabled` - czy obsługa żądań typu `multipart/form-data` ma zostać obsłużona przez Springa. (domyślnie true)
- `max-file-size` - określa maksymalny rozmiar pliku, który zostanie obsłużony przez serwer. (domyślnie 1 MB)
- `max-request-size` - określa maksymalny rodzaj żądania typu `multipart/form-data`. (domyślnie 10 MB)
- `file-size-threshold` - określa rozmiar, po którym pliku zostaną zapisane na dysku. (domyślnie 0)
- `location` - określa tymczasową lokalizację plików obsługiwanych przez serwer. (domyślnie katalog tymczasowy systemu)
- `resolve-lazily` - odpowiada za sposób przetwarzania żądań multipart. Działanie w zależności od wartości:
  - `false` - Spring od razu analizuje (resolve) i przetwarza dane multipart przy odbieraniu żądania. (domyślna wartość)
  - `true` - Przetwarzanie multipart jest opóźnione (lazy), czyli wykonywane dopiero w momencie, gdy aplikacja rzeczywiście potrzebuje dostępu do plików (np. wywołania `request.getPart()` lub `request.getParameter()`).
- `strict-servlet-compilance` - w Spring Boot określa, czy Spring ma przestrzegać ścisłej zgodności ze specyfikacją Servlet API podczas obsługi żądań multipart. W zależności od wartości:
  - `true` - przetwarza tylko żądania typu `multipart/form-data` pozostałe muszą zostać przetworzone ręcznie.
  - `false` - próbuje przetworzyć każde żądanie typu `multipart/*`. (domyślna wartość)

## Jak wysłać plik na serwer?

Po stronie serwera należy przygotować kontroler, który ma zdefiniowany parametr żądania jako obiekt `MultipartFile`.

```java
package com.example.uploadfiles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Controller
public class FileUploadController {

	@PostMapping("/")
	public void handleFileUpload(@RequestParam("file") MultipartFile file) {
		LOGGER.info("Geting new file. [fileName={}]", file.getOriginalFileName());
	}

}
```

Tak przygotowany kontroler oczekuje pod parametrem `file` pliku, na którym będzie mógł wykonać operację.

## Co dzieje się z plikiem po stronie serwera?

Plik zostaje zapisany na serwerze w katalogu tymczasowym na czas przetwarzania żądania - po jego zakończeniu zostaje automatycznie usunięty.

## Jak zatrzymać plik dłużej niż czas obsługi żądania?

Możemy zrealizować to na dwa sposoby:

1. Ustawiając parametr `file-size-threshold` na większą wartość niż domyślna

Na przykład ustawienie wartości `file-size-threshold` na 5 MB spowoduje zapisanie się wszystkich plików poniżej 5 MB w pamięci aplikacji. 
Pliki te zostaną usunięcie w momencie, w którym aplikacja nie będzie wykorzystywała referencji na nie.

Jest to prostszy sposób, jednak trzeba liczyć się z tym, żeby monitorować pamięć aplikacji, gdyż jej zużycie może wzrosnąć.

2. Zapisując plik w momencie obsługi żądania na nośniku, bazie danych lub w systemie

Poniżej zaprezentuje przykład Controller`a, który w momencie otrzymania pliku zapisuje go w katalogu tymczasowym systemu operacyjnego.

```java
package com.example.uploadfiles;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Controller
public class FileUploadWithSaveController {

	@PostMapping("/")
	public void handleFileUpload(@RequestParam("file") MultipartFile file) {
		File systemFile = new File(Paths.get(System.getProperty("java.io.tmpdir"), file.getOriginalFilename()).toString());
		file.transferTo(systemFile);
	}

}
```

Tak przygotowany kontroler zapisze otrzymany plik w katalogu oznaczonym w zmiennej systemowej `java.io.tmpdir`.

Co ważne od momentu wywołania metody `transferTo()` należy posługiwać się plikiem zapisanym w systemie, 
ponieważ obiekt `MultipartFile` od tego momentu nie posiada już strumienia danych zapisanych w pliku.

W takim rozwiązaniu plik będzie się znajdował w katalogu tymczasowym, do momentu jawnego usunięcia go przez aplikacje. 
Należy więc pamiętać o przygotowaniu mechanizmu, który zarządzałby czyszczeniem katalogu z nieużywanych plików.

### Żródła
- [docs.spring.io - Multipart Forms](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html)