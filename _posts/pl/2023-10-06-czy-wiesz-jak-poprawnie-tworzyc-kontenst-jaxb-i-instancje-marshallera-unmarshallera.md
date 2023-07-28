---
layout:    post
title:     "Czy wiesz jak poprawnie tworzyć kontekst JAXB i instancję Marshallera/Unmarshallera?"
date:      2023-10-06T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: jwilczewski
image: /assets/img/posts/2023-10-06-czy-wiesz-jak-poprawnie-tworzyc-kontenst-jaxb-i-instancje-marshallera-unmarshallera/code.webp
tags:
- jaxb
- serializacja
---
W naszych projektach często używamy JAXB w serializacji obiektów javowych do formatu XML oraz ich późniejszej deserializacji. Aby wykonać takie operacje należy:
- Utworzyć kontekst JAXB:
    ```java
    JAXBContext jaxbContext = JAXBContext.newInstance(User.class);
    ```
- Utworzyć marshaller/unmarshaller (w zależności do tego czy serializujemy obiekt javowy na xml, czy w drugą stronę):
    ```java
    Marshaller marshaller = jaxbContext.createMarshaller();
    
    // lub
     
    Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
    ```
- Wykonać serializację/deserializację:
    ```java
    Writer writer = new StringWriter();
    marshaller.marshal(user, writer);
     
    // lub
      
    JAXBElement<User> userElement = unmarshaller.unmarshal(source(xml), User.class); 
    ```
  
## Ważna uwaga odnośnie wydajności
Tworzenie kontekstu JAXB jest operacją czasochłonną, a doświadczenie pokazuje, że czas wywołania znacznie wzrasta wraz z liczbą wątków, które próbują wykonać współbieżnie tą operację. Dlatego zgodnie z dokumentacją, nie należy tworzyć nowej instancji kontekstu przy każdym wywołaniu mapowania. Kontekst JAXB jest bezpieczny przy współbieżnym wywołaniu. Należy go tworzyć np. w konstruktorze, metodzie inicjalizującej, jako statyczne pole klasy:
<blockquote>
To avoid the overhead involved in creating a JAXBContext instance, a JAXB application is encouraged to reuse a JAXBContext instance. An implementation of abstract class JAXBContext is required to be thread-safe, thus, multiple threads in an application can share the same JAXBContext instance.
<span><a href="https://github.com/eclipse-ee4j/jaxb-api/blob/master/spec/src/main/asciidoc/ch04-binding_framework.adoc">https://github.com/eclipse-ee4j/jaxb-api/[...]/ch04-binding_framework.adoc</a></span>
</blockquote>

## Jeszcze ważniejsza uwaga dotycząca thread-safety
W przeciwieństwie do kontekstu JAXB sam marshaller/unmarshaller nie jest bezpieczny przy współbieżnym wywołaniu! Operację tworzenia marshallera i unmarshallera trzeba powtarzać przy każdym wywołaniu. Posługiwanie się tym samym obiektem może prowadzić do nieprzewidzianych rezultatów przy większej niż jeden liczbie wątków. Co więcej, nie wyłapiemy tego błędu w testach jednostkowych i testach funkcjonalnych.

Jeżeli podczas testów wydajnościowych okaże się, że operacje tworzenia marshallera/unmarshallera zabiera zbyt dużo czasu można rozważyć utworzenie puli takich obiektów. Musi być ona zaimplementowana w taki sposób, aby różne wątki nie używały tego samego obiektu w tym samym czasie.