import { test } from "node:test";
import assert from "node:assert/strict";
import {
  collectDrafts,
  parseBackupDrafts,
  parseDraft,
  draftKey,
  writeRestoredBackup,
} from "../src/lib/workbench-storage";
test("valid editor files survive backup collection and validation", () => {
  const key = draftKey("python-focus-planner");
  const raw = JSON.stringify({
    files: { "main.py": "print(42)", "notes.md": "My notes" },
  });
  const result = collectDrafts({ getItem: (k) => (k === key ? raw : null) });
  assert.equal(
    parseBackupDrafts(result.drafts)["python-focus-planner"]["main.py"],
    "print(42)",
  );
});

test("failed backup restore rolls back earlier writes without losing originals under quota", () => {
  const first = draftKey("python-focus-planner");
  const second = draftKey("python-task-tracker");
  const records = new Map([
    [first, "x".repeat(100)],
    ["progress", "original"],
  ]);
  const original = new Map(records);
  const storage = {
    getItem: (key: string) => records.get(key) ?? null,
    removeItem: (key: string) => {
      records.delete(key);
    },
    setItem: (key: string, value: string) => {
      const size =
        [...records].reduce((n, [k, v]) => n + (k === key ? 0 : v.length), 0) +
        value.length;
      if (size > 160) throw new Error("quota");
      records.set(key, value);
    },
  };
  assert.throws(
    () =>
      writeRestoredBackup(storage, "progress", "x".repeat(160), {
        "python-focus-planner": { "main.py": "1" },
        "python-task-tracker": { "main.py": "x".repeat(65) },
      }),
    /quota/,
  );
  assert.deepEqual(records, original);
  assert.equal(records.has(second), false);
});
test("corrupt drafts are preserved as raw recovery records", () => {
  const result = collectDrafts({
    getItem: (k) => (k === draftKey("python-focus-planner") ? "{broken" : null),
  });
  assert.equal(result.rawDrafts["python-focus-planner"], "{broken");
  assert.deepEqual(result.drafts, {});
});
test("invalid draft files are not silently truncated or replaced", () => {
  assert.throws(() => parseDraft({ files: { "main.py": 12 } }));
  assert.throws(() => parseDraft({ files: { "main.py": "a".repeat(120001) } }));
  assert.throws(() => parseDraft(null));
  assert.deepEqual(
    parseDraft({ files: { "main.py": "print(1)", unknown: "ignore" } }),
    { "main.py": "print(1)" },
  );
});
