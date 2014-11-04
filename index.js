var format = require('util').format;

var _ = require('underscore');

var PasswordPolicyError = require('./lib/policy_error');

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

var charsets = require('./lib/rules/contains').charsets;

var upperCase         = charsets.upperCase;
var lowerCase         = charsets.lowerCase;
var numbers           = charsets.numbers;
var specialCharacters = charsets.specialCharacters;

var rulesToApply = {
  length:           require('./lib/rules/length'),
  contains:         require('./lib/rules/contains'),
  containsAtLeast:  require('./lib/rules/containsAtLeast'),
  identicalChars:   require('./lib/rules/identicalChars'),
};


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
    var missingRule = rule.missing(ruleOptions, password);
    result.rules.push(missingRule);
    result.verified = result.verified && !!missingRule.verified;
    return result;
  }, {rules: [], verified: true});
}

function explain (policy) {
  return reducePolicy(policy, function (result, ruleOptions, rule) {
    result.push(rule.explain(ruleOptions));
    return result;
  }, []);
}

function flatDescriptions (descriptions, index) {

  if (!descriptions.length) {
    return '';
  }

  function flatSingleDescription (description, index) {
    var spaces = (new Array(index+1)).join(' ');
    var result = spaces + '* ';
    if (description.format) {
      result += format.apply(null, [description.message].concat(description.format));
    } else {
      result += description.message;
    }

    if (description.items) {
      result += '\n' + spaces + flatDescriptions(description.items, index + 1);
    }
    return result;
  }

  var firstDescription = flatSingleDescription(descriptions[0], index);

  descriptions = descriptions.slice(1).reduce(function (result, description) {
    result += '\n' + flatSingleDescription(description, index);

    return result;
  }, firstDescription);

  return descriptions;
}



_.each(policiesByName, function (policy) {
  reducePolicy(policy, function (result, ruleOptions, rule) {
    rule.validate(ruleOptions);
  }, true);
});

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

    missingAsMarkdown: function (password) {
      return flatDescriptions(missing(policy, password), 1);
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
