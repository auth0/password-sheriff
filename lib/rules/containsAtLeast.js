var _ = require('../helper');

var contains = require('./contains');

function createIntroMessage() {
  return 'Contain at least %d of the following %d types of characters:';
}

module.exports = {
  // TODO validate atLeast to be a number > 0 and expressions to be a list of at least 1
  validate: function (options) {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.atLeast) || _.isNaN(options.atLeast) || options.atLeast < 1) {
      throw new Error('atLeast should be a valid, non-NaN number, greater than 0');
    }

    if (!_.isArray(options.expressions) || _.isEmpty(options.expressions)) {
      throw new Error('expressions should be an non-empty array');
    }

    if (options.expressions.length < options.atLeast) {
      throw new Error('expressions length should be greater than atLeast');
    }

    var ok = options.expressions.every(function (expression) {
      return _.isFunction(expression.explain) && _.isFunction(expression.test);
    });

    if (!ok) {
      throw new Error('containsAtLeast expressions are invalid: An explain and a test function should be provided');
    }

    return true;
  },
  explain: function (options) {
    return {
      message: createIntroMessage(),
      code: 'containsAtLeast',
      format: [options.atLeast, options.expressions.length],
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
      message: createIntroMessage(),
      code: 'containsAtLeast',
      format: [options.atLeast, options.expressions.length],
      items: expressions,
      verified: verified
    };
  },
  assert: function (options, password) {
    if (!password) {
      return false;
    }

    var workingExpressions = options.expressions.filter(function (expression) {
      return expression.test(password);
    });

    return workingExpressions.length >= options.atLeast;
  },
  charsets: contains.charsets
};
