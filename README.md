> **[ARCHIVED]** Este repositório foi arquivado oficialmente em 2026-06-11 durante a auditoria EGOS e serve apenas como referência histórica/arquitetural.

# EGOS Arch

> **Versão:** 0.2.0 | **Atualizado:** 2026-05-01 | **Status:** PAUSA
> **Parte do ecossistema [EGOS](https://github.com/enioxt/egos)**

Arquitetura Assistida por Inteligência Artificial — transforma sketches e briefings em projetos arquitetônicos completos.

**Live:** [arch.egos.ia.br](https://arch.egos.ia.br) · **Deploy:** Docker + Caddy (Hetzner VPS)

---

## O que é

EGOS Arch interpreta descrições em linguagem natural e sketches desenhados à mão, gerando plantas 2D, modelos 3D, renders fotorrealísticos e vídeos walkthrough.

**Princípio:** O usuário descreve o que quer (texto ou desenho) → a IA co-cria o projeto iterativamente → gera todos os entregáveis técnicos.

---

## Funcionalidades

### Em produção

- **Chat com Arquiteto IA** — Conversa iterativa com Gemini 2.0 Flash para co-criação do projeto
- **Análise de Briefing** — Extração estruturada de ambientes, geometria, pontos-chave e ambiguidades
- **Upload de Sketches** — Dropzone para fotos de croquis desenhados à mão
- **Export 5 Formatos** — JSON, Markdown, CSV, DOCX, PDF
- **10 Projetos-Seed** — Dados realistas para demonstração
- **Multi-Provider Router** — fal.ai + Together AI + OpenRouter com seleção de modelo por tier

### Em desenvolvimento

- **Planta 2D** — Geração automática de plantas baixas (Fase 2)
- **Visualização 3D** — Three.js com modelos gerados por Trimesh (Fase 3)
- **Renders Fotorrealísticos** — Via Flux, Imagen 4, SDXL (Fase 3)
- **Vídeo Walkthrough** — Via Wan 2.5, Kling, Veo 3.1 (Fase 4)

---

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

---

## Modelo de Custos (Transparência Radical)

Custo real da API + 5% de comissão EGOS.

| Operação | Economy | Standard | Premium |
|----------|---------|----------|---------|
| Chat (briefing) | $0.01 | $0.01 | $0.01 |
| 4 Renders | $0.008 | $0.16 | $0.24 |
| 1 Vídeo (30s) | $1.50 | $2.10 | $3.00 |
| 1 Modelo 3D | $0.07 | $0.07 | $0.40 |
| **Total por projeto** | **~R$9** | **~R$13** | **~R$20** |

---

## Quick Start

```bash
git clone git@github.com:enioxt/ARCH.git
cd ARCH
npm install
cp .env.example .env
npm run dev  # http://localhost:3000
```

---

## Ecossistema EGOS — Dependências

| Repo | Relação | Status |
|------|---------|--------|
| [egos](https://github.com/enioxt/egos) | Kernel upstream — governança, multi-model router pattern | PROD |

**Upstream (o que este repo usa):** padrões de governança `.guarani/`, multi-model router pattern, telemetria SSOT.

**Downstream (quem usa este repo):** produto independente — nenhum repo depende dele.

---

## Licença

MIT — Criado por [Enio Rocha](https://github.com/enioxt) | Powered by EGOS
