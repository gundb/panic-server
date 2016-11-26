<img alt='PANIC' width='500px' src='./panic-logo.jpg'></img>

[![Travis branch](https://img.shields.io/travis/PsychoLlama/panic-server/master.svg?style=flat-square)](https://travis-ci.org/PsychoLlama/panic-server)
[![npm](https://img.shields.io/npm/dt/panic-server.svg?style=flat-square)](https://www.npmjs.com/package/panic-server)
[![npm](https://img.shields.io/npm/v/panic-server.svg?style=flat-square)](https://www.npmjs.com/package/panic-server)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.svg?style=flat-square)](https://gitter.im/amark/gun)

> **TL;DR:**<br />
A remote control for browsers and servers.

Panic is an end-to-end testing framework, designed specifically for distributed systems and collaborative apps.

## Why
At [gunDB](http://gun.js.org/), we're building a real-time, distributed JS database.

We needed a testing tool that could simulate complex scenarios, and programmatically report success or failure. For instance, how would you write this test?

1. Start a server.
2. Spin up two browsers, each syncing with the server.
3. Save data on just one browser.
4. Assert that it replicated to the other.

And that's just browser to browser replication. What about simulating app failures?

1. Start a server.
2. Start two browsers, each synced with the server.
3. Save some initial data.
4. Kill the server, and erase all it's data.
5. Make conflicting edits on the browsers.
6. Start the server again.
7. Assert both conflicting browsers converge on a value.

That's why we built panic.

## How it works
Well, there are two repos: `panic-server`, and [`panic-client`](https://github.com/gundb/panic-client/).

You'll start a panic server (sometimes called a coordinator), then you'll connect to it from panic clients.

Loading the client software into a browser or Node.js process exposes the mother of all XSS vulnerabilities. Connect it to the coordinator, then it'll have full control over your process.

That's where panic gets its power. It remotely controls every client and server in your app.

Now obviously, due to those vulnerabilities, you wouldn't want panic in user-facing code. Hang on, lemme make this bigger...

### DO NOT USE PANIC IN USER-FACING CODE.

Well, unless running `eval` on arbitrary code is an app feature.

Cool, so we've covered the "why" and the "how it works". Now onto the API!

## API
> If you're massively bored by documentation and just wanna copy/paste working code, well, [happy birthday](#scaffolding).

### Clients
A client is an instance of `panic.Client`, and represents another computer or process connected through websockets.

#### Properties
Every client has some properties you can use, although you probably won't need to.

##### `.socket`
References the [`socket.io`](http://socket.io/) interface connecting you to the other process. Unless you're developing a plugin, you'll probably never need to use this.

##### `.platform`
This references the [`platform.js`](https://github.com/bestiejs/platform.js/) object. It's sent as part of the handshake by [`panic-client`](https://github.com/gundb/panic-client/).

#### Methods
Right now there's only one, but it's where the whole party's at!

##### `.run()`
Sends code to execute on the client.

It takes two parameters:

1. The function to execute remotely.
2. Optionally, some variables to send with it.

This is by far the weirdest part of panic. Your function is run, but not in the same context, not even in the same process, maybe a different JS environment and OS entirely.

It's stringified, sent to the client, then evaluated in a special job context.

```js
console.log('This runs in your process.')

client.run(function () {
  console.log("This doesn't.")
})
```

Some of the common confusion points:

- You can't use any variables outside your function.
- That includes other functions.
- If the client is a browser, obviously you won't have `require` available.
- The client might have different packages or package versions installed.

Bottom line, your code is run on the client, not where you wrote it.

Inside the function, you've got access to the whole [`panic-client` API](https://github.com/gundb/panic-client/#api).

Because your function can't see any local scope variables, anything the function depends on needs to be sent with it. That's our second parameter, `props`.

**Example**
```js
var clientPort = 8085

client.run(function () {
  var http = require('http')
  var server = new http.Server()

  // The variable you sent.
  var port = this.props.port

  server.listen(port)
}, {

  // Sends the local variable
  // as `props.port`.
  port: clientPort
})
```

Careful though, any props you send have to be JSON compatible. It'll crash if you try to send a circular reference.

###### Return values
So, we've showed how values can be sent to the client, but what about getting values back?

Prepare yourself, this is pretty awesome.

`.run` returns a promise. Any return value from the client will be the resolve value. For instance:

```js
client.run(function () {
  var ip = require('ip')
  return ip.address()
}).then(function (ip) {

  // The address of the other machine
  console.log(ip)
})
```

> For more details on return values and edge cases, read the panic client [API](https://github.com/gundb/panic-client/#api).

So, if one of your clients is a node process...

```js
function sh () {
  var child = require('child_process')
  var spawn = child.spawnSync

  var cmd = this.props.cmd
  var args = this.props.args

  var result = spawn(cmd, args || [])

  return result.stdout
}

client.run(sh, {
  cmd: 'ls',
  args: ['-lah']
}).then(function (dir) {
  var output = dir.toString('utf8')
  console.log(output)
})
```

Tada, now you have SSH over node.

> If you're into node stuff, you probably noticed `result.stdout` is a Buffer. That's allowed, since socket.io has first-class support for binary streams. Magical.

###### Errors
What's a test suite without error reporting? I dunno. I've never seen one.

If your job throws an error, you'll get the message back on the server:

```js
client.run(function () {
  throw new Error(
   'Hrmm, servers are on fire.'
  )
}).catch(function (error) {
  console.log(error)
  /*
  {
   message: 'Hrmm, servers...',
   source: `function () {
     throw new Error(
      'Hrmm, servers are on fire.'
     )
   }`,
   platform: {} // platform.js
  }
  */
})
```

As you can see, some extra debugging information is attached to each error.

- `.message`: the error message thrown.
- `.source`: the job that failed.
- `.platform`: the platform it failed on, courtesy of platform.js.

However, due to complexity, stack traces aren't included. `eval` and socket.io make it hard to parse. Maybe in the future.

#### `.matches()`
Every client has a [`platform`](https://github.com/gundb/panic-server#platform) property. The `matches` method allows you to query it.

This is useful when filtering a group of clients, or ensuring you're sending code to the platform you expect.

> You probably won't use this method directly. However, it's used heavily by the `ClientList#filter` method to select platform groups, which passes through to the `.matches()` API.

When passed a platform expression (more on this in a second), `.matches` returns a boolean of whether the client's platform satisfies the expression.

For example, this code is asking if the platform name matches the given regex:

```js
// Is this client a Chrome or Firefox browser?
client.matches(/(Chrome|Firefox)/)
```

To be more specific, you can pass the exact string you're looking for:

```js
// Is this a Node.js process?
client.matches('Node.js')
```

Though as you can imagine, there's more to a platform than it's name. You can see the full list [here](https://github.com/bestiejs/platform.js/tree/master/doc).

More complex queries can be written by passing an object with more fields to match.

```javascript
// Is the client a Node.js process running
// on 64-bit Fedora?
clients.matches({
  name: 'Node.js',
  os: {
    architecture: 64,
    family: 'Fedora',
  },
})
```

If you crave more power, you can use regular expressions as the field names.

```js
// Is this an ether Opera Mini or an
// IE browser running on either Mac
// or Android?
client.matches({
  name: /(Opera Mini|Internet Explorer)/,

  os: {
    family: /(OS X|Android)/,
  },
})
```

Only the fields given are matched, so you can be as specific or as loose as you want to be.

### Lists of clients
Often, you're working with groups of clients. Like, only run this code on IE, or only on Node.js processes.

That's where dynamic lists come in. Declaratively, you describe what the list should contain, and panic keeps them up to date.

#### `panic.clients`
This is the top-level reactive list, containing every client currently connected. As new clients join, they're added to this list. When disconnected, they're removed.


##### Events
Every list of clients will emit these events.

###### `"add"`
Fires when a new client is added to the list.

It'll pass both the `Client` and the socket ID.

```js
clients.on('add', function (client, id) {
  console.log('New client:', id)
})
```

###### `"remove"`
Basically the same as `"add"`, just backwards.

```js
clients.on('remove', function (client, id) {
  console.log('Client', id, 'left.')
})
```

#### `panic.ClientList`
Every list is an instance of `ClientList`. You can manually create a new lists, but generally you won't need to.

It's most useful for creating a new reactive list as the union of others. For example:

```js
var explorer = clients.filter('Internet Explorer')
var opera = clients.filter('Opera Mini')

var despicable = new ClientList([
  explorer,
  opera,
])
```

In the example above, any new clients added to either `explorer` or `opera` will make it into the `despicable` list.

All clients are deduplicated automatically.

If you don't pass an array, you're left with a sad, empty client list.

#### `ClientList` API

**Table of Contents**
 - [`.filter()`](#filter)
 - [`.excluding()`](#excluding)
 - [`.pluck()`](#pluck)
 - [`.atLeast`](#at-least)
 - [`.run()`](#run)
 - [`.length`](#length)
 - [`.get()`](#get)
 - [`.add()`](#add)
 - [`.remove()`](#remove)
 - [`.each()`](#each)
 - [`.chain()`](#chain)

##### <a name='filter'></a> `.filter(query)`
Creates a new list of clients filtered by their platform.

For simpler queries, you can select via string or regular expression, which is matched against the `platform.name`:

```js
// Selects all the chrome browsers.
var chrome = clients.filter('Chrome')

// Selects all firefox and chrome browsers.
var awesome = clients.filter(/(Firefox|Chrome)/)
```

You can also do more complex queries by passing an object. Refer to the `Client#matches` API to see more examples.

If you're looking for something really specific, you can filter by passing a callback, which functions almost exactly like [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

```javascript
var firefox = clients.filter(function (client, id, list) {
  // `id`: The unique client id
  // `list`: The parent list object, in this case `clients`

  var platform = client.platform;

  /*
   This query only adds versions of
   Firefox later than version 36.
  */
  if (platform.name === 'Firefox' && platform.version > '36') {
   // add this client to the new list
   return true;
  } else {
   // leave the client out of the new list
   return false;
  }
});
```

To make things cooler, you can chain filters off one another. For example, the above query only allows versions of firefox after 36. You could write that as two queries composed together...

```javascript
// The list of all firefox clients.
var firefox = clients.filter('Firefox')

// The list of firefox newer than version 36.
var firefoxAfter36 = firefox.filter(function (client) {
  var version = client.platform.version
  var major = version.split('.')[0]

  return Number(major) > 36;
});
```

As new clients are added, they'll be run through the firefox filters, and if added, will be run through the version filter. The dynamic filtering process allows for some cool RxJS style code.

##### <a name='excluding'></a> `.excluding(ClientList)`
You can also create lists that exclude other lists, like a list of browsers might be anything that isn't a server, or perhaps you want to exclude all Chrome browsers from a list. You can do that with `.excluding`.

```javascript
// create a dynamic list of all node.js clients
var servers = clients.filter('Node.js')

// the list of all clients,
// except anything that belongs to `servers`.
var browsers = clients.excluding(servers)
```

Like filter, you can chain queries off each other to create really powerful queries.

```javascript
// using `browsers` from above
var chrome = browsers.filter('Chrome')
var notChrome = browsers.excluding(chrome)
```

##### <a name='pluck'></a> `.pluck(Number)`
`.pluck` restricts the list length to a number, reactively listening for changes to ensure it's as close to the maximum as it can be. An excellent use case for `.pluck` is singling out clients of the same platform. This becomes especially powerful when paired with [`.excluding`](#excluding) and the `ClientList` constructor. For example, if you want to control 3 clients individually, it might look like this:

```javascript
var clients = panic.clients
var List = panic.ClientList

// grab one client from the list
var alice = clients.pluck(1)

// grab another, so long as it isn't alice
var bob = clients
.excluding(alice)
.pluck(1)

// and another, so long as it isn't alice or bob
var carl = clients
.excluding(
  new List([ alice, bob ])
)
.pluck(1)
```

> `.pluck` is highly reactive, and will readjust itself to hold as many clients as possible.

##### <a name='at-least'></a> `.atLeast(Number)`
Oftentimes, you need a certain number of clients before running any tests. `.atLeast` takes that minimum number, and returns a promise.

That promise resolves when the minimum has been reached.

Here's an example:
```js
var clients = panic.clients

// Waits for 2 clients before resolving.
var minimum = clients.atLeast(2)

minimum.then(function () {

  // 2 clients are connected now.
  return clients.run(/* ... */)
})
```

It can also be used on derived lists, like so:

```js
var node = clients.filter('Node.js')
node.atLeast(3).then(/* ... */)
```

> **Pro tip:** `.atLeast` goes great with mocha's `before` function.

##### <a name='run'></a> `.run(Function)`
It just calls the `client.run` function for every item in the list, wrapping them in `Promise.all`.

When every client reports success, it resolves to a list of return values.

However, if any client fails, the promise rejects.

```js
panic.clients.run(function () {
  var ip = require('ip')
  return ip.address()
}).then(function (ips) {
  console.log(ips) // Array of IPs.
})
```

##### <a name='length'></a> `.length`
A getter property which returns the number of clients in a list.

##### <a name='get'></a> `.get(id)`
Returns the client corresponding to the id. Presently, socket.io's `socket.id` is used to uniquely key clients.

##### <a name='add'></a> `.add(client)`
Manually adds a client to the list, triggering the `"add"` event, but only if the client wasn't there before.

##### <a name='remove'></a> `.remove(client)`
Removes a client from the list, emitting a `remove` event. Again, if the client wasn't in the list, the event doesn't fire.

##### <a name='each'></a> `.each(Function)`
It's basically a `.forEach` on the list. The function you pass will get the client, the client's ID, and the list it was called on.

**Example**
```javascript
clients.each(function (client, id, list) {
  client.run(function () {
   // Fun stuff
  })
})
```

##### <a name='chain'></a> `.chain([...lists])`
This is a low-level API for subclasses. It makes sure the right class context is kept even when chaining off methods that create new lists, like `.filter` and `.pluck`.

```javascript
var list = new ClientList()
list.chain() instanceof ClientList // true

class SubClass extends ClientList {
  coolNewMethod() { /* bacon */ }
}

var sub = new SubClass()
sub.chain() instanceof SubClass // true
sub.chain() instanceof ClientList // true
sub.chain().coolNewMethod() // properly inherits
```

If you're making an extension that creates a new list instance, use this method to play nice with other extensions.

### `panic.server(Server)`
If an [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) is passed, panic will use it to configure [socket.io](http://socket.io/) and the `/panic.js` route will be added that servers up the [`panic-client`](https://github.com/gundb/panic-client) browser code.

If no server is passed, a new one will be created.

If you're not familiar with Node.js' http module, that's okay. The quickest way to get up and running is to call `.listen(8080)` which listens for requests on port 8080. In a browser, the url will look something like this: `http://localhost:8080/panic.js`.

**Create a new server**
```javascript
var panic = require('panic-server')

// create a new http server instance
var server = panic.server()

// listen for requests on port 8080
server.listen(8080)
```

**Reuse an existing one**
```javascript
var panic = require('panic-server')

// create a new http server
var server = require('http').Server()

// pass it to panic
panic.server(server)

// start listening on a port
server.listen(8080)
```

> If you want to listen on port 80 (the default for browsers), you may need to run node as `sudo`.

Once you have a server listening, point browsers/servers to your address. More API details on the [panic-client readme](https://github.com/gundb/panic-client/#loading-panic-client).

> **Note:** if you're using [PhantomJS](https://github.com/ariya/phantomjs), you'll need to serve the html page over http/s for socket.io to work.

### `panic.client`
Returns the panic-client webpack bundle. This is useful for injection into a WebDriver instance (using `driver.executeScript`) without needing to do file system calls.

## <a name='scaffolding'></a> Basic test example
A simple "Hello world" panic app.

**index.html**
```html
<script src='http://localhost:8080/panic.js'>
</script>

<script>
  // Connect to panic!
  panic.server('http://localhost:8080')
</script>
```

**demo.js**
```js
var panic = require('panic-server')

// Start the server on port 8080.
panic.server().listen(8080)

// Get the dynamic list of clients.
var clients = panic.clients

// Create dynamic lists of
// browsers and servers.
var servers = clients.filter('Node.js')
var browsers = clients.excluding(servers)

// Wait for the browser to connect.
browsers.on('add', function (browser) {

  browser.run(function () {

   // This is run in the browser!
   var header = document.createElement('h1')
   header.innerHTML = 'OHAI BROWSR!'
   document.body.appendChild(header)
  })
})
```

Run `demo.js`, then open `index.html` in a browser. Enjoy!

## Support
- Oh, why thank you! Just star this repo, that's all the support we need :heart:

Oh.

Just drop by [our gitter channel](https://gitter.im/amark/gun/) and ping @PsychoLlama, or submit an issue on the repo. We're there for ya.
