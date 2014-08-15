var format = require('util').format;

var expect = require('chai').expect;

var containsAtLeast = require('../../rules/containsAtLeast');

var charsets = containsAtLeast.charsets;

function createIntro(x, y) {
  return format('Contain at least %d of the following %d types of characters:', x, y || 4);
}

var lowerCaseMessage = 'lower case letters (a-z)';
var upperCaseMessage = 'upper case letters (A-Z)';
var numbersMessage = 'numbers (i.e. 0-9)';
var specialCharsMessage = 'special characters (e.g. !@#$%^&*)';

var fourMessages = [lowerCaseMessage, upperCaseMessage, numbersMessage, specialCharsMessage];
var fourCharsets = [charsets.lowerCase, charsets.upperCase, charsets.numbers, charsets.specialCharacters];

function createOptions(charsets) {
  return {atLeast: 3, expressions: charsets};
}

function allExcept() {
  var args = Array.prototype.slice.call(arguments, 0);
  return fourMessages.filter(function (msg) {
    return args.indexOf(msg) === -1;
  });
}

describe('"contains at least" rule', function () {
  var explained;
  describe('explain', function () {
    it('should return list with contained expressions', function () {
      var result = [createIntro(3), [lowerCaseMessage, upperCaseMessage, numbersMessage, specialCharsMessage]];
      expect(containsAtLeast.explain({atLeast: 3, expressions: fourCharsets})).to.be.deep.equal(result);
    });
  });

  describe('missing', function () {
    it('should return list with failed expressions', function () {
      explained = containsAtLeast.missing(createOptions(fourCharsets), '');
      expect(explained).to.be.deep.equal([createIntro(3), fourMessages]);

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello');
      expect(explained).to.be.deep.equal([createIntro(2, 3), allExcept(lowerCaseMessage)]);

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO');
      expect(explained).to.be.deep.equal([createIntro(1, 2), allExcept(lowerCaseMessage, upperCaseMessage)]);

      explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello!');
      expect(explained).to.be.deep.equal([createIntro(1, 2), allExcept(lowerCaseMessage, specialCharsMessage)]);
    });

    it('should return empty list when criteria is fulfilled', function () {
      explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO9');
      expect(explained).to.be.deep.equal([]);
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
