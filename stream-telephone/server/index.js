const express = require('express')
const serr = require('std-error')
const expressWs = require('express-ws')
const net = require('net')
const path = require('path')
const logger = require('morgan')

const Game = require('./game')
const util = require('../util')
const app = express()
const websocketApp = expressWs(app)

app.use(logger('dev'))
app.set('trust proxy', true)
app.use(express.static(path.join(__dirname, '../build')))
app.use(express.static(path.join(__dirname, '../app/public')))

const games = {}
let startPort = 8095
app.get('/games', (req, res, next) => {
  res.json({success: true, response: {games: Object.keys(games)}})
})

function wsJson(ws, jsonObj) {
  ws.send(JSON.stringify(jsonObj))
}

app.ws('/games/:gameName', (ws, req, next) => {
  let d = new Date()
  ws.on('close', () => {
    console.log('ws closed', new Date() - d)
  })
  const gameName = req.params.gameName
  if (games[gameName]) return next(new serr.BadParamter('Game name already used'))
  const gamePort = startPort++
  const game = new Game(gameName, util.getIp(), gamePort)
  console.log('starting new game ' + gameName)
  games[gameName] = game
  game.on('playerAdded', (newPlayerInfo) => {
    console.log('well hello', newPlayerInfo)
    wsJson(ws, {type: 'playerAdded', msg: {playerInfo: newPlayerInfo, chain: game.getChain()}})
  })
  game.on('resetPlayers', (chain) => {
    wsJson(ws, {type: 'resetPlayers', msg: {chain}})
  })
  game.on('info', (playerName, msg) => {
    wsJson(ws, {type: 'info', msg: {playerName, msg}})
  })
  game.on('start', () => {
    const curChain = game.getChain()
    const lastPlayer = curChain[curChain.length - 1]
    const client = net.connect({port: lastPlayer.port, host: lastPlayer.ip})
    console.log(lastPlayer)
    client.on('error', (err) => wsJson(ws, {type: 'error', msg: err}))
    client.on('data', (d) => wsJson(ws, {type: 'data', msg: d.toString('base64')}))
    client.on('close', () => {
      wsJson(ws, {type: 'closeSink', msg: {gameName}})
      console.log(`closing sink for game ${gameName}`)
    })
  })
  ws.on('message', (msg) => {
    let parsed = null
    try {
      parsed = JSON.parse(msg)
    } catch (e) {
      console.log('bad json', e)
      return
    }

    if (parsed.type === 'start') {
      game.start()
    }
  })
  const server = net.createServer((conn) => {
    let isOpen = true
    conn.on('close', () => isOpen = false)
    ws.on('message', (msg) => {
      let parsed = null
      try {
        parsed = JSON.parse(msg)
      } catch (e) {
        console.log('bad json', e)
        return
      }

      if (parsed.type === 'data' && isOpen) {
        conn.write(new Buffer(parsed.msg, "base64"))
      }
    })
  })
  server.listen(gamePort)
  next()
})
app.ws('/games/:gameName/player/:playerName', (ws, req, next) => {
  const gameName = req.params.gameName
  const playerName = req.params.playerName
  const port = req.query.port
  const game = games[gameName]
  console.log(`new player trying to connect to game ${gameName}`, !!game)
  if (!game) return next(new serr.NotFound('Invalid game name'))
  if (!port) return next(new serr.BadParamter('must define port as a query param'))
  console.log(`getting a new player for ${gameName}!`)
  const onSource = (forPlayer, sourceInfo) => {
    if (forPlayer === playerName) {
      wsJson(ws, {type: 'connectTo', msg: sourceInfo})
    }
  }
  game.on('source', onSource)
  game.addPlayer(playerName, req.ip.split(':').pop(), port)
  ws.on('message', (msg) => {
    let parsed = null
    try {
      parsed = JSON.parse(msg)
    } catch (e) {
      console.log('bad json', e)
      return
    }
    game.addInfo(playerName, parsed)
  })
  ws.on('close', () => {
    console.log('closed player ws', playerName)
    game.removePlayer(playerName)
    ws.removeAllListeners()
    game.removeListener('source', onSource)
  })
  next()
})
app.post('/games/:gameName/start', (req, res, next) => {
  const gameName = req.params.gameName
  const game = games[gameName]
  if (!game) return next(new serr.NotFound('Invalid game name'))
  game.start()
  res.json({success: true})
})
app.delete('/games/:gameName', (req, res, next) => {
  const gameName = req.params.gameName
  const game = games[gameName]
  if (!game) return next(new serr.NotFound('Invalid game name'))
  game.stop()
  setTimeout(() => delete games[gameName], 1000)
  res.json({success: true})
})
app.use((err, req, res, next) => {
  if (req.ws) {
    console.log('closing ws due to error', err)
    req.ws.close('error', err.message)
  }
  res.status(500).json({success: false, error: err})
})

app.listen(process.env.PORT || 3000, () => console.log(`listening on port ${process.env.PORT || 3000}`))
