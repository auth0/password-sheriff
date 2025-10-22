const _ = require('../helper');

/**
 * @readonly
 * @enum {number}
 */
const Direction = {
  Ascending: 1,
  Descending: -1,
  None: 0
};

/**
 * @readonly
 * @enum {number}
 */
const CharacterCodes = {
  LowerCaseA: 'a'.charCodeAt(0),
  LowerCaseZ: 'z'.charCodeAt(0),
  Zero: '0'.charCodeAt(0),
  Nine: '9'.charCodeAt(0),
  UpperCaseA: 'A'.charCodeAt(0),
  UpperCaseZ: 'Z'.charCodeAt(0),
};

/**
 * Determines if a character is alphanumeric
 *
 * @param {number} code character code
 * @return {boolean}
 */
function isAlphanumeric(code) {
  if (!_.isNumber(code) || _.isNaN(code)) {
    return false;
  }

  if (code >= CharacterCodes.LowerCaseA && code <= CharacterCodes.LowerCaseZ) {
    return true;
  } else if (code >= CharacterCodes.UpperCaseA && code <= CharacterCodes.UpperCaseZ) {
    return true;
  } else if (code >= CharacterCodes.Zero && code <= CharacterCodes.Nine) {
    return true;
  }

  return false;
}

/**
 * Returns true if password has more sequential characters the configured max allowed
 *
 * @param {{max: number}} options
 * @param {string} password
 * @return {boolean}
 */
function assert(options, password) {
  if (!password) {
    return false;
  }

  let prevCode = password.charCodeAt(0);
  let seqLen = isAlphanumeric(prevCode) ? 1 : 0;
  let currentDirection = Direction.None;

  for (let i = 1; i < password.length; i++) {
    const currentCode = password.charCodeAt(i);
    if (!isAlphanumeric(currentCode) || !isAlphanumeric(prevCode)) {
      currentDirection = Direction.None;
      seqLen = 1;
      prevCode = currentCode;
      continue;
    }

    const diff = currentCode - prevCode;
    prevCode = currentCode;

    if (diff === Direction.Ascending || diff === Direction.Descending) {
      if (currentDirection === diff) {
        seqLen += 1;
      } else {
        // start a new potential sequence of length 2 (prev + current)
        currentDirection = diff;
        seqLen = 2;
      }
    } else {
      currentDirection = Direction.None;
      seqLen = 1;
    }

    if (seqLen > options.max) {
      return false;
    }
  }

  return true;
}

/**
 * @param {{max: number}} options
 * @param {boolean} verified
 * @return {boolean}
 */
function explain(options, verified) {
  let example = '';
  for (let i = 0; i < options.max + 1; i++) {
    example += String.fromCharCode('a'.charCodeAt(0) + i);
  }
  const d = {
    message: 'No more than %d sequential alphanumeric characters (e.g., "%s" not allowed)', // updated
    code: 'sequentialChars',
    format: [options.max, example]
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

/**
 * @param {{max: number}} options
 * @return {boolean}
 */
function validate(options) {
  if (!_.isObject(options)) {
    throw new Error('options should be an object');
  }

  if (!_.isNumber(options.max) || _.isNaN(options.max) || options.max < 2) {
    throw new Error('max should be a number greater than or equal to 2');
  }

  if (!_.isNumber(options.max) || _.isNaN(options.max) || options.max > 26) {
    throw new Error('max should be a number less than or equal to 26');
  }

  return true;
}

module.exports = {
  validate,
  explain,
  missing: function (options, password) {
    return explain(options, assert(options, password));
  },
  assert
};
