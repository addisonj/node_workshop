
# Node Glue
## Tying Your Backend Together

---

### What We Will Cover

* how node works and the strengths and downsides that go with it (15 minutes)
* some discussion on the type of tasks that make node a good 'glue' language (10 minutes)
* how to write node code that isn't horrible (10 minutes)
* get familiar with some node features that will make you more productive (45 minutes)
* have fun by playing a game of telephone (30 minutes)

---

### What is Node

> Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.

> Node.js' package ecosystem, npm, is the largest ecosystem of open source libraries in the world.


----

### Okay... How about a picture

![Node Diagram](./images/node-diagram.png)


----

### Understanding the Event Loop

The 'secret sauce' of node is the event loop, the event loop:
```
while there are still events to process:
    e = get the next event
    if there is a callback associated with e:
        call the callback
```

Remember! *V8 is single threaded, so if you do things that 'block' that event loop (computation), you can't service events*

----

### Know Your History (Events)

None of the things Node does are new. Evented systems have been around forever, but the history matters:

- JS got designed and written in a week or two... so no one ever throught about threads
- JS devs figured out ways around it by doing everything with events (and it sucked)
- JS got really fast because the web exploded and V8 was made open source
- Nginx got popular and showed event loops were awesome (but it took low level C)
- Python got twisted and ruby got event machine (but they sucked, because threads were too entrenched)

----

### The Right Ingredients

- V8 was really fast and easily extensible
- Evented systems were cool
- JS was always single threaded so there was only a single metaphor

It is not that Node was new, but it was the first runtime to make evented systems accessible and that is a big deal

---

### The Ups and Downs of Node

Like all runtimes, Node has its strengths and weaknesses.

But... Node takes it to the extreme

----

### Completely I/O Bound Workloads

Suppose you run into this problem:

> We just rewrote *big core service* and it turns out *old janky service* depends on some old headers and different formatted routes...

We could change our new pristine service... or...

```JavaScript
app.post('/old/janky/route/:params', function(req, res, next) {
  res.header('stupid-required-header', '1234')
  var proxy = request({url: `http://new-hotness/${req.params.params}`, method: 'post})
  req.pipe(proxy).pipe(res)
})
```

And keep your new code cleaner while having a concise really fast way to shim the compatibility

----

### Lots of things are *mostly* I/O Bound

- Moving files around? √
- DB CRUD? √
- Computing Pi? x

![IO Cost](./images/io-cost.png)

----

### Streams

One of the other huge benefits of Node is its *streams* API. They are kinda like unix pipes, so you can read, write, filter, and transform data easily in a chainable way.

An example of how to encrypt a text file

```JavaScript
const fs = require('fs')
const crypto = require('crypto')
const mySecretKey = new Buffer('super secret password')
fs.createReadStream('large-file.txt')
  .pipe(crypto.createCipher('aes-256-cbc', mySecretKey))
  .pipe(fs.createWriteStream('large-file.encryp'))


```

Streams are a really powerful abstraction that are fast and efficient. Regardless of the size of the source file, the code above will be able to handle it without issue as it will only keep a small window of the data in memory.

----

### Other Benefits

- Crazy huge module system (seriously large)
- Super easy to get started writing code (interpreted languages ftw!)
- Easy to work with JSON
- Easy to dynamically include other code
- Lots of fancy new ideas in the community

----

### The Pain Of Single Threaded-ness

These few lines of code will break any node app:

```JavaScript
function randToThousand() {
  let total = 0
  while (total < 1000) {
    total += Math.random() * Math.random()
  }
  return total
}
setInterval(() => console.log(randToThousand()), 1000)
```

----

### Another Bad Idea

```JavaScript
// cache this huge file
var cache = fs.readFileSync('bigFile.txt')
// reread it every minute to keep it up to date
setInterval(() => {
  cache = fs.readFileSync('bigFile.txt')
}, 60 * 1000)
...
app.get('cachedData', (req, res) => res.send(cache))
```

----

### Even More Bad Ideas

```JavaScript
app.get('/largeJsonResponse', (req, res, next) => {
  // this can return 50000 rows
  db.query('select * from large_table', (err, dbResp) => {
    var summedRows = dbResp.map((row) => row.reduce((a, b) => a + b), 0)
    res.json(summedRows)
  })
})
```

----

### Not All Things are I/O bound

And if you aren't careful, throwing in too many CPU bound things can really blow your system up.

And not just a single request, or a single API route, but everything. It can be really, *really*, bad.


----

### Workarounds

- First... if you know you are doing something CPU bound, ask yourself if Node is the right tool
  * I really like Node, its my 'go-to' for quick hacky things, but I am honest where it sucks
- If it really is only a few CPU bound things, then your options:
  * Get the computation into another process either via a sub process or native modules (they can have threads)
  * If you can stop and continue computation, you can use timeouts to let the event loop run

----

### Other Bad Things

- It is Javascript...
  * Once again, I like JS, but my limit for a single untpyed (backend) codebase is about 1000 lines, so either split it up or use a typed language
- Too many modules
  * The reason npm is huge is because it made it really easy to push code, this is a double edged sword... some people should not write libraries
- Very fast moving
  * Node is definitely a *stable* platform, but the community around it can move really fast, which can be hard to keep up with

---

### Where to Apply Node Glue

Now that we know a bit about Node, lets look at some use cases and discuss why Node is a decent choice

(Solutions to this won't be given... that will be your job later on!)

----

### Moving And Munging Data

- We have around 2,500 CSVs grouped into folders by date going back about 1 year
- Each file is about 50mb that we want to transform to newline delimited JSON
- For each day, we want to compute to average of a few of the fields

For this much data, we don't want to process one at a time. Instead of thread pools and tracking state,
we can just issue a lot of reads and writes that will mostly saturate the disk without having to deal with threads.

----

### Proxy Simple TCP Protocol

- A third party app use the STOMP protocol, which is a plaintext queueing protocol
- A new queue backend is being implemented, which doesn't support the same naming scheme for routing messages
- We need to implement a proxy that rewrites the queue names (topics) between the server and the client

Node has really good TCP support. Node also has a ton of modules, one of which, is a STOMP parser. It async nature also makes it
adept at handling lots of long running TCP connections, even if they are idle.

----

### Add Some Realtime-ness

- We have a web dashboard for our job server cluster
- It would be sweet to have logs for a given host and job in realtime
- The logs are sent via a TCP server that we can listen in on

Node pretty much got its name by doing realtime web stuff like websockets. It also makes creating quick one off APIs really easy.

---

### Quick tips on writing maintainable node

Callback hell is the biggest complaint of most people new to node. But with a few strategies and some practice, its really easy to avoid!

----

### How to know when you are in callback hell

```JavaScript
var roomsApi = require('./locationApi')
function bookEmptyRooms(userName, cb) {
  roomsApi.index((err, rooms) => {
    if (err) return cb(err)
    var results = []
    var count = 0
    rooms.forEach((room) => {
      roomApi.getInfo(room, (err, info) => {
        if (err) return cb(err)
        if (info.isFree) {
          roomApi.reserve(room, userName, (err, booking) => {
            if (err) return cb(err)
            results.push({room: room, status: 'reserved', record: booking})
            count++
            if (count === rooms.length) {
              cb(null, results)
            }
          })
        } else {
          roomApi.waitlist(room, userName, (err, waitlist) => {
            if (err) return cb(err)
            results.push({room: room, status: 'waitlist', record: waitlist})
            count++
            if (count === rooms.length) {
              cb(null, results)
            }
          })
        }
      })
    })
  })
}
```

----

### Tip One: Avoid if/else with callbacks

```JavaScript
var roomsApi = require('./locationApi')
function bookEmptyRooms(userName, cb) {
  roomsApi.index((err, rooms) => {
    if (err) return cb(err)
    var results = []
    var count = 0
    rooms.forEach((room) => {
      roomApi.getInfo(room, (err, info) => {
        if (err) return cb(err)
        var bookingCall = info.isFree ? roomApi.reserve : roomApi.waitlist
        var recordStatus = info.isFree ? 'reserved' : 'waitlist'
        bookingCall(room, userName, (err, record) => {
          if (err) return cb(err)
          results.push({room: room, status: recordStatus, record: record})
          count++
          if (count === rooms.length) {
            cb(null, results)
          }
        })
      })
    })
  })
}
```

----

### Tip Two: Break out anonymous functions

```JavaScript
var roomsApi = require('./locationApi')
function bookOrWaitlist(room, userName, cb) {
  roomApi.getInfo(room, (err, info) => {
    if (err) return cb(err)
    var bookingCall = info.isFree ? roomApi.reserve : roomApi.waitlist
    var recordStatus = info.isFree ? 'reserved' : 'waitlist'
    bookingCall(room, userName, (err, record) => {
      if (err) return cb(err)
      cb(null, {room: room, status: recordStatus, record: record})
    })
  })
}
function bookEmptyRooms(userName, cb) {
  roomsApi.index((err, rooms) => {
    if (err) return cb(err)
    var results = []
    var count = 0
    rooms.forEach((room) => {
      bookOrWaitlist(room, userName, (err, res) => {
        if (err) return cb(err)
        results.push(res)
        count++
        if (count === rooms.length) {
          cb(null, results)
        }
      })
    })
  })
}
```

----

### Tip Three: Use a control flow lib

```JavaScript
var roomsApi = require('./locationApi')
var async = require('async')
function bookOrWaitlist(room, userName, cb) {
  roomApi.getInfo(room, (err, info) => {
    if (err) return cb(err)
    var bookingCall = info.isFree ? roomApi.reserve : roomApi.waitlist
    var recordStatus = info.isFree ? 'reserved' : 'waitlist'
    bookingCall(room, userName, (err, record) => {
      if (err) return cb(err)
      cb(null, {room: room, status: recordStatus, record: record})
    })
  })
}
function bookEmptyRooms(userName, cb) {
  roomsApi.index((err, rooms) => {
    if (err) return cb(err)
    async.map(rooms, (room, cb) => {
      bookOrWaitlist(room, userName, cb)
    }, cb)
  })
}
```

----

### Tip Four: Reorder parameters to make use of bind

```JavaScript
var roomsApi = require('./locationApi')
var async = require('async')
function bookOrWaitlist(userName, room, cb) {
  roomApi.getInfo(room, (err, info) => {
    if (err) return cb(err)
    var bookingCall = info.isFree ? roomApi.reserve : roomApi.waitlist
    var recordStatus = info.isFree ? 'reserved' : 'waitlist'
    bookingCall(room, userName, (err, record) => {
      if (err) return cb(err)
      cb(null, {room: room, status: recordStatus, record: record})
    })
  })
}
function bookEmptyRooms(userName, cb) {
  roomsApi.index((err, rooms) => {
    if (err) return cb(err)
    async.map(rooms, bookOrWaitlist.bind(null, userName), cb)
  })
}
```

---

### Enough Talk!

`npm install -g panda-shop`

---

### Telephone!

`npm install -g stream-telephone-client`


