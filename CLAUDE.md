# EGOS-KERNEL-PROPAGATED: 2026-04-15
<!-- AUTO-INJECTED by disseminate-propagator.ts — DO NOT EDIT THIS BLOCK MANUALLY -->
<!-- Kernel commit: 818a9eb | 3 rule section(s) changed -->
<!-- Kernel rules: ~/.claude/CLAUDE.md (always authoritative) -->
<!-- Re-run: bun ~/egos/scripts/disseminate-propagator.ts --all to update -->
<!-- + .windsurfrules (2 lines) -->
<!-- + .windsurfrules → ### Replace-not-Add Rule (MANDATORY) (9 lines) -->
<!-- + .windsurfrules → ### Pre-commit Enforcement (1 lines) -->

> **EGOS Kernel rules apply to this repo.** See `~/.claude/CLAUDE.md` for full rules.
> Critical non-negotiables: no force-push main, no secret logging, no git add -A in agents.
> SSOT map: `~/.claude/egos-rules/ssot-map.md` | LLM routing: `~/.claude/egos-rules/llm-routing.md`

---

# EGOS Arch — Claude Code Context

> **Project:** EGOS Arch — AI-assisted architectural design tool
> **Stack:** React 19, TypeScript, Vite 6, Express, Tailwind CSS 4, Zustand
> **Deploy:** Docker on Hetzner VPS (port 3098), Caddy at arch.egos.ia.br

---

## Rule: Next Task

When started in this repo and asked **"what's next?"** or **"qual a proxima task?"**:

1. Read this CLAUDE.md for context
2. Read `TASKS.md` and identify the highest-priority incomplete P0/P1 task
3. Read open PRs: `gh pr list`
4. Respond with: task ID, description, files involved, and next concrete step

**No friction. Straight to the point.**

---

## Project Description

EGOS Arch is an AI-assisted architectural design tool. Users describe building projects via a chat interface, and the architect-agent (powered by Gemini 2.0 Flash via OpenRouter) interprets briefings to generate design recommendations. A planned vision-pipeline will enable sketch-to-geometry extraction using Gemini Vision and Trimesh.

---

## Architecture Overview

- **server.ts** — Unified Express + Vite dev server (single process for API + frontend)
- **9 views** — React components for different design workflow stages
- **Zustand store** — Client-side state management
- **architect-agent** (`src/ai/prompts/architect-agent.ts`) — AI chat agent for briefing interpretation
- **vision-pipeline** (`src/orchestrator/pipeline.ts`) — Planned sketch-to-geometry extraction

---

## Key Commands

```bash
npm run dev         # Start dev server (Express + Vite HMR)
npm run build       # Production build
```

---

## Deploy Instructions

```bash
# On Hetzner VPS (204.168.217.125)
cd /home/enio/arch
docker compose up -d --build

# Caddy reverse proxy serves at arch.egos.ia.br (port 3098)
```

---

## File Conventions

- `TASKS.md` — Prioritized tasks (P0/P1/P2)
- `AGENTS.md` — Agent registry and system map
- `CLAUDE.md` — This file (AI assistant context)

---

## EGOS Governance

This repo is part of the EGOS ecosystem governance mesh.

- Kernel: `/home/enio/egos/`
- Shared governance: `~/.egos/` (symlinked at `.egos`)
- Local governance: `.guarani/`
- Sync: `~/.egos/sync.sh` propagates shared rules

# INC-003 ANTI-HALLUCINATION (2026-04-08): Before adding task→verify artifact exists. After implement→mark [x] same commit. Checklist→spot-check top 5 P0/P1 tasks.
