var format = require('util').format;

var contains = require('./contains');

function createIntroMessage(atLeast, total) {
  return format('Contain at least %d of the following %d types of characters:', atLeast, total);
}

module.exports = {
  // TODO validate atLeast to be a number > 0 and expressions to be a list of at least 1
  explain: function (options) {
    return [createIntroMessage(options.atLeast, options.expressions.length),
      options.expressions.map(function (x) { return x.explain(); })];
  },
  missing: function (options, password) {
    var failedExpressions = options.expressions && options.expressions.filter(function (expression) {
      return !expression.test(password);
    }).map(function (expression) {
      return expression.explain();
    });

    var matchedExpressionsCount = options.expressions.length - failedExpressions.length;

    if (matchedExpressionsCount >= options.atLeast) {
      return [];
    }

    return [createIntroMessage(options.atLeast - matchedExpressionsCount, failedExpressions.length), failedExpressions];
  },
  assert: function (options, password) {
    var workingExpressions = options.expressions && options.expressions.filter(function (expression) {
      return expression.test(password);
    });

    return workingExpressions.length >= options.atLeast;
  },
  charsets: contains.charsets
};
