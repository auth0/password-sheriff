var expect = require('chai').expect;

var createPolicy = require('./index');

var nonePolicyDescription = '* Non-empty password required.';

var lowPolicyDescription = '* 6 characters in length any type.';

var fairPolicyDescription = '* 8 characters in length \n' +
  '* contain at least 3 of the following 4 types of characters: \n' +
  ' * lower case letters (a-z), \n' +
  ' * upper case letters (A-Z), \n' +
  ' * numbers (i.e. 0-9)';

var goodPolicyDescription = '* 8 characters in length \n' +
  '* contain at least 3 of the following 4 types of characters: \n' +
  ' * lower case letters (a-z), \n' +
  ' * upper case letters (A-Z), \n' +
  ' * numbers (i.e. 0-9), \n' +
  ' * special characters (e.g. !@#$%^&*)';

var excellentPolicyDescription = '* 10 characters in length \n' +
  '* contain at least 3 of the following 4 types of characters: \n' +
  ' * lower case letters (a-z), \n' +
  ' * upper case letters (A-Z), \n' +
  ' * numbers (i.e. 0-9), \n' +
  ' * special characters (e.g. !@#$%^&*)';

describe('password-sheriff', function () {
  describe('createPolicy', function () {
    it('should support empty and undefined policies', function () {
      var undefinedPolicy = createPolicy(undefined);
      var emptyPolicy = createPolicy({});

      expect(undefinedPolicy).to.be.ok;
      expect(emptyPolicy).to.be.ok;
    });

    it('should support "low", "fair", "good" and "excellent" default policies', function () {
      var lowPolicy = createPolicy('low');
      var fairPolicy = createPolicy('fair');
      var goodPolicy = createPolicy('good');
      var excellentPolicy = createPolicy('excellent');

      expect(lowPolicy).to.be.ok;
      expect(fairPolicy).to.be.ok;
      excellentPolicy(goodPolicy).to.be.ok;
      expect(excellentPolicy).to.be.ok;
    });
  });

  describe('check', function () {
    describe('none policy: ' + nonePolicyDescription, function () {
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

    describe('low policy:' + lowPolicyDescription, function () {
      var policy = createPolicy('low');

      it('should fail with invalid values', function () {
        expect(policy.check(undefined)).to.be.equal(false);
        expect(policy.check(null)).to.be.equal(false);
        expect(policy.check(0)).to.be.equal(false);
        expect(policy.check([])).to.be.equal(false);
        expect(policy.check({})).to.be.equal(false);
      });

      it('should fail with password length of less than 6 characters', function () {
        policy.check('');
        policy.check('hello');
        policy.check('hellob');
      });
      it('should work with password length of 6 or more characters', function () {
        policy.check('mypwd!');
        policy.check('goodpassword');
      });
    });

    describe('fair policy' + fairPolicyDescription, function () {
      var policy = createPolicy('fair');

      it('should fail with invalid values', function () {
        expect(policy.check(undefined)).to.be.equal(false);
        expect(policy.check(null)).to.be.equal(false);
        expect(policy.check(0)).to.be.equal(false);
        expect(policy.check([])).to.be.equal(false);
        expect(policy.check({})).to.be.equal(false);
      });

      it('should fail with password length of less than 8 characters', function () {
        policy.check('');
        policy.check('hello');
        policy.check('7charac');
      });

      it('should fail if password does not contain at least a lower case letter', function () {
        policy.check('KTHXBYE123');
      });

      it('should fail if password does not contain at least an upper case letter', function () {
        policy.check('123hellogoodbye');
      });

      it('should fail if password does not contain at least a number', function () {
        policy.check('helloGOODBYE');
      });

      it('should work if password meets the previous criteria', function () {
        policy.check('someP123');
        policy.check('somePASSWORD123');
      });
    });

    describe('good policy', function () {
      /* TODO: Write strength level test
        * 8 characters in length
        * contain at least 3 of the following 4 types of characters:
        *  lower case letters (a-z)
        *  upper case letters (A-Z)
        *  numbers (i.e. 0-9)
        *  special characters (e.g. !@#$%^&*)
        */
    });

    describe('excellent policy', function () {
      /* TODO: Write strength level test
        * 10 characters in length
        * contain at least 3 of the following 4 types of characters:
        *  lower case letters (a-z),
        *  upper case letters (A-Z),
        *  numbers (i.e. 0-9),
        *  special characters (e.g. !@#$%^&*)
        */
    });

  });

  describe('assert', function () {
    it('should throw an exception when policy check fails', function () {
      var policy = createPolicy(undefined);
      expect(function () { policy.assert(''); }).to.throw(/PasswordPolicyError/);
    });

    it('should not thrown an exception when policy check passes', function () {
      var policy = createPolicy(undefined);
      expect(function () { policy.assert('hello'); }).not.to.throw(/PasswordPolicyError/);
    });
  });

  describe('toString', function () {
    describe('none policy', function () {
      it('should describe policy correctly', function () {
        var policy = createPolicy(undefined);
        expect(policy.toString()).to.equal(nonePolicyDescription);
      });

      describe('low policy', function () {
        it('should describe policy correctly', function () {
          var policy = createPolicy('low');
          expect(policy.toString()).to.equal(lowPolicyDescription);
        });
      });

      describe('fair policy', function () {
        it('should describe policy correctly', function () {
          var policy = createPolicy('fair');
          expect(policy.toString()).to.equal(fairPolicyDescription);
        });
      });

      describe('good policy', function () {
        it('should describe policy correctly', function () {
          var policy = createPolicy('good');
          expect(policy.toString()).to.equal(goodPolicyDescription);
        });
      });

      describe('excellent policy', function () {
        it('should describe policy correctly', function () {
          var policy = createPolicy('excellent');
          expect(policy.toString()).to.equal(excellentPolicyDescription);
        });
      });
    });
  });
});
