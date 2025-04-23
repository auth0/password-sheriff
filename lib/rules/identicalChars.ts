import _ from '../helper';
import { Rule, RuleOptions, RuleDescription } from '../types';

interface IdenticalCharsOptions extends RuleOptions {
  max: number;
}

function assert(options: IdenticalCharsOptions, password: string): boolean {
  if (!password) {
    return false;
  }

  let current = { c: null as string | null, count: 0 };

  for (let i = 0; i < password.length; i++) {
    if (current.c !== password[i]) {
      current.c = password[i];
      current.count = 1;
    } else {
      current.count++;
    }

    if (current.count > options.max) {
      return false;
    }
  }

  return true;
}

function explain(options: IdenticalCharsOptions, verified?: boolean): RuleDescription {
  const example = (new Array(options.max + 2)).join('a');
  const d: RuleDescription = {
    message: 'No more than %d identical characters in a row (e.g., "%s" not allowed)',
    code: 'identicalChars',
    format: [options.max, example]
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

const identicalCharsRule: Rule = {
  validate(options: IdenticalCharsOptions): boolean {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.max) || _.isNaN(options.max) || options.max < 1) {
      throw new Error('max should be a number greater than 1');
    }

    return true;
  },
  explain,
  missing(options: IdenticalCharsOptions, password: string): RuleDescription {
    return explain(options, assert(options, password));
  },
  assert
};

export default identicalCharsRule;
