var _ = require('../helper');

function assert(options, password) {
  if (!password) {
    return false;
  }

  var maxSequential = options.max || 2;

  // Helper function to determine if characters should be considered for sequencing.
  // This is to prevent unexpected positives from sequences like "YZ[".
  // We do not attempt to handle all languages/chars, but focus on common ASCII ranges.
  function shouldCheckSequence(char1, char2) {
    var code1 = char1.charCodeAt(0);
    var code2 = char2.charCodeAt(0);
    
    // Both are ASCII digits
    if (code1 >= 48 && code1 <= 57 && code2 >= 48 && code2 <= 57) return true;
    // Both are ASCII uppercase letters
    if (code1 >= 65 && code1 <= 90 && code2 >= 65 && code2 <= 90) return true;
    // Both are ASCII lowercase letters
    if (code1 >= 97 && code1 <= 122 && code2 >= 97 && code2 <= 122) return true;
    // Both are non-ASCII (international characters)
    if (code1 >= 128 && code2 >= 128) return true;
    
    return false;
  }

  // Check for sequential characters (both ascending and descending)
  for (var i = 0; i <= password.length - (maxSequential + 1); i++) {
    var isAscending = true;
    var isDescending = true;

    // Check if we have a sequence of length maxSequential + 1
    for (var j = 0; j < maxSequential; j++) {
      var char1 = password[i + j];
      var char2 = password[i + j + 1];

      // Skip this sequence if characters shouldn't be checked together
      if (!shouldCheckSequence(char1, char2)) {
        isAscending = false;
        isDescending = false;
        break;
      }

      var code1 = char1.charCodeAt(0);
      var code2 = char2.charCodeAt(0);

      if (code2 !== code1 + 1) {
        isAscending = false;
      }
      if (code2 !== code1 - 1) {
        isDescending = false;
      }
    }

    if (isAscending || isDescending) {
      return false;
    }
  }

  return true;
}

function explain(options, verified) {
  var example = (new Array(options.max + 2)).join('a').split('').map(function(c, i) { 
    return String.fromCharCode('a'.charCodeAt(0) + i); 
  }).join('');
  var d = {
    message: 'No more than %d sequential characters in a row (e.g., "%s" not allowed)',
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
