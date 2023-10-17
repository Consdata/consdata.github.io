---
layout:    post
title:     "Jak zmusić MongoDB do użycia indeksu bez zmiany kodu - zastosowanie index filter"
date:      2023-10-13T08:00:00+01:00
published: true
didyouknow: false
lang: pl
author: jwilczewski
image: /assets/img/posts/2023-10-13-jak-zmusic-mongodb-do-uzycia-indeksu-bez-zmiany-kodu/mongodb.jpg
tags:
- mongodb
- index
- planCacheSetFilter
- index filter
- query shape
---

## Optymalizatory zapytań

Optymalizator zapytań to element silnika bazy danych, który dba o to, aby zapytanie zostało wykonane w optymalny sposób, uwzględniając zbiór danych przechowywanych w danym momencie w bazie. Pod pojęciem optymalny mamy zazwyczaj na myśli taki sposób, który zwróci nam wynik zapytania w najkrótszym czasie. Optymalizator bierze pod uwagę statystyki gromadzone i aktualizowane na bieżąco podczas działania bazy danych. Optymalizatory są wbudowane zarówno w bazy SQL'owe jak i bazy NoSQL. Sposób działania optymalizatora dla MongoDB możemy znaleźć na stronie: [https://www.mongodb.com/docs/manual/core/query-plans/](https://www.mongodb.com/docs/manual/core/query-plans/). W znakomitej większości przypadków optymalizatory są dużym ułatwieniem dla programistów, którzy nie muszą poświęcać czasu na analizę rozkładu danych w poszczególnych tabelach/kolekcjach i samodzielną optymalizację wykonywanych zapytań. Z uwagi na to, że optymalizator działa bez kontroli programisty zdarzają się jednak sytuacje, w których jego zachowanie jest dla nas zaskakujące i może prowadzić do problemów wydajnościowych.   

## Analiza problemów wydajnościowych

Jeżeli mamy podejrzenie, że problemy z wydajnością naszego systemu mogą być związane z bazą MongoDB istnieje dość prosty sposób, który pozwala na potwierdzenie lub wykluczenie takiej tezy. Należy mianowicie ustawić próg czasowy, przy którym MongoDB będzie logowało przekraczające go zapytania:
[https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs](https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs).

W analizowanym przez nas przypadku w logu diagnostycznym znajdowało się wiele wpisów, których czas wykonania przekraczał 10 sekund:
```
2023-10-01T14:50:35.652+0100 I COMMAND  [conn121] command formstore_db.formModel command: find { find: "formModel", readConcern: { level: "majority" }, filter: { formFields.formInstanceNumber.value: { $in: [ "COR4236202310131257073150", (...) "COR4236202310151102374144" ] }, formType: "some_form" }, sort: { _id: -1 }, projection: { formType: 1, (...) lastUpdateTime: 1 }, $db: "formstore_db", $clusterTime: { clusterTime: Timestamp(1671457810, 3), signature: { hash: BinData(0, 9A2225836AC174D40666995D6954154960FE67DB), keyId: 7137070794986749953 } }, lsid: { id: UUID("36e6cf62-4ad2-4b34-8a56-227d283da075") } } planSummary: IXSCAN { _id: 1 } keysExamined:254713 docsExamined:254713 fromMultiPlanner:1 replanned:1 cursorExhausted:1 numYields:2213 nreturned:75 reslen:289780 locks:{ Global: { acquireCount: { r: 2214 } }, Database: { acquireCount: { r: 2214 } }, Collection: { acquireCount: { r: 2214 } } } storage:{ data: { bytesRead: 15335932371, timeReadingMicros: 10566758 }, timeWaitingMicros: { cache: 56 } } protocol:op_msg 11597ms
```
Linijka logu jest dość długa. Na jej końcu mamy podany czas wykonania zapytania: `protocol:op_msg 11597ms`. Czas wykonania zdecydowanie przekraczał oczekiwaną wartość, co pozwoliło potwierdzić tezę, że przyczyna problemów wydajnościowych leży po stronie bazy danych. Warto zwrócić jeszcze uwagę na następującą informację w logu:

`planSummary: IXSCAN { _id: 1 } keysExamined:254713 docsExamined:254713`.

Wskazuje ona na to, że użyty został standardowy indeks MongoDB zakładany na identyfikatorze kolekcji `_id`. Oczekiwaliśmy tutaj raczej użycia indeksu założonego na polu, po którym odbywało się filtrowanie czyli na `formFields.formInstanceNumber.value`. W takim przypadku pierwsze podejrzenie padło na możliwy brak indeksu. W celu potwierdzenia lub zaprzeczenia tej możliwości pobraliśmy indeksy założone na problematycznej kolekcji: `db.formModel.getIndexes();`. Odpowiedź wskazywała jednak, że wymagany indeks został założony:
```javascript
[
  {
    "v": 2,
    "key": {
      "_id": 1
    },
    "name": "_id_",
    "ns": "formstore_db.formModel"
  },
  {
    "v": 2,
    "key": {
      "formFields.formInstanceNumber.value": 1
    },
    "name": "formFields.formInstanceNumber.value_1",
    "ns": "formstore_db.formModel",
    "background": true
  }
]
```

## Sprawdzamy plan zapytania

W takim przypadku warto przeprowadzić analizę planu zapytania. Co ważne, należy go przeprowadzić na środowisku, na którym wystąpiły problemy, gdyż wyniki pracy optymalizatora są zależne od danych znajdujących się w bazie oraz statystyk zbieranych podczas jej działania. Wyświetlenie wybranego planu zapytania oraz planów alternatywnych realizujemy poprzez wywołanie zapytania wykonywanego przez aplikację, w którym na końcu dodajemy: `.explain("allPlansExecution")`. W analizowanym przypadku otrzymaliśmy następujący wynik:
```javascript
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "formstore_db.formModel",
    "indexFilterSet": false,
    "parsedQuery": {
      "$and": [
        {
          "formType": {
            "$eq": "some_form"
          }
        },
        {
          "formFields.formInstanceNumber.value": {
            "$in": [
              "COR4237202310131425401494",
              // ...
              "COR4236202310151102374144"
            ]
          }
        }
      ]
    },
    "winningPlan": {
      "stage": "PROJECTION",
      "transformBy": {
        "formType": 1,
        // ...
        "lastUpdateTime": 1
      },
      "inputStage": {
        "stage": "FETCH",
        "filter": {
          "$and": [
            {
              "formType": {
                "$eq": "some_form"
              }
            },
            {
              "formFields.formInstanceNumber.value": {
                "$in": [
                  "COR4237202310131425401494",
                  // ...
                  "COR4236202310151102374144"
                ]
              }
            }
          ]
        },
        "inputStage": {
          "stage": "IXSCAN",
          "keyPattern": {
            "_id": 1
          },
          "indexName": "_id_",
          "isMultiKey": false,
          "multiKeyPaths": {
            "_id": [ ]
          },
          "isUnique": true,
          "isSparse": false,
          "isPartial": false,
          "indexVersion": 2,
          "direction": "backward",
          "indexBounds": {
            "_id": [
              "[MaxKey, MinKey]"
            ]
          }
        }
      }
    },
    "rejectedPlans": [
      {
        "stage": "PROJECTION",
        "transformBy": {
          "formType": 1,
          // ...
          "lastUpdateTime": 1
        },
        "inputStage": {
          "stage": "SORT",
          "sortPattern": {
            "_id": -1
          },
          "inputStage": {
            "stage": "SORT_KEY_GENERATOR",
            "inputStage": {
              "stage": "FETCH",
              "filter": {
                "formType": {
                  "$eq": "some_form"
                }
              },
              "inputStage": {
                "stage": "IXSCAN",
                "keyPattern": {
                  "formFields.formInstanceNumber.value": 1
                },
                "indexName": "formFields.formInstanceNumber.value_1",
                "isMultiKey": false,
                "multiKeyPaths": {
                  "formFields.formInstanceNumber.value": [ ]
                },
                "isUnique": false,
                "isSparse": false,
                "isPartial": false,
                "indexVersion": 2,
                "direction": "forward",
                "indexBounds": {
                  "formFields.formInstanceNumber.value": [
                    "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                    // ...
                    "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                  ]
                }
              }
            }
          }
        }
      },
      {
        "stage": "PROJECTION",
        "transformBy": {
          "formType": 1,
          // ...
          "lastUpdateTime": 1
        },
        "inputStage": {
          "stage": "SORT",
          "sortPattern": {
            "_id": -1
          },
          "inputStage": {
            "stage": "SORT_KEY_GENERATOR",
            "inputStage": {
              "stage": "FETCH",
              "filter": {
                "formFields.formInstanceNumber.value": {
                  "$in": [
                    "COR4237202310131425401494",
                    // ...
                    "COR4236202310151102374144"
                  ]
                }
              },
              "inputStage": {
                "stage": "IXSCAN",
                "keyPattern": {
                  "formType": 1
                },
                "indexName": "formType_1",
                "isMultiKey": false,
                "multiKeyPaths": {
                  "formType": [ ]
                },
                "isUnique": false,
                "isSparse": false,
                "isPartial": false,
                "indexVersion": 2,
                "direction": "forward",
                "indexBounds": {
                  "formType": [
                    "[\"some_form\", \"some_form\"]"
                  ]
                }
              }
            }
          }
        }
      }
    ]
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 75,
    "executionTimeMillis": 11651,
    "totalKeysExamined": 254851,
    "totalDocsExamined": 254851,
    "executionStages": {
      "stage": "PROJECTION",
      "nReturned": 75,
      "executionTimeMillisEstimate": 10335,
      "works": 254852,
      "advanced": 75,
      "needTime": 254776,
      "needYield": 0,
      "saveState": 2212,
      "restoreState": 2212,
      "isEOF": 1,
      "invalidates": 0,
      "transformBy": {
        "formType": 1,
        // ...
        "lastUpdateTime": 1
      },
      "inputStage": {
        "stage": "FETCH",
        "filter": {
          "$and": [
            {
              "formType": {
                "$eq": "some_form"
              }
            },
            {
              "formFields.formInstanceNumber.value": {
                "$in": [
                  "COR4237202310131425401494",
                  // ...
                  "COR4236202310151102374144"
                ]
              }
            }
          ]
        },
        "nReturned": 75,
        "executionTimeMillisEstimate": 10325,
        "works": 254852,
        "advanced": 75,
        "needTime": 254776,
        "needYield": 0,
        "saveState": 2212,
        "restoreState": 2212,
        "isEOF": 1,
        "invalidates": 0,
        "docsExamined": 254851,
        "alreadyHasObj": 0,
        "inputStage": {
          "stage": "IXSCAN",
          "nReturned": 254851,
          "executionTimeMillisEstimate": 120,
          "works": 254852,
          "advanced": 254851,
          "needTime": 0,
          "needYield": 0,
          "saveState": 2212,
          "restoreState": 2212,
          "isEOF": 1,
          "invalidates": 0,
          "keyPattern": {
            "_id": 1
          },
          "indexName": "_id_",
          "isMultiKey": false,
          "multiKeyPaths": {
            "_id": [ ]
          },
          "isUnique": true,
          "isSparse": false,
          "isPartial": false,
          "indexVersion": 2,
          "direction": "backward",
          "indexBounds": {
            "_id": [
              "[MaxKey, MinKey]"
            ]
          },
          "keysExamined": 254851,
          "seeks": 1,
          "dupsTested": 0,
          "dupsDropped": 0,
          "seenInvalidated": 0
        }
      }
    },
    "allPlansExecution": [
      {
        "nReturned": 75,
        "executionTimeMillisEstimate": 3640,
        "totalKeysExamined": 76455,
        "totalDocsExamined": 76455,
        "executionStages": {
          "stage": "PROJECTION",
          "nReturned": 75,
          "executionTimeMillisEstimate": 3640,
          "works": 76455,
          "advanced": 75,
          "needTime": 76380,
          "needYield": 0,
          "saveState": 817,
          "restoreState": 817,
          "isEOF": 0,
          "invalidates": 0,
          "transformBy": {
            "formType": 1,
            // ...
            "lastUpdateTime": 1
          },
          "inputStage": {
            "stage": "FETCH",
            "filter": {
              "$and": [
                {
                  "formType": {
                    "$eq": "some_form"
                  }
                },
                {
                  "formFields.formInstanceNumber.value": {
                    "$in": [
                      "COR4237202310131425401494",
                      // ...
                      "COR4236202310151102374144"
                    ]
                  }
                }
              ]
            },
            "nReturned": 75,
            "executionTimeMillisEstimate": 3640,
            "works": 76455,
            "advanced": 75,
            "needTime": 76380,
            "needYield": 0,
            "saveState": 817,
            "restoreState": 817,
            "isEOF": 0,
            "invalidates": 0,
            "docsExamined": 76455,
            "alreadyHasObj": 0,
            "inputStage": {
              "stage": "IXSCAN",
              "nReturned": 76455,
              "executionTimeMillisEstimate": 40,
              "works": 76455,
              "advanced": 76455,
              "needTime": 0,
              "needYield": 0,
              "saveState": 817,
              "restoreState": 817,
              "isEOF": 0,
              "invalidates": 0,
              "keyPattern": {
                "_id": 1
              },
              "indexName": "_id_",
              "isMultiKey": false,
              "multiKeyPaths": {
                "_id": [ ]
              },
              "isUnique": true,
              "isSparse": false,
              "isPartial": false,
              "indexVersion": 2,
              "direction": "backward",
              "indexBounds": {
                "_id": [
                  "[MaxKey, MinKey]"
                ]
              },
              "keysExamined": 76455,
              "seeks": 1,
              "dupsTested": 0,
              "dupsDropped": 0,
              "seenInvalidated": 0
            }
          }
        }
      },
      {
        "nReturned": 0,
        "executionTimeMillisEstimate": 30,
        "totalKeysExamined": 135,
        "totalDocsExamined": 75,
        "executionStages": {
          "stage": "PROJECTION",
          "nReturned": 0,
          "executionTimeMillisEstimate": 30,
          "works": 137,
          "advanced": 0,
          "needTime": 136,
          "needYield": 0,
          "saveState": 2212,
          "restoreState": 2212,
          "isEOF": 0,
          "invalidates": 0,
          "transformBy": {
            "formType": 1,
            // ...
            "lastUpdateTime": 1
          },
          "inputStage": {
            "stage": "SORT",
            "nReturned": 0,
            "executionTimeMillisEstimate": 30,
            "works": 137,
            "advanced": 0,
            "needTime": 136,
            "needYield": 0,
            "saveState": 2212,
            "restoreState": 2212,
            "isEOF": 0,
            "invalidates": 0,
            "sortPattern": {
              "_id": -1
            },
            "memUsage": 33914115,
            "memLimit": 33554432,
            "inputStage": {
              "stage": "SORT_KEY_GENERATOR",
              "nReturned": 75,
              "executionTimeMillisEstimate": 20,
              "works": 136,
              "advanced": 75,
              "needTime": 61,
              "needYield": 0,
              "saveState": 2212,
              "restoreState": 2212,
              "isEOF": 0,
              "invalidates": 0,
              "inputStage": {
                "stage": "FETCH",
                "filter": {
                  "formType": {
                    "$eq": "some_form"
                  }
                },
                "nReturned": 75,
                "executionTimeMillisEstimate": 20,
                "works": 135,
                "advanced": 75,
                "needTime": 60,
                "needYield": 0,
                "saveState": 2212,
                "restoreState": 2212,
                "isEOF": 0,
                "invalidates": 0,
                "docsExamined": 75,
                "alreadyHasObj": 0,
                "inputStage": {
                  "stage": "IXSCAN",
                  "nReturned": 75,
                  "executionTimeMillisEstimate": 0,
                  "works": 135,
                  "advanced": 75,
                  "needTime": 60,
                  "needYield": 0,
                  "saveState": 2212,
                  "restoreState": 2212,
                  "isEOF": 0,
                  "invalidates": 0,
                  "keyPattern": {
                    "formFields.formInstanceNumber.value": 1
                  },
                  "indexName": "formFields.formInstanceNumber.value_1",
                  "isMultiKey": false,
                  "multiKeyPaths": {
                    "formFields.formInstanceNumber.value": [ ]
                  },
                  "isUnique": false,
                  "isSparse": false,
                  "isPartial": false,
                  "indexVersion": 2,
                  "direction": "forward",
                  "indexBounds": {
                    "formFields.formInstanceNumber.value": [
                      "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                      // ...
                      "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                    ]
                  },
                  "keysExamined": 135,
                  "seeks": 61,
                  "dupsTested": 0,
                  "dupsDropped": 0,
                  "seenInvalidated": 0
                }
              }
            }
          }
        }
      },
      {
        "nReturned": 0,
        "executionTimeMillisEstimate": 1200,
        "totalKeysExamined": 27870,
        "totalDocsExamined": 27870,
        "executionStages": {
          "stage": "PROJECTION",
          "nReturned": 0,
          "executionTimeMillisEstimate": 1200,
          "works": 27872,
          "advanced": 0,
          "needTime": 27871,
          "needYield": 0,
          "saveState": 2212,
          "restoreState": 2212,
          "isEOF": 0,
          "invalidates": 0,
          "transformBy": {
            "formType": 1,
            // ...
            "lastUpdateTime": 1
          },
          "inputStage": {
            "stage": "SORT",
            "nReturned": 0,
            "executionTimeMillisEstimate": 1200,
            "works": 27872,
            "advanced": 0,
            "needTime": 27871,
            "needYield": 0,
            "saveState": 2212,
            "restoreState": 2212,
            "isEOF": 0,
            "invalidates": 0,
            "sortPattern": {
              "_id": -1
            },
            "memUsage": 33914115,
            "memLimit": 33554432,
            "inputStage": {
              "stage": "SORT_KEY_GENERATOR",
              "nReturned": 75,
              "executionTimeMillisEstimate": 1190,
              "works": 27871,
              "advanced": 75,
              "needTime": 27796,
              "needYield": 0,
              "saveState": 2212,
              "restoreState": 2212,
              "isEOF": 0,
              "invalidates": 0,
              "inputStage": {
                "stage": "FETCH",
                "filter": {
                  "formFields.formInstanceNumber.value": {
                    "$in": [
                      "COR4237202310131425401494",
                      // ...
                      "COR4236202310151102374144"
                    ]
                  }
                },
                "nReturned": 75,
                "executionTimeMillisEstimate": 1180,
                "works": 27870,
                "advanced": 75,
                "needTime": 27795,
                "needYield": 0,
                "saveState": 2212,
                "restoreState": 2212,
                "isEOF": 0,
                "invalidates": 0,
                "docsExamined": 27870,
                "alreadyHasObj": 0,
                "inputStage": {
                  "stage": "IXSCAN",
                  "nReturned": 27870,
                  "executionTimeMillisEstimate": 0,
                  "works": 27870,
                  "advanced": 27870,
                  "needTime": 0,
                  "needYield": 0,
                  "saveState": 2212,
                  "restoreState": 2212,
                  "isEOF": 0,
                  "invalidates": 0,
                  "keyPattern": {
                    "formType": 1
                  },
                  "indexName": "formType_1",
                  "isMultiKey": false,
                  "multiKeyPaths": {
                    "formType": [ ]
                  },
                  "isUnique": false,
                  "isSparse": false,
                  "isPartial": false,
                  "indexVersion": 2,
                  "direction": "forward",
                  "indexBounds": {
                    "formType": [
                      "[\"some_form\", \"some_form\"]"
                    ]
                  },
                  "keysExamined": 27870,
                  "seeks": 1,
                  "dupsTested": 0,
                  "dupsDropped": 0,
                  "seenInvalidated": 0
                }
              }
            }
          }
        }
      }
    ]
  },
  "serverInfo": {
    "host": "examplehost1",
    "port": 27017,
    "version": "4.0.9",
    "gitVersion": "fc525e2d9b0e4bceff5c2201457e564362909765"
  },
  "ok": 1,
  "operationTime": Timestamp(1671465640, 1),
  "$clusterTime": {
    "clusterTime": Timestamp(1671465640, 1),
    "signature": {
      "hash": BinData(0,"AAAAAAAAAAAAAAAAAAAAAAAAAAA="),
      "keyId": NumberLong(0)
    }
  }
}
```
Wynik analizy jest dość obszerny jednak można go podsumować tak:
- `winningPlan` czyli plan, który został wykonany posłużył się standardowym indeksem kolekcji:
```javascript
  {
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "_id": 1
      },
      "indexName": "_id_",
      "isMultiKey": false,
      "multiKeyPaths": {
        "_id": [ ]
      },
      "isUnique": true,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "backward",
      "indexBounds": {
        "_id": [
          "[MaxKey, MinKey]
        ]
      }
    }
  }
```        
- `rejectedPlans` czyli plany odrzucone zawierają plan wykorzystujący indeks, który naszym zdaniem powinien zostać użyty:
```javascript
  {
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "formFields.formInstanceNumber.value": 1
      },
      "indexName": "formFields.formInstanceNumber.value_1",
      "isMultiKey": false,
      "multiKeyPaths": {
        "formFields.formInstanceNumber.value": [ ]
      },
      "isUnique": false,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "forward"
    }
  }
```

Co więcej, plan który został wybrany odwiedził 254851 dokumentów i kluczy, a zapytanie trwało 11651 ms:
```javascript
  {
    "executionStats": {
      "executionSuccess": true,
      "nReturned": 75,
      "executionTimeMillis": 11651,
      "totalKeysExamined": 254851,
      "totalDocsExamined": 254851
    }
  }
```
Przy czym jeden z planów odrzuconych mógł zwrócić wynik po odwiedzeniu 75 dokumentów i 135 kluczy, a jego wykonanie szacowane było na 30 ms:
```javascript
{
  "nReturned": 0,
  "executionTimeMillisEstimate": 30,
  "totalKeysExamined": 135,
  "totalDocsExamined": 75
}
```
## Dlaczego MongoDB nie używa indeksu

W tym miejscu należy się zastanowić w jaki sposób MongoDB wybiera najlepszy plan zapytania. Z pierwszego punktu tego wpisu wiemy, że optymalizator bazuje na statystykach zbieranych podczas działania bazy. Potrzebujemy jeszcze wiedzieć w jaki sposób budowane są te statystyki. W opisywanym przypadku to właśnie tutaj kryje się rozwiązanie naszego problemu.

Optymalizator MongoDB cache'uje plany zapytań. Plan zapytania, który wygrał (`winningPlan`) trafia do cache'a i po kolejnym zapytaniu, w którym okazał się planem wygrywającym staje się aktywny. Następne zapytanie o takim samym **kształcie** zostaje wykonane w oparciu o aktywny plan z cache'a. Algorytm wygląda tak:

<div class="img-with-legend">
<img alt="Algorytm optymalizatora" src="/assets/img/posts/2023-10-13-jak-zmusic-mongodb-do-uzycia-indeksu-bez-zmiany-kodu/query-planner-logic.bakedsvg.svg" />
<span class="img-legend">Źródło: <a href="https://www.mongodb.com/docs/manual/core/query-plans/">www.mongodb.com</a> - dostęp: 2023-10-17</span>
</div>

Kluczem w cachu planów zapytań jest kształt zapytania [query-shape](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-query-shape). Na kształt zapytania składają się:
- predykat zapytania (czyli to po czym filtrujemy kolekcję),
- projekcja,
- sposób sortowania,
- [collation](https://www.mongodb.com/docs/manual/reference/collation/#std-label-collation).

Uzbrojeni w tę wiedzę przeanalizowaliśmy jakie zapytania kieruje do MongoDB nasza aplikacja. Okazało się, że w większości przypadków aplikacja odpytuje bazę o pojedynczą wartość pola `formFields.formInstanceNumber.value`. Tak więc w klauzuli `in` znajduje się jedna wartość. Dla takiej postaci zapytania optymalizator wybierał plan, który nie uwzględniał oczekiwanego przez nas indeksu. Taki plan trafiał do cache'a planów zapytań. Od czasu do czasu zdarzał się jednak klient systemu, dla którego zapytanie zawierało wiele wartości w klauzuli `in`. Kształt zapytania pozostawał ten sam więc MongoDB nadal używało planu, który znajdował się w cache'u. W ten sposób, dla klienta, który używał systemu w szerszym zakresie niż pozostali dostawaliśmy timeout. Rozwiązaniem tego problemu mogłoby być takie dobranie zapytań, aby klienci z pojedynczą wartością w klauzuli `in` posługiwali się innym kształtem zapytania niż klienci z wieloma wartościami. To wymagałoby jednak zmiany w kodach systemu.  

## Wymuszenie użycia indeksu na podczas pracy bazy

MongoDB daje nam jednak możliwość na wymuszenie użycia indeksu dla określonego kształtu zapytania. Taką konfigurację można zastosować na działającym systemie i działa ona natychmiast. Należy użyć polecenia: `planCacheSetFilter`. W naszej sytuacji użyliśmy następującej komendy:

```javascript
db.runCommand({
  planCacheSetFilter: "formModel",
  query: {
      "formFields.formInstanceNumber.value": {
        "$in": [
          "COR4237202310111009162413",
          // ...
          "COR4736202212011137482414"
        ]
      },
      "formType": "some_form"
    },      
    projection : {
      "formType": 1,
      // ...
      "lastUpdateTime": 1
    },
    sort : {
      "_id": -1
    },
    indexes: [
      {"formFields.formInstanceNumber.value": 1}
    ]
})
```
W ten sposób wymuszamy na MongoDB używanie indeksu na polu `formFields.formInstanceNumber.value` w zapytaniach o podanym kształcie. Być może zapytania dla pojedynczych wartości będą trochę mniej optymalne, ale za to dużo szybciej wykonają się zapytania dla dużej liczby wartości w klauzuli `in`.

**Uwaga! Zmiana ta działa do czasu restartu MongoDB**, nie jest więc docelowym rozwiązaniem, ale daje czas na uzyskanie satysfakcjonującego rozwiązania w kodzie.

Po ponowieniu zapytania otrzymaliśmy następujący wynik:
```javascript
{
  "queryPlanner": {
    "plannerVersion": 1,
    "namespace": "formstore_db.formModel",
    "indexFilterSet": true,
    "parsedQuery": {
      "$and": [
        {
          "formType": {
            "$eq": "some_form"
          }
        },
        {
          "formFields.formInstanceNumber.value": {
            "$in": [
              "COR4237202310131425401494",
              // ...
              "COR4236202310151102374144"
            ]
          }
        }
      ]
    },
    "winningPlan": {
      "stage": "PROJECTION",
      "transformBy": {
        "formType": 1,
        // ...
        "lastUpdateTime": 1
      },
      "inputStage": {
        "stage": "SORT",
        "sortPattern": {
          "_id": -1
        },
        "inputStage": {
          "stage": "SORT_KEY_GENERATOR",
          "inputStage": {
            "stage": "FETCH",
            "filter": {
              "formType": {
                "$eq": "some_form"
              }
            },
            "inputStage": {
              "stage": "IXSCAN",
              "keyPattern": {
                "formFields.formInstanceNumber.value": 1
              },
              "indexName": "formFields.formInstanceNumber.value_1",
              "isMultiKey": false,
              "multiKeyPaths": {
                "formFields.formInstanceNumber.value": [ ]
              },
              "isUnique": false,
              "isSparse": false,
              "isPartial": false,
              "indexVersion": 2,
              "direction": "forward",
              "indexBounds": {
                "formFields.formInstanceNumber.value": [
                  "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                  // ...
                  "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                ]
              }
            }
          }
        }
      }
    },
    "rejectedPlans": [ ]
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 75,
    "executionTimeMillis": 10,
    "totalKeysExamined": 136,
    "totalDocsExamined": 75,
    "executionStages": {
      "stage": "PROJECTION",
      "nReturned": 75,
      "executionTimeMillisEstimate": 10,
      "works": 213,
      "advanced": 75,
      "needTime": 137,
      "needYield": 0,
      "saveState": 1,
      "restoreState": 1,
      "isEOF": 1,
      "invalidates": 0,
      "transformBy": {
        "formType": 1,
        // ...
        "lastUpdateTime": 1
      },
      "inputStage": {
        "stage": "SORT",
        "nReturned": 75,
        "executionTimeMillisEstimate": 0,
        "works": 213,
        "advanced": 75,
        "needTime": 137,
        "needYield": 0,
        "saveState": 1,
        "restoreState": 1,
        "isEOF": 1,
        "invalidates": 0,
        "sortPattern": {
          "_id": -1
        },
        "memUsage": 33914115,
        "memLimit": 335544320,
        "inputStage": {
          "stage": "SORT_KEY_GENERATOR",
          "nReturned": 75,
          "executionTimeMillisEstimate": 0,
          "works": 137,
          "advanced": 75,
          "needTime": 61,
          "needYield": 0,
          "saveState": 1,
          "restoreState": 1,
          "isEOF": 1,
          "invalidates": 0,
          "inputStage": {
            "stage": "FETCH",
            "filter": {
              "formType": {
                "$eq": "some_form"
              }
            },
            "nReturned": 75,
            "executionTimeMillisEstimate": 0,
            "works": 136,
            "advanced": 75,
            "needTime": 60,
            "needYield": 0,
            "saveState": 1,
            "restoreState": 1,
            "isEOF": 1,
            "invalidates": 0,
            "docsExamined": 75,
            "alreadyHasObj": 0,
            "inputStage": {
              "stage": "IXSCAN",
              "nReturned": 75,
              "executionTimeMillisEstimate": 0,
              "works": 136,
              "advanced": 75,
              "needTime": 60,
              "needYield": 0,
              "saveState": 1,
              "restoreState": 1,
              "isEOF": 1,
              "invalidates": 0,
              "keyPattern": {
                "formFields.formInstanceNumber.value": 1
              },
              "indexName": "formFields.formInstanceNumber.value_1",
              "isMultiKey": false,
              "multiKeyPaths": {
                "formFields.formInstanceNumber.value": [ ]
              },
              "isUnique": false,
              "isSparse": false,
              "isPartial": false,
              "indexVersion": 2,
              "direction": "forward",
              "indexBounds": {
                "formFields.formInstanceNumber.value": [
                  "[\"COR4237202310131425401494\", \"COR4237202310131425401494\"]",
                  // ...
                  "[\"COR4236202310151102374144\", \"COR4236202310151102374144\"]"
                ]
              },
              "keysExamined": 136,
              "seeks": 61,
              "dupsTested": 0,
              "dupsDropped": 0,
              "seenInvalidated": 0
            }
          }
        }
      }
    },
    "allPlansExecution": [ ]
  },
  "serverInfo": {
    "host": "examplehost1",
    "port": 27017,
    "version": "4.0.9",
    "gitVersion": "fc525e2d9b0e4bceff5c2201457e564362909765"
  },
  "ok": 1,
  "operationTime": Timestamp(1671537181, 9),
  "$clusterTime": {
    "clusterTime": Timestamp(1671537181, 9),
    "signature": {
      "hash": BinData(0,"AAAAAAAAAAAAAAAAAAAAAAAAAAA="),
      "keyId": NumberLong(0)
    }
  }
}
```
Widać że `winningPlan` używa wskazanego przez nas indeksu:
```javascript
  {
    "inputStage": {
      "stage": "IXSCAN",
      "keyPattern": {
        "formFields.formInstanceNumber.value": 1
      },
      "indexName": "formFields.formInstanceNumber.value_1",
      "isMultiKey": false,
      "multiKeyPaths": {
        "formFields.formInstanceNumber.value": []
      },
      "isUnique": false,
      "isSparse": false,
      "isPartial": false,
      "indexVersion": 2,
      "direction": "forward"
    }
  }
```
a wykonanie zapytania trwało 10 milisekund. Podczas przetwarzania zapytania odwiedzonych zostało 136 kluczy i 75 dokumentów:
```javascript
  {
    "executionStats": {
        "executionSuccess": true,
        "nReturned": 75,
        "executionTimeMillis": 10,
        "totalKeysExamined": 136,
        "totalDocsExamined": 75
    }
  }
```

## Wnioski

Oczywisty wniosek płynący z przedstawionej tutaj sytuacji jest taki, że musimy brać pod uwagę to, że MongoDB nie musi używać utworzonego przez nas indeksu. Szczególną uwagę powinniśmy zwrócić na zapytania, które są uruchamiane ze znacząco różnymi zakresami danych wejściowych.

Wniosek mniej oczywisty jest związany z użyciem circuit breakera. W naszym przypadku circuit breaker odcinał wykonywanie zapytań trwających dłużej niż 10 sekund. Ponieważ klienci, dla których w klauzuli `in` wykorzystywaliśmy dużo wartości ponawiali próby wywołania funkcjonalności, circuit breaker wyłączył wywoływanie tej funkcjonalności. To spowodowało, że również dla klientów z mniejszą liczbą wartości w klauzuli `in` funkcjonalność stała się niedostępna.

## tl;dr

1. Jeżeli używasz MongoDB włącz [logowanie długich zapytań](https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs).
2. W przypadku problemów wydajnościowych z zapytaniem sprawdź plan wykonania zapytania dodając do polecenia `.explain("allPlansExecution")`.
3. Jeżeli chcesz wymusić, aby MongoDB używało indeksu w określonym zapytaniu można to osiągnąć bez przerwy w pracy systemu za pomocą polecenia `planCacheSetFilter`.

# Źródła

- [Opis działania optymalizatora zapytań w MongoDB](https://www.mongodb.com/docs/manual/core/query-plans/).
- [Sposób na logowanie długich zapytań w MongoDB](https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-operationProfiling.slowOpThresholdMs).
- [Polecenie umożliwiające wymuszenie użycia określonego indeksu dla zapytania o podanym kształcie](https://www.mongodb.com/docs/manual/reference/command/planCacheSetFilter/)
- [Wyjaśnienie czym jest kształt zapytania `query-shape`](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-query-shape)


