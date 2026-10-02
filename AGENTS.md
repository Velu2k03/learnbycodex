# DrVelu AI Engineering Lab — start here

Read `docs/STATUS.md` before doing work. Read `docs/PLAN.md` for the checklist and
`docs/DECISIONS.md` for user constraints. Inspect the files and verify state; notes
are a handoff, not proof that a feature works. Preserve unrelated user edits.

## Project skills

- `.agents/skills/drvelu-build/SKILL.md`: development, validation, deployment, and resuming interrupted work.
- `.agents/skills/drvelu-curriculum/SKILL.md`: original lessons, assessment, resource licensing, and evidence-grounded career content.

Use the relevant skill. These are project-local and must remain on F:.

## Non-negotiable user constraints

- All project files, new tools, downloads, package caches, and temporary build files belong on F:.
- Workspace: `F:\Codes\Learn`. Use `scripts/dev.ps1`, `scripts/check.ps1`, or source `scripts/env.ps1` for the F: runtime/cache/temp setup.
- Velu is a beginner, with 60 minutes/day. Primary direction: AI Engineer, AI Platform Engineer, AI Automation Engineer. Other roles are exploratory backups.
- User chose Next.js and Vercel; do not replace this with another hosting platform. Target subdomain can be `learn.drvelu.com`; never replace the main domain.
- Keep the daily experience to one mission. Teach through practice and building.
- Do not copy third-party courses without checked rights. Keep source, license, and verification records.
- No invented expertise, employment, metrics, certifications, GitHub ownership, or verification claims.
- Update `docs/STATUS.md` and `docs/PLAN.md` after a meaningful completed unit, before a handoff, and after validation. Record failures and limitations, not just successes.
- Never write secrets to notes, source, logs, or Git. A deployment needs the user's Vercel account authentication; absence of credentials is a blocker, not authorization to guess an account.

## Recovery after interruption

1. Read status, plan, decisions, and the appropriate project skill.
2. Inspect `git status` if a repository exists and verify the referenced files.
3. Check only the known local URL/retained process; do not start duplicate servers or guess a deployment exists.
4. Pick the first incomplete, unblocked task. Validate it, then update the checkpoint.
5. Report exactly what is working and what remains. A passing build is not proof of browser interaction or deployment.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
