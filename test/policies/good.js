var expect = require('chai').expect;

var createPolicy = require('../../index');

var goodPolicyDescription = '* At least 8 characters in length\n' +
  '* Contain at least 3 of the following 4 types of characters:\n' +
  ' * lower case letters (a-z)\n' +
  ' * upper case letters (A-Z)\n' +
  ' * numbers (i.e. 0-9)\n' +
  ' * special characters (e.g. !@#$%^&*)';

describe('good policy ' + goodPolicyDescription, function () {
  describe('check', function () {
    var policy = createPolicy('good');
    it('should fail with password length of less than 8 characters', function () {
      expect(policy.check('')).to.be.equal(false);
      expect(policy.check('hello')).to.be.equal(false);
      expect(policy.check('7C arac')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except lower case chracters', function () {
      expect(policy.check('HELLO123')).to.be.equal(false);
      expect(policy.check('HELLO1234BYE')).to.be.equal(false);

      expect(policy.check('!@ HELLO')).to.be.equal(false);
      expect(policy.check('!@#     HELLO')).to.be.equal(false);

      expect(policy.check('1234!@# ')).to.to.equal(false);
      expect(policy.check('1234!@# 999')).to.to.equal(false);

    });

    it('should fail if it does contain characters from two groups except upper case characters', function () {
      expect(policy.check('hello@# ')).to.be.equal(false);
      expect(policy.check('hello  !@# ')).to.be.equal(false);

      expect(policy.check('1234@# ')).to.be.equal(false);
      expect(policy.check('1234!@# 123')).to.be.equal(false);

      expect(policy.check('helo1234')).to.be.equal(false);
      expect(policy.check('hello1234567')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except numerical characters', function () {
      expect(policy.check('hello!@# ')).to.be.equal(false);
      expect(policy.check('hello  !@# ')).to.be.equal(false);

      expect(policy.check('@# HELLO')).to.be.equal(false);
      expect(policy.check('!@#     HELLO')).to.be.equal(false);

      expect(policy.check('helloHELLO')).to.be.equal(false);
      expect(policy.check('helloHELLOBYE')).to.be.equal(false);
    });

    it('should fail if it does contain characters from two groups except symbol characters', function () {
      expect(policy.check('helloHEL')).to.be.equal(false);
      expect(policy.check('helloHELLOBYE')).to.be.equal(false);

      expect(policy.check('hello123')).to.be.equal(false);
      expect(policy.check('hello1234567')).to.be.equal(false);

      expect(policy.check('HELLO123')).to.be.equal(false);
      expect(policy.check('HELLO1234BYE')).to.be.equal(false);
    });

    it('should work if password meets previous criteria', function () {
      expect(policy.check('someP1! ')).to.be.equal(true);
      expect(policy.check('somePASSWORD123!@# ')).to.be.equal(true);
    });
  });
    describe('toString', function () {
      it('should describe policy correctly', function () {
        var policy = createPolicy('good');
        expect(policy.toString()).to.equal(goodPolicyDescription);
      });
    });

});
