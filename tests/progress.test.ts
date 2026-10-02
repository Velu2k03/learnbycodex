import { test } from "node:test";
import assert from "node:assert/strict";
import { missions } from "../src/data/curriculum";
import { assessments } from "../src/data/assessments";
import {
  canComplete,
  emptyProgress,
  initialState,
  parseGithubUrl,
  practiceCorrect,
  restoreState,
  safeExternalUrl,
  scoreQuiz,
  validatedEvidence,
} from "../src/lib/progress";
function completedProgress(index = 0) {
  const mission = missions[index];
  return {
    ...emptyProgress(),
    learned: true,
    practicePassed: true,
    practiceAnswer: mission.practice.answer[0],
    tasks: mission.tasks.map((_, i) => i),
    buildNotes:
      "Actual output: all documented checks produced the expected result.",
    reflection:
      "I checked the folder and learned how the command finds a saved file.",
    bossNotes:
      "I repeated the task independently with a new input and checked the result.",
    repository: "https://github.com/velu/learning-lab",
    attempts: [
      {
        score: 100,
        date: "2026-10-02T00:00:00Z",
        answers: mission.quiz.map((q) => q.answer),
      },
    ],
  };
}
test("a quiz alone cannot complete a mission", () => {
  const p = emptyProgress();
  p.attempts = completedProgress().attempts;
  assert.equal(canComplete(missions[0], p), false);
});

test("new Python completions require every practical check for the current code", () => {
  const mission = missions.find((m) => m.id === "python-focus-planner")!;
  const p = completedProgress(missions.indexOf(mission));
  assert.equal(canComplete(mission, p), false);
  const checks = assessments[mission.id].tests.map((t) => ({
    name: t.name,
    passed: true,
  }));
  assert.equal(
    canComplete(mission, {
      ...p,
      bossCode: "def plan_reading(p, s): return divmod(p, s)",
      bossChecks: checks,
    }),
    true,
  );
  assert.equal(
    canComplete(mission, { ...p, bossCode: "changed code", bossChecks: [] }),
    false,
  );
  assert.equal(
    canComplete(mission, {
      ...p,
      bossCode: "code",
      bossChecks: checks.map((t, i) => ({ ...t, passed: i !== 0 })),
    }),
    false,
  );
});

test("upgrade preserves earlier Python achievements but removes invalid new checks", () => {
  const mission = missions.find((m) => m.id === "python-focus-planner")!;
  const state = initialState();
  state.missions[mission.id] = {
    ...completedProgress(missions.indexOf(mission)),
    completedAt: "2026-10-02T00:00:00Z",
  };
  assert.equal(
    restoreState(state).missions[mission.id].completedAt,
    "2026-10-02T00:00:00Z",
  );
  state.missions[mission.id].bossCode = "pass";
  state.missions[mission.id].bossChecks = [{ name: "forged", passed: true }];
  const restored = restoreState(state).missions[mission.id];
  assert.equal(restored.completedAt, undefined);
  assert.ok(restored.bossChecks?.every((t) => !t.passed));
});
test("completion requires practice, every task, evidence, reflection, and independent challenge", () => {
  const p = completedProgress();
  assert.equal(canComplete(missions[0], p), true);
  for (const key of ["learned", "practicePassed"] as const)
    assert.equal(canComplete(missions[0], { ...p, [key]: false }), false);
  assert.equal(
    canComplete(missions[0], { ...p, tasks: p.tasks.slice(1) }),
    false,
  );
  assert.equal(canComplete(missions[0], { ...p, bossNotes: "" }), false);
  assert.equal(canComplete(missions[0], { ...p, reflection: "" }), false);
  assert.equal(canComplete(missions[0], { ...p, buildNotes: "" }), false);
});
test("post-setup missions require a valid repository link", () => {
  assert.equal(
    canComplete(missions[1], { ...completedProgress(1), repository: "" }),
    false,
  );
  assert.equal(
    canComplete(missions[0], { ...completedProgress(), repository: "" }),
    true,
  );
});
test("latest checkpoint score controls completion and scoring is derived from answers", () => {
  const p = completedProgress();
  p.attempts.push({
    score: 60,
    date: "2026-10-02T01:00:00Z",
    answers: [2, 2, 2, 2, 2],
  });
  assert.equal(canComplete(missions[0], p), false);
  assert.equal(
    scoreQuiz(
      missions[0],
      missions[0].quiz.map((q) => q.answer),
    ),
    100,
  );
  assert.equal(scoreQuiz(missions[0], []), 0);
});
test("practice accepts harmless case/spacing variations but not unrelated answers", () => {
  assert.equal(
    practiceCorrect(missions[0], "  CD   .\\ai-learning-lab "),
    true,
  );
  assert.equal(practiceCorrect(missions[0], "delete all files"), false);
});
test("GitHub URL parsing rejects unsafe hosts and malformed repositories", () => {
  assert.deepEqual(parseGithubUrl("https://github.com/velu/lab.git"), {
    owner: "velu",
    repo: "lab",
  });
  for (const url of [
    "javascript:alert(1)",
    "http://github.com/velu/lab",
    "https://github.com.evil.test/velu/lab",
    "https://user:pass@github.com/velu/lab",
    "https://github.com/velu/.git",
    "https://github.com/velu/lab/tree/main",
    "https://github.com/velu/lab?url=http://localhost",
  ])
    assert.equal(parseGithubUrl(url), null, url);
});
test("backup restore recalculates score and completion instead of trusting forged fields", () => {
  const state = initialState();
  state.missions[missions[0].id] = {
    ...completedProgress(),
    completedAt: "2026-10-02T00:00:00Z",
  };
  state.missions[missions[0].id].attempts[0].answers = [2, 2, 2, 2, 2];
  const restored = restoreState(state);
  assert.equal(restored.missions[missions[0].id].attempts[0].score, 20);
  assert.equal(restored.missions[missions[0].id].completedAt, undefined);
});
test("malformed backups do not reach state and restored evidence needs rechecking", () => {
  assert.throws(() => restoreState(null));
  assert.throws(() => restoreState({ version: 99 }));
  const restored = restoreState({
    ...initialState(),
    evidence: [null, { url: "javascript:alert(1)" }],
    missions: { bad: null },
  });
  assert.deepEqual(restored.evidence, []);
  assert.deepEqual(restored.missions, {});
});
test("backup restore preserves legitimate completed mission notes", () => {
  const state = initialState();
  state.missions[missions[1].id] = {
    ...completedProgress(1),
    completedAt: "2026-10-02T00:00:00Z",
  };
  const restored = restoreState(JSON.parse(JSON.stringify(state)));
  assert.equal(
    restored.missions[missions[1].id].completedAt,
    "2026-10-02T00:00:00Z",
  );
  assert.equal(
    restored.missions[missions[1].id].buildNotes,
    state.missions[missions[1].id].buildNotes,
  );
});
test("external links and cached repository evidence are sanitized", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(
    safeExternalUrl("https://example.com/certificate"),
    "https://example.com/certificate",
  );
  assert.deepEqual(
    validatedEvidence([null, {}, { url: "javascript:alert(1)" }]),
    [],
  );
  const evidence = validatedEvidence([
    {
      url: "https://github.com/velu/lab",
      name: "velu/lab",
      description: "Test",
      readme: true,
      commit: "a".repeat(40),
      checkedAt: "2026-10-02T00:00:00Z",
      languages: ["Python", {}, 2],
      extra: "discard me",
    },
  ]);
  assert.deepEqual(evidence[0].languages, ["Python"]);
  assert.equal("extra" in evidence[0], false);
});
test("all missions have unique IDs, complete questions, and an accepted practice answer", () => {
  assert.equal(new Set(missions.map((m) => m.id)).size, missions.length);
  for (const m of missions) {
    assert.equal(m.quiz.length, 5);
    assert.ok(
      m.quiz.every(
        (q) =>
          q.answer >= 0 &&
          q.answer < q.options.length &&
          q.explanation.length > 0,
      ),
    );
    assert.ok(practiceCorrect(m, m.practice.answer[0]));
    assert.ok(m.tasks.length >= 3);
  }
});
