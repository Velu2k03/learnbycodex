# Vercel deployment

No deployment has been made yet. This page is a procedure, not deployment evidence. Consult STATUS.md for the latest observed result.

The user requested Vercel and eventually `learn.drvelu.com`. Do not modify the main drvelu.com site or its DNS. First deploy to Vercel's generated URL and verify it.

## Authenticate on F:

In PowerShell, from `F:\Codes\Learn`:

```powershell
.\scripts\vercel.ps1 -Action login
```

Complete the official Vercel sign-in in your browser. Do not paste passwords or API tokens into chat or source files. The script uses `.local/vercel-config` for CLI authentication and configuration, and F: for its cache/temp. That directory is ignored by Git and Vercel uploads.

Verify which account is connected:

```powershell
.\scripts\vercel.ps1 -Action whoami
```

Choose the correct personal account/team and a new project called `drvelu-ai-engineering-lab`. Do not link to an unrelated existing site. If multiple teams are available and the intended one is unclear, ask the user which one to use.

## Validate and deploy

```powershell
.\scripts\check.ps1
.\scripts\vercel.ps1 -Action deploy
```

Use the root directory and Next.js framework defaults. Keep `.local`, `node_modules`, `.next`, `.env` files, and auth artifacts out of uploads. `.vercelignore` excludes local tools/cache. No API secrets or database variables are required for milestone 1.

The current script creates a preview deployment. After it returns the actual URL:

```powershell
.\scripts\vercel.ps1 -Action inspect -DeploymentUrl 'https://ACTUAL-RETURNED-URL.vercel.app'
```

Replace the placeholder with the returned URL. Confirm Ready/success and check the deployed page. Record the project, deployment URL, validation, and access/protection state in STATUS.md. Production promotion/custom domain is a subsequent explicit step; never claim deployment simply because the local build passed.

## Important boundaries

- Browser-local progress remains local after deployment. It is not PostgreSQL or cloud sync.
- Public GitHub checks are unauthenticated and can hit GitHub's shared rate limit on Vercel. The UI should report this rather than fabricate missing evidence.
- This release contains authored hints, not a live AI tutor.
- This release contains no personal resume history or private learner notes in source.
- [Vercel login documentation](https://vercel.com/docs/cli/login) and [global options](https://vercel.com/docs/cli/global-options) explain the official login and config-directory controls.
