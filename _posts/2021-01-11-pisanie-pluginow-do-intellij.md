---
layout:    post
title:     "Jak napisać plugin w IntelliJ"
date:      2021-01-11 08:00:00 +0100
published: true
author:    bradlinski
image:     /assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/top.jpg
tags:
    - intellij
    - ide
    - plugin
---

IntelliJ IDEA to obecnie jedno z popularniejszych, jeśli nie najpopularniejsze IDE dla Javy. Jedną z jego zalet jest duża baza pluginów, dostarczana przez samo JetBrains, jak i społeczność. W tym artykule przedstawię podstawy tworzenia pluginów dla tej platformy. Większość z zebranych tu informacji (poza elementami związanymi z Javą) ma zastosowanie do dowolnego IDE ze stajni JetBrains.

## Sposoby rozszerzania IDE
W platformie mamy do dyspozycji trzy podstawowe metody rozszerzenia IDE:
- actions - kod uruchamiany w momencie, gdy użytkownik kliknie np. w element menu kontekstowego lub paska narzędziowego,
- listeners - pozwalają nasłuchiwać na eventy generowane przez platformę lub inne pluginy,
- extension points - interfejsy pozwalające na rozszerzenie konkretnych elementów platformy lub innych pluginów.

Więcej informacji o tym, co i jak działa, możecie znaleźć w dokumentacji IDE. Ja natomiast przedstawię ujęcie praktyczne, w ramach którego stworzymy prosty plugin dla IntelliJ, który wykorzysta wszystkie opisane wyżej metody. Przykładowy plugin, na podstawie adnotacji, wygeneruje plik tekstowy z prostą dokumentacją dla klas Javy (do tego wykorzystane zostaną akcje i listenery) oraz pozwoli na wyświetlenie tej dokumentacji w ramach `Quick Documentation` (Extension point). Mając klasę:

```java
@Doc("To jest testowa klasa")
public class TestClass {

    @Doc("To jest testowe pole")
    private String field;

    @Doc("To jest testowe pole " + Constants.ADDITIONAL_TEXT)
    private String fieldWithExtraInfo;

}
```

plugin wygeneruje dokumentację w postaci:

```text
TestClass: To jest testowa klasa
field: To jest testowe pole
fieldWithExtraInfo: To jest testowe pole z dodatkowym opisem ze stałe
```

Na githubie znajduje się [repozytorium z pluginem](https://github.com/m87/article-app) oraz [repozytorium z testową aplikacją](https://github.com/m87/article-test-app)

## Baza pluginu
Przygodę z własnym pluginem rozpoczynamy od stworzenia nowego projektu typu `Intellij Platform Plugin`. Wygenerowana zostanie domyślna struktura katalogów oraz plik XML z manifestem (META-INF/plugin.xml). Zawiera on podstawowe informacje o pluginie tj. jego unikalny identyfikator, opis, dane autora itd. W tym pliku definiujemy również zależność pluginu, w naszym przypadku będą takie trzy:

```xml
<depends>com.intellij.modules.platform</depends>
<depends>com.intellij.modules.lang</depends>
<depends>com.intellij.modules.java</depends>
```
- `*.platform` - zawiera interfejsy i klasy potrzebne do implementacji serwisów, akcji, UI, rozszerzeń itd.;
- `*.lang` - zawiera elementy związane z przetwarzaniem plików, nawigacją itd.;
- `*.java` - zawiera elementy ułatwiające prace z plikami Javy;

## Akcje
Mając już gotowy projekt bazowy możemy przejść do implementacji akcji czyli dodamy element do menu kontekstowego edytora i do drzewa projektu - przycisk 'Generuj'. Na razie będzie wyświetlał tylko popup z informacją.
Każda akcja w platformie musi rozszerzać abstrakcyjną klasę AnAction i implementować metodę actionPerformed. Tworzymy zatem naszą akcję, którą nazwiemy DocAction.
Na razie implementacja actionPerformed sprowadzać będzie się do wyświetlenia okna dialogowego. Do tego celu wykorzystamy gotowego helpera w platformie - Messages:

```java
public class DocAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent event) {
        Messages.showMessageDialog(event.getProject(), "Witam!", "", null);
    }
}
```

Na koniec musimy jeszcze powiązać naszą akcję z jakimś elementem IDE, który ją wywoła. Akcję definiujemy w manifeście w następujący sposób:
```xml
    <actions>
        <action id="com.consdata.article.DocAction"
                class="com.consdata.article.DocAction"
                text="Generuj">
            <add-to-group group-id="EditorPopupMenu" anchor="last"/>
            <add-to-group group-id="ProjectViewPopupMenu" anchor="last"/>
        </action>
    </actions>
```
Atrybut `id` to unikalny identyfikator naszej akcji (zwykle `Fully qualified name` klasy), w atrybucie `class` wskazujemy implementację akcji. W atrybucie `text` określamy tekst przycisku w menu. Wewnątrz węzła akcji definiujemy, do której grupy akcji chcemy ją 'przypiąć'. W naszym przypadku jest to `EditorPopupMenu` - menu kontekstowe edytora oraz `ProjectViewPopupMenu` - menu kontekstowe drzewa projektu. 
Po uruchomieniu projektu i klknięciu prawym przyciskiem myszy na edytor pliku w menu kontekstowym pokaże nam się opcja 'Generuj'

![menu](/assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/menu.png)

Po kliknięcu w 'Generuj' pojawi się komunikat 'Witam!'

![message](/assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/message.png)

Dobrą praktyką jest organizowanie kilku akcji pluginu w ramach grupy. Co prawda nasz plugin będzie dostarczał tylko jedną akcję, niemniej warto w celach dydaktycznych to zaprezentować. Analogicznie do akcji, grupy rozszerzają dedykowaną klasę `ActionGroup`. Implementacja grupy jest już zadaniem nieco bardziej złożonym, dlatego platforma dostarcza domyślną implementację w postaci `DefaultActionGroup`. Tworzymy zatem nową klasę `DocGroup`:

```java
public class DocGroup extends DefaultActionGroup {
}
```

Stworzoną wcześniej akcję dodajemy do nowej grupy, a następnie naszą grupę `DocGroup` dołączamy do menu kontekstowego edytora i drzewa projektu:
```xml
    <actions>
        <group id="com.consdata.article.DocGroup"
               class="com.consdata.article.DocGroup" popup="true"
               text="Dokumentacja">
            <add-to-group group-id="EditorPopupMenu" anchor="last"/>
            <add-to-group group-id="ProjectViewPopupMenu" anchor="last"/>
            <action id="com.consdata.article.DocAction"
                    class="com.consdata.article.DocAction"
                    text="Generuj">
            </action>
        </group>
    </actions>
```

Po uruchomieniu w miejscu przycisku 'Generuj' pojawi się przycisk 'Dokumentacja', kierujący do naszego podmenu.

Plugin będzie generował dokumentację na podstawie adnotacji `Doc`, dlatego też nie ma sensu uruchamiać akcji na plikach, które takiej adnotacji nie zawierają. W naszym pluginie przycisk 'Dokumentacja' pozostawimy widocznym, ale jednocześnie, jeśli celem akcji jest plik niezawierający adnotacji Doc, to wówczas warto by był nieaktywny. Widoczność i aktywność przycisku aktualizujemy w metodzie `update` wywoływanej w przypadku, gdy użytkownik kliknie w jakiś element interfejsu zawierający tę akcję lub grupę:


```java
public class DocGroup extends DefaultActionGroup {
    @Override
    public void update(@NotNull AnActionEvent event) {
        event.getPresentation().setVisible(true);
        event.getPresentation().setEnabled(ofNullable(CommonDataKeys.PSI_FILE.getData(event.getDataContext()))
                .map(this::hasDocAnnotation)
                .orElse(false));
    }

    private boolean hasDocAnnotation(PsiFile psiFile) {
        if (psiFile instanceof PsiJavaFile) {
            PsiJavaFile javaFile = (PsiJavaFile) psiFile;
            return Arrays.stream(javaFile.getClasses())
                    .anyMatch(psiClass -> psiClass.hasAnnotation("com.consdata.doc.Doc")
                            || Arrays.stream(psiClass.getFields()).anyMatch(field -> field.hasAnnotation("com.consdata.doc.Doc"))
                            || Arrays.stream(psiClass.getAllMethods()).anyMatch(method -> method.hasAnnotation("com.consdata.doc.Doc")));
        }
        return false;
    }

}
```

W powyższym kodzie skorzystaliśmy z jednego z podstawowych elementów platformy tj. `PSI` (`Program Structure Interface`). Najprościej rzecz ujmując, PSI odpowiada w platformie za parsowanie plików i generowanie modelu kodu, który zawierają. Dzięki temu w prosty sposób możemy, przejść po wszystkich klasach, ich polach i metodach zwartych w danym pliku. Pełny model PSI można w prosty sposób podejrzeć za pomocą pluginu np. `PsiViewer`. W powyższym przykładzie pobieramy model PSI z kontekstu zdarzenia akcji (podobnie możemy odnieść się do otwartego edytora, czy zaznaczonego fragmentu tekstu - patrz `com.intellij.openapi.actionSystem.CommonDataKeys`). Następnie weryfikujemy, czy jest to model Javy. Jeśli tak, to sprawdzamy, czy klasy, ich pola lub metody zawierają adnotację `Doc`. Po tej zmianie, kliknięcie prawym przyciskiem myszy w plik, który nie zawiera tej adnotacji zdezaktywuje przycisk 'Generuj'. Na koniec pozostaje już tylko zaimplementować sam mechanizm generowania dokumentacji oraz zapisać tę dokumentację we wskazanym pliku.

#### Generowanie dokumentacji

Dokumentacja będzie składać się z wierszy zawierających nazwę dokumentowanego elementu (np. nazwa pola) oraz opisu z adnotacji. Przyjmując, że na wejsciu mamy model PSI pliku z kodem, wygenerowanie takiej dokumentacji może wyglądać mniej więcej tak:

```java

    private String getDoc(PsiFile psiFile) {
        if (psiFile instanceof PsiJavaFile) {
            PsiJavaFile javaFile = (PsiJavaFile) psiFile;

            Map<String, String> doc = Arrays.stream(javaFile.getClasses())
                    .filter(psiClass -> psiClass.hasAnnotation("com.consdata.doc.Doc"))
                    .collect(Collectors.toMap(PsiClass::getName, psiClass -> evaulate(psiClass.getProject(), psiClass.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value"))));

            doc.putAll(Arrays.stream(javaFile.getClasses())
                    .map(PsiClass::getFields)
                    .flatMap(Arrays::stream)
                    .filter(psiField -> psiField.hasAnnotation("com.consdata.doc.Doc"))
                    .collect(Collectors.toMap(PsiField::getName, psiField -> evaulate(psiField.getProject(), psiField.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value")))));

            doc.putAll(Arrays.stream(javaFile.getClasses())
                    .map(PsiClass::getMethods)
                    .flatMap(Arrays::stream)
                    .filter(psiMethod -> psiMethod.hasAnnotation("com.consdata.doc.Doc"))
                    .collect(Collectors.toMap(PsiMethod::getName, psiMethod -> evaulate(psiMethod.getProject(), psiMethod.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value")))));

            return String.join("\n", doc.entrySet().stream().map(e -> e.getKey() + ": " + e.getValue()).collect(Collectors.toList()));
        } else {
            return "";
        }
    }

```
Korzystając z PSI przechodzimy po wszystkich klasach w pliku oraz ich polach i metodach. Jeśli zawierają adnotację `Doc`, to do wierszy dokumentacji dodajemy nazwę pola, znak ':' oraz wartość adnotacji. Nie możemy jednak wartości adnotacji pobrać wprost, gdyż nie jest to String. Zależnie od tego co znajduje się w adnotacji będzie to model jakiegoś wyrażenia. Musimy takie wyrażenie wyliczyć (aby np. rozwiązać użyte w nim stałe). Dla ułatwienia tego typu zadań powstał ewaluator stałych, który jest częścią fasady Javy dla PSI:

```java
    private String evaulate(Project project, PsiAnnotationMemberValue expression) {
        return JavaPsiFacade.getInstance(project).getConstantEvaluationHelper().computeConstantExpression(expression).toString();
    }
```

Helper ten automatycznie rozwiąże nam wszystkie wyrażenie z adnotacji. Należy jednak pamiętać o tym, aby projekt był zaindeksowany, a elementy wyrażenia widoczne w ramach projektu.
Na koniec naszą mapę konwertujemy do oczekiwanego Stringa i zapisujemy w pliku: 

```java

    private void save(String doc, AnActionEvent event) throws IOException {
        final FileSaverDialog dialog = FileChooserFactory.getInstance().createSaveFileDialog(
                new FileSaverDescriptor("Generate to", "", "txt"), event.getProject());
        VirtualFileWrapper wrapper = dialog.save(event.getProject().getProjectFile(), "");
        VirtualFile vFile = wrapper.getVirtualFile(true);
        vFile.setCharset(StandardCharsets.UTF_8);
        vFile.setBinaryContent(doc.getBytes());
    }

```

Przy zapisie do pliku zahaczamy o kolejny ważny element platformy - warstwę plików wirtualnych (Virtual File System). Udostępnia ona wspólne api do wszystkich operacji na plikach niezależnie od ich położenia. Pliki w tej warstwie nie są fizycznymi plikami z dysku, tylko snapshotem systemu plików z danego czasu. Czasami możemy spotkać się z komunikatem w IDE, pytającym o to, czy wczytać zmiany z dysku oraz czy korzystać wciąż z lokalnych plików. Zdarza się też, że zmiany w projekcie nie odzwierciedlają zmian na dysku. Wtedy klikamy zwykle w 'Synchronize' lub 'Reload all from disk' - synchornizując wtedy właśnie pliki wirtualne.

Podobnie jak w innych systemach, IntelliJ udostępnia gotowe definicje okien dialogowych dla np. zapisu plików. W naszym przypadku jest to `FileSaverDialog`. Po wybraniu pliku i kliknięciu 'zapisz', dialog zwraca nam wrapper na pliku wirtualnym. Z wrappera pobieramy instancję pliku wirtualnego i zapisujemy do niego treść naszej dokumentacji.

Tym samym zaimplementowaliśmy w pełni działającą akcję naszego pluginu. Teraz przyszedł czas na kolejny element rozszerzający działanie IDE - listenery.

## Listenery
Listenery pozwalaja pluginowi reagować na eventy w ramach platformy, emitowane czy to przez IDE, czy przez inne pluginy. W przykładzie plugin najpierw wyemituje event po zapisie dokumentacji. Jeśli plugin otrzyma event z szyny, to otworzy plik z dokumentacją w edytorze. Takie przechodzenie pomiędzy plikami jest, co prawda trochę przekombinowane, ale w prosty sposób zaprezentuje działanie całego mechanizmu. 

W pierwszej kolejności musimy zdefiniować interfejs naszego listenera:

```java
public interface DocSaved {
    void onSave(VirtualFile virtualFile);
}
```
Interfejs zawiera jedną definicję metody. Argumentem jest plik wirtualny, do którego dokumentacja została zapisana. W kolejnym korku tworzymy implementację listenera:

```java
public class DocListener implements DocSaved {

    private final Project project;

    public DocListener(Project project) {
        this.project = project;
    }

    @Override
    public void onSave(VirtualFile virtualFile) {
        Optional.ofNullable(virtualFile).ifPresent(vFile -> new OpenFileDescriptor(project, vFile).navigate(true));
    }
}
```

Listener będzie operować na poziomie pojedynczego projektu. W metodzie `onSave` wykorzystaliśmy `OpenFileDescriptor`, który pozwala na otwarcie edytora danego pliku z poziomu kodu.
Podobnie jak inne elementy rozszerzające działanie platformy, listenery także musimy zdefiniować w manifeście pluginu:

```xml
    <projectListeners>
        <listener class="com.consdata.article.DocListener"
                  topic="com.consdata.article.DocSaved"/>
    </projectListeners>
```
Atrybut `class` zawiera implementację interfejsu naszego listenera, zdefiniowanego w polu `topic`. Listenery działające w obrębie całej aplikacji definiujemy w węźle `applicationListeners`. 

Coś musi jeszcze wywołać event, na który nasłuchujemy. W metodzie `save` naszej akcji dodajemy linię:

```java
   event.getProject().getMessageBus()
                    .syncPublisher(Topic.create("com.consdata.article.DocSaved", DocSaved.class))
                    .onSave(vFile);
```

W efekcie po zapisie dokumentacji do pliku automatycznie otworzy nam się edytor pliku dokumentacji.

## Extension Points
Ostatnim elementem, jaki poznamy będą `Extension Pointy`. Są to wprost nazwane interfejsy, które pozwalają na rozszerzenie konkretnych elementów platformy lub innych pluginów. Pełna lista dostępnych extension pointów znajduje się na [https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html](https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html).

W ramach naszego projektu stworzymy rozszerzenie dla extension pointa `com.intellij.documentationProvider`. Pozwala on na wzbogacenie  dokumetancji prezentowanej np. w `Quick Documentation` (Ctrl + Q) o własne treści.
Tworzym klasę `DocProvider` implementująca interfejs `DocumentationProvider` oraz `ExternalDocumentationProvider`.


```java
public class DocProvider implements DocumentationProvider, ExternalDocumentationProvider {
    @Nullable
    @Override
    public String fetchExternalDocumentation(Project project, PsiElement psiElement, List<String> list) {
        return getDoc((PsiClass) psiElement);
    }

    @Override
    public boolean hasDocumentationFor(PsiElement psiElement, PsiElement psiElement1) {
        if (psiElement instanceof PsiClass) {
            PsiClass psiClass = (PsiClass) psiElement;
            return psiClass.hasAnnotation("com.consdata.doc.Doc")
                    || Arrays.stream(psiClass.getFields()).anyMatch(field -> field.hasAnnotation("com.consdata.doc.Doc"))
                    || Arrays.stream(psiClass.getMethods()).anyMatch(field -> field.hasAnnotation("com.consdata.doc.Doc"));
        }
        return false;
    }

    private String getDoc(PsiClass psiClass) {
        Map<String, String> doc = new HashMap<>();
        doc.put(psiClass.getName(), evaulate(psiClass.getProject(), psiClass.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value")));

        doc.putAll(Arrays.stream(psiClass.getFields())
                .filter(psiField -> psiField.hasAnnotation("com.consdata.doc.Doc"))
                .collect(Collectors.toMap(PsiField::getName, psiField -> evaulate(psiField.getProject(), psiField.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value")))));

        doc.putAll(Arrays.stream(psiClass.getMethods())
                .filter(psiMethod -> psiMethod.hasAnnotation("com.consdata.doc.Doc"))
                .collect(Collectors.toMap(PsiMethod::getName, psiMethod -> evaulate(psiMethod.getProject(), psiMethod.getAnnotation("com.consdata.doc.Doc").findAttributeValue("value")))));

        return doc.entrySet().stream().map(e -> "<b>" + e.getKey() + "</b>: " + e.getValue()).collect(Collectors.joining("<br/>"));

    }

    private String evaulate(Project project, PsiAnnotationMemberValue expression) {
        return JavaPsiFacade.getInstance(project).getConstantEvaluationHelper().computeConstantExpression(expression).toString();
    }
    
    @Nullable
    @Override
    public List<String> getUrlFor(PsiElement element, PsiElement originalElement) {
        return Collections.singletonList("");
    }

    @Override
    public boolean canPromptToConfigureDocumentation(PsiElement psiElement) {
        return false;
    }

    @Override
    public void promptToConfigureDocumentation(PsiElement psiElement) {
    }
}
```
W `fetchExternalDocumentation` generujemy dokumentację dla wskazanej klasy analogicznie jak w akcji, tylko dla jednej klasy. Dodatkowo wzbogacamy dokumentację o znacznik HTML (w oknie `QuickDocumentation` rednerowany jest HTML). W `hasDocumentationFor` decydujemy czy dla danego elementu powinniśmy wygenerować dodatkową dokumentację, podobnie jak w przypadku grupy, gdy decydowaliśmy o jej aktywności.
Tak zdefiniowany provider możemy teraz zdefiniować w manifeście pluginu jako rozszerzenie dla `documentationProvider`:


```xml
    <extensions defaultExtensionNs="com.intellij">
        <documentationProvider implementation="com.consdata.article.DocProvider"/>
    </extensions>
```

Po uruchomieniu pluginu, przechodzimy do klasy `UseCase`. Najeżdżamy na typ `TestClass` i wybieramy Ctrl + Q. Po wywołaniu skrótu pojawi się popup z wygenerowaną dokumentacją:

![message](/assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/quickPopup.png)

Po ponownym użyciu skrótu otworzy się szuflada:

![message](/assets/img/posts/2021-01-11-pisanie-pluginow-do-intellij/quickDrawer.png)

Oczywiście w przypadku innych extension pointów potrzeba będzie zdefiniować inne mechanizmy. Co do zasady sprawa jest jednakowa dla wszystkich extension pointów. Definujemy implementację dla konkretnego przypadku i łączymy ją z określonym extensionPointem w manifeście.

## Plugin w IntelliJ - dystrybucja
Gotowy plugin pakujemy do paczki klikając prawym przyciskiem myszy na projekt pluginu i wybieramy `Prepare plugin module ... for deployment`. Wygenerowany JAR pluginu możemy opublikować w repo IntelliJ lub samodzielnie udostępniać go z [prywatnego repo](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/update_plugins_format.html).

## Przydatne linki
 - [Kompleksowe wprowadzenie do pluginów](https://jetbrains.org/intellij/sdk/docs/basics/basics.html)
 - [Forum odnośnie api i pisania pluginów](https://intellij-support.jetbrains.com/hc/en-us/community/topics/200366979-IntelliJ-IDEA-Open-API-and-Plugin-Development)
 - [Lista platformowych extension pointów](https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html)
 - [Tworzenie prywatnego repo pluginów](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/update_plugins_format.html)
 - [Repo z pluginem](https://github.com/m87/article-app)
 - [Repo z testową aplikacją](https://github.com/m87/article-test-app)
