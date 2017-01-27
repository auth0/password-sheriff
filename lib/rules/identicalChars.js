var _ = require('../helper');

function assert(options, password) {
  if (!password) {
    return false;
  }

  var i, current = {c: null, count: 0};

  for (i = 0; i < password.length; i++) {
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
function explain (options, verified) {
    var example = (new Array(options.max+2)).join('a');
    var d = {
      message: 'No more than %d identical characters in a row (e.g., "%s" not allowed)',
      code: 'identicalChars',
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

    if (!_.isNumber(options.max) || _.isNaN(options.max) || options.max < 1 ) {
      throw new Error('max should be a number greater than 1');
    }

    return true;
  },
  explain: explain,
  missing: function (options, password) {
    return explain(options, assert(options, password));
  },
  assert: assert
};
