// Optional integration check. Install pinned runtime packages under .local/runtime-check
// as documented in docs/PRODUCTION-AUDIT.md. This does not replace browser QA.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { assessments, assessmentProgram } from "../src/data/assessments";

const root = process.cwd();
const runtimeRequire = createRequire(
  path.join(root, ".local/runtime-check/package.json"),
);
const { loadPyodide } = runtimeRequire("pyodide");
const initSqlJs = runtimeRequire("sql.js");
const workerSource = readFileSync(
  path.join(root, "public/lab-runtime-worker.js"),
  "utf8",
);
const policySource = readFileSync(
  path.join(root, "public/lab-runtime-policy.js"),
  "utf8",
);
type Reply = { id: number; output?: string; error?: string };
function runtime(language: "python" | "sql", failFirst = false) {
  let reply: Reply | undefined;
  let attempts = 0;
  const context = vm.createContext({
    URL,
    Request,
    Headers,
    Error,
    fetch,
    location: {
      href: `https://lab.test/lab-runtime-worker.js?language=${language}`,
    },
    postMessage: (message: Reply) => {
      reply = message;
    },
  });
  context.self = context;
  context.importScripts = (url: string) => {
    if (url === "/lab-runtime-policy.js")
      vm.runInContext(policySource, context);
    else if (url.endsWith("pyodide.js"))
      context.loadPyodide = async (options: object) => {
        if (failFirst && attempts++ === 0)
          throw new Error("Simulated CDN failure");
        return loadPyodide({
          ...options,
          indexURL: path.join(
            root,
            ".local/runtime-check/node_modules/pyodide",
          ),
        });
      };
    else if (url.endsWith("sql-wasm.js"))
      context.initSqlJs = () =>
        initSqlJs({
          locateFile: (file: string) =>
            path.join(
              root,
              ".local/runtime-check/node_modules/sql.js/dist",
              file,
            ),
        });
    else throw new Error("Unexpected runtime import");
  };
  vm.runInContext(workerSource, context);
  return async (code: string, input = ""): Promise<Reply> => {
    reply = undefined;
    await context.onmessage({ data: { id: 1, code, input } });
    assert.ok(reply, "Worker must return a result");
    return reply;
  };
}

async function main() {
  const python = runtime("python", true);
  assert.match((await python("print(1)")).error ?? "", /Simulated CDN failure/);
  assert.equal(
    (await python("print(int(input()) // 25, int(input()) % 25)", "85\n85"))
      .output,
    "3 10",
  );
  const solutions: Record<string, string> = {
    "python-focus-planner":
      "def plan_reading(pages, per_session):\n    if pages < 0 or per_session <= 0:\n        raise ValueError('invalid input')\n    return (pages // per_session, pages % per_session)",
    "python-task-tracker":
      "def completed_count(tasks):\n    return sum(1 for task in tasks if task['done'] is True)",
    "first-api-client":
      "def summarize_repo(status, data):\n    if status == 200:\n        return data.get('full_name', 'Unnamed repository')\n    if status == 404:\n        return 'Not found'\n    if status == 429 or status >= 500:\n        return 'Try later'\n    return 'Unexpected response'",
  };
  for (const [id, assessment] of Object.entries(assessments)) {
    for (const [code, expectPass] of [
      [assessment.starter, false],
      [solutions[id], true],
    ] as const) {
      const reply = await python(assessmentProgram(id, code));
      assert.equal(reply.error, undefined);
      const line = reply.output
        ?.split("\n")
        .findLast((l) => l.startsWith("__LAB_CHECKS__"));
      assert.ok(line);
      const results = JSON.parse(line.slice("__LAB_CHECKS__".length)) as {
        passed: boolean;
      }[];
      assert.equal(results.length, assessment.tests.length);
      assert.equal(
        results.every((result) => result.passed),
        expectPass,
        id,
      );
    }
    console.log(
      `PASS Python assessment: ${id} (starter fails, valid solution passes)`,
    );
  }
  assert.ok(
    (await python("for i in range(70000): print('x')")).output!.length < 60200,
  );
  const sql = runtime("sql");
  assert.equal(
    (
      await sql(
        "CREATE TABLE tasks(name TEXT); INSERT INTO tasks VALUES ('Learn'), ('Build'); SELECT * FROM tasks;",
      )
    ).output,
    "name\nLearn\nBuild",
  );
  const capped = await sql(
    "WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<20000) SELECT x FROM n; INSERT INTO tasks VALUES ('After limit');",
  );
  assert.equal(capped.error, undefined);
  assert.match(capped.output!, /Output limit reached/);
  assert.ok(capped.output!.length < 60200);
  assert.equal(
    (await sql("SELECT count(*) AS count FROM tasks;")).output,
    "count\n3",
  );
  assert.ok((await sql("SELECT missing FROM tasks;")).error);
  assert.equal((await sql("SELECT 42 AS answer;")).output, "answer\n42");
  console.log(
    "PASS runtime retry, Python input/output cap, SQLite rows/output cap/subsequent mutation/error recovery",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
