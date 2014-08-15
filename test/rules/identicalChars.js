var format = require('util').format;

var expect = require('chai').expect;

var identicalChars = require('../../lib/rules/identicalChars');

var identicalCharsMessage = 'No more than 3 identical characters in a row (e.g., "aaaa" not allowed)';

describe('"identical characters" rule', function () {
  describe('explain', function () {
    it('should return singleton list with message', function () {
      expect(identicalChars.explain({max: 3})).to.be.deep.equal([identicalCharsMessage]);
    });
  });

  describe('missing', function () {
    it('should return singleton list with message on fail', function () {
      expect(identicalChars.missing({max: 3}, 'aaaa')).to.be.deep.equal([identicalCharsMessage]);
    });
    it('should return empty list with message on success', function () {
      expect(identicalChars.missing({max: 3}, 'baaa')).to.be.deep.equal([]);
      expect(identicalChars.missing({max: 2}, 'abc')).to.be.deep.equal([]);
    });
  });

  describe('assert', function () {
    it('should return false on fail', function () {
      expect(identicalChars.assert({max: 2}, 'aaa')).to.be.equal(false);
    });
    it('should return empty list with message on success', function () {
      expect(identicalChars.assert({max: 2}, 'abc')).to.be.equal(true);
    });

  });
});
