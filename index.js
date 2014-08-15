/**
 * Error thrown when asserting a policy against a password.
 *
 * @class PasswordPolicyError
 * @constructor
 *
 * @param {String} msg Descriptive message of the error
 */
function PasswordPolicyError(msg) {
  var err = Error.call(this, msg);
  err.name = 'PasswordPolicyError';
  return err;
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

var charsets = require('./rules/contains').charsets;

var rulesToApply = {
  length:           require('./rules/length'),
  contains:         require('./rules/contains'),
  containsAtLeast:  require('./rules/containsAtLeast'),
  identicalChars:   require('./rules/identicalChars'),
  // TODO Remove me
  // // Composed (or) vs Basic (length, contains)
  // or: function (options, password) {
  //   return options.rules.some(function (ruleOptions) {
  //     var rule = rulesToApply[ruleOptions.name];

  //     // If no rule is set, by default we deny this check
  //     if (!rule) {
  //       return false;
  //     }

  //     return rule(ruleOptions, password);
  //   });
  // }
};

var upperCase         = charsets.upperCase;
var lowerCase         = charsets.lowerCase;
var numbers           = charsets.numbers;
var specialCharacters = charsets.specialCharacters;


var policiesByName = {
  none: {
    rules: {
      length: { minLength: 1 }
    }
  },
  low: {
    rules: {
      length: { minLength: 6 }
    },
  },
  fair: {
    rules: {
      length: { minLength: 8 },
      contains: {
        expressions: [lowerCase, upperCase, numbers]
      }
    }
  },
  good: {
    rules: {
      length: { minLength: 8 },
      containsAtLeast: {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters]
      }
    }
  },
  excellent: {
    rules: {
      length: { minLength: 10 },
      containsAtLeast: {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters]
      },
      identicalChars: { max: 2 }
    }
  }
};

function reducePolicy(policy, fn, value) {
  return Object.keys(policy.rules).reduce(function (result, ruleName) {
    var ruleOptions = policy.rules[ruleName];
    var rule = rulesToApply[ruleName];

    return fn(result, ruleOptions, rule);

  }, value);
}

function applyRules (policy, password) {
  return reducePolicy(policy, function (result, ruleOptions, rule) {
    // If previous result was false as this an &&, then nothing to do here!
    if (!result) {
      return false;
    }

    if (!rule) {
      return false;
    }

    return rule.assert(ruleOptions, password);
  }, true);
}

function missing (policy, password) {
  return reducePolicy(policy, function (result, ruleOptions, rule) {
    result.push(rule.missing(ruleOptions, password));

    return result;
  }, []);
}

function explain (policy) {
  return reducePolicy(policy, function (result, ruleOptions, rule) {
    result.push(rule.explain(ruleOptions));

    return result;
  }, []);
}

function flatDescriptions (descriptions, index) {

  function flatSingleDescription (description, index) {
    var spaces = (new Array(index)).join(' ');
    if (isString(description)) {
      return spaces + '* ' + description;
    }
    return spaces + flatDescriptions(description, index + 1);
  }

  var firstDescription = flatSingleDescription(descriptions[0], index);

  descriptions = descriptions.slice(1).reduce(function (result, description) {
    result += '\n' + flatSingleDescription(description, index);

    return result;
  }, firstDescription);

  return descriptions;
}


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
      if (!isString(password)) {
        return false;
      }

      return applyRules(policy, password);
    },
    /**
     * @method assert
     * Asserts that a passord meets this policy else throws an exception.
     
     * @param {String} password
     */
    assert: function (password) {
      if (!this.check(password)) {
        throw new PasswordPolicyError('Password does not meet password policy');
      }
    },

    missing: function (password) {
      return missing(policy, password);
    },

    explain: function () {
      return explain(policy);
    },

    /**
     * Friendly string representation of the policy
     * @method toString
     */
    toString: function () {
      var descriptions = this.explain();
      return flatDescriptions(descriptions, 0);
    }
  };
};

module.exports.rulesToApply = rulesToApply;
