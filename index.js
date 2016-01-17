
var charsets = require('./lib/rules/contains').charsets;

var upperCase         = charsets.upperCase;
var lowerCase         = charsets.lowerCase;
var numbers           = charsets.numbers;
var specialCharacters = charsets.specialCharacters;

var PasswordPolicy = require('./lib/policy');

var none =  new PasswordPolicy({
  length: { minLength: 1 }
});

var low = new PasswordPolicy({
  length: { minLength: 6 }
});

var fair = new PasswordPolicy({
  length: { minLength: 8 },
  contains: {
    expressions: [lowerCase, upperCase, numbers]
  }
});

var good = new PasswordPolicy({
  length: { minLength: 8 },
  containsAtLeast: {
    atLeast: 3,
    expressions: [lowerCase, upperCase, numbers, specialCharacters]
  }
});

var excellent = new PasswordPolicy({
  length: { minLength: 10 },
  containsAtLeast: {
    atLeast: 3,
    expressions: [lowerCase, upperCase, numbers, specialCharacters]
  },
  identicalChars: { max: 2 }
});

var policiesByName = {
  none:       none,
  low:        low,
  fair:       fair,
  good:       good,
  excellent:  excellent
};

/**
 * Creates a password policy.
 *
 * @param {String} policyName Name of policy to use.
 */
module.exports = function (policyName) {
  var policy = policiesByName[policyName] || policiesByName.none;

  return {
    /**
     * Checks that a password meets this policy
     *
     * @method check
     * @param {String} password
     */
    check: function (password) {
      return policy.check(password);
    },
    /**
     * @method assert
     * Asserts that a passord meets this policy else throws an exception.
     *
     * @param {String} password
     */
    assert: function (password) {
      return policy.assert(password);
    },

    missing: function (password) {
      return policy.missing(password);
    },

    missingAsMarkdown: function (password) {
      return policy.missingAsMarkdown(password);
    },

    explain: function () {
      return policy.explain();
    },

    /**
     * Friendly string representation of the policy
     * @method toString
     */
    toString: function () {
      return policy.toString();
    }
  };
};

module.exports.PasswordPolicy = PasswordPolicy;

module.exports.charsets = charsets;

// module.exports.rulesToApply = rulesToApply;
