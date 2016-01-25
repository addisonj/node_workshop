"use strict"
const Exercise = require('workshopper-exercise')
const filecheck = require('workshopper-exercise/filecheck')
const execute = require('workshopper-exercise/execute')
const comparestdout = require('workshopper-exercise/comparestdout')
const babelProc = require('../babel-processor')
const fs = require('fs')
const path = require('path')
const os = require('os')
const mkdirp = require('mkdirp')

const fileContents = []
const words = ['hello', 'world', 'bad', 'cool', 'fat', 'hat', 'rat', 'racecar', 'fooseball', 'foot', 'foo', 'bar', 'food']
for (let i = 0; i < 100; i++) {
  fileContents.push(words[Math.floor(Math.random() * words.length)])
}

let exercise = Exercise()
exercise.longCompareOutput = true

exercise = filecheck(exercise)
exercise = babelProc(exercise)
exercise = execute(exercise)
exercise = comparestdout(exercise)

exercise.addSetup(function (mode, callback) {
  const testFile = path.join(os.tmpdir(), `panda-shop-${process.pid}`, 'transform_stream_input')
  mkdirp.sync(path.dirname(testFile))
  fs.writeFileSync(testFile, fileContents.join('\n'))
  this.submissionArgs.push(testFile)
  this.solutionArgs.push(testFile)
  process.nextTick(callback)
})


module.exports = exercise
