import { charsets } from './lib/rules/contains';
import { PasswordPolicy } from './lib/policy';
import { PasswordPolicyOptions, RuleDescription, MissingRuleResult } from './lib/types';
import { format } from './lib/helper';

const {
  upperCase,
  lowerCase,
  numbers,
  specialCharacters
} = charsets;

const none = new PasswordPolicy({
  length: { minLength: 1 }
});

const low = new PasswordPolicy({
  length: { minLength: 6 }
});

const fair = new PasswordPolicy({
  length: { minLength: 8 },
  contains: {
    expressions: [lowerCase, upperCase, numbers]
  }
});

const good = new PasswordPolicy({
  length: { minLength: 8 },
  containsAtLeast: {
    atLeast: 3,
    expressions: [lowerCase, upperCase, numbers, specialCharacters]
  }
});

const excellent = new PasswordPolicy({
  length: { minLength: 10 },
  containsAtLeast: {
    atLeast: 3,
    expressions: [lowerCase, upperCase, numbers, specialCharacters]
  },
  identicalChars: { max: 2 }
});

const policiesByName: { [key: string]: PasswordPolicy } = {
  none,
  low,
  fair,
  good,
  excellent
};

interface PasswordPolicyResult {
  check(password: string): boolean;
  assert(password: string): void;
  missing(password: string): MissingRuleResult;
  missingAsMarkdown(password: string): string;
  explain(): RuleDescription[];
  toString(): string;
}

/**
 * Creates a password policy.
 *
 * @param {String} policyName Name of policy to use.
 */
function createPolicy(policyName: string): PasswordPolicyResult {
  const policy = policiesByName[policyName] || policiesByName.none;

  return {
    /**
     * Checks that a password meets this policy
     *
     * @method check
     * @param {String} password
     */
    check(password: string): boolean {
      return policy.check(password);
    },
    /**
     * @method assert
     * Asserts that a passord meets this policy else throws an exception.
     *
     * @param {String} password
     */
    assert(password: string): void {
      return policy.assert(password);
    },

    missing(password: string): MissingRuleResult {
      return policy.missing(password);
    },

    missingAsMarkdown(password: string): string {
      return policy.missingAsMarkdown(password);
    },

    explain(): RuleDescription[] {
      return policy.explain();
    },

    /**
     * Friendly string representation of the policy
     * @method toString
     */
    toString(): string {
      return policy.toString();
    }
  };
}

// ES Module exports
export { PasswordPolicy };
export { charsets };
export { format };
export { RuleDescription, MissingRuleResult, PasswordPolicyOptions } from './lib/types';
export default createPolicy;

// CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createPolicy;
  module.exports.PasswordPolicy = PasswordPolicy;
  module.exports.charsets = charsets;
  module.exports.format = format;
  module.exports.default = createPolicy;
}

// module.exports.rulesToApply = rulesToApply;
