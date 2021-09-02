var _ = {};
var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};
var nativeIsArray = Array.isArray;
var nativeKeys = Object.keys;
var ObjProto = Object.prototype;
var toString = ObjProto.toString;

var shallowProperty = function(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
};

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var getLength = shallowProperty('length');
var isArrayLike = function(collection) {
  var length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
var typeNames = ['Arguments', 'Function', 'String', 'Number'];
function loopAsign(name) {
  _['is' + name] = function(obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
}
for (var a = 0; a < typeNames.length; a++) {
  loopAsign(typeNames[a]);
}

var nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  _.isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

_.identity = function(value) {
  return value;
};

_.keys = function(obj) {
  if (!_.isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};

_.isObject = function(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

_.isArray = nativeIsArray || function(obj) {
  return toString.call(obj) === '[object Array]';
};

_.isEmpty = function(obj) {
  if (obj == null) return true;
  if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
  return _.keys(obj).length === 0;
};

_.isNaN = function(obj) {
  return _.isNumber(obj) && isNaN(obj);
};

// Code attribution
// Inlined and modified from https://github.com/browserify/node-util/blob/e37ce41f4063bcd7bc27e01470d6654053bdcd14/util.js#L33-L69
// Copyright Joyent, Inc. and other Node contributors.
// Please see LICENSE for full copyright and license attribution.
var formatRegExp = /%[sdj%]/g;

_.format = function (f) {
  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || !_.isObject(x)) {
      str += ' ' + x;
    } else if (x !== null) {
      str += ' ' + JSON.stringify(x);
    }
  }
  return str;
}
// End code attribution

module.exports = _;