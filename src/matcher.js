/* eslint eqeqeq: "off"*/
'use strict';

/**
 * Runs a platform query against a platform.
 * @param  {Object|RegExp|String} query
 * If a a string or regular expression is given,
 * it'll be matched against each platform name.
 * If it's an object, it'll be recursively matched
 * against each platform (nested regular expressions allowed).
 * @param  {Object} platform - A platform.js object.
 * @return {Boolean} - Whether the platform matches the query.
 */
function match (query, platform) {
  var key, value, matches = true;

  /** Check all query options. */
  for (key in query) {
    if (!(query.hasOwnProperty(key))) {
      continue;
    }

    value = query[key];

    if (value instanceof RegExp) {

     /** Tests if the expression matches. */
      matches = matches && !!platform[key].match(value);
    } else if (typeof value === 'string') {

     /**
      * Check for equality against the expression.
      * Loose check for string vs number cases
      * (like os.architecture).
      */
      matches = matches && platform[key] == value;
    } else if (value instanceof Object) {

     /** Recursively match deeper queries. */
      return match(value, platform[key] || {});
    }
  }

  /** Whether the query matches. */
  return matches;
}

module.exports = match;
