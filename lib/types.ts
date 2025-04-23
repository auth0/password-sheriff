export interface RuleOptions {
  [key: string]: any;
}

export interface Rule {
  validate(options: RuleOptions): void;
  assert(options: RuleOptions, password: string): boolean;
  missing(options: RuleOptions, password: string): RuleDescription;
  explain(options: RuleOptions): RuleDescription;
}

export interface RuleDescription {
  message: string;
  format?: any[];
  items?: RuleDescription[];
  verified?: boolean;
  code?: string;
}

export interface Ruleset {
  [key: string]: Rule;
}

export interface PasswordPolicyOptions {
  length?: RuleOptions;
  contains?: RuleOptions;
  containsAtLeast?: RuleOptions;
  identicalChars?: RuleOptions;
  [key: string]: RuleOptions | undefined;
}

export interface MissingRuleResult {
  rules: RuleDescription[];
  verified: boolean;
}

export interface PasswordPolicyInterface {
  check(password: string): boolean;
  assert(password: string): void;
  missing(password: string): MissingRuleResult;
  missingAsMarkdown(password: string): string;
  explain(): RuleDescription[];
  toString(): string;
}
