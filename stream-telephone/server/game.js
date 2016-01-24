
var {EventEmitter} = require('events')
class Game extends EventEmitter {
  constructor(gameName, hostIp, hostPort) {
    super()
    this.gameName = gameName
    this.hostIp = hostIp
    this.hostPort = hostPort
    const hostPlayer = {playerName: this.gameName + ' Host', ip: this.hostIp, port: this.hostPort}
    this.chain = [hostPlayer]
    process.nextTick(() => {
      this.emit('playerAdded', hostPlayer)
    })
  }
  getChain() {
    return this.chain
  }
  start() {
    this.emit('start')
  }
  stop() {
    this.emit('stop')
  }
  addPlayer(playerName, ip, port) {
    const np = {playerName, ip, port}
    const connectTo = this.chain[this.chain.length - 1]
    this.emit('source', playerName, connectTo)
    this.chain.push(np)
    this.emit('playerAdded', np)
  }
  addInfo(playerName, msg) {
    this.emit('info', playerName, msg)
  }
  removePlayer(playerName) {
    this.chain = this.chain.filter((c) => c.playerName !== playerName)
    for (var i = 1; i < this.chain.length; i++) {
      var connectTo = chain[i - 1]
      this.emit('source', chain[i].playerName, connectTo)
    }
    this.emit('resetPlayers', this.chain)
  }
}

module.exports = Game
