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
 * Parameters:  minLength :: Integer
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
 * Parameters: expressions :: [Charset]
 *
 * Password should contain all of the charsets specified. There are
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

/*
 * containsAtLeast
 *
 * Parameters: expressions :: [Charset], atLeast :: Integer
 *
 * Passwords should contain at least `atLeast` of a total of `expressions.length`
 * groups.
 */

var charsets = require('../lib/rules/containsAtLeast').charsets;

var lowerCase         = charsets.lowerCase;
// var specialCharacters = charsets.specialCharacters;
upperCase         = charsets.upperCase;
numbers           = charsets.numbers;

var containsAtLeastPolicy = new PasswordPolicy({
  containsAtLeast: {
    atLeast: 2,
    expressions: [ lowerCase, upperCase, numbers ]
  }
});

assert.equal(false, containsAtLeastPolicy.check('hello'));
assert.equal(false, containsAtLeastPolicy.check('387'));
assert.equal(true,  containsAtLeastPolicy.check('387hello'));
assert.equal(true,  containsAtLeastPolicy.check('HELLOhello'));
assert.equal(true,  containsAtLeastPolicy.check('HELLOhello123'));


/*
 * identicalChars
 *
 * Parameters: max :: Integer
 *
 * Passwords should not contain any character repeated continuously `max + 1` times.
 */
var identitcalCharsPolicy = new PasswordPolicy({
  identicalChars: {
    max: 3
  }
});

assert.equal(true, identitcalCharsPolicy.check('hello'));
assert.equal(true, identitcalCharsPolicy.check('hellol'));
assert.equal(true, identitcalCharsPolicy.check('helllo'));
assert.equal(false, identitcalCharsPolicy.check('hellllo'));
assert.equal(false, identitcalCharsPolicy.check('123333334'));

