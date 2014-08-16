var format = require('util').format;

function assert(options, password) {
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
    var d = {message: format('No more than %d identical characters in a row (e.g., "%s" not allowed)', 
                             options.max,
                             example)};
    if (verified !== undefined) {
      d.verified = verified;
    }
    return d;
  }

module.exports = {
  // TODO validate options.max
  explain: explain,
  missing: function (options, password) {
    return explain(options, assert(options, password));
  },
  assert: assert
};
