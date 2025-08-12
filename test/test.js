var expect = require('chai').expect;

var createPolicy = require('../index');
var PasswordPolicy = createPolicy.PasswordPolicy;

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

  describe('helper functions', function () {
    it('should return a default config from getDefaultConfig', function () {
      var defaultConfig = createPolicy.getDefaultConfig();
      expect(defaultConfig).to.deep.equal({
        min_length: 15,
        character_types: [],
        '3of4_character_types': false,
        identical_characters: "disallow",
        sequential_characters: "disallow"
      });
    });

    it('should create a custom policy', function () {
      var auth0Config = { password_options: { complexity: { min_length: 10 } } };
      var policy = new PasswordPolicy(createPolicy.createRulesFromAuth0Config(auth0Config));
      expect(policy.check('short')).to.be.false;
      expect(policy.check('longenough')).to.be.true;
    });
  });

});
