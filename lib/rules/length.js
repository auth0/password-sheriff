var format = require('util').format;

var _ = require('underscore');

/* A rule should contain explain and rule methods */
// TODO explain explain
// TODO explain missing
// TODO explain assert

function assert (options, password) {
  return options.minLength <= password.length;
}

function explain(options) {
  if (options.minLength === 1) {
    return {message: 'Non-empty password required'};
  }

  return {message: format('At least %d characters in length', options.minLength)};
}

module.exports = {
  validate: function (options) {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.minLength) || _.isNaN(options.minLength)) {
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
