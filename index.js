var specialCharactersRegexp = require('./lib/special_characters');

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

var rulesToApply = {
  length: function (options, password) {
    return options.minLength <= password.length;
  },
  contains: function (options, password) {
    return options.expressions && options.expressions.every(function (expression) {
      return expression.test(password);
    });
  },
  or: function (options, password) {
    return options.rules.some(function (ruleOptions) {
      var rule = rulesToApply[ruleOptions.name];

      // If no rule is set, by default we deny this check
      if (!rule) {
        return false;
      }

      return rule(ruleOptions, password);
    });
  }
};

var policiesByName = {
  none: {
    rules: [{ name: 'length', minLength: 1 }],
    description: '* Non-empty password required.'
  },
  low: {
    rules: [{ name: 'length', minLength: 6, }],
    description: '* 6 characters in length any type.'
  },
  fair: {
    rules: [{ name: 'length', minmLength: 8, }, {
      name: 'contains',
      expressions: [/[A-Z]/, /[a-z]/, /[0-9]/],
    }],
    description:  '* 8 characters in length \n' +
      '* contain at least 3 of the following 3 types of characters: \n' +
      ' * lower case letters (a-z), \n' +
      ' * upper case letters (A-Z), \n' +
      ' * numbers (i.e. 0-9)'
  },
  good: {
    rules: [{ name: 'length', minLength: 8 }, {
      name: 'or',
      rules: [{
        name: 'contains',
        expressions: [ /[a-z]/, /[A-Z]/, /\d/ ]
      }, {
        name: 'contains',
        expressions: [ /[a-z]/, /[A-Z]/, specialCharactersRegexp ]
      }, {
        name: 'contains',
        expressions: [ /[a-z]/, /\d/, specialCharactersRegexp ]
      }, {
        name: 'contains',
        expressions: [ /[A-Z]/, /\d/, specialCharactersRegexp ]
      }]
    }],
    description: '* 8 characters in length \n' +
      '* contain at least 3 of the following 4 types of characters: \n' +
      ' * lower case letters (a-z), \n' +
      ' * upper case letters (A-Z), \n' +
      ' * numbers (i.e. 0-9), \n' +
      ' * special characters (e.g. !@#$%^&*)'
  },
  excellent: {
    rules: [{ name: 'length', minLength: 10 }, {
      name: 'or',
      rules: [{
        name: 'contains',
        expressions: [ /[a-z]/, /[A-Z]/, /\d/ ]
      }, {
        name: 'contains',
        expressions: [ /[a-z]/, /[A-Z]/, specialCharactersRegexp ]
      }, {
        name: 'contains',
        expressions: [ /[a-z]/, /\d/, specialCharactersRegexp ]
      }, {
        name: 'contains',
        expressions: [ /[A-Z]/, /\d/, specialCharactersRegexp ]
      }]
    }],
    description: '* 10 characters in length \n' +
      '* contain at least 3 of the following 4 types of characters: \n' +
      ' * lower case letters (a-z), \n' +
      ' * upper case letters (A-Z), \n' +
      ' * numbers (i.e. 0-9), \n' +
      ' * special characters (e.g. !@#$%^&*)'
  }
};

function applyRules(policy, password) {
  return policy.rules.reduce(function (result, ruleOptions) {
    // If previous result was false as this an &&, then nothing to do here!
    if (!result) {
      return false;
    }

    var rule = rulesToApply[ruleOptions.name];

    if (!rule) {
      return false;
    }

    return rule(ruleOptions, password);
  }, true);
}

module.exports.specialCharactersRegexp = specialCharactersRegexp;

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
    /**
     * Friendly string representation of the policy
     * @method toString
     */
    toString: function () {
      return policy.description;
    }
  };
};
