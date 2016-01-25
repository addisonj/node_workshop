const fs = require('fs')
const path = require('path')
const {Transform} = require('stream')
const split = require('split')
const async = require('async')

const sourceDir = process.argv[2]
const outDir = process.argv[3]

class CSVToJson extends Transform {
  constructor() {
    super()
  }
  _transform(line, encoding, done) {
    const [name, city, state, age] = line.toString('utf8').split(',')
    this.push(JSON.stringify({name, city, state, age}))
    done()
  }
}
function processDirs(cb) {
  fs.readdir(sourceDir, (err, dates) => {
    if (err) return cb(err)
    async.map(dates, processDir, cb)
  })
}

function reduceFile(dateDir, cur, file, cb) {
  const jsonStream = fs.createReadStream(path.join(sourceDir, dateDir, file))
    .pipe(split())
    .pipe(new CSVToJson())
  jsonStream.on('data', (d) => {
    const parsed = JSON.parse(d)
    cur.count++
    cur.sum += parseInt(parsed.age, 10)
  })
  const fileStream = jsonStream.pipe(fs.createWriteStream(path.join(outDir, dateDir, file)))
  fileStream.on('close', () => {
    cb(null, cur)
  })
}

function processDir(dateDir, cb) {
  fs.readdir(path.join(sourceDir, dateDir), (err, files) => {
    if (err) return cb(err)
    fs.mkdir(path.join(outDir, dateDir), (err) => {
      if (err) return cb(err)
      async.reduce(files, {key: path.basename(dateDir), sum: 0, count: 0}, reduceFile.bind(null, dateDir), cb)
    })
  })
}


processDirs((err, aggregates) => {
  if (err) console.error(err)
  aggregates.sort((a, b) => a.key - b.key).map((agg) => {
    console.log(`${agg.key}: ${agg.sum / agg.count}`)
  })
})
