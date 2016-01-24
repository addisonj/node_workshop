const WS = require('ws')
const {EventEmitter} = require('events')

class TelephoneClient extends EventEmitter {
  constructor(hostOpts, gameName, playerName, port) {
    super()
    this.wsUrl = `ws://${hostOpts.host || 'localhost'}:${hostOpts.port || 3000}/games/${gameName}/player/${playerName}?port=${port}`
  }
  start() {
    this.started = true
    this.connect()
  }
  stop() {
    this.started = false
    if (this.ws) this.ws.close()
  }
  connect() {
    if (this.started) {
      this.ws = new WS(this.wsUrl)
      this.ws.on('open', () => this.emit('ready'))
      this.ws.on('error', (err) => {
        console.error('error from ws', err)
        console.error('will reconnect in a bit')
        setTimeout(this.connect.bind(this), 5 * 1000)
      })
      this.ws.on('message', this.onMessage.bind(this))
      this.ws.on('close', () => {
        console.log('ws closed')
        console.log('will reconnect in a bit')
        setTimeout(this.connect.bind(this), 5 * 1000)
      })
    }
  }
  onMessage(msg) {
    const message = this.parseMessage(msg)
    if (!message) return
    this.emit(message.type, message.msg)
  }
  parseMessage(msg) {
    let parsed = null
    try {
      parsed = JSON.parse(msg)
    } catch (e) {
      this.emit('error', e)
      return
    }
    return parsed
  }
  static getPort() {
    return 8150 + Math.round(Math.random() * 100)
  }
}

module.exports = TelephoneClient

