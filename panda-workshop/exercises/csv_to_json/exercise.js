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
const faker = require('faker')
const moment = require('moment')
const _ = require('lodash')
const async = require('async')
const rimraf = require('rimraf')
const glob = require('glob')

const testDir = path.join(os.tmpdir(), `panda-shop-${process.pid}`, 'csv_to_json_input')
const subResDir = path.join(os.tmpdir(), `panda-shop-${process.pid}`, 'csv_to_json_sub')
const solResDir = path.join(os.tmpdir(), `panda-shop-${process.pid}`, 'csv_to_json_sol')

function genRecord() {
  return faker.fake(`{{name.firstName}} {{name.lastName}},{{address.city}},{{address.state}},${Math.round(Math.random() * 100)}`)
}
const filesToWrite = []
const startDate = moment(new Date(2016, 0, 1))
for (let i = 0; i < 5; i++) {
  const datePrefix = startDate.clone().add(i, 'days').format('YYYYMMDD')
  for (let j = 0; j < 5; j++) {
    const filename = `${datePrefix}/${_.padStart(j, 5, '0')}.csv`
    const contents = _.fill(new Array(50), 1).map(genRecord)
    filesToWrite.push({filename: filename, contents: contents.join('\n')})
  }
}

let exercise = Exercise()
exercise.longCompareOutput = true

exercise = filecheck(exercise)
exercise = babelProc(exercise)
exercise = execute(exercise)
exercise = comparestdout(exercise)

exercise.addSetup(function(mode, cb) {
  const self = this
  mkdirp.sync(testDir)
  mkdirp.sync(subResDir)
  mkdirp.sync(solResDir)
  async.each(filesToWrite, function(toWrite, cb) {
    mkdirp(path.join(testDir, path.dirname(toWrite.filename)), function(err) {
      if (err) return cb(err)
      fs.writeFile(path.join(testDir, toWrite.filename), toWrite.contents, cb)
    })
  }, function(err) {
    self.submissionArgs.push(testDir, subResDir)
    self.solutionArgs.push(testDir, solResDir)
    cb()
  })
})

function statAllFiles(dirToCheck, cb) {
  glob(`${dirToCheck}/**/*`, {}, function(err, files) {
    if (err) return cb(err)
    async.map(files, fs.stat, cb)
  })
}
exercise.addVerifyProcessor(function(cb) {
  // just compare stats
  const self = this
  statAllFiles(subResDir, function(err, subRes) {
    if (err) return cb(err)
    statAllFiles(solResDir, function(err, solRes) {
      if (err) return cb(err)
      if (solRes.length !== subRes.length) return cb(null, false)
      for (var i = 0; i < solRes.length; i++) {
        const solFile = solRes[i]
        const subFile = subRes[i]
        if (solFile.size !== subFile.size) return cb(null, false)
      }
      cb(null, true)
    })
  })
})

exercise.addCleanup(function(mode, passed, cb) {
  async.each([testDir, subResDir, solResDir], rimraf, cb)
})

module.exports = exercise
