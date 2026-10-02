export type Question = { prompt: string; options: string[]; answer: number; explanation: string };
export type Mission = {
  id: string; level: number; title: string; subtitle: string; skill: string; minutes: number;
  objectives: string[]; lesson: { title: string; body: string }[]; code: string; language: string;
  practice: { prompt: string; answer: string[]; explanation: string; hints: string[] };
  debug: { code: string; question: string; explanation: string };
  tasks: string[]; quiz: Question[]; boss: string; reflection: string; resources: string[];
};
export type Attempt = { score: number; date: string; answers: number[] };
export type MissionProgress = {
  learned: boolean; practicePassed: boolean; practiceAnswer: string; tasks: number[];
  buildNotes: string; reflection: string; repository: string; attempts: Attempt[];
  completedAt?: string; step: number; bossNotes: string;
};
export type Profile = { name: string; dailyMinutes: number; role: string; experience: string };
export type Evidence = { url: string; name: string; description: string; readme: boolean; commit: string; checkedAt: string; languages: string[] };
export type LabState = { version: 1; profile: Profile; missions: Record<string, MissionProgress>; certificates: Record<string, { status: string; url: string }>; evidence: Evidence[] };
