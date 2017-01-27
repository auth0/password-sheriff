# Password Sheriff

Node.js (and browserify supported) library to enforce password policies.

## Install

```sh
npm install password-sheriff
```

## Usage

```js
var PasswordPolicy = require('password-sheriff').PasswordPolicy;

// Create a length password policy
var lengthPolicy = new PasswordPolicy({length: {minLength: 6}});

// will throw as the password does not meet criteria
lengthPolicy.assert('hello');

// returns false if password does not meet rules
assert.equal(false, lengthPolicy.check('hello'));

// explains the policy
var explained = lengthPolicy.explain();

assert.equal(1, explained.length);

// easier i18n
assert.equal('lengthAtLeast', explained[0].code);
assert.equal('At least 6 characters in length',
             format(explained[0].message, explained[0].format));
```

### API

#### Password Rules

Password Rules are objects that implement the following methods:

 * `rule.validate(options)`: method called after the rule was created in order to validate `options` arguments.
 * `rule.assert(options, password)`: returns true if `password` is valid.
 * `rule.explain(options)`: returns an object with `code`, `message` and `format` attributes:
   * `code`: Identifier of the rule. This attribute is meant to aid i18n.
   * `message`: Description of the rule that must be formatted using `util.format`.
   * `format`: Array of `string` or `Number` that will be used for the replacements required in `message`.
 * `rule.missing(options, password)`: returns an object similar to `rule.explain` plus an additional field `verified` that informs whether the password meets the rule.


Example of `rule.explain` method:

```js
FooRule.prototype.explain = function (options) {
  return {
    // identifier rule (to make i18n easier)
    code: 'foo',
    message: 'Foo should be present at least %d times.',
    format: [options.count]
  };
};
```

When explained:

```js
var explained = fooRule.explain({count: 5});

// "Foo should be present at least 5 times"
util.format(explained.message, explained.format[0]);
```

See the [custom-rule example](examples/custom-rule.js) section for more information.

#### Built-in Password Rules

Password Sheriff includes some default rules:

  * `length`: The minimum amount of characters a password must have.
  ```js
  var lengthPolicy = new PasswordPolicy({length: {minLength: 3}});
  ```

  * `contains`:  Password should contain all of the charsets specified. There are 4 predefined charsets: `upperCase`, `lowerCase`, `numbers` and `specialCharacters` (`specialCharacters`are the ones defined in OWASP Password Policy recommendation document).
  ```js
  var charsets = require('password-sheriff').charsets;

  var containsPolicy = new PasswordPolicy({contains: {
    expressions: [charsets.upperCase, charsets.numbers]
  }});
  ```

  * `containsAtLeast`: Passwords should contain at least `atLeast` of a total of `expressions.length` groups.
  ```js
  var charsets = require('password-sheriff').charsets;

  var containsAtLeastPolicy = new PasswordPolicy({
    containsAtLeast: {
      atLeast: 2,
      expressions: [ charsets.lowerCase, charsets.upperCase, charsets.numbers ]
    }
  });
  ```

  * `identicalChars`: Passwords should not contain any character repeated continuously `max + 1` times.
  ```js
  var identitcalCharsPolicy = new PasswordPolicy({
    identicalChars: {
      max: 3
    }
  });
  ```

See the [default-rules example](examples/default-rules.js) section for more information.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
