
/**
 * Creates a password policy from a set of rules.
 *
 * @param {Object} policy Set of rules to use to create the policy.
 */
module.exports = function (policy) {
  return {
    /** 
     * Checks that a password meets this policy
     */
    check: function () {
      return true;
    },
    /**
     * Friendly string representation of the policy
     */
    toString: function () {
      return '';
    }
  };
};
