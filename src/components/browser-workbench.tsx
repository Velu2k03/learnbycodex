"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  LoaderCircle,
  Play,
  Square,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { Mission, MissionProgress } from "@/lib/types";
import { parseDraft } from "@/lib/workbench-storage";
import { previewDocument } from "@/lib/preview";
import { downloadText } from "@/lib/download";
import { StuckHelp } from "./stuck-help";

type Mode =
  "web" | "python" | "sql" | "javascript" | "json" | "markdown" | "powershell";
type FileName =
  | "index.html"
  | "styles.css"
  | "script.js"
  | "main.py"
  | "query.sql"
  | "main.js"
  | "data.json"
  | "notes.md"
  | "commands.ps1";
type OutputLine = { kind: "normal" | "error" | "success"; text: string };
type BrowserWorker = Worker & {
  onmessage:
    | ((
        event: MessageEvent<{ id: number; output?: string; error?: string }>,
      ) => void)
    | null;
};

const filesByMode: Record<Mode, FileName[]> = {
  web: ["index.html", "styles.css", "script.js"],
  python: ["main.py"],
  sql: ["query.sql"],
  javascript: ["main.js"],
  json: ["data.json"],
  markdown: ["notes.md"],
  powershell: ["commands.ps1"],
};
const modeNames: Record<Mode, string> = {
  web: "HTML / CSS / JS",
  python: "Python",
  sql: "SQL · SQLite",
  javascript: "JavaScript",
  json: "JSON",
  markdown: "Markdown",
  powershell: "PowerShell · guided",
};
const starterHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>My project</title></head>
<body><main><p class="eyebrow">TODAY'S SMALL WIN</p><h1>One idea, made real.</h1><p id="message">Change the code, then run it.</p><button id="try-it">Try the interaction</button></main></body></html>`;
const starterCss = `:root { font-family: system-ui, sans-serif; color: #162927; background: #e7f4eb; }
main { max-width: 34rem; margin: 3rem auto; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 1rem 3rem #163e2a1c; }
.eyebrow { color: #167a67; font-size: .75rem; font-weight: 700; }
button { padding: .7rem 1rem; border: 0; border-radius: .5rem; background: #ed7958; color: white; cursor: pointer; }`;
const starterJs = `const button = document.querySelector("#try-it");
const message = document.querySelector("#message");
button.addEventListener("click", () => {
  message.textContent = "It works. Now make it yours.";
  console.log("The button was clicked.");
});`;
const starterSql = `DROP TABLE IF EXISTS focus_sessions;
CREATE TABLE focus_sessions (id INTEGER PRIMARY KEY, topic TEXT NOT NULL, minutes INTEGER NOT NULL);
INSERT INTO focus_sessions (topic, minutes) VALUES ('Python practice', 25), ('SQL practice', 15);
SELECT topic, minutes FROM focus_sessions WHERE minutes >= 15;`;
const githubApiStarter = `import asyncio
from pyodide.http import pyfetch

url = "https://api.github.com/repos/microsoft/ai-agents-for-beginners"
response = await pyfetch(url, headers={"Accept": "application/vnd.github+json"})
if response.ok:
  repo = await response.json()
  print(repo["full_name"])
  print(repo["description"])
else:
  print(f"GitHub returned HTTP {response.status}")`;

function getMode(language: string): Mode {
  const value = language.toLowerCase();
  if (value.includes("python")) return "python";
  if (value.includes("html")) return "web";
  if (value.includes("sql")) return "sql";
  if (value.includes("javascript")) return "javascript";
  if (value.includes("markdown")) return "markdown";
  return "powershell";
}

function starterFiles(mission: Mission): Record<FileName, string> {
  const mode = getMode(mission.language);
  const style =
    mission.code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i)?.[1]?.trim() ||
    starterCss;
  const script =
    mission.code.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1]?.trim() ||
    starterJs;
  const page =
    mode === "web"
      ? mission.code
          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/i, "")
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/i, "")
          .trim()
      : starterHtml;
  return {
    "index.html": page || starterHtml,
    "styles.css": style,
    "script.js": script,
    "main.py":
      mode === "python"
        ? mission.id === "first-api-client"
          ? githubApiStarter
          : mission.code
        : "print('A small program, running right here in your browser.')\n",
    "query.sql": starterSql,
    "main.js":
      "const focusMinutes = 25;\nconsole.log(`Today's focus: ${focusMinutes} minutes`);\n",
    "data.json": '{\n  "goal": "learn by building",\n  "minutes": 60\n}\n',
    "notes.md":
      "# My learning notes\n\nOne thing I tried:\n\nOne thing I learned:\n",
    "commands.ps1":
      mode === "powershell" ? mission.code : "Get-Location\nGet-ChildItem\n",
  };
}

function languageExtension(file: FileName) {
  if (file.endsWith(".py")) return python();
  if (file.endsWith(".sql")) return sql();
  if (file.endsWith(".html")) return html();
  if (file.endsWith(".css")) return css();
  if (file.endsWith(".js")) return javascript();
  if (file.endsWith(".md")) return markdown();
  if (file.endsWith(".json")) return javascript();
  return [];
}

function simulateCommands(source: string) {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((command) => {
      if (/^(get-location|pwd)$/i.test(command))
        return "~/learning-lab  (simulated browser folder; no access to your computer)";
      if (/^(get-childitem|ls|dir)$/i.test(command))
        return "hello.txt     learning-log.md  (sample sandbox files)";
      if (/^get-content\s+hello\.txt$/i.test(command))
        return "I can build one small thing today.";
      if (/^(set-location|cd)\s+/i.test(command))
        return "Location changed in the lesson simulation only.";
      if (/^git\s+/i.test(command))
        return "Git is not running on your computer. This is command practice only; nothing is committed or pushed.";
      if (/^(py|python)(\s+--version)?$/i.test(command))
        return "Python runs in the Python tab. This simulation cannot inspect installed tools.";
      return `Not run: "${command}" is outside this safe browser terminal simulation.`;
    });
}

function browserTasks(mission: Mission) {
  const taskText: Record<string, string[]> = {
    "your-first-workspace": [
      "Use the guided terminal to inspect the sample project folder.",
      "Write your first learning sentence in the saved notes below.",
      "Try Get-Content hello.txt in the guided terminal simulation.",
      "Run the preloaded Python example in this browser workspace.",
      "Record the command that worked in your learning notes.",
    ],
    "your-first-repository": [
      "Write a project README in the Markdown tab.",
      "Rehearse git init and git status in the guided terminal; no computer files change.",
      "Write a second change note and describe a clear commit message.",
      "Practice the remote and push command order; this simulation does not contact GitHub.",
      "Explain how you would verify a published README and commit history; publishing needs GitHub authorization.",
    ],
    "python-focus-planner": [
      "Edit the preloaded main.py file here in the browser workspace.",
      "Predict the output, enter a value under Program input, and run the Python program.",
      "Test 60, 24, 0, and -5 using Program input; record the real output below.",
      "Change the block size to 15 and test again in the browser.",
      "Record the actual output in your notes; code and notes stay in this browser.",
    ],
    "python-task-tracker": [
      "Edit and run the preloaded tasks.py example in the browser Python workspace.",
      "Add three real learning tasks to the example data.",
      "Run assertions for empty, mixed, and all-done lists.",
      "Explain the function's input and output in the Markdown tab.",
      "Save the passing test output and your explanation in the notes below.",
    ],
    "first-project-page": [
      "Edit index.html, styles.css, and script.js in the browser editor.",
      "Change the title and introduction to describe your learning project.",
      "Add the button interaction and test three clicks in Preview.",
      "Test the button with Tab and Enter, and resize the preview.",
      "Record what the counter does on refresh and what you learned.",
    ],
    "first-api-client": [
      "Run the preloaded public GitHub API example in the browser Python workspace.",
      "Change the repository URL to another public repository API address.",
      "Print the repository name, description, and primary language.",
      "Try a nonexistent repository and record its real HTTP status.",
      "Save sample output and explain that only the Python request contacts GitHub.",
    ],
  };
  return taskText[mission.id] ?? mission.tasks;
}

function makePreview(files: Record<FileName, string>, mode: Mode) {
  const page =
    mode === "web"
      ? files["index.html"]
      : "<!doctype html><html><head></head><body><main><h1>JavaScript preview</h1><p>Your script runs in this isolated preview.</p></main></body></html>";
  return previewDocument(
    page,
    files["styles.css"],
    files[mode === "javascript" ? "main.js" : "script.js"],
  );
}

export function BrowserWorkbench({
  mission,
  progress,
  onBack,
  onContinue,
  onTaskChange,
  onNotesChange,
}: {
  mission: Mission;
  progress: MissionProgress;
  onBack: () => void;
  onContinue: () => void;
  onTaskChange: (index: number, checked: boolean) => void;
  onNotesChange: (notes: string) => void;
}) {
  const initialMode = getMode(mission.language);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [files, setFiles] = useState<Record<FileName, string>>(() =>
    starterFiles(mission),
  );
  const [activeFile, setActiveFile] = useState<FileName>(
    filesByMode[initialMode][0],
  );
  const [draftReady, setDraftReady] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [saveStatus, setSaveStatus] = useState("Opening draft…");
  const [outputTab, setOutputTab] = useState<"console" | "preview">(
    initialMode === "web" ? "preview" : "console",
  );
  const [output, setOutput] = useState<OutputLine[]>([
    {
      kind: "normal",
      text: "Ready when you are. Your code runs in this browser.",
    },
  ]);
  const [running, setRunning] = useState(false);
  const [programInput, setProgramInput] = useState("60");
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);
  const runId = useRef(0);
  const runningRef = useRef(false);
  const draftBlocked = useRef(false);
  const draftLoaded = useRef(false);
  const filesRef = useRef(files);
  const runtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workers = useRef<Partial<Record<"python" | "sql", BrowserWorker>>>({});
  const activeWorker = useRef<BrowserWorker | null>(null);
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const storageKey = `drvelu-workbench-${mission.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const restored = parseDraft(JSON.parse(saved));
        const nextFiles = { ...starterFiles(mission), ...restored };
        filesRef.current = nextFiles;
        // Hydrate browser-only drafts after SSR; this effect intentionally synchronizes an external store.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFiles(nextFiles);
      }
      draftLoaded.current = true;
      setSaveStatus(saved ? "Draft restored" : "Ready to save locally");
    } catch {
      draftBlocked.current = true;
      setDraftError(
        "Your saved draft could not be opened. The original is preserved. Download it for recovery; automatic saving is paused.",
      );
      setSaveStatus("Saving paused");
    }
    setDraftReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) {
        draftBlocked.current = true;
        setDraftError(
          "This draft changed in another tab. Download your current code, then reload to use the saved version. Saving is paused to avoid overwriting it.",
        );
        setSaveStatus("Saving paused");
      }
    };
    window.addEventListener("storage", onStorage);
    const flushDraft = () => {
      if (draftLoaded.current && !draftBlocked.current) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ files: filesRef.current }),
          );
        } catch {
          /* Existing record stays intact; status is reported while mounted. */
        }
      }
    };
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flushDraft();
    };
    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      flushDraft();
      if (runtimeTimer.current) clearTimeout(runtimeTimer.current);
      Object.values(workers.current).forEach((worker) => worker?.terminate());
      workers.current = {};
    };
  }, [mission, storageKey]);

  useEffect(() => {
    if (!draftReady || draftBlocked.current) return;
    filesRef.current = files;
    const timer = window.setTimeout(() => {
      if (draftBlocked.current) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ files }));
        setSaveStatus("Draft saved in this browser");
      } catch {
        setDraftError(
          "This browser could not save your code. Download the current files before leaving this page.",
        );
        setSaveStatus("Save failed");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftReady, files, storageKey]);

  useEffect(() => {
    const receivePreview = (
      event: MessageEvent<{ source?: string; error?: boolean; text?: string }>,
    ) => {
      if (
        event.source !== previewFrame.current?.contentWindow ||
        event.data?.source !== "drvelu-preview"
      )
        return;
      const line: OutputLine = {
        kind: event.data.error ? "error" : "normal",
        text: String(event.data.text ?? "").slice(0, 2000),
      };
      setOutput((lines) => [...lines, line].slice(-100));
    };
    window.addEventListener("message", receivePreview);
    return () => window.removeEventListener("message", receivePreview);
  }, []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void runCode();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  });

  function getWorker(language: "python" | "sql") {
    if (workers.current[language]) return workers.current[language]!;
    const worker = new Worker(
      `/lab-runtime-worker.js?language=${language}`,
    ) as BrowserWorker;
    worker.onmessage = (event) => {
      if (event.data.id !== runId.current || activeWorker.current !== worker)
        return;
      if (runtimeTimer.current) clearTimeout(runtimeTimer.current);
      setOutput([
        {
          kind: event.data.error ? "error" : "normal",
          text:
            event.data.error ?? event.data.output ?? "Finished with no output.",
        },
      ]);
      setRunning(false);
      runningRef.current = false;
      activeWorker.current = null;
    };
    worker.onerror = (event) => {
      if (workers.current[language] !== worker) return;
      worker.terminate();
      delete workers.current[language];
      if (activeWorker.current !== worker) return;
      if (runtimeTimer.current) clearTimeout(runtimeTimer.current);
      setOutput([
        {
          kind: "error",
          text: event.message || "The browser runtime could not start.",
        },
      ]);
      setRunning(false);
      runningRef.current = false;
      activeWorker.current = null;
    };
    workers.current[language] = worker;
    return worker;
  }

  async function runCode() {
    if (runningRef.current) return;
    runningRef.current = true;
    setOutput([]);
    setRunning(true);
    if (mode === "python" || mode === "sql") {
      const id = ++runId.current;
      setOutput([
        {
          kind: "normal",
          text: `Starting ${mode === "python" ? "Python" : "SQLite"}; first use downloads its runtime from an official CDN.`,
        },
      ]);
      setOutputTab("console");
      let worker: BrowserWorker;
      try {
        worker = getWorker(mode);
      } catch {
        runningRef.current = false;
        setRunning(false);
        setOutput([
          {
            kind: "error",
            text: "This browser could not start the runtime. Reload and try again.",
          },
        ]);
        return;
      }
      activeWorker.current = worker;
      worker.postMessage({
        id,
        language: mode,
        code: files[activeFile],
        input: programInput,
      });
      runtimeTimer.current = setTimeout(() => {
        if (runId.current !== id) return;
        worker.terminate();
        delete workers.current[mode];
        runId.current += 1;
        setOutput([
          {
            kind: "error",
            text: "This program ran too long, so the browser stopped it. Check for a loop that never ends, then try again.",
          },
        ]);
        setRunning(false);
        runningRef.current = false;
        activeWorker.current = null;
      }, 45_000);
      return;
    }
    if (mode === "web" || mode === "javascript") {
      setPreview(makePreview(files, mode));
      setOutput([
        {
          kind: "success",
          text: "Preview refreshed in an isolated iframe. Remote requests and access to your computer files are restricted.",
        },
      ]);
      setOutputTab("preview");
    } else if (mode === "json") {
      try {
        setOutput([
          {
            kind: "success",
            text: JSON.stringify(JSON.parse(files["data.json"]), null, 2),
          },
        ]);
      } catch (error) {
        setOutput([
          {
            kind: "error",
            text: error instanceof Error ? error.message : "Invalid JSON.",
          },
        ]);
      }
    } else if (mode === "markdown") {
      setOutput([{ kind: "success", text: files["notes.md"] }]);
    } else {
      setOutput(
        simulateCommands(files["commands.ps1"]).map((text) => ({
          kind: "normal",
          text,
        })),
      );
      setOutputTab("console");
    }
    setRunning(false);
    runningRef.current = false;
  }

  function stopRun() {
    runId.current += 1;
    if (runtimeTimer.current) clearTimeout(runtimeTimer.current);
    Object.values(workers.current).forEach((worker) => worker?.terminate());
    workers.current = {};
    activeWorker.current = null;
    runningRef.current = false;
    setRunning(false);
    setOutput([
      {
        kind: "normal",
        text: "Program stopped. Your code is still here; make a small change and try again.",
      },
    ]);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(files[activeFile]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setOutput([
        {
          kind: "error",
          text: "Clipboard access is unavailable in this browser.",
        },
      ]);
    }
  }

  function changeMode(next: Mode) {
    if (runningRef.current) stopRun();
    setMode(next);
    setActiveFile(filesByMode[next][0]);
    setOutputTab(
      next === "web" || next === "javascript" ? "preview" : "console",
    );
  }

  return (
    <div className="browser-lab">
      <header className="lab-header">
        <button type="button" className="lab-back" onClick={onBack}>
          <ArrowLeft size={16} /> Lesson
        </button>
        <div className="lab-title">
          <span className="lab-mark">
            <Code2 size={18} />
          </span>
          <div>
            <strong>{mission.title}</strong>
            <small>
              IN-BROWSER WORKSPACE · LEVEL{" "}
              {String(mission.level).padStart(2, "0")}
            </small>
          </div>
        </div>
        <div className="lab-header-right">
          <span className="lab-save" role="status">
            <span />
            {saveStatus}
          </span>
          <StuckHelp mission={mission} />
          <button type="button" className="lab-continue" onClick={onContinue}>
            Checkpoint
            <ArrowRight size={15} />
          </button>
        </div>
      </header>
      {draftError && (
        <div className="lab-save-error" role="alert">
          <p>{draftError}</p>
          <button
            type="button"
            onClick={() =>
              downloadText(
                "my-editor-files.json",
                JSON.stringify({ files }, null, 2),
              )
            }
          >
            <Download size={15} /> Download current files
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                downloadText(
                  "original-editor-draft.json",
                  localStorage.getItem(storageKey) ?? "{}",
                );
              } catch {
                setDraftError(
                  "The browser is blocking storage access. Download your current files instead.",
                );
              }
            }}
          >
            Download original saved draft
          </button>
        </div>
      )}
      <div className="lab-grid">
        <aside className="lab-brief">
          <div className="lab-brief-top">
            <span className="lab-eyebrow">YOUR BUILD</span>
            <span className="lab-task-count">
              {progress.tasks.length}/{mission.tasks.length}
            </span>
          </div>
          <h1>{mission.title}</h1>
          <p className="lab-subtitle">{mission.subtitle}</p>
          <section className="lab-instructions">
            <div className="lab-section-heading">
              <span className="lab-section-icon">
                <Sparkles size={15} />
              </span>
              <h2>Instructions</h2>
            </div>
            <ul className="lab-objectives">
              {mission.objectives.map((objective) => (
                <li key={objective}>
                  <Check size={14} />
                  {objective}
                </li>
              ))}
            </ul>
            {mission.lesson.map((section, index) => (
              <article className="lab-lesson" key={section.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </div>
              </article>
            ))}
          </section>
          <details className="lab-vocabulary">
            <summary>Unfamiliar word? Open the mini glossary</summary>
            <div>
              <p>
                <strong>Runtime</strong> is the software that runs your program.
              </p>
              <p>
                <strong>API</strong> is a way for one program to request data
                from another service.
              </p>
              <p>
                <strong>Sandbox</strong> is a limited workspace that keeps your
                program away from your computer files.
              </p>
            </div>
          </details>
          <section className="lab-tasks">
            <div className="lab-section-heading">
              <span className="lab-section-icon coral">
                <CheckCircle2 size={15} />
              </span>
              <h2>Build checklist</h2>
            </div>
            {browserTasks(mission).map((task, index) => (
              <label className="lab-task" key={task}>
                <input
                  type="checkbox"
                  checked={progress.tasks.includes(index)}
                  onChange={(event) =>
                    onTaskChange(index, event.target.checked)
                  }
                />
                <span className="lab-task-check">
                  {progress.tasks.includes(index) ? (
                    <Check size={12} />
                  ) : (
                    <Circle size={12} />
                  )}
                </span>
                <span>{task}</span>
              </label>
            ))}
          </section>
          <label className="lab-notes">
            What happened when you ran it?
            <textarea
              value={progress.buildNotes}
              maxLength={10000}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Write down your real result or an error you want to understand."
            />
            <small>
              Saved with your learning progress. Never paste passwords or API
              keys.
            </small>
          </label>
        </aside>
        <section className="lab-editor-panel" aria-label="Code editor">
          <div className="lab-editor-toolbar">
            <div className="lab-language">
              <FileCode2 size={15} />
              <label className="sr-only" htmlFor="lab-language">
                Choose an editor language
              </label>
              <select
                id="lab-language"
                value={mode}
                onChange={(event) => changeMode(event.target.value as Mode)}
              >
                {Object.entries(modeNames).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lab-editor-actions">
              <span className="lab-shortcut">Ctrl + Enter</span>
              <button
                type="button"
                className="lab-icon-button"
                onClick={() => void copyCode()}
                aria-label="Copy current file"
                title="Copy current file"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
              {running && (
                <button
                  type="button"
                  className="lab-run stop"
                  onClick={stopRun}
                >
                  <Square size={13} />
                  Stop
                </button>
              )}
              <button
                type="button"
                className="lab-run"
                onClick={() => void runCode()}
                disabled={running}
              >
                <Play size={14} fill="currentColor" />
                {running ? "Running" : "Run"}
              </button>
            </div>
          </div>
          <div
            className="lab-file-tabs"
            role="group"
            aria-label="Project files"
          >
            {filesByMode[mode].map((file) => (
              <button
                type="button"
                key={file}
                aria-pressed={activeFile === file}
                className={activeFile === file ? "active" : ""}
                onClick={() => setActiveFile(file)}
              >
                <span className={`file-dot ${file.split(".").pop()}`} />
                {file}
              </button>
            ))}
          </div>
          <div className="lab-editor">
            <CodeMirror
              value={files[activeFile]}
              height="100%"
              theme="dark"
              indentWithTab={false}
              extensions={[
                languageExtension(activeFile),
                EditorView.lineWrapping,
                EditorView.contentAttributes.of({
                  "aria-label": `Edit ${activeFile}`,
                }),
              ]}
              onChange={(value) => {
                if (value.length > 120000) {
                  setDraftError(
                    "Keep each file under 120,000 characters. This edit was not applied.",
                  );
                  return;
                }
                const nextFiles = { ...files, [activeFile]: value };
                filesRef.current = nextFiles;
                setFiles(nextFiles);
                if (!draftBlocked.current) setSaveStatus("Saving…");
              }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                autocompletion: true,
              }}
              aria-label={`Edit ${activeFile}`}
            />
          </div>
          <div className="lab-editor-footer">
            <span>
              <span className="lab-live-dot" />
              {saveStatus}
            </span>
            <span>{files[activeFile].split("\n").length} lines</span>
          </div>
        </section>
        <section className="lab-output-panel" aria-label="Run output">
          <div
            className="lab-output-tabs"
            role="group"
            aria-label="Output view"
          >
            <button
              type="button"
              aria-pressed={outputTab === "console"}
              className={outputTab === "console" ? "active" : ""}
              onClick={() => setOutputTab("console")}
            >
              <Terminal size={15} />
              Console
            </button>
            <button
              type="button"
              aria-pressed={outputTab === "preview"}
              className={outputTab === "preview" ? "active" : ""}
              onClick={() => setOutputTab("preview")}
            >
              <Eye size={15} />
              Preview
            </button>
          </div>
          <div className="lab-preview-wrap" hidden={outputTab !== "preview"}>
            {preview ? (
              <iframe
                ref={previewFrame}
                title="Isolated code preview"
                sandbox="allow-scripts"
                srcDoc={preview}
              />
            ) : (
              <div className="lab-preview-empty">
                <div className="preview-orbit">
                  <Code2 size={25} />
                </div>
                <h2>Your preview appears here</h2>
                <p>Edit your files, then run the project.</p>
                <div className="preview-lines">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
          <div className="lab-console" hidden={outputTab !== "console"}>
            <div className="console-topline">
              <span className="console-lights">
                <i />
                <i />
                <i />
              </span>
              <span>browser console</span>
              <span className="console-runtime">{modeNames[mode]}</span>
            </div>
            {mode === "python" && (
              <>
                <label className="console-input">
                  Program input <span>one value per line, used by input()</span>
                  <textarea
                    value={programInput}
                    onChange={(event) => setProgramInput(event.target.value)}
                    aria-label="Python program input"
                    placeholder="Example: 60"
                  />
                </label>
              </>
            )}
            {mode === "python" && mission.id === "first-api-client" && (
              <p className="console-api-note">
                This exercise uses public GitHub data without credentials. If
                GitHub reports a rate limit, save your code and try again later.
              </p>
            )}
            <div className="console-output" aria-live="polite">
              <div className="console-welcome">
                <span className="console-prompt">$</span>
                <span>
                  Run your code here. Errors are clues; change one thing and try
                  again.
                </span>
              </div>
              {output.map((line, index) => (
                <div
                  className={`console-line ${line.kind}`}
                  key={`${index}-${line.text.slice(0, 20)}`}
                >
                  <span>
                    {line.kind === "error"
                      ? "!"
                      : line.kind === "success"
                        ? "✓"
                        : "›"}
                  </span>
                  <pre>{line.text}</pre>
                </div>
              ))}
              {running && (
                <div className="console-running">
                  <LoaderCircle size={15} />
                  Starting browser runtime…
                </div>
              )}
            </div>
            <div className="console-hint">
              <span>BROWSER PRACTICE</span>
              {mode === "python" || mode === "sql"
                ? "Runs in a browser worker. Code is not sent to this app's server."
                : mode === "powershell"
                  ? "Commands are simulated. This page cannot access your computer or publish Git changes."
                  : "Web code runs in an isolated iframe with restricted remote requests and no access to your saved Lab data."}
            </div>
          </div>
          <div className="lab-output-footer">
            <span>
              <span className="lab-output-pulse" />
              Browser-only execution
            </span>
            <span>{running ? "Running — you can stop anytime" : "Ready"}</span>
          </div>
        </section>
      </div>
      <footer className="lab-footer">
        <span>
          <Sparkles size={14} />
          Make a small change. See what happens.
        </span>
        <span>Progress and editor drafts stay in this browser.</span>
      </footer>
    </div>
  );
}
