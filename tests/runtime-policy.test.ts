import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const sandbox = { URL, Request, Headers, Error, Promise };
const make = vm.runInNewContext(
  readFileSync("public/lab-runtime-policy.js", "utf8") + "\ncreateLabFetch",
  sandbox,
);
test("worker policy rejects POST and DELETE hidden inside Request objects", async () => {
  let calls = 0;
  const guarded = make(() => {
    calls++;
  }, "https://lab.test/");
  for (const method of ["POST", "DELETE", "PATCH"]) {
    await assert.rejects(
      () =>
        guarded(new Request("https://api.github.com/repos/a/b", { method })),
      /only permits/,
    );
  }
  assert.equal(calls, 0);
});
test("worker policy uses the effective method, URL and explicit safe fetch settings", async () => {
  let args: unknown[] = [];
  const guarded = make((...a: unknown[]) => {
    args = a;
    return Promise.resolve(new Response("{}"));
  }, "https://lab.test/");
  await guarded(new Request("https://api.github.com/repos/a/b"));
  assert.equal(args[0], "https://api.github.com/repos/a/b");
  const options = args[1] as RequestInit;
  assert.equal(options.method, "GET");
  assert.equal(options.credentials, "omit");
  assert.equal(options.redirect, "error");
  assert.equal(new Headers(options.headers).get("Authorization"), null);
  assert.equal(options.body, undefined);
  await assert.rejects(
    () =>
      guarded("https://api.github.com/", {
        headers: { Authorization: "Bearer fake-test-value" },
      }),
    /without credentials/,
  );
});
test("worker policy rejects other hosts, credentials, ports and write options", async () => {
  const guarded = make(() => {
    throw new Error("network should not run");
  }, "https://lab.test/");
  for (const resource of [
    "https://api.github.com.evil.test/",
    "https://api.github.com:444/",
    "http://api.github.com/",
    "https://user:pass@api.github.com/",
    "/api/private",
  ]) {
    await assert.rejects(() => guarded(resource), /only permits/);
  }
  await assert.rejects(
    () => guarded("https://api.github.com/", { method: "POST" }),
    /only permits/,
  );
});
