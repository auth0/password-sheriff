
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

    _policy: policy,
  };
};

module.exports.PasswordPolicy = PasswordPolicy;

module.exports.createRulesFromAuth0Config = createRulesFromAuth0Config;

module.exports.charsets = charsets;

module.exports.getDefaultConfig = function () {
  return {
    min_length: 15,
    character_types: [],
    "3of4_character_types": false,
    identical_characters: "disallow",
    sequential_characters: "disallow",
  };
};

/**
 * @typedef {Object} Auth0PasswordConfig
 * @property {Object} [password_options] - Password options configuration
 * @property {Object} [password_options.complexity] - Password complexity settings
 * @property {number} [password_options.complexity.min_length] - Minimum password length (1-72)
 * @property {Array<'uppercase'|'lowercase'|'number'|'special'>} [password_options.complexity.character_types] - Required character types
 * @property {boolean} [password_options.complexity['3of4_character_types']] - Whether to require 3 out of 4 character types (requires all 4 types to be specified)
 * @property {'allow'|'disallow'} [password_options.complexity.identical_characters] - Whether to allow >2 identical consecutive characters
 * @property {'allow'|'disallow'} [password_options.complexity.sequential_characters] - Whether to allow >2 sequential characters
 */

/**
 * Translates from the auth0 connection.options.password_options
 * config format to the internal PasswordPolicy rules format
 *
 * @param {Auth0PasswordConfig} config - Auth0 connection configuration object
 * @returns {Object} Rules configuration object that can be passed to PasswordPolicy constructor
 */
function createRulesFromAuth0Config(config) {
  // Handle empty config - return rules for 'none' policy
  if (!config || Object.keys(config).length === 0) {
    return { length: { minLength: 1 } };
  }

  var internalConfig = {};

  // Extract complexity configuration
  var complexity =
    config.password_options && config.password_options.complexity;
  if (!complexity) {
    // If no complexity is specified, return rules for 'none' policy
    return { length: { minLength: 1 } };
  }

  // Apply defaults only for fields not explicitly specified
  var defaults = module.exports.getDefaultConfig();
  var normalizedComplexity = {
    min_length:
      complexity.min_length !== undefined
        ? complexity.min_length
        : Object.keys(complexity).length === 0
        ? defaults.min_length
        : undefined,
    character_types: complexity.character_types || [],
    "3of4_character_types":
      complexity["3of4_character_types"] !== undefined
        ? complexity["3of4_character_types"]
        : false,
    identical_characters:
      complexity.identical_characters !== undefined
        ? complexity.identical_characters
        : Object.keys(complexity).length === 0
        ? defaults.identical_characters
        : "allow",
    sequential_characters:
      complexity.sequential_characters !== undefined
        ? complexity.sequential_characters
        : Object.keys(complexity).length === 0
        ? defaults.sequential_characters
        : "allow",
  };

  // Handle min_length
  if (normalizedComplexity.min_length !== undefined) {
    internalConfig.length = { minLength: normalizedComplexity.min_length };
  }

  // Handle character_types and 3of4_character_types
  var requiredTypes = normalizedComplexity.character_types || [];
  var require3of4 = normalizedComplexity["3of4_character_types"];

  // Validate 3of4_character_types prerequisite
  if (require3of4) {
    var allFourTypes = ["lowercase", "uppercase", "number", "special"];
    var hasAllFour = allFourTypes.every(function (type) {
      return requiredTypes.includes(type);
    });

    if (!hasAllFour) {
      throw new Error(
        "3of4_character_types can only be used when all four character types (lowercase, uppercase, number, special) are selected"
      );
    }
  }

  if (requiredTypes.length > 0 || require3of4) {
    var expressions = [];

    // Map character types to expressions
    if (requiredTypes.includes("lowercase") || require3of4) {
      expressions.push(lowerCase);
    }
    if (requiredTypes.includes("uppercase") || require3of4) {
      expressions.push(upperCase);
    }
    if (requiredTypes.includes("number") || require3of4) {
      expressions.push(numbers);
    }
    if (requiredTypes.includes("special") || require3of4) {
      expressions.push(specialCharacters);
    }

    if (require3of4) {
      // Use containsAtLeast with 3 out of 4
      internalConfig.containsAtLeast = {
        atLeast: 3,
        expressions: expressions,
      };
    } else if (requiredTypes.length > 0) {
      // Use contains to require all specified types
      internalConfig.contains = {
        expressions: expressions,
      };
    }
  }

  // Handle identical_characters - convert "allow"/"disallow" to internal format
  if (normalizedComplexity.identical_characters === "disallow") {
    internalConfig.identicalChars = { max: 2 };
  }
  // If "allow", we don't add the rule (no restriction)

  // Handle sequential_characters - convert "allow"/"disallow" to internal format
  if (normalizedComplexity.sequential_characters === "disallow") {
    internalConfig.sequentialChars = { max: 2 };
  }
  // If "allow", we don't add the rule (no restriction)

  return internalConfig;
}
