---
layout:    post
title:     "Zarządzanie dostępem przy użyciu Access Control List"
date:      2021-04-26 08:00:00 +0100
published: true
lang:      pl
author:    pwalaszek
image:     /assets/img/posts/2021-04-26-zarzadzanie-dostepem-przy-uzyciu-access-control-list/acl.jpg
tags:
    - acl
    - access control list
    - spring security
    - authorization
---

W świecie programistów Java, od wielu lat prym wiedzie **Spring Framework**, który błyskawicznie dostosowuje się do panujących trendów. Trudno sobie wyobrazić programistę Java, szczególnie aplikacji internetowych, który nie znałby tego projektu, lub precyzyjniej, zbioru projektów. Jednym z popularnych i bardzo dojrzałych projektów, jest **Spring Security**, który dostarcza gotowe rozwiązania dla różnych zawiłych zagadnień w zakresie bezpieczeństwa.

Kilka lat temu, kiedy zaczynałem przygodę z programowaniem, moim pierwszym komercyjnym projektem do wykonania, było zaimplementowanie aplikacji internetowej, która miała służyć do zarządzania zadaniami. Zadania te były przypisane do konkretnych użytkowników, którzy nie mogli sobie nawzajem przeglądać zadań. Problem wydawał się być powszechny. Po krótkim poszukiwaniu, natknąłem się na koncepcję znaną jako **Access Control List** oraz jego realizacją w **Spring Security ACL**, która jest rozszerzeniem Spring Security. To było to, czego szukałem!

W tym artykule wyjaśnię, dlaczego Spring Security jest niewystarczający do zrealizowania wspomnianego wymagania, i dlaczego potrzebujemy rozszerzenia Spring Security ACL. Dodatkowo przedstawię fragmenty kodu, które są istotne w naszym projekcie.

Pełny kod jest dostępny pod adresem [**https://github.com/pawelwalaszek/spring-security-acl**](https://github.com/pawelwalaszek/spring-security-acl).

## Czym właściwie jest Access Control List?

Krótka definicja brzmi:

```
Access Control List (ACL) jest listą uprawnień skojarzonych z obiektem.
```

W naszym przypadku obiektem jest zadanie. Natomiast lista uprawnień jest przechowywana w bazie danych, w specjalnych strukturach tabelarycznych, w której są zdefiniowane relacje między obiektem, a użytkownikiem.

## Dlaczego Spring Security jest niewystarczający?

**Spring Security** pozwala określić *dostęp na poziomie żądania HTTP lub wywołania metody*.

Przykład:

```java
@PreAuthorize("hasRole('TASK')")
public List<Task> getTasksWithoutAcl() {
    return taskRepository.findAll();
}
```

W powyższym przykładzie użytkownik z rolą *TASK* otrzyma pełną listę obiektów *Task*. Nie jest to zgodne z naszym wymaganiem, ponieważ chcemy, aby użytkownik otrzymał wyselekcjonwaną listę obiektów *Task*, dokładniej, listę obiektów do których został przypisany.

**Spring Security ACL** pozwala określić *dostęp na poziomie obiektów*.

Przykład:

```java
@PreAuthorize("hasRole('TASK')")
@PostFilter("hasPermission(filterObject, 'READ')")
public List<Task> getTasksWithAcl() {
    return taskRepository.findAll();
}
```

W powyższym przykładzie użytkownik z rolą *TASK* otrzyma listę obiektów *Task*, ale tylko do tych, do których otrzymał uprawnienie odczytu.

**@PreAuthorize** – sprawdza, czy użytkownik posiada rolę *TASK*. Jeśli nie posiada, to generuje wyjątek, który tworzy odpowiedź HTTP ze statusem 403.

**@PostFilter** – usuwa obiekty z kolekcji, do których użytkownik nie ma uprawnień.

Kombinacja adnotacji **@PreAuthorize** i **@PostFilter** jest bardzo wygodna, ale żeby taka była, należy odpowiednio przygotować konfigurację w naszej aplikacji zarówno dla Spring Security jak i dla Spring Security ACL.

## Konfiguracja

a) Konfiguracja dla Spring Security:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    public void configure(WebSecurity webSecurity) throws Exception {
        webSecurity.ignoring().antMatchers("/h2-console/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
            .anyRequest().authenticated()
            .and()
            .formLogin()
            .and()
            .httpBasic();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
                .withUser("user1").password(passwordEncoder().encode("user1")).roles("TASK")
                .and()
                .withUser("user2").password(passwordEncoder().encode("user2")).roles("TASK");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

b) Konfiguracja dla Spring Security ACL:

```java
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class AclSecurityConfig extends GlobalMethodSecurityConfiguration {

    @Autowired
    private MethodSecurityExpressionHandler defaultMethodSecurityExpressionHandler;

    @Override
    protected MethodSecurityExpressionHandler createExpressionHandler() {
        return defaultMethodSecurityExpressionHandler;
    }

    @Bean
    public MethodSecurityExpressionHandler defaultMethodSecurityExpressionHandler(DataSource dataSource) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        AclPermissionEvaluator permissionEvaluator = new AclPermissionEvaluator(aclService(dataSource));
        expressionHandler.setPermissionEvaluator(permissionEvaluator);
        return expressionHandler;
    }

    @Bean
    public JdbcMutableAclService aclService(DataSource dataSource) {
        return new JdbcMutableAclService(dataSource, lookupStrategy(dataSource), aclCache());
    }

    @Bean
    public AclAuthorizationStrategy aclAuthorizationStrategy() {
        return new AclAuthorizationStrategyImpl(new SimpleGrantedAuthority("ROLE_TASK"));
    }

    @Bean
    public PermissionGrantingStrategy permissionGrantingStrategy() {
        return new DefaultPermissionGrantingStrategy(new ConsoleAuditLogger());
    }

    @Bean
    public EhCacheBasedAclCache aclCache() {
        return new EhCacheBasedAclCache(aclEhCacheFactoryBean().getObject(), permissionGrantingStrategy(), aclAuthorizationStrategy());
    }

    @Bean
    public EhCacheFactoryBean aclEhCacheFactoryBean() {
        EhCacheFactoryBean ehCacheFactoryBean = new EhCacheFactoryBean();
        ehCacheFactoryBean.setCacheManager(aclCacheManager().getObject());
        ehCacheFactoryBean.setCacheName("aclCache");
        return ehCacheFactoryBean;
    }

    @Bean
    public EhCacheManagerFactoryBean aclCacheManager() {
        return new EhCacheManagerFactoryBean();
    }

    @Bean
    public LookupStrategy lookupStrategy(DataSource dataSource) {
        return new BasicLookupStrategy(dataSource, aclCache(), aclAuthorizationStrategy(), new ConsoleAuditLogger());
    }
}
```

c) Struktura schematu dla poszczególnych baz danych jest dostępna w kodach źródłowych Spring Security [tutaj](https://github.com/spring-projects/spring-security/tree/main/acl/src/main/resources). W naszym przypadku DDL jest dla bazy danych H2:

```sql
-- App schemas

CREATE TABLE IF NOT EXISTS tasks (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  chapter varchar(100) NOT NULL,
  title varchar(100) NOT NULL,
  description varchar(1000),
  creation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (id)
);

-- ACL schemas

CREATE TABLE IF NOT EXISTS acl_sid (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  principal tinyint(1) NOT NULL,
  sid varchar(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_uk_1 (sid,principal)
);

CREATE TABLE IF NOT EXISTS acl_class (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  class varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_uk_2 (class)
);

CREATE TABLE IF NOT EXISTS acl_entry (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  acl_object_identity bigint(20) NOT NULL,
  ace_order int(11) NOT NULL,
  sid bigint(20) NOT NULL,
  mask int(11) NOT NULL,
  granting tinyint(1) NOT NULL,
  audit_success tinyint(1) NOT NULL,
  audit_failure tinyint(1) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_uk_4 (acl_object_identity,ace_order)
);

CREATE TABLE IF NOT EXISTS acl_object_identity (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  object_id_class bigint(20) NOT NULL,
  object_id_identity bigint(20) NOT NULL,
  parent_object bigint(20) DEFAULT NULL,
  owner_sid bigint(20) DEFAULT NULL,
  entries_inheriting tinyint(1) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_uk_3 (object_id_class,object_id_identity)
);

ALTER TABLE acl_entry
ADD FOREIGN KEY (acl_object_identity) REFERENCES acl_object_identity(id);

ALTER TABLE acl_entry
ADD FOREIGN KEY (sid) REFERENCES acl_sid(id);

ALTER TABLE acl_object_identity
ADD FOREIGN KEY (parent_object) REFERENCES acl_object_identity (id);

ALTER TABLE acl_object_identity
ADD FOREIGN KEY (object_id_class) REFERENCES acl_class (id);

ALTER TABLE acl_object_identity
ADD FOREIGN KEY (owner_sid) REFERENCES acl_sid (id);
```

## Przykładowe dane

Utworzony schemat należy wypełnić odpowiednimi danymi. W naszej aplikacji mamy dwóch predefiniowanych użytkowników *user1* i *user2* z taką samą rolą *TASK*. Dla tych użytkowników utworzymy 8 zadań i odpowiednio przypiszemy ich do poszczególnych zadań. Użytkownik *user1* będzie mieć prawo odczytu do zadań z kategorii *Security*, natomiast użytkownik *user2* będzie mieć prawo odczytu do pozostałych zadań. W naszym przykładzie ograniczamy się jedynie do prawa odczytu, jednak ACL umożliwia nadawanie uprawnień dla odczytu, zapisu, tworzenia oraz usuwania.

W naszej przykładowej aplikacji dodajemy dane bezpośrednio do bazy danych za pomocą DML. Kwestią otwartą i nieporuszną w tym artykule jest zaimplementowanie serwisu, który jest w stanie programowo zarządzać uprawnieniami.

```sql
-- Kilka przykładowych zadań

INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (1, 'Security', 'tytuł 1', 'opis zadania 1', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (2, 'Cloud', 'tytuł 2', 'opis zadania 2', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (3, 'Security', 'tytuł 3', 'opis zadania 3', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (4, 'Cloud', 'tytuł 4', 'opis zadania 4', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (5, 'Frontend', 'tytuł 5', 'opis zadania 5', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (6, 'Security', 'tytuł 6', 'opis zadania 6', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (7, 'Cloud', 'tytuł 7', 'opis zadania 7', current_timestamp);
INSERT INTO tasks (id, chapter, title, description, creation_date) VALUES (8, 'Storage', 'tytuł 8', 'opis zadania 8', current_timestamp);

-- ACL - przepisanie uprawnień

INSERT INTO acl_sid (id, principal, sid) VALUES
(1, 0, 'ROLE_TASK'),
(2, 1, 'user1'),
(3, 1, 'user2');

INSERT INTO acl_class (id, class) VALUES
(1, 'com.consdata.task.model.Task');

INSERT INTO acl_object_identity (id, object_id_class, object_id_identity, parent_object, owner_sid, entries_inheriting) VALUES
(1, 1, 1, NULL, 2, 0),
(2, 1, 3, NULL, 2, 0),
(3, 1, 6, NULL, 2, 0),
(4, 1, 2, NULL, 3, 0),
(5, 1, 4, NULL, 3, 0),
(6, 1, 5, NULL, 3, 0),
(7, 1, 7, NULL, 3, 0),
(8, 1, 8, NULL, 3, 0);

INSERT INTO acl_entry (id, acl_object_identity, ace_order, sid, mask, granting, audit_success, audit_failure) VALUES
(1, 1, 1, 2, 1, 1, 1, 0),
(2, 2, 1, 2, 1, 1, 1, 0),
(3, 3, 1, 2, 1, 1, 1, 0),
(4, 4, 1, 3, 1, 1, 1, 0),
(5, 5, 1, 3, 1, 1, 1, 0),
(6, 6, 1, 3, 1, 1, 1, 0),
(7, 7, 1, 3, 1, 1, 1, 0),
(8, 8, 1, 3, 1, 1, 1, 0);
```

Opis poszczególnych tabel został przedstawiony [tutaj](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#domain-acls-key-concepts).

## ACL w akcji

Omówiliśmy już wszystkie niezbędne kwestie. Jesteśmy gotowi uruchomić aplikację i ją przetestować. Pełny kod znajduję się pod adresem [**https://github.com/pawelwalaszek/spring-security-acl**](https://github.com/pawelwalaszek/spring-security-acl).

```
mvn spring-boot:run
```

Wejście pod adres:

```
http://localhost:8080/tasks/list-with-acl
```

i zalogowanie się jako *user1* z hasłem *user1* spowoduje wyświetlenie zadań tylko z kategorii *Security*. Natomiast dla użytkownika *user2* z hasłem *user2* zostaną wyświetlone zadania z pozostałych kategorii.

Wejście pod adres:

```
http://localhost:8080/tasks/list-without-acl
```

dowolnym użytkownikiem spowoduje wyświetlenie wszystkich zadań, gdyż dla tego adresu został określony dostęp na poziomie wywołania metody, w tym przypadku, dla użytkowników z rolą *TASK*.

## Podsumowanie

Czy potrzebujmy Spring Security ACL? To zależy od wymagań:
- Tak, jeśli potrzebujemy określać dostęp na poziomie obiektów.
- Nie, jeśli potrzebujemy określać dostęp na poziomie żądania HTTP lub wywołania metody.

Tym artykułem chciałbym uświadomić obecność gotowej implementacji ACL oraz jaki konkretny problem rozwiązuje. Warto skorzystać z gotowych i dojrzałych rozwiązań, takich jak, Spring Security ACL, gdyż pozwoli nam zaoszczędzić sporo czasu oraz uniknąć potencjalnych błędów podczas tworzenia własnej implementacji.
