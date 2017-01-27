var _ = require('../../lib/helper');
var expect = require('chai').expect;

var contains = require('../../lib/rules/contains');

var charsets = contains.charsets;

var specialCharactersRegexp = charsets.specialCharacters;

var upperAndSpecial = [charsets.upperCase, charsets.specialCharacters];

function upperCaseMessage (verified) {
  var d = {message: 'upper case letters (A-Z)', code: 'upperCase'};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}
function specialCharsMessage (verified) {
  var d = {message: 'special characters (e.g. !@#$%^&*)', code: 'specialCharacters'};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function createMissingEntry(items, verified) {
  var d = {
    message: 'Should contain:',
    code: 'shouldContain',
    items: items
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function containsValidate (expressions) {
  return function () {
    return contains.validate({expressions: expressions});
  };
}

describe('"contains" rule', function () {
  describe('explain', function () {
    it('should return list with contained expressions', function () {
      var explained = contains.explain({expressions: upperAndSpecial});
      expect(explained).to.be.deep.equal(createMissingEntry([upperCaseMessage(), specialCharsMessage()]));
    });
  });

  describe('validate', function () {
    it('should fail if expressions is not an array', function () {
      var errorRegex = /contains expects expressions to be a non-empty array/;
      expect(containsValidate(null)).to.throw(errorRegex);
      expect(containsValidate(false)).to.throw(errorRegex);
      expect(containsValidate(true)).to.throw(errorRegex);
      expect(containsValidate('hello')).to.throw(errorRegex);
    });

    it('should fail if expressions array contains invalid items', function () {
      var errorRegex = /contains expressions are invalid: An explain and a test function should be provided/;
      expect(containsValidate([1,2,3])).to.throw(errorRegex);
      expect(containsValidate(['hi'])).to.throw(errorRegex);
      expect(containsValidate([{test: 'hi', explain: 'bye'}])).to.throw(errorRegex);
      expect(containsValidate([{test: _.identity, explain: 'bye'}])).to.throw(errorRegex);
    });

    it('should fail if expressions is an empty array', function () {
      var errorRegex = /ontains expects expressions to be a non-empty array/;
      expect(containsValidate([])).to.throw(errorRegex);
    });

    it('should work otherwise', function () {
      expect(containsValidate([{test: _.identity, explain: _.identity}])).not.to.throw();
    });
  });

  describe('assert missing', function () {
    it('should return a structure with failed expressions', function () {
      var explained = contains.missing({expressions: upperAndSpecial}, 'hello');
      expect(explained).to.be.deep.equal(createMissingEntry(
        [upperCaseMessage(false), specialCharsMessage(false)], false));

      explained = contains.missing({expressions: upperAndSpecial}, 'helloA');
      expect(explained).to.be.deep.equal(
        createMissingEntry([
          upperCaseMessage(true),
          specialCharsMessage(false)
      ], false));

      explained = contains.missing({expressions: upperAndSpecial}, 'helloA!');
      expect(explained).to.be.deep.equal(
        createMissingEntry([upperCaseMessage(true), specialCharsMessage(true)], true));
    });
  });

  describe('assert', function () {
    it('should return false if not all expressions are not fulfilled', function () {
      expect(contains.assert({expressions: upperAndSpecial}, 'hello')).to.be.equal(false);
      expect(contains.assert({expressions: upperAndSpecial}, 'hellO')).to.be.equal(false);
      expect(contains.assert({expressions: upperAndSpecial}, 'hell!')).to.be.equal(false);
    });
    it('should return assert all expressions are fulfilled', function () {

      expect(contains.assert({expressions: upperAndSpecial}, 'hellO!')).to.be.equal(true);
    });
  });

  describe('specialCharactersRegexp', function () {
    it('should handle all OWASP symbols correctly', function () {
      var symbols = [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_','`','{','|', '}','~'];

      expect(symbols.every(function (symbol) {
        var value = specialCharactersRegexp.test(symbol);
        if (!value) {
          throw symbol;
        }
        return specialCharactersRegexp.test(symbol);
      })).to.equal(true);
    });

    it('should not handle characters that are non-symbols', function () {
      var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

      expect(alphanum.some(function (symbol) {
        var value = specialCharactersRegexp.test(symbol);
        if (value) {
          throw symbol;
        }
        return specialCharactersRegexp.test(symbol);
      })).to.equal(false);
    });
  });
});
