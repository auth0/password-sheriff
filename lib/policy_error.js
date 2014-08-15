/**
 * Error thrown when asserting a policy against a password.
 *
 * @class PasswordPolicyError
 * @constructor
 *
 * @param {String} msg Descriptive message of the error
 */
function PasswordPolicyError(msg) {
  var err = Error.call(this, msg);
  err.name = 'PasswordPolicyError';
  return err;
}

module.exports = PasswordPolicyError;
