interface Helper {
  isArguments(obj: any): boolean;
  isFunction(obj: any): boolean;
  isString(obj: any): boolean;
  isNumber(obj: any): boolean;
  identity<T>(value: T): T;
  keys(obj: any): string[];
  isObject(obj: any): boolean;
  isArray(obj: any): boolean;
  isEmpty(obj: any): boolean;
  isNaN(obj: any): boolean;
  format(f: string, ...args: any[]): string;
}

interface RootObject {
  self?: any;
  global?: any;
  document?: {
    childNodes: any;
  };
}

const _: Helper = {} as Helper;
const root = (typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {}) as RootObject;
const nativeIsArray = Array.isArray;
const nativeKeys = Object.keys;
const ObjProto = Object.prototype;
const toString = ObjProto.toString;

const shallowProperty = function(key: string) {
  return function(obj: any) {
    return obj == null ? void 0 : obj[key];
  };
};

const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
const getLength = shallowProperty('length');
const isArrayLike = function(collection: any) {
  const length = getLength(collection);
  return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
};

// Add some isType methods: isArguments, isFunction, isString, isNumber
const typeNames = ['Arguments', 'Function', 'String', 'Number'];
function loopAsign(name: string) {
  (_ as any)['is' + name] = function(obj: any) {
    return toString.call(obj) === '[object ' + name + ']';
  };
}
for (let a = 0; a < typeNames.length; a++) {
  loopAsign(typeNames[a]);
}

const nodelist = root.document && root.document.childNodes;
if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  _.isFunction = function(obj: any) {
    return typeof obj == 'function' || false;
  };
}

_.identity = function<T>(value: T): T {
  return value;
};

_.keys = function(obj: any): string[] {
  if (!_.isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  const keys: string[] = [];
  for (const key in obj) keys.push(key);
  return keys;
};

_.isObject = function(obj: any): boolean {
  const type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

_.isArray = nativeIsArray || function(obj: any): boolean {
  return toString.call(obj) === '[object Array]';
};

_.isEmpty = function(obj: any): boolean {
  if (obj == null) return true;
  if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
  return _.keys(obj).length === 0;
};

_.isNaN = function(obj: any): boolean {
  return _.isNumber(obj) && isNaN(obj);
};

// Code attribution
// Inlined and modified from https://github.com/browserify/node-util/blob/e37ce41f4063bcd7bc27e01470d6654053bdcd14/util.js#L33-L69
// Copyright Joyent, Inc. and other Node contributors.
// Please see LICENSE for full copyright and license attribution.
const formatRegExp = /%[sdj%]/g;

_.format = function(f: string, ...args: any[]): string {
  let i = 1;
  const len = args.length + 1;
  let str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++ - 1]);
      case '%d': return String(Number(args[i++ - 1]));
      case '%j':
        try {
          return JSON.stringify(args[i++ - 1]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (let x = args[i - 1]; i < len; x = args[i++ - 1]) {
    if (x === null || !_.isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + JSON.stringify(x);
    }
  }
  return str;
};
// End code attribution

export default _;
export const format = _.format;
