# Changelog

## v0.2.0
`panic.serve` has been replaced with `panic.server`, which accepts `http.Server` instances instead of options.

Breaking changes:
 - Removed `panic.serve(options)`, replacing it with `panic.server(http)`.
 - The server no longer accepts an options object.
 - The server no longer automatically listens on a port.
 - `panic.server` always returns an `http.Server`, instead of the options object.
 - `panic.js` is no longer served on the root route, only the `/panic.js` route.


## v0.1.0
First minor release.
