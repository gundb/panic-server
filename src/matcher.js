'use strict';

var match;

/**
 * Whether two values look the same.
 * @param  {Mixed} expected - An expression to match the value against.
 * Can be a regular expression, an object containing more comparisons,
 * or just a primitive.
 * @param  {Mixed} value - A value to compare against the expression.
 * @return {Boolean} - Whether the values look similar.
 */
function matches (expected, value) {

  /** Matchers can be regular expressions. */
  if (expected instanceof RegExp) {
    return expected.test(value);
  }

  /** Matchers can be nested objects. */
  if (expected instanceof Object) {
    return match(expected, value || {});
  }

  /** Or, just a primitive value. */
  return value === expected;
}

/**
 * Runs a platform query against a platform.
 * @param  {Object} query - Contains properties to match against the
 * platform. If it contains nested objects, they will match against the
 * platform object of the same name, regardless of depth. If a property
 * is a regular expression, it will run against the platform property of
 * the same name.
 * @param  {Object} platform - A platform.js object.
 * @return {Boolean} - Whether the platform matches the query.
 */
match = function (query, platform) {
  var fields = Object.keys(query);

  var invalid = fields.some(function isInvalid (field) {
    var expected = query[field];
    var value = platform[field];

    /** Look for values that don't match the query. */
    return matches(expected, value) === false;
  });

  return !invalid;
};

module.exports = match;
