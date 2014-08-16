var format = require('util').format;

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
  // TODO Validate that minLength exists
  // validate: function (options) {
  //   if (!options.minLength) {
  //     return false;
  //   }
  // },
  explain: explain,
  missing: function (options, password) {
    var explained = explain(options);
    explained.verified = !!assert(options, password);
    return explained;
  },
  assert: assert 
};
