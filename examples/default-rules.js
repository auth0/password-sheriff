var assert = require('assert');

var PasswordPolicy = require('..').PasswordPolicy;

/* The default Password Sheriff rules are:
 *  * length
 *  * contains
 *  * containsAtLeast
 *  * identicalChars
*/

/*
 * length
 *
 * Parameters: `minLength`
 *
 * Specify the minimum amount of characters a password must have using the
 * `minLength` argument.
 */
var lengthPolicy = new PasswordPolicy({length: {minLength: 3}});

assert.equal(false, lengthPolicy.check('f'));
assert.equal(false, lengthPolicy.check('fo'));
assert.equal(true, lengthPolicy.check('foo'));
assert.equal(true, lengthPolicy.check('foobar'));

/*
 * contains
 *
 * Parameters: `expressions`
 *
 * The password should contain all of the charsets specified. There are
 * 4 predefined charsets: `upperCase`, `lowerCase`, `numbers` and
 * `specialCharacters` (`specialCharacters`are the ones defined in
 * OWASP Password Policy recommendation document).
 */

var charsets = require('../lib/rules/contains').charsets;

// var lowerCase         = charsets.lowerCase;
// var specialCharacters = charsets.specialCharacters;
var upperCase         = charsets.upperCase;
var numbers           = charsets.numbers;


var containsPolicy = new PasswordPolicy({contains: {
  expressions: [upperCase, numbers]
}});

assert.equal(false, containsPolicy.check('foo'));
assert.equal(false, containsPolicy.check('Bar'));
assert.equal(true, containsPolicy.check('Bar9'));
assert.equal(true, containsPolicy.check('B9'));

// TODO Document containsAtLeast
// TODO Document identicalChars
// TODO Document AND
