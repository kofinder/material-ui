# Deploy the Material Flow prototype to GitHub Pages

This package adds a static React build for GitHub Pages without changing the original server build.

## Before publishing

The app bundles `app/data/store.json`, including factory material records, receipt costs, and issue details. Standard GitHub Pages sites are public even when the repository is private. The demo role selector is not real authentication. Remove or replace confidential data before enabling automatic deployment unless your organization has explicitly configured and verified private Pages access.

GitHub reference: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Files included

- `.github/workflows/deploy-pages.yml`: Node 22, pnpm, static build, artifact upload, and deployment.
- `vite.pages.config.ts`: client-only build; no Cloudflare or server plugins.
- `pages/index.html` and `pages/main.tsx`: browser entry points reusing the existing React app.
- `package.json`: adds `build:pages` and `preview:pages`.
- `.gitignore`: excludes generated `dist-pages` output.

## GitHub setup

1. Extract this ZIP. Copy the CONTENTS of the material-flow folder into your repository root, preserving any unrelated files. Do not place package.json inside a second material-flow subfolder.
2. Include the `.github` folder. Replace or disable your old Pages deployment workflow so only one workflow publishes the site.
3. The workflow listens for pushes to `master`, matching the workflow you supplied. If the publishing branch is `main`, change `branches: ["master"]` to `branches: ["main"]`.
4. In the repository, open Settings > Pages. Under Build and deployment, select GitHub Actions as Source.
5. Commit and push the files. Open Actions > Deploy Material Flow to GitHub Pages to inspect the run. You can also run it manually using Run workflow after the workflow is on your default branch.
6. The successful deployment reports its actual URL. For the normal project-domain configuration, the expected URL is https://kofinder.github.io/material-ui/.

## Build locally

Requires Node 22.13 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm run build:pages
pnpm run preview:pages
```

The Pages artifact is `dist-pages`, not the original `dist`. Locally the default asset base is `/material-ui/`; visit the preview URL with `/material-ui/` appended. In GitHub Actions the base path comes from configure-pages metadata, so repository renaming and custom domains do not require hardcoding a path in the workflow.

No index-to-404 copy is needed: this app changes views in React state and has no nested browser routes.

The existing `pnpm build` remains a server build. Use `pnpm run build:pages` for GitHub Pages. GitHub Pages only hosts static output and cannot host a Kotlin backend.

## Validation

The static build was run successfully with the existing installed dependencies. Generated HTML referenced `/material-ui/` assets and each local asset reference was checked. The GitHub Actions workflow has not been executed in your repository; repository access, Pages settings, and a fresh dependency installation on a GitHub runner have not been verified.

References:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://vite.dev/guide/static-deploy.html#github-pages
