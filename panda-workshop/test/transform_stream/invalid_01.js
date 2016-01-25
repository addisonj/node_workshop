const fs = require('fs')

fs.readFileSync(process.argv[2]).pipe(process.stdout)
