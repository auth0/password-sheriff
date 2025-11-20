var _ = require('../../lib/helper');

var expect = require('chai').expect;

var containsAtLeast = require('../../lib/rules/containsAtLeast');

var charsets = containsAtLeast.charsets;

function createMissingEntry(x, y, items, verified) {
  var d = {
    message: 'Contain at least %d of the following %d types of characters:',
    code: 'containsAtLeast',
    format: [x, y],
    items: items
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function generateMessageFn(msg, code) {
  return function (verified) {
    var d = {message: msg, code: code};
    if (verified !== undefined) {
      d.verified = verified;
    }
    return d;
  };
}

var lowerCaseMessage    = generateMessageFn('lower case letters (a-z)', 'lowerCase');
var upperCaseMessage    = generateMessageFn('upper case letters (A-Z)', 'upperCase');
var numbersMessage      = generateMessageFn('numbers (i.e. 0-9)', 'numbers');
var specialCharsMessage = generateMessageFn('special characters (e.g. !@#$%^&*)', 'specialCharacters');

function fourMessages (a, b, c, d) {
  return [lowerCaseMessage(a), upperCaseMessage(b), numbersMessage(c), specialCharsMessage(d)];
}
var fourCharsets = [charsets.lowerCase, charsets.upperCase, charsets.numbers, charsets.specialCharacters];

function createOptions(charsets) {
  return {atLeast: 3, expressions: charsets};
}

function containsAtLeastValidate(atLeast, expressions) {
  return function () {
    return containsAtLeast.validate({atLeast: atLeast, expressions: expressions});
  };
}

describe('"contains at least" rule', function () {

  describe('validate', function () {
    it('should fail if atLeast is not a number greater than 0', function () {
      var errorRegex = /atLeast should be a valid, non-NaN number, greater than 0/;

      expect(containsAtLeastValidate(-34)).to.throw(errorRegex);
      expect(containsAtLeastValidate(0)).to.throw(errorRegex);
      expect(containsAtLeastValidate('hello')).to.throw(errorRegex);
      expect(containsAtLeastValidate(undefined)).to.throw(errorRegex);
      expect(containsAtLeastValidate(false)).to.throw(errorRegex);
      expect(containsAtLeastValidate(true)).to.throw(errorRegex);
    });

    it('should fail if expressions is empty or not an array', function () {
      var errorRegex = /expressions should be an non-empty array/;

      expect(containsAtLeastValidate(3, [])).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, undefined)).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, null)).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, true)).to.throw(errorRegex);
    });

    it('should fail if expressions array contains invalid items', function () {
      var entry = {test: _.identity, explain: _.identity};
      var errorRegex = /containsAtLeast expressions are invalid: An explain and a test function should be provided/;
      expect(containsAtLeastValidate(3, [1,2,3])).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, ['hi', 'bye', 'woot'], entry, entry)).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, [{test: 'hi', explain: 'bye'}, entry, entry])).to.throw(errorRegex);
      expect(containsAtLeastValidate(3, [{test: _.identity, explain: 'bye'}, entry, entry])).to.throw(errorRegex);
    });

    it('should fail if expressions array length is less than atLeast', function () {
      var errorRegex = /expressions length should be greater than atLeast/;
      var entry = {test: _.identity, explain: _.identity};
      expect(containsAtLeastValidate(3, [entry, entry])).to.throw(errorRegex);
    });

    it('should work otherwise', function () {
      var entry = {test: _.identity, explain: _.identity};
      expect(containsAtLeastValidate(3, [entry, entry, entry])).not.to.throw();
    });
  });

  var explained;
  describe('explain', function () {
    it('should return list with contained expressions', function () {
      var result = createMissingEntry(3, 4, fourMessages());
      expect(containsAtLeast.explain({atLeast: 3, expressions: fourCharsets})).to.be.deep.equal(result);
    });
  });

  describe('missing', function () {
    var state = [
      [false, false, false, false],
      [true,  false, false, false],
      [true,  true,  false, false],
      [true,  false, false, true ],
      [true,  true,  true,  false],
      [true,  true,  true,  true ]
    ];
    it('should return structure that explains what is missing', function () {


      explained = containsAtLeast.missing(createOptions(fourCharsets), '');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[0]), false));

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[1]), false));

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[2]), false));

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello!');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[3]), false));
    });

    it('should return an structure with verified == true when fulfilled', function () {
      explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO9');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[4]), true));

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO9!');
      expect(explained).to.be.deep.equal(createMissingEntry(3, 4, fourMessages.apply(null, state[5]), true));
    });
  });

  describe('assert', function () {
    it('should fail when it does not contain at least those minimum character groups', function () {
      expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello')).to.be.equal(false);
      expect(containsAtLeast.assert(createOptions(fourCharsets), 'helloO')).to.be.equal(false);
      expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello3')).to.be.equal(false);
    });

    it('should not fail when it does contain the minimum required character groups', function () {
      expect(containsAtLeast.assert(createOptions(fourCharsets), 'helloO!')).to.be.equal(true);
      expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello3!')).to.be.equal(true);
    });

  });
});
