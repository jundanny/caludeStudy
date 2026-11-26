# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A dependency-free TODO web app (vanilla HTML/CSS/JS) in the `todo/` folder. There is no build step, package manager, linter, or test suite — open `todo/index.html` directly in a browser to run it (e.g. `Start-Process todo\index.html`).

## Architecture (`todo/`)

- `index.html` — static markup; all interactive elements are looked up by `id` / `data-filter` in `app.js`.
- `app.js` — a single IIFE holding the state (`todos` array + current `filter`). Every state change goes through `update(mutator)`, which mutates, persists to `localStorage` (key `todo-app.items`), and re-renders the whole list via `render()`. List item events are handled by delegation on `#todo-list`, so items carry their id in `li.dataset.id`. Inline editing (double-click) swaps the `.title` span for an `.edit` input; an empty edit deletes the item. A `storage` listener syncs changes across browser tabs.
- `style.css` — colors are CSS variables on `:root`, overridden for dark mode via `prefers-color-scheme`.

## Repository

- Remote: public GitHub repository `jundanny/caludeStudy` (`origin`, default branch `main`).
- Deployed with GitHub Pages from the `main` branch root (no build; `.nojekyll` disables Jekyll). Pushing to `main` redeploys. The root `index.html` only redirects to `todo/`; the app lives at https://jundanny.github.io/caludeStudy/todo/.
- Environment: Windows, PowerShell 5.1. GitHub CLI is installed at `C:\Program Files\GitHub CLI\gh.exe` and authenticated.
