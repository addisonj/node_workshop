const React = require('react')
const page = require('page')

const Router = React.createClass({

  componentDidMount() {
    this.props.routes.forEach((route) => {
      var [url, Component] = route

      page(url, (ctx) => {
        this.setState({
          component: <Component params={ctx.params} querystring={ctx.querystring} />
        })
      })

    })
    page({hashbang:true})
    page.start()
  },

  getInitialState() {
    return { component: <div /> }
  },

  render() {
    return (
      <div>
        {this.props.children}
        {this.state.component}
      </div>
    )
  }

})

module.exports = Router
