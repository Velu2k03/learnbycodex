# Current checkpoint — read this first

Updated: 2026-10-02 (Asia/Manila). Status: **production audit fixes implemented; final validation/release in progress; connected-browser QA pending**.

## Workspace and deployment

- Workspace: `F:\Codes\Learn`. All new tooling, dependencies, caches, downloads, and temp artifacts stay on F:.
- Repository: `https://github.com/Velu2k03/learnbycodex.git`.
- Audit branch: `audit/production-ux-2026-10-02`, based on `2e9767b`. Check actual Git state before resuming.
- Existing production: `https://learnbycodex.vercel.app`. Homepage returned HTTP 200 on 2 October 2026. User confirmed main pushes automatically deploy through the existing Vercel integration. Separate Vercel CLI login is unnecessary for this path.
- Earlier notes claiming no deployment or no remote were stale and have been corrected.

## Implemented

- Existing six original missions, nineteen-level roadmap, resources, credentials tracker, capstone briefs, GitHub metadata checks, and honest career evidence draft remain.
- Browser workbench: CodeMirror, Python, SQLite, HTML/JavaScript preview, JSON, Markdown, and explicitly simulated Git/PowerShell.
- Runtime fixes: validate effective Request method; retry failed initialization; reject overlapping runs; Stop control; bounded output; retain preview across Console switches/logs; trusted preview CSP prefix.
- Optional GitHub token entry removed. Independent review demonstrated that learner code can read a token sharing its runtime. Browser exercises now use unauthenticated public requests. The JavaScript helper is not a security boundary against adversarial learner code.
- Editor drafts: preserve corrupt originals, report save failures, pause after cross-tab changes, guard pending debounce, flush on navigation/page hide, include drafts and damaged raw records in exports.
- Backup restore reverses successful writes if storage quota fails. Independent quota reproduction verified originals survive.
- Mobile navigation focus/inert/Escape behavior, all links close the menu, editor textbox label and Tab escape, readable text/contrast, responsive CSS, reduced-motion support.
- Dashboard follows current mission and daily target; roadmap distinguishes ready work from unwritten levels; resources include honest difficulty/time/reuse metadata.
- Progressive authored stuck-help dialog, three executed Python challenges, prerequisite explanation, accessible pass/fail feedback, and optional extension briefs.
- Existing completed missions are preserved when upgrading older saves. New Python completions require their practical checks.
- Lint tooling, regression tests, runtime smoke script, loading/error states, and persistent audit report.

## Validation evidence

- `scripts/check.ps1`: lint, 27 tests, TypeScript, and production build passed after final removal of token entry.
- `scripts/smoke-runtimes.ts`: actual pinned Pyodide 0.27.7 and sql.js 1.13.0, running the worker source under Node. All three starters fail checks and valid solutions pass. Python input, failed-start retry, output cap, SQL rows/cap/subsequent mutation/error recovery passed. This is runtime integration testing, not browser testing.
- `npm audit --omit=dev`: zero vulnerabilities.
- `node scripts/validate-skills.mjs`: both project skills passed.
- Independent agents reviewed logic/security and UX/accessibility. Their concrete findings were addressed; no browser claims were inferred from source review.
- Local API smoke initially failed with ECONNREFUSED because the earlier server was gone. Production server started at `http://127.0.0.1:3000` (retained session 1179); rerun passed: invalid URL 400, public Microsoft repository 200, README true, commit prefix `25b7985`.
- All fourteen implemented pages returned HTTP 200. Missing missions use Next.js documented streaming behavior: HTTP 200 can accompany the not-found UI and noindex metadata. The smoke script checks those markers rather than incorrectly requiring 404 for streamed responses.
- Browser inventory: no browser connected. User chose to connect one rather than install Playwright. Current visual, keyboard, refresh, multi-tab, and interactive preview checks remain unverified. Earlier milestone browser observations do not validate this release.

## Next exact actions

1. Final app checks and runtime smoke passed after token removal. Collect the full site smoke result including exact worker/policy artifacts and CSP.
2. Existing production server is at `http://127.0.0.1:3000`; check it before starting another.
3. If browser is connected, run the pending browser checklist in PRODUCTION-AUDIT.md. Otherwise report that limitation explicitly; do not invent screenshots or checks.
4. Inspect diff/secrets/history, make logical commits, fast-forward main, push existing origin, and verify both GitHub and new Vercel artifacts.
5. Update this checkpoint and the audit report with actual commit/deployment evidence.

## Boundaries and recovery

- Authored guidance is not a live AI tutor. Progress/drafts are browser-local; no database/auth/cloud sync.
- Browser runtimes are practice tools, not proctored or hardened server assessment. A web infinite loop can freeze its browser context. Worker code can access JavaScript; never inject application secrets.
- Public GitHub checks observe metadata, not ownership/authorship or skill. Shared API rate limits can apply.
- Six levels have real starter missions; advanced curriculum is planned. Third-party courses remain linked unless reuse rights and notices are checked.
- No personal employment/education/resume history has been supplied. Do not fabricate it.
- Supabase, OAuth, live AI, custom-domain DNS, and paid services are separate future decisions.
- Source `scripts/env.ps1` for F: Node/cache/temp. Verify retained processes and Git state; do not start duplicate servers or trust notes as proof.
