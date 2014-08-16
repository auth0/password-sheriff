var format = require('util').format;

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
var specialCharacters = [' ', '!', '"', '#', '\\$', '%', '&', '\'', '\\(', '\\)', '\\*', '\\+', ',', '-', '\\.', '/', ':', ';', '<', '=', '>', '\\?', '@', '\\[', '\\\\', '\\]', '\\^', '_','`','{','\\|', '}','~'].join('|');

var specialCharactersRegexp = new RegExp(specialCharacters);

module.exports = {
  // TODO Validate that options.expressions is neither null nor empty
  explain: function (options) {
    return {message: 'Should contain:', items: options.expressions.map(function (expression) {
      return expression.explain();
    })};
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
      verified: verified,
      items: expressions
    };
  },
  assert: function (options, password) {
    return options.expressions && options.expressions.every(function (expression) {
      var result = expression.test(password);
      return result;
    });
  },
  charsets: {
    upperCase: {
      explain: function () { return {message: 'upper case letters (A-Z)'}; },
      test: function (password) { return /[A-Z]/.test(password); }
    },
    lowerCase: {
      explain: function () { return {message: 'lower case letters (a-z)'}; },
      test: function (password) { return /[a-z]/.test(password); }
    },
    specialCharacters: {
      explain: function () { return {message: 'special characters (e.g. !@#$%^&*)'}; },
      test: function (password) { return specialCharactersRegexp.test(password); }
    },
    numbers: {
      explain: function () { return {message: 'numbers (i.e. 0-9)'}; },
      test: function (password) { return /\d/.test(password); }
    }
  }
};
