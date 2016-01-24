const React = require('React')
const ReactDom = require('react-dom')
const mui = require('material-ui')
const muiStyles = require('material-ui/lib/styles')
const {AppBar, IconMenu, MenuItem, IconButton, LeftNav, Paper} = mui
const {ThemeManager, Colors} = muiStyles
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme')
const injectTapEventPlugin = require('react-tap-event-plugin')
const Router = require('./router')
const routes = require('./routes')
const page = require('page')
injectTapEventPlugin()

const containerStyle = {
  textAlign: 'center',
  paddingTop: 200,
}

const Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState() {
    return {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
      open: false,
    }
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    }
  },

  handleNavToggle() {
    this.setState({open: !this.state.open})
  },

  navTextGame() {
    this.setState({open: !this.state.open})
    page('/text')
  },


  render() {

    return (
      <Router routes={routes}>
        <AppBar
          title="Stream Telephone"
          onLeftIconButtonTouchTap={this.handleNavToggle}
        >
        </AppBar>
        <LeftNav open={this.state.open}>
          <MenuItem primaryText="Text" onTouchTap={this.navTextGame} />
          <MenuItem primaryText="Video" />
        </LeftNav>
      </Router>
    )
  }
})

ReactDom.render(<Main />, document.getElementById('main'))
