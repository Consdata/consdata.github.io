---
layout:    post
title:     "Czy wiesz jak skonfigurować relacyjną bazę danych przy użyciu TestContainers?"
date:      2023-08-11T08:00:00+01:00
published: true
didyouknow: true
lang: pl
author: pstachowiak
image: /assets/img/posts/2023-08-11-czy-wiesz-jak-skonfigurowac-relacyjna-baze-danych-przy-uzyciu-testcontainers/containership.jpg
description: Czasem w testach baza H2 nie jest wystarczająca, np. gdy używamy specyficznych dla danej bazy mechanizmów. Wtedy możemy łatwo skonfigurować TestContainers, które dostarczy nam instancje prawdziwej bazy danych na czas testów. Jak to zrobić na przykładzie DB2, Junit5 i Spring?
tags:
- testcontainers
- db2
- junit5
---
Czasem w testach baza H2 nie jest wystarczająca, np. gdy używamy specyficznych dla danej bazy mechanizmów. Wtedy możemy łatwo skonfigurować TestContainers, które dostarczy nam instancje prawdziwej bazy danych na czas testów.
Jak to zrobić na przykładzie DB2, Junit5 i Spring?

Dodajemy zależności: 
```xml
<dependency>
   <groupId>org.testcontainers</groupId>
   <artifactId>testcontainers</artifactId>
   <version>1.15.3</version>
   <scope>test</scope>
</dependency>
<dependency>
   <groupId>org.testcontainers</groupId>
   <artifactId>db2</artifactId>
   <version>1.14.3</version>
   <scope>test</scope>
</dependency>
```

Ustawiamy konfigurację testową korzystając z JDBC URL scheme:
```yaml
datasource:
  url: jdbc:tc:db2:///databasename
  driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
```

Musimy jeszcze zaakceptować licencje db2, w tym celu w resources dodajemy plik "container-license-acceptance.txt", który powinien zawierać linię: 
```
ibmcom/db2:11.5.0.0a
```
to wszystko, cieszymy się działającą, prawdziwą instancją bazy danych, której nie musimy ręcznie dostarczać.

Mamy też możliwość uruchomienia skryptu lub funkcji inicjującej bazę danych:
```yaml
url: jdbc:tc:db2:///databasename?TC_INITSCRIPT=init.sql # Konfiguracja pliku inicjującego bazę
url: jdbc:tc:db2:///databasename?TC_INITFUNCTION=org.testcontainers.jdbc.JDBCDriverTest::sampleInitFunction  # Konfiguracja funkcji inicjującej
```
To najszybszy i najłatwiejszy sposób konfiguracji bazy danych z TestContainers. Jeśli potrzebujemy więcej konfiguracji, lub też chcemy wykorzystać kontener z bazą w inny sposób możemy dostarczyć go ręcznie.
Warto wspomnieć o dużej wadzie tego rozwiązania - czas uruchomienia kontenera z DB2 to blisko 3 minuty.

## Przykłady innych konfiguracji

### Za pomocą adnotacji z Junit5
Należy dodać zależność:
```xml
<dependency>
   <groupId>org.testcontainers</groupId>
   <artifactId>junit-jupiter</artifactId>
   <version>1.14.3</version>
   <scope>test</scope>
</dependency>
```

Przykład:
```java
@Testcontainers
class ExampleTest {
 
   // instancja współdzielona pomiędzy wszystkie metody testowe
   @Container
   private static final Db2Container SHARED_CONTAINER = new Db2Container();
 
   // instancja tworzona przed i niszczona po każdej metodzie testowej
   @Container
   private Db2Container
         localContainer =
         new Db2Container().withDatabaseName("foo").withUsername("foo").withPassword("secret");
 
   @Test
   void test() {
      assertTrue(SHARED_CONTAINER.isRunning());
      assertTrue(localContainer.isRunning());
   }
}
```

### Jako singleton
```java
@SpringBootTest(classes = ExampleApplication.class)
@ContextConfiguration(initializers = ExampleApplicationTestBase.Initializer.class)
public abstract class ExampleApplicationTestBase {
 
   public static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
 
      @Override
      public void initialize(@NotNull ConfigurableApplicationContext configurableApplicationContext) {
         TestPropertyValues values = TestPropertyValues.of(
               "spring.datasource.url=" + db2Container.getJdbcUrl(),
               "spring.datasource.password=" + db2Container.getPassword(),
               "spring.datasource.username=" + db2Container.getUsername());
         values.applyTo(configurableApplicationContext);
      }
   }
 
   private static final Db2Container db2Container;
 
   static {
      db2Container =
            new Db2Container().withPassword("inmemory")
                  .withUsername("inmemory")
                  .withInitScript("init.sql")
                  .withExposedPorts(2424, 2480)
                  .withLogConsumer(new Slf4jLogConsumer(log))
                  .acceptLicense();
      db2Container.start();
   }
 
}
```

## Przydatne linki:
- [https://www.testcontainers.org/modules/databases/jdbc/](https://www.testcontainers.org/modules/databases/jdbc/)
- [https://www.testcontainers.org/test_framework_integration/junit_5/](https://www.testcontainers.org/test_framework_integration/junit_5/)
- [https://www.testcontainers.org/modules/databases/db2/](https://www.testcontainers.org/modules/databases/db2/)