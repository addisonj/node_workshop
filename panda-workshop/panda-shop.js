
/*
require('babel/register')({
  ignore: function(filename) {
    var ignore = true
    if (filename.indexOf('panda-workshop') > -1 && filename.indexOf('node_modules') === -1) ignore = false
    if (filename.indexOf('exercises') > -1) ignore = false
    if (filename.indexOf('node_modules') === -1) ignore = false
    if (!ignore) {
      console.log('parsing', filename)
      return false
    }
    return true
  }
})
*/
var pandaShop = require('workshopper-adventure')({
    appDir      : __dirname
  , languages   : ['en']
  , header      : require('workshopper-adventure/default/header')
  , footer      : require('workshopper-adventure/default/footer')
})

pandaShop.addAll([
  'TRANSFORM_STREAM',
])

module.exports = pandaShop
