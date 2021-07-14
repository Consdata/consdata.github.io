---
layout:    post
title:     "Practical applications of webhooks"
date:      2018-04-23 08:00:00 +0100
published: true
lang:      en
lang-ref:  practical-applications-of-webhooks
author:    bradlinski
image:     /assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/webhook.png
tags:
    - sonarqube
    - webhook
---

Sooner or later every developer will have to deal with some form of API - an interface through which two independent applications can communicate. In this article I will present an approach to this type of communication that is a bit different from the traditional one.

## What are webhooks?
Let’s assume you have written some application A and you want it to be able to display some data from application B, e.g. a list of active users. For this purpose, application B gives you access to an API that enables downloading the list of active users. In a conventional approach you would need to request application B for an up-to-date list of active users, but it would be much more convenient if application B informed your application about any changes in the list. This is what webhooks can help you achieve.

Webhooks enable a different approach to communication between applications. The webhook mechanism is often called Reverse API because it usually does not require interaction from the client side (in our example, application A). In simpler terms, webhooks allow the client application to be notified when certain events occur.

Webhooks are easy to implement because they actually consist in sending a request with a defined structure, to a defined address, as a result of some event. Integrating the client application comes down to defining the address to which the request is to be sent.

Summing up, webhooks are very useful in situations when you expect information from an external application in the case of an event as they allow you to avoid active waiting on your application’s side.

However, there are two disadvantages of webhooks that should be mentioned:
- when an error occurs in the application, external data can be lost because there is no certainty that the external application will in any way respond to the error that you report - in the case of a classic API you could retry to query the external application;
- when handling webhooks, you must take into account that the events which you are notified about may occur very frequently - usually you do not have control over it.

## Integration example
Using our open-source project, SonarQube Companion, as an example, I will explain how several applications can be easily integrated with webhooks.

Let’s integrate SonarQube Companion with the Slack messenger. The result of the integration will be a message on a Slack channel stating how the number of a team’s violations has changed over the last day.

### Prerequisites:
- familiarize yourself with the article about SonarQube Companion,
- configure SonarQube Companion,
- get Slack.

First, you need to configure a webhook on Slack’s side. To do this, go to the messenger’s integration settings, add the "Incoming WebHooks" app configuration and define which channel you want to send messages to:

![Slack configuration](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/1.png)

After a successful configuration, you should see a notification in the channel:

![Slack notification](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/2.png)

The next step is to configure the webhook on SonarQube Companion’s side, which is a little bit more complex. Each of the defined groups may contain its own definition of webhooks. The definition of a webhook consists of three basic elements:

- **action** – a certain event/behavior that is to be executed,
- **trigger** – defines when an action is to be executed,
- **callback** – determines in what way the client application is to be informed about the action’s results.

A full documentation of available actions, triggers and callbacks is located in [this GitHub repository](https://github.com/Consdata/sonarqube-companion/wiki/Webhooks)

As an example, let's define a webhook that will check how the number of violations within a team has changed over the last day. Depending on the result, an appropriate message will be sent to the messenger’s channel.

First, define what action should result in sending the message. To do this, define an action for a new webhook in the webhooks node:
```json
"webhooks": [{
    "action": {
    "type": "NO_IMPROVEMENT",
    "period": "DAILY",
    "severity": ["blockers", "criticals", "majors"]
    }
}]
```
In this way, you have defined an action that will check whether the number of violations in the group's projects has improved during the last day. Additionally, it will take into account only the violations with the following priorities: blocker, critical and major.

The next step is to define an action trigger. In our example, for simplicity, we would like the action to be executed every minute. To achieve that, define a CRON-type trigger:
```json
"trigger": {
    "type": "CRON",
    "definition": "0 */1 * * * *"
}
```

Finally, you need to define the actual integration with the messenger. To do that, define a POST-type callback, including the URL obtained from the "Webhook URL" field of Slack’s configuration panel.
```json
"callbacks": [
    {
        "type": "POST",
        "url": "https://hooks.slack.com/services/*/*",
        "body" : {
            "no_improvement": "{ 'text': 'http://gph.is/1RFg2r3 Brak poprawy'}",
            "improvement": "{ 'text': 'http://gph.is/1a7RlDR Poprawiono ${diff}'",
            "clean": "{ 'text': 'https://gph.is/1IH3RW6 Czysto'}"
        }
    }
]
```

In the body section you need to define the content of the message to be sent depending on the state of the group. For example, if the state of violations has improved (the "improvement" response), a gif will be sent along with a short comment containing a predefined action variable - ${diff}. In this way, the channel will show information about the number of corrected violations during the last day.

The whole configuration looks as follows:
```json
"webhooks": [
    {
        "action": {
        "type": "NO_IMPROVEMENT",
        "period": "DAILY",
        "severity": ["blockers", "criticals", "majors"]
        },
        "trigger": {
            "type": "CRON",
            "definition": "0 */1 * * * *"
        },
        "callbacks": [{
            "type": "POST",
            "url": "https://hooks.slack.com/services/*/*",
            "body" : {
                "no_improvement": "{ 'text': 'http://gph.is/1RFg2r3 Brak poprawy'}",
                "improvement": "{ 'text': 'http://gph.is/1a7RlDR Poprawiono ${diff}'",
                "clean": "{ 'text': 'https://gph.is/1IH3RW6 Czysto'}"
            }
        }]
    }
]
```
In this way, SonarQube Companion will check the state of the group's violations every minute and, depending on the result, will send the relevant message to the messenger’s channel.

As a result, a message about the lack of improvement of any violations appears in the channel:
![Slack message](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/3.png)

After one violation has been corrected, the relevant message will be generated in the next minute:
![Slack message](/assets/img/posts/2018-04-23-praktyczne-zastosowanie-webhook/4.png)

In this way, you have integrated two independent applications using the webhooks mechanism, without having to write a single line of code.

## Summary
In this article I presented the concept of webhooks and showed you how to integrate two independent applications in a simple and quick way. We are going to gradually extend SonarQube Companion with new actions, e.g. sending weekly reports about violations to particular users so I recommend staying tuned to the project’s website.

## Useful links:
- [https://github.com/Consdata/sonarqube-companion](https://github.com/Consdata/sonarqube-companion)
- [https://github.com/Consdata/sonarqube-companion/wiki/Webhooks](https://github.com/Consdata/sonarqube-companion/wiki/Webhooks)
