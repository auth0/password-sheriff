import _ from '../helper';
import { Rule, RuleOptions, RuleDescription } from '../types';
import { charsets } from './contains';

interface ContainsExpression {
  explain(): RuleDescription;
  test(password: string): boolean;
}

interface ContainsAtLeastOptions extends RuleOptions {
  atLeast: number;
  expressions: ContainsExpression[];
}

function createIntroMessage(): string {
  return 'At least %d of the following %d types of characters:';
}

const containsAtLeastRule: Rule = {
  // TODO validate atLeast to be a number > 0 and expressions to be a list of at least 1
  validate(options: ContainsAtLeastOptions): boolean {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.atLeast) || _.isNaN(options.atLeast) || options.atLeast < 1) {
      throw new Error('atLeast should be a valid, non-NaN number, greater than 0');
    }

    if (!_.isArray(options.expressions) || _.isEmpty(options.expressions)) {
      throw new Error('expressions should be an non-empty array');
    }

    if (options.expressions.length < options.atLeast) {
      throw new Error('expressions length should be greater than atLeast');
    }

    const ok = options.expressions.every((expression) => {
      return _.isFunction(expression.explain) && _.isFunction(expression.test);
    });

    if (!ok) {
      throw new Error('containsAtLeast expressions are invalid: An explain and a test function should be provided');
    }

    return true;
  },
  explain(options: ContainsAtLeastOptions): RuleDescription {
    return {
      message: createIntroMessage(),
      code: 'containsAtLeast',
      format: [options.atLeast, options.expressions.length],
      items: options.expressions.map((x) => x.explain())
    };
  },
  missing(options: ContainsAtLeastOptions, password: string): RuleDescription {
    const expressions = options.expressions && options.expressions.map((expression) => {
      const explained = expression.explain();
      explained.verified = expression.test(password);
      return explained;
    });

    const verifiedCount = expressions.reduce((val, ex) => val + (ex.verified ? 1 : 0), 0);
    const verified = verifiedCount >= options.atLeast;

    return {
      message: createIntroMessage(),
      code: 'containsAtLeast',
      format: [options.atLeast, options.expressions.length],
      items: expressions,
      verified
    };
  },
  assert(options: ContainsAtLeastOptions, password: string): boolean {
    if (!password) {
      return false;
    }

    const workingExpressions = options.expressions.filter((expression) => {
      return expression.test(password);
    });

    return workingExpressions.length >= options.atLeast;
  }
};

export { charsets };
export default containsAtLeastRule;
