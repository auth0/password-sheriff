var expect = require('chai').expect;

var createPolicy = require('../../index');

var excellentPolicyDescription = '* At least 10 characters in length\n' +
  '* Contain at least 3 of the following 4 types of characters:\n' +
  ' * lower case letters (a-z)\n' +
  ' * upper case letters (A-Z)\n' +
  ' * numbers (i.e. 0-9)\n' +
  ' * special characters (e.g. !@#$%^&*)\n' +
  '* No more than 2 identical characters in a row (e.g., "aaa" not allowed)';

describe('excellent policy' + excellentPolicyDescription, function () {
  describe('check', function () {
    var policy = createPolicy('excellent');
    it('should fail with password length of less than 10 characters', function () {
      expect(policy.check('')).to.be.equal(false);
      expect(policy.check('hello')).to.be.equal(false);
      expect(policy.check('7C arac#')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except lower case chracters', function () {
      expect(policy.check('HELLO12345')).to.be.equal(false);
      expect(policy.check('HELLO1234BYE')).to.be.equal(false);

      expect(policy.check('!@#  HELLO')).to.be.equal(false);
      expect(policy.check('!@#     HELLO')).to.be.equal(false);

      expect(policy.check('1234!@#   ')).to.to.equal(false);
      expect(policy.check('1234!@# 99999')).to.to.equal(false);

    });

    it('should fail if it does contain characters from two groups except upper case characters', function () {
      expect(policy.check('hello!@#  ')).to.be.equal(false);
      expect(policy.check('hello  !@#   ')).to.be.equal(false);

      expect(policy.check('1234!@#  ')).to.be.equal(false);
      expect(policy.check('1234!@#   123')).to.be.equal(false);

      expect(policy.check('hello12345')).to.be.equal(false);
      expect(policy.check('hello123456789')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except numerical characters', function () {
      expect(policy.check('hello!@#  ')).to.be.equal(false);
      expect(policy.check('hello  !@#  ')).to.be.equal(false);

      expect(policy.check('!# HELLOBY')).to.be.equal(false);
      expect(policy.check('!@#     HELLOBYEBYE')).to.be.equal(false);

      expect(policy.check('helloHELLO')).to.be.equal(false);
      expect(policy.check('helloHELLOBYE')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except symbol characters', function () {
      expect(policy.check('helloHELLO')).to.be.equal(false);
      expect(policy.check('helloHELLOBYE')).to.be.equal(false);

      expect(policy.check('hello12345')).to.be.equal(false);
      expect(policy.check('hello1234567')).to.be.equal(false);

      expect(policy.check('HELLO12345')).to.be.equal(false);
      expect(policy.check('HELLO1234BYE')).to.be.equal(false);
    });

    it('should fail if it does it repeats a character more than twice', function () {
      expect(policy.check('hello111HELLO')).to.be.equal(false);
    });

    it('should work if password meets previous criteria', function () {
      expect(policy.check('somePas1! ')).to.be.equal(true);
      expect(policy.check('somePas!! ')).to.be.equal(true);
      expect(policy.check('somePas123')).to.be.equal(true);
      expect(policy.check('some!as123')).to.be.equal(true);
      expect(policy.check('somePASSWORD123!@# ')).to.be.equal(true);
    });

  });
  describe('toString', function () {
    it('should describe policy correctly', function () {
      var policy = createPolicy('excellent');
      expect(policy.toString()).to.equal(excellentPolicyDescription);
    });
  });
});
