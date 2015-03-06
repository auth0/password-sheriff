var assert = require('assert');

var format = require('util').format;

var PasswordPolicy = require('..').PasswordPolicy;

// Create a length password policy
var lengthPolicy = new PasswordPolicy({length: {minLength: 6}});

// throws if password does not meet criteria
try {
  lengthPolicy.assert('hello');
  assert.ok(false);
} catch (e) {
  assert.ok(e);
}

// returns false if password does not meet rules
assert.equal(false, lengthPolicy.check('hello'));

// explains the policy
var explained = lengthPolicy.explain();

assert.equal(1, explained.length);

// Rule code for i18n
assert.equal('lengthAtLeast', explained[0].code);

assert.equal('At least 6 characters in length',
             format(explained[0].message, explained[0].format));

