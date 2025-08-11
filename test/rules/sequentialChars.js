var expect = require("chai").expect;
var sequentialCharsRule = require("../../lib/rules/sequentialChars");

describe('"sequential characters" rule', function () {
  describe("validate", function () {
    it("should work with valid options", function () {
      expect(function () {
        sequentialCharsRule.validate({ max: 2 });
      }).to.not.throw();
      expect(function () {
        sequentialCharsRule.validate({ max: 3 });
      }).to.not.throw();
    });

    it("should throw error with invalid options", function () {
      expect(function () {
        sequentialCharsRule.validate({ max: 0 });
      }).to.throw();
      expect(function () {
        sequentialCharsRule.validate({ max: "invalid" });
      }).to.throw();
    });
  });

  describe("explain", function () {
    it("should return a message", function () {
      var explanation = sequentialCharsRule.explain({ max: 2 });
      expect(explanation.message).to.equal(
        'No more than %d sequential characters in a row (e.g., "%s" not allowed)'
      );
      expect(explanation.format[0]).to.equal(2);
    });
  });

  describe("assert", function () {
    it("should fail if password contains more than max sequential letters", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(97, 98, 99, 100, 101) // abcde
        )
      ).to.be.false;
    });

    it("should fail if password contains more than max sequential numbers", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(49, 50, 51, 52, 53) // 12345
        )
      ).to.be.false;
    });

    it("should pass if password contains exactly max sequential characters", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(97, 98, 49, 99, 100) // ab1cd
        )
      ).to.be.true;
    });

    it("should pass if password does not contain sequential characters", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(97, 49, 98, 50, 99, 51) // a1b2c3
        )
      ).to.be.true;
    });

    it("should pass if password contains adjacent but non-sequential characters", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(97, 98, 97, 98, 97) // ababa
        )
      ).to.be.true;
    });

    it("should fail if password contains descending sequential characters", function () {
      expect(
        sequentialCharsRule.assert(
          { max: 2 },
          String.fromCharCode(102, 101, 100, 99, 98, 97) // fedcba
        )
      ).to.be.false;
    });

    describe("edge cases for mixed character types", function () {
      it("should pass when sequential letters are mixed with ASCII symbols", function () {
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(89, 90, 91) // YZ[
          )
        ).to.be.true;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(57, 58, 59) // 9:;
          )
        ).to.be.true;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(64, 65, 66) // @AB
          )
        ).to.be.true;
      });

      it("should pass when different ASCII character types are mixed", function () {
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(97, 49, 98) // a1b
          )
        ).to.be.true;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(65, 57, 122) // A9z
          )
        ).to.be.true;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(120, 33, 50) // x!2
          )
        ).to.be.true;
      });

      it("should pass with ASCII symbols that happen to be sequential", function () {
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(33, 34, 35) // !"#
          )
        ).to.be.true;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(40, 41, 42) // ()*
          )
        ).to.be.true;
      });

      it("should still fail for same-type sequential characters", function () {
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(65, 66, 67) // ABC
          )
        ).to.be.false;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(120, 121, 122) // xyz
          )
        ).to.be.false;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(52, 53, 54) // 456
          )
        ).to.be.false;
      });
    });

    describe("international character support", function () {
      it("should fail for sequential international characters", function () {
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(1633, 1634, 1635) // ١٢٣
          )
        ).to.be.false;
        expect(
          sequentialCharsRule.assert(
            { max: 2 },
            String.fromCharCode(1488, 1489, 1490) // אבג
          )
        ).to.be.false;
      });
    });
  });
});
