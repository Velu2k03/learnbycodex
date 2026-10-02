"use client";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Play,
  Shield,
  Square,
  XCircle,
} from "lucide-react";
import { assessments, assessmentProgram } from "@/data/assessments";
import { useLab } from "./lab-provider";
export function BossChallenge({ missionId }: { missionId: string }) {
  const { state, updateMission } = useLab();
  const assessment = assessments[missionId];
  const progress = state.missions[missionId];
  const code = progress?.bossCode ?? assessment?.starter ?? "";
  const results = progress?.bossChecks ?? [];
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRunning(false);
  };
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  if (!assessment) return null;
  function run() {
    if (worker.current) return;
    setError("");
    updateMission(missionId, { bossCode: code, bossChecks: [] });
    setRunning(true);
    try {
      const runtime = new Worker("/lab-runtime-worker.js?language=python");
      worker.current = runtime;
      runtime.onmessage = (
        event: MessageEvent<{ output?: string; error?: string }>,
      ) => {
        stop();
        if (event.data.error) {
          setError(event.data.error);
          return;
        }
        try {
          const line = event.data.output
            ?.split("\n")
            .findLast((l) => l.startsWith("__LAB_CHECKS__"));
          if (!line)
            throw new Error(
              "No test results were returned. Check your function and try again.",
            );
          const raw = JSON.parse(line.slice("__LAB_CHECKS__".length));
          if (!Array.isArray(raw) || raw.length !== assessment.tests.length)
            throw new Error("The test results were incomplete.");
          const checks = assessment.tests.map((t, i) => ({
            name: t.name,
            passed: raw[i]?.passed === true,
          }));
          updateMission(missionId, { bossCode: code, bossChecks: checks });
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : "The test results could not be read.",
          );
        }
      };
      runtime.onerror = () => {
        stop();
        setError(
          "The Python runtime could not load. Check your connection and try again.",
        );
      };
      runtime.postMessage({
        id: 1,
        code: assessmentProgram(missionId, code),
        input: "",
      });
      timer.current = setTimeout(() => {
        stop();
        setError(
          "The check stopped after 45 seconds. Look for an endless loop, then try again.",
        );
      }, 45000);
    } catch {
      stop();
      setError("This browser could not start Python.");
    }
  }
  const passed = results.filter((r) => r.passed).length;
  return (
    <section className="boss-panel">
      <div className="boss-heading">
        <Shield size={24} />
        <div>
          <span className="eyebrow">INDEPENDENT CHALLENGE</span>
          <h3>{assessment.title}</h3>
        </div>
      </div>
      <p>{assessment.objective}</p>
      {assessment.preparation && (
        <div className="challenge-preparation">
          <h4>One small idea before you start</h4>
          <p>{assessment.preparation.explanation}</p>
          <pre>
            <code>{assessment.preparation.code}</code>
          </pre>
        </div>
      )}
      <label className="field">
        Your Python implementation
        <textarea
          className="boss-code"
          value={code}
          maxLength={110000}
          spellCheck={false}
          disabled={running}
          onChange={(e) =>
            updateMission(missionId, {
              bossCode: e.target.value,
              bossChecks: [],
            })
          }
        />
      </label>
      <div className="action-row">
        <button className="button primary" disabled={running} onClick={run}>
          <Play size={16} />
          {running ? "Running real Python checks…" : "Run practical checks"}
        </button>
        {running && (
          <button className="button secondary" onClick={stop}>
            <Square size={15} />
            Stop
          </button>
        )}
      </div>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {results.length > 0 && (
        <div className="boss-results" role="status">
          <h4>
            {passed} passed · {results.length - passed} need attention
          </h4>
          <ul className="list-clean">
            {results.map((r) => (
              <li key={r.name}>
                {r.passed ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                <span>
                  <strong>{r.passed ? "Passed" : "Needs attention"}:</strong>{" "}
                  {r.name}
                </span>
              </li>
            ))}
          </ul>
          {passed === results.length && (
            <p>
              <Code2 size={15} />
              Practiced: {assessment.skills.join(" · ")}
            </p>
          )}
        </div>
      )}
      <p className="provider-note">
        These are executed practice checks in your browser, not a proctored exam
        or independent proof of expertise. Your explanation and project evidence
        still matter.
      </p>
    </section>
  );
}
