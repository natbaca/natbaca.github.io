# natbaca.github.io

[![Deploy to GitHub Pages](https://github.com/natbaca/natbaca.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/natbaca/natbaca.github.io/actions/workflows/deploy.yml)

Personal site and blog built with Astro.

## Overview

- Home page with an about section and recent writing
- Blog content sourced from `src/content/blog/`
- Deployed to GitHub Pages via Actions

## Tech stack

- Astro
- GitHub Pages

## Development

```sh
pnpm install
pnpm run dev
```

Open `http://localhost:4321` in your browser.

## Content

Add posts as Markdown files in `src/content/blog/` with the required frontmatter defined in `src/content/config.ts`.

## Deployment

Pushing to `main` triggers the GitHub Pages workflow in `.github/workflows/deploy.yml`.

## Dependency maintenance

Dependabot is the primary update path. It checks npm/pnpm dependencies (including
transitive packages) daily and GitHub Actions and devcontainers weekly. Routine
npm releases have a three-day cooldown; security updates are not delayed by it.
Patch and minor package updates are grouped to reduce PR noise.

Dependabot patch and minor PRs automatically squash-merge only after the required
build, dependency audit, links, accessibility, and CodeQL checks pass against an
up-to-date branch. Major upgrades require manual review. TypeScript 7+ is excluded
until Astro supports its compiler API; revisit the linked tracking issue in
`.github/dependabot.yml` before removing that exception.

The auto-merge workflow only reads trusted Dependabot metadata; it never checks
out PR code. The repository must keep auto-merge enabled and both CI jobs required
in its main-branch ruleset. Pushes deploy the site; the existing hourly deployment
also picks up automated merges if GitHub suppresses a bot-triggered push event.
Prefer fixing or rebasing Dependabot PRs over manual bulk dependency upgrades.
