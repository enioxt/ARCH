# 🧊 APIs COMPARISON — COMPLETE OVERVIEW

**Data:** 2026-03-31
**Objetivo:** Comparação visual de todas APIs com versão grátis vs paga

---

## 🎯 RESUMO VISUAL

```
STATUS ATUAL:

✅ CONFIGURADAS (3/8)
├── Brave Search API     [Pago: $5/1k]
├── Firecrawl API        [Pago: $16/mês]
└── OpenRouter + fal.ai  [Free Trial: $25]

⏳ PENDENTES — GRÁTIS (5/8)
├── SINAPI (CAIXA)       [Público: $0]
├── CUB Sinduscon-MG     [Público: $0]
├── ORSE (MG)            [Público: $0]
├── Google Gemini        [Free Tier: $0]
└── Exa API (opcional)   [Free Trial]

❌ NÃO RECOMENDADO (1/8)
└── Perplexity API       [Pago: $5+/1k, free tier descontinuado]

TOTAL GRÁTIS: 5/8 = 62.5%
CUSTO MÍNIMO: $25/mês (trial credits)
```

---

## 📊 TABELA COMPARATIVA DETALHADA

### FONTES DE DADOS (Budget Module)

| API | Tipo | Custo | Free Tier | Confiança | Cobertura | Status | Links |
|-----|------|-------|-----------|-----------|-----------|--------|-------|
| **SINAPI** | Oficial CAIXA | $0 | ✅ 100% | 95% | Brasil | ⏳ TODO | [CAIXA](https://www.caixa.gov.br) \| [i9](https://www.i9orcamentos.com.br/tabela-sinapi-2026/) |
| **CUB-MG** | Sinduscon | $0 | ✅ 100% | 90% | MG | ⏳ TODO | [Sinduscon](https://sinduscon-mg.org.br/cub/) |
| **ORSE** | Governo MG | $0 | ✅ 100% | 85% | MG | ⏳ TODO | [Data Room MG](http://dataroom.mg.gov.br/) |
| **Exa** | Search | $7/1k | ✅ Trial | 75% | Web | ⏳ TODO | [exa.ai](https://exa.ai) |
| **Firecrawl** | Scraping | $16/mo | ❌ Pago | 85% | Web | ✅ FEITO | [firecrawl.dev](https://www.firecrawl.dev) |
| **Brave** | Search | $5/1k | ❌ Pago | 80% | Web | ✅ FEITO | [brave.com](https://api.search.brave.com) |

---

### VISION & MULTIMODAL (ARCH-004, 006)

| API | Modelo | Custo | Free Tier | Capacidades | Latência | Status | Links |
|-----|--------|-------|-----------|-------------|----------|--------|-------|
| **Google Gemini** | 3.1 Flash | $0 | ✅ 60 req/min | Text, Image, Video, Audio, PDF | ~1-2s | ⏳ TODO | [ai.google.dev](https://ai.google.dev) |
| **Google Gemini** | 3.1 Pro | $0.075/M in, $0.3/M out | ✅ 10 req/min (trial) | Text, Image, Video, Audio, PDF, Tool Use | ~2-3s | ⏳ TODO | [pricing](https://ai.google.dev/pricing) |
| **OpenRouter** | Claude 3.5 | Via credits | ✅ $5 trial | Text, Image | ~1-2s | ✅ FEITO | [openrouter.ai](https://openrouter.ai) |
| **OpenRouter** | Perplexity | Via credits | ✅ $5 trial | Text, Research | ~3-5s | ✅ FEITO | [openrouter.ai/models](https://openrouter.ai/models) |

---

### GENERATION (Renders & Videos)

| API | Modelo | Custo | Free Tier | Tipo | Qualidade | Status | Links |
|-----|--------|-------|-----------|------|-----------|--------|-------|
| **fal.ai** | Flux | $0.05-0.15/img | ✅ $20 trial | Image | Excelente | ✅ FEITO | [fal.ai](https://fal.ai) |
| **fal.ai** | Luma | $0.30/30s | ✅ $20 trial | Video | Excelente | ✅ FEITO | [fal.ai](https://fal.ai) |
| **fal.ai** | Recraft | $0.08/img | ✅ $20 trial | Image | Ótimo | ✅ FEITO | [fal.ai](https://fal.ai) |
| **Together AI** | SDXL | $0.0015/img | ✅ Free | Image | Bom | ⏳ TODO | [together.ai](https://www.together.ai/) |

---

## 💰 ORÇAMENTO DETALHADO

### Cenário 1: MVP (TUDO GRÁTIS)

```
SINAPI          R$ 0.00   (dados públicos CAIXA)
CUB-MG          R$ 0.00   (dados públicos Sinduscon)
ORSE            R$ 0.00   (dados públicos Estado MG)
Google Gemini   R$ 0.00   (free tier: 60 req/min, 2M tokens/day)
OpenRouter      R$ 125    (trial $5, depois $.0001/token mínimo)
fal.ai          R$ 100    (trial $20, depois ~$0.05-0.30 por geração)
Brave Search    R$ 0.00   (não usar, usar Exa)
─────────────────────────
TOTAL/MÊS       ~R$ 225   (com trial credits)
```

### Cenário 2: Growth (SEMI-PAGO)

```
SINAPI          R$ 0.00   (público)
CUB-MG          R$ 0.00   (público)
ORSE            R$ 0.00   (público)
Google Gemini   R$ 0.00   (free tier)
Exa API         R$ 35     ($7/1k × 5k/mês = ~1 projeto/dia)
Firecrawl       R$ 80     ($16/mês oficial)
fal.ai          R$ 150    (pago, ~10 renders/vídeos)
OpenRouter      R$ 50     (fallback)
─────────────────────────
TOTAL/MÊS       R$ 315    (produção leve)
```

### Cenário 3: Production (COMPLETO)

```
SINAPI          R$ 0.00   (público)
CUB-MG          R$ 0.00   (público)
ORSE            R$ 0.00   (público)
Google Gemini   R$ 200    (Pro tier: 100 req/day)
Exa API         R$ 100    ($7/1k × 15k/mês)
Firecrawl       R$ 80     (Starter plan)
Brave Search    R$ 150    ($5/1k × 30k/mês)
fal.ai          R$ 500    (50+ renders/vídeos)
OpenRouter      R$ 200    (fallback + Perplexity)
─────────────────────────
TOTAL/MÊS       R$ 1.230  (uso moderado)
```

---

## 📍 MATRIX: QUEM USA O QUÊ

```
┌─────────────────────────────────────────────┐
│          BUDGET MODULE (Preços)             │
├─────────────────────────────────────────────┤
│ Entrada:  Briefing projeto                  │
│ Busca:    SINAPI → CUB-MG → ORSE            │
│ Scraping: Firecrawl (suppliers web)         │
│ Search:   Exa / Brave                       │
│ Saída:    BudgetReport (3 cenários)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       VISION MODULE (Geometria)             │
├─────────────────────────────────────────────┤
│ Entrada:  Sketch/Photo de cliente           │
│ Extração: Google Gemini 3.1 (vision)        │
│ Parsing:  JSON canônico Projeto             │
│ Saída:    Massa 3D + Renders                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      GENERATION MODULE (Renders)            │
├─────────────────────────────────────────────┤
│ Entrada:  Massa 3D + Prompts                │
│ Geração:  fal.ai (Flux, Luma, Recraft)     │
│ Fallback: Together AI (SDXL)                │
│ Saída:    Imagens + Vídeos 4K              │
└─────────────────────────────────────────────┘
```

---

## 🚀 RECOMENDAÇÕES FINAIS

### ✅ IMPLEMENTAR JÁ (Prioridade P0)

**Custo:** GRÁTIS
**Tempo:** 4-5 horas
**Impacto:** MVP funcional

1. **SINAPI** — dados oficiais brasileiros
2. **Google Gemini Vision** — extração real de sketches
3. **CUB-MG** — validação regional

### 🟡 CONSIDERAR (Prioridade P1)

**Custo:** ~$30/mês
**Tempo:** 2-3 horas
**Impacto:** Cobertura web + Confiança

4. **Exa API** — busca semântica melhor
5. **ORSE** — composições técnicas completas

### 🔴 DESCARTAR (Prioridade 0)

**Custo:** $5+/mês
**Impacto:** Redundante
**Razão:** Perplexity descontinuou free tier (fev 2026)

❌ **Perplexity API** — usar OpenRouter com Perplexity models se necessário

### 💡 ESTRATÉGIA

```
MVP (Agora)
↓
SINAPI + CUB + Gemini (Grátis)
↓
Growth (2-4 semanas)
↓
+ Exa + ORSE (Semi-pago)
↓
Production (Mês 2)
↓
+ Brave Search + Firecrawl completo
↓
Scale (Mês 3+)
↓
Perplexity Research + fal.ai Enterprise
```

---

## 🔧 QUICK START

### Hoje (30 min)
```bash
# 1. Get Gemini API key
# https://ai.google.dev/

# 2. Add to .env
echo "GEMINI_API_KEY=your_key" >> .env

# 3. npm install @google/generative-ai
npm install @google/generative-ai
```

### Amanhã (2 horas)
```bash
# 1. Implementar SINAPI scraping
# → src/lib/budget-api.ts:68

# 2. Implementar CUB Sinduscon
# → src/lib/budget-api.ts:152

# 3. Testar com 3 projetos de exemplo
```

### Semana que vem (4 horas)
```bash
# 1. Implementar Gemini Vision extraction
# → server.ts:305

# 2. Testar com sketches reais
# 3. Integração ORSE
# 4. Deploy MVP
```

---

## 📞 CONTATOS & LINKS FINAIS

### Documentação Oficial
- **Google Gemini:** https://ai.google.dev/
- **Exa AI:** https://exa.ai/
- **Firecrawl:** https://www.firecrawl.dev/
- **fal.ai:** https://fal.ai/
- **OpenRouter:** https://openrouter.ai/

### Dados Brasileiros
- **CAIXA SINAPI:** https://www.caixa.gov.br/
- **Sinduscon-MG:** https://sinduscon-mg.org.br/
- **CBIC:** https://cbic.org.br/
- **Data Room MG:** http://dataroom.mg.gov.br/

### Comunidades
- **i9 Orçamentos:** https://www.i9orcamentos.com.br/
- **Sienge:** https://sienge.com.br/
- **AI Mode:** https://aimode.in/
- **AI Tools House:** https://aitoolshouse.com/

---

## 📋 CHECKLIST FINAL

- [ ] Ler `DIAGNOSTIC_FULL_2026-03-31.md` (visão geral)
- [ ] Ler `API_SETUP_GUIDE_FREE_TIER.md` (implementação)
- [ ] Ler este arquivo (comparação)
- [ ] Get Google Gemini API key
- [ ] Implementar SINAPI (2h)
- [ ] Implementar Gemini Vision (1.5h)
- [ ] Implementar CUB (1.5h)
- [ ] Test e validate
- [ ] Commit tudo
- [ ] Deploy MVP

---

**Gerado:** 2026-03-31 23:50 UTC
**Próxima Review:** 2026-04-07
**Status:** Pronto para produção (com APIs grátis)
