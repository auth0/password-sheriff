import _ from '../helper';
import { Rule, RuleOptions, RuleDescription } from '../types';

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
const specialCharacters = [' ', '!', '"', '#', '\\$', '%', '&', '\'', '\\(', '\\)', '\\*', '\\+', ',', '-', '\\.', '/', ':', ';', '<', '=', '>', '\\?', '@', '\\[', '\\\\', '\\]', '\\^', '_','`','{','\\|', '}','~'].join('|');

const specialCharactersRegexp = new RegExp(specialCharacters);

interface ContainsExpression {
  explain(): RuleDescription;
  test(password: string): boolean;
}

interface ContainsOptions extends RuleOptions {
  expressions: ContainsExpression[];
}

const containsRule: Rule = {
  validate(options: ContainsOptions): boolean {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isArray(options.expressions) || _.isEmpty(options.expressions)) {
      throw new Error('contains expects expressions to be a non-empty array');
    }

    const ok = options.expressions.every((expression) => {
      return _.isFunction(expression.explain) && _.isFunction(expression.test);
    });

    if (!ok) {
      throw new Error('contains expressions are invalid: An explain and a test function should be provided');
    }
    return true;
  },
  explain(options: ContainsOptions): RuleDescription {
    return {
      message: 'Should contain:',
      code: 'shouldContain',
      items: options.expressions.map((expression) => {
        return expression.explain();
      })
    };
  },
  missing(options: ContainsOptions, password: string): RuleDescription {
    const expressions = options.expressions.map((expression) => {
      const explained = expression.explain();
      explained.verified = expression.test(password);
      return explained;
    });

    const verified = expressions.every((expression) => {
      return expression.verified;
    });

    return {
      message: 'Should contain:',
      code: 'shouldContain',
      verified,
      items: expressions
    };
  },
  assert(options: ContainsOptions, password: string): boolean {
    if (!password) {
      return false;
    }

    return options.expressions.every((expression) => {
      const result = expression.test(password);
      return result;
    });
  }
};

export const charsets = {
  upperCase: {
    explain(): RuleDescription {
      return {
        message: 'upper case letters (A-Z)',
        code: 'upperCase'
      };
    },
    test(password: string): boolean {
      return /[A-Z]/.test(password);
    }
  },
  lowerCase: {
    explain(): RuleDescription {
      return {
        message: 'lower case letters (a-z)',
        code: 'lowerCase'
      };
    },
    test(password: string): boolean {
      return /[a-z]/.test(password);
    }
  },
  specialCharacters: {
    explain(): RuleDescription {
      return {
        message: 'special characters (e.g. !@#$%^&*)',
        code: 'specialCharacters'
      };
    },
    test(password: string): boolean {
      return specialCharactersRegexp.test(password);
    }
  },
  numbers: {
    explain(): RuleDescription {
      return {
        message: 'numbers (i.e. 0-9)',
        code: 'numbers'
      };
    },
    test(password: string): boolean {
      return /\d/.test(password);
    }
  }
};

export default containsRule;
