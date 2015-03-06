var assert = require('assert');

var format = require('util').format;

// Custom rules

// Let's create a custom rule named Foo. The rule will enforce that
// "foo" is present at least `count` times.
function FooRule() {
}

FooRule.prototype = {};

FooRule.prototype.validate = function (options) {
  if (!options) { throw new Error('options should be an object'); }
  if (typeof options.count !== 'number') { throw new Error('count should be Number'); }
  if (options.count !== (options.count | 0)) { throw new Error('count should be Integer'); }
};

FooRule.prototype.assert = function (options, password) {
  if (!password) { return false; }
  if (typeof password !== 'string') { throw new Error('password should be string'); }

  var count = options.count;
  var lastIndex = 0;

  while (count > 0 && lastIndex !== -1) {
    lastIndex = password.indexOf('foo', lastIndex + 1);
    count--;
  }

  if (lastIndex === -1) {
    return false;
  }

  return true;
};

FooRule.prototype.explain = function (options) {
  return {
    // identifier rule (to make i18n easier)
    code: 'foo',
    message: 'Foo should be present at least %d times.',
    format: [options.count]
  };
};

FooRule.prototype.missing = function (options, password) {
  var explain = this.explain();
  explain.verified = this.assert(options, password);
  return explain;
};


var fooOnlyPolicy = new PasswordPolicy({noFoo: {count: 3}}, {noFoo: new FooRule()});

assert.equal(true, fooOnlyPolicy.check('lalafooasdasdfooasddafooadsasd'));
assert.equal(false, fooOnlyPolicy.check('asd'));

