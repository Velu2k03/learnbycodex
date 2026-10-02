# DrVelu AI Engineering Lab

A personal, hands-on learning workspace for Velu: a beginner with 60 minutes per day, working toward AI engineering, AI platform engineering, and AI automation.

## Start locally (Windows, F:)

Open `F:\Codes\Learn` in VS Code and run in PowerShell:

```powershell
.\scripts\dev.ps1
```

Open **http://127.0.0.1:3000**. Start the first mission on your workspace.

The development scripts use the portable Node runtime in `.local/`, with npm cache and temporary files on F:. Nothing in `.local/` is committed. On a new machine, install an official Node 24 LTS runtime on F: and update `scripts/env.ps1` to its directory, then run `npm ci` with that environment. Never install project tooling globally on C:.

## Included in milestone 1

- Personal dashboard with one next mission and a gentle daily target.
- Six original missions: developer environment, Git/GitHub, Python, problem solving, web fundamentals, and HTTP/APIs.
- Short lessons, practice/hints, debugging, build checklists, five-question checkpoints, evidence notes, and reflection.
- In-browser CodeMirror editor, Python and SQLite workers, HTML/JavaScript preview, and a clearly simulated Git/PowerShell terminal.
- Progressive stuck help and executed Python challenges with individual test feedback. These are local practice checks, not proctored credentials.
- Nineteen-level roadmap; advanced levels are explicitly planned, not completed courses.
- Browser-local progress with validated backups. Readable/invalid saves are treated separately; bad data is preserved for recovery. Multiple-tab updates pause saving to avoid stale overwrites.
- Public GitHub repository metadata checks with fixed-host requests and timeouts. No OAuth or ownership verification.
- Source/license-aware resource library and six official credential trackers.
- Three original capstone briefs and career-track exploration.
- A project-evidence draft with explicit review requirements, not fabricated resume achievements.

## Not yet implemented

PostgreSQL/authentication/cloud sync, live AI tutoring, GitHub OAuth, server-isolated code execution, deep repository/project evaluation, full advanced courses, credential verification, and a complete customized resume engine. Browser runners are for practice, not a hardened server assessment system. No third-party course has been imported; original teaching lives in the site, with licensed-source records and external links.

## Validation

```powershell
.\scripts\check.ps1
. .\scripts\env.ps1
node .\scripts\validate-skills.mjs
```

Checks include ESLint, regression tests, TypeScript, and a production build. Tests cover completion gates, score recalculation, backup rollback, draft validation, preview policy ordering, request restrictions, evidence sanitization, and GitHub success/failure paths. See `docs/PRODUCTION-AUDIT.md` for optional real runtime smoke tests and `docs/STATUS.md` for checks actually run. A production build does not prove browser interaction correctness.

## Deployment

The existing GitHub remote deploys `main` automatically to [learnbycodex.vercel.app](https://learnbycodex.vercel.app). `vercel.json` sets the Next.js framework. No secret is required for the current milestone. Follow `docs/DEPLOYMENT.md`; do not create another Vercel project. Never commit `.local`, `.next`, `node_modules`, `.env` files, or CLI auth files.

Personal progress stays in your browser even when the app is hosted. The app code may be public, but no learner notes are seeded or uploaded by deployment. Export backups and choose F: as your browser download destination. Hosting does not provide cloud sync.

## Resume an interrupted agent session

Read **AGENTS.md → docs/STATUS.md → docs/PLAN.md → docs/DECISIONS.md**. Then use the relevant project skill under `.agents/skills/`:

- `drvelu-build`: implementation, validation, safe restart, and deployment.
- `drvelu-curriculum`: hands-on lessons, source rights, assessments, and honest evidence.

For another VS Code agent, ask it to read these files before making changes. Verify observed state and update the checkpoint after a meaningful unit; do not treat unchecked plans as finished work.

## Architecture

`src/app` contains routes and the GitHub endpoint; `src/components` contains the app shell and learning interaction components; `src/data` contains original curriculum, resources, credentials, and project briefs; `src/lib` contains progress, validation, and integration logic. Public GitHub calls do not use an API token. Provider certification requirements are editorial records with official source URLs and review dates, not live guarantees.
