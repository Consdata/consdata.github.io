---
layout:    post
title:     "Jak zmusić mongodb do użycia indeksu bez zmiany kodu - zastosowanie index filter"
date:      2023-10-06T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: jwilczewski
image: /assets/img/posts/2023-10-06-jak-zmusic-mongodb-do-uzycia-indeksu-bez-zmiany-kodu/mongodb.jpg
tags:
- mongodb
- index
- planCacheSetFilter
- index filter
- query shape
---

## Optymalizotory zapytań

Optymalizator zapytań to element silnika bazy danych, który dba o to, aby zapytanie zostało wykonane w optymalny sposób, uwzględniając zbiór danych przechowywanych w danym momencie w bazie. Pod pojęciem optymalny mamy zazwyczaj na myśli taki sposób, który zwróci nam wynik zapytania w najkrótszym czasie. Optymalizator bierze pod uwagę statystyki gromadzone i aktualizowane na bieżąco podczas działania bazy danych. Optymalizatory są wbudowane zarówno w bazy SQL'owe jak i bazy NoSQL. Sposób działania optymalizatora dla mongodb możemy znaleźć na stronie: [https://www.mongodb.com/docs/manual/core/query-plans/](https://www.mongodb.com/docs/manual/core/query-plans/). W znakomitej większości przypadków optymalizatory są dużym ułatwieniem dla programistów, którzy nie muszą poświęcać czasu na analizę rozkładu danych w poszczególnych tabelach/kolekcjch i samodzielnie optymalizować wykonywanych zapytań. Z uwagi na to, że optymalizator działa bez kontroli programisty zdarzają się jednak sytuacje, w których jego zachowanie jest dla nas zaskakujące i może prowadzić do problemów wydajnościowych.   

## Analiza problemów wydajnościowych

Jeżeli mamy podejrzenie, że problemy z wydajnością naszego systemu mogą być związane z bazą mongodb istnieje dość prosty sposób, który pozwala na potwierdzenie lub wykluczenie takiej tezy. Należy mianowicie ustawić próg czasowy, przy którym mongodb będzie logowało przekraczające go zapytania:
[https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs](https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs).

W analizowanym przez nas przypadku, w logu diagnostycznym znajdowało się wiele wpisów, których czas wykonania przekraczał 10 sekund:
```
2023-10-01T14:50:35.652+0100 I COMMAND  [conn121] command formstore_db.formModel command: find { find: "formModel", readConcern: { level: "majority" }, filter: { formFields.formInstanceNumber.value: { $in: [ "COR4236202310131257073150", "COR4236202310131301403155", "COR4236202310131303093157", "COR4236202310131304493160", "COR4236202310131307543163", "COR4236202310131309113164", "COR4236202310131312063169", "COR4236202310131313393173", "COR4236202310131316003176", "COR4236202310131317053180", "COR4236202310131319153182", "COR4236202310131320203184", "COR4236202310131321283185", "COR4236202310131322183187", "COR4236202310131323243188", "COR4236202310131325233192", "COR4236202310131326113196", "COR4236202310131326583198", "COR4236202310131328073200", "COR4236202310131331033203", "COR4236202310131335123206", "COR4236202310131340003210", "COR4236202310131340463212", "COR4236202310131342313214", "COR4236202310131345293217", "COR4236202310131351543220", "COR4236202310131353313222", "COR4236202310131355073226", "COR4236202310131357053229", "COR4237202310131425401494", "COR4236202310131433123250", "COR4236202310131517313292", "COR4236202310131518413294", "COR4236202310131520553297", "COR4236202310131521433299", "COR4236202310131522523304", "COR4236202310131529033308", "COR4236202310131529583311", "COR4236202310131536393315", "COR4236202310140717303352", "COR4236202310140720093353", "COR4236202310140721083354", "COR4236202310140722093355", "COR4236202310140723363357", "COR4236202310140726553358", "COR4236202310140728083359", "COR4236202310140728593360", "COR4236202310140730003361", "COR4236202310140730413362", "COR4236202310140807533373", "COR4236202310140809033376", "COR4236202310140810003377", "COR4237202310150947272272", "COR4237202310150955452282", "COR4237202310150956472284", "COR4237202310151004272296", "COR4237202310151005332297", "COR4236202310151009214060", "COR4236202310151010104062", "COR4236202310151011004065", "COR4236202310151011524067", "COR4236202310151013594072", "COR4236202310151015214074", "COR4236202310151017134080", "COR4236202310151018234085", "COR4236202310151039104112", "COR4236202310151041024114", "COR4236202310151041554116", "COR4236202310151042464119", "COR4236202310151043554120", "COR4236202310151056304136", "COR4236202310151058274138", "COR4236202310151059394140", "COR4236202310151101134142", "COR4236202310151102374144" ] }, formType: "corpo_reset_balance" }, sort: { _id: -1 }, projection: { formFields.GesComplexComponent5．GesTileGroup1: 1, formType: 1, formFields.currentYear: 1, formFields.GesComplexComponent1．transferAccount: 1, formFields.startTime: 1, formFields.finishTime: 1, formFields.GesComplexComponent7．GesTileGroup1: 1, formFields.formInstanceNumber: 1, formFields.kozbeDescription: 1, formFields.operationIdFromBDB: 1, formFields.CorpoSegment: 1, formFields.transferTime: 1, formFields.GesComplexComponent1．beneficiaryName: 1, formFields.formProcessingStatus: 1, formFields.GesComplexComponent2．GesFrontendComponent2: 1, formFields.GesComplexComponent3．GesTextField1: 1, lastUpdateTime: 1 }, $db: "formstore_db", $clusterTime: { clusterTime: Timestamp(1671457810, 3), signature: { hash: BinData(0, 9A2225836AC174D40666995D6954154960FE67DB), keyId: 7137070794986749953 } }, lsid: { id: UUID("36e6cf62-4ad2-4b34-8a56-227d283da075") } } planSummary: IXSCAN { _id: 1 } keysExamined:254713 docsExamined:254713 fromMultiPlanner:1 replanned:1 cursorExhausted:1 numYields:2213 nreturned:75 reslen:289780 locks:{ Global: { acquireCount: { r: 2214 } }, Database: { acquireCount: { r: 2214 } }, Collection: { acquireCount: { r: 2214 } } } storage:{ data: { bytesRead: 15335932371, timeReadingMicros: 10566758 }, timeWaitingMicros: { cache: 56 } } protocol:op_msg 11597ms
```
Linijka logu jest dość długa. Na jej końcu mamy podany czas wykonania zapytania: `protocol:op_msg 11597ms`. Czas wykonania zdecydowanie przekraczał oczekiwaną wartość, co pozwoliło potwierdzić tezę, że przyczyna problemów wydajnościowych leży po stronie bazy danych. Warto zwrócić jeszcze uwagę na następującą informację w logu:

`planSummary: IXSCAN { _id: 1 } keysExamined:254713 docsExamined:254713`.

Wskazuje ona na to, że użyty został standardowy indeks mongodb zakładany na identyfikatorze kolekcji `_id`. Oczekiwaliśmy tutaj raczej użycia indeksu założenego na polu, po którym odbywało się filtrowanie czyli na `formFields.formInstanceNumber.value`. W takim przypadku pierwsze podejrzenie padło na możliwy brak indeksu. W celu potwierdzenia lub zaprzeczenia tej możliwości pobraliśmy indeksy założone na problematycznej kolekcji: `db.formModel.getIndexes();`. Odpowiedź wskazywała jednak, że wymagany indeks został założony:
```json
[
        {
                "v" : 2,
                "key" : {
                        "_id" : 1
                },
                "name" : "_id_",
                "ns" : "formstore_db.formModel"
        },
        {
                "v" : 2,
                "key" : {
                        "formFields.formInstanceNumber.value" : 1
                },
                "name" : "formFields.formInstanceNumber.value_1",
                "ns" : "formstore_db.formModel",
                "background" : true
        }
]
```

## Sprawdzamy plan zapytania

W takim przypadku warto przeprowadzić analizę planu zapytania. Co ważne należy go przeprowadzić na środowisku, na którym wystąpiły problemy, gdyż wyniki pracy optymalizatora są zależne od danych znajdujących się w bazie oraz statystyk zbieranych podczas jej działania. Wyświetlenie wybranego planu zapytania oraz planów alternatywnych realizujemy poprzez wywołanie zapytania wykonywanego przez aplikację, w którym na końcu dodajemy: `.explain("allPlansExecution")`. W analizowanym przypadku otrzymaliśmy następujący wynik:
```json
{
  "queryPlanner" : {
    "plannerVersion" : 1,
    "namespace" : "formstore_db.formModel",
    "indexFilterSet" : false,
    "parsedQuery" : {
      "$and" : [
        {
          "formType" : {
            "$eq" : "corpo_reset_balance"
          }
        },
        {
          "formFields.formInstanceNumber.value" : {
            "$in" : [
              "COR4237202310131425401494",
              "COR4237202310150947272272",
              "COR4237202310150955452282",
              "COR4237202310150956472284",
              "COR4237202310151004272296",
              "COR4237202310151005332297",
              "COR4236202310131257073150",
              "COR4236202310131301403155",
              "COR4236202310131303093157",
              "COR4236202310131304493160",
              "COR4236202310131307543163",
              "COR4236202310131309113164",
              "COR4236202310131312063169",
              "COR4236202310131313393173",
              "COR4236202310131316003176",
              "COR4236202310131317053180",
              "COR4236202310131319153182",
              "COR4236202310131320203184",
              "COR4236202310131321283185",
              "COR4236202310131322183187",
              "COR4236202310131323243188",
              "COR4236202310131325233192",
              "COR4236202310131326113196",
              "COR4236202310131326583198",
              "COR4236202310131328073200",
              "COR4236202310131331033203",
              "COR4236202310131335123206",
              "COR4236202310131340003210",
              "COR4236202310131340463212",
              "COR4236202310131342313214",
              "COR4236202310131345293217",
              "COR4236202310131351543220",
              "COR4236202310131353313222",
              "COR4236202310131355073226",
              "COR4236202310131357053229",
              "COR4236202310131433123250",
              "COR4236202310131517313292",
              "COR4236202310131518413294",
              "COR4236202310131520553297",
              "COR4236202310131521433299",
              "COR4236202310131522523304",
              "COR4236202310131529033308",
              "COR4236202310131529583311",
              "COR4236202310131536393315",
              "COR4236202310140717303352",
              "COR4236202310140720093353",
              "COR4236202310140721083354",
              "COR4236202310140722093355",
              "COR4236202310140723363357",
              "COR4236202310140726553358",
              "COR4236202310140728083359",
              "COR4236202310140728593360",
              "COR4236202310140730003361",
              "COR4236202310140730413362",
              "COR4236202310140807533373",
              "COR4236202310140809033376",
              "COR4236202310140810003377",
              "COR4236202310151009214060",
              "COR4236202310151010104062",
              "COR4236202310151011004065",
              "COR4236202310151011524067",
              "COR4236202310151013594072",
              "COR4236202310151015214074",
              "COR4236202310151017134080",
              "COR4236202310151018234085",
              "COR4236202310151039104112",
              "COR4236202310151041024114",
              "COR4236202310151041554116",
              "COR4236202310151042464119",
              "COR4236202310151043554120",
              "COR4236202310151056304136",
              "COR4236202310151058274138",
              "COR4236202310151059394140",
              "COR4236202310151101134142",
              "COR4236202310151102374144"
            ]
          }
        }
      ]
    },
    "winningPlan" : {
      "stage" : "PROJECTION",
      "transformBy" : {
        "formFields.GesComplexComponent5.GesTileGroup1" : 1,
        "formType" : 1,
        "formFields.currentYear" : 1,
        "formFields.GesComplexComponent1.transferAccount" : 1,
        "formFields.startTime" : 1,
        "formFields.finishTime" : 1,
        "formFields.GesComplexComponent7.GesTileGroup1" : 1,
        "formFields.formInstanceNumber" : 1,
        "formFields.kozbeDescription" : 1,
        "formFields.operationIdFromBDB" : 1,
        "formFields.CorpoSegment" : 1,
        "formFields.transferTime" : 1,
        "formFields.GesComplexComponent1.beneficiaryName" : 1,
        "formFields.formProcessingStatus" : 1,
        "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
        "formFields.GesComplexComponent3.GesTextField1" : 1,
        "lastUpdateTime" : 1
      },
      "inputStage" : {
        "stage" : "FETCH",
        "filter" : {
          "$and" : [
            {
              "formType" : {
                "$eq" : "corpo_reset_balance"
              }
            },
            {
              "formFields.formInstanceNumber.value" : {
                "$in" : [
                  "COR4237202310131425401494",
                  "COR4237202310150947272272",
                  "COR4237202310150955452282",
                  "COR4237202310150956472284",
                  "COR4237202310151004272296",
                  "COR4237202310151005332297",
                  "COR4236202310131257073150",
                  "COR4236202310131301403155",
                  "COR4236202310131303093157",
                  "COR4236202310131304493160",
                  "COR4236202310131307543163",
                  "COR4236202310131309113164",
                  "COR4236202310131312063169",
                  "COR4236202310131313393173",
                  "COR4236202310131316003176",
                  "COR4236202310131317053180",
                  "COR4236202310131319153182",
                  "COR4236202310131320203184",
                  "COR4236202310131321283185",
                  "COR4236202310131322183187",
                  "COR4236202310131323243188",
                  "COR4236202310131325233192",
                  "COR4236202310131326113196",
                  "COR4236202310131326583198",
                  "COR4236202310131328073200",
                  "COR4236202310131331033203",
                  "COR4236202310131335123206",
                  "COR4236202310131340003210",
                  "COR4236202310131340463212",
                  "COR4236202310131342313214",
                  "COR4236202310131345293217",
                  "COR4236202310131351543220",
                  "COR4236202310131353313222",
                  "COR4236202310131355073226",
                  "COR4236202310131357053229",
                  "COR4236202310131433123250",
                  "COR4236202310131517313292",
                  "COR4236202310131518413294",
                  "COR4236202310131520553297",
                  "COR4236202310131521433299",
                  "COR4236202310131522523304",
                  "COR4236202310131529033308",
                  "COR4236202310131529583311",
                  "COR4236202310131536393315",
                  "COR4236202310140717303352",
                  "COR4236202310140720093353",
                  "COR4236202310140721083354",
                  "COR4236202310140722093355",
                  "COR4236202310140723363357",
                  "COR4236202310140726553358",
                  "COR4236202310140728083359",
                  "COR4236202310140728593360",
                  "COR4236202310140730003361",
                  "COR4236202310140730413362",
                  "COR4236202310140807533373",
                  "COR4236202310140809033376",
                  "COR4236202310140810003377",
                  "COR4236202310151009214060",
                  "COR4236202310151010104062",
                  "COR4236202310151011004065",
                  "COR4236202310151011524067",
                  "COR4236202310151013594072",
                  "COR4236202310151015214074",
                  "COR4236202310151017134080",
                  "COR4236202310151018234085",
                  "COR4236202310151039104112",
                  "COR4236202310151041024114",
                  "COR4236202310151041554116",
                  "COR4236202310151042464119",
                  "COR4236202310151043554120",
                  "COR4236202310151056304136",
                  "COR4236202310151058274138",
                  "COR4236202310151059394140",
                  "COR4236202310151101134142",
                  "COR4236202310151102374144"
                ]
              }
            }
          ]
        },
        "inputStage" : {
          "stage" : "IXSCAN",
          "keyPattern" : {
            "_id" : 1
          },
          "indexName" : "_id_",
          "isMultiKey" : false,
          "multiKeyPaths" : {
            "_id" : [ ]
          },
          "isUnique" : true,
          "isSparse" : false,
          "isPartial" : false,
          "indexVersion" : 2,
          "direction" : "backward",
          "indexBounds" : {
            "_id" : [
              "[MaxKey, MinKey]"
            ]
          }
        }
      }
    },
    "rejectedPlans" : [
      {
        "stage" : "PROJECTION",
        "transformBy" : {
          "formFields.GesComplexComponent5.GesTileGroup1" : 1,
          "formType" : 1,
          "formFields.currentYear" : 1,
          "formFields.GesComplexComponent1.transferAccount" : 1,
          "formFields.startTime" : 1,
          "formFields.finishTime" : 1,
          "formFields.GesComplexComponent7.GesTileGroup1" : 1,
          "formFields.formInstanceNumber" : 1,
          "formFields.kozbeDescription" : 1,
          "formFields.operationIdFromBDB" : 1,
          "formFields.CorpoSegment" : 1,
          "formFields.transferTime" : 1,
          "formFields.GesComplexComponent1.beneficiaryName" : 1,
          "formFields.formProcessingStatus" : 1,
          "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
          "formFields.GesComplexComponent3.GesTextField1" : 1,
          "lastUpdateTime" : 1
        },
        "inputStage" : {
          "stage" : "SORT",
          "sortPattern" : {
            "_id" : -1
          },
          "inputStage" : {
            "stage" : "SORT_KEY_GENERATOR",
            "inputStage" : {
              "stage" : "FETCH",
              "filter" : {
                "formType" : {
                  "$eq" : "corpo_reset_balance"
                }
              },
              "inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                  "formFields.formInstanceNumber.value" : 1
                },
                "indexName" : "formFields.formInstanceNumber.value_1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                  "formFields.formInstanceNumber.value" : [ ]
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                  "formFields.formInstanceNumber.value" : [
                    "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                    "[\"COR4237202310150947272272\", \"COR4237202310150947272272\"]",
                    "[\"COR4237202310150955452282\", \"COR4237202310150955452282\"]",
                    "[\"COR4237202310150956472284\", \"COR4237202310150956472284\"]",
                    "[\"COR4237202310151004272296\", \"COR4237202310151004272296\"]",
                    "[\"COR4237202310151005332297\", \"COR4237202310151005332297\"]",
                    "[\"COR4236202310131257073150\", \"COR4236202310131257073150\"]",
                    "[\"COR4236202310131301403155\", \"COR4236202310131301403155\"]",
                    "[\"COR4236202310131303093157\", \"COR4236202310131303093157\"]",
                    "[\"COR4236202310131304493160\", \"COR4236202310131304493160\"]",
                    "[\"COR4236202310131307543163\", \"COR4236202310131307543163\"]",
                    "[\"COR4236202310131309113164\", \"COR4236202310131309113164\"]",
                    "[\"COR4236202310131312063169\", \"COR4236202310131312063169\"]",
                    "[\"COR4236202310131313393173\", \"COR4236202310131313393173\"]",
                    "[\"COR4236202310131316003176\", \"COR4236202310131316003176\"]",
                    "[\"COR4236202310131317053180\", \"COR4236202310131317053180\"]",
                    "[\"COR4236202310131319153182\", \"COR4236202310131319153182\"]",
                    "[\"COR4236202310131320203184\", \"COR4236202310131320203184\"]",
                    "[\"COR4236202310131321283185\", \"COR4236202310131321283185\"]",
                    "[\"COR4236202310131322183187\", \"COR4236202310131322183187\"]",
                    "[\"COR4236202310131323243188\", \"COR4236202310131323243188\"]",
                    "[\"COR4236202310131325233192\", \"COR4236202310131325233192\"]",
                    "[\"COR4236202310131326113196\", \"COR4236202310131326113196\"]",
                    "[\"COR4236202310131326583198\", \"COR4236202310131326583198\"]",
                    "[\"COR4236202310131328073200\", \"COR4236202310131328073200\"]",
                    "[\"COR4236202310131331033203\", \"COR4236202310131331033203\"]",
                    "[\"COR4236202310131335123206\", \"COR4236202310131335123206\"]",
                    "[\"COR4236202310131340003210\", \"COR4236202310131340003210\"]",
                    "[\"COR4236202310131340463212\", \"COR4236202310131340463212\"]",
                    "[\"COR4236202310131342313214\", \"COR4236202310131342313214\"]",
                    "[\"COR4236202310131345293217\", \"COR4236202310131345293217\"]",
                    "[\"COR4236202310131351543220\", \"COR4236202310131351543220\"]",
                    "[\"COR4236202310131353313222\", \"COR4236202310131353313222\"]",
                    "[\"COR4236202310131355073226\", \"COR4236202310131355073226\"]",
                    "[\"COR4236202310131357053229\", \"COR4236202310131357053229\"]",
                    "[\"COR4236202310131433123250\", \"COR4236202310131433123250\"]",
                    "[\"COR4236202310131517313292\", \"COR4236202310131517313292\"]",
                    "[\"COR4236202310131518413294\", \"COR4236202310131518413294\"]",
                    "[\"COR4236202310131520553297\", \"COR4236202310131520553297\"]",
                    "[\"COR4236202310131521433299\", \"COR4236202310131521433299\"]",
                    "[\"COR4236202310131522523304\", \"COR4236202310131522523304\"]",
                    "[\"COR4236202310131529033308\", \"COR4236202310131529033308\"]",
                    "[\"COR4236202310131529583311\", \"COR4236202310131529583311\"]",
                    "[\"COR4236202310131536393315\", \"COR4236202310131536393315\"]",
                    "[\"COR4236202310140717303352\", \"COR4236202310140717303352\"]",
                    "[\"COR4236202310140720093353\", \"COR4236202310140720093353\"]",
                    "[\"COR4236202310140721083354\", \"COR4236202310140721083354\"]",
                    "[\"COR4236202310140722093355\", \"COR4236202310140722093355\"]",
                    "[\"COR4236202310140723363357\", \"COR4236202310140723363357\"]",
                    "[\"COR4236202310140726553358\", \"COR4236202310140726553358\"]",
                    "[\"COR4236202310140728083359\", \"COR4236202310140728083359\"]",
                    "[\"COR4236202310140728593360\", \"COR4236202310140728593360\"]",
                    "[\"COR4236202310140730003361\", \"COR4236202310140730003361\"]",
                    "[\"COR4236202310140730413362\", \"COR4236202310140730413362\"]",
                    "[\"COR4236202310140807533373\", \"COR4236202310140807533373\"]",
                    "[\"COR4236202310140809033376\", \"COR4236202310140809033376\"]",
                    "[\"COR4236202310140810003377\", \"COR4236202310140810003377\"]",
                    "[\"COR4236202310151009214060\", \"COR4236202310151009214060\"]",
                    "[\"COR4236202310151010104062\", \"COR4236202310151010104062\"]",
                    "[\"COR4236202310151011004065\", \"COR4236202310151011004065\"]",
                    "[\"COR4236202310151011524067\", \"COR4236202310151011524067\"]",
                    "[\"COR4236202310151013594072\", \"COR4236202310151013594072\"]",
                    "[\"COR4236202310151015214074\", \"COR4236202310151015214074\"]",
                    "[\"COR4236202310151017134080\", \"COR4236202310151017134080\"]",
                    "[\"COR4236202310151018234085\", \"COR4236202310151018234085\"]",
                    "[\"COR4236202310151039104112\", \"COR4236202310151039104112\"]",
                    "[\"COR4236202310151041024114\", \"COR4236202310151041024114\"]",
                    "[\"COR4236202310151041554116\", \"COR4236202310151041554116\"]",
                    "[\"COR4236202310151042464119\", \"COR4236202310151042464119\"]",
                    "[\"COR4236202310151043554120\", \"COR4236202310151043554120\"]",
                    "[\"COR4236202310151056304136\", \"COR4236202310151056304136\"]",
                    "[\"COR4236202310151058274138\", \"COR4236202310151058274138\"]",
                    "[\"COR4236202310151059394140\", \"COR4236202310151059394140\"]",
                    "[\"COR4236202310151101134142\", \"COR4236202310151101134142\"]",
                    "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                  ]
                }
              }
            }
          }
        }
      },
      {
        "stage" : "PROJECTION",
        "transformBy" : {
          "formFields.GesComplexComponent5.GesTileGroup1" : 1,
          "formType" : 1,
          "formFields.currentYear" : 1,
          "formFields.GesComplexComponent1.transferAccount" : 1,
          "formFields.startTime" : 1,
          "formFields.finishTime" : 1,
          "formFields.GesComplexComponent7.GesTileGroup1" : 1,
          "formFields.formInstanceNumber" : 1,
          "formFields.kozbeDescription" : 1,
          "formFields.operationIdFromBDB" : 1,
          "formFields.CorpoSegment" : 1,
          "formFields.transferTime" : 1,
          "formFields.GesComplexComponent1.beneficiaryName" : 1,
          "formFields.formProcessingStatus" : 1,
          "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
          "formFields.GesComplexComponent3.GesTextField1" : 1,
          "lastUpdateTime" : 1
        },
        "inputStage" : {
          "stage" : "SORT",
          "sortPattern" : {
            "_id" : -1
          },
          "inputStage" : {
            "stage" : "SORT_KEY_GENERATOR",
            "inputStage" : {
              "stage" : "FETCH",
              "filter" : {
                "formFields.formInstanceNumber.value" : {
                  "$in" : [
                    "COR4237202310131425401494",
                    "COR4237202310150947272272",
                    "COR4237202310150955452282",
                    "COR4237202310150956472284",
                    "COR4237202310151004272296",
                    "COR4237202310151005332297",
                    "COR4236202310131257073150",
                    "COR4236202310131301403155",
                    "COR4236202310131303093157",
                    "COR4236202310131304493160",
                    "COR4236202310131307543163",
                    "COR4236202310131309113164",
                    "COR4236202310131312063169",
                    "COR4236202310131313393173",
                    "COR4236202310131316003176",
                    "COR4236202310131317053180",
                    "COR4236202310131319153182",
                    "COR4236202310131320203184",
                    "COR4236202310131321283185",
                    "COR4236202310131322183187",
                    "COR4236202310131323243188",
                    "COR4236202310131325233192",
                    "COR4236202310131326113196",
                    "COR4236202310131326583198",
                    "COR4236202310131328073200",
                    "COR4236202310131331033203",
                    "COR4236202310131335123206",
                    "COR4236202310131340003210",
                    "COR4236202310131340463212",
                    "COR4236202310131342313214",
                    "COR4236202310131345293217",
                    "COR4236202310131351543220",
                    "COR4236202310131353313222",
                    "COR4236202310131355073226",
                    "COR4236202310131357053229",
                    "COR4236202310131433123250",
                    "COR4236202310131517313292",
                    "COR4236202310131518413294",
                    "COR4236202310131520553297",
                    "COR4236202310131521433299",
                    "COR4236202310131522523304",
                    "COR4236202310131529033308",
                    "COR4236202310131529583311",
                    "COR4236202310131536393315",
                    "COR4236202310140717303352",
                    "COR4236202310140720093353",
                    "COR4236202310140721083354",
                    "COR4236202310140722093355",
                    "COR4236202310140723363357",
                    "COR4236202310140726553358",
                    "COR4236202310140728083359",
                    "COR4236202310140728593360",
                    "COR4236202310140730003361",
                    "COR4236202310140730413362",
                    "COR4236202310140807533373",
                    "COR4236202310140809033376",
                    "COR4236202310140810003377",
                    "COR4236202310151009214060",
                    "COR4236202310151010104062",
                    "COR4236202310151011004065",
                    "COR4236202310151011524067",
                    "COR4236202310151013594072",
                    "COR4236202310151015214074",
                    "COR4236202310151017134080",
                    "COR4236202310151018234085",
                    "COR4236202310151039104112",
                    "COR4236202310151041024114",
                    "COR4236202310151041554116",
                    "COR4236202310151042464119",
                    "COR4236202310151043554120",
                    "COR4236202310151056304136",
                    "COR4236202310151058274138",
                    "COR4236202310151059394140",
                    "COR4236202310151101134142",
                    "COR4236202310151102374144"
                  ]
                }
              },
              "inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                  "formType" : 1
                },
                "indexName" : "formType_1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                  "formType" : [ ]
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                  "formType" : [
                    "[\"corpo_reset_balance\", \"corpo_reset_balance\"]"
                  ]
                }
              }
            }
          }
        }
      }
    ]
  },
  "executionStats" : {
    "executionSuccess" : true,
    "nReturned" : 75,
    "executionTimeMillis" : 11651,
    "totalKeysExamined" : 254851,
    "totalDocsExamined" : 254851,
    "executionStages" : {
      "stage" : "PROJECTION",
      "nReturned" : 75,
      "executionTimeMillisEstimate" : 10335,
      "works" : 254852,
      "advanced" : 75,
      "needTime" : 254776,
      "needYield" : 0,
      "saveState" : 2212,
      "restoreState" : 2212,
      "isEOF" : 1,
      "invalidates" : 0,
      "transformBy" : {
        "formFields.GesComplexComponent5.GesTileGroup1" : 1,
        "formType" : 1,
        "formFields.currentYear" : 1,
        "formFields.GesComplexComponent1.transferAccount" : 1,
        "formFields.startTime" : 1,
        "formFields.finishTime" : 1,
        "formFields.GesComplexComponent7.GesTileGroup1" : 1,
        "formFields.formInstanceNumber" : 1,
        "formFields.kozbeDescription" : 1,
        "formFields.operationIdFromBDB" : 1,
        "formFields.CorpoSegment" : 1,
        "formFields.transferTime" : 1,
        "formFields.GesComplexComponent1.beneficiaryName" : 1,
        "formFields.formProcessingStatus" : 1,
        "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
        "formFields.GesComplexComponent3.GesTextField1" : 1,
        "lastUpdateTime" : 1
      },
      "inputStage" : {
        "stage" : "FETCH",
        "filter" : {
          "$and" : [
            {
              "formType" : {
                "$eq" : "corpo_reset_balance"
              }
            },
            {
              "formFields.formInstanceNumber.value" : {
                "$in" : [
                  "COR4237202310131425401494",
                  "COR4237202310150947272272",
                  "COR4237202310150955452282",
                  "COR4237202310150956472284",
                  "COR4237202310151004272296",
                  "COR4237202310151005332297",
                  "COR4236202310131257073150",
                  "COR4236202310131301403155",
                  "COR4236202310131303093157",
                  "COR4236202310131304493160",
                  "COR4236202310131307543163",
                  "COR4236202310131309113164",
                  "COR4236202310131312063169",
                  "COR4236202310131313393173",
                  "COR4236202310131316003176",
                  "COR4236202310131317053180",
                  "COR4236202310131319153182",
                  "COR4236202310131320203184",
                  "COR4236202310131321283185",
                  "COR4236202310131322183187",
                  "COR4236202310131323243188",
                  "COR4236202310131325233192",
                  "COR4236202310131326113196",
                  "COR4236202310131326583198",
                  "COR4236202310131328073200",
                  "COR4236202310131331033203",
                  "COR4236202310131335123206",
                  "COR4236202310131340003210",
                  "COR4236202310131340463212",
                  "COR4236202310131342313214",
                  "COR4236202310131345293217",
                  "COR4236202310131351543220",
                  "COR4236202310131353313222",
                  "COR4236202310131355073226",
                  "COR4236202310131357053229",
                  "COR4236202310131433123250",
                  "COR4236202310131517313292",
                  "COR4236202310131518413294",
                  "COR4236202310131520553297",
                  "COR4236202310131521433299",
                  "COR4236202310131522523304",
                  "COR4236202310131529033308",
                  "COR4236202310131529583311",
                  "COR4236202310131536393315",
                  "COR4236202310140717303352",
                  "COR4236202310140720093353",
                  "COR4236202310140721083354",
                  "COR4236202310140722093355",
                  "COR4236202310140723363357",
                  "COR4236202310140726553358",
                  "COR4236202310140728083359",
                  "COR4236202310140728593360",
                  "COR4236202310140730003361",
                  "COR4236202310140730413362",
                  "COR4236202310140807533373",
                  "COR4236202310140809033376",
                  "COR4236202310140810003377",
                  "COR4236202310151009214060",
                  "COR4236202310151010104062",
                  "COR4236202310151011004065",
                  "COR4236202310151011524067",
                  "COR4236202310151013594072",
                  "COR4236202310151015214074",
                  "COR4236202310151017134080",
                  "COR4236202310151018234085",
                  "COR4236202310151039104112",
                  "COR4236202310151041024114",
                  "COR4236202310151041554116",
                  "COR4236202310151042464119",
                  "COR4236202310151043554120",
                  "COR4236202310151056304136",
                  "COR4236202310151058274138",
                  "COR4236202310151059394140",
                  "COR4236202310151101134142",
                  "COR4236202310151102374144"
                ]
              }
            }
          ]
        },
        "nReturned" : 75,
        "executionTimeMillisEstimate" : 10325,
        "works" : 254852,
        "advanced" : 75,
        "needTime" : 254776,
        "needYield" : 0,
        "saveState" : 2212,
        "restoreState" : 2212,
        "isEOF" : 1,
        "invalidates" : 0,
        "docsExamined" : 254851,
        "alreadyHasObj" : 0,
        "inputStage" : {
          "stage" : "IXSCAN",
          "nReturned" : 254851,
          "executionTimeMillisEstimate" : 120,
          "works" : 254852,
          "advanced" : 254851,
          "needTime" : 0,
          "needYield" : 0,
          "saveState" : 2212,
          "restoreState" : 2212,
          "isEOF" : 1,
          "invalidates" : 0,
          "keyPattern" : {
            "_id" : 1
          },
          "indexName" : "_id_",
          "isMultiKey" : false,
          "multiKeyPaths" : {
            "_id" : [ ]
          },
          "isUnique" : true,
          "isSparse" : false,
          "isPartial" : false,
          "indexVersion" : 2,
          "direction" : "backward",
          "indexBounds" : {
            "_id" : [
              "[MaxKey, MinKey]"
            ]
          },
          "keysExamined" : 254851,
          "seeks" : 1,
          "dupsTested" : 0,
          "dupsDropped" : 0,
          "seenInvalidated" : 0
        }
      }
    },
    "allPlansExecution" : [
      {
        "nReturned" : 75,
        "executionTimeMillisEstimate" : 3640,
        "totalKeysExamined" : 76455,
        "totalDocsExamined" : 76455,
        "executionStages" : {
          "stage" : "PROJECTION",
          "nReturned" : 75,
          "executionTimeMillisEstimate" : 3640,
          "works" : 76455,
          "advanced" : 75,
          "needTime" : 76380,
          "needYield" : 0,
          "saveState" : 817,
          "restoreState" : 817,
          "isEOF" : 0,
          "invalidates" : 0,
          "transformBy" : {
            "formFields.GesComplexComponent5.GesTileGroup1" : 1,
            "formType" : 1,
            "formFields.currentYear" : 1,
            "formFields.GesComplexComponent1.transferAccount" : 1,
            "formFields.startTime" : 1,
            "formFields.finishTime" : 1,
            "formFields.GesComplexComponent7.GesTileGroup1" : 1,
            "formFields.formInstanceNumber" : 1,
            "formFields.kozbeDescription" : 1,
            "formFields.operationIdFromBDB" : 1,
            "formFields.CorpoSegment" : 1,
            "formFields.transferTime" : 1,
            "formFields.GesComplexComponent1.beneficiaryName" : 1,
            "formFields.formProcessingStatus" : 1,
            "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
            "formFields.GesComplexComponent3.GesTextField1" : 1,
            "lastUpdateTime" : 1
          },
          "inputStage" : {
            "stage" : "FETCH",
            "filter" : {
              "$and" : [
                {
                  "formType" : {
                    "$eq" : "corpo_reset_balance"
                  }
                },
                {
                  "formFields.formInstanceNumber.value" : {
                    "$in" : [
                      "COR4237202310131425401494",
                      "COR4237202310150947272272",
                      "COR4237202310150955452282",
                      "COR4237202310150956472284",
                      "COR4237202310151004272296",
                      "COR4237202310151005332297",
                      "COR4236202310131257073150",
                      "COR4236202310131301403155",
                      "COR4236202310131303093157",
                      "COR4236202310131304493160",
                      "COR4236202310131307543163",
                      "COR4236202310131309113164",
                      "COR4236202310131312063169",
                      "COR4236202310131313393173",
                      "COR4236202310131316003176",
                      "COR4236202310131317053180",
                      "COR4236202310131319153182",
                      "COR4236202310131320203184",
                      "COR4236202310131321283185",
                      "COR4236202310131322183187",
                      "COR4236202310131323243188",
                      "COR4236202310131325233192",
                      "COR4236202310131326113196",
                      "COR4236202310131326583198",
                      "COR4236202310131328073200",
                      "COR4236202310131331033203",
                      "COR4236202310131335123206",
                      "COR4236202310131340003210",
                      "COR4236202310131340463212",
                      "COR4236202310131342313214",
                      "COR4236202310131345293217",
                      "COR4236202310131351543220",
                      "COR4236202310131353313222",
                      "COR4236202310131355073226",
                      "COR4236202310131357053229",
                      "COR4236202310131433123250",
                      "COR4236202310131517313292",
                      "COR4236202310131518413294",
                      "COR4236202310131520553297",
                      "COR4236202310131521433299",
                      "COR4236202310131522523304",
                      "COR4236202310131529033308",
                      "COR4236202310131529583311",
                      "COR4236202310131536393315",
                      "COR4236202310140717303352",
                      "COR4236202310140720093353",
                      "COR4236202310140721083354",
                      "COR4236202310140722093355",
                      "COR4236202310140723363357",
                      "COR4236202310140726553358",
                      "COR4236202310140728083359",
                      "COR4236202310140728593360",
                      "COR4236202310140730003361",
                      "COR4236202310140730413362",
                      "COR4236202310140807533373",
                      "COR4236202310140809033376",
                      "COR4236202310140810003377",
                      "COR4236202310151009214060",
                      "COR4236202310151010104062",
                      "COR4236202310151011004065",
                      "COR4236202310151011524067",
                      "COR4236202310151013594072",
                      "COR4236202310151015214074",
                      "COR4236202310151017134080",
                      "COR4236202310151018234085",
                      "COR4236202310151039104112",
                      "COR4236202310151041024114",
                      "COR4236202310151041554116",
                      "COR4236202310151042464119",
                      "COR4236202310151043554120",
                      "COR4236202310151056304136",
                      "COR4236202310151058274138",
                      "COR4236202310151059394140",
                      "COR4236202310151101134142",
                      "COR4236202310151102374144"
                    ]
                  }
                }
              ]
            },
            "nReturned" : 75,
            "executionTimeMillisEstimate" : 3640,
            "works" : 76455,
            "advanced" : 75,
            "needTime" : 76380,
            "needYield" : 0,
            "saveState" : 817,
            "restoreState" : 817,
            "isEOF" : 0,
            "invalidates" : 0,
            "docsExamined" : 76455,
            "alreadyHasObj" : 0,
            "inputStage" : {
              "stage" : "IXSCAN",
              "nReturned" : 76455,
              "executionTimeMillisEstimate" : 40,
              "works" : 76455,
              "advanced" : 76455,
              "needTime" : 0,
              "needYield" : 0,
              "saveState" : 817,
              "restoreState" : 817,
              "isEOF" : 0,
              "invalidates" : 0,
              "keyPattern" : {
                "_id" : 1
              },
              "indexName" : "_id_",
              "isMultiKey" : false,
              "multiKeyPaths" : {
                "_id" : [ ]
              },
              "isUnique" : true,
              "isSparse" : false,
              "isPartial" : false,
              "indexVersion" : 2,
              "direction" : "backward",
              "indexBounds" : {
                "_id" : [
                  "[MaxKey, MinKey]"
                ]
              },
              "keysExamined" : 76455,
              "seeks" : 1,
              "dupsTested" : 0,
              "dupsDropped" : 0,
              "seenInvalidated" : 0
            }
          }
        }
      },
      {
        "nReturned" : 0,
        "executionTimeMillisEstimate" : 30,
        "totalKeysExamined" : 135,
        "totalDocsExamined" : 75,
        "executionStages" : {
          "stage" : "PROJECTION",
          "nReturned" : 0,
          "executionTimeMillisEstimate" : 30,
          "works" : 137,
          "advanced" : 0,
          "needTime" : 136,
          "needYield" : 0,
          "saveState" : 2212,
          "restoreState" : 2212,
          "isEOF" : 0,
          "invalidates" : 0,
          "transformBy" : {
            "formFields.GesComplexComponent5.GesTileGroup1" : 1,
            "formType" : 1,
            "formFields.currentYear" : 1,
            "formFields.GesComplexComponent1.transferAccount" : 1,
            "formFields.startTime" : 1,
            "formFields.finishTime" : 1,
            "formFields.GesComplexComponent7.GesTileGroup1" : 1,
            "formFields.formInstanceNumber" : 1,
            "formFields.kozbeDescription" : 1,
            "formFields.operationIdFromBDB" : 1,
            "formFields.CorpoSegment" : 1,
            "formFields.transferTime" : 1,
            "formFields.GesComplexComponent1.beneficiaryName" : 1,
            "formFields.formProcessingStatus" : 1,
            "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
            "formFields.GesComplexComponent3.GesTextField1" : 1,
            "lastUpdateTime" : 1
          },
          "inputStage" : {
            "stage" : "SORT",
            "nReturned" : 0,
            "executionTimeMillisEstimate" : 30,
            "works" : 137,
            "advanced" : 0,
            "needTime" : 136,
            "needYield" : 0,
            "saveState" : 2212,
            "restoreState" : 2212,
            "isEOF" : 0,
            "invalidates" : 0,
            "sortPattern" : {
              "_id" : -1
            },
            "memUsage" : 33914115,
            "memLimit" : 33554432,
            "inputStage" : {
              "stage" : "SORT_KEY_GENERATOR",
              "nReturned" : 75,
              "executionTimeMillisEstimate" : 20,
              "works" : 136,
              "advanced" : 75,
              "needTime" : 61,
              "needYield" : 0,
              "saveState" : 2212,
              "restoreState" : 2212,
              "isEOF" : 0,
              "invalidates" : 0,
              "inputStage" : {
                "stage" : "FETCH",
                "filter" : {
                  "formType" : {
                    "$eq" : "corpo_reset_balance"
                  }
                },
                "nReturned" : 75,
                "executionTimeMillisEstimate" : 20,
                "works" : 135,
                "advanced" : 75,
                "needTime" : 60,
                "needYield" : 0,
                "saveState" : 2212,
                "restoreState" : 2212,
                "isEOF" : 0,
                "invalidates" : 0,
                "docsExamined" : 75,
                "alreadyHasObj" : 0,
                "inputStage" : {
                  "stage" : "IXSCAN",
                  "nReturned" : 75,
                  "executionTimeMillisEstimate" : 0,
                  "works" : 135,
                  "advanced" : 75,
                  "needTime" : 60,
                  "needYield" : 0,
                  "saveState" : 2212,
                  "restoreState" : 2212,
                  "isEOF" : 0,
                  "invalidates" : 0,
                  "keyPattern" : {
                    "formFields.formInstanceNumber.value" : 1
                  },
                  "indexName" : "formFields.formInstanceNumber.value_1",
                  "isMultiKey" : false,
                  "multiKeyPaths" : {
                    "formFields.formInstanceNumber.value" : [ ]
                  },
                  "isUnique" : false,
                  "isSparse" : false,
                  "isPartial" : false,
                  "indexVersion" : 2,
                  "direction" : "forward",
                  "indexBounds" : {
                    "formFields.formInstanceNumber.value" : [
                      "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                      "[\"COR4237202310150947272272\", \"COR4237202310150947272272\"]",
                      "[\"COR4237202310150955452282\", \"COR4237202310150955452282\"]",
                      "[\"COR4237202310150956472284\", \"COR4237202310150956472284\"]",
                      "[\"COR4237202310151004272296\", \"COR4237202310151004272296\"]",
                      "[\"COR4237202310151005332297\", \"COR4237202310151005332297\"]",
                      "[\"COR4236202310131257073150\", \"COR4236202310131257073150\"]",
                      "[\"COR4236202310131301403155\", \"COR4236202310131301403155\"]",
                      "[\"COR4236202310131303093157\", \"COR4236202310131303093157\"]",
                      "[\"COR4236202310131304493160\", \"COR4236202310131304493160\"]",
                      "[\"COR4236202310131307543163\", \"COR4236202310131307543163\"]",
                      "[\"COR4236202310131309113164\", \"COR4236202310131309113164\"]",
                      "[\"COR4236202310131312063169\", \"COR4236202310131312063169\"]",
                      "[\"COR4236202310131313393173\", \"COR4236202310131313393173\"]",
                      "[\"COR4236202310131316003176\", \"COR4236202310131316003176\"]",
                      "[\"COR4236202310131317053180\", \"COR4236202310131317053180\"]",
                      "[\"COR4236202310131319153182\", \"COR4236202310131319153182\"]",
                      "[\"COR4236202310131320203184\", \"COR4236202310131320203184\"]",
                      "[\"COR4236202310131321283185\", \"COR4236202310131321283185\"]",
                      "[\"COR4236202310131322183187\", \"COR4236202310131322183187\"]",
                      "[\"COR4236202310131323243188\", \"COR4236202310131323243188\"]",
                      "[\"COR4236202310131325233192\", \"COR4236202310131325233192\"]",
                      "[\"COR4236202310131326113196\", \"COR4236202310131326113196\"]",
                      "[\"COR4236202310131326583198\", \"COR4236202310131326583198\"]",
                      "[\"COR4236202310131328073200\", \"COR4236202310131328073200\"]",
                      "[\"COR4236202310131331033203\", \"COR4236202310131331033203\"]",
                      "[\"COR4236202310131335123206\", \"COR4236202310131335123206\"]",
                      "[\"COR4236202310131340003210\", \"COR4236202310131340003210\"]",
                      "[\"COR4236202310131340463212\", \"COR4236202310131340463212\"]",
                      "[\"COR4236202310131342313214\", \"COR4236202310131342313214\"]",
                      "[\"COR4236202310131345293217\", \"COR4236202310131345293217\"]",
                      "[\"COR4236202310131351543220\", \"COR4236202310131351543220\"]",
                      "[\"COR4236202310131353313222\", \"COR4236202310131353313222\"]",
                      "[\"COR4236202310131355073226\", \"COR4236202310131355073226\"]",
                      "[\"COR4236202310131357053229\", \"COR4236202310131357053229\"]",
                      "[\"COR4236202310131433123250\", \"COR4236202310131433123250\"]",
                      "[\"COR4236202310131517313292\", \"COR4236202310131517313292\"]",
                      "[\"COR4236202310131518413294\", \"COR4236202310131518413294\"]",
                      "[\"COR4236202310131520553297\", \"COR4236202310131520553297\"]",
                      "[\"COR4236202310131521433299\", \"COR4236202310131521433299\"]",
                      "[\"COR4236202310131522523304\", \"COR4236202310131522523304\"]",
                      "[\"COR4236202310131529033308\", \"COR4236202310131529033308\"]",
                      "[\"COR4236202310131529583311\", \"COR4236202310131529583311\"]",
                      "[\"COR4236202310131536393315\", \"COR4236202310131536393315\"]",
                      "[\"COR4236202310140717303352\", \"COR4236202310140717303352\"]",
                      "[\"COR4236202310140720093353\", \"COR4236202310140720093353\"]",
                      "[\"COR4236202310140721083354\", \"COR4236202310140721083354\"]",
                      "[\"COR4236202310140722093355\", \"COR4236202310140722093355\"]",
                      "[\"COR4236202310140723363357\", \"COR4236202310140723363357\"]",
                      "[\"COR4236202310140726553358\", \"COR4236202310140726553358\"]",
                      "[\"COR4236202310140728083359\", \"COR4236202310140728083359\"]",
                      "[\"COR4236202310140728593360\", \"COR4236202310140728593360\"]",
                      "[\"COR4236202310140730003361\", \"COR4236202310140730003361\"]",
                      "[\"COR4236202310140730413362\", \"COR4236202310140730413362\"]",
                      "[\"COR4236202310140807533373\", \"COR4236202310140807533373\"]",
                      "[\"COR4236202310140809033376\", \"COR4236202310140809033376\"]",
                      "[\"COR4236202310140810003377\", \"COR4236202310140810003377\"]",
                      "[\"COR4236202310151009214060\", \"COR4236202310151009214060\"]",
                      "[\"COR4236202310151010104062\", \"COR4236202310151010104062\"]",
                      "[\"COR4236202310151011004065\", \"COR4236202310151011004065\"]",
                      "[\"COR4236202310151011524067\", \"COR4236202310151011524067\"]",
                      "[\"COR4236202310151013594072\", \"COR4236202310151013594072\"]",
                      "[\"COR4236202310151015214074\", \"COR4236202310151015214074\"]",
                      "[\"COR4236202310151017134080\", \"COR4236202310151017134080\"]",
                      "[\"COR4236202310151018234085\", \"COR4236202310151018234085\"]",
                      "[\"COR4236202310151039104112\", \"COR4236202310151039104112\"]",
                      "[\"COR4236202310151041024114\", \"COR4236202310151041024114\"]",
                      "[\"COR4236202310151041554116\", \"COR4236202310151041554116\"]",
                      "[\"COR4236202310151042464119\", \"COR4236202310151042464119\"]",
                      "[\"COR4236202310151043554120\", \"COR4236202310151043554120\"]",
                      "[\"COR4236202310151056304136\", \"COR4236202310151056304136\"]",
                      "[\"COR4236202310151058274138\", \"COR4236202310151058274138\"]",
                      "[\"COR4236202310151059394140\", \"COR4236202310151059394140\"]",
                      "[\"COR4236202310151101134142\", \"COR4236202310151101134142\"]",
                      "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                    ]
                  },
                  "keysExamined" : 135,
                  "seeks" : 61,
                  "dupsTested" : 0,
                  "dupsDropped" : 0,
                  "seenInvalidated" : 0
                }
              }
            }
          }
        }
      },
      {
        "nReturned" : 0,
        "executionTimeMillisEstimate" : 1200,
        "totalKeysExamined" : 27870,
        "totalDocsExamined" : 27870,
        "executionStages" : {
          "stage" : "PROJECTION",
          "nReturned" : 0,
          "executionTimeMillisEstimate" : 1200,
          "works" : 27872,
          "advanced" : 0,
          "needTime" : 27871,
          "needYield" : 0,
          "saveState" : 2212,
          "restoreState" : 2212,
          "isEOF" : 0,
          "invalidates" : 0,
          "transformBy" : {
            "formFields.GesComplexComponent5.GesTileGroup1" : 1,
            "formType" : 1,
            "formFields.currentYear" : 1,
            "formFields.GesComplexComponent1.transferAccount" : 1,
            "formFields.startTime" : 1,
            "formFields.finishTime" : 1,
            "formFields.GesComplexComponent7.GesTileGroup1" : 1,
            "formFields.formInstanceNumber" : 1,
            "formFields.kozbeDescription" : 1,
            "formFields.operationIdFromBDB" : 1,
            "formFields.CorpoSegment" : 1,
            "formFields.transferTime" : 1,
            "formFields.GesComplexComponent1.beneficiaryName" : 1,
            "formFields.formProcessingStatus" : 1,
            "formFields.GesComplexComponent2.GesFrontendComponent2" : 1,
            "formFields.GesComplexComponent3.GesTextField1" : 1,
            "lastUpdateTime" : 1
          },
          "inputStage" : {
            "stage" : "SORT",
            "nReturned" : 0,
            "executionTimeMillisEstimate" : 1200,
            "works" : 27872,
            "advanced" : 0,
            "needTime" : 27871,
            "needYield" : 0,
            "saveState" : 2212,
            "restoreState" : 2212,
            "isEOF" : 0,
            "invalidates" : 0,
            "sortPattern" : {
              "_id" : -1
            },
            "memUsage" : 33914115,
            "memLimit" : 33554432,
            "inputStage" : {
              "stage" : "SORT_KEY_GENERATOR",
              "nReturned" : 75,
              "executionTimeMillisEstimate" : 1190,
              "works" : 27871,
              "advanced" : 75,
              "needTime" : 27796,
              "needYield" : 0,
              "saveState" : 2212,
              "restoreState" : 2212,
              "isEOF" : 0,
              "invalidates" : 0,
              "inputStage" : {
                "stage" : "FETCH",
                "filter" : {
                  "formFields.formInstanceNumber.value" : {
                    "$in" : [
                      "COR4237202310131425401494",
                      "COR4237202310150947272272",
                      "COR4237202310150955452282",
                      "COR4237202310150956472284",
                      "COR4237202310151004272296",
                      "COR4237202310151005332297",
                      "COR4236202310131257073150",
                      "COR4236202310131301403155",
                      "COR4236202310131303093157",
                      "COR4236202310131304493160",
                      "COR4236202310131307543163",
                      "COR4236202310131309113164",
                      "COR4236202310131312063169",
                      "COR4236202310131313393173",
                      "COR4236202310131316003176",
                      "COR4236202310131317053180",
                      "COR4236202310131319153182",
                      "COR4236202310131320203184",
                      "COR4236202310131321283185",
                      "COR4236202310131322183187",
                      "COR4236202310131323243188",
                      "COR4236202310131325233192",
                      "COR4236202310131326113196",
                      "COR4236202310131326583198",
                      "COR4236202310131328073200",
                      "COR4236202310131331033203",
                      "COR4236202310131335123206",
                      "COR4236202310131340003210",
                      "COR4236202310131340463212",
                      "COR4236202310131342313214",
                      "COR4236202310131345293217",
                      "COR4236202310131351543220",
                      "COR4236202310131353313222",
                      "COR4236202310131355073226",
                      "COR4236202310131357053229",
                      "COR4236202310131433123250",
                      "COR4236202310131517313292",
                      "COR4236202310131518413294",
                      "COR4236202310131520553297",
                      "COR4236202310131521433299",
                      "COR4236202310131522523304",
                      "COR4236202310131529033308",
                      "COR4236202310131529583311",
                      "COR4236202310131536393315",
                      "COR4236202310140717303352",
                      "COR4236202310140720093353",
                      "COR4236202310140721083354",
                      "COR4236202310140722093355",
                      "COR4236202310140723363357",
                      "COR4236202310140726553358",
                      "COR4236202310140728083359",
                      "COR4236202310140728593360",
                      "COR4236202310140730003361",
                      "COR4236202310140730413362",
                      "COR4236202310140807533373",
                      "COR4236202310140809033376",
                      "COR4236202310140810003377",
                      "COR4236202310151009214060",
                      "COR4236202310151010104062",
                      "COR4236202310151011004065",
                      "COR4236202310151011524067",
                      "COR4236202310151013594072",
                      "COR4236202310151015214074",
                      "COR4236202310151017134080",
                      "COR4236202310151018234085",
                      "COR4236202310151039104112",
                      "COR4236202310151041024114",
                      "COR4236202310151041554116",
                      "COR4236202310151042464119",
                      "COR4236202310151043554120",
                      "COR4236202310151056304136",
                      "COR4236202310151058274138",
                      "COR4236202310151059394140",
                      "COR4236202310151101134142",
                      "COR4236202310151102374144"
                    ]
                  }
                },
                "nReturned" : 75,
                "executionTimeMillisEstimate" : 1180,
                "works" : 27870,
                "advanced" : 75,
                "needTime" : 27795,
                "needYield" : 0,
                "saveState" : 2212,
                "restoreState" : 2212,
                "isEOF" : 0,
                "invalidates" : 0,
                "docsExamined" : 27870,
                "alreadyHasObj" : 0,
                "inputStage" : {
                  "stage" : "IXSCAN",
                  "nReturned" : 27870,
                  "executionTimeMillisEstimate" : 0,
                  "works" : 27870,
                  "advanced" : 27870,
                  "needTime" : 0,
                  "needYield" : 0,
                  "saveState" : 2212,
                  "restoreState" : 2212,
                  "isEOF" : 0,
                  "invalidates" : 0,
                  "keyPattern" : {
                    "formType" : 1
                  },
                  "indexName" : "formType_1",
                  "isMultiKey" : false,
                  "multiKeyPaths" : {
                    "formType" : [ ]
                  },
                  "isUnique" : false,
                  "isSparse" : false,
                  "isPartial" : false,
                  "indexVersion" : 2,
                  "direction" : "forward",
                  "indexBounds" : {
                    "formType" : [
                      "[\"corpo_reset_balance\", \"corpo_reset_balance\"]"
                    ]
                  },
                  "keysExamined" : 27870,
                  "seeks" : 1,
                  "dupsTested" : 0,
                  "dupsDropped" : 0,
                  "seenInvalidated" : 0
                }
              }
            }
          }
        }
      }
    ]
  },
  "serverInfo" : {
    "host" : "examplehost1",
    "port" : 27017,
    "version" : "4.0.9",
    "gitVersion" : "fc525e2d9b0e4bceff5c2201457e564362909765"
  },
  "ok" : 1,
  "operationTime" : Timestamp(1671465640, 1),
  "$clusterTime" : {
    "clusterTime" : Timestamp(1671465640, 1),
    "signature" : {
      "hash" : BinData(0,"AAAAAAAAAAAAAAAAAAAAAAAAAAA="),
      "keyId" : NumberLong(0)
    }
  }
}
```
Wynik analizy jest dość obszerny jednak można go podsumować tak:
- `winningPlan` czyli plan, który został wykonany posłużył się standardowym indeksem kolekcji:
```json
"inputStage" : {
          "stage" : "IXSCAN",
          "keyPattern" : {
            "_id" : 1
          },
          "indexName" : "_id_",
          "isMultiKey" : false,
          "multiKeyPaths" : {
            "_id" : [ ]
          },
          "isUnique" : true,
          "isSparse" : false,
          "isPartial" : false,
          "indexVersion" : 2,
          "direction" : "backward",
          "indexBounds" : {
            "_id" : [
              "[MaxKey, MinKey]"
            ]
          }
        }
```        
- `rejectedPlans` czyli plany odrzucone zawierają plan wykorzystujący indeks, który naszym zdaniem powinien zostać użyty:
```json
"inputStage" : {
                "stage" : "IXSCAN",
                "keyPattern" : {
                  "formFields.formInstanceNumber.value" : 1
                },
                "indexName" : "formFields.formInstanceNumber.value_1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                  "formFields.formInstanceNumber.value" : [ ]
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
```

Co więcej plan, który został wybrany odwiedził 254851 dokumentów i kluczy, a zapytanie trwało 11651 ms:
```json
  "executionStats" : {
    "executionSuccess" : true,
    "nReturned" : 75,
    "executionTimeMillis" : 11651,
    "totalKeysExamined" : 254851,
    "totalDocsExamined" : 254851,
```
Przy czym jeden z planów odrzuconych mógł zwrócić wynik po odwiedzeniu 75 dokumentów i 135 kluczy, a jego wykonanie szacowane było na 30 ms:
```json
{
        "nReturned" : 0,
        "executionTimeMillisEstimate" : 30,
        "totalKeysExamined" : 135,
        "totalDocsExamined" : 75,
```
## Dlaczego mongodb nie używa indeksu

## Wymuszenie użycia indeksu na live'ie

## Wnioski

## tl;dr

# Źródła
