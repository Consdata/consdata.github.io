---
layout:    post
title:     "Kouncil - a modern Kafka frontend"
date:      2021-08-30 6:00:00 +0100
published: true
didyouknow: false
lang: en
lang-ref: kouncil-introduction
author:    jgrobelny
image:     /assets/img/posts/2021-08-30-kouncil-introduction/kouncil_dashboard.png
description: "Kouncil is a modern Kafka frontend equipped with features essential for developers."
tags:
- kouncil
- programming
- kafka
- event sourcing
- tool
---

Less than two years ago [I wrote](https://blog.consdata.tech/2019/10/03/kafka-companion.html) about a tool we created while developing a system based on event sourcing on Kafka. Kafka Companion is gone but this is good news because its place has been taken by Kouncil. The new version of the tool offers all the features its predecessor had, while introducing some new ones. In addition to the eye-catching redesign of the application, there are new features which will be described in detail in upcoming posts on this blog.

The rationale described in the previous article has not changed. We still feel that none of the available free GUIs for Kafka meet our expectations, despite quite a few of them being out there. Over the past years of working with Kafka we have developed a number of patterns and good practices that Kouncil allows us to oversee. I will now outline the various functionalities, placing particular emphasis on what has changed compared to its predecessor.

## Cluster health overview
The screen allows you to preview the list of nodes in the cluster. It has been expanded to include basic statistics of the machine on which the node is embedded. Moreover, after selecting an item from the list, it is possible to review the values of all configuration parameters. It is also worth noting at this point the ability to support multiple clusters, which can be switched in the upper right corner.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_brokers.png)

## Viewing and adding messages to the topical directory
The tabular presentation of messages in a topic is what we started building the tool with. Not surprisingly, there is still a lot of emphasis on the functionality and usability of this view. This is where the features awaited by many Kouncil users have been introduced, namely:
* paging,
* the ability to go to any offset,
* support for native message headers.


![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_topic_details_border.png)

## Consumer group status preview
This screen was functionally complete in the previous version, so not much has changed here, other than a clearer presentation of the rate at which message consumption is happening.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_consumer_group.png)

## Message tracking
Message tracking is a brand new feature that definitely sets us apart from the competition. More information about the rationale and features of this screen will be available in the next post.

![Kouncil introduction](/assets/img/posts/2021-08-30-kouncil-introduction/kouncil_event_tracking_result.png)

## Summary
I am very pleased to showcase the result of our intensive work. Kouncil is still free and available [on our GitHub](https://github.com/consdata/kouncil). I have left one more surprise at the end in case the screenshots are not inviting enough: we have prepared a [demo tool](https://kouncil-demo.web.app/#/topics) embedded in the GCP infrastructure, which you are welcome to download, test, and provide feedback on. 

  
