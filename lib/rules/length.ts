import _ from '../helper';
import { Rule, RuleOptions, RuleDescription } from '../types';

interface LengthOptions extends RuleOptions {
  minLength: number;
}

/* A rule should contain explain and rule methods */
// TODO explain explain
// TODO explain missing
// TODO explain assert

function assert(options: LengthOptions, password: string): boolean {
  return !!password && options.minLength <= password.length;
}

function explain(options: LengthOptions): RuleDescription {
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

const lengthRule: Rule = {
  validate(options: LengthOptions): boolean {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.minLength) || _.isNaN(options.minLength)) {
      throw new Error('length expects minLength to be a non-zero number');
    }

    return true;
  },
  explain,
  missing(options: LengthOptions, password: string): RuleDescription {
    const explained = explain(options);
    explained.verified = !!assert(options, password);
    return explained;
  },
  assert
};

export default lengthRule;
