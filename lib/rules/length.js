var _ = require('../helper');

/* A rule should contain explain and rule methods */
// TODO explain explain
// TODO explain missing
// TODO explain assert

function assert (options, password) {
  return !!password && options.minLength <= password.length;
}

function explain(options) {
  if (options.minLength === 1) {
    return {
      message: 'Non-empty password required',
      code: 'nonEmpty'
    };
  }

  return {
    message: 'At least %d characters in length',
    format: [options.minLength],
    code: 'lengthAtLeast'
  };
}

module.exports = {
  validate: function (options) {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.minLength) || _.isNaN(options.minLength)) {
      throw new Error('length expects minLength to be a non-zero number');
    }

    return true;
  },
  explain: explain,
  missing: function (options, password) {
    var explained = explain(options);
    explained.verified = !!assert(options, password);
    return explained;
  },
  assert: assert
};
