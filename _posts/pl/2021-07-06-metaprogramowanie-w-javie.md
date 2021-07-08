---
layout:    post
title:     "Metaprogramowanie w Javie - @Target"
date:      2021-07-06 8:00:00 +0100
published: true
didyouknow: true
lang: pl
author:    dsurdyk
image:     /assets/img/posts/2021-07-06-metaprogramowanie-w-javie/metaprogramowanie.jpg
tags:
- java
---
W tym artykule dowiemy się jak używać adnotacji @Target przy tworzeniu własnej adnotacji.

`@Target` określa, w których miejscach konstruowana przez nas adnotacja może zostać użyta. Gdy zadeklarujemy, w których miejscach kodu jest możliwe użycie adnotacji, błędne jej umiejscowienie nie pozwoli na skompilowanie kodu.

### Podstawowa składnia adnotacji
Adnotacje tworzy się używając deklaracji interface ze znakiem `@` na początku. Taka adnotacja nic nie robi, lecz program nie wyrzuci błędu przy kompilacji.

```java
public @interface MyAnnotation {
}
```
Powyższa adnotacja nie ma zdefiniowanego miejsca w którym możemy jej użyć. Aby to zrobić, należy dodać adnotację @Target, wraz z parametrami.

Parametry do adnotacji `@Target` możemy przekazać na 4 różne sposoby. W trzecim i czwartym przykładzie możliwe jest zdefiniowanie jednej lub większej liczby typów:

```java
@Target(ElementType.FIELD)
@Target(value=ElementType.FIELD)
@Target({ElementType.FIELD, ElementType.CONSTRUCTOR})
@Target(value={ElementType.FIELD, ElementType.CONSTRUCTOR})
```
### Gdzie możemy użyć adnotacji, w zależności od przekazanego typu ElementType?

* `ElementType.ANNOTATION_TYPE` - adnotacja do tworzenia adnotacji 🙂. Na przykład wymienione w tytule `@Target()` jest taką adnotacją. Inny przykład to `@Retention()` opisujące cykl życia adnotacji. Obie są oznaczone adnotacją `ElementType.ANNOTATION_TYPE`. 

```java
@Target({ ElementType.ANNOTATION_TYPE })
public @interface MyAnnotation {
}

@MyAnnotation
@interface NewAnnotation {
}
```

* `ElementType.CONSTRUCTOR` - przy deklaracji konstruktora.

```java
@Target({ ElementType.CONSTRUCTOR })
public @interface MyAnnotation {
}
 
public class NewClass {
     
    @MyAnnotation
    public NewClass(){}
}
```

* `ElementType.FIELD` - przy deklaracji pola w klasie.

```java
@Target({ ElementType.FIELD })
public @interface MyAnnotation {
}
 
public class NewClass {
     
    @MyAnnotation
    private String text;
}
```
* `ElementType.LOCAL_VARIABLE` - przy deklaracji lokalnej zmiennej (np. w funkcji). Nie mylić z deklaracją `FIELD`.

```java
@Target({ ElementType.LOCAL_VARIABLE })
public @interface MyAnnotation {
}
 
public class NewClass {
     
    public void newFunction(){
        @MyAnnotation
        String text = "text";
    }
}
```
* `ElementType.METHOD` - przy deklaracji metody/funkcji.

```java

@Target({ ElementType.METHOD })
public @interface MyAnnotation {
}
 
public class NewClass {
 
    @MyAnnotation
    public void newFunction(){}
}
```
* `ElementType.PACKAGE` - przy deklaracji pakietu. Możliwe jedynie do dodania w pliku package-info.java!

```java
@Target({ ElementType.PACKAGE })
public @interface MyAnnotation {
}
 
@MyAnnotation
package mypackage; // tylko w pliku package-info.java
```
* `ElementType.PARAMETER` - przy deklaracji parametrów metody/funkcji.

```java
@Target({ ElementType.PARAMETER })
public @interface MyAnnotation {
}
 
public class NewClass {
    public void newFunction(@MyAnnotation int a, @MyAnnotation String b){}
}
```
* `ElementType.TYPE` - przy deklaracji klasy, interfejsu, enuma.

```java
@Target({ ElementType.TYPE })
public @interface MyAnnotation {
}
 
@MyAnnotation
public class NewClass {
}
```
* `ElementType.TYPE_USE` - od Javy 8. Wszędzie tam gdzie użyty jest typ. "As of the Java SE 8 release, annotations can also be applied to any type use. This means that annotations can be used anywhere you use a type. A few examples of where types are used are class instance creation expressions (new), casts, implements clauses, and throws clauses".

```java
@Target({ ElementType.TYPE_USE })
public @interface MyAnnotation {
}
 
public class NewClass extends @MyAnnotation Object{
    List< @MojaAdnotacja String> myList;
    int a = (@MyAnnotation int) 4.21;
    Exception e = new @MyAnnotation Exception();
}
```
* `ElementType.TYPE_PARAMETER`- od Javy 8. Przy definiowaniu typów generycznych.

```java
@Target({ ElementType.TYPE_PARAMETER })
public @interface MyAnnotation {
}
public class NewClass< @MyAnnotation T>{
    <@MyAnnotation U> void myMethod(){
    }
}
```

W przypadku gdy nie zadeklarujemy, w którym miejscu możemy użyć adnotacji, możemy jej użyć wszędzie oprócz TYPE_USE i TYPE_PARAMETER.

```java
public @interface MyAnnotation {
}
 
@MyAnnotation
@interface NewAnnotation {
}
 
@MyAnnotation
public class NewClass {
 
    @MyAnnotation
    String newField;
 
    @MyAnnotation
    public NewClass(){
    }
 
    @MyAnnotation
    public void newFunction(@MyAnnotation String parametr){
        @MyAnnotation String myLocalVariable;
    }
}
```

Źródła:
* [https://www.programmersought.com/article/7951304416/](https://www.programmersought.com/article/7951304416/)
* [https://www.samouczekprogramisty.pl/adnotacje-w-jezyku-java/](https://www.samouczekprogramisty.pl/adnotacje-w-jezyku-java/)
* [https://bykowski.pl/adnotacje-w-jezyku-java-2/](https://bykowski.pl/adnotacje-w-jezyku-java-2/)
* [https://docs.oracle.com/javase/tutorial/java/annotations/basics.html](https://docs.oracle.com/javase/tutorial/java/annotations/basics.html)
* [https://docs.oracle.com/javase/tutorial/java/annotations/type_annotations.html](https://docs.oracle.com/javase/tutorial/java/annotations/type_annotations.html)
