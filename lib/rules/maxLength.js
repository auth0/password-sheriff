var _ = require('../helper');

/**
 * Assert that the password does not exceed the configured max bytes (UTF-8)
 * @param {{maxBytes: number}} options
 * @param {string} password
 * @return {boolean}
 */
function assert(options, password) {
  if (!password) {
    return false;
  }
  var bytes = Buffer.byteLength(password, 'utf8');
  return bytes <= options.maxBytes;
}

/**
 * Build explanation object
 * @param {{maxBytes: number}} options
 * @param {boolean} verified
 * @return {object}
 */
function explain(options, verified) {
  var d = {
    message: 'Maximum password length exceeded',
    code: 'maxLength',
    format: [options.maxBytes]
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

/**
 * Validate options for rule
 * @param {{maxBytes: number}} options
 * @return {boolean}
 */
function validate(options) {
  if (!_.isObject(options)) {
    throw new Error('options should be an object');
  }
  if (!_.isNumber(options.maxBytes) || _.isNaN(options.maxBytes) || options.maxBytes < 1) {
    throw new Error('maxBytes should be a number greater than 0');
  }
  return true;
}

module.exports = {
  validate: validate,
  explain: explain,
  missing: function(options, password) {
    return explain(options, assert(options, password));
  },
  assert: assert
};
