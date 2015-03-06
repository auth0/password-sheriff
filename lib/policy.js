var format = require('util').format;

var PasswordPolicyError = require('./policy_error');

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

var defaultRuleset = {
  length:           require('./rules/length'),
  contains:         require('./rules/contains'),
  containsAtLeast:  require('./rules/containsAtLeast'),
  identicalChars:   require('./rules/identicalChars'),
};

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

/**
 * Creates a PasswordPolicy which is a set of rules.
 *
 * @class PasswordPolicy
 * @constructor
 */
function PasswordPolicy(rules, ruleset) {
  this.rules = rules;
  this.ruleset = ruleset || defaultRuleset;

  this._reduce(function (result, ruleOptions, rule) {
    rule.validate(ruleOptions);
  });
}

PasswordPolicy.prototype = {};

PasswordPolicy.prototype._reduce = function (fn, value) {
  var self = this;
  return Object.keys(this.rules).reduce(function (result, ruleName) {
    var ruleOptions = self.rules[ruleName];
    var rule = self.ruleset[ruleName];

    return fn(result, ruleOptions, rule);

  }, value);
};

PasswordPolicy.prototype._applyRules = function (password) {
  return this._reduce(function (result, ruleOptions, rule) {
    // If previous result was false as this an &&, then nothing to do here!
    if (!result) {
      return false;
    }

    if (!rule) {
      return false;
    }

    return rule.assert(ruleOptions, password);
  }, true);
};

PasswordPolicy.prototype.missing = function (password) {
  return this._reduce(function (result, ruleOptions, rule) {
    var missingRule = rule.missing(ruleOptions, password);
    result.rules.push(missingRule);
    result.verified = result.verified && !!missingRule.verified;
    return result;
  }, {rules: [], verified: true});
};

PasswordPolicy.prototype.explain = function () {
  return this._reduce(function (result, ruleOptions, rule) {
    result.push(rule.explain(ruleOptions));
    return result;
  }, []);
};

PasswordPolicy.prototype.missingAsMarkdown = function (password) {
  return flatDescriptions(this.missing(password), 1);
};

PasswordPolicy.prototype.toString = function () {
  var descriptions = this.explain();
  return flatDescriptions(descriptions, 0);
};

PasswordPolicy.prototype.check = function (password) {
  if (!isString(password)) {
    return false;
  }

  return this._applyRules(password);
};

PasswordPolicy.prototype.assert = function (password) {
  if (!this.check(password)) {
    throw new PasswordPolicyError('Password does not meet password policy');
  }
};

module.exports = PasswordPolicy;
