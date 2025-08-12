
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
    },
  };
};

module.exports.PasswordPolicy = PasswordPolicy;

module.exports.createRulesFromAuth0Config = createRulesFromAuth0Config;

module.exports.charsets = charsets;

/**
 * @typedef {Object} Auth0PasswordConfig
 * @property {number} [min_length] - Minimum password length (1-72)
 * @property {Array<'uppercase'|'lowercase'|'number'|'special'>} [character_types] - Required character types
 * @property {boolean} ['3of4_character_types'] - Whether to require 3 out of 4 character types (requires all 4 types to be specified)
 * @property {'allow'|'disallow'} [identical_characters] - Whether to allow >2 identical consecutive characters
 */

/**
 * Translates from the auth0 connection configuration format
 * to the internal PasswordPolicy rules format
 *
 * @param {Auth0PasswordConfig} config - Auth0 connection configuration object
 * @returns {Object} Rules configuration object that can be passed to PasswordPolicy constructor
 */
function createRulesFromAuth0Config(config = {}) {
  var internalConfig = {};

  // Apply defaults for any missing values
  var defaults = {
    min_length: 15,
    character_types: [],
    "3of4_character_types": false,
    identical_characters: "disallow",
  };

  var normalizedConfig = {
    min_length: config.min_length ?? defaults.min_length,
    character_types: config.character_types ?? defaults.character_types,
    "3of4_character_types": config["3of4_character_types"] ?? defaults["3of4_character_types"],
    identical_characters: config.identical_characters ?? defaults.identical_characters,
  };

  // Validate min_length is within acceptable range
  if (normalizedConfig.min_length < 1 || normalizedConfig.min_length > 72) {
    throw new Error(
      "min_length must be between 1 and 72"
    );
  }

  // Handle min_length
  if (normalizedConfig.min_length !== undefined) {
    internalConfig.length = { minLength: normalizedConfig.min_length };
  }

  // Handle character_types and 3of4_character_types
  var requiredTypes = normalizedConfig.character_types || [];
  var require3of4 = normalizedConfig["3of4_character_types"];

  // Validate 3of4_character_types prerequisite
  if (require3of4) {
    var hasAllFourTypes = ["lowercase", "uppercase", "number", "special"].every(function (type) {
      return requiredTypes.includes(type);
    });

    if (!hasAllFourTypes) {
      throw new Error(
        "3of4_character_types can only be used when all four character types (lowercase, uppercase, number, special) are selected"
      );
    }
  }

  if (requiredTypes.length > 0 || require3of4) {
    var expressions = [];

    if (require3of4) {
      // Use containsAtLeast with 3 out of 4
      internalConfig.containsAtLeast = {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters],
      };
    } else {
      // Map character types to expressions
      if (requiredTypes.includes("lowercase")) {
        expressions.push(lowerCase);
      }
      if (requiredTypes.includes("uppercase")) {
        expressions.push(upperCase);
      }
      if (requiredTypes.includes("number")) {
        expressions.push(numbers);
      }
      if (requiredTypes.includes("special")) {
        expressions.push(specialCharacters);
      }

      internalConfig.contains = {
        expressions: expressions,
      };
    }
  }

  // Handle identical_characters - convert "allow"/"disallow" to internal format
  if (normalizedConfig.identical_characters === "disallow") {
    internalConfig.identicalChars = { max: 2 };
  }

  return internalConfig;
}
