# Product decisions and user preferences

Last updated: 2026-10-02 (Asia/Manila).

## User-confirmed

- Product: DrVelu AI Engineering Lab, a personal hands-on learning school.
- Learner: Velu; beginner needing guidance from basics.
- Daily target: 60 minutes. Pauses and smaller sessions should be welcome.
- Priority roles: AI Engineer, AI Platform Engineer, AI Automation Engineer. Other roles are backups/knowledge exploration.
- Desired loop: learn → practice → build → test → GitHub → reflect → advance.
- Desired outcome: real projects, GitHub evidence, official credentials where useful, and a resume customized to actual work.
- Host on Vercel. Use Next.js/TypeScript. A future learn.drvelu.com subdomain must not replace the main domain.
- For future authenticated cross-device progress storage, prefer Supabase's free tier. Keep Vercel as the app host; Cloudflare domain/DNS access does not change that hosting choice.
- Strictly use F: for the project, tools, downloads, package cache, and temporary build files. Initial runtime files downloaded before this instruction were moved from C: to F:.
- Keep recoverable project skills, notes, plan, checklist, completed work, and next actions so another agent can resume after an interruption.

## Implementation choices for milestone 1

- First six levels have original interactive missions. Levels 6–18 remain explicitly planned.
- Progress is local to this browser, with backup/export and recovery. PostgreSQL/authentication will be a later milestone; do not imply cloud sync.
- Browser editor drafts are also local per mission. Python, SQLite, and web previews run in browser workers/frames; Git and PowerShell are guided simulations, not access to the user's computer.
- Guided hints are prewritten. No live AI model connection is configured.
- Public GitHub metadata checks are read-only and do not prove ownership, authorship, or project quality. OAuth and detailed review are later.
- Certification center links to provider courses/exams and records self-reported status. It does not issue or verify provider credentials.
- Project studio contains original briefs for Hybrid RAG, Agent Orchestration, and LLM Gateway.
- Career view must not invent experience. Any draft should be limited to reviewed evidence and clearly marked as a draft.
- Use Next.js and Vercel as explicitly requested. The Sites skill's different starter/hosting defaults do not override that request.
- Simple authored CSS and Motion support the interface; no generated artwork is needed for this technical workspace.

## Content decisions checked against official sources

- Microsoft beginner repositories and Panaversity: MIT-covered materials can be adapted with notices; no imports yet.
- Hugging Face agents repository: Apache-2.0; preserve applicable license, notice, and modification obligations for any future import.
- freeCodeCamp: software licensing does not establish curriculum mirroring rights; link out, no iframe/scrape.
- GitMastery: public integration needs permission under its custom license; link out.
- OpenAI Academy: official help says courses cannot currently be exported into an LMS. AI Foundations course badge and the three-course pathway certificate are different.
- Curated project lists do not license every linked tutorial.
- Collected third-party system prompts have uncertain provenance; optional external research only.
- Full source and license URLs are recorded in `src/data/resources.ts`.

## Outstanding external dependencies

- Vercel account authentication is not configured in this session. No deployment exists yet.
- GitHub remote/account selection is not configured. Do not create or push to a guessed account.
- No API provider secrets, database URL, or OAuth secrets have been supplied.
- No resume, employment history, or education details have been supplied.
