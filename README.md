<div align="center">

# EGOS Arch

### Arquitetura Assistida por Inteligência Artificial

**Transforme sketches e briefings em projetos arquitetônicos completos**

[![Live](https://img.shields.io/badge/LIVE-arch.egos.ia.br-2563EB?style=for-the-badge)](https://arch.egos.ia.br)
[![Status](https://img.shields.io/badge/Status-MVP%20Alpha-F59E0B?style=for-the-badge)]()
[![EGOS](https://img.shields.io/badge/EGOS-Ecosystem-0A0E27?style=for-the-badge)](https://github.com/enioxt/egos)

</div>

---

## O que é

EGOS Arch é uma ferramenta de projeto arquitetônico que usa IA para interpretar descrições em linguagem natural e sketches desenhados à mão, gerando plantas 2D, modelos 3D, renders fotorrealísticos e vídeos walkthrough.

**Princípio:** O usuário descreve o que quer (texto ou desenho) → a IA co-cria o projeto iterativamente → gera todos os entregáveis técnicos.

## Funcionalidades

### Funcionando (Produção)
- **Chat com Arquiteto IA** — Conversa iterativa com Gemini 2.0 Flash para co-criação do projeto
- **Análise de Briefing** — Extração estruturada de ambientes, geometria, pontos-chave e ambiguidades
- **Upload de Sketches** — Dropzone para fotos de croquis desenhados à mão
- **Export 5 Formatos** — JSON, Markdown, CSV, DOCX, PDF
- **Telemetria** — Custos, latência e eventos em tempo real
- **10 Projetos-Seed** — Dados realistas para demonstração
- **Multi-Provider Router** — fal.ai + Together AI + OpenRouter com seleção de modelo por tier

### Em Desenvolvimento
- **Planta 2D** — Geração automática de plantas baixas (Fase 2)
- **Visualização 3D** — Three.js com modelos gerados por Trimesh (Fase 3)
- **Renders Fotorrealísticos** — Via Flux, Imagen 4, SDXL (Fase 3)
- **Vídeo Walkthrough** — Via Wan 2.5, Kling, Veo 3.1 (Fase 4)
- **Persistência** — Supabase para salvar projetos entre sessões

## Arquitetura

```
┌──────────────────────────────────────────────┐
│                 ARCH Frontend                 │
│  React 19 + Tailwind CSS 4 + Zustand         │
│  9 views: Briefing → Planta → 3D → Render    │
├──────────────────────────────────────────────┤
│              Express Backend                  │
│  /api/chat → OpenRouter (Gemini 2.0 Flash)   │
│  /api/analyze-briefing → JSON estruturado    │
│  /api/vision/extract-geometry → (planejado)  │
├──────────────────────────────────────────────┤
│           Multi-Provider Router               │
│  fal.ai │ Together AI │ OpenRouter            │
│  11 modelos │ 4 tiers │ custo em tempo real   │
├──────────────────────────────────────────────┤
│         Transparência Radical                 │
│  Cada operação: custo visível + modelo usado  │
│  Dashboard: Activity Feed + Cost Breakdown    │
└──────────────────────────────────────────────┘
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4 |
| Estado | Zustand 5 |
| Backend | Express 4, Node.js 22 |
| IA Chat | Gemini 2.0 Flash (via OpenRouter) |
| IA Imagem | Flux, Imagen 4, SDXL (via fal.ai / Together AI) |
| IA Vídeo | Wan 2.5, Kling, Veo 3.1 (via fal.ai) |
| IA 3D | TripoSR, Tripo3D (via fal.ai) |
| Deploy | Docker + Caddy (Hetzner VPS) |
| Schemas | Zod |
| Export | jsPDF, docx.js, file-saver |

## Modelo de Custos (Transparência Radical)

O EGOS Arch usa o modelo **95/5**: o usuário paga o custo real da API + 5% de comissão EGOS.

| Operação | Economy | Standard | Premium |
|----------|---------|----------|---------|
| Chat (briefing) | $0.01 | $0.01 | $0.01 |
| 4 Renders | $0.008 | $0.16 | $0.24 |
| 1 Vídeo (30s) | $1.50 | $2.10 | $3.00 |
| 1 Modelo 3D | $0.07 | $0.07 | $0.40 |
| **Total por projeto** | **~R$9** | **~R$13** | **~R$20** |

## Rodar Localmente

```bash
# Pré-requisitos: Node.js 22+
git clone git@github.com:enioxt/ARCH.git
cd ARCH
npm install
cp .env.example .env
# Editar .env com suas chaves de API
npm run dev
# Abrir http://localhost:3000
```

## Deploy (Docker)

```bash
# Build e deploy
docker compose up -d --build
# Container exposto na porta 3098
# Caddy faz reverse proxy para arch.egos.ia.br
```

## Variáveis de Ambiente

```env
OPENROUTER_API_KEY=sk-or-v1-...    # Chat com Gemini (obrigatório)
FAL_KEY=...                         # fal.ai renders/video (opcional)
TOGETHER_API_KEY=...                # Together AI budget models (opcional)
APP_URL=https://arch.egos.ia.br
NODE_ENV=production
```

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Product Architecture](docs/ARCH_PRODUCT_ARCHITECTURE.md) | Spec completa + multi-model dashboard |
| [Prompt Pack](docs/PROMPT_PACK_CASA_HEXAGONAL.md) | Prompts para ChatGPT/Gemini/Stitch |
| [Orçamento R$500k](docs/ORCAMENTO_HEXAGONAL_500K.md) | Budget detalhado casa hexagonal MG |
| [3 Designs](docs/DESIGNS_3_PROPOSTAS.md) | Hexagonal + Orgânica + Linear Escalonada |

## Parte do Ecossistema EGOS

EGOS Arch é um produto do [EGOS](https://github.com/enioxt/egos) — Ecosystem of Government Operations System. Segue a governança compartilhada do ecossistema, incluindo:

- **Transparência Radical** — Custos visíveis em tempo real
- **Telemetria SSOT** — Schema canônico de eventos
- **Report SSOT** — Padrão unificado de relatórios
- **Multi-Model Router** — Padrão reutilizável entre produtos

## Licença

MIT — Código aberto, use e contribua.

---

<div align="center">

**[arch.egos.ia.br](https://arch.egos.ia.br)** — Em desenvolvimento ativo

Criado por [Enio Rocha](https://github.com/enioxt) | Powered by EGOS

</div>
