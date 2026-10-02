---
name: drvelu-build
description: Build, validate, deploy, or resume the DrVelu AI Engineering Lab in this repository, preserving its learning flow, F-drive storage, and evidence-based handoff. Use for this project, not unrelated websites.
---

# DrVelu build and resume

Read `docs/STATUS.md`, `docs/PLAN.md`, and `docs/DECISIONS.md` from the repository root before choosing work. Confirm important claims against actual files, command results, and deployment state. If notes and code disagree, record the discrepancy and resolve it before announcing completion.

## Working environment

All new project artifacts, dependencies, runtime downloads, caches, and temporary files must stay on F:. Source `scripts/env.ps1` for the portable Node runtime and F: npm cache/TEMP/TMP. Do not change HOME or CODEX_HOME or install global tools on C:. Never recursively delete a computed Windows path without resolving and checking its boundary first.

Use the existing Next.js app and lockfile. Read the relevant installed Next.js guide under `node_modules/next/dist/docs` when editing framework behavior. Do not switch to Cloudflare/Sites hosting: the user explicitly chose Vercel. Keep the main drvelu.com site unchanged.

## Product boundaries

The initial deliverable is a working learning milestone, not a claim that the full school exists. Original starter missions must remain usable without API keys. Mark planned curriculum, guided authored hints, local progress, provider exams, and public repository checks accurately. Live AI tutoring, OAuth, durable database sync, and deep project evaluation need separate implementation and configuration.

Maintain readable responsive interfaces, keyboard controls, reduced-motion support, and one next action. Keep content, progress rules, UI, and integrations in separate modules.

## Validation and checkpoints

For meaningful logic changes, test completion rules, malformed backup handling, safe links, and evidence boundaries. Run `scripts/check.ps1` before calling a release ready. HTTP response checks do not substitute for browser interaction tests. Only claim checks actually run, with date, command, and result in `docs/STATUS.md`.

Preserve unreadable saved progress before recovery; never overwrite it with a fresh state. Prevent stale browser tabs from replacing newer progress. API integrations must constrain outbound destinations, handle network/rate-limit failures, and avoid exposing credentials.

At each meaningful milestone update the plan checkboxes and the current status: completed work, last verified checks, known failures, blockers, and the next exact action. Keep durable notes free of secrets and ephemeral claims presented as facts.

Deploy only the validated source to the user's authenticated Vercel account. Record the returned deployment URL and terminal deployment result. If authentication is absent, finish the build and provide a concrete authentication handoff; never report the site as published.
