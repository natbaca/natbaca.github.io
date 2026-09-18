# natbaca.github.io

[![Deploy to GitHub Pages](https://github.com/natbaca/natbaca.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/natbaca/natbaca.github.io/actions/workflows/deploy.yml)

Personal site built with Astro.

## Overview

- Home page with an about section, links to profiles on other sites, Goodreads shelves in a sidebar, and the post feed alongside
- Posts sourced from Markdown in `src/content/blog/`, shown in full in the feed, 10 per page, and each on its own permalink
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

Add posts as Markdown files in `src/content/blog/`, with the frontmatter defined
by the schema in `src/content.config.ts`. Images belong in
`src/content/blog/images/` and are referenced relatively (`./images/name.jpg`) so
Astro optimizes them at build time.

Bio and profile links live in `src/components/About.astro` and
`src/components/SocialLinks.astro`. The book shelves are Goodreads widgets in
`src/components/GoodreadsWidget.astro`; the inline markup there is a static
fallback that Goodreads' own scripts replace at runtime.

## Deployment

Pushing to `main` triggers the GitHub Pages workflow in `.github/workflows/deploy.yml`.

## Dependency maintenance

Dependabot is the primary update path. It checks npm/pnpm dependencies (including
transitive packages) daily and GitHub Actions and devcontainers weekly. Routine
npm releases have a three-day cooldown; security updates are not delayed by it.
Patch and minor package updates are grouped to reduce PR noise.

Dependabot patch and minor PRs automatically squash-merge only after the required
build, dependency audit, links, accessibility, and CodeQL checks pass against an
up-to-date branch. GitHub Actions updates also auto-merge across major versions;
major application-library and devcontainer upgrades require manual review. TypeScript 7+ is excluded
until Astro supports its compiler API; revisit the linked tracking issue in
`.github/dependabot.yml` before removing that exception.

The auto-merge workflow only reads trusted Dependabot metadata; it never checks
out PR code. The repository must keep auto-merge enabled and both CI jobs required
in its main-branch ruleset. Pushes deploy the site; the existing daily deployment
also picks up automated merges if GitHub suppresses a bot-triggered push event.
Prefer fixing or rebasing Dependabot PRs over manual bulk dependency upgrades.
