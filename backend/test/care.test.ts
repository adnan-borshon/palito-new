import { test } from "node:test";
import assert from "node:assert/strict";
import { revision } from "../src/care/care.service.js";
test("care version headers accept exact integer/quoted versions and reject ambiguous or unsafe values", () => {
  assert.equal(revision("0"), 0);
  assert.equal(revision("12"), 12);
  assert.equal(revision('"12"'), 12);
  for (const value of [
    undefined,
    '1"',
    '"1',
    "01",
    "-1",
    "1.2",
    "NaN",
    "9007199254740992",
  ])
    assert.throws(() => revision(value));
});
