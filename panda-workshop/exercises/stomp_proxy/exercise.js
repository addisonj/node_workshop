"use strict"
const Exercise = require('workshopper-exercise')
const filecheck = require('workshopper-exercise/filecheck')
const execute = require('workshopper-exercise/execute')
const comparestdout = require('workshopper-exercise/comparestdout')
const babelProc = require('../babel-processor')
const through2 = require('through2')
const net = require('net')
const Frame = require('stompjs').Frame

const clientFrames = [
  Frame.marshall("SUBSCRIBE", {destination: "foo"}, "1234"),
  Frame.marshall("SEND", {destination: "foo"}, "1234"),
  Frame.marshall("SUBSCRIBE", {destination: "heyYou/guys"}, "1234"),
  Frame.marshall("SEND", {destination: "heyYou/guys"}, JSON.stringify({can: "you", hande: "json"}))
]

const serverFrames = [
  Frame.marshall("MESSAGE", {destination: "foo"}, "plaintext message"),
  Frame.marshall("MESSAGE", {destination: "heyYou/guys"}, JSON.stringify({some: "message", some: "key"}))
]

let exercise = Exercise()
exercise.longCompareOutput = true

exercise = filecheck(exercise)
exercise = babelProc(exercise)
exercise = execute(exercise)


function testClient(port, outputStream, cb) {
  const conn = net.connect({port: port}, function() {
    conn.pipe(outputStream)
    clientFrames.forEach(function(frame) {
      conn.write(frame)
    })

    cb()
  })
}

function testParts(mode, cb) {
  const self = this
  testClient(this.submissionPort, this.submissionStdout, function(err) {
    if (err) return cb()
    if (mode !== 'verify') return cb()
    testClient(self.solutionPort, self.solutionStdout, cb)
  })
}

exercise.addProcessor(function(mode, cb) {
  this.submissionStdout.pipe(process.stdout)

  // replace stdout with our own streams
  this.submissionStdout = through2()
  this.submissionServerStdout.pipe(this.submissionStdout)
  if (mode === 'verify') {
    this.solutionStdout = through2()
    this.solutionServerStdout.pipe(this.solutionStdout)
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

function createServerListener(listenPort, stream) {
  net.createServer(function(conn) {
    conn.pipe(stream)
    serverFrames.forEach(function(frame) {
      conn.write(frame)
    })
    // give a bit of timeout before killing this
    setTimeout(function() {
      conn.end()
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
  this.submissionServerStdout = through2()
  this.submissionServer = createServerListener(this.submissionServerPort, this.submissionServerStdout)
  if (mode === 'verify') {
    this.solutionServerStdout = through2()
    this.solutionServer = createServerListener(this.solutionServerPort, this.solutionServerStdout)
  }
  this.submissionArgs = [ this.submissionServerPort, this.submissionPort ]
  this.solutionArgs = [ this.solutionServerPort, this.solutionPort ]

  // wait a bit for the servers to start
  setTimeout(cb, 250)
})


module.exports = exercise
