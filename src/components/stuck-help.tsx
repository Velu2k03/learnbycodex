"use client";
import { useRef, useState } from "react";
import { ArrowRight, LifeBuoy, Lightbulb, X } from "lucide-react";
import type { Mission } from "@/lib/types";
const topics = [
  "I don’t understand the concept",
  "I don’t understand the error",
  "I don’t know what to code",
  "I need a hint",
  "I want an example",
  "I need debugging help",
];
export function StuckHelp({ mission }: { mission: Mission }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [topic, setTopic] = useState(topics[0]);
  const [level, setLevel] = useState(0);
  const hints =
    topic.includes("error") || topic.includes("debugging")
      ? [
          "Read the last line of the error first. What type of problem does it name?",
          "Find the referenced line. Check the value, type, path, or name it uses. Change only one assumption at a time.",
          `A nearby example: ${mission.debug.question}`,
          "Compare the broken snippet in Practice with the working lesson example. Predict what changes before trying a fix.",
          mission.debug.explanation,
        ]
      : topic.includes("code")
        ? [
            "Describe the smallest useful result in one sentence. Start with an input and the output you expect.",
            mission.tasks[0],
            `Your first example to adapt: ${mission.objectives[0]}. Open Learn to trace the code one line at a time.`,
            mission.practice.hints[
              Math.min(1, mission.practice.hints.length - 1)
            ],
            `${mission.practice.explanation} The complete example is in Learn. Recreate it, then change one input and explain the result.`,
          ]
        : [
            mission.lesson[0].body,
            mission.practice.hints[0],
            mission.practice.hints[1] ?? mission.practice.prompt,
            mission.practice.hints.at(-1)!,
            mission.practice.explanation,
          ];
  return (
    <>
      <button
        ref={trigger}
        className="button stuck-button"
        type="button"
        onClick={() => {
          setLevel(0);
          dialog.current?.showModal();
        }}
      >
        <LifeBuoy size={17} />
        I’m stuck
      </button>
      <dialog
        ref={dialog}
        aria-label="Mission help"
        className="stuck-dialog"
        onClose={() => trigger.current?.focus()}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">ONE SMALL STEP AT A TIME</span>
            <h2>Let’s get you moving again.</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close help"
            onClick={() => dialog.current?.close()}
          >
            <X size={21} />
          </button>
        </div>
        <p className="muted">
          Choose what feels difficult. You control how much help to reveal.
        </p>
        <label className="field">
          Where are you stuck?
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setLevel(0);
            }}
          >
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <ol className="help-ladder">
          {hints.slice(0, level + 1).map((hint, i) => (
            <li key={`${topic}-${i}`}>
              <span>
                <Lightbulb size={16} />
                {
                  [
                    "First hint",
                    "Direction",
                    "Example",
                    "A stronger hint",
                    "Full explanation",
                  ][i]
                }
              </span>
              <p>{hint}</p>
            </li>
          ))}
        </ol>
        <div className="action-row">
          <button
            className="button primary"
            disabled={level >= 4}
            onClick={() => setLevel((l) => l + 1)}
          >
            {level === 3
              ? "Show the full explanation"
              : "Give me the next hint"}
            <ArrowRight size={15} />
          </button>
          <button
            className="button secondary"
            onClick={() => dialog.current?.close()}
          >
            Let me try
          </button>
        </div>
        <p className="provider-note">
          Mission-specific guidance written for the Lab. A live AI tutor is not
          connected. No code or error is sent to an AI service.
        </p>
      </dialog>
    </>
  );
}
