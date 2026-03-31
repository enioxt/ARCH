# TASKS.md — EGOS ARCH

> **VERSION:** 1.0.0 | **CREATED:** 2026-03-31
> **PURPOSE:** Backlog, sprint planning, and task tracking for Arch AI design tool
> **STATUS:** Active development — MVP to Production roadmap

---

## 🎯 Current Sprint — Q2 2026

### P0 — Blockers (Must ship this sprint)

- [ ] **ARCH-001** — Implementar módulo de orçamento inteligente
  - **Owner:** Enio
  - **Complexity:** HIGH
  - **Dependencies:** APIs Exa, Firecrawl, Perplexity
  - **Deliverables:**
    - 4 camadas: busca → normalização → cálculo → relatório
    - 3 cenários: econômico / padrão / premium
    - Integração SINAPI, CUB, ORSE, SICRO
    - View "Orçamento" no dashboard
    - Endpoints: `/api/budget/*`
    - Telemetria EGOS completa
  - **Spec:** `/home/enio/Downloads/compiladochats/egos_arch_modulo_orcamento_v1.md`
  - **Status:** 🟡 Planning
  - **ETA:** 2026-04-15

- [ ] **ARCH-002** — Criar governance files (EGOS compliance)
  - **Owner:** Enio
  - **Complexity:** LOW
  - **Deliverables:**
    - TASKS.md (this file)
    - docs/CAPABILITY_REGISTRY.md
    - docs/SYSTEM_MAP.md
    - .windsurfrules
    - .guarani/IDENTITY.md
  - **Status:** 🟢 In Progress
  - **ETA:** 2026-03-31

- [ ] **ARCH-003** — Resolver drift de governança (14 issues from 852)
  - **Owner:** Enio
  - **Complexity:** MEDIUM
  - **Dependencies:** egos-gov sync script
  - **Deliverables:**
    - Converter .guarani local copies → symlinks
    - Configurar pre-commit hook egos-gov check
    - Sync com SSOT do 852
  - **Status:** 🔴 Blocked (needs 852 sync)
  - **ETA:** 2026-04-05

### P1 — High Priority (Sprint goals)

- [ ] **ARCH-004** — Motor paramétrico de projeto (core MVP)
  - **Owner:** Enio
  - **Complexity:** VERY HIGH
  - **Deliverables:**
    - Ingestão sketch/photo/texto
    - Interpretação → JSON canônico da planta
    - Editor 2D interativo
    - Extrusão 3D simples
    - Render/vídeo via fal.ai
    - Versionamento e diff de projetos
  - **Spec:** 6 blocos MVP definidos em `ChatGPT-Ferramenta IA para Projetos (1).md`
  - **Status:** 🟡 Partially Done (renders OK, editor pending)
  - **ETA:** 2026-04-30

- [ ] **ARCH-005** — API orchestration layer
  - **Owner:** Enio
  - **Complexity:** MEDIUM
  - **Deliverables:**
    - Multi-provider router (Gemini, Claude, OpenAI)
    - Cost tracking por request
    - Rate limiting e retry logic
    - Fallback automático entre providers
  - **Status:** 🟢 In Progress (router exists, needs hardening)
  - **ETA:** 2026-04-10

- [ ] **ARCH-006** — Vision extraction real (não mockado)
  - **Owner:** Enio
  - **Complexity:** HIGH
  - **Deliverables:**
    - `/api/vision/extract-geometry` funcional
    - Usar Gemini 3.1 Pro multimodal
    - Extrair: rooms, dimensions, walls, doors, windows
    - Converter para JSON canônico do projeto
  - **Status:** 🔴 Not Started (atualmente mockado)
  - **ETA:** 2026-04-20

### P2 — Nice to Have (Backlog)

- [ ] **ARCH-007** — Integração com ferramentas profissionais
  - **Deliverables:**
    - Export para SketchUp, Revit, AutoCAD
    - Import de DXF/DWG
    - Integração com BIM 360
  - **Status:** 🔴 Backlog
  - **ETA:** Q3 2026

- [ ] **ARCH-008** — Modo colaborativo multiplayer
  - **Deliverables:**
    - WebSocket real-time sync
    - Comentários e anotações por ambiente
    - Histórico de edições por usuário
  - **Status:** 🔴 Backlog
  - **ETA:** Q3 2026

- [ ] **ARCH-009** — Mobile app (React Native)
  - **Deliverables:**
    - App iOS/Android
    - Tirar foto de terreno/sketch
    - Visualizar projetos em AR
  - **Status:** 🔴 Backlog
  - **ETA:** Q4 2026

---

## 📋 Backlog — Future Features

### Orçamento (Budget Module)

- [ ] **BUDGET-001** — Scraping de fornecedores regionais MG
  - Worker para atualização automática de preços
  - Lojas: Leroy Merlin, Telhanorte, C&C, Ferreira Costa
  - Schedule: diário para itens voláteis, semanal para estáveis

- [ ] **BUDGET-002** — Cronograma físico-financeiro
  - Curva S
  - Orçamento por etapa de obra
  - Projeção de desembolso

- [ ] **BUDGET-003** — Integração com ERPs
  - Conexão com Conta Azul, Omie, Bling
  - Sincronização de compras e pagamentos
  - Conciliação bancária

### Renders & Visualização

- [ ] **RENDER-001** — Walkthrough 360° interativo
  - Usar Three.js para navegação
  - Hotspots clicáveis
  - VR mode

- [ ] **RENDER-002** — Vídeo cinematográfico profissional
  - Integração Sora 2 quando API lançar
  - Múltiplas câmeras e takes
  - Música e narração IA

### IA & Automação

- [ ] **AI-001** — Agent copiloto de projeto
  - Sugestões em tempo real durante edição
  - "E se..." exploratório
  - Alertas de normas técnicas (NBR)

- [ ] **AI-002** — Análise de viabilidade técnica
  - Estrutural (lajes, vigas, fundação)
  - Elétrica e hidráulica
  - Eficiência energética
  - Conformidade legal

### Integrações Externas

- [ ] **INT-001** — Google Maps / Earth integration
  - Importar terreno real
  - Orientação solar automática
  - Análise de vizinhança

- [ ] **INT-002** — Marketplace de fornecedores
  - Catálogo de materiais
  - Orçamento direto com fornecedores
  - Avaliações e reviews

---

## 🏗️ Technical Debt

- [ ] **TECH-001** — Migrar state management para Zustand v5
  - Atualmente usando v4
  - Breaking changes no middleware

- [ ] **TECH-002** — Adicionar testes E2E (Playwright)
  - Coverage atual: ~0%
  - Target: >70% core flows

- [ ] **TECH-003** — Configurar CI/CD pipeline
  - GitHub Actions
  - Auto-deploy to staging
  - PR checks obrigatórios

- [ ] **TECH-004** — Documentação técnica completa
  - ADRs (Architecture Decision Records)
  - API reference
  - Onboarding guide

---

## 📊 Métricas e KPIs

### Product Metrics
- **DAU/MAU:** Não coletando ainda
- **Conversion (visitor → user):** Não medindo
- **Average project completion time:** Não medindo
- **Cost per render:** ~$0.15 (fal.ai video)

### Tech Metrics
- **API uptime:** Manual check apenas
- **Avg response time:** Não instrumentado
- **Error rate:** Logs manuais
- **Build time:** ~45s (local)

### Business Metrics
- **MRR:** $0 (MVP gratuito)
- **Customer acquisition cost:** N/A
- **Churn rate:** N/A

**ACTION:** Implementar telemetria EGOS completa (ARCH-001 e ARCH-004)

---

## 🎓 Research & Learning

- [ ] **LEARN-001** — Estudar BIM workflows profissionais
  - Revit, ArchiCAD, BIM 360
  - IFC format e interoperabilidade

- [ ] **LEARN-002** — Benchmarking competitivo profundo
  - Planner 5D, Cedreo, Floorplanner
  - Pricing models e GTM strategies

- [ ] **LEARN-003** — Normas técnicas brasileiras
  - NBR 6492 (representação de projetos)
  - NBR 13531 (elaboração de projetos)
  - Acessibilidade (NBR 9050)

---

## 📝 Notes & Context

### Decisões Técnicas Principais

1. **Motor paramétrico > Gerador de imagem**
   - Projeto editável com histórico > Imagem bonita mas estática
   - Fonte: `ChatGPT-Ferramenta IA para Projetos (1).md`

2. **Exa como busca primária (orçamento)**
   - US$ 7/1k searches + $12/1k deep searches
   - Melhor para agentic workflows que SerpApi ou Google Custom Search
   - Fonte: `egos_arch_modulo_orcamento_v1.md`

3. **Gemini 3.1 Pro como espinha dorsal multimodal**
   - Texto, imagem, vídeo, áudio, PDF
   - Tool use + structured output
   - Preço: $2/1M tokens entrada, $12/1M saída
   - Fonte: Pesquisa ChatGPT + Context7

4. **Perplexity para deep research, não motor padrão**
   - Modo "auditor/pesquisador" premium
   - Não como default de cada consulta (custo alto)
   - Fonte: `egos_arch_modulo_orcamento_v1.md:285-287`

### Documentos de Referência

- `/home/enio/Downloads/compiladochats/egos_arch_modulo_orcamento_v1.md`
- `/home/enio/Downloads/compiladochats/ChatGPT-Ferramenta IA para Projetos (1).md`
- `/home/enio/Downloads/compiladochats/orcamento_comparativo_casa_patos_de_minas_enio.xlsx`
- `/home/enio/Downloads/compiladochats/plano_preliminar_casa_patos_de_minas_enio.docx`
- `docs/ORCAMENTO_HEXAGONAL_500K.md` (proof of concept local)
- `docs/ARCH_PRODUCT_ARCHITECTURE.md`

### Repositórios Relacionados

- **egos** (`/home/enio/egos`) — SSOT governance
- **852** — Ecosystem registry (drift detected: 14 issues)
- **forja** — Plataforma SaaS relacionada

---

## 🔄 Changelog

### 2026-03-31
- ✅ Criado TASKS.md inicial
- ✅ Analisados documentos de contexto sobre orçamento
- ✅ Definido roadmap MVP → Production
- 🟡 ARCH-002 em progresso (governance files)

### 2026-03-30
- ✅ Último commit: meta-prompt generator + pipeline + deliverables
- ✅ Deploy estável em arch.egos.ia.br

---

**Last updated:** 2026-03-31 by Enio Rocha
**Next review:** 2026-04-07 (weekly sprint review)
