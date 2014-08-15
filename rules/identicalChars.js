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
function explain (options) {
    var example = (new Array(options.max+2)).join('a');
    return [format('No more than %d identical characters in a row (e.g., "%s" not allowed)', options.max,
                  example)];
  }

module.exports = {
  // TODO validate options.max
  explain: explain,
  missing: function (options, password) {
    if (assert(options, password)) {
      return [];
    }

    return explain(options);
  },
  assert: assert
};
