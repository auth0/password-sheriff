var expect = require('chai').expect;

var identicalChars = require('../../lib/rules/identicalChars');

function identicalCharsMessage (x, verified) {
  var a = (new Array(x+2)).join('a');
  var msg = 'No more than %d identical characters in a row (e.g., "%s" not allowed)';
  var d = {message: msg, format: [x, a], code: 'identicalChars'};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function identicalCharsValidate (max) {
  return function () {
    return identicalChars.validate({max: max});
  };
}

describe('"identical characters" rule', function () {

  describe('validate', function () {
    it ('should fail if max is not a number or less than 1', function () {
      var errorRegex = /max should be a number greater than 1/;

      expect(identicalCharsValidate(false)).to.throw(errorRegex);
      expect(identicalCharsValidate(0)).to.throw(errorRegex);
      expect(identicalCharsValidate('hello')).to.throw(errorRegex);
      expect(identicalCharsValidate(undefined)).to.throw(errorRegex);
    });
    it('should work otherwise', function () {
      expect(identicalCharsValidate(2)).not.to.throw();
      expect(identicalCharsValidate(5)).not.to.throw();
    });
  });

  describe('explain', function () {
    it('should return singleton list with message', function () {
      expect(identicalChars.explain({max: 3})).to.be.deep.equal(identicalCharsMessage(3));
    });
  });

  describe('missing', function () {
    it('should inform that the rule is not verified', function () {
      expect(identicalChars.missing({max: 3}, 'aaaa')).to.be.deep.equal(identicalCharsMessage(3, false));
    });
    it('should work otherwise', function () {
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
