const net = require('net')
const express = require('express')
const expressWs = require('express-ws')
const WSStream = require('websocket-stream')
const serverPort = process.argv[2]

const app = express()
const wsApp = expressWs(app)

app.ws('/log/:host/:port', (ws, req, next) => {
  const conn = net.connect({host: req.params.host, port: req.params.port}, () => {
    const wss = new WSStream(ws)
    conn.pipe(wss)
  })
  next()
})

app.listen(serverPort)
