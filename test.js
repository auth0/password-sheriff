var expect = require('chai').expect;

var createPolicy = require('./index');

describe('password-sheriff', function () {

  describe('createPolicy', function () {
    it('should support empty and undefined policies', function () {
      var undefinedPolicy = createPolicy(undefined);
      var emptyPolicy = createPolicy({});

      expect(undefinedPolicy).to.be.ok;
      expect(emptyPolicy).to.be.ok;
    });
  });

  describe('check', function () {

  });

  describe('assert', function () {

  });

  describe('toString', function () {

  });
});

