const StompProxy = require('stomp-proxy')
const net = require('net')

const serverPort = process.argv[2]
const myPort = process.argv[3]

function makeProxy(client, upstream) {
  let proxy = new StompProxy(client, upstream)
  function rewriteDest(session, frame, cb) {
    frame.headers.destination = `/myQueue/${frame.headers.destination}`
    cb(null, frame)
  }
  proxy.onSubscribe = rewriteDest
  proxy.onSend = rewriteDest
  proxy.onMessage = rewriteDest

  proxy.start()
  return proxy
}

const upstreamConn = net.connect({port: serverPort}, () => {
  net.createServer((conn) => {
    makeProxy(conn, upstreamConn)
  }).listen(myPort)
})
