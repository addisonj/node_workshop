## Task

Create a proxy that rewrites the destination header of the stomp protocol

-----------------------------------------------------------------

## Description

- `argv[2]` will be the port of the upstream proxy server (assume localhost as the host)
- `argv[3]` will be the port for your proxy server to listen on
- create a proxy that rewrites all the destination headers to have the string `/myQueue/` prepended to them

## Hints
- the stomp protocol is pretty simple, see the docs here: https://stomp.github.io/stomp-specification-1.2.html. Three 'verbs' (or frames in stomp terms) have the destination header, SEND, SUBSCRIBE, and MESSAGE
- The best stomp parser is https://github.com/jmesnil/stomp-websocket
- For an easier time you can use https://github.com/backside/stomp-proxy, the reference solution uses it (I was short on time, cut me some slack), but writing it from scratch is a really fun exercise
