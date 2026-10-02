import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { missions } from "../src/data/curriculum";

async function main() {
  const base = process.env.LAB_TEST_URL || "http://127.0.0.1:3000";
  const routes = [
    "/",
    "/roadmap",
    "/resources",
    "/projects",
    "/certifications",
    "/settings",
    "/portfolio",
    "/career",
    ...missions.map((m) => `/mission/${m.id}`),
  ];
  await Promise.all(
    routes.map(async (route) => {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 200, route);
      assert.match(await response.text(), /DrVelu/);
    }),
  );
  const missing = await fetch(`${base}/mission/not-a-mission`);
  // Next.js documents 200 for a streamed not-found response after loading.tsx.
  assert.ok([200, 404].includes(missing.status));
  const missingHtml = await missing.text();
  assert.match(missingHtml, /This page is still off the map/);
  assert.match(missingHtml, /name="robots" content="noindex"/);
  for (const name of ["lab-runtime-worker.js", "lab-runtime-policy.js"]) {
    const response = await fetch(`${base}/${name}`, { cache: "no-store" });
    assert.equal(response.status, 200, name);
    const deployed = (await response.text()).replace(/\r\n/g, "\n");
    const expected = readFileSync(`public/${name}`, "utf8").replace(
      /\r\n/g,
      "\n",
    );
    assert.equal(deployed, expected, `${name} must match the validated source`);
    if (name === "lab-runtime-worker.js") {
      const policy = response.headers.get("content-security-policy") ?? "";
      assert.ok(
        policy.includes("worker-src 'none'") &&
          policy.includes("https://api.github.com"),
      );
      assert.ok(!deployed.includes("apiToken"));
    }
  }
  console.log(
    `PASS ${base}: ${routes.length} pages, missing-mission UI/noindex, exact worker/policy artifacts, worker CSP`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
