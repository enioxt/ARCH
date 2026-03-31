# PREFERENCES.md — EGOS Arch

> **VERSION:** 1.0.0 | **CREATED:** 2026-03-30

---

## Project Identity

| Property | Value |
|----------|-------|
| **Project** | EGOS Arch |
| **Description** | AI-assisted architectural design tool |
| **Stack** | React 19, TypeScript, Vite 6, Express, Tailwind CSS 4, Zustand |
| **Deploy** | Docker on Hetzner VPS (port 3098), Caddy reverse proxy at arch.egos.ia.br |
| **AI** | OpenRouter (Gemini 2.0 Flash), planned Gemini Vision + Trimesh |
| **Classification** | product (MVP stage) |

---

## Coding Standards

- TypeScript strict mode
- Functional React components (no class components)
- Zustand for state management
- Tailwind CSS for styling (utility-first)
- ESLint + Prettier formatting
- Conventional commits

---

## Governance

- Inherits shared preferences from `~/.egos/guarani/PREFERENCES_SHARED.md`
- Local overrides in this file take precedence
