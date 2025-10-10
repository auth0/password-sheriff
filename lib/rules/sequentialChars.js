const _ = require('../helper');

const Direction = {
  Ascending: 1,
  Descending: -1,
  None: 0
};

function assert(options, password) {
  if (!password) {
    return false;
  }

  let seqLen = 1; // current sequence length
  let direction = Direction.None;
  for (let i = 1; i < password.length; i++) {
    const diff = password.charCodeAt(i) - password.charCodeAt(i - 1);
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

function explain(options, verified) {
  // create example a...(max+1 letters) e.g. for max=3 => 'abcd'
  let example = '';
  for (let i = 0; i < options.max + 1; i++) {
    example += String.fromCharCode('a'.charCodeAt(0) + i);
  }
  const d = {
    message: 'No more than %d sequential characters (e.g., "%s" not allowed)',
    code: 'sequentialChars',
    format: [options.max, example]
  };
  if (verified !== undefined) {
    d.verified = verified;
  }
  return d;
}

module.exports = {
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

