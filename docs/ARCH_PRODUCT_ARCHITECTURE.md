# EGOS Arch — Product Architecture & Multi-Model Integration

> **Gerado por:** Claude Opus 4.6 (1M context)
> **Data:** 2026-03-30
> **Status:** Spec para implementacao
> **Principio:** Transparencia Radical (EGOS SSOT)

---

## 1. Visao do Produto

EGOS Arch e uma ferramenta de projeto arquitetonico assistida por IA que:
- Interpreta briefings e sketches do usuario
- Gera plantas 2D, modelos 3D, renders e videos
- Usa os **melhores modelos do mundo** via agregadores de API
- Mostra **custos em tempo real** (Transparencia Radical)
- Permite **customizacao total** — usuario escolhe qual modelo usar

---

## 2. Audit Completo do Sistema Atual

### O que FUNCIONA (produção):
| Componente | Status | Detalhe |
|-----------|--------|---------|
| Chat com Arquiteto IA | **LIVE** | Gemini 2.0 Flash via OpenRouter, image upload, JSON state extraction |
| Analise de Briefing | **LIVE** | JSON estruturado (ambientes, geometria, pontos-chave, ambiguidades) |
| Export 5 formatos | **LIVE** | JSON, MD, CSV, DOCX, PDF |
| Telemetria (in-memory) | **LIVE** | Eventos, custos, latencia, pub/sub |
| Upload de Sketches | **LIVE** | Dropzone, preview, multiplos arquivos |
| 10 projetos-seed | **LIVE** | Dados realistas com briefings completos |
| UI profissional | **LIVE** | 9 views, sidebar, project selector |

### O que esta MOCKADO (precisa implementar):
| Componente | Status | Gap |
|-----------|--------|-----|
| Vision Extraction | MOCK | setTimeout 2.5s → hexagono hardcoded |
| 3D Massing | MOCK | Retorna objeto vazio |
| DXF Export | PARCIAL | So exporta hexagono basico |
| Workflow Diagram | PARCIAL | Estatico, nao reflete pipeline real |

### O que NAO EXISTE (precisa construir):
| Componente | Prioridade | Esforco |
|-----------|-----------|---------|
| Geracao de Planta 2D | P1 | 8h |
| Viewer 3D (Three.js) | P1 | 12h |
| Geracao de Renders | P1 | 6h |
| Geracao de Videos | P2 | 8h |
| Persistencia (Supabase) | P0 | 4h |
| Autenticacao | P1 | 3h |
| Multi-model selector | P1 | 6h |
| Dashboard de custos | P1 | 4h |
| Python Vision Worker | P2 | 10h |

---

## 3. Arquitetura Multi-Model

### Agregadores Recomendados (pesquisa completa):

| Agregador | Papel | Modelos | Custo Minimo |
|-----------|-------|---------|-------------|
| **fal.ai** | PRIMARY (imagem + video + 3D) | 1000+ modelos, Flux/Kling/Veo/Sora/TripoSR | $0.02/img, $0.05/s video |
| **Together AI** | BUDGET (prototipagem) | Imagen 4, SDXL, Flux, MiniMax, Veo | $0.002/img, $100 creditos gratis |
| **Replicate** | FALLBACK (comunidade) | 100s modelos comunitarios | $0.003/img |
| **OpenRouter** | LLM routing (ja integrado) | Gemini, Claude, GPT | Variavel |

### Fluxo de Selecao de Modelo (Dashboard):

```
Usuario seleciona tarefa:
  ├── "Gerar Render" → [Painel de Modelos]
  │     ├── Economy:   SDXL via Together ($0.002)
  │     ├── Standard:  Flux 1.1 Pro via fal.ai ($0.04)
  │     ├── Premium:   Imagen 4 Ultra via Together ($0.06)
  │     └── Custom:    Qualquer modelo via fal.ai
  │
  ├── "Gerar Video" → [Painel de Modelos]
  │     ├── Economy:   Wan 2.5 via fal.ai ($0.05/s)
  │     ├── Standard:  Kling 2.5 via fal.ai ($0.07/s)
  │     ├── Premium:   Veo 3.1 via fal.ai ($0.10/s)
  │     └── Ultra:     Sora 2 Pro via fal.ai ($0.50/s)
  │
  └── "Gerar 3D" → [Painel de Modelos]
        ├── Economy:   TripoSR via fal.ai ($0.07)
        └── Premium:   Tripo3D v2.5 via fal.ai ($0.40)
```

### Custo Estimado por Projeto Completo:

| Operacao | Modelo Economy | Modelo Standard | Modelo Premium |
|----------|---------------|-----------------|----------------|
| Chat (briefing) | $0.01 | $0.01 | $0.01 |
| Analise briefing | $0.004 | $0.004 | $0.004 |
| 4 Renders | $0.008 | $0.16 | $0.24 |
| 1 Video (30s) | $1.50 | $2.10 | $3.00 |
| 1 Modelo 3D | $0.07 | $0.07 | $0.40 |
| Planta 2D | $0.01 | $0.01 | $0.01 |
| **TOTAL** | **$1.60** | **$2.35** | **$3.66** |

---

## 4. Transparencia Radical no ARCH

### Principios (do EGOS SSOT):
1. **Cada operacao tem custo visivel** — usuario ve quanto custou cada render, cada video
2. **Dashboard em tempo real** — Activity Feed + Cost Breakdown + IA Insights
3. **Dual output** — Supabase (dashboard) + console JSON (monitoring)
4. **Privacy-safe** — IP hash, key hash, soft delete LGPD
5. **Usage-based pricing** — paga pelo que usa, nao por assento

### Schema de Telemetria ARCH:

```typescript
interface ArchTelemetryEvent extends TelemetryEventBase {
  event_type: 'chat_message' | 'briefing_analysis' | 'sketch_upload' |
              'render_generation' | 'video_generation' | '3d_generation' |
              'floor_plan_generation' | 'export';

  // ARCH-specific
  project_id: string;
  model_tier: 'economy' | 'standard' | 'premium' | 'ultra';
  model_name: string;          // ex: 'flux-1.1-pro', 'veo-3.1-fast'
  provider: string;            // ex: 'fal.ai', 'together', 'replicate'
  resolution?: string;         // ex: '1024x1024', '1080p'
  duration_seconds?: number;   // for video

  // Cost tracking
  cost_usd: number;
  cost_brl: number;            // converted at current rate
  tokens_in?: number;
  tokens_out?: number;
}
```

### Dashboard MVP (1 tela):

```
┌─────────────────────────────────────────────────────┐
│ EGOS Arch — Transparencia Radical                   │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│  ATIVIDADE RECENTE  │  CUSTOS POR TIPO              │
│                     │                               │
│  [14:30] Render     │  Renders:    R$2.40 (45%)    │
│  Flux 1.1 Pro       │  Videos:     R$1.80 (34%)    │
│  fal.ai  R$0.22     │  Chat:       R$0.60 (11%)    │
│  ✅ 1024x1024       │  3D:         R$0.35 (7%)     │
│                     │  Exports:    R$0.15 (3%)     │
│  [14:28] Video      │                               │
│  Wan 2.5            │  ─────────────────────────    │
│  fal.ai  R$3.00     │  TOTAL HOJE: R$5.30          │
│  ✅ 30s 1080p       │  TOTAL MES:  R$45.20         │
│                     │                               │
│  [14:25] Chat       │  IA INSIGHTS:                │
│  Gemini Flash       │  "Seus renders com Flux      │
│  OpenRouter R$0.01  │   custam 40% menos que       │
│  ✅ 340 tokens      │   Imagen 4. Qualidade        │
│                     │   similar para exterior."     │
│                     │                               │
└─────────────────────┴───────────────────────────────┘
```

---

## 5. APIs Necessarias

### Obrigatorias (para MVP funcional):

| API | npm Package | Uso | Custo Estimado |
|-----|------------|-----|---------------|
| **fal.ai** | `@fal-ai/client` | Renders + Video + 3D | Pay-per-use |
| **Together AI** | `together-ai` | Budget image gen | $100 creditos gratis |
| **OpenRouter** | `openai` (ja integrado) | Chat LLM | Pay-per-use |
| **Supabase** | `@supabase/supabase-js` (ja instalado) | Persistencia + auth | Free tier |

### Opcionais (para versao completa):

| API | npm Package | Uso | Quando |
|-----|------------|-----|--------|
| **Replicate** | `replicate` | Modelos comunitarios | Fase 2 |
| **Google Vertex AI** | `@google/genai` | Imagen 4 + Veo 3 direto | Se tiver GCP credits |
| **Stripe** | `stripe` | Pagamentos | Monetizacao |

---

## 6. Modelo de Prompts (nao API direta)

Para ferramentas que o usuario acessa manualmente (ChatGPT, Google AI Studio, Stitch):

```
ARCH gera o prompt otimizado
  → Usuario copia e cola na ferramenta
  → Recebe o resultado (imagem, video)
  → Faz upload de volta no ARCH
  → ARCH registra e organiza
```

**Vantagem:** Zero custo de API, usuario usa seus proprios creditos
**Desvantagem:** Fricao manual (copiar/colar)

### Abordagem Hibrida Recomendada:

1. **Via API** (automatico): fal.ai + Together AI para quem quer 1-click
2. **Via Prompt** (manual): Gerador de prompts para ChatGPT/Gemini/Stitch para quem quer economia total
3. **Dashboard mostra ambas opcoes** lado a lado com custos comparados

---

## 7. Proximos Passos de Codigo

### Sprint 1 — Foundation (esta semana):
- [ ] Instalar `@fal-ai/client` + `together-ai`
- [ ] Criar `src/lib/ai-providers.ts` (router multi-provider)
- [ ] Criar `src/lib/cost-calculator.ts` (preco por modelo em tempo real)
- [ ] Implementar model selector component no dashboard
- [ ] Wiring Supabase para persistencia de projetos

### Sprint 2 — Renders (proxima semana):
- [ ] Integrar fal.ai para geracao de render (Flux 1.1 Pro)
- [ ] Implementar RendersView com galeria de resultados
- [ ] Cost tracking por render gerado
- [ ] Fallback para prompt generator se API falhar

### Sprint 3 — Video + 3D (semana 3):
- [ ] Integrar fal.ai para video (Wan 2.5)
- [ ] Integrar TripoSR para 3D basico
- [ ] Three.js viewer para modelos 3D
- [ ] Dashboard de custos completo

---

## 8. Pricing para Usuarios Finais

| Tier | Incluso | Preco |
|------|---------|-------|
| **Free** | Chat + briefing + export (5 projetos) | R$0 |
| **Starter** | + 10 renders + 2 videos/mes | R$29/mes |
| **Pro** | + 50 renders + 10 videos + 3D | R$99/mes |
| **Enterprise** | Ilimitado + API + white-label | R$299/mes |

**Pay-per-use adicional:** Renders R$0.50, Videos R$5.00, 3D R$2.00

---

*Arquitetura definida por Claude Opus 4.6 (1M context) — EGOS Arch*
*Baseada em: Transparencia Radical SSOT + pesquisa de 8 agregadores de API*
