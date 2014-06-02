var expect = require('chai').expect;

var specialCharactersRegexp = require('../lib/special_characters');

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
