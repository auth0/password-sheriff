var expect = require('chai').expect;

var createPolicy = require('../index');
var specialCharactersRegexp = require('../lib/special_characters');

var nonePolicyDescription = '* Non-empty password required.';

var lowPolicyDescription = '* 6 characters in length any type.';

var fairPolicyDescription = '* 8 characters in length \n' +
  '* contain at least 3 of the following 3 types of characters: \n' +
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
  ' * special characters (e.g. !@#$%^&*)\n' +
  '* not more than 2 identical characters in a row (e.g., 111 not allowed)';

describe('password-sheriff', function () {
  describe('specialCharactersRegexp', function () {
    it('should handle all OWASP symbols correctly', function () {
      var symbols = [' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_','`','{','|', '}','~'];

      expect(symbols.every(function (symbol) {
        var value = specialCharactersRegexp.test(symbol);
        if (!value) {
          throw symbol;
        }
        return specialCharactersRegexp.test(symbol);
      })).to.equal(true);
    });

    it('should not handle characters that are non-symbols', function () {
      var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

      expect(alphanum.some(function (symbol) {
        var value = specialCharactersRegexp.test(symbol);
        if (value) {
          throw symbol;
        }
        return specialCharactersRegexp.test(symbol);
      })).to.equal(false);
    });
  });

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
      expect(goodPolicy).to.be.ok;
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
        expect(policy.check('')).to.be.equal(false);
        expect(policy.check('helo')).to.be.equal(false);
        expect(policy.check('hello')).to.be.equal(false);
      });
      it('should work with password length of 6 or more characters', function () {
        expect(policy.check('mypwd!')).to.be.equal(true);
        expect(policy.check('goodpassword')).to.be.equal(true);
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
        expect(policy.check('someP123')).to.be.equal(false);
        expect(policy.check('somePASSWORD123')).to.be.equal(false);
      });
    });

    describe('good policy ' + goodPolicyDescription, function () {
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

    describe('excellent policy' + excellentPolicyDescription, function () {
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

  });

  describe('assert', function () {
    it('should throw an exception when policy check fails', function () {
      var policy = createPolicy(undefined);
      expect(function () { policy.assert(''); }).to.throw(/Password does not meet password policy/);
    });

    it('should not thrown an exception when policy check passes', function () {
      var policy = createPolicy(undefined);
      expect(function () { policy.assert('hello'); }).not.to.throw(/Password does not meet password policy/);
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
