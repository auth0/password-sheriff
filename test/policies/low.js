var expect = require('chai').expect;

var createPolicy = require('../../index');

var lowPolicyDescription = '* At least 6 characters in length';

describe('low policy:' + lowPolicyDescription, function () {
  var policy = createPolicy('low');

  describe('check', function () {

    it('should fail with invalid values', function () {
      expect(policy.check(undefined)).to.be.equal(false);
      expect(policy.check(null)).to.be.equal(false);
      expect(policy.check(0)).to.be.equal(false);
      expect(policy.check([])).to.be.equal(false);
      expect(policy.check({})).to.be.equal(false);
    });

    it('should fail with password length of less than 6 characters', function () {
      expect(policy.check('')).to.be.equal(false);
      expect(policy.check('helo')).to.be.equal(false);
      expect(policy.check('hello')).to.be.equal(false);
    });
    it('should work with password length of 6 or more characters', function () {
      expect(policy.check('mypwd!')).to.be.equal(true);
      expect(policy.check('goodpassword')).to.be.equal(true);
    });
  });
  describe('toString', function () {
    it('should describe policy correctly', function () {
      var policy = createPolicy('low');
      expect(policy.toString()).to.equal(lowPolicyDescription);
    });
  });
});
