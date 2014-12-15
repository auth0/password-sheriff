# Password Sheriff

Password policy enforcer.

## Install

```sh
npm install password-sheriff
```

## Usage

```js
var createPolicy = require('password-sheriff');
var policy = createPolicy('good');

// Creates a password policy based on OWASP password recommendations
var policyOWASP = createPolicy('excellent');

// Displays the following password criteria:
// * 8 characters in length
// * contain at least 3 of the following 4 types of characters:
//  * lower case letters (a-z),
//  * upper case letters (A-Z),
//  * numbers (i.e. 0-9),
//  * special characters (e.g. !@#$%^&*)
console.log(policy.toString());

// returns false, it does not meet requirements
policy.check('hello');
policy.check('helloAD');

// returns true
policy.check('helloA1S2D1');

// asserts a password (throws an exception if invalid)
policy.assert('hello');
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

