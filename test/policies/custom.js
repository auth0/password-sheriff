var expect = require("chai").expect;
var createPolicy = require("../../index");
var PasswordPolicy = createPolicy.PasswordPolicy;
var createRulesFromAuth0Config = createPolicy.createRulesFromAuth0Config;

describe("custom policy configuration", function () {
  describe("min_length", function () {
    it("should test min_length from 1 to 72", function () {
      var auth0Config1 = {
        password_options: {
          complexity: {
            min_length: 1,
            identical_characters: "allow",
            sequential_characters: "allow",
          },
        },
      };
      var policy1 = new PasswordPolicy(createRulesFromAuth0Config(auth0Config1));
      expect(policy1.check("a")).to.be.equal(true);
      expect(policy1.check("")).to.be.equal(false);

      var auth0Config72 = {
        password_options: {
          complexity: {
            min_length: 72,
            identical_characters: "allow",
            sequential_characters: "allow",
          },
        },
      };
      var policy72 = new PasswordPolicy(createRulesFromAuth0Config(auth0Config72));
      var longPassword = "x".repeat(72);
      expect(policy72.check(longPassword)).to.be.equal(true);
      expect(policy72.check(longPassword.slice(1))).to.be.equal(false);
    });
  });

  describe("character_types", function () {
    it("should enforce required character types", function () {
      var auth0Config = {
        password_options: {
          complexity: {
            character_types: ["lowercase", "uppercase", "number", "special"],
            identical_characters: "allow",
            sequential_characters: "allow",
          },
        },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("aB1!")).to.be.equal(true);
      expect(policy.check("ab1!")).to.be.equal(false); // missing uppercase
    });
  });

  describe("3of4_character_types", function () {
    it("should enforce 3 out of 4 character types when all 4 types are specified", function () {
      var auth0Config = {
        password_options: {
          complexity: {
            character_types: ["lowercase", "uppercase", "number", "special"],
            "3of4_character_types": true,
            identical_characters: "allow",
            sequential_characters: "allow",
          },
        },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("aB1")).to.be.equal(true);
      expect(policy.check("aB")).to.be.equal(false);
    });

    it("should throw an error when 3of4_character_types is used without all 4 character types", function () {
      expect(function () {
        var auth0Config = {
          password_options: {
            complexity: {
              character_types: ["lowercase", "uppercase"],
              "3of4_character_types": true,
            },
          },
        };
        createRulesFromAuth0Config(auth0Config);
      }).to.throw(
        "3of4_character_types can only be used when all four character types (lowercase, uppercase, number, special) are selected"
      );
    });
  });

  describe("identical_characters", function () {
    it("should disallow more than 2 identical characters when specified", function () {
      var auth0Config = {
        password_options: { complexity: { identical_characters: "disallow" } },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("aaabxyzuvwqrstu")).to.be.equal(false); // has 'aaa'
      expect(policy.check("aabxyzuvwqrstuv")).to.be.equal(true); // only 'aa'
    });

    it("should allow more than 2 identical characters when specified", function () {
      var auth0Config = {
        password_options: { complexity: { identical_characters: "allow" } },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("aaab" + "x".repeat(11))).to.be.equal(true);
    });
  });

  describe("sequential_characters", function () {
    it("should disallow sequential characters when specified", function () {
      var auth0Config = {
        password_options: { complexity: { sequential_characters: "disallow" } },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("x" + "z".repeat(14))).to.be.equal(true); // no sequential
      expect(policy.check("abc" + "z".repeat(12))).to.be.equal(false); // has abc
      expect(policy.check("123" + "z".repeat(12))).to.be.equal(false); // has 123
    });

    it("should allow sequential characters when specified", function () {
      var auth0Config = {
        password_options: { complexity: { sequential_characters: "allow" } },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check("abc" + "z".repeat(12))).to.be.equal(true);
    });
  });

  describe("edge cases", function () {
    it("should handle null or empty policy object", function () {
      var nullPolicy = createPolicy(null);
      expect(nullPolicy.check("anypassword")).to.be.equal(true);
      var emptyPolicy = createPolicy({});
      expect(emptyPolicy.check("anypassword")).to.be.equal(true);
    });

    it("should handle invalid password inputs", function () {
      var auth0Config = { password_options: { complexity: { min_length: 8 } } };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));
      expect(policy.check(null)).to.be.equal(false);
      expect(policy.check(undefined)).to.be.equal(false);
    });
  });

  describe("default values", function () {
    it("should apply default values when not specified", function () {
      // Test with empty complexity object - should use defaults
      var auth0Config = { password_options: { complexity: {} } };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));

      // With defaults: min_length: 15, identical_characters: "disallow", sequential_characters: "disallow"
      expect(policy.check("short")).to.be.equal(false); // too short (< 15)
      expect(policy.check("ax1bz2cy3dw4ev5")).to.be.equal(true); // exactly 15, no identical/sequential chars
      expect(policy.check("aaabbbcccdddeee")).to.be.equal(false); // 15 chars but has identical chars (disallowed by default)
      expect(policy.check("abcdefghijklmno")).to.be.equal(false); // 15 chars but has sequential chars (disallowed by default)
    });

    it("should allow overriding default values", function () {
      var auth0Config = {
        password_options: {
          complexity: {
            min_length: 5,
            identical_characters: "allow",
            sequential_characters: "allow",
          },
        },
      };
      var policy = new PasswordPolicy(createRulesFromAuth0Config(auth0Config));

      expect(policy.check("aaaaa")).to.be.equal(true); // 5 chars, identical allowed
      expect(policy.check("abcde")).to.be.equal(true); // 5 chars, sequential allowed
    });
  });
});
