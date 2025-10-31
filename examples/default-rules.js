var assert = require('assert');

var PasswordPolicy = require('..').PasswordPolicy;

/* The default Password Sheriff rules are:
 *  * length
 *  * contains
 *  * containsAtLeast
 *  * identicalChars
 *  * sequentialChars
 *  * maxLength
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

/*
 * sequentialChars
 *
 * Parameters: max :: Integer
 *
 * Passwords should not contain more than `max` sequential (increasing or decreasing) characters.
 */
var sequentialCharsPolicy = new PasswordPolicy({
  sequentialChars: { max: 3 }
});

assert.equal(true, sequentialCharsPolicy.check('abce'));      // sequence breaks before exceeding 3
assert.equal(true, sequentialCharsPolicy.check('cbaZ'));      // descending sequence of length 3 allowed
assert.equal(false, sequentialCharsPolicy.check('abcd'));     // ascending length 4 not allowed
assert.equal(false, sequentialCharsPolicy.check('dcba1'));    // descending length 4 not allowed

/*
 * maxLength
 *
 * Parameters: maxBytes :: Integer
 *
 * Passwords must not exceed `maxBytes` bytes when encoded in UTF-8. Multi-byte characters (e.g. emoji) count as multiple bytes.
 */
var maxLengthPolicy = new PasswordPolicy({
  maxLength: { maxBytes: 8 }
});

assert.equal(true,  maxLengthPolicy.check('a'.repeat(8)));    // 8 bytes OK
assert.equal(false, maxLengthPolicy.check('a'.repeat(9)));    // 9 bytes > 8
assert.equal(true,  maxLengthPolicy.check('😀😀'));            // 2 emojis * 4 bytes = 8 OK
assert.equal(false, maxLengthPolicy.check('😀😀😀'));          // 12 bytes > 8
assert.equal(true,  maxLengthPolicy.check('éééé'));           // each 'é' 2 bytes => 8 bytes OK
assert.equal(false, maxLengthPolicy.check('ééééé'));          // 10 bytes > 8
