# DIAGNÓSTICO COMPLETO — EGOS ARCH
**Data:** 2026-03-31
**Responsável:** Enio Rocha
**Status:** MVP Phase 1 — 60% completo

---

## 📊 RESUMO EXECUTIVO

### Status Atual
- ✅ **6 de 10 tasks concluídas** (60%)
- 🟡 **4 tasks em progresso/pending** (40%)
- 🔴 **0 tasks bloqueadas** (mas 14 issues de drift com 852)

### Commits Recentes
```
50bfbde docs(security): Update API_KEYS_SECURITY.md with Firecrawl
ee0fc9b feat(budget): Add Firecrawl API integration patterns
6246f15 feat(budget): Wire Budget module to dashboard (ARCH-001 fase 1)
cbfe44b feat(arch-001): Módulo de orçamento — Code-ready para integração
```

### Arquivos Críticos
- ✅ TASKS.md (governance)
- ✅ docs/CAPABILITY_REGISTRY.md (capacidades)
- ✅ docs/SYSTEM_MAP.md (arquitetura)
- ✅ .windsurfrules (código)
- ✅ .guarani/IDENTITY.md (identidade)
- ✅ 2.575 linhas de código budget module
- ✅ BudgetView integrado ao dashboard
- ✅ API keys: Brave + Firecrawl armazenadas com segurança

---

## 🎯 TASKS PENDENTES COM VERSÃO GRÁTIS

### [ARCH-001] Implementar módulo de orçamento (70% PRONTO)

**Status:** 🟡 Fase 1 ✅ | Fase 2 ⏳
**Owner:** Enio
**ETA:** 2026-04-15

#### ✅ Concluído (Fase 1)
- [x] Schemas e tipos (560+ linhas)
- [x] State management Zustand (400+ linhas)
- [x] Lógica de cálculo (350+ linhas)
- [x] 5 componentes React (1000+ linhas)
- [x] 7 endpoints REST (450+ linhas)
- [x] BudgetView integrado no dashboard
- [x] Segurança: Brave + Firecrawl keys configuradas

#### ⏳ Pendente (Fase 2) — APIs Grátis

##### 1. **SINAPI (CAIXA) — SEM CUSTO**
- **Descrição:** Tabelas de preços oficiais para construção
- **Tipo:** Pública, sem autenticação
- **Docs:** https://www.caixa.gov.br/site/Paginas/default.aspx
- **Recurso:** Consultar tabelas SINAPI 2026
- **Links úteis:**
  - 📍 Tabela SINAPI 2026: https://www.i9orcamentos.com.br/tabela-sinapi-2026/
  - 📺 Tutorial: https://www.youtube.com/watch?v=Ld-hcGEjMgI
  - 📄 Sienge Blog: https://sienge.com.br/blog/tabela-sinapi-no-orcamento-da-obra/
  - 📄 OrçaFascio: https://www.orcafascio.com/papodeengenheiro/tabela-sinapi-2026

**Integração em:** `src/lib/budget-api.ts:fetchSINAPIprices()` (linha 68)

```typescript
// TODO: Descomentar e implementar
// const response = await fetch(`https://api.sinapi.gov.br/v1/search?item=${itemName}&region=${region}`);
```

---

##### 2. **CUB Sinduscon-MG — SEM CUSTO**
- **Descrição:** Custo Unitário Básico regional
- **Tipo:** Pública, relatório mensal
- **Site:** https://sinduscon-mg.org.br/
- **Atualização:** Fevereiro 2026 disponível
- **Links úteis:**
  - 🏢 CUB Tabelas: https://sinduscon-mg.org.br/cub/tabela-do-cub/
  - 📊 Composição CUB Fev/2026: https://sinduscon-mg.org.br/cubs/composicao-cub-m²-fevereiro-2026/
  - 📈 MySide (tracker): https://myside.com.br/guia-imoveis/cub-mg
  - 📰 CBIC: https://cbic.org.br/

**Integração em:** `src/lib/budget-api.ts:fetchCUBprices()` (linha 152)

```typescript
// TODO: Fazer web scraping da tabela em https://sinduscon-mg.org.br/cub/tabela-do-cub/
// Usar Firecrawl para extrair valores
```

---

##### 3. **ORSE (Minas Gerais) — SEM CUSTO**
- **Descrição:** Sistema de Orçamentos Referenciais de Obras
- **Tipo:** Estadual MG, dados públicos
- **Portal:** Data Room MG
- **Links úteis:**
  - 📁 Data Room MG: http://dataroom.mg.gov.br/
  - 📄 i9 Orçamentos: https://www.i9orcamentos.com.br/tabela-orse/
  - 📊 Mais Controle ERP: https://maiscontroleerp.com.br/tabela-orse/
  - 📍 Sistema ORSE (Sergipe): https://orse.cehop.se.gov.br/

**Integração em:** `src/lib/budget-api.ts` (novo fetch function)

```typescript
// TODO: Implementar fetchORSEprices()
// Dados públicos de Minas Gerais
```

---

##### 4. **Exa API — $7/1k SEARCHES (Free Trial)**
- **Descrição:** Neural search com compreensão semântica
- **Tipo:** Paid with free tier / trial
- **Pricing:** Simplificado em março 2026
- **Links úteis:**
  - 🔗 Docs: https://exa.ai/
  - 💰 Pricing: https://exa.ai/docs/changelog/pricing-update
  - 🧮 Calculator: https://www.buildmvpfast.com/tools/api-pricing-estimator/exa
  - ⚖️ Comparativo: https://www.autotouch.ai/post/exa-vs-clay

**Próximo:** Signup em https://exa.ai → Get API Key

---

##### 5. **Firecrawl — $16/mês (Plano Starter)**
- **Status:** ✅ KEY CONFIGURED
- **Tipo:** Paid ($16/mês = ~$0.50/dia)
- **Links úteis:**
  - 🔗 Site: https://www.firecrawl.dev/
  - 📖 Docs: https://docs.firecrawl.dev/
  - 💳 Pricing: https://www.firecrawl.dev/pricing

**Integração:** Já configurada em `.env` + `budget-api.ts:fetchRetailPrices()` (linha 105)

---

##### 6. **Perplexity API — NO FREE TIER (💰 Pago)**
- **Status:** 🔴 Descontinuado free tier (fev 2026)
- **Tipo:** Paid only ($5/1k requests, ~$5-10/mês mínimo)
- **Alternativa Grátis:** OpenRouter (Perplexity via proxy)
- **Links:**
  - 🔗 Docs: https://docs.perplexity.ai/
  - ❌ Free Usage Gone: https://cms.nucleusnetwork.com/urban-beat/perplexity-api-free-usage-guide/
  - 📰 Reddit: https://www.reddit.com/r/perplexity_ai/comments/1r4cztm/confirmed_5_monthly_api_credits/
  - 💼 OpenRouter: https://openrouter.ai/ (Perplexity sonar-pro via OpenRouter)

**Recomendação:** Usar OpenRouter em vez de Perplexity API direto

---

### [ARCH-003] Resolver drift de governança (14 issues)

**Status:** 🔴 BLOQUEADO — precisa sincronizar com 852
**Owner:** Enio
**ETA:** 2026-04-05

#### Problema
- 14 issues de governança detectados entre arch e 852
- .guarani/ local precisa virar symlinks
- Pre-commit hook CRCDM detectando impacto cross-repo

#### Solução
```bash
# Passo 1: Checkout da branch 852
cd /home/enio/852
git pull origin main

# Passo 2: Sync EGOS governance
egos-gov sync

# Passo 3: Converter .guarani local → symlinks
cd /home/enio/arch
for file in .guarani/*.md; do
  symlink_target="../852/guarani/$(basename $file)"
  rm "$file"
  ln -s "$symlink_target" "$file"
done

# Passo 4: Commit
git add .guarani/
git commit -m "fix(governance): Convert .guarani to symlinks from 852"
```

#### Links
- 📍 egos repo: `/home/enio/egos`
- 📍 852 repo: `/home/enio/852`
- 📋 TASKS.md: `./TASKS.md#ARCH-003`
- 🔗 EGOS Gov Docs: https://github.com/enioxt/egos

---

### [ARCH-004] Motor paramétrico de projeto (MVP)

**Status:** 🟡 PARTIALLY DONE (60% renders OK, 0% editor)
**Owner:** Enio
**Complexity:** VERY HIGH
**ETA:** 2026-04-30

#### ✅ Concluído
- Ingestão sketch/photo/texto (visual, no editor)
- Interpretação básica de geometria
- Render via fal.ai (3+ modelos funcionando)
- Vídeo 30s via fal.ai/Luma

#### ⏳ Pendente — APIs Grátis

##### **Google Gemini 3.1 Pro — FREE TIER**
- **Descrição:** Multimodal (text, image, video, audio, PDF)
- **Free Tier:** 60 RPM, 2M tokens/day
- **Modelo Livre:** Gemini 3.1 Flash (gratuito)
- **Links úteis:**
  - 🔗 API Docs: https://ai.google.dev/gemini-api/docs/
  - 🆓 Free Tier: https://ai.google.dev/gemini-api/docs/pricing
  - 📖 Complete Guide: https://aifreeapi.com/en/posts/gemini-api-free-tier-complete-guide
  - 📊 Status March 2026: https://www.datastudios.org/post/google-gemini-free-in-march-2026-plans
  - 🔍 Comparison: https://ai-rockstars.com/gemini/

**Uso em ARCH:**
```typescript
// Vision extraction em /api/vision/extract-geometry
// Usar Gemini 3.1 Flash para:
// 1. Extrair linhas/polígonos de sketch
// 2. Reconhecer cômodos e dimensões
// 3. Converter para JSON canônico
// 4. Gerar 3D via Three.js
```

**Setup:**
1. Get API Key: https://ai.google.dev/
2. Add to `.env`: `GEMINI_API_KEY=your_key`
3. Implementar em `src/lib/budget-api.ts` (line 305)

---

##### **fal.ai — FREE TRIAL ($20 crédito)**
- **Descrição:** Image + video generation (Flux, Luma, Recraft)
- **Free Trial:** $20 crédito (3-5 videos)
- **Status:** ✅ Já integrado
- **Links:**
  - 🔗 Site: https://fal.ai/
  - 📖 Docs: https://fal.ai/docs
  - 🎨 Models: Flux, Luma, Recraft, Veo
  - 💰 Pricing: https://fal.ai/pricing

**Integração:** `src/lib/generation-engine.js` (já funciona)

---

##### **OpenRouter — FREE COM CRÉDITO**
- **Descrição:** Multi-provider router com fallback
- **Free Trial:** $5 crédito inicial
- **Status:** ✅ Já integrado
- **Links:**
  - 🔗 Site: https://openrouter.ai/
  - 📖 API Docs: https://openrouter.ai/docs
  - 🧮 Models & Pricing: https://openrouter.ai/models

**Integração:** `server.ts` (linha 26-34)

---

### [ARCH-005] API orchestration layer

**Status:** 🟢 IN PROGRESS (router existe, precisa hardening)
**Owner:** Enio
**ETA:** 2026-04-10

#### ✅ Funciona
- Multi-provider router (Gemini, Claude via OpenRouter, OpenAI)
- Fallback automático
- Cost tracking básico
- Rate limiting (não hardened)

#### ⏳ TODO
- [ ] Implementar circuit breaker
- [ ] Add retry logic com exponential backoff
- [ ] Logging estruturado de falhas
- [ ] Dashboard de custos por provider

#### Links
- 📄 Código: `src/lib/generation-engine.js`
- 📄 Router: `server.ts` (linhas 27-34)
- 🧮 Cost tracking: `src/lib/prompt-generator.js`

---

### [ARCH-006] Vision extraction real

**Status:** 🔴 NOT STARTED (mockado)
**Owner:** Enio
**ETA:** 2026-04-20

#### O que fazer
```typescript
// /api/vision/extract-geometry (linha 305 em server.ts)

// Atual: Mock response setTimeout
// Target: Real Gemini 3.1 Pro multimodal

// Steps:
1. Receber image (sketch or photo)
2. Chamar Gemini 3.1 Pro Vision
3. Extrair: polygons, lines, rooms, doors, windows, dimensions
4. Converter para JSON canônico Project
5. Retornar para frontend
```

#### Setup Gemini
```bash
# 1. Get API key
# https://ai.google.dev/

# 2. Add to .env
GEMINI_API_KEY=your_key

# 3. Update server.ts
import Anthropic from "@anthropic-sdk/sdk"
// ou usar Google SDK
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro" });
```

#### Links
- 🔗 Google AI Studio: https://aistudio.google.com/
- 📖 Vision Guide: https://ai.google.dev/tutorials/python_quickstart#vision
- 🎯 Models: https://ai.google.dev/models

---

## 📋 RESUMO: O QUE FAZER AGORA

### Próximos 7 dias (Prioridade P0)

#### 1. **Conectar SINAPI** (2h)
```bash
# Status: Implementar fetch
# Arquivo: src/lib/budget-api.ts:68
# Custo: GRÁTIS
# Impacto: Alta confiança (0.95) nos preços

# Próximos passos:
# 1. Pesquisar endpoint SINAPI atual
# 2. Implementar parser de respostas
# 3. Testar com 3 itens comuns (concreto, bloco, aço)
```

#### 2. **Conectar CUB MG** (1.5h)
```bash
# Status: Web scraping ou API
# Arquivo: src/lib/budget-api.ts:152
# Custo: GRÁTIS
# Impacto: Índice regional validado

# Próximos passos:
# 1. Verificar https://sinduscon-mg.org.br/cub/tabela-do-cub/
# 2. Usar Firecrawl para extrair tabela (já temos key)
# 3. Parse CSV/HTML → JSON
```

#### 3. **Configurar Gemini Vision** (1.5h)
```bash
# Status: Substituir mock em /api/vision/extract-geometry
# Arquivo: server.ts:305
# Custo: GRÁTIS (60 RPM, 2M tokens/day)
# Impacto: Vision extraction real

# Próximos passos:
# 1. Get API key em https://ai.google.dev/
# 2. Install: npm install @google/generative-ai
# 3. Implementar handler para image upload
# 4. Extrair geometry do sketch
```

#### 4. **Resolve ARCH-003 drift** (1h)
```bash
# Status: Sync com 852
# Arquivo: .guarani/
# Custo: GRÁTIS (repositório interno)
# Impacto: Governança completa

# Próximos passos:
# 1. cd /home/enio/852 && git pull
# 2. Setup symlinks de .guarani → 852
# 3. Run egos-gov check
# 4. Commit
```

---

## 💰 ORÇAMENTO TOTAL (Q2 2026)

### APIs Grátis (ZERO CUSTO)
| API | Versão | Custo | Status |
|-----|--------|-------|--------|
| SINAPI | Pública | R$ 0 | ⏳ TODO |
| CUB Sinduscon | Pública | R$ 0 | ⏳ TODO |
| ORSE | Pública | R$ 0 | ⏳ TODO |
| Google Gemini | Free Tier | $0 | ⏳ TODO |
| OpenRouter | Free Trial | $5 | ✅ Configurado |
| fal.ai | Free Trial | $20 | ✅ Configurado |

**Subtotal Grátis:** $25 (trial credits) = **R$ 125/mês**

---

### APIs Pagos (Não recomendados agora)
| API | Versão | Custo | Status |
|-----|--------|-------|--------|
| Exa | Starter | $7/1k searches | ⏳ Free trial |
| Firecrawl | Starter | $16/mês | ✅ Configurado |
| Perplexity | N/A | ❌ Descontinuado | Use OpenRouter |
| Brave Search | Standard | $5/1k requests | ✅ Configurado |

**Subtotal Pago (mínimo):** ~$30/mês = **R$ 150/mês**

---

## 🔧 CHECKLIST PRONTO-PARA-IMPLEMENTAR

### ✅ SINAPI Integration
- [ ] Pesquisar endpoint SINAPI 2026
- [ ] Implementar fetch em budget-api.ts
- [ ] Testar 3 itens
- [ ] Add logging telemetria
- [ ] Commit: `feat(budget): SINAPI integration`

### ✅ CUB MG Integration
- [ ] Get tabela em https://sinduscon-mg.org.br/cub/tabela-do-cub/
- [ ] Usar Firecrawl para scraping
- [ ] Parse para JSON
- [ ] Integrar em budget-api.ts
- [ ] Commit: `feat(budget): CUB MG integration`

### ✅ ORSE Integration
- [ ] Encontrar fonte de dados ORSE MG
- [ ] Implementar fetch/scrape
- [ ] Integrar em budget-api.ts
- [ ] Commit: `feat(budget): ORSE integration`

### ✅ Gemini Vision
- [ ] Get API key: https://ai.google.dev/
- [ ] npm install @google/generative-ai
- [ ] Implementar /api/vision/extract-geometry
- [ ] Testar com sketch de exemplo
- [ ] Commit: `feat(vision): Real Gemini extraction`

### ✅ Resolve Governance Drift (ARCH-003)
- [ ] cd /home/enio/852 && git pull
- [ ] Setup .guarani symlinks
- [ ] Run egos-gov check
- [ ] Commit: `fix(governance): ARCH-003 drift resolved`

---

## 📞 LINKS DE CONTATO & RECURSOS

### Documentação Oficial
- Google Gemini: https://ai.google.dev/
- Exa AI: https://exa.ai/
- Firecrawl: https://www.firecrawl.dev/
- OpenRouter: https://openrouter.ai/
- fal.ai: https://fal.ai/

### Comunidades
- Reddit r/perplexity_ai: https://reddit.com/r/perplexity_ai
- AI Tools House: https://aitoolshouse.com/
- AI Mode: https://aimode.in/

### Dados Brasileiros
- SINAPI CAIXA: https://www.caixa.gov.br/
- Sinduscon-MG: https://sinduscon-mg.org.br/
- CBIC: https://cbic.org.br/
- Data Room MG: http://dataroom.mg.gov.br/

---

## 📊 PRÓXIMO REVIEW

**Data:** 2026-04-07 (próxima segunda)
**Agenda:**
- [ ] Status das 4 integrações (SINAPI, CUB, ORSE, Gemini)
- [ ] ARCH-003 resolução
- [ ] Custos reais vs. orçado
- [ ] Blockers e dependências

**Responsável:** Enio Rocha
**Participantes:** Claude Code AI

---

**Documento gerado:** 2026-03-31 23:45 UTC
**Próxima atualização:** 2026-04-07 ou quando houver progresso significativo
