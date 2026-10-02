# Current checkpoint — read this first

Updated: 2026-10-02 (Asia/Manila). Status: **browser workbench implemented and validated for Python, SQLite, and public GitHub reads; not deployed**.

## Where we are

Workspace: `F:\Codes\Learn`. Next.js source is in `src/`. The in-browser mission workbench includes a CodeMirror editor, console, HTML preview, Python/SQLite runtimes, local drafts, and beginner guidance. Vercel deployment remains pending authentication.

## Completed implementation

- Dashboard, sidebar, app shell, responsive styles, reduced-motion CSS.
- Six original mission definitions with explanations, code, hints, debug tasks, builds, quizzes, evidence requirements, and reflection.
- Mission UI, local progress/completion logic, quiz attempt recording.
- In-browser CodeMirror workspace with HTML/CSS/JavaScript, Python, SQLite SQL, JSON, Markdown, and a clearly simulated PowerShell/Git terminal.
- Browser Python and SQLite workers, sandboxed HTML preview, per-mission local editor drafts, Python input support, glossary, responsive animated UI, and a 45-second runtime stop.
- Optional GitHub token field is memory-only; public API calls work without one and browser policy restricts requests to GitHub GET endpoints and runtime CDNs.
- Nineteen-level roadmap (six ready; remaining levels explicitly planned).
- Resource library with source/license information; certification center with six requested providers.
- Three detailed original capstone briefs.
- Backup parser and safe GitHub URL/evidence helpers.
- Corrupt-data/multi-tab write guard added following an independent read-only review.
- Two repository-local skills and persistent plan/decisions/checkpoint files.
- Preferences, validated backup import/export, raw-data recovery download.
- Public GitHub endpoint, portfolio metadata observations, career tracks, and a conservative project-evidence draft.
- README, F:-only environment/dev/check scripts, 17 logic/integration-unit tests, and skill validator.
- Dependencies pinned to installed versions; package-lock synchronized.

## Last observed checks

- npm installation: passed; 36 packages added; audit reported zero vulnerabilities at install time.
- Node runtime: v24.21.0, checksum verified against official Node SHASUMS before extraction.
- Runtime and original download moved to `.local/` on F: after user requested F:-only storage.
- Development server session 29186 printed local URL `http://127.0.0.1:3000` and compiled dashboard.
- HTTP GET `/`, `/roadmap`, `/resources`, `/projects`, `/certifications`, `/settings`, `/portfolio`, `/career`, and all six `/mission/...` pages: 200.
- Browser checks: Python input `85` returned 3 blocks and 10 minutes left; SQLite starter query returned its two rows; public GitHub example fetched repository name and description.
- Browser responsive check: no horizontal overflow at 1440px, 656px, or 390px. The runtime worker returned the configured CSP header.
- HTML preview rendered. Script interaction inside the isolated iframe could not be verified in the integrated browser tool; do not count that interaction as validated.
- `npm test`: 17/17 passed. Tests cover completion, score derivation, malformed backups, evidence sanitization, URL validation, and mocked GitHub success/failure paths.
- `npm run typecheck`: passed.
- `node scripts/validate-skills.mjs`: both project skills passed frontmatter and reference checks. The bundled Python skill validator was not run; a project-local Node check and independent behavioral forward-test were used.
- Independent resumption test correctly recovered constraints, completed/unverified work, and next tasks from the skill and notes.
- `npm run typecheck`: passed after browser workbench changes.
- `npm test`: 17/17 passed after browser workbench changes.
- `npm update --save`: completed; packages were already current within declared ranges.
- `npm outdated --long`: no outdated packages reported. `npm audit --omit=dev`: zero vulnerabilities.
- `npm run build`: passed after workbench, CSP, and curriculum updates.
- Independent review prompted fixes for corrupt-save overwrite, unsafe evidence hydration, empty GitHub repo normalization, and multi-tab overwrite. Helpers have test coverage; browser storage event behavior still needs browser-level testing.

## Next exact actions

1. Browser workbench commit `cc1748b` is pushed to `origin/main`.
2. Finish F:-only Vercel deployment instructions/script using the installed CLI at `.local/vercel-tool` and an F: global config directory.
3. Configure Supabase only after a project and authentication settings are available; never place keys in source or checkpoints.
4. If Vercel authentication is available, deploy validated source and record the returned deployment URL and status. Do not claim publication before that.

## Important unresolved details

- Provider hints are authored, not AI-generated. No live tutor/API keys are configured.
- Progress is browser-local, not PostgreSQL/cloud-backed.
- Browser code runners currently cover Python, SQLite, and web preview. The OS terminal is simulated; other native runtimes and Supabase sync are not implemented.
- URLs alone do not verify learning or repository ownership.
- Planned levels are not full courses; do not imply all requested third-party content has been imported.
- No Vercel credentials/CLI auth were found before the F:-only constraint. Do not inspect or write C: again for deployment; use F: CLI config if needed.
- Next.js generated AGENTS.md/CLAUDE.md. AGENTS.md now includes user constraints and must be preserved.
- Installed framework docs use `.md`, not `.mdx`.
- The installed Lucide release has no `Github` export; use `GitFork` or a separately supported brand icon.

## Resume discipline

Treat this file as a checkpoint, not a guarantee. Verify the working tree and last command results. Update the checklist only after the corresponding work exists, and keep test outcomes separate from implementation status. Never store credentials in these notes.
