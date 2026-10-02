import { test } from "node:test";
import assert from "node:assert/strict";
import { previewDocument } from "../src/lib/preview";
test("preview installs its network policy and console bridge before arbitrary learner markup", () => {
  for (const markup of [
    "<html><body>Headless</body></html>",
    "<script>fetch('https://example.com')</script><html><head></head></html>",
    "<h1>A fragment</h1>",
  ]) {
    const preview = previewDocument(
      markup,
      "body {color: red}",
      "console.log('ready')",
    );
    assert.ok(
      preview.indexOf("Content-Security-Policy") < preview.indexOf(markup),
    );
    assert.ok(preview.indexOf("drvelu-preview") < preview.indexOf(markup));
    assert.ok(preview.includes("connect-src 'none'"));
    assert.ok(preview.includes("console.log('ready')"));
  }
});
