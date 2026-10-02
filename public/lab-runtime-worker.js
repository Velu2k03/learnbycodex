"use strict";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/";
const engine = new URL(self.location.href).searchParams.get("language");
let runtimePromise;
let runtimeOutput = [];
let busy = false;
let outputSize = 0;
importScripts("/lab-runtime-policy.js");
function recordOutput(value) {
  if (outputSize >= 60000) return;
  const text = String(value).slice(0, 60000 - outputSize);
  runtimeOutput.push(text);
  outputSize += text.length + 1;
  if (outputSize >= 60000)
    runtimeOutput.push("[Output limit reached. Reduce the amount printed.]");
}

function restrictNetwork() {
  const browserFetch = self.fetch.bind(self);
  self.fetch = createLabFetch(browserFetch, self.location.href);
  self.XMLHttpRequest = undefined;
  self.WebSocket = undefined;
  self.EventSource = undefined;
  self.importScripts = () => {
    throw new Error("Loading scripts from learner code is disabled.");
  };
}

async function getPython() {
  if (!runtimePromise) {
    importScripts(`${PYODIDE_BASE}pyodide.js`);
    runtimePromise = self
      .loadPyodide({
        indexURL: PYODIDE_BASE,
        stdout: recordOutput,
        stderr: recordOutput,
      })
      .then((runtime) => {
        restrictNetwork();
        return runtime;
      })
      .catch((error) => {
        runtimePromise = undefined;
        throw error;
      });
  }
  return runtimePromise;
}

async function getDatabase() {
  if (!runtimePromise) {
    importScripts(`${SQLJS_BASE}sql-wasm.js`);
    runtimePromise = self
      .initSqlJs({ locateFile: (file) => `${SQLJS_BASE}${file}` })
      .then((SQL) => {
        restrictNetwork();
        return new SQL.Database();
      })
      .catch((error) => {
        runtimePromise = undefined;
        throw error;
      });
  }
  return runtimePromise;
}

async function runPython(code, input) {
  runtimeOutput = [];
  outputSize = 0;
  const runtime = await getPython();
  const values = JSON.stringify(String(input ?? "").split(/\r?\n/));
  const prelude = `import json as __lab_json\n__lab_values = iter(__lab_json.loads(${JSON.stringify(values)}))\ndef input(prompt=""):\n    try:\n        return next(__lab_values)\n    except StopIteration:\n        return ""\n`;
  const result = await runtime.runPythonAsync(`${prelude}\n${code}`);
  if (result !== undefined && result !== null) {
    const text =
      typeof result.toJs === "function"
        ? JSON.stringify(result.toJs())
        : String(result);
    if (text && text !== "None") recordOutput(text);
    if (typeof result.destroy === "function") result.destroy();
  }
  return runtimeOutput.join("\n") || "Program finished with no printed output.";
}

async function runSql(code) {
  const db = await getDatabase();
  runtimeOutput = [];
  outputSize = 0;
  // Step through rows instead of materializing an unbounded result set.
  for (const statement of db.iterateStatements(code)) {
    if (statement.getColumnNames().length)
      recordOutput(statement.getColumnNames().join("  |  "));
    while (statement.step()) {
      if (outputSize < 60000)
        recordOutput(
          statement
            .get()
            .map((value) => (value === null ? "NULL" : String(value)))
            .join("  |  "),
        );
    }
  }
  return runtimeOutput.join("\n") || "Query completed. No rows were returned.";
}

self.onmessage = async (event) => {
  const { id, code, input } = event.data || {};
  if (busy) {
    self.postMessage({
      id,
      error: "A program is already running. Stop it before starting another.",
    });
    return;
  }
  if (
    !Number.isInteger(id) ||
    typeof code !== "string" ||
    code.length > 120000
  ) {
    self.postMessage({
      id,
      error: "Use a program smaller than 120,000 characters.",
    });
    return;
  }
  busy = true;
  try {
    const output =
      engine === "python"
        ? await runPython(String(code ?? ""), input)
        : engine === "sql"
          ? await runSql(String(code ?? ""))
          : "Unsupported browser runtime.";
    self.postMessage({ id, output });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    busy = false;
  }
};
