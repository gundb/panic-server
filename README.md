# Panic

A distributed testing framework designed for and built by the team at [gunDB](https://github.com/amark/gun).

### *under development*


**Rough API draft**

```javascript
test('Client/server sync', function () {
	// set env variables
	this.env({
		url: 'http://localhost/gun'
	})

	// on every platform
	this.use(function () {
		this.env.db = new Gun(
			this.env.url
		)
	})

	// only on browsers
	this.client(function (client) {
		client.env.db.get('update').put({
			data: true
		})
	})
	
	// only on node clients
	this.server(function (server) {
		this.env.db.get('update').val(this.done)
	}, 15000)
	// 15 second timeout, run on the server
})
```

More sketches in `notes.js`
