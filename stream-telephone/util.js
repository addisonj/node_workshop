var ip = require('ip')
module.exports = {
  getIp() {
    return ip.address()
  }
}
