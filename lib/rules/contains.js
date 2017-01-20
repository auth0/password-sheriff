var _ = require('../helper');

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
var specialCharacters = [' ', '!', '"', '#', '\\$', '%', '&', '\'', '\\(', '\\)', '\\*', '\\+', ',', '-', '\\.', '/', ':', ';', '<', '=', '>', '\\?', '@', '\\[', '\\\\', '\\]', '\\^', '_','`','{','\\|', '}','~'].join('|');

var specialCharactersRegexp = new RegExp(specialCharacters);

module.exports = {
  validate: function (options) {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isArray(options.expressions) || _.isEmpty(options.expressions)) {
      throw new Error('contains expects expressions to be a non-empty array');
    }

    var ok = options.expressions.every(function (expression) {
      return _.isFunction(expression.explain) && _.isFunction(expression.test);
    });

    if (!ok) {
      throw new Error('contains expressions are invalid: An explain and a test function should be provided');
    }
    return true;
  },
  explain: function (options) {
    return {
      message: 'Should contain:',
      code: 'shouldContain',
      items: options.expressions.map(function (expression) {
        return expression.explain();
      })
    };
  },
  missing: function (options, password) {
    var expressions = options.expressions.map(function (expression) {
      var explained = expression.explain();
      explained.verified = expression.test(password);
      return explained;
    });

    var verified = expressions.every(function (expression) {
      return expression.verified;
    });

    return {
      message: 'Should contain:',
      code: 'shouldContain',
      verified: verified,
      items: expressions
    };
  },
  assert: function (options, password) {
    if (!password) {
      return false;
    }

    return options.expressions.every(function (expression) {
      var result = expression.test(password);
      return result;
    });
  },
  charsets: {
    upperCase: {
      explain: function () { return {
        message: 'upper case letters (A-Z)',
        code: 'upperCase'
      }; },
      test: function (password) { return /[A-Z]/.test(password); }
    },
    lowerCase: {
      explain: function () { return {
        message: 'lower case letters (a-z)',
        code: 'lowerCase'
      }; },
      test: function (password) { return /[a-z]/.test(password); }
    },
    specialCharacters: {
      explain: function () { return {
        message: 'special characters (e.g. !@#$%^&*)',
        code: 'specialCharacters'
      }; },
      test: function (password) { return specialCharactersRegexp.test(password); }
    },
    numbers: {
      explain: function () { return {
        message: 'numbers (i.e. 0-9)',
        code: 'numbers'
      }; },
      test: function (password) { return /\d/.test(password); }
    }
  }
};
