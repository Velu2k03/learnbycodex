"use strict";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/";
const engine = new URL(self.location.href).searchParams.get("language");
let runtimePromise;
let runtimeOutput = [];
let apiToken = "";

function restrictNetwork() {
  const browserFetch = self.fetch.bind(self);
  self.fetch = (resource, options = {}) => {
    let target;
    try { target = new URL(typeof resource === "string" ? resource : resource.url, self.location.href); }
    catch { return Promise.reject(new Error("This browser runtime only permits public GitHub GET requests.")); }
    const method = String(options.method || "GET").toUpperCase();
    if (target.protocol === "https:" && target.hostname === "api.github.com" && method === "GET") {
      const headers = new Headers(typeof resource === "string" ? options.headers : resource.headers);
      if (apiToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${apiToken}`);
      return browserFetch(resource, { ...options, headers, redirect: "error" });
    }
    return Promise.reject(new Error("Network access is disabled in this learning sandbox."));
  };
  self.XMLHttpRequest = undefined;
  self.WebSocket = undefined;
  self.EventSource = undefined;
  self.importScripts = () => { throw new Error("Loading scripts from learner code is disabled."); };
}

async function getPython() {
  if (!runtimePromise) {
    importScripts(`${PYODIDE_BASE}pyodide.js`);
    runtimePromise = self.loadPyodide({
      indexURL: PYODIDE_BASE,
      stdout: text => runtimeOutput.push(String(text)),
      stderr: text => runtimeOutput.push(String(text)),
    }).then(runtime => { restrictNetwork(); return runtime; });
  }
  return runtimePromise;
}

async function getDatabase() {
  if (!runtimePromise) {
    importScripts(`${SQLJS_BASE}sql-wasm.js`);
    runtimePromise = self.initSqlJs({ locateFile: file => `${SQLJS_BASE}${file}` }).then(SQL => {
      restrictNetwork();
      return new SQL.Database();
    });
  }
  return runtimePromise;
}

async function runPython(code, input) {
  runtimeOutput = [];
  const runtime = await getPython();
  const values = JSON.stringify(String(input ?? "").split(/\r?\n/));
  const prelude = `import json as __lab_json\n__lab_values = iter(__lab_json.loads(${JSON.stringify(values)}))\ndef input(prompt=""):\n    try:\n        return next(__lab_values)\n    except StopIteration:\n        return ""\n`;
  const result = await runtime.runPythonAsync(`${prelude}\n${code}`);
  if (result !== undefined && result !== null) {
    const text = typeof result.toJs === "function" ? JSON.stringify(result.toJs()) : String(result);
    if (text && text !== "None") runtimeOutput.push(text);
    if (typeof result.destroy === "function") result.destroy();
  }
  return runtimeOutput.join("\n") || "Program finished with no printed output.";
}

async function runSql(code) {
  const db = await getDatabase();
  const results = db.exec(code);
  if (!results.length) return "Query completed. No rows were returned.";
  return results.map(result => [result.columns.join("  |  "), ...result.values.map(row => row.map(value => value === null ? "NULL" : String(value)).join("  | "))].join("\n")).join("\n\n");
}

self.onmessage = async event => {
  const { id, code, input, token } = event.data || {};
  apiToken = typeof token === "string" ? token : "";
  try {
    const output = engine === "python" ? await runPython(String(code ?? ""), input) : engine === "sql" ? await runSql(String(code ?? "")) : "Unsupported browser runtime.";
    self.postMessage({ id, output });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};