# Password Sheriff

Password policy enforcer.

**Warning**: This module is work in progress. Not all the features listed here work yet.

## Install

```sh
npm install password-sheriff
```

## Usage

```js
var createPolicy = require('password-sheriff');
var policy = createPolicy({
  minimum: 6,
  minUpperCase: 3
});

// Creates a password based on OWASP standard
var policyOWASP = createPolicy('owasp-3');

// Password should meet the following criteria:
// * Minimum 6 characters
// * At least 3 characters should be uppercase
console.log(policy.toString());

// returns false, it does not meet requirements
policy.check('hello');
policy.check('helloAD');

// returns true
policy.check('helloASD');

// asserts a password (throws an exception if invalid)
policy.assert('hello');
```
