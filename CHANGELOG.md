# Changelog

## Unreleased
### Removed
- `.len()` has been permanently removed (was previously under deprecation notice).

## v0.4.1
### Added
- Method `.atLeast`, useful for pausing until a minimum number of clients join.

## v0.4.0
### Added
- Upgraded to panic-client `v0.3` (brings `.get` and `.set` client methods).

## v0.3.0
### Changed
- position of the `done` changed to the first parameter. `this` context is no longer passed.
- `export vars` is no longer enabled by default, but opt-in using the `{ '@scope': true }` property.

### Removed
- `.len()` has been deprecated in favor of `.length`.

### Added
- Lazily loads the panic-client bundle through `panic.client` property.
- Subclassing support by chains instantiating `this.constructor`.
- Added `.chain` method which ensures the proper class is called.

## v0.2.4
### Fixed
- Set the `constructor` property on the ClientList prototype.

## v0.2.3
### Fixed
- Removed the `Function.prototype.toJSON` extension.

## v0.2.2
### Fixed
- `.excluding()` did not listen for remove events on exclusion lists. If a client was removed yet still connected, it wouldn't make it into the exclusion set.
- The "add" event would fire each time you add the same client, even though it was already contained.

### Added
- New `clients.pluck(Number)` method will create a new list constrained to a maximum number of clients.

## v0.2.1
### Added
- The `ClientList` constructor to the `panic` object.
- The `ClientList` constructor now accepts an array of smaller lists to pull from.

## v0.2.0
### Changed
- `panic.serve` has been renamed to `panic.server`.
- `panic.server` accepts an `http.Server` instance instead of an options object.
- The server no longer automatically listens on a port.
- `panic.server` returns the server, not the options object.
- `panic.js` is no longer served on the root route, only from `/panic.js`.

## v0.1.0
First minor release.
