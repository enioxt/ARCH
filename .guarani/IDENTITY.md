# IDENTITY.md — EGOS ARCH

> **PURPOSE:** Declarative identity of the Arch repo within the EGOS ecosystem
> **VERSION:** 1.0.0 | **CREATED:** 2026-03-31
> **ALIGNMENT:** EGOS v5.5 — Transparent mesh networking of autonomous repos

---

## 🆔 Core Identity

| Property | Value |
|----------|-------|
| **Canonical Name** | `arch` |
| **Full Name** | EGOS Arch — AI-Assisted Architectural Design Tool |
| **Classification** | Product (MVP → Production) |
| **Owner** | Enio Rocha (@enioxt) |
| **Created** | 2026-03-30 |
| **Status** | Active Development |
| **Maturity** | Alpha (MVP functional, production-ready pending) |

---

## 🌐 Ecosystem Position

### Role in EGOS Mesh
**Arch** is a **leaf product repository** in the EGOS ecosystem. It produces user-facing value (architectural design tool) and consumes governance, patterns, and infrastructure from the SSOT repos.

### Dependencies (Upstream)
- **egos** (`/home/enio/egos`) — SSOT governance, .guarani patterns, sync scripts
- **852** (ecosystem registry) — Agent registry, capability mesh
- **forja** (optional) — SaaS platform patterns, authentication (future)

### Dependents (Downstream)
- None currently (standalone product)
- Future: May provide architectural design services to other EGOS products

### Siblings
Other EGOS product repos:
- `carteira-livre` — Financial services
- `guard-brasil` — PII detection/LGPD compliance
- `smartbuscas` — Intelligent search
- `br-acc` — Accountability platform
- `INPI` — Trademark/IP tools
- `policia` / `santiago` — Law enforcement tools

---

## 🎯 Product Mission

**Vision:** Democratize architectural design through AI assistance, making professional-grade design tools accessible to everyone while maintaining transparency, cost-efficiency, and technical rigor.

**Mission:** Build a tool that transforms natural language briefings and rough sketches into editable architectural projects with real-time rendering, accurate budgeting, and complete observability.

**Principles:**
1. **Motor Paramétrico > Geração Mágica** — Editable projects over static renders
2. **Transparência Radical** — Every cost, decision, and data source visible
3. **Fontes de Verdade** — Official data (SINAPI, CUB) over AI hallucinations
4. **Simplicidade Operacional** — Ship working features over perfect vaporware

---

## 📦 What This Repo Provides

### Core Capabilities
1. **AI Briefing Interpreter** — Converts user descriptions into structured design requirements
2. **Multi-Proposal Generator** — Creates 3 distinct architectural approaches per briefing
3. **Render & Video Pipeline** — High-quality visualization via fal.ai (Flux, Recraft, Luma, Veo)
4. **Meta-Prompt Engine** — Generates optimized prompts for each rendering model
5. **Budget Module** (in progress) — 3-scenario cost estimation with source traceability
6. **Telemetry & Cost Tracking** — Real-time observability of all AI/API operations

### Tech Stack Export
- React 19 + TypeScript patterns
- Vite 6 build configuration
- Express API structure
- Zustand state management patterns
- Multi-provider LLM routing
- fal.ai integration patterns

### Knowledge Export
- Architectural design prompt engineering
- Construction cost research methodology
- Brazilian regulatory context (SINAPI, CUB, ORSE, NBR)
- Vision-to-geometry extraction workflows

---

## 🔌 What This Repo Consumes

### From EGOS SSOT (`/home/enio/egos`)
- `.guarani/` governance patterns (symlinked)
- `scripts/sync-all-leaf-repos.sh` — Governance sync
- Telemetry event schemas
- Agent registry patterns
- Capability mesh concepts

### From Ecosystem (`852`)
- Agent ID conventions
- Cross-repo orchestration patterns (future)
- Shared skill libraries (future)

### From External Sources
- AI models (Gemini, Claude, GPT)
- Rendering engines (fal.ai)
- Search/scraping APIs (Exa, Firecrawl, Perplexity)
- Public cost databases (SINAPI, CUB, ORSE, SICRO)

---

## 🚀 Deployment Identity

| Property | Value |
|----------|-------|
| **Domain** | `arch.egos.ia.br` |
| **Hosting** | Hetzner VPS (Docker container) |
| **Port** | 3098 (internal), 443 (external via Caddy) |
| **Container Image** | `enioxt/arch:latest` |
| **Environment** | Production (single instance, no staging yet) |
| **Monitoring** | Manual (telemetry planned) |
| **Backup** | Git-based (no DB yet) |

---

## 📊 Metrics & KPIs

### Product Metrics
- **Users:** Not tracking yet (public alpha)
- **Projects Created:** Not tracking yet
- **Renders Generated:** Logged in telemetry, not aggregated
- **Cost per User:** Not calculated yet

### Technical Metrics
- **Uptime:** Manual check only
- **API Response Time:** Not instrumented
- **Error Rate:** Logs only, no aggregation
- **Build Time:** ~45s (local), not CI/CD yet

### Business Metrics
- **Revenue:** $0 (MVP is free)
- **CAC:** N/A
- **Churn:** N/A

**Goal:** Implement full telemetry dashboard by Q2 2026 (see TASKS.md#ARCH-001).

---

## 🔄 Versioning Strategy

### Semantic Versioning
- **Major (X.0.0):** Breaking API changes, architecture rewrites
- **Minor (0.X.0):** New features, backward-compatible
- **Patch (0.0.X):** Bug fixes, refactors

### Current Version
- **Code:** Not tagged yet (pre-v1.0)
- **API:** Unversioned (will be `/api/v1/*` post-launch)
- **Protocol:** N/A (no cross-repo protocol yet)

### Release Cadence
- **MVP Phase:** Continuous deployment (every merge to main)
- **Post-Launch:** Weekly minor releases, daily patches as needed

---

## 🤝 Collaboration Model

### Internal (Within EGOS)
- **Governance:** Follow SSOT from `egos` repo
- **Sync:** Run `sync-all-leaf-repos.sh` weekly
- **Contributions:** Direct commits (Enio), PRs for external contributors (future)

### External (Open Source)
- **License:** Not yet defined (will be MIT or similar)
- **Issues:** GitHub Issues (not yet public)
- **PRs:** Welcome post-v1.0 launch
- **Community:** Discord/Slack channel (planned)

---

## 🧬 DNA & Heritage

### Architectural Lineage
Arch inherits design principles from:
1. **EGOS Protocol** — Transparency, observability, agent-centric thinking
2. **Carteira Livre** — User-first product design, cost transparency
3. **Guard Brasil** — Data source attribution, compliance rigor
4. **Forja** — Multi-provider orchestration patterns

### Unique Innovations
1. **Motor Paramétrico** philosophy for generative design
2. **3-scenario budgeting** with confidence scoring
3. **Meta-prompt generator** for multi-model rendering
4. **Sketch → canonical JSON** vision extraction (planned)

---

## 🔮 Future Evolution

### Near-Term (Q2 2026)
- Complete budget module (ARCH-001)
- Vision extraction (ARCH-006)
- Editor 2D/3D (ARCH-004)
- Full telemetry dashboard

### Mid-Term (Q3-Q4 2026)
- Multi-user collaboration
- Mobile app (React Native + AR)
- Professional integrations (SketchUp, Revit, AutoCAD)
- Marketplace de fornecedores

### Long-Term (2027+)
- BIM-grade outputs
- Regulatory compliance automation (NBR)
- AI structural/energy efficiency analysis
- Platform for architects (SaaS model)

---

## 📚 Canonical Documentation

### Primary Docs (This Repo)
- `README.md` — User-facing overview
- `AGENTS.md` — System map
- `TASKS.md` — Backlog & roadmap
- `docs/CAPABILITY_REGISTRY.md` — Agent specs
- `docs/SYSTEM_MAP.md` — Architecture diagrams
- `docs/ARCH_PRODUCT_ARCHITECTURE.md` — Product vision
- `.windsurfrules` — Coding standards
- `.guarani/IDENTITY.md` — This file
- `.guarani/PREFERENCES.md` — General EGOS preferences

### External References
- Budget module spec: `/home/enio/Downloads/compiladochats/egos_arch_modulo_orcamento_v1.md`
- Product research: `/home/enio/Downloads/compiladochats/ChatGPT-Ferramenta IA para Projetos (1).md`
- Casa hexagonal case: `docs/ORCAMENTO_HEXAGONAL_500K.md`

---

## 🔗 External Integrations

### APIs (Current)
- Gemini 3.1 Pro (Google AI)
- Claude Sonnet 4.6 (Anthropic)
- GPT-5.4 (OpenAI)
- fal.ai (Flux, Recraft, Luma, Veo)

### APIs (Planned)
- Exa (search)
- Firecrawl (scraping)
- Perplexity (deep research)

### Data Sources (Planned)
- SINAPI (CAIXA/IBGE)
- CUB Sinduscon-MG
- ORSE (MG state)
- SICRO/DNIT

---

## 🛡️ Risk Profile

### Technical Risks
- **Medium:** Dependency on external AI APIs (mitigation: multi-provider fallback)
- **Medium:** fal.ai rate limits (mitigation: queue management + retries)
- **Low:** No database yet (mitigation: planned PostgreSQL migration)

### Business Risks
- **High:** No monetization yet (MVP is free)
- **Medium:** Uncertain product-market fit (mitigation: user feedback loops)
- **Low:** Competition (differentiation: transparency + Brazilian focus)

### Compliance Risks
- **Low:** No PII collection yet
- **Medium:** Budget data accuracy (mitigation: source attribution + confidence scores)

---

## 💡 Contact & Ownership

| Role | Name | Contact |
|------|------|---------|
| **Owner** | Enio Rocha | enioxt@gmail.com |
| **Lead Developer** | Enio Rocha | @enioxt (GitHub) |
| **Product Manager** | Enio Rocha | (same) |
| **DevOps** | Enio Rocha | (same) |

**Contributors:** Open to external contributors post-v1.0.

---

## 🎭 Personality & Voice

If Arch were a person:
- **Archetype:** The Pragmatic Visionary
- **Tone:** Professional but approachable, technical but not elitist
- **Values:** Transparency, rigor, user empowerment
- **Communication style:** Clear, direct, evidence-based
- **Quirks:** Obsessed with source attribution, loves a good 3-scenario comparison

**Brand promise:** "Professional architectural design, transparent costs, no black boxes."

---

**Maintained by:** Enio Rocha
**Last updated:** 2026-03-31
**Next review:** 2026-04-07 (with sprint review)
