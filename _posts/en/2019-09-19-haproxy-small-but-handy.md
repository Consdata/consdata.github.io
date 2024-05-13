---
layout: post
title: HAProxy - small but handy
published: true
lang: en
lang-ref:   haproxy-small-handy
date:      2019-09-16 08:00:00 +0100
author:    tlewandowski
interpreter: Piotr Żurawski
image:     /assets/img/posts/2019-09-19-haproxy-mala-rzecz-a-cieszy/thumbnail.webp
tags:
- programming
- load-balancing
- ha
- server
- network
---


HAProxy is open source software that is most often used as a reverse proxy to ensure load balancing and high availability of application servers.

Instead of connecting directly to the servers of an application, clients (e.g. of a browser) do it from a reverse proxy, which uses additional rules to pass the requests to the application servers and send the responses back to the client.

The project has been actively developed since 2002 and has seen increased popularity due to the proliferation of distributed systems, in particular architectures based on microservices. It is in use by such household names as Digital Ocean, GitHub, Dropbox, Instagram or StackOverflow. It is also a component of the OpenShift containerization platform.

The software is available for all popular Linux distributions, also as a Docker image.

## Typical usages of HAProxy

### Ensuring load balancing
One of the basic usages of HAProxy is as a software load balancer. 
With several nodes in an application, the traffic between them needs to be managed. 
To do that you need to declare an object called backend in the HAProxy configuration, which will represent a cluster of the application servers.
Next, you need to declare an object called frontend, to which clients will be directed and frontend-to-backend traffic rules:
```
frontend my-load-balancer
    bind 172.19.0.1:81
    default_backend my-application-servers
    
backend my-application-servers
    balance roundrobin
    server my-app-server-1 172.19.0.2:8080
    server my-app-server-2 172.19.0.3:8080
    server my-app-server-3 172.19.0.4:8080   
```
As a result of the above configuration, the connection on endpoint 172.19.0.1:81 will be redirected to one of the servers on a round-robin basis.

### Ensuring High Availability
HAProxy can monitor the state of the servers declared in the backend section and halt directing traffic to the servers that have stopped working correctly.
The server can be configured to determine how often HAProxy is supposed to check the server’s status, how many times the verification has to fail in order for the server to be considered faulty, and how many times the verification has to succeed for the excluded server to be regarded as healthy again.
For example:
```
 server my-app-server-1 172.19.0.2:8080 check inter 5s fall 3 downinter 1m raise 5
```
means that:
* server status will be checked every 5 seconds (inter 5s),
* server will be excluded if three consecutive verifications fail (fall 3),
* excluded server will be checked every minute (downinter 1m),
* server will be considered operational again if three consecutive verifications are successful (raise&nbsp;5).

### TLS/SSL
For managing encrypted TLS/SSL connections, HAProxy can work in one of the following modes:
* regular proxy
* terminating encryption
* encrypting traffic again

### Regular proxy
In this mode, HAProxy simply passes the stream of bytes from the frontend to the backend, disregarding the fact that the traffic is encrypted.

### Terminating encryption

In this mode, HAProxy receives encrypted traffic from the frontend, decrypts it using a private key and passes the decrypted traffic to the backend.
An example configuration:
```
frontend my-terminating-load-balancer
    bind 172.19.0.1:443 ssl crt /etc/ssl/certs/my-certs.pem
    default_backend my-application-servers
    
backend my-application-servers
    balance roundrobin
    server my-app-server-1 172.19.0.2:8080
    server my-app-server-2 172.19.0.3:8080
```

### Encrypting traffic again
In this mode, HAProxy receives encrypted traffic from the frontend, decrypts it using a private key, and then encrypts it again and passes it to the backend.
An example configuration:
```
frontend my-terminating-load-balancer
    bind 172.19.0.1:443 ssl crt /etc/ssl/certs/my-certs.pem
    default_backend my-secure-application-servers
    
backend my-secure-application-servers
    balance roundrobin
    server my-secure-app-server-1 172.19.0.2:8443 ssl
    server my-secure-app-server-2 172.19.0.3:8443 ssl
```
As a result of decryption, in this mode HAProxy can manipulate the HTTP requests that it redirects, unlike in the regular proxy mode.

### Session affinity
HAProxy can be configured so that the requests from a given user will always be directed to the same application server. 
The need for this occurs, e.g. when you are using local user sessions that exist only on the application server which they were created on.
An example configuration that is based on a session cookie prefix:

```
frontend my-sticky-load-balancer
    bind 172.19.0.1:81 
    default_backend my-application-servers
    
backend my-application-servers
    cookie JSESSIONID prefix nocache
    server my-app-server-1 172.19.0.2:8080 cookie node1
    server my-app-server-2 172.19.0.3:8080 cookie node2
```
With this configuration, all requests that carry a session cookie with the “node1” prefix will be directed to the first application server.

### ACL
HAProxy enables the user to configure rules (ACL - Access Control List) which determine how particular requests are supposed to be handled. 
An example configuration:
```
frontend my-acl-load-balancer
	bind 172.19.0.1:81
	acl is-passive method GET
	use_backend my-passive-application-server if is-passive
	default_backend my-active-application-server
    
backend my-passive-application-server
	server my-passive-app-server-1 172.19.0.2:8080
    
backend my-active-application-server
	server my-active-app-server-1 172.19.0.3:8080
```
With this configuration, GET requests will be directed to a passive application server, whereas all other requests will be directed to an active one.

## A useful tool in your programming toolbox
Besides the traditional use case as a reverse proxy that ensures load balancing and high availability, HAProxy can be used to great effect in a range of programming scenarios. 
Let me present some examples from my own experience.

### Easily changeable routing
While developing an application that calls services from different applications, you might want to be able to switch between various addresses of those external services, 
e.g. between real applications and their mock versions. Restarting an application is often time-consuming, while changing the IP address to external services requires editing more than one file.
In this case, HAProxy may act as a convenient “hub”, in which you can easily switch between various versions of the external services. By configuring HAProxy as follows:
```
frontend my-forward-proxy
	bind 172.19.0.1:81
	default_backend my-external-services
    
backend my-external-services
	server my-external-server-1 172.19.0.2:8080

backend my-mocked-services
	server my-mocked-server-1 172.19.0.3:8080
```
and setting the address of external services in your application to 172.19.0.1:81, you can modify its external dependencies by changing the “default_backend” value and a quick reload of HAProxy, without the need to restart the application.

### Monitoring TLS/SSL

If the services in your system send data through encrypted TLS/SSL connections, debugging communication using network traffic analyzers such as tcpdump or Wireshark might be difficult. However, you can set HAProxy as a proxy between the services that will terminate an encrypted connection and will allow you to monitor the network traffic.

### Delaying requests

While developing an application you might sometimes need to test how it will behave if calling an external service is processed for a longer time than expected. You can simulate this kind of delay with HAProxy acting as the proxy to external services. HAProxy itself does not have this capability but it enables you to extend its functionalities with Lua scripts. An example script introducing a delay:
```
function delay_request(txn)
    core.msleep(15000)
end

core.register_action("delay_request", { "http-req" }, delay_request);
```
Loading the script to HAProxy:
```
lua-load /etc/haproxy/delay.lua
```
and usage in the configuration:
```
frontend my-delay-frontend
    bind 172.19.0.1:81
    mode http
    http-request lua.delay_request
    default_backend my-delay-backend

backend my-delay-backend
    server my-external-server-1 172.19.0.2:8080
```

## A simple static content server
Interestingly, you can use HAProxy as a simple server for static files. For every backend, you can configure the files that are supposed to be served in the case of particular HTTP statuses. On the other hand, when no server has been defined in the backend’s configuration, HAProxy generates HTTP status 503. By combining these two facts, you can configure the frontend to return a static file for particular requests:
```
frontend my-frontend
    bind 172.19.0.1:81
    mode http
    use_backend my-backend-static if { path_end /index.html }
    default_backend my-backend-services

backend my-backend-static
    mode http
    errorfile 503 /etc/haproxy/index.html
    
backend my-backend-services
    server my-external-server-1 172.19.0.2:8080
```
### Connecting to a session

As a developer you might need to connect with a browser to a user session on a server using the session’s ID. Modern desktop browsers usually allow you to manually add a session cookie to a website’s cookie set. But what if you need to serve less popular or mobile browsers? HAProxy may come in handy in this situation as well:
```
frontend my-setcookie-frontend
    bind 172.19.0.1:81
    mode http
    default_backend my-setcookie-backend

backend my-setcookie-backend
    mode http
    http-request redirect location http://172.19.0.1:80/\r\nSet-Cookie:\ JSESSIONID=%[urlp(session_id)] code 302

```
With this configuration, an attempt to access http://172.19.0.1:81/?session_id=123456 from any browser will be redirected to http://172.19.0.1:80 with an already set session cookie (here, we are using the fact that the cookies set for this domain do not take ports into consideration).

## Summary

As you can see, HAProxy has a number of typical and inventive applications. Its big advantages are a relatively simple configuration, a runtime performance and being “lightweight”, which makes the changed configuration load in a split second.

I’m sure that any designer of distributed systems or an agile developer will find HAProxy to be a very useful tool in their work.
