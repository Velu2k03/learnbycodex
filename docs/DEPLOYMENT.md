# Existing GitHub to Vercel deployment

The user confirmed that pushes to `main` deploy automatically to the connected Vercel project.

- Git remote: `https://github.com/Velu2k03/learnbycodex.git`
- Production: `https://learnbycodex.vercel.app`
- Baseline supplied by the user: `2e9767b`, deployment `learnbycodex-ge1sg44ew-velus-projects-27f81f38.vercel.app`, Ready.
- Homepage HTTP 200 independently observed on 2 October 2026. See STATUS.md for the latest release verification.

## Release procedure

1. Source `scripts/env.ps1` to keep tooling/cache/temp on F:.
2. Run `scripts/check.ps1` and relevant runtime/API checks. Record browser QA separately; a build is not interaction testing.
3. Inspect `git status`, remote URL, and current remote `main`. Preserve other changes and history. Never force push.
4. Commit reviewed changes, integrate into main, then push `origin main`.
5. Verify GitHub received the commit and Vercel serves new artifacts. Inspect public GitHub deployment status when available. Record failures or pending deployment explicitly.

No separate Vercel login, new project, paid integration, database, or DNS change is needed for this workflow. The existing `scripts/vercel.ps1` is only for future CLI work; it stores configuration on F: and is not the normal release path.

Keep `.local`, `.next`, `node_modules`, `.env`, and authentication files out of Git. Current application features require no server secrets. Do not change the main `drvelu.com` site. A future `learn.drvelu.com` subdomain is a separate task.

Progress and code drafts remain browser-local. Deployment does not upload learner notes, create accounts, or provide cross-device sync. Export backups regularly, with F: selected as the browser download destination.
