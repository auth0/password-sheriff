var format = require('util').format;

var expect = require('chai').expect;

var length = require('../../rules/length');

var nonEmptyMsg = 'Non-empty password required';

function atLeast(x) {
  return format('At least %d characters in length', x);
}

describe('"length" rule', function () {
  describe('explain', function () {
    it('should return ["Non-empty password required."] when minLength is 1', function () {
      expect(length.explain({minLength: 1})).to.be.deep.equal([nonEmptyMsg]);
    });
    it('should return ["At least x characters in length"] when minLength is x', function () {
      expect(length.explain({minLength: 5})).to.be.deep.equal([atLeast(5)]);
    });
  });

  describe('missing', function () {
    it('should return singleton list with message when fails', function () {
      expect(length.missing({minLength: 1}, '')).to.be.deep.equal([nonEmptyMsg]);
      expect(length.missing({minLength: 9}, 'hello')).to.be.deep.equal([atLeast(9)]);
    });
    it('should return empty list with message when succeeds', function () {
      expect(length.missing({minLength: 4}, 'hello')).to.be.deep.equal([]);
      expect(length.missing({minLength: 4}, 'hello:B')).to.be.deep.equal([]);
    });
  });

  describe('assert', function () {
    it('should return false if password.length < options.minLength', function () {
      expect(length.assert({minLength: 9}, 'hello')).to.be.equal(false);
    });
    it('should return true if password.length == options.minLength', function () {
      expect(length.assert({minLength: 4}, 'hello')).to.be.equal(true);
    });
    it('should return true if password.length > options.minLength', function () {
      expect(length.assert({minLength: 4}, 'hellobye')).to.be.equal(true);
    });
  });
});
