## Task

Create a websocket endpoint that takes a tcp host and port, connects to the server, and shovels the data
down a websocket

-----------------------------------------------------------------

## Description

- `argv[2]` will be the port for your server to listen on
- a `get` route with `/logs/:host/:port` that upgrades to a websocket that writes all the data to a websocket

## Hints
- `express-ws` is a nice wrapper for websockets that works with express
- `websocket-stream` is a nice way to get a streams compatibility
