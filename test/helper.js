var expect = require('chai').expect;
var _ = require('../lib/helper');

describe('helper', function () {
  it('should validate if it is a number', function() {
    expect(_.isNumber(1)).to.be.ok;
    expect(_.isNumber('hi')).to.not.be.ok;
    expect(_.isNumber([])).to.not.be.ok;
    expect(_.isNumber({})).to.not.be.ok;
  });

  it('should validate if it is a function', function() {
    expect(_.isFunction(function() {})).to.be.ok;
    expect(_.isFunction(1)).to.not.be.ok;
    expect(_.isFunction('hi')).to.not.be.ok;
    expect(_.isFunction([])).to.not.be.ok;
    expect(_.isFunction({})).to.not.be.ok;
  });

  it('should validate if it is an object', function() {
    expect(_.isObject({})).to.be.ok;
    expect(_.isObject(null)).to.not.be.ok;
    expect(_.isObject(1)).to.not.be.ok;
    expect(_.isObject('hi')).to.not.be.ok;
  });

  it('should validate if it is an array', function() {
    expect(_.isArray([])).to.be.ok;
    expect(_.isArray({})).to.not.be.ok;
    expect(_.isArray(null)).to.not.be.ok;
    expect(_.isArray(1)).to.not.be.ok;
    expect(_.isArray('hi')).to.not.be.ok;
  });

  it('should validate if it is an array', function() {
    expect(_.isNaN(Number.NaN)).to.be.ok;
    expect(_.isNaN([])).to.not.be.ok;
    expect(_.isNaN({})).to.not.be.ok;
    expect(_.isNaN(null)).to.not.be.ok;
    expect(_.isNaN(1)).to.not.be.ok;
    expect(_.isNaN('hi')).to.not.be.ok;
  });

  it('should validate if it is empty', function() {
    expect(_.isEmpty('')).to.be.ok;
    expect(_.isEmpty(null)).to.be.ok;
    expect(_.isEmpty([])).to.be.ok;
    expect(_.isEmpty({})).to.be.ok;
    expect(_.isEmpty([1])).to.not.be.ok;
    expect(_.isEmpty({a:1})).to.not.be.ok;
  });

  describe('format', function() {
    it('can format a string', function() {
      expect(_.format('a string')).to.equal('a string');
    });

    it('can replace a string', function() {
      expect(_.format('%s', 'test')).to.equal('test');
    });

    it('can replace a string inside a string', function() {
      expect(_.format('a string: %s', 'test')).to.equal('a string: test');
    });

    it('can replace multiple strings', function() {
      expect(_.format('%s:%s', 'a', 'b')).to.equal('a:b');
    });

    it('can replace with a number', function() {
      expect(_.format('%d', 12)).to.equal('12');
    });

    it('can format an object', function() {
      expect(_.format('%j', { key: 'value' })).to.equal('{"key":"value"}');
    });
  });
});