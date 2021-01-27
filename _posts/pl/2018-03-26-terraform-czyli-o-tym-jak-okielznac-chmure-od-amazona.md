---
layout:    post
title:     "Terraform - czyli o tym, jak okiełznać chmurę od Amazona"
date:      2018-03-26 08:00:00 +0100
published: true
lang: pl
author:    jgrobelny
image:     /assets/img/posts/2018-03-26-terraform-czyli-o-tym-jak-okielznac-chmure-od-amazona/terraform.png
tags:
    - terraform
    - aws
---
<blockquote>“Get your clouds right.” <span>Dwight Schrute, The Office</span></blockquote>

Nie tak dawno temu, Jakub Wilczewski opublikował wyczerpujący [wstęp do programowania w AWS]({% post_url pl/2018-01-17-aws-serverless-programming %}). Jakub użył webowej konsoli AWS do definiowania zasobów. Jest to metoda, która sprawdza się w przypadku prezentacji oraz nauki. Jednak w przypadku regularnej pracy z kodem, potrzebujemy narzędzi, które umożliwią nam zautomatyzowanie procesu tworzenia a także niszczenia zasobów AWS. Wykorzystam zaproponowaną przez niego aplikację, aby pokazać, jak można to zrobić, korzystając z rozwiązania Terraform od firmy Hashicorp.

## Konfiguracja i pierwsza terraformacja chmury
Firmę Hashicorp powinni kojarzyć wszyscy, którzy mieli do czynienia z rozwiązaniami chmurowymi. Stoi ona za takimi rozwiązaniami jak Vault, Consul czy Vagrant. Terraform jest ich odpowiedzią na jeden z paradygmatów kultury devops, jakim jest "infrastructure as code".

Zanim przystąpimy do terraformacji chmury AWS potrzebne będą dwie binarki:
- [https://aws.amazon.com/cli/](https://aws.amazon.com/cli/)
- [https://www.terraform.io/downloads.html](https://www.terraform.io/downloads.html)

AWS CLI jest co prawda opcjonalny, ale pozwala uwolnić skrypty Terraform od danych logowania użytkownika. Żeby to osiągnąć, wystarczy jednorazowo zalogować się do konsoli AWS, wydając polecenie:
```bash
$ aws configure
AWS Access Key ID [None]: xxx
AWS Secret Access Key [None]: xxx
Default region name [None]: eu-central-1
Default output format [None]:
```

Jedną z najbardziej elementarnych czynności związanych z pracą z chmurą Amazonu jest utworzenie nowej "wirtualki", czyli instancji usługi EC2. Oto minimalny skrypt Terraform, który tę czynność automatyzuje:
```
provider "aws" {
  version = "~> 0.1"
  region = "eu-central-1"
}

resource "aws_instance" "step0" {
  ami = "ami-13b8337c"
  instance_type = "t2.micro"
}
```

Pierwsza sekcja wskazuje dostawcę usług, druga jest dyrektywą uruchomienia instancji EC2 z obrazu o identyfikatorze ami-13b8337c. Numer taki można podejrzeć w konsoli webowej AWS albo u autora konkretnej dystrybucji systemu operacyjnego, na przykład [Ubuntu](https://cloud-images.ubuntu.com/locator/ec2/).

W celu uruchomienia procesu tworzenia zasobów, należy wykonać sekwencje poleceń
```bash
$ terraform init
$ terraform plan
$ terraform apply
```

Pierwsze polecenie uruchamiamy raz w katalogu ze skryptem i spowoduje ono pobranie bibliotek koniecznych do komunikacji z dostawcą usług. Drugie polecenie wydrukuje na wyjściu plan wykonania skryptu, który zostanie uruchomiony trzecim poleceniem. Po kilkunastu sekundach, instancja powinna być uruchomiona i gotowa do pracy. Na zakończenie polecenie, które jest wisienką na torcie, czyli wycofanie wszystkich zmian wprowadzonych w poprzednim kroku.
```bash
$ terraform destroy
```

W tym miejscu warto się na chwilę zatrzymać i wyjaśnić, w jaki sposób Terraform śledzi stan zmian. Po wykonaniu polecenia 'apply', w katalogu bieżącym powstanie plik terraform.tfstate oraz jego kopia terraform.tfstate.backup. Plik ten jest zapisem stanu środowiska i od tego momentu możliwe jest wprowadzanie zmian wyłącznie za pomocą Terraforma. Jeśli wprowadzimy zmiany z konsoli AWS, to Terraform nie będzie ich śledził. Nie ma żadnego mechanizmu odpytywania aktualnego stanu chmury. Warto o tym pamiętać, pracując z Terraformem.

## Skrypt dla kompletnej aplikacji
Po tym krótkim wstępie mamy niezbędną wiedzę pozwalającą nam rozpocząć pracę z automatyzacją konfiguracji usług w chmurze. Na stronach HashiCorp dokumentujących Terraform, można znaleźć [wyczerpujący opis wszystkich dyrektyw](https://www.terraform.io/docs/providers/aws/).

Teraz możemy przejść do opisu automatyzacji przykładowej aplikacji opisanej przez Jakuba. Zdaję sobie sprawę, że niektóre elementy mogą być dość skomplikowane na pierwszy rzut oka. Musicie mi jednak uwierzyć na słowo, że jak tylko zaczniecie korzystać z tego sposobu konfiguracji, nigdy nie wrócicie już do ręcznego wyklikiwania z konsoli AWS. Postaram się zachować kolejność, w której Jakub dodawał zasoby za pomocą konsoli. Zrezygnuję jednak z rozbicia na poszczególne przepływy, czyli odczyt i zapis notatek będę realizował równocześnie. Zaczynamy zatem od kodu źródłowego, który umieszczamy w plikach note-find-lambda.js i note-add-lambda.js. Przygotuję sobie także pomocniczny skrypt w Bash, który spakuje kod do archiwum:
```bash
#!/usr/bin/env bash
rm *.zip
zip -R note-add-lambda.zip ./note-add-lambda.js
zip -R note-find-lambda.zip ./note-find-lambda.js
```

Zaczynamy od zdefiniowania dostawcy, tabeli DynamoDB oraz dwóch Lambd:
```
provider "aws" {
  version = "~> 0.1"
  region = "eu-central-1"
}

resource "aws_dynamodb_table" "notes-table" {
  name = "notes"
  read_capacity = 1
  write_capacity = 1
  hash_key = "userName"
  range_key = "timestamp"

  attribute {
    name = "userName"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }
}

resource "aws_lambda_function" "note-add-lambda" {
  filename = "note-add-lambda.zip"
  function_name = "note-add-lambda"
  role = "${aws_iam_role.iam_for_lambda.arn}"
  handler = "note-add-lambda.handler"
  source_code_hash = "${base64sha256(file("note-add-lambda.zip"))}"
  runtime = "nodejs6.10"
  timeout = "10"
  memory_size = "256"
}

resource "aws_lambda_function" "note-find-lambda" {
  filename = "note-find-lambda.zip"
  function_name = "note-find-lambda"
  role = "${aws_iam_role.iam_for_lambda.arn}"
  handler = "note-find-lambda.handler"
  source_code_hash = "${base64sha256(file("note-find-lambda.zip"))}"
  runtime = "nodejs6.10"
  timeout = "10"
  memory_size = "256"
}
```

Następnie musimy wprost zdefiniować coś, co w przypadku tworzenia z poziomu konsoli web zadziało się "automagicznie", czyli uprawnienie dla Lambd do korzystania z tabeli w DynamoDB. Możemy zrobić to w następujący sposób.
```
resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "role_policy_for_dynamodb_access" {
  name = "role_policy_for_dynamodb_access"
  role = "${aws_iam_role.iam_for_lambda.id}"

  policy = EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AccessAllNotes",
            "Effect": "Allow",
            "Action": [
                "dynamodb:*"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
EOF
}
```
Na tym etapie skrypt jest gotowy do uruchomienia i testowania z poziomu samych Lambd. Kolejnym elementem będzie wystawienie usług na świat, czyli wygenerowanie całej otoczki związanej z usługą API Gateway. Elementów jest niemało, ale wszystkie one składają się na elegancki opis API wystawionego w przypadku prostej aplikacji zarządzającej notatkami.

W pierwszej kolejności tworzymy elementy ścieżki URI:
```
//COMMON API

resource "aws_api_gateway_rest_api" "NotesAPI" {
  name = "NotesAPI"
}

resource "aws_api_gateway_resource" "notes-resource" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  parent_id = "${aws_api_gateway_rest_api.NotesAPI.root_resource_id}"
  path_part = "notes"
}

resource "aws_api_gateway_resource" "notes-userName-resource" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  parent_id = "${aws_api_gateway_resource.notes-resource.id}"
  path_part = "{userName}"
}
```

Teraz kolej na usługę GET oraz jej integrację z note-find-lambda:
```
//GET IMPLEMENTATION

resource "aws_api_gateway_method" "notes-get-method" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "GET"
  authorization = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_method_response" "notes-get-method-response-ok-200" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "${aws_api_gateway_method.notes-get-method.http_method}"
  status_code = "200"
}

resource "aws_api_gateway_method_response" "notes-get-method-response-not-found-error-404" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "${aws_api_gateway_method.notes-get-method.http_method}"
  status_code = "404"
}

resource "aws_api_gateway_integration" "notes-get-integration" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "${aws_api_gateway_method.notes-get-method.http_method}"
  integration_http_method = "POST"
  type = "AWS"
  uri = "arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/${aws_lambda_function.note-find-lambda.arn}/invocations"
  request_templates {
    "application/json" = EOF
    {
       "userName": "$input.params('userName')"
    }
    EOF
  }
}

resource "aws_api_gateway_integration_response" "notes-get-integration-response" {
  depends_on = [
    "aws_api_gateway_integration.notes-get-integration"]
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "${aws_api_gateway_method.notes-get-method.http_method}"
  status_code = "${aws_api_gateway_method_response.notes-get-method-response-ok-200.status_code}"
  response_templates {
    "application/json" = EOF
#set($inputRoot = $input.path('$'))
$inputRoot.Items
EOF
  }
}

resource "aws_api_gateway_integration_response" "notes-get-integration-response-user-does-not-exist" {
  depends_on = [
    "aws_api_gateway_integration.notes-get-integration"]
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-userName-resource.id}"
  http_method = "${aws_api_gateway_method.notes-get-method.http_method}"
  status_code = "${aws_api_gateway_method_response.notes-get-method-response-not-found-error-404.status_code}"
  selection_pattern = ".*errorCode\":\"USER_DOES_NOT_EXIST.*"
  response_templates {
    "application/json" = EOF
#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
{
  "errorCode" : "$errorMessageObj.errorCode",
  "message" : "$errorMessageObj.message"
}
EOF
  }
}

resource "aws_lambda_permission" "notes-get-lambda-permision" {
  statement_id = "AllowExecutionFromAPIGatewayNotesGet"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.note-find-lambda.arn}"
  principal = "apigateway.amazonaws.com"
}
```
analogicznie dla POST:
```
//POST IMPLEMENTATION

resource "aws_api_gateway_request_validator" "notes-request-validator" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  name = "NotesRequestValidator"
  validate_request_body = true
}

resource "aws_api_gateway_model" "notes-model" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  name = "NotesRequestModel"
  content_type = "application/json"

  schema = EOF
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "",
  "type": "object",
  "properties": {
    "userName": {
      "type": "string",
      "minLength": 1
    },
    "content": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "userName",
    "content"
  ]
}
EOF
}

resource "aws_api_gateway_method" "notes-post-method" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "POST"
  authorization = "NONE"
  api_key_required = true
  request_models = {
    "application/json" = "NotesRequestModel"
  }
  request_validator_id = "${aws_api_gateway_request_validator.notes-request-validator.id}"
  depends_on = [
    "aws_api_gateway_model.notes-model"]
}

resource "aws_api_gateway_method_response" "notes-post-method-response-created-201" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "${aws_api_gateway_method.notes-post-method.http_method}"
  status_code = "201"
}

resource "aws_api_gateway_method_response" "notes-post-method-response-create-400" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "${aws_api_gateway_method.notes-post-method.http_method}"
  status_code = "400"
}


resource "aws_api_gateway_integration" "notes-post-integration" {
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "${aws_api_gateway_method.notes-post-method.http_method}"
  integration_http_method = "POST"
  type = "AWS"
  uri = "arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/${aws_lambda_function.note-add-lambda.arn}/invocations"
  request_templates {
    "application/json" = EOF
{
  "userName" : $input.json('$.userName'),
  "content" : $input.json('$.content')
}
EOF
  }
}


resource "aws_api_gateway_integration_response" "notes-post-integration-response" {
  depends_on = [
    "aws_api_gateway_integration.notes-post-integration"]
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "${aws_api_gateway_method.notes-post-method.http_method}"
  status_code = "${aws_api_gateway_method_response.notes-post-method-response-created-201.status_code}"
  response_templates {
    "application/json" = EOF
#set($inputRoot = $input.path('$'))
$inputRoot
EOF
  }
}

resource "aws_api_gateway_integration_response" "notes-post-integration-response-error-400" {
  depends_on = [
    "aws_api_gateway_integration.notes-post-integration"]
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  resource_id = "${aws_api_gateway_resource.notes-resource.id}"
  http_method = "${aws_api_gateway_method.notes-post-method.http_method}"
  status_code = "${aws_api_gateway_method_response.notes-post-method-response-create-400.status_code}"
  selection_pattern = ".*errorCode.*"
  response_templates {
    "application/json" = EOF
#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage')))
{
  "errorCode" : "$errorMessageObj.errorCode",
  "message" : "$errorMessageObj.message"
}
EOF
  }
}

resource "aws_lambda_permission" "notes-post-lambda-permision" {
  statement_id = "AllowExecutionFromAPIGatewayNotesPost"
  action = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.note-add-lambda.arn}"
  principal = "apigateway.amazonaws.com"
}
```

Na zakończenie sekcja związana z osadzeniem API i wystawieniem na zewnątrz. Ponieważ API w chwili zakończenia wykonywania skryptu zostanie wystawione na świat, warto zatroszczyć się o jego podstawowe chociaż zabezpieczenia. W dyrektywie aws_api_gateway_api_key możemy wskazać token, który będzie niezbędny do korzystania z usług. W poniższym przykładzie jest on ustawiony na stałe, ale nic nie stoi na przeszkodzie, żeby go przekazać w parametrach.
```
resource "aws_api_gateway_deployment" "notes-deployment" {
  depends_on = [
    "aws_api_gateway_integration.notes-get-integration",
    "aws_api_gateway_integration.notes-post-integration"
  ]
  rest_api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
  stage_name = "test"
}

resource "aws_api_gateway_usage_plan" "notes-usage-plan" {
  name         = "NotesUsagePlan"
  description  = "Notes usage plan"

  api_stages {
    api_id = "${aws_api_gateway_rest_api.NotesAPI.id}"
    stage  = "${aws_api_gateway_deployment.notes-deployment.stage_name}"
  }
}

resource "aws_api_gateway_api_key" "notes-api-key" {
  name = "NotesApiKey"
  value = "NtMLWD6CG49mgtbpcWTmd5jCtkSyUvow9LMV5KMf"
}

resource "aws_api_gateway_usage_plan_key" "notes-usage-plan-key" {
  key_id        = "${aws_api_gateway_api_key.notes-api-key.id}"
  key_type      = "API_KEY"
  usage_plan_id = "${aws_api_gateway_usage_plan.notes-usage-plan.id}"
}
```
Tym samym dotarliśmy do końca przykładu. Uruchomienie skryptu spowoduje wygenerowanie całego środowiska w przeciągu sekund. Warto również przypomnieć, że jednym poleceniem możemy posprzątać po sobie, usuwając wszystkie zasoby z chmury.

Uważny czytelnik mógłby w tym momencie zapytać - "a co w przypadku, gdy mamy wiele środowisk?". I będzie to słuszne pytanie - powyższy przykład nie zadziała poprawnie w takiej sytuacji. Podobnie jak w przypadku wielu developerów współdzielących jedno konto AWS. Albo, co jest najczęstszym przypadkiem, kombinacją obu powyższych. W tej sytuacji, z pomocą przychodzi nam mechanizm zmiennych środowiskowych, wspierany przez Terraforma. Wystarczy taką zmienną zdefiniować, a następnie użyć w nazwach wszystkich nazwanych zasobów. Trzeba także przekazać ją do wnętrza funkcji Lambda tak, aby funkcja wiedziała, z którą tabelą DynamoDB ma rozmawiać. Żeby nie powielać i tak długiego skryptu, pozwolę sobie zastosować tryb zmian, żeby zobrazować sposób wprowadzania takiej zmiennej:
```diff
--- a/instance.tf
+++ b/instance.tf
+variable "env" {
+  default = ""
+}
+
-  name = "notes"
+  name = "${var.env}-notes"
-  name = "iam_for_lambda"
+  name = "${var.env}-iam_for_lambda"
-  name = "role_policy_for_dynamodb_access"
+  name = "${var.env}-role_policy_for_dynamodb_access"
-  function_name = "note-add-lambda"
+  function_name = "${var.env}-note-add-lambda"
+  environment {
+    variables = {
+      environment_name = "${var.env}"
+    }
+  }
-  function_name = "note-find-lambda"
+  function_name = "${var.env}-note-find-lambda"
+  environment {
+    variables = {
+      environment_name = "${var.env}"
+    }
+  }
-  name = "NotesAPI"
+  name = "${var.env}-NotesAPI"
-  stage_name = "test"
+  stage_name = "${var.env}"
-  name         = "NotesUsagePlan"
+  name         = "${var.env}-NotesUsagePlan"
-  name = "NotesApiKey"
-  value = "NtMLWD6CG49mgtbpcWTmd5jCtkSyUvow9LMV5KMf"
+  name = "${var.env}-NotesApiKey"
+  value = "${var.env}-NtMLWD6CG49mgtbpcWTmd5jCtkSyUvow9LMV5KMf"

--- a/note-add-lambda.js
+++ b/note-add-lambda.js
+const env = process.env.environment_name;
-        TableName: 'notes',
+        TableName: env + '-notes',
--- a/note-find-lambda.js
+++ b/note-find-lambda.js
+const env = process.env.environment_name;
-        TableName: 'notes',
+        TableName: env + '-notes',
```

## Podsumowanie
Automatyzacja procesów tworzenia środowiska wykonywalnego dla naszych komponentów w chmurze, nie tylko pozwala zaszczędzić czas, ale stanowi żywą dokumentację oraz przepis na to, jak takie środowisko powielić w razie potrzeb. Mam nadzieję, że wpis ten, wraz z artykułem Jakuba, stanowią wystarczające wprowadzenie do pracy w środowisku Amazon AWS.

## Bibliografia
- [https://www.terraform.io/docs/index.html](https://www.terraform.io/docs/index.html)
