var format = require('util').format;

var contains = require('./contains');

function createIntroMessage(atLeast, total) {
  return format('Contain at least %d of the following %d types of characters:', atLeast, total);
}

module.exports = {
  // TODO validate atLeast to be a number > 0 and expressions to be a list of at least 1
  explain: function (options) {
    return {
      message: createIntroMessage(options.atLeast, options.expressions.length),
      items: options.expressions.map(function (x) { return x.explain(); })
    };
  },
  missing: function (options, password) {
    var expressions = options.expressions && options.expressions.map(function (expression) {
      var explained = expression.explain();
      explained.verified = expression.test(password);
      return explained;
    });

    var verifiedCount = expressions.reduce(function (val, ex) { return val + !!ex.verified; }, 0);
    var verified = verifiedCount >= options.atLeast;

    return {
      message: createIntroMessage(options.atLeast, options.expressions.length),
      items: expressions,
      verified: verified
    };
  },
  assert: function (options, password) {
    var workingExpressions = options.expressions && options.expressions.filter(function (expression) {
      return expression.test(password);
    });

    return workingExpressions.length >= options.atLeast;
  },
  charsets: contains.charsets
};
