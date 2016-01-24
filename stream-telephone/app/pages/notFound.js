const React = require('react')
const page = require('page')
const {RaisedButton} = require('material-ui')

module.exports = React.createClass({
  navHome() {
    page('/')
  },
  render() {
    return (
      <div>
        <h1>There is nothing here...</h1>
        <RaisedButton onTouchTap={this.navHome} label="Go Home" />
      </div>
    )
  }
})
