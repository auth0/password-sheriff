var charsets = require('./lib/rules/contains').charsets;

var upperCase         = charsets.upperCase;
var lowerCase         = charsets.lowerCase;
var numbers           = charsets.numbers;
var specialCharacters = charsets.specialCharacters;

/**
 * Enum for character types
 * @constant
 * @type {Object}
 */
var CHARACTER_TYPES = {
  LOWERCASE: "lowercase",
  UPPERCASE: "uppercase", 
  NUMBER: "number",
  SPECIAL: "special"
};

/**
 * @typedef {Object} PasswordOptions
 * @property {number} [min_length=15] - Minimum password length (1-72)
 * @property {Array<'uppercase'|'lowercase'|'number'|'special'>} [character_types=[]] - Required character types
 * @property {boolean} [require_3of4_character_types=false] - Whether to require 3 out of 4 character types (requires all 4 types to be specified)
 * @property {'allow'|'disallow'} [identical_characters='disallow'] - Whether to allow >2 identical consecutive characters
 */

/**
 * Default values for password options
 * @constant
 * @type {PasswordOptions}
 */
var DEFAULT_PASSWORD_OPTIONS = {
  min_length: 15,
  character_types: [],
  require_3of4_character_types: false,
  identical_characters: "disallow",
};

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

module.exports.createRulesFromOptions = createRulesFromOptions;

module.exports.charsets = charsets;

/**
 * Creates a PasswordPolicy rules configuration from a simplified password options format.
 * This provides an easier way to configure password policies without needing to
 * understand the internal rule structure.
 *
 * @param {PasswordOptions} options - Simplified password options object
 * @returns {Object} Rules configuration object that can be passed to PasswordPolicy constructor
 */
function createRulesFromOptions(options = {}) {
  var rules = {};

  // Apply defaults for any missing values
  var normalizedOptions = {
    min_length: options.min_length ?? DEFAULT_PASSWORD_OPTIONS.min_length,
    character_types: options.character_types ?? DEFAULT_PASSWORD_OPTIONS.character_types,
    require_3of4_character_types: options.require_3of4_character_types ?? DEFAULT_PASSWORD_OPTIONS.require_3of4_character_types,
    identical_characters: options.identical_characters ?? DEFAULT_PASSWORD_OPTIONS.identical_characters,
  };

  // Validate min_length is within acceptable range
  if (normalizedOptions.min_length < 1 || normalizedOptions.min_length > 72) {
    throw new Error(
      "min_length must be between 1 and 72"
    );
  }

  // Handle min_length
  rules.length = { minLength: normalizedOptions.min_length };

  var requiredTypes = normalizedOptions.character_types;
  var require3of4 = normalizedOptions.require_3of4_character_types;

  // Validate require_3of4_character_types prerequisite
  if (require3of4) {
    var hasAllFourTypes = Object.values(CHARACTER_TYPES).every(function (type) {
      return requiredTypes.includes(type);
    });

    if (!hasAllFourTypes) {
      throw new Error(
        `require_3of4_character_types can only be used when all four character types (${Object.values(CHARACTER_TYPES).join(", ")}) are selected`
      );
    }
  }

  if (requiredTypes.length > 0 || require3of4) {
    var expressions = [];

    if (require3of4) {
      // Use containsAtLeast with 3 out of 4
      rules.containsAtLeast = {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters],
      };
    } else {
      // Map character types to expressions
      if (requiredTypes.includes(CHARACTER_TYPES.LOWERCASE)) {
        expressions.push(lowerCase);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.UPPERCASE)) {
        expressions.push(upperCase);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.NUMBER)) {
        expressions.push(numbers);
      }
      if (requiredTypes.includes(CHARACTER_TYPES.SPECIAL)) {
        expressions.push(specialCharacters);
      }

      rules.contains = {
        expressions: expressions,
      };
    }
  }

  // Handle identical_characters - convert "allow"/"disallow" to internal format
  if (normalizedOptions.identical_characters === "disallow") {
    rules.identicalChars = { max: 2 };
  }

  return rules;
}
