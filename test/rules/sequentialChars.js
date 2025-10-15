const expect = require('chai').expect;

const sequentialChars = require('../../lib/rules/sequentialChars');

function sequentialCharsMessage(x, verified) {
  let example = '';
  for (let i = 0; i < x + 1; i++) {
    example += String.fromCharCode('a'.charCodeAt(0) + i);
  }
  const msg = 'No more than %d sequential alphanumeric characters (e.g., "%s" not allowed)'; // updated wording
  const d = {message: msg, format: [x, example], code: 'sequentialChars'};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function sequentialCharsValidate (max) {
  return function () {
    return sequentialChars.validate({max: max});
  };
}

describe('"sequential characters" rule (alphanumeric only)', function () {
  describe('validate', function () {
    it ('should fail if max is not a number or less than 2', function () {
      const errorRegex = /max should be a number greater than or equal to 2/;

      expect(sequentialCharsValidate(false)).to.throw(errorRegex);
      expect(sequentialCharsValidate(0)).to.throw(errorRegex);
      expect(sequentialCharsValidate(1)).to.throw(errorRegex);
      expect(sequentialCharsValidate('hello')).to.throw(errorRegex);
      expect(sequentialCharsValidate(undefined)).to.throw(errorRegex);
    });

    it('should work otherwise', function () {
      expect(sequentialCharsValidate(2)).not.to.throw();
      expect(sequentialCharsValidate(5)).not.to.throw();
    });
  });

  describe('explain', function () {
    it('should return description with message', function () {
      expect(sequentialChars.explain({max: 3})).to.be.deep.equal(sequentialCharsMessage(3));
    });
  });

  describe('missing', function () {
    it('should inform that the rule is not verified for ascending sequences', function () {
      expect(sequentialChars.missing({max: 3}, 'abcd')).to.be.deep.equal(sequentialCharsMessage(3, false));
    });

    it('should inform that the rule is not verified for descending sequences', function () {
      expect(sequentialChars.missing({max: 3}, 'dcba')).to.be.deep.equal(sequentialCharsMessage(3, false));
    });

    it('should work otherwise', function () {
      expect(sequentialChars.missing({max: 3}, 'abce')).to.be.deep.equal(sequentialCharsMessage(3, true));
      expect(sequentialChars.missing({max: 3}, 'acbd')).to.be.deep.equal(sequentialCharsMessage(3, true));
      expect(sequentialChars.missing({max: 2}, 'abc')).to.be.deep.equal(sequentialCharsMessage(2, false));
      expect(sequentialChars.missing({max: 2}, 'abd')).to.be.deep.equal(sequentialCharsMessage(2, true));
    });
  });

  describe('assert', function () {
    it('should return false on ascending letters', function () {
      expect(sequentialChars.assert({max: 2}, 'abcd')).to.be.equal(false);
    });

    it('should return false on descending letters', function () {
      expect(sequentialChars.assert({max: 2}, 'dcba')).to.be.equal(false);
    });

    it('should return true on success for letters', function () {
      expect(sequentialChars.assert({max: 3}, 'abce')).to.be.equal(true);
      expect(sequentialChars.assert({max: 3}, 'acbd')).to.be.equal(true);
      expect(sequentialChars.assert({max: 2}, 'abd')).to.be.equal(true);
    });

    it('should return false on ascending digits', function () {
      expect(sequentialChars.assert({max: 2}, '012')).to.be.equal(false);
    });

    it('should return false on descending digits', function () {
      expect(sequentialChars.assert({max: 2}, '654')).to.be.equal(false);
    });

    it('should return true on success for digits', function () {
      expect(sequentialChars.assert({max: 3}, '0324')).to.be.equal(true);
      expect(sequentialChars.assert({max: 3}, '5321')).to.be.equal(true);
      expect(sequentialChars.assert({max: 2}, '134')).to.be.equal(true);
    });
  });

  describe('non-alphanumeric', function () {
    it('should treat hyphen as a break in sequence', function () {
      expect(sequentialChars.assert({max: 2}, 'ab-cd')).to.be.equal(true); // 'ab' len2 ok, '-' break, 'cd' len2 ok
    });

    it('should treat underscore as a break in sequence', function () {
      expect(sequentialChars.assert({max: 2}, 'ab_cd')).to.be.equal(true);
    });

    it('should break at leading non-alphanumeric', function () {
      expect(sequentialChars.assert({max: 2}, '#ab')).to.be.equal(true); // only 'ab' len2
    });

    it('should still fail if post-break sequence exceeds max', function () {
      expect(sequentialChars.assert({max: 2}, '#abc')).to.be.equal(false); // '#'(break) then 'abc' len3 > max
    });

    it('should allow separated digit sequences each within limit', function () {
      expect(sequentialChars.assert({max: 2}, '01-23')).to.be.equal(true); // '01' len2 ok, '-' break, '23' len2 ok
    });
  });
});
