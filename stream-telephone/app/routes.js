const Default = require('./components/default')
const PageNotFound = require('./pages/notFound')
const TextGame = require('./pages/textGame')
module.exports = [
  ['/', Default],
  ['/text', TextGame],
  ['*', PageNotFound]
]
