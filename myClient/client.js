const TelephoneClient = require('stream-telephone-client')
const {Transform} = require('stream')
const net = require('net')

class RewriteLetter extends Transform {
  constructor(toSub, subFor) {
    super()
    this.subRegex = new RegExp(toSub, 'g')
    this.subFor = subFor
  }
  _transform(chunk, encoding, done) {
    let toReplace = chunk
    if (encoding === 'buffer') {
      toReplace = chunk.toString('utf8')
    }
    const replaced = toReplace.replace(this.subRegex, this.subFor)
    this.push(new Buffer(replaced, "utf8"))
    done()
  }
}

function makeStream(server, sourceInfo) {
  console.log('going to to connect to', sourceInfo)
  let sinkConn = null
  let sourceConnOpen = false
  let sinkConnOpen = false
  const aToB = new RewriteLetter('a', 'b')
  const sourceConn = net.connect({host: sourceInfo.ip, port: sourceInfo.port}, () => {
    console.log('connected to source')
    sourceConnOpen = true
    if (sourceConnOpen && sinkConnOpen) {
      sourceConn.pipe(aToB).pipe(sinkConn)
    }
  })

  server.on('connection', (c) => {
    console.log('sink connected to us')
    sinkConnOpen = true
    sinkConn = c
    if (sourceConnOpen && sinkConnOpen) {
      sourceConn.pipe(aToB).pipe(sinkConn)
    }
  })
}

const listenPort = TelephoneClient.getPort()
const server = net.createServer()
server.listen(listenPort, () => console.log(`listening on port ${listenPort}`))

const client = new TelephoneClient({}, 'textGame', 'Mr. Wonderman', listenPort)
client.on('ready', () => {
  console.log('am I?')
})
client.on('connectTo', (playerInfo) => {
  console.log(playerInfo)
  makeStream(server, playerInfo)
})
client.start()

