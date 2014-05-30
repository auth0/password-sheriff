var Combinatorics = require('js-combinatorics').Combinatorics;

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
var specialCharacters = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

var specialCharactersRegexp = new RegExp(specialCharacters.split('').join('\\|'));

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function applyCriteriaOverArguments(modifier) {
  return function () {
    var criteria = Array.prototype.slice.call(arguments);
    return function (value) {
      criteria[modifier](function (criterion) {
        return (criterion.test && criterion.test(value)) || criterion;
      });
    };
  };
}

var or  = applyCriteriaOverArguments('some');
var all = applyCriteriaOverArguments('every');

function combinationToArray(combination) {
  var i, result = [];

  if (!combination || !combination.sizeOf) {
    return result;
  }

  var combinationSize = combination.sizeOf();

  for(i = 0; i < combinationSize; i++) {
    result.push(combination.next());
  }

  return result;
}

var policiesByName = {
  none: {
    minimumLength: 1
  },
  low: {
    minimumLength: 6
  },
  fair: {
    minimumLength: 8,
    charactersToCheck: all(/[A-Z]/, /[a-z]/, /[0-9]/)
  },
  good: {
    minimumLength: 8,
    charactersToCheck: or(combinationToArray(
      Combinatorics.combination([/[a-z]/, /[A-Z]/, /\d/, specialCharactersRegexp], 3)
    ).map(all))
  },
  excellent: {
    minimumLength: 10,
    charactersToCheck: or(combinationToArray(
      Combinatorics.combination([/[a-z]/, /[A-Z]/, /\d/, specialCharactersRegexp], 3)
    ).map(all))
  }
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
     * @param {String} password
     */
    check: function (password) {
      if (!isString(password)) {
        return false;
      }

      if (password.length < policy.minimumLength) {
        return false;
      }

      if (policy.charactersToCheck && !policy.charactersToCheck(password) ) {
        return false;
      }

      return true;
    },
    /**
     * Asserts that a passord meets this policy else throws an exception.
     
     * @param {String} password
     */
    assert: function (password) {
      if (!this.check(password)) {
        throw new Error('Password does not meet password policy');
      }
    },
    /**
     * Friendly string representation of the policy
     */
    toString: function () {
      return '';
    }
  };
};
