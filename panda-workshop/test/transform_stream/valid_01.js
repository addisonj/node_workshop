const fs = require('fs')
const {Transform} = require('stream')

class FooToBar extends Transform {
  constructor() {
    super()
  }
  _transform(chunk, encoding, done) {
    let toChange = chunk
    if (encoding === 'buffer') {
      toChange = chunk.toString('utf8')
    }
    const replaced = toChange.replace(/foo/g, "bar")
    const res = encoding === 'buffer' ? new Buffer(replaced, "utf8") : replaced

    this.push(res)
    done()
  }
}

const readableStream = fs.createReadStream(process.argv[2])
readableStream.pipe(new FooToBar()).pipe(process.stdout)

