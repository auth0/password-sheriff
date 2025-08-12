var expect = require('chai').expect;

var createPolicy = require('../index');
var { PasswordPolicy, createRulesFromSimpleConfig } = createPolicy;

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
      expect(goodPolicy).to.be.ok;
      expect(excellentPolicy).to.be.ok;
    });

    it('should default to "none" when there is an invalid policy name', function () {
      var invalid = createPolicy('asd');

      expect(invalid).to.be.ok;
      expect(invalid.check('')).to.be.equal(false);
      expect(invalid.check('a')).to.be.equal(true);
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

  describe("createRulesFromSimpleConfig helper", function () {
    describe("min_length", function () {
      it("should test min_length from 1 to 72", function () {
        var auth0Config1 = {
          min_length: 1,
          identical_characters: "allow",
        };
        var policy1 = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config1)
        );
        expect(policy1.check("a")).to.be.equal(true);
        expect(policy1.check("")).to.be.equal(false);

        var auth0Config72 = {
          min_length: 72,
          identical_characters: "allow",
        };
        var policy72 = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config72)
        );
        var longPassword = "x".repeat(72);
        expect(policy72.check(longPassword)).to.be.equal(true);
        expect(policy72.check(longPassword.slice(1))).to.be.equal(false);
      });
    });

    describe("character_types", function () {
      it("should enforce required character types", function () {
        var auth0Config = {
          character_types: ["lowercase", "uppercase", "number", "special"],
          identical_characters: "allow",
          min_length: 4, // Explicit short length to focus on character type testing
        };
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );
        expect(policy.check("aB1!")).to.be.equal(true);
        expect(policy.check("ab1!")).to.be.equal(false); // missing uppercase
      });
    });

    describe("3of4_character_types", function () {
      it("should enforce 3 out of 4 character types when all 4 types are specified", function () {
        var auth0Config = {
          character_types: ["lowercase", "uppercase", "number", "special"],
          "3of4_character_types": true,
          identical_characters: "allow",
          min_length: 3,
        };
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );
        expect(policy.check("aB1")).to.be.equal(true);
        expect(policy.check("aB")).to.be.equal(false);
      });

      it("should throw an error when 3of4_character_types is used without all 4 character types", function () {
        expect(function () {
          var auth0Config = {
            character_types: ["lowercase", "uppercase"],
            "3of4_character_types": true,
          };
          createRulesFromSimpleConfig(auth0Config);
        }).to.throw(
          "3of4_character_types can only be used when all four character types (lowercase, uppercase, number, special) are selected"
        );
      });
    });

    describe("identical_characters", function () {
      it("should disallow more than 2 identical characters when specified", function () {
        var auth0Config = {
          identical_characters: "disallow",
        };
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );
        expect(policy.check("aaabxyzuvwqrstu")).to.be.equal(false); // has 'aaa'
        expect(policy.check("aabxyzuvwqrstuv")).to.be.equal(true); // only 'aa'
      });

      it("should allow more than 2 identical characters when specified", function () {
        var auth0Config = {
          identical_characters: "allow",
        };
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );
        expect(policy.check("aaab" + "x".repeat(11))).to.be.equal(true);
      });
    });

    describe("default values", function () {
      it("should apply default values when not specified", function () {
        var auth0Config = {};
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );
        expect(policy.check("short")).to.be.equal(false); // too short (< 15)
        expect(policy.check("123456789012345")).to.be.equal(true); // exactly 15, no identical chars
        expect(policy.check("aaaabbbbcccccdd")).to.be.equal(false); // 15 chars but has identical chars (disallowed by default)
      });

      it("should allow overriding default values", function () {
        var auth0Config = {
          min_length: 5,
          identical_characters: "allow",
        };
        var policy = new PasswordPolicy(
          createRulesFromSimpleConfig(auth0Config)
        );

        expect(policy.check("aaaaa")).to.be.equal(true); // 5 chars, identical allowed
      });
    });
  });
});
