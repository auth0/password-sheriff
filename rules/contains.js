var format = require('util').format;

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
var specialCharacters = [' ', '!', '"', '#', '\\$', '%', '&', '\'', '\\(', '\\)', '\\*', '\\+', ',', '-', '\\.', '/', ':', ';', '<', '=', '>', '\\?', '@', '\\[', '\\\\', '\\]', '\\^', '_','`','{','\\|', '}','~'].join('|');

var specialCharactersRegexp = new RegExp(specialCharacters);

module.exports = {
  // TODO Validate that options.expressions is neither null nor empty
  explain: function (options) {
    return ['Should contain:', options.expressions.map(function (expression) {
      return expression.explain();
    })];
  },
  missing: function (options, password) {
    var failedExpressions = options.expressions.filter(function (expression) {
      return !expression.test(password);
    });

    if (failedExpressions.length) {
      return ['Should contain:', failedExpressions.map(function (expression) {
        return expression.explain();
      })];
    }

    return [];
  },
  assert: function (options, password) {
    return options.expressions && options.expressions.every(function (expression) {
      var result = expression.test(password);
      return result;
    });
  },
  charsets: {
    upperCase: {
      explain: function () { return 'upper case letters (A-Z)'; },
      test: function (password) { return /[A-Z]/.test(password); }
    },
    lowerCase: {
      explain: function () { return 'lower case letters (a-z)'; },
      test: function (password) { return /[a-z]/.test(password); }
    },
    specialCharacters: {
      explain: function () { return 'special characters (e.g. !@#$%^&*)'; },
      test: function (password) { return specialCharactersRegexp.test(password); }
    },
    numbers: {
      explain: function () { return 'numbers (i.e. 0-9)'; },
      test: function (password) { return /\d/.test(password); }
    }
  }
};
