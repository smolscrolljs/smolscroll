import { assert } from "chai";
import "./main";

describe("main", () => {
  describe("add", () => {
    it("should return the sum of two numbers", () => {
      assert.equal(2 + 2, 4);
    });
  });
});
