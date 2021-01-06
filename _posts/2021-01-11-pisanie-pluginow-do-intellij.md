---
layout:    post
title:     "Wprowadzenie do pisania pluginów w intellij"
date:      2021-01-11 08:00:00 +0100
published: true
author:    bradlinski
image:     
tags:
    - intellij
    - ide
    - plugin
---

Intellij IDEA to obecnie jedno z popularniejszych jeśli nie najpopularniejsze IDE dla Javy. Jedną z jego zalet jest duża baza pluginów, dostarczana przez samo JetBrains jak i społeczność. W tym artykule przedstawię podstawowy tworzenia pluginów dla tej platformy. Większoś z zebranych to informacji(poza elementami związanymi z Javą) ma zastosowanie do dowolnego IDE ze stajni JestBrains.

## Sposoby rozszerzania IDE
W platformie mamy do dyspozycji trzy podstawowe metody rozszerzenia IDE:
- akcje - kod uruchamiany w momencie gdy użytkownik wprost kliknie np. w element menu kontekstowego lub paska narzędziowego
- listenery - pozwalają nasłuchiwać na eventy generowane przez platforme lub inne pluginy
- extension pointy - interfejsy pozwalające na rozszerzenie konkretnych elementów platformy lub innych pluginów

Dokładnie co jak działa możecie przeczytać w dokumentacji IDE. Ja przedstawię je w praktyce. Stworzymy prosty plugin, który wykorzysta wszystkie opisane wyżej metody. Przykładowy plugin, na podstawie adnotacji, wygeneruje plik tekstowy z prostą dokumentacją dla klas Javy(do tego wykorzystane zostaną akcjie i listenery) oraz pozowli na wyświetlenie tej dokumentacji w ramach `Quick Documentation`(Extension point). Mając klasę:

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
fieldWithExtraInfo: To jest testowe pole z dodatkowym opisem ze stałej

```

Na githubie znajduje się [repo z pluginem](https://github.com/m87/article-app) oraz [repo z testową aplikacją](https://github.com/m87/article-test-app)

## Baza pluginu
Przygodę z własnym pluginem rozpoczynamy od stworzenia nowego projektu typu `Intellij Platform Plugin`. Wygenerowana zostanie domyślna struktura katalogów oraz plik XML z manifestem(META-INF/plugin.xml). Zawiera on podstawowe informacje o pluginie. Jego uniklany identyfikator, opis, dane autora itd. W tym pliku definujemy również zależność plguinu. W naszym przypadku musimy zdefiniować trzy:

```xml
<depends>com.intellij.modules.platform</depends>
<depends>com.intellij.modules.lang</depends>
<depends>com.intellij.modules.java</depends>
```
- `*.platform` - zawiera interfejsy i klasy potrzebne do implementacji serwisów, akcji, ui, rozszerzeń itd.
- `*.lang` - zawiera elementy związane z przetwarzaniem plików, nawigacją itd.
- `*.java` - zawiera elementy ułatwiające prace z plikami Javy 

## Akcje
Mając już gotowy projekt bazowy możemy przejść do implementacjia akcji. Dodamy element do menu kontekstowego edytora oraz drzewa projektu - przycisk 'Generuj'. Narazie będzie wyświetlał tylko prostu popup z informacją.
Każda akcja w platformie musi rozszerzać abstrakcyjną klasę AnAction i implementować metodę actionPerformed. Tworzym zatem naszą akcję, którą nazwiemy DocAction.
Narazie implementacja actionPerformed sprowadzać będzie się do wyświetlenia okan dialogoweg. Do tego celu wykorzystamy gotowego helpera w platformie - Messages:

```java
public class DocAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent event) {
        Messages.showMessageDialog(event.getProject(), "Witam!", "", null);
    }
}
```

Na koniec musimy jeszcze powiązać naszą akcję z jakimś elementem IDE, który ją wywoła. Akcje definiujemy w manifeście w następujący sposób:
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
Atrybut `id` to unikalny identyfikator naszej akcji(zwykle `Fully qualified name` klasy), w atrybucie `class` wskazujemy implementację akcji. W atrybucie `text` określamy tekst przycisku w menu. Wewnatrz węzła akcji definiujemy, do której grupy akcji chcemy ją 'przypiąć'. W naszym przypadku jest to `EditorPopupMenu` - menu kontekstowe edytora oraz `ProjectViewPopupMenu` - menu kontekstowe drzewa projektu. 
Po uruchomieniu projektu i klknięciu prawym przyciskiem myszny an edytor pliku w menu kontekstowym pokaże nam się opcja 'Generuj'

![menu](/assets/img/posts/2020-09-01-pisanie-pluginow-do-intellij/menu.png)

Po kliknięcu w 'Generuj' pojawi się komunikat 'Witam!'

![message](/assets/img/posts/2020-09-01-pisanie-pluginow-do-intellij/message.png)

Dobrą praktyką jest organizowanie kilku akcji pluginu w ramach grupy. Co prawda nasz plugin będzie dostarczał tylko jedną akcję, nie mniej warto w celach dydaktycznych to zaprezentować. Analogicznie do akcji, grupy rozszerzają dedykowaną klasę `ActionGroup`. Implementacja grupy jest już zadaniem nieco bardziej złożonym dlatego platforma dostarcza domyślną implementację w postaci `DefaultActionGroup`. Tworzymy zatem nową klasę `DocGroup`:

```java

public class DocGroup extends DefaultActionGroup {
}

```

Stworzoną wcześniej akcje dodamy do nowej grupy, a następnie naszą grupę `DocGroup` dodamy do menu kontekstowego edytora i drzewa projektu:
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

Po uruchomieniu w miejscu przycisku 'Generuj' pojawi się przycisk 'Dokumentacja', kierujący do naszego submenu.

Plugin będzie generował dokumentację na podstawie adnotacji `Doc`. Dlatego też nie ma sensu uruchamiać akcji na plikach, które takiej adnotacji nie zawierają. W naszym pluginie przycisk 'Dokumentacja' pozostawimy widocznym, ale będzie nieaktywny jeśli celem naszej alcji jest plik nie zawierający adnotacji `Doc`. Widoczność i aktywność przycisku aktualizujemy w metodzie `update` wywoływanej w przypadku, gdy użytkowniki kliknie w jakiś element interfejsu zawierający tę akcję lub grupę:


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

W powyższym kodzie skorzystaliśmy z jednego z podstawowych elementów platformy tj. `PSI`(`Program Structure Interface`). Najprościej rzeczy ujmując, PSI odpowiada w platformie za parsowanie plików i generowanie modelu kodu, który zawierają. Dzięki temu w prosty sposób możemy, przejść po wszystkich klasach ich polach i metodach zwartych w danym pliku. Pełny model PSI można w prosty sposób podejrzeć za pomocą pluginu np. `PsiViewer`. W powyższym przykładzie pobieramy model PSI z kontekstu zdarzenia akcji(podobnie możemy odnieść się do otwartego edytor, czy zanaczonego fragmentu tesktu - patrz `com.intellij.openapi.actionSystem.CommonDataKeys`). Następnie weryfikujemy czy jest to model Javy. Jeśli tak to sprawdzamy czy klasy, ich pola lub metody posiadają adnotację `Doc`. Po tej zmianie, kliknięcie prawym przyciskiem myszy w plik, który nie zawiera tej adnotacji zdezaktywuje przycisk 'Generuj'. Na koniec pozostaje już tylko zaimplementować sam mechanizm generowania dokumentacji oraz zapisanie jej we wskazanym pliku.

#### Generowanie dokumentacji

Dokumentacja będzie składać się z wierszy zwierających nazwę dokumentowanego elementu(np. nazwa pola) oraz opisu z adnotacji. Przyjmując, że na wejsciu mamy model PSI pliku z kodem, wygenerowanie takiej dokumentacji może wyglądać mniej więcej tak:

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
Korzystając z PSI przechodzimy po wszystkich klasach w pliku oraz ich polach i metodach. Jeśli zawierają adnotacją `Doc`, to do wierszy dokumentacji dodajemy nazwę pola, znak ':' oraz wartość adnotacji. Nie możemy jednak wartości adnotacji pobrać wprost. Nie jest to String. Zależnie od tego co znajduje się w adnotacji będzie to model jakiegoś wyrażenia. Musimy takie wyrażenie wyliczyć(aby np. rozwiązać użyte w nim stałe). Dla ułatwienia tego typu zadań powstał ewaluator stałych, który jest częścią fasady Javy dla PSI:

```java
    private String evaulate(Project project, PsiAnnotationMemberValue expression) {
        return JavaPsiFacade.getInstance(project).getConstantEvaluationHelper().computeConstantExpression(expression).toString();
    }
```

Helper ten automatycznie rozwiąże nam wszystkie wyrażenie z adnotacji. Należy jednago pamiętać o tym aby projekt był zaindeksowany, a elementy wyrażenia widoczne w ramach projektu.
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

Przy zapisie do pliku zachaczamy o kolejny ważny element platformy - warstwę plików wirtualnych(Virtual File System). Udostępnia ona wspólne api do wszystkich operacji na plikach niezależnie od ich położenia. Pliki w tej wartstwie nie są fizycznymi plikami z dysku, tylko snapshotem systemu plików z danego czasu. Czasami możemy spotkać się z komunikatem w IDE, pytającym o to czy wczytać zmiany z dysku czy korzystać z wciąż z lokalnych plików. Zdarza się, że zmiany w projekcie nie odzwierciedlają zmian na dysku. Wtedy klikamy zwykle w 'Synchronize' lub 'Reload all from disk' - synchornizując wtedy właśnie pliki wirtualne.

Podobnie jak w innych systemach, Intellij udostępnia gotowe definicje okien dialogowych dla np. zapisu plików. W naszym przypadku jest to `FileSaverDialog`. Po wybraniu pliku i kliknięciu 'zapisz', dialog zwraca nam wrapper na pliku wirtualnym. Z wrappera pobieramy instancję pliku wirtualnego i zapisujemy do niego treść naszej dokumentacji.

Tym samym zaimplementowaliśmy w pełni działającą akcję naszego pluginu. Teraz przyszedł czas na kolejny element rozszerzający działanie IDE - listenery.

## Listenery
Listenery pozwalaja pluginowi reagować na eventy w ramach platformy, emitowane czy to przez IDE, czy przez inne pluginy. W przykładzie, plugin najpierw wyemituje event po zapisie dokumentacji. Jeśli plugin otrzyma event z szyny, to otworzy plik z dokumentacją w edytorze. Takie przechodzenie pomiędzy plikami jest co prawda trochę przekombinowane, ale w prosty zposób zaprezentuja działanie całego mechanizmu. 

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

Listener operował będzie na poziomie pojedynczego projektu. W metodzie `onSave` wykorzystaliśmy `OpenFileDescriptor`, który pozwala na otwarcie edytoru danego pliku z poziomu kodu.
Podobnie jak inne elementy rozszerzające działanie platformy, listenery także musimy zdefiniować w manifeście pluginu:

```java
    <projectListeners>
        <listener class="com.consdata.article.DocListener"
                  topic="com.consdata.article.DocSaved"/>
    </projectListeners>
```
Atrybut `class` zawiera implementację interfejsu naszego listenera, zdefiniowanego w polu `topic`. Listenery działające w obrębie całej aplikacji definiujemy w węźle `applicationListeres`. 

Coś musi jeszcze wywołać event, na który nasłuchujemy. W metodzie `save` naszej akcji dodajemy linię:

```java
   event.getProject().getMessageBus().syncPublisher(Topic.create("com.consdata.article.DocSaved", DocSaved.class)).onSave(vFile);
```

W efekcie po zapisie dokumentacji do pliku, automatycznie otworzy nam się edytor pliku dokumentacji.

## Extension Points
Ostatnim elementem jaki poznamy będa `Extension Pointy`. Są to wprost nazwane interfejsy, które pozwalają na rozszerzenie konkretnych elementów platformy lub innych pluginów. Pełna lista dostępnych extension pointów znajduje się na [https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html](https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html).

W ramach naszego projektu stworzym rozszerzenie dla extension pointa `com.intellij.documentationProvider`. Pozwala on na wzbogacenie o własne treści, dokumetancji prezentowanej np. w `Quick Documentation`(Ctrl + Q).
Tworzym kalsę `DocProvider` implementująca interfejs `DocumentationProvider` oraz `ExternalDocumentationProvider`.


```java

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
        ...
        return String.join("<br/>", doc.entrySet().stream().map(e -> "<b>" + e.getKey() + "</b>: " + e.getValue()).collect(Collectors.toList()));

    }

```
W `fetchExternalDocumentation` generujemy dokumentację dla wskazanej klasy analogicznie jak w akcji, tylko dla jednej klasy. Dodatkowo wzbogacamy dokumentację o znacznik HTML(w oknie `QuickDocumentation` rednerowany jest HTML). W `hasDocumentationFor` decydujemy czy dla danego elementu powinniśmy wygenerować dodatkową dokumentację, podobnie jak w przypadku grupy decydowaliśmy o jej aktywności.
Tak zdefiniowany provider możemy teraz zdefiniować w manifeście plaginu jak rozszerzenie dla `documentationProvider`:


```xml
    <extensions defaultExtensionNs="com.intellij">
        <documentationProvider implementation="com.consdata.article.DocProvider"/>
    </extensions>
```

Po uruchomieniu pluginu, przechodzimy do klasy `UseCase`. Najeżdżamy na typ `TestClass` i wcisakamy Ctrl + Q. Po jednokrotnym wciśnięciu skrót pojawi się popu z wygnerowaną dokumentacją:

![message](/assets/img/posts/2020-09-01-pisanie-pluginow-do-intellij/quickPopup.png)

Po ponownym użyciu skrótu odtworzy się szuflada:

![message](/assets/img/posts/2020-09-01-pisanie-pluginow-do-intellij/quickDrawer.png)

Oczywiście w przypadku innych externsion pintów, potrzeba będzie zdefiniować inne mechanizmy. Co do zasady sprawa jest jednakowa dla wszystkich etension pointów. Definujemy implementacje dla konkretnego przypadku i łaczymy ją z określonym extensionPointem w manifeście.

## Dystrybucja pluginu
Gotowy plugin pakujemy do paczki klikając prawym przyciskiem myszy na projekt pluginu i wybieramy `Prepare plugin module ... for deployment`. Wygenerowany JAR pluginu możemy opublikować w repo Intellij lub samodzielnie udostępniać go z [rywatnego repo](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/update_plugins_format.html).

## Przydatne linki
 - [Kompleksowe wprowadzenie do pluginów](https://jetbrains.org/intellij/sdk/docs/basics/basics.html)
 - [Forum odnośnie api i pisania pluginów](https://intellij-support.jetbrains.com/hc/en-us/community/topics/200366979-IntelliJ-IDEA-Open-API-and-Plugin-Development)
 - [Lista platformowych extension pointów](https://jetbrains.org/intellij/sdk/docs/appendix/resources/extension_point_list.html)
 - [Tworzenie prywatnego repo pluginów](https://jetbrains.org/intellij/sdk/docs/basics/getting_started/update_plugins_format.html)
 - [Repo z pluginem](https://github.com/m87/article-app)
 - [Repo z testową aplikacją](https://github.com/m87/article-test-app)
