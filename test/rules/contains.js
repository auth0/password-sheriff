var expect = require('chai').expect;

var contains = require('../../rules/contains');

var charsets = contains.charsets;

var specialCharactersRegexp = charsets.specialCharacters;

var upperAndSpecial = [charsets.upperCase, charsets.specialCharacters];

var upperCaseMessage = 'upper case letters (A-Z)';
var specialCharsMessage = 'special characters (e.g. !@#$%^&*)';
var introMessage = 'Should contain:';

describe('"contains" rule', function () {
  describe('explain', function () {
    it('should return list with contained expressions', function () {
      var explained = contains.explain({expressions: upperAndSpecial});
      expect(explained).to.be.deep.equal([introMessage, [upperCaseMessage, specialCharsMessage]]);
    });
  });

  describe('assert missing', function () {
    it('should return list with failed expressions', function () {
      var explained = contains.missing({expressions: upperAndSpecial}, 'hello');
      expect(explained).to.be.deep.equal([introMessage, [upperCaseMessage, specialCharsMessage]]);

      explained = contains.missing({expressions: upperAndSpecial}, 'helloA');
      expect(explained).to.be.deep.equal([introMessage, [specialCharsMessage]]);

      explained = contains.missing({expressions: upperAndSpecial}, 'helloA!');
      expect(explained).to.be.deep.equal([]);
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
