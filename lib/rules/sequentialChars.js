const _ = require('../helper');

const Direction = {
  Ascending: 1,
  Descending: -1,
  None: 0
};

const CharacterCodes = {
  LowerCaseA: 'a'.charCodeAt(0),
  LowerCaseZ: 'z'.charCodeAt(0),
  Zero: '0'.charCodeAt(0),
  Nine: '9'.charCodeAt(0),
  UpperCaseA: 'A'.charCodeAt(0),
  UpperCaseZ: 'Z'.charCodeAt(0),
};

function isAlphanumeric(code) {
  if (!code) {
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

function assert(options, password) {
  if (!password) {
    return false;
  }

  let seqLen = isAlphanumeric(password.charCodeAt(0)) ? 1 : 0;
  let direction = Direction.None;

  for (let i = 1; i < password.length; i++) {
    const currentCode = password.charCodeAt(i);
    if (!isAlphanumeric(currentCode)) {
      direction = Direction.None;
      seqLen = 0;
      continue;
    }

    const diff = currentCode - password.charCodeAt(i - 1);
    if (diff === Direction.Ascending || diff === Direction.Descending) {
      if (direction === diff) {
        seqLen += 1;
      } else {
        // start a new potential sequence of length 2
        direction = diff;
        seqLen = 2;
      }
    } else {
      direction = Direction.None;
      seqLen = 1;
    }

    if (seqLen > options.max) {
      return false;
    }
  }

  return true;
}

function explain(options, verified) { // modified message
  // create example a...(max+1 letters) e.g. for max=3 => 'abcd'
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

module.exports = { // unchanged below
  validate: function (options) {
    if (!_.isObject(options)) {
      throw new Error('options should be an object');
    }

    if (!_.isNumber(options.max) || _.isNaN(options.max) || options.max < 2) {
      throw new Error('max should be a number greater than or equal to 2');
    }

    return true;
  },
  explain,
  missing: function (options, password) {
    return explain(options, assert(options, password));
  },
  assert
};
