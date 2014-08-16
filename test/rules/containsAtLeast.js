var format = require('util').format;

var expect = require('chai').expect;

var containsAtLeast = require('../../lib/rules/containsAtLeast');

var charsets = containsAtLeast.charsets;

function createMissingEntry(x, y, items, verified) {
  var d = {
    message: format('Contain at least %d of the following %d types of characters:', x, y),
    items: items
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function generateMessageFn(msg) {
  return function (verified) {
    var d = {message: msg};
    if (verified !== undefined) {
      d.verified = verified;
    }
    return d;
  };
}

var lowerCaseMessage    = generateMessageFn('lower case letters (a-z)');
var upperCaseMessage    = generateMessageFn('upper case letters (A-Z)');
var numbersMessage      = generateMessageFn('numbers (i.e. 0-9)');
var specialCharsMessage = generateMessageFn('special characters (e.g. !@#$%^&*)');

function fourMessages (a, b, c, d) {
  return [lowerCaseMessage(a), upperCaseMessage(b), numbersMessage(c), specialCharsMessage(d)];
}
var fourCharsets = [charsets.lowerCase, charsets.upperCase, charsets.numbers, charsets.specialCharacters];

function createOptions(charsets) {
  return {atLeast: 3, expressions: charsets};
}

describe('"contains at least" rule', function () {
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
