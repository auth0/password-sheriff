var format = require('util').format;

var expect = require('chai').expect;

var identicalChars = require('../../lib/rules/identicalChars');

function identicalCharsMessage (x, verified) {
  var a = (new Array(x+2)).join('a');
  var msg = format('No more than %d identical characters in a row (e.g., "%s" not allowed)', x, a);
  var d = {message: msg};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

describe('"identical characters" rule', function () {
  describe('explain', function () {
    it('should return singleton list with message', function () {
      expect(identicalChars.explain({max: 3})).to.be.deep.equal(identicalCharsMessage(3));
    });
  });

  // TODO change messages
  describe('missing', function () {
    it('should return singleton list with message on fail', function () {
      expect(identicalChars.missing({max: 3}, 'aaaa')).to.be.deep.equal(identicalCharsMessage(3, false));
    });
    it('should return empty list with message on success', function () {
      expect(identicalChars.missing({max: 3}, 'baaa')).to.be.deep.equal(identicalCharsMessage(3, true));
      expect(identicalChars.missing({max: 2}, 'abc')).to.be.deep.equal(identicalCharsMessage(2, true));
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
