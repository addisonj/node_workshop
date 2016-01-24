# Stream Telephone Client
A small helper library for playing telephone with streams

This goes in conjunction with the stream-telephone server that (hasn't yet, but will be soon) open sourced

## Playing the game
In the game of telephone, a group of people form a chain and whisper a message down the chain. Most times, this message gets pretty garbled.

This is kinda like that... but with tcp servers and deliberate changes via a stream.

For this to work, you will need to implement a few things:

1. A transform stream ([https://nodejs.org/api/stream.html#stream_class_stream_transform](Transform Stream)) to tweak the message
2. A TCP client to connect to the person to get the message from
3. A TCP server for the next person in the chain to get the message from

This library just takes care of communicating both who you need to connect to and how the next person connects to you!

## API

This library exports a single Class
```JavaScript
var TelephoneClient = require('stream-telephone-client')
// the TCP port your server will listen on
var myPort = 8090
// the central telephone server that co-ordinates games
var serverInfo = {host: '1.2.3.4', port: 3001}
var client = new TelephoneClient(serverInfo, 'nameOfGame', 'playerName', myPort)
client.on('connectTo', function(connectionInfo) {
  // connectionInfo.ip and connectionInfo.port give details of who you need to
  // connect to to get the message
  // This event may fire multiple times, but only the

})
```

### Getting a port

`TelephoneClient.getPort()` can be used to get a random port, which can be useful

### Multiple `connectTo` events
As the players change, it is possible you may get multiple `connectTo` events. The last of those events is the only one you should worry about connecting to (i.e. close all your other connections).

### Retries
This library also takes care of reconnecting to central telephone server if it goes down or if the game isn't ready yet, so you should be able to jsut keep things running
