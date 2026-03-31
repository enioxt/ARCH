# CAPABILITY_REGISTRY.md — EGOS ARCH

> **VERSION:** 1.0.0 | **CREATED:** 2026-03-31
> **PURPOSE:** Declarative registry of all agents, skills, and capabilities in the Arch ecosystem
> **ALIGNMENT:** EGOS v5.5 — Transparent capability mesh

---

## 🎯 Registry Purpose

This document serves as the **single source of truth** for:
- All AI agents and their roles
- Computational capabilities and limits
- API integrations and dependencies
- Skill composition and orchestration patterns
- Observability and telemetry hooks

**Principle:** Every capability must be **discoverable**, **auditable**, and **composable**.

---

## 🤖 Agent Registry

### architect-agent

**Type:** Conversational AI
**Role:** Interprets architectural briefings and generates design recommendations
**Location:** `src/ai/prompts/architect-agent.ts`
**Model:** Multi-provider (Gemini 3.1 Pro / Claude Sonnet 4.6 / GPT-5.4)
**Context Window:** Up to 200k tokens (model-dependent)
**Cost:** ~$0.002-0.02 per interaction (varies by provider)

**Capabilities:**
- ✅ Natural language briefing parsing
- ✅ Style interpretation (moderno, rústico, minimalista, etc.)
- ✅ Constraint reasoning (budget, terrain, regulations)
- ✅ Design rationale generation
- ✅ Multi-proposal generation (3 variants)
- 🟡 Technical validation (planned)
- 🟡 Regulatory compliance check (NBR) (planned)

**Inputs:**
- User briefing (text)
- Terrain data (dimensions, orientation, topography)
- Budget constraints
- Style preferences
- Functional requirements

**Outputs:**
- Design rationale (markdown)
- 3 architectural proposals (structured JSON)
- Recommended next steps
- Risk flags

**Telemetry:**
- `architect_briefing_analyzed`
- `architect_proposals_generated`
- `architect_interaction_cost`

---

### budget-researcher-agent (Planned)

**Type:** Agentic search & analysis
**Role:** Research real-time pricing for construction materials and services
**Location:** `src/ai/agents/budget-researcher.ts` (to be created)
**Stack:** Exa + Firecrawl + Perplexity + Gemini/Claude
**Cost:** Variable (API usage-based)

**Capabilities:**
- 🔴 Multi-source price discovery (SINAPI, CUB, ORSE, SICRO, retail)
- 🔴 Market trend analysis
- 🔴 Supplier reliability scoring
- 🔴 Regional price normalization
- 🔴 Confidence scoring per item

**Inputs:**
- BOM (Bill of Materials) from project
- Region (for price adjustment)
- Quality tier (econômico/padrão/premium)

**Outputs:**
- Structured price data per item
- Source attribution and timestamps
- Confidence scores
- Market insights report

**Dependencies:**
- Exa API (search)
- Firecrawl API (scraping)
- Perplexity API (deep research)
- SINAPI public data
- CUB Sinduscon-MG
- ORSE database

**Telemetry:**
- `budget_research_started`
- `budget_source_fetched`
- `budget_item_priced`
- `budget_report_generated`

**Spec:** `/home/enio/Downloads/compiladochats/egos_arch_modulo_orcamento_v1.md`

---

### vision-extractor-agent (Planned)

**Type:** Computer vision + reasoning
**Role:** Extract structured geometry from sketches, photos, and floor plans
**Location:** `src/ai/agents/vision-extractor.ts` (to be created)
**Model:** Gemini 3.1 Pro (multimodal) or Claude 4 Sonnet
**Cost:** ~$0.001-0.01 per image analysis

**Capabilities:**
- 🔴 Sketch interpretation
- 🔴 Floor plan digitization
- 🔴 Dimension extraction
- 🔴 Room identification
- 🔴 Wall, door, window detection
- 🔴 JSON canonicalization

**Inputs:**
- Image (sketch, photo, scan)
- Context hints (scale, orientation)

**Outputs:**
- Structured project JSON
- Detected entities (rooms, walls, doors, windows)
- Confidence scores per element
- Ambiguity warnings

**Telemetry:**
- `vision_extraction_started`
- `vision_entities_detected`
- `vision_geometry_normalized`

**Status:** 🔴 Currently mockado in `server.ts:vision/extract-geometry`

---

### render-orchestrator-agent

**Type:** Generative media pipeline
**Role:** Orchestrate render and video generation workflows
**Location:** `src/orchestrator/pipeline.ts`
**Stack:** fal.ai (Flux, Recraft, Luma, Veo)
**Cost:** ~$0.15-0.40 per video, ~$0.05-0.10 per render

**Capabilities:**
- ✅ Multi-model routing (Flux, Recraft, Luma Dream Machine, Veo)
- ✅ Async queue management
- ✅ Retry logic with exponential backoff
- ✅ Cost tracking per generation
- 🟡 Batch generation optimization (planned)
- 🟡 Quality scoring (planned)

**Inputs:**
- Base prompt
- Style modifiers
- Target format (image/video)
- Resolution
- Duration (for video)

**Outputs:**
- Generated media URLs
- Generation metadata (model, cost, duration)
- Quality metrics

**Telemetry:**
- `render_generation_started`
- `render_generation_completed`
- `render_generation_failed`
- `render_cost_incurred`

---

### copilot-suggester-agent (Planned)

**Type:** Real-time assistant
**Role:** Provide contextual suggestions during project editing
**Location:** `src/ai/agents/copilot.ts` (to be created)
**Model:** Fast model (Gemini Flash 2 / Claude Haiku)
**Cost:** <$0.001 per suggestion

**Capabilities:**
- 🔴 Real-time design suggestions
- 🔴 "What if..." exploratory analysis
- 🔴 Regulatory warnings (NBR compliance)
- 🔴 Structural feasibility checks
- 🔴 Energy efficiency recommendations

**Inputs:**
- Current project state
- User action context
- Editing history

**Outputs:**
- Inline suggestions
- Warning banners
- Optimization tips

**Telemetry:**
- `copilot_suggestion_shown`
- `copilot_suggestion_accepted`
- `copilot_warning_issued`

---

## 🔌 Integration Registry

### API Integrations

| Service | Purpose | Cost Model | Status | Rate Limits |
|---------|---------|-----------|--------|-------------|
| **Gemini 3.1 Pro** | Multimodal reasoning | $2/1M input, $12/1M output | ✅ Active | 60 RPM |
| **Claude Sonnet 4.6** | Advanced reasoning | ~$3/1M input, ~$15/1M output | ✅ Active | 50 RPM |
| **GPT-5.4** | Fallback reasoning | ~$5/1M input, ~$15/1M output | 🟡 Optional | 500 RPM |
| **fal.ai** | Image/video generation | $0.05-0.40 per generation | ✅ Active | 10 concurrent |
| **Exa** | Agentic search | $7/1k searches | 🔴 Planned | 100 RPM |
| **Firecrawl** | Web scraping | $16/mo (3k credits) | 🔴 Planned | 1 credit/page |
| **Perplexity Sonar** | Deep research | $5/1k requests | 🔴 Planned | 20 RPM |
| **Brave Search** | Fallback search | $5/1k requests | 🔴 Planned | 300 RPM |

### Data Sources

| Source | Type | Update Freq | Cost | Status |
|--------|------|-------------|------|--------|
| **SINAPI** | Public construction costs | Monthly | Free | 🔴 Planned |
| **CUB Sinduscon-MG** | Regional cost index | Monthly | Free | 🔴 Planned |
| **ORSE** | Composition library | Static | Free | 🔴 Planned |
| **SICRO/DNIT** | Infrastructure costs | Quarterly | Free | 🔴 Planned |
| **Leroy Merlin** | Retail pricing | Daily | Scraping | 🔴 Planned |
| **Telhanorte** | Retail pricing | Daily | Scraping | 🔴 Planned |
| **C&C** | Retail pricing | Daily | Scraping | 🔴 Planned |

---

## 🎭 Skill Composition Patterns

### Pattern 1: Briefing → Design
```
User Input → architect-agent → Design Rationale + 3 Proposals → User Review
```

### Pattern 2: Sketch → 3D Model (Planned)
```
Image Upload → vision-extractor-agent → Canonical JSON → Editor 2D → Extrusion 3D
```

### Pattern 3: Design → Render/Video
```
Project State → Meta-Prompt Generator → render-orchestrator-agent → fal.ai → Media URLs
```

### Pattern 4: Project → Budget (Planned)
```
Project JSON → BOM Extractor → budget-researcher-agent → [Exa + Firecrawl + SINAPI] →
3 Scenarios (eco/std/premium) → Report with Sources
```

### Pattern 5: Real-time Copilot (Planned)
```
User Editing → copilot-suggester-agent → Inline Suggestions + Warnings
```

---

## 📊 Observability Matrix

### Telemetry Events

All agents emit structured events to the EGOS telemetry bus.

**Event Schema:**
```typescript
type TelemetryEvent = {
  timestamp: string;          // ISO 8601
  event_type: string;         // e.g., "architect_briefing_analyzed"
  agent: string;              // e.g., "architect-agent"
  project_id?: string;
  user_id?: string;
  session_id: string;

  // Performance
  latency_ms: number;
  tokens_in?: number;
  tokens_out?: number;

  // Cost
  cost_usd: number;
  provider: string;           // e.g., "gemini", "claude", "fal.ai"

  // Quality
  confidence_score?: number;  // 0-1
  error?: string;

  // Context
  metadata: Record<string, any>;
};
```

### Metrics Dashboard (Planned)

- **Agent Activity:** Requests/hour, success rate, avg latency
- **Cost Tracking:** Total spend, cost per project, cost per feature
- **Quality Metrics:** User satisfaction, error rate, confidence scores
- **API Health:** Uptime, rate limit warnings, fallback triggers

---

## 🔒 Security & Privacy

### API Key Management
- All keys stored in `.env` (gitignored)
- Rotation policy: quarterly
- Access logged for audit

### User Data
- No PII stored in telemetry by default
- Project data anonymized in logs
- Opt-in for detailed analytics

### Rate Limiting
- Per-user quotas (planned)
- Graceful degradation on limit hit
- Cost caps per session

---

## 🚀 Capability Roadmap

### Q2 2026
- ✅ architect-agent (DONE)
- ✅ render-orchestrator-agent (DONE)
- 🟡 budget-researcher-agent (IN PROGRESS)
- 🟡 vision-extractor-agent (IN PROGRESS)

### Q3 2026
- copilot-suggester-agent
- Multi-user collaboration
- Advanced telemetry dashboard

### Q4 2026
- Mobile agents (AR integration)
- BIM export agents
- Regulatory compliance validator

---

## 📚 Related Documents

- `AGENTS.md` — High-level system map
- `TASKS.md` — Implementation backlog
- `docs/SYSTEM_MAP.md` — Architecture diagrams
- `docs/ARCH_PRODUCT_ARCHITECTURE.md` — Product spec
- `/home/enio/Downloads/compiladochats/egos_arch_modulo_orcamento_v1.md` — Budget module spec

---

**Maintained by:** Enio Rocha
**Last updated:** 2026-03-31
**Next review:** 2026-04-07
