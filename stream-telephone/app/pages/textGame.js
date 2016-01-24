const React = require('react')
const {RaisedButton} = require('material-ui')


module.exports = React.createClass({
  getInitialState() {
    return {
      gameState: 'unknown',
      input: [],
      output: [],
      players: [],
      inputField: ""
    }
  },
  addPlayer(playerInfo) {
    this.setState({
      players: playerInfo.chain
    })
  },
  prepGame() {
    this.setState({
      gameState: 'waiting'
    })
    this.ws = new WebSocket('ws://localhost:3000/games/textGame')
    this.ws.onmessage = (event) => {
      let parsed = null
      try {
        parsed = JSON.parse(event.data)
      } catch (e) {
        console.log('failed to parse websocket json', e)
        return
      }

      this.handleWsEvent(parsed)
    }
  },
  handleWsEvent(event) {
    switch (event.type) {
      case "playerAdded":
        this.addPlayer(event.msg)
        break
      case "info":
        console.log('info from game', event.msg)
        break
      case "data":
        this.handleData(new Buffer(event.msg, 'base64'))
        break
      case "error":
        console.log('have an error', event.msg)
        break
      case "closeSink":
        console.log('the sink closed the connection')
        break
      case "resetPlayers":
        this.addPlayer(event.msg)
        break
    }
  },
  startGame() {
    this.setState({
      gameState: 'started'
    })
    this.ws.send(JSON.stringify({type: 'start', msg: {}}))
  },
  handleInputChange(event) {
    this.setState({
      inputField: event.target.value
    })
  },
  handleSubmit(event) {
    event.preventDefault()
    let toAppend = new Buffer(this.state.inputField, 'utf8')
    this.ws.send(JSON.stringify({type: 'data', msg: toAppend.toString('base64')}))
    this.setState({
      input: this.state.input.concat([this.state.inputField]),
      inputField: "",
    })
  },
  handleData(dataBuffer) {
    this.setState({
      output: this.state.output.concat([dataBuffer.toString("utf8")])
    })
  },
  render() {
    let buttons = <RaisedButton label="Prep Game" onTouchTap={this.prepGame} />
    let inputForm = null
    let inputText = null
    let outputText = null
    let playerInfoArea = null
    const gameState = this.state.gameState
    if (gameState === 'waiting') {
      buttons = <RaisedButton label="Start Game" onTouchTap={this.startGame} />
    }
    if (gameState === 'started') {
      inputForm = (
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Say in the telephone..." value={this.state.inputField} onChange={this.handleInputChange} />
        </form>
      )
      inputText = (
        <div>
          <h3>Input</h3>
          <textarea value={this.state.input.join("\n")} />
        </div>
      )
      outputText = (
        <div>
          <h3>Output</h3>
          <textarea value={this.state.output.join("\n")} />
        </div>
      )
      buttons = null
    }
    if (gameState === 'stated' || gameState === 'waiting') {
      playerInfoArea = this.state.players.map((player) => {
        console.log(player)
        return <div key={player.playerName}><span>{player.playerName},{player.ip},{player.port}</span></div>
      })
    }
    return (
      <div>
        <h1>Text Game</h1>
        {buttons}
        {inputForm}
        {inputText}
        {outputText}
        {playerInfoArea}
      </div>

    )
  }
})
