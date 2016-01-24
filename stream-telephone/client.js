const WS = require('ws')
const net = require('net')

const startPort = 8195
const ws = new WS(`ws://localhost:3000/games/textGame/player/someGuy?port=${startPort}`)

const {Transform} = require('stream')

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
ws.on('close', (...args) => {
  console.log('it closed', ...args)
})
ws.on('error', (err) => {
  console.log(err)
})
ws.on('open', () => {
  console.log('it opened')
  const server = net.createServer()
  server.listen(startPort, () => console.log(`listening on port ${startPort}`))
  ws.send(JSON.stringify({type: 'info', msg: 'get through'}))
  ws.on('message', (msg) => {
    let parsed = null
    console.log('msg', msg)
    try {
      parsed = JSON.parse(msg)
    } catch (e) {
      console.log('bad json', msg, e)
      return
    }

    if (parsed.type === 'connectTo') {
      makeStream(server, parsed.msg)
    }
  })
})


