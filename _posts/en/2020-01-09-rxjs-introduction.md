---
layout:    post
title:     RxJS with Angular - reactive programming of a front-end application
published: true
lang:      en
lang-ref:  rxjs-introduction
interpreter: Piotr Żurawski
date:      2020-01-09 08:00:00 +0100
author:    kgabara
image:     /assets/img/posts/2020-01-09-rxjs-wstep/RxJS.png
tags:
- Angular
- rxjs
- asynchronous
- reactive
- reactive extensions
- rxjs operators
---

When writing  applications using Angular you eventually come into contact with Observables. You have surely dealt with them if you have used the HttpClient service to download data from a server or used EventEmitter for the communication between parent-child components. But have you ever wondered what exactly an object of this type is and why you have to subscribe to it to obtain data? Or maybe you know that already but want to find out how to use the RxJS library to its full potential? 

If this is the case, then this article is for you.

## What is RxJS?
_Reactive Extensions for JavaScript (RxJS)_ is a library that simplifies reactive programming in JavaScript. In this text I will try to demonstrate how the library and the components that it provides make creating asynchronous programs intuitive and straightforward.

## Data stream
Let’s start with the basics. According to its definition, a data stream is a sequence of data available within a given period, which you can observe or download objects and data from. Data can appear at any point during its lifespan, and you are notified about it with a callback, that is, a reverse function called by the stream. There are two types of streams: cold and hot.

### Cold stream
A cold stream will not be emitting data until it is observed. It will emit a separate value for every new observer, and these values will not be shared, for example: sending a GET request to the server.
```typescript
this.httpClient.get<ServerResponse>('someUrl')
```
### Hot stream
Unlike a cold stream, a hot stream emits data irrespective of whether it is being listened to or not. All observers work on a shared set of data - two observers will receive the same value at the time of it being emitted by the stream. A click event is an example of such a scenario:

```typescript
import {fromEvent} from 'rxjs';
 
fromEvent(document, 'click')
```

## Observable, observer pattern
Now, having defined a stream and distinguished its types, let’s describe a basic RxJS concept: an observable. An observable is an object that represents a data stream. It implements the _observer_ design pattern which assumes the existence of an entity that stores the list of objects - observers listening for any changes of state of this entity. It also informs all observers about a change by calling functions that they have passed (callback).

A simple observable can be created with the static _of_ function.
```typescript
// Observable emitting numerical values from 1 to 5
const numbers$: Observable<number> = of(1,2,3,4,5);

```
Object numbers$ is the definition of the number-type of data stream. This is only a stream pattern. In this case a cold stream has been created. We know what the data set is (1, 2, 3, 4, 5), however data will be emitted only when an observer starts listening to a given data stream. To 'connect' to the stream, the subscribe() function should be used.

### subscribe() and unsubscribe()
As a parameter, the subscribe function expects an object that defines three functions: _next_, _error_ and _complete_.
```typescript
const subscription = numbers$.subscribe({
    next(value) {},
    error(err) {},
    complete() {}
});
```

Each of these functions is a callback that is called at given moments of data flowing through the stream. The _next(value)_ function is called every time the stream emits a single value, which in this case means that the _next()_ function will be called 5 times, 1 time for every digit from 1 to 5. The _error(err)_ callback will be called when the stream is unnaturally closed or disrupted. Complete is the last callback that is called once the stream has been closed.

Calling the _subscribe()_ function adds you to the list of observers of a given stream.

When subscribing as an observer to a given observable, you are given a subscription-type  object on which you can call the _unsubscribe()_ method to remove yourself from the list of observers.

Unsubscribing is crucial in the case of hot streams, as they are mostly infinite, meaning they emit the value for a potentially infinite amount of time. If you forget to unsubscribe from the list of observers of a such a stream, the reference to the observer you’ve created will exist throughout the whole lifecycle of the application, creating an infinite hole in the memory, which in extreme cases might lead to the death of the tab that the application is running in.

## Subject - creating your own streams
RxJS enables you to create your own streams and to do so you can use a subject-type object. Such a stream is potentially infinite, emitting new values at what you consider important points of the application. A subject is created in the same way as other objects:
```typescript
const subject$ = new Subject<number>();
```
Now you can subscribe to the stream as an observer:
```typescript
subject$.asObservable()
    .subscribe((value) => console.log('value from subject$: ', value))
```
The _subject$_ variable now provides you with the _next(value: number)_ method, which allows you to send out a new numeric value to all observers, like this:
```typescript
subject$.next(5);
// value from subject$: 5
```

The stream you’ve just created is infinite, so you need to remember to unsubscribe once you finish listening to it. You can also close the stream with the _complete()_ command.

In this example, a numerical value '5' was emitted and received by a single observer. If no observers exist at the time of emitting a new value, it is lost. However, if this value is important to you and you don’t want to lose, you can use specific subject-type extending objects.

### ReplaySubject

ReplaySubject is a stream which replays a defined value of the last emitted data for every new observer. The value can be passed in the constructor in this way:
```typescript
const replaySubject$ = new ReplaySubject<number>(5);
```
If some values have been emitted by this stream before, a maximum of 5 most recent ones will be generated to a given observer. For example:
```typescript
replaySubject$.next(1);
replaySubject$.next(2);
replaySubject$.next(3);
replaySubject$.next(4);
replaySubject$.next(5);
replaySubject$.next(6);
replaySubject$.asObservable()
    .subscribe(replayedValue => console.log(replayedValue));
// 2
// 3
// 4
// 5
// 6
```

### BehaviorSubject

BehaviorSubject is a unique type of stream. It always has a value because it is necessary for creating a given object. Also, this stream always keeps the last emitted value and, similarly to ReplaySubject, replays it to every new observer. It is created just as easily:
```typescript
const behaviorSubject = new BehaviorSubject<boolean>(true);
behaviorSubject.asObservable().subscribe(value => console.log(value))
// true
behaviorSubject.next(false);
behaviorSubject.asObservable().subscribe(value => console.log("secondobserver: ", value))
// false
// second observer: false
```
Now, every new observer will receive the value - logical value ‘true’ -  that is currently being stored by the stream.

### AsyncSubject

AsyncSubject is a unique kind of stream because it emits the last value passed in the next() function only after closing the stream, that is, after calling the complete() function on it. After closing, it stores the emitted value and emits it to each new observer that failed to subscribe before the stream closed.
```typescript
const asyncSubject = new AsyncSubject<number>();
asyncSubject.asObservable().subscribe(value => console.log("value from async subject: ", value))
asyncSubject.next(1);
asyncSubject.next(2);
asyncSubject.complete();
// value from async subject: 2
asyncSubject.asObservable().subscribe(value => console.log("value from async subject after closing stream: ", value))
// value from async subject after closing stream: 2
```

## RxJS operators - operations on the stream
I’ve demonstrated a few ways of creating streams but you might also want to modify the emitted data to fit a particular business case. RxJS features a wide range of operators, that is, functions performing operations on the stream which can be used to modify the data. Below I will present a few of them that I consider very useful in everyday’s work.

Let's assume you are working on the following stream:
```typescript
const stream$ = new BehaviorSubject<number>(15_000);
const observable$ = stream$.asObservable();
```

By default the stream emits a numerical value '15000'. You can perform operations on the data generated by the stream by passing the necessary operators as arguments of the _pipe()_ function called on observable$.

### map

You are probably familiar with the map operator, e.g., from API JS Arrays.map, which RxJS was based on. Map transforms data, returning a new result for every emitted piece of data. For example:

```typescript
observable$.pipe(map(number => number*2))
    .subscribe(value => console.log('mapped value: ', value))
// mapped value: 30000
```

### first

First is an interesting operator that downloads the first element from the stream, and then - as a side effect - it unsubscribes the observer from the stream’s observers list. This is very convenient when you need only one value from a given hot stream, as you don’t have to call the _unsubscribe()_ function. For example:

```typescript
observable$.pipe(first())
    .subscribe(value => console.log('first received value: ', value))
// first received value: 15000
stream$.next(25000);
// don’t worry, observable$ has unsubscribed from the observers list
```

### withLatestFrom

Another noteworthy operator is withLatestForm, which enables you to ‘cross streams’, that is, to add the last emitted value of one stream to another stream. For instance:

```typescript
const otherStream$ = new BehaviourSubject<boolean>(true);
observable$.pipe(withLatestFrom(otherStream$))
    .subscribe(([value, otherStreamValue]) => console.log('value received from first stream: {}, from other stream: {}', value, otherStreamValue))
// value received from first stream: 15000, from other stream: true
```

### takeUntil

takeUntil is an operator that comes in handy when you want to unsubscribe from a given stream’s observers list in a clear and simple way. Let’s have a look at the code:

```typescript
@Component({
  selector: 'app-some-component',
  template: `
        some template
  `,
  styleUrls: ['some-styles.scss']
})
export class SomeComponent implements OnDestroy, OnInit {
    private destroySubject$ = new Subject<void>();
    private someValues$ = new BehaviourSubject<string>('initial value');
    
    ngOnInit(): void {
       this.someValues$.asObservable().pipe(takeUnitl(this.destroySubject$))
            .subscribe(value => ...)
    }

    ngOnDestroy(): void {
       this.destroySubject.next();
    }   

}
```

The above snippet contains SomeComponent, which listens to the values from the someValues$ stream until the other stream emits value destroySubject$. This way you don’t need to remember about manually unsubscribing from the first stream because it will automatically close when the component is killed by Angular.

### switchMap

Another operator that you might find useful is _switchMap()_. It can be used to maintain clarity and prevent the so-called _callback hell_, which is a chain of nested _subscribe()_ calls that are hard to read and maintain.

```typescript
observable$.subscribe(
    value => someService.processValue(value)
        .subscribe(someServiceResponse => andYetAnotherService.processAnotherValue(someServiceResponse)
                .subscribe(yetAnotherResponse => veryImportantService.processVeryImportantValue(yetAnotherResponse)
                    .subscribe(veryImportantResponse => ...))))
```

In this case each service returns an observable to the stream from which you need a value to call another service. Instead, you can write:

```typescript
observable$.pipe(
    switchMap(value => someService.processValue(value)),
    switchMap(someServiceResponse => andYetAnotherService.processAnotherValue(someServiceResponse)),
    switchMap(yetAnotherResponse => veryImportantService.processVeryImportantValue(yetAnotherResponse)))
        .subscribe(veryImportantResponse => ...)
```

SwitchMap automatically subscribes you to the next stream, which makes the code clearer. Naturally, nesting streams introduces load that may prevent you from quickly figuring out what the code does, but it is still a more elegant approach.

### More operators

To learn how to use other operators available in the RxJS library, I recommend visiting [learnrxjs](https://www.learnrxjs.io/operators).

## Summary

RxJS is a powerful tool that gives you multiple options of writing code that will be reactive, asynchronous and intuitive for your fellow developers. I hope you will continue your journey with reactive programming and will find this article helpful in creating asynchronous code that will make you proud.
