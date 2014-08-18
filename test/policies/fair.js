var expect = require('chai').expect;

var createPolicy = require('../../index');

var fairPolicyDescription = '* At least 8 characters in length\n' +
  '* Should contain:\n' +
  ' * lower case letters (a-z)\n' +
  ' * upper case letters (A-Z)\n' +
  ' * numbers (i.e. 0-9)';

describe('fair policy' + fairPolicyDescription, function () {
  var policy = createPolicy('fair');

  describe('check', function () {
    it('should fail with invalid values', function () {
      expect(policy.check(undefined)).to.be.equal(false);
      expect(policy.check(null)).to.be.equal(false);
      expect(policy.check(0)).to.be.equal(false);
      expect(policy.check([])).to.be.equal(false);
      expect(policy.check({})).to.be.equal(false);
    });

    it('should fail with password length of less than 8 characters', function () {
      expect(policy.check('')).to.be.equal(false);
      expect(policy.check('hello')).to.be.equal(false);
      expect(policy.check('7charac')).to.be.equal(false);
    });

    it('should fail if password does not contain at least a lower case letter', function () {
      expect(policy.check('KTHXBYE123')).to.be.equal(false);
    });

    it('should fail if password does not contain at least an upper case letter', function () {
      expect(policy.check('123hellogoodbye')).to.be.equal(false);
    });

    it('should fail if password does not contain at least a number', function () {
      expect(policy.check('helloGOODBYE')).to.be.equal(false);
    });

    it('should work if password meets previous criteria', function () {
      expect(policy.check('someP123')).to.be.equal(true);
      expect(policy.check('somePASSWORD123')).to.be.equal(true);
    });
  });
  describe('toString', function () {
    it('should describe policy correctly', function () {
      var policy = createPolicy('fair');
      expect(policy.toString()).to.equal(fairPolicyDescription);
    });
  });
});
