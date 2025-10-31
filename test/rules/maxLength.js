var expect = require('chai').expect;

var maxLength = require('../../lib/rules/maxLength');

function maxLengthMessage (x, verified) {
  var d = {message: 'Maximum password length exceeded', format: [x], code: 'maxLength'};
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

function maxLengthValidate (maxBytes) {
  return function () {
    return maxLength.validate({maxBytes: maxBytes});
  };
}

describe('"maximum password length (bytes)" rule', function () {
  describe('validate', function () {
    it('should fail if maxBytes is not a number or less than 1', function () {
      var errorRegex = /maxBytes should be a number greater than 0/;
      expect(maxLengthValidate(false)).to.throw(errorRegex);
      expect(maxLengthValidate(0)).to.throw(errorRegex);
      expect(maxLengthValidate('hello')).to.throw(errorRegex);
      expect(maxLengthValidate(undefined)).to.throw(errorRegex);
    });
    it('should work otherwise', function () {
      expect(maxLengthValidate(1)).not.to.throw();
      expect(maxLengthValidate(72)).not.to.throw();
    });
  });

  describe('explain', function () {
    it('should return description with message', function () {
      expect(maxLength.explain({maxBytes: 72})).to.be.deep.equal(maxLengthMessage(72));
    });
  });

  describe('missing', function () {
    it('should mark as not verified when empty password', function () {
      expect(maxLength.missing({maxBytes: 5}, '')).to.be.deep.equal(maxLengthMessage(5, false));
    });
    it('should mark as not verified when length exceeds maxBytes', function () {
      expect(maxLength.missing({maxBytes: 5}, '123456')).to.be.deep.equal(maxLengthMessage(5, false));
    });
    it('should verify when length within maxBytes', function () {
      expect(maxLength.missing({maxBytes: 5}, '12345')).to.be.deep.equal(maxLengthMessage(5, true));
    });
    it('should verify with multi-byte characters within limit', function () {
      // emoji is 4 bytes in UTF-8
      expect(maxLength.missing({maxBytes: 4}, '😀')).to.be.deep.equal(maxLengthMessage(4, true));
    });
    it('should not verify with multi-byte characters exceeding limit', function () {
      expect(maxLength.missing({maxBytes: 5}, '😀😀')).to.be.deep.equal(maxLengthMessage(5, false)); // 8 bytes
    });
  });

  describe('assert', function () {
    it('should return false when password missing', function () {
      expect(maxLength.assert({maxBytes: 5}, '')).to.be.equal(false);
    });
    it('should return true when length within limit', function () {
      expect(maxLength.assert({maxBytes: 5}, '12345')).to.be.equal(true);
    });
    it('should return false when length exceeds limit', function () {
      expect(maxLength.assert({maxBytes: 5}, '123456')).to.be.equal(false);
    });
    it('should return true when multi-byte password within limit', function () {
      expect(maxLength.assert({maxBytes: 8}, '😀😀')).to.be.equal(true); // 8 bytes
    });
    it('should return false when multi-byte password exceeds limit', function () {
      expect(maxLength.assert({maxBytes: 7}, '😀😀')).to.be.equal(false); // 8 bytes
    });
  });

  // Additional unicode-specific tests
  describe('unicode byte length tests', function () {
    it('should distinguish precomposed vs decomposed character', function () {
      var pre = 'é';          // 2 bytes
      var decomp = 'e\u0301'; // 3 bytes
      expect(maxLength.assert({maxBytes: 2}, pre)).to.be.equal(true);
      expect(maxLength.assert({maxBytes: 2}, decomp)).to.be.equal(false); // decomposed longer
    });

    it('should handle CJK characters (3 bytes each)', function () {
      var cjk = '字'; // 3 bytes
      expect(maxLength.assert({maxBytes: 3}, cjk)).to.be.equal(true);
      expect(maxLength.assert({maxBytes: 2}, cjk)).to.be.equal(false);
    });

    it('should handle multi byte password (4 bytes each)', function () {
      expect(maxLength.assert({maxBytes: 4}, '🚀')).to.be.equal(true);
      expect(maxLength.assert({maxBytes: 3}, '🚀')).to.be.equal(false);
    });

    it('should pass exactly at boundary with mixed ascii + emoji', function () {
      var ascii = 'a'.repeat(68); // 68 bytes
      var emoji = '😀'; // 4 bytes -> total 72 bytes
      var total = ascii + emoji; // 68 + 4 = 72 bytes
      expect(Buffer.byteLength(total, 'utf8')).to.equal(72);
      expect(maxLength.assert({maxBytes: 72}, total)).to.be.equal(true);
      expect(maxLength.assert({maxBytes: 71}, total)).to.be.equal(false);
    });
  });
});
