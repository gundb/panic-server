'use strict';
function match(query, platform) {
	var key, value, matches = true;
	for (key in query) {
		if (!(query.hasOwnProperty(key))) {
			continue;
		}
		value = query[key];
		if (value instanceof RegExp) {
			matches = matches && !!platform[key].match(value);
		} else if (typeof value === 'string') {
			matches = matches && platform[key] === value;
		} else if (value instanceof Object) {
			return match(value, platform[key] || {});
		}
	}
	return matches;
}

module.exports = match;
