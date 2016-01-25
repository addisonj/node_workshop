"use strict"
const Exercise = require('workshopper-exercise')
const filecheck = require('workshopper-exercise/filecheck')
const execute = require('workshopper-exercise/execute')
const comparestdout = require('workshopper-exercise/comparestdout')
const babelProc = require('../babel-processor')
const through2 = require('through2')
const net = require('net')
const faker = require('faker')
const WSStream = require('websocket-stream')
const _ = require('lodash')

function genLog() {
  return faker.lorem.sentence()
}

let exercise = Exercise()
exercise.longCompareOutput = true

exercise = filecheck(exercise)
exercise = babelProc(exercise)
exercise = execute(exercise)


function testClient(apiPort, logPort, outputStream, cb) {
  const ws = new WSStream(`ws://localhost:${apiPort}/log/localhost/${logPort}`)
  ws.pipe(outputStream)
  setTimeout(function() {
    ws.end()
  }, 1000)
  cb()
}

function testParts(mode, cb) {
  const self = this
  testClient(this.submissionPort, this.submissionServerPort, this.submissionStdout, function(err) {
    if (err) return cb()
    if (mode !== 'verify') return cb()
    testClient(self.solutionPort, self.solutionServerPort, self.solutionStdout, cb)
  })
}

exercise.addProcessor(function(mode, cb) {
  this.submissionStdout.pipe(process.stdout)

  // replace stdout with our own streams
  this.submissionStdout = through2()
  if (mode === 'verify') {
    this.solutionStdout = through2()
  }

  setTimeout(function() {
    testParts.bind(this)(mode, function(err) {
      if (err) return cb(err)
      cb(null, true)
    })
  }.bind(this), 500)

})

exercise = comparestdout(exercise)

function randPort() {
  return 8200 + Math.floor(Math.random() * 100)
}

function createServerListener(listenPort, stream, logs) {
  const server = net.createServer(function(conn) {

    logs.forEach(function(log) {
      conn.write(log + '\n')
    })
    // give a bit of timeout before killing this
    setTimeout(function() {
      conn.end()
      server.close()

    }, 1000)
  }).listen(listenPort, function() {
    console.log('started server on ' + listenPort)
  })
}

exercise.addSetup(function(mode, cb) {
  this.submissionPort = randPort()
  this.solutionPort = this.submissionPort + 1
  this.submissionServerPort = this.solutionPort + 1
  this.solutionServerPort = this.submissionServerPort + 1

  const logs = _.fill(new Array(50), 1).map(genLog)
  this.submissionServer = createServerListener(this.submissionServerPort, this.submissionServerStdout, logs)
  if (mode === 'verify') {
    this.solutionServer = createServerListener(this.solutionServerPort, this.solutionServerStdout, logs)
  }
  this.submissionArgs = [ this.submissionPort ]
  this.solutionArgs = [ this.solutionPort ]

  // wait a bit for the servers to start
  setTimeout(cb, 250)
})



module.exports = exercise
