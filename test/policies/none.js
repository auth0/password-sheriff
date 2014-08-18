var expect = require('chai').expect;

var createPolicy = require('../../index');

var nonePolicyDescription = '* Non-empty password required';

describe('none policy: ' + nonePolicyDescription, function () {
  describe('check', function () {
    var policy = createPolicy(undefined);

    it('should fail with invalid values', function () {
      expect(policy.check(undefined)).to.be.equal(false);
      expect(policy.check(null)).to.be.equal(false);
      expect(policy.check(0)).to.be.equal(false);
      expect(policy.check([])).to.be.equal(false);
      expect(policy.check({})).to.be.equal(false);
    });

    it('should fail with empty string', function () {
      expect(policy.check('')).to.be.equal(false);
    });
    it('should work with non-empty string', function () {
      expect(policy.check('a')).to.be.equal(true);
    });
  });
  describe('toString', function () {
    it('should describe policy correctly', function () {
      var policy = createPolicy(undefined);
      expect(policy.toString()).to.equal(nonePolicyDescription);
    });
  });
});
