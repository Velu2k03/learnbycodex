# Production audit and upgrade — 2 October 2026

## Scope and observed baseline

User requested an audit of the existing app, fixes before visual effects, purposeful motion, accessibility, and improved learning interactions. Preserve the existing Next.js application and Git history. No new external service, database, OAuth, paid API, or DNS change without the user's decision.

Observed repository: `https://github.com/Velu2k03/learnbycodex`, branch `main`, baseline `2e9767b`. Existing uncommitted change: generated `next-env.d.ts` switches production route types to development route types. Preserve it as generated output.

The user confirmed the existing main-to-Vercel integration and production URL `https://learnbycodex.vercel.app`. Baseline homepage HTTP 200 was independently observed. Older notes claiming no deployment were corrected. No browser is connected; the user chose to connect one rather than install Playwright.

## Architecture

Next.js App Router, React, authored CSS, Motion, CodeMirror. Browser-local progress and per-mission code drafts. Python (Pyodide) and SQLite workers load pinned runtimes from CDNs; web previews use a sandboxed iframe. One server route reads public GitHub metadata. No database, authentication, server actions, or AI provider is configured. No required application environment secrets.

## Findings before fixes

### High

- H1: Worker GET guard ignores `Request.method`, allowing a POST/DELETE Request through while attaching an optional GitHub token. Actual code defect in `public/lab-runtime-worker.js`.
- H2: Malformed editor drafts are silently replaced with starter files. Save errors are swallowed while the UI says saved. Code drafts are omitted from progress backups.
- H3: Optional GitHub credentials share a JavaScript runtime with learner Python. A fake-token-only local proof demonstrated interception through a mutable JavaScript Headers method. The final implementation removes token entry and automatic Authorization completely. Public unauthenticated exercises remain.
- H4: Preview CSP insertion depended on a learner-authored head tag. Headless or early-script HTML could precede the policy. A trusted document shell now puts policy and console bridge first.

### Medium

- M1: Preview console output switches to Console, unmounting the iframe and resetting the learner's web app. Switching tabs also resets it.
- M2: Ctrl+Enter bypasses the disabled Run button and can start overlapping worker requests. Stale worker errors/timers and mode switches can overwrite output.
- M3: Drafts have no multi-tab conflict guard; fast navigation can cancel the delayed save.
- M4: Mobile navigation is visually offscreen but remains keyboard-focusable. No Escape/focus return behavior.
- M5: Workbench lesson text falls as low as 7–10px, and fixed grid minimums are unsafe around tablet widths. Several muted colors are too faint.
- M6: Dashboard takeaway always describes the first mission, regardless of progress. The path preview always shows the first three missions.
- M7: Resource records omit difficulty and estimated-time fields; no lint script exists.
- M8: README/checkpoint claims are stale or conflicting about the workbench, GitHub remote, deployment, and proposed Supabase.

### Learning gaps

- No dedicated "I'm stuck" help flow; existing hints are authored, not live AI.
- Independent challenges currently record self-reported notes, not executed test results.
- Roadmap is a list without clear current/next progression; planned lessons must remain labeled as unwritten.

## Upgrade checklist

- [x] Inspect repository, routes, state, workers, dependencies, config, and handoff docs.
- [x] Independent read-only logic/runtime and UX/accessibility reviews started.
- [x] Fix ordinary request guard and worker lifecycle; add regression tests; remove credential entry from learner runtime.
- [x] Protect editor drafts, show actual saving status, include drafts in backup/recovery.
- [x] Preserve preview state across console messages/tab switches (code; interactive verification pending).
- [x] Improve keyboard navigation, readable sizing/contrast, and responsive workbench layout (code; browser verification pending).
- [x] Add authored progressive stuck help without adding an unapproved AI service.
- [x] Add practical challenge feedback using the existing browser runtime.
- [x] Improve dashboard, roadmap, progress, success feedback, and reduced-motion behavior.
- [x] Add lint and run tests, typecheck, production build, and API checks.
- [ ] Browser QA at requested widths and learning flows (waiting for connected browser).
- [x] Inspect the supplied production URL (HTTP 200 baseline).
- [ ] Final QA report, small logical commits, and updated status/plan.

## Infrastructure decision

No additional service is required to fix the current app. Supabase is optional for future accounts and cross-device sync; not installed. Cloudflare is optional for DNS only; not modified. Live AI help would require a separate provider/configuration decision; authored help can improve the current product now without keys or costs.

## Validation on 2 October 2026

- `scripts/check.ps1`: ESLint clean; 27/27 regression tests; TypeScript and Next.js production build passed after removing token support.
- `npm audit --omit=dev`: zero vulnerabilities. Both project skills passed their validator.
- Real GitHub route smoke: unsafe URL 400; public Microsoft repository 200, README observed, commit prefix `25b7985`. Earlier attempt failed ECONNREFUSED because the old server was gone; the new production server started on 127.0.0.1:3000 and the rerun passed.
- Real runtime integration: actual pinned Pyodide and sql.js execute the worker source under Node. All three assessment starters fail; working solutions pass; Python input/retry/output cap and SQL rows/output cap/subsequent mutation/error recovery pass. This does not validate browser CSP enforcement, layout, or interaction.
- Two independent agents reviewed security/storage and UX/accessibility. The quota rollback fix was independently reproduced. No real credentials or outbound mutations were used in the token-isolation proof.
- TypeScript 7 lacks the legacy API needed by the installed ESLint parser. The project uses documented side-by-side aliases: native TypeScript 7 for `tsc`, TypeScript 6 API for ecosystem compatibility. See [Microsoft's migration guide](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).

Run optional runtime checks entirely on F: (these packages stay out of the application dependency tree):

```powershell
. .\scripts\env.ps1
npm.cmd install --prefix .local/runtime-check --no-audit --no-fund pyodide@0.27.7 sql.js@1.13.0
npx.cmd tsx scripts/smoke-runtimes.ts
npx.cmd tsx scripts/smoke-site.ts
node scripts/smoke-api.mjs
```

## Pending connected-browser QA

These checks have **not** been performed for the audit release:

- Desktop/tablet/mobile layout, including narrow 320px/390px widths and horizontal overflow.
- Keyboard-only mobile menu, Escape, focus trap/return, editor Tab exit, help dialog.
- All six steps of a mission; quiz failure/retry/success; evidence; reflection; completion.
- Actual browser Python/SQLite load, stop/retry, practical challenge feedback, and CDN/network failure display.
- HTML button interaction survives logs and Console/Preview switching.
- Immediate refresh preserves editor changes; corrupt saves are retained; two-tab conflicts pause saves.
- Backup export/import, quota failures, progress reload, reduced-motion preference, and error/loading states.

The user chose to connect a browser instead of installing Playwright. Browser inventory remains empty. Earlier milestone browser checks are historical evidence only. Do not call this release fully browser-tested.

## Remaining product boundaries

Six starter missions are authored; advanced roadmap levels remain unwritten. Hints are authored, progress is local, GitHub checks do not prove ownership, and provider certificates remain external. Browser code execution is a learning convenience: arbitrary Python can access its JavaScript realm, and inline web loops can freeze their browser context. Runtime credentials are not supported. Source-based responsive/accessibility fixes still need the browser checklist above.
