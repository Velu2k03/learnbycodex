import { missions, roles } from "@/data/curriculum";
import { assessments } from "@/data/assessments";
import type { Evidence, LabState, Mission, MissionProgress } from "./types";
export const STORAGE_KEY = "drvelu-lab-v1";
export const emptyProgress = (): MissionProgress => ({
  learned: false,
  practicePassed: false,
  practiceAnswer: "",
  tasks: [],
  buildNotes: "",
  reflection: "",
  repository: "",
  attempts: [],
  step: 0,
  bossNotes: "",
});
export const initialState = (): LabState => ({
  version: 1,
  profile: {
    name: "Velu",
    dailyMinutes: 60,
    role: "AI Engineer",
    experience: "Beginner",
  },
  missions: {},
  certificates: {},
  evidence: [],
});
export const scoreQuiz = (mission: Mission, answers: number[]) =>
  Math.round(
    (mission.quiz.filter((q, i) => q.answer === answers[i]).length /
      mission.quiz.length) *
      100,
  );
export const normalizeAnswer = (answer: string) =>
  answer.trim().toLowerCase().replace(/\s+/g, " ");
export const practiceCorrect = (mission: Mission, answer: string) =>
  mission.practice.answer.some(
    (a) => normalizeAnswer(a) === normalizeAnswer(answer),
  );
export function requirements(mission: Mission, progress: MissionProgress) {
  return [
    { label: "Read the short lesson", done: progress.learned },
    { label: "Solve the practice exercise", done: progress.practicePassed },
    {
      label: "Finish every build task",
      done: mission.tasks.every((_, i) => progress.tasks.includes(i)),
    },
    {
      label: "Pass the checkpoint with 80%",
      done: (progress.attempts.at(-1)?.score ?? 0) >= 80,
    },
    {
      label: "Save actual build output (at least 40 characters)",
      done: progress.buildNotes.trim().length >= 40,
    },
    {
      label: "Explain what you learned (at least 30 characters)",
      done: progress.reflection.trim().length >= 30,
    },
    {
      label: "Record your independent challenge (at least 30 characters)",
      done: progress.bossNotes.trim().length >= 30,
    },
    ...(assessments[mission.id] &&
    !(progress.completedAt && progress.bossCode === undefined)
      ? [
          {
            label: "Pass the practical Python checks",
            done:
              !!progress.bossCode &&
              progress.bossChecks?.length ===
                assessments[mission.id].tests.length &&
              progress.bossChecks.every(
                (r, i) =>
                  r.passed && r.name === assessments[mission.id].tests[i].name,
              ),
          },
        ]
      : []),
    ...(mission.level > 0
      ? [
          {
            label: "Add your GitHub repository link",
            done: !!parseGithubUrl(progress.repository),
          },
        ]
      : []),
  ];
}
export const canComplete = (mission: Mission, progress: MissionProgress) =>
  requirements(mission, progress).every((r) => r.done);
export const currentMission = (state: LabState) =>
  missions.find((m) => !state.missions[m.id]?.completedAt) ??
  missions[missions.length - 1];
export function parseGithubUrl(
  value: string,
): { owner: string; repo: string } | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return null;
    const match = url.pathname.match(
      /^\/([a-zA-Z0-9-]{1,39})\/([a-zA-Z0-9_.-]{1,100})\/?$/,
    );
    if (!match || match[2] === "." || match[2] === "..") return null;
    const repo = match[2].replace(/\.git$/, "");
    if (!repo || repo === "." || repo === "..") return null;
    return { owner: match[1], repo };
  } catch {
    return null;
  }
}
export function validatedEvidence(raw: unknown): Evidence[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).flatMap((e) => {
    if (
      !e ||
      typeof e !== "object" ||
      typeof e.url !== "string" ||
      !parseGithubUrl(e.url) ||
      typeof e.name !== "string" ||
      typeof e.checkedAt !== "string" ||
      Number.isNaN(Date.parse(e.checkedAt)) ||
      typeof e.commit !== "string" ||
      !/^[0-9a-f]{40}$/.test(e.commit) ||
      typeof e.readme !== "boolean" ||
      !Array.isArray(e.languages)
    )
      return [];
    return [
      {
        url: e.url.slice(0, 300),
        name: e.name.slice(0, 150),
        description:
          typeof e.description === "string" ? e.description.slice(0, 500) : "",
        readme: e.readme,
        commit: e.commit,
        checkedAt: e.checkedAt,
        languages: e.languages
          .filter((s: unknown): s is string => typeof s === "string")
          .slice(0, 15)
          .map((s: string) => s.slice(0, 40)),
      },
    ];
  });
}
export function safeExternalUrl(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
// Backups are untrusted input. Keep only bounded, recognized fields.
export function restoreState(raw: unknown): LabState {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("version" in raw) ||
    raw.version !== 1
  )
    throw new Error("This is not a supported Lab backup.");
  const r = raw as Record<string, unknown>;
  const state = initialState();
  const str = (v: unknown, max = 10000) =>
    typeof v === "string" ? v.slice(0, max) : "";
  if (r.profile && typeof r.profile === "object") {
    const p = r.profile as Record<string, unknown>;
    state.profile = {
      name: str(p.name, 50) || "Velu",
      dailyMinutes: [30, 60, 90].includes(Number(p.dailyMinutes))
        ? Number(p.dailyMinutes)
        : 60,
      role: roles.includes(str(p.role)) ? str(p.role) : "AI Engineer",
      experience: "Beginner",
    };
  }
  if (r.missions && typeof r.missions === "object")
    for (const mission of missions) {
      const value = (r.missions as Record<string, unknown>)[mission.id];
      if (!value || typeof value !== "object") continue;
      const p = value as Record<string, unknown>;
      const progress = emptyProgress();
      progress.learned = p.learned === true;
      progress.practiceAnswer = str(p.practiceAnswer, 500);
      progress.practicePassed = practiceCorrect(
        mission,
        progress.practiceAnswer,
      );
      progress.tasks = Array.isArray(p.tasks)
        ? [
            ...new Set(
              p.tasks.filter(
                (n): n is number =>
                  Number.isInteger(n) && n >= 0 && n < mission.tasks.length,
              ),
            ),
          ]
        : [];
      progress.buildNotes = str(p.buildNotes);
      progress.reflection = str(p.reflection);
      progress.bossNotes = str(p.bossNotes);
      progress.repository = str(p.repository, 300);
      if (typeof p.bossCode === "string")
        progress.bossCode = str(p.bossCode, 110000);
      if (assessments[mission.id] && Array.isArray(p.bossChecks))
        progress.bossChecks = assessments[mission.id].tests.map((t, i) => ({
          name: t.name,
          passed:
            p.bossCode !== undefined &&
            (p.bossChecks as Record<string, unknown>[])[i]?.name === t.name &&
            (p.bossChecks as Record<string, unknown>[])[i]?.passed === true,
        }));
      // Preserve pre-assessment achievements when upgrading an existing local save.
      if (
        p.bossCode === undefined &&
        typeof p.completedAt === "string" &&
        !Number.isNaN(Date.parse(p.completedAt))
      )
        progress.completedAt = p.completedAt;
      progress.step = Number.isInteger(p.step)
        ? Math.max(0, Math.min(5, Number(p.step)))
        : 0;
      if (Array.isArray(p.attempts))
        progress.attempts = p.attempts.slice(-50).flatMap((a) => {
          if (
            !a ||
            !Array.isArray(a.answers) ||
            a.answers.length !== mission.quiz.length ||
            !a.answers.every(
              (n: unknown, i: number) =>
                typeof n === "number" &&
                Number.isInteger(n) &&
                n >= 0 &&
                n < mission.quiz[i].options.length,
            )
          )
            return [];
          return [
            {
              score: scoreQuiz(mission, a.answers),
              date: str(a.date, 50),
              answers: a.answers,
            },
          ];
        });
      if (
        typeof p.completedAt === "string" &&
        !Number.isNaN(Date.parse(p.completedAt)) &&
        canComplete(mission, progress)
      )
        progress.completedAt = p.completedAt;
      else delete progress.completedAt;
      state.missions[mission.id] = progress;
    }
  if (r.certificates && typeof r.certificates === "object")
    for (const [id, value] of Object.entries(r.certificates).slice(0, 30)) {
      if (!/^[a-z-]{1,40}$/.test(id) || !value || typeof value !== "object")
        continue;
      const c = value as Record<string, unknown>;
      state.certificates[id] = {
        status: ["Not started", "In progress", "Completed"].includes(
          str(c.status),
        )
          ? str(c.status)
          : "Not started",
        url: safeExternalUrl(str(c.url, 500)) ?? "",
      };
    }
  // Imported evidence must be checked again against GitHub before reuse.
  state.evidence = [];
  return state;
}
