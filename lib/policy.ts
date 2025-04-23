import { format } from './helper';
import { PasswordPolicyError } from './policy_error';
import { Rule, RuleDescription, RuleOptions, Ruleset, PasswordPolicyOptions, PasswordPolicyInterface, MissingRuleResult } from './types';
import lengthRule from './rules/length';
import containsRule from './rules/contains';
import containsAtLeastRule from './rules/containsAtLeast';
import identicalCharsRule from './rules/identicalChars';

function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String;
}

const defaultRuleset: Ruleset = {
  length: lengthRule,
  contains: containsRule,
  containsAtLeast: containsAtLeastRule,
  identicalChars: identicalCharsRule,
};

function flatDescriptions(descriptions: RuleDescription[], index: number): string {
  if (!descriptions.length) {
    return '';
  }

  function flatSingleDescription(description: RuleDescription, index: number): string {
    const spaces = (new Array(index + 1)).join(' ');
    let result = spaces + '* ';
    if (description.format) {
      result += format(description.message, ...description.format);
    } else {
      result += description.message;
    }

    if (description.items) {
      result += '\n' + spaces + flatDescriptions(description.items, index + 1);
    }
    return result;
  }

  const firstDescription = flatSingleDescription(descriptions[0], index);

  const remainingDescriptions = descriptions.slice(1).reduce((result: string, description: RuleDescription) => {
    result += '\n' + flatSingleDescription(description, index);
    return result;
  }, firstDescription);

  return remainingDescriptions;
}

/**
 * Creates a PasswordPolicy which is a set of rules.
 *
 * @class PasswordPolicy
 * @constructor
 */
export class PasswordPolicy implements PasswordPolicyInterface {
  private rules: PasswordPolicyOptions;
  private ruleset: Ruleset;

  constructor(rules: PasswordPolicyOptions, ruleset?: Ruleset) {
    this.rules = rules;
    this.ruleset = ruleset || defaultRuleset;

    this._reduce((result, ruleOptions, rule) => {
      rule.validate(ruleOptions);
    });
  }

  private _reduce<T>(fn: (result: T, ruleOptions: RuleOptions, rule: Rule) => T, value?: T): T {
    return Object.keys(this.rules).reduce((result: T, ruleName: string) => {
      const ruleOptions = this.rules[ruleName];
      const rule = this.ruleset[ruleName];

      if (ruleOptions && rule) {
        return fn(result, ruleOptions, rule);
      }
      return result;
    }, value as T);
  }

  private _applyRules(password: string): boolean {
    return this._reduce((result, ruleOptions, rule) => {
      // If previous result was false as this an &&, then nothing to do here!
      if (!result) {
        return false;
      }

      if (!rule) {
        return false;
      }

      return rule.assert(ruleOptions, password);
    }, true);
  }

  missing(password: string): MissingRuleResult {
    return this._reduce((result: MissingRuleResult, ruleOptions, rule) => {
      const missingRule = rule.missing(ruleOptions, password);
      result.rules.push(missingRule);
      result.verified = result.verified && !!missingRule.verified;
      return result;
    }, { rules: [], verified: true });
  }

  explain(): RuleDescription[] {
    return this._reduce((result: RuleDescription[], ruleOptions, rule) => {
      result.push(rule.explain(ruleOptions));
      return result;
    }, []);
  }

  missingAsMarkdown(password: string): string {
    return flatDescriptions(this.missing(password).rules, 1);
  }

  toString(): string {
    const descriptions = this.explain();
    return flatDescriptions(descriptions, 0);
  }

  check(password: string): boolean {
    if (!isString(password)) {
      return false;
    }

    return this._applyRules(password);
  }

  assert(password: string): void {
    if (!this.check(password)) {
      throw new PasswordPolicyError('Password does not meet password policy');
    }
  }
}
