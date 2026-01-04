# natbaca.github.io

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
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Content

Add posts as Markdown files in `src/content/blog/` with the required frontmatter defined in `src/content.config.ts`.

## Deployment

Pushing to `main` triggers the GitHub Pages workflow in `.github/workflows/deploy.yml`.
