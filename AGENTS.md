# AGENTS.md — EGOS Arch

> **VERSION:** 1.0.0 | **CREATED:** 2026-03-30
> **PURPOSE:** System map and agent capability declarations for the Arch repo.
> **Classification:** `product` (MVP stage — see EGOS Ecosystem Classification Registry)

---

## Repo Identity

| Property | Value |
|----------|-------|
| Repo | `arch` |
| Type | AI-assisted architectural design tool |
| Stack | React 19, TypeScript, Vite 6, Express, Tailwind CSS 4, Zustand |
| Deploy | Docker on Hetzner VPS (port 3098), Caddy at `arch.egos.ia.br` |
| Status | Active — MVP |
| EGOS Mesh | Registered 2026-03-30 |

---

## System Map

```
arch/
├── src/
│   ├── ai/
│   │   └── prompts/
│   │       └── architect-agent.ts   # AI chat agent — briefing interpreter
│   ├── orchestrator/
│   │   └── pipeline.ts             # Vision pipeline (planned)
│   ├── components/                 # React UI components
│   ├── store/                      # Zustand state management
│   ├── schemas/                    # Data schemas
│   ├── lib/                        # Utilities
│   ├── telemetry/                  # Telemetry instrumentation
│   ├── App.tsx                     # Root component
│   └── main.tsx                    # Entry point
├── .guarani/                       # Local governance
├── CLAUDE.md                       # AI session context
├── AGENTS.md                       # This file
└── server.ts                       # Unified Express + Vite server
```

---

## Active Agents

### architect-agent
- **Role:** AI chat agent that interprets architectural briefings and generates design recommendations
- **Source:** `src/ai/prompts/architect-agent.ts`
- **LLM:** OpenRouter (Gemini 2.0 Flash)
- **Status:** Active

### vision-pipeline (Planned)
- **Role:** Sketch-to-geometry extraction — converts hand-drawn sketches into structured geometry data
- **Source:** `src/orchestrator/pipeline.ts`
- **LLM:** Gemini Vision (planned) + Trimesh
- **Status:** Planned

### Claude Code (Primary)
- **Role:** Development, debugging, refactoring, task execution
- **Invoked via:** `claude` CLI in this directory
- **Context file:** `CLAUDE.md`

---

## Key Commands

```bash
npm run dev         # Local dev server
npm run build       # Production build
```

---

## Governance Links

- Shared rules: `~/.egos/guarani/PREFERENCES_SHARED.md`
- EGOS kernel: `/home/enio/egos/`
- Ecosystem classification: `egos/docs/ECOSYSTEM_CLASSIFICATION_REGISTRY.md`
