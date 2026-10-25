import assert from "node:assert/strict";
import { safeNextPath } from "./safe-next-path.ts";

assert.equal(safeNextPath(null), "/");
assert.equal(safeNextPath("/dashboard"), "/dashboard");
assert.equal(safeNextPath("/invoices/1/edit?x=1"), "/invoices/1/edit?x=1");
assert.equal(safeNextPath("https://evil.com"), "/");
assert.equal(safeNextPath("//evil.com"), "/");
assert.equal(safeNextPath("/\\evil.com"), "/");
assert.equal(safeNextPath("/%2F%2Fevil.com"), "/");
assert.equal(safeNextPath("/%252F%252Fevil.com"), "/");
assert.equal(safeNextPath("javascript:alert(1)"), "/");

console.log("safe next path tests passed");
