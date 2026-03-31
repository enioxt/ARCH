# 🚀 API SETUP GUIDE — FREE TIER ONLY
**Data:** 2026-03-31
**Objetivo:** Configurar todas as APIs com versão grátis

---

## 📋 CHECKLIST RÁPIDO

| # | API | Status | Custo | Link de Setup | Tempo |
|---|-----|--------|-------|---|---|
| 1 | SINAPI (CAIXA) | ⏳ TODO | GRÁTIS | Pública | 2h |
| 2 | CUB Sinduscon-MG | ⏳ TODO | GRÁTIS | Pública | 1.5h |
| 3 | ORSE MG | ⏳ TODO | GRÁTIS | Pública | 1.5h |
| 4 | Google Gemini | ⏳ TODO | GRÁTIS | https://ai.google.dev/ | 1.5h |
| 5 | Brave Search | ✅ FEITO | Pago ($5/1k) | Configurado | — |
| 6 | Firecrawl | ✅ FEITO | Pago ($16/mês) | Configurado | — |
| 7 | OpenRouter | ✅ FEITO | Free Trial | Configurado | — |
| 8 | fal.ai | ✅ FEITO | Free Trial | Configurado | — |

---

## 1️⃣ SINAPI (Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil)

### O que é
- **Responsável:** CAIXA (Banco oficial brasileiro)
- **Dados:** Preços de construção padronizados para todo Brasil
- **Confiança:** 95% (fonte oficial)
- **Região:** Todas (nacional)

### Links de Setup
| Recurso | Link |
|---------|------|
| 📍 Portal CAIXA | https://www.caixa.gov.br/site/Paginas/default.aspx |
| 📊 Tabela 2026 | https://www.i9orcamentos.com.br/tabela-sinapi-2026/ |
| 📺 Tutorial YouTube | https://www.youtube.com/watch?v=Ld-hcGEjMgI |
| 📄 Blog Sienge | https://sienge.com.br/blog/tabela-sinapi-no-orcamento-da-obra/ |
| 📄 OrçaFascio | https://www.orcafascio.com/papodeengenheiro/tabela-sinapi-2026 |

### Setup
```bash
# 1. Pesquisar API SINAPI 2026
# https://www.caixa.gov.br/

# 2. Baixar arquivos CSV/Excel com preços
# Formatos: XLSX, TXT, XML

# 3. Implementar parser em src/lib/budget-api.ts
# Função: fetchSINAPIprices() (linha 68)

# 4. Testar com 3 itens:
# - Concreto fck 30 MPa
# - Bloco cerâmico 14cm
# - Aço CA-50

# 5. Add logging em budget store
logger.log({
  eventName: 'budget_source_fetched',
  provider: 'sinapi',
  itemName: 'Concreto fck 30 MPa',
  costUsd: 0,  // GRÁTIS
  status: 'success'
});
```

### Integração no Código
```typescript
// src/lib/budget-api.ts:68
async function fetchSINAPIprices(itemName: string, region: string): Promise<PriceSource | null> {
  // TODO: Implementar
  // Opção 1: Download mensal dos arquivos CAIXA
  // Opção 2: Web scraping de https://www.caixa.gov.br/
  // Opção 3: Usar serviço intermediário (i9, Sienge, OrçaFascio)

  return {
    name: 'SINAPI (CAIXA)',
    type: 'sinapi',
    low: 450,
    mid: 520,
    high: 600,
    confidence: 0.95,
  };
}
```

---

## 2️⃣ CUB (Custo Unitário Básico) — Sinduscon-MG

### O que é
- **Responsável:** Sinduscon-MG (sindicato regional)
- **Dados:** Índice de custos por m² de construção
- **Confiança:** 90% (regional)
- **Região:** Minas Gerais apenas
- **Atualização:** Mensal (última: Fevereiro 2026)

### Links de Setup
| Recurso | Link |
|---------|------|
| 🏢 Site Sinduscon-MG | https://sinduscon-mg.org.br/ |
| 📊 Tabelas CUB | https://sinduscon-mg.org.br/cub/tabela-do-cub/ |
| 📈 Fev/2026 | https://sinduscon-mg.org.br/cubs/composicao-cub-m²-fevereiro-2026/ |
| 📊 MySide Tracker | https://myside.com.br/guia-imoveis/cub-mg |
| 📰 CBIC News | https://cbic.org.br/ |

### Setup
```bash
# 1. Acessar https://sinduscon-mg.org.br/cub/tabela-do-cub/
# 2. Finder a tabela de Fevereiro 2026
# 3. Usar Firecrawl para fazer scraping da tabela

# Opção A: Download manual
curl -X POST 'https://api.firecrawl.dev/v0/scrape' \
  -H 'Authorization: Bearer fc-7574224eba4a416eafbfcc0150b185f4' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://sinduscon-mg.org.br/cub/tabela-do-cub/",
    "formats": ["markdown", "html"]
  }'

# Opção B: Implementar fetch automático
# Rodar mensalmente para atualizar CUB

# 4. Testar com valor de Fevereiro 2026
# Último: R$ 2.504,80 por m²

# 5. Integrar em budget-api.ts:152
```

### Integração no Código
```typescript
// src/lib/budget-api.ts:152
async function fetchCUBprices(region: string): Promise<PriceSource | null> {
  // TODO: Implementar Firecrawl scraping

  // Fazer scraping de https://sinduscon-mg.org.br/cub/tabela-do-cub/
  // Extrair composição por tipo de construção:
  // - Residencial (padrão)
  // - Comercial
  // - Industrial

  return {
    name: 'CUB Sinduscon-MG (Fev/2026)',
    type: 'cub',
    low: 8500,      // econômico
    mid: 9200,      // padrão
    high: 10000,    // premium
    confidence: 0.90,
  };
}
```

---

## 3️⃣ ORSE (Orçamentos Referenciais de Obras de Sergipe/MG)

### O que é
- **Responsável:** Governo do Estado
- **Dados:** Composições técnicas de serviços de construção
- **Confiança:** 85% (estadual)
- **Região:** Minas Gerais (e Sergipe)
- **Tipo:** Composições de preço (não índices)

### Links de Setup
| Recurso | Link |
|---------|------|
| 📁 Data Room MG | http://dataroom.mg.gov.br/ |
| 📄 i9 Orçamentos | https://www.i9orcamentos.com.br/tabela-orse/ |
| 📊 Mais Controle | https://maiscontroleerp.com.br/tabela-orse/ |
| 🖥️ ORSE (SE) | https://orse.cehop.se.gov.br/ |

### Setup
```bash
# 1. Acessar Data Room MG
# http://dataroom.mg.gov.br/

# 2. Procurar "ORSE" em documentos

# 3. Baixar composições técnicas (Excel/PDF)

# 4. Parser dados em JSON estruturado
# Exemplo:
# Serviço: "Concreto fck 30 MPa"
# Composição: [
#   { insumo: "Cimento", unidade: "kg", qtde: 11, preco: 0.80 },
#   { insumo: "Areia", unidade: "m³", qtde: 0.5, preco: 120 },
#   { insumo: "Brita", unidade: "m³", qtde: 1, preco: 150 }
# ]

# 5. Implementar fetch em budget-api.ts
```

### Integração no Código
```typescript
// src/lib/budget-api.ts (nova função)
async function fetchORSEprices(itemName: string): Promise<PriceSource | null> {
  // TODO: Implementar ORSE scraping
  // Usar composições para calcular preço final

  return {
    name: 'ORSE (MG Composições)',
    type: 'orse',
    low: 470,
    mid: 540,
    high: 610,
    confidence: 0.85,
  };
}
```

---

## 4️⃣ Google Gemini 3.1 Pro — Vision Extraction

### O que é
- **Responsável:** Google DeepMind
- **Modelo:** Gemini 3.1 Flash (grátis) + Pro (pago)
- **Free Tier:** 60 requests/min, 2M tokens/day
- **Uso em ARCH:** Extrair geometria de sketches/fotos
- **Confiança:** 85% (beta)

### Links de Setup
| Recurso | Link |
|---------|------|
| 🔗 API Console | https://ai.google.dev/ |
| 🆓 Free Tier | https://ai.google.dev/gemini-api/docs/pricing |
| 📖 Vision Guide | https://ai.google.dev/tutorials/python_quickstart#vision |
| 📊 Complete Guide | https://aifreeapi.com/en/posts/gemini-api-free-tier-complete-guide |
| 🔍 Models | https://ai.google.dev/models |

### Setup PASSO-A-PASSO

#### Passo 1: Get API Key
```bash
# Ir para https://ai.google.dev/
# Clicar em "Get started"
# Login com Google account
# Create new API key
# Copy key e add to .env

echo 'GEMINI_API_KEY=your_key_here' >> .env
```

#### Passo 2: Install SDK
```bash
npm install @google/generative-ai
# ou
# yarn add @google/generative-ai
```

#### Passo 3: Implementar Vision Extract

```typescript
// server.ts (linha 305)
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/vision/extract-geometry', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash" // ou "gemini-1.5-pro"
    });

    const prompt = `
      Analise esta imagem de sketch/croqui arquitetônico e extraia as seguintes informações em JSON:
      {
        "rooms": [
          { "name": "Sala", "width": 5, "depth": 4, "area": 20 }
        ],
        "walls": [
          { "x1": 0, "y1": 0, "x2": 5, "y2": 0, "thickness": 0.15 }
        ],
        "doors": [
          { "x": 2.5, "y": 0, "width": 0.8 }
        ],
        "windows": [
          { "x": 1, "y": 0, "width": 1.5 }
        ],
        "dimensions": {
          "totalArea": 200,
          "totalWidth": 20,
          "totalDepth": 10
        }
      }

      Se a imagem não é um projeto arquitetônico, retorne um JSON vazio: {}
    `;

    const response = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg"
        }
      },
      prompt
    ]);

    const textContent = response.response.text();
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    const geometry = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json({
      status: 'success',
      data: geometry,
      provider: 'gemini-1.5-flash',
      latencyMs: Date.now() - startTime
    });

  } catch (error) {
    console.error('Vision error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### Passo 4: Test
```bash
# Test com uma imagem de exemplo
curl -X POST http://localhost:3000/api/vision/extract-geometry \
  -H 'Content-Type: application/json' \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "mimeType": "image/png"
  }'

# Esperado: JSON com rooms, walls, doors, windows, dimensions
```

---

## 📦 RESUMO: Install & Configuration

### Install Dependências
```bash
# Google Gemini
npm install @google/generative-ai

# Todos os outros já estão configurados
```

### Update .env
```bash
# Add ao .env existente:

# Google Gemini — FREE TIER
GEMINI_API_KEY=your_key_from_https://ai.google.dev/

# (Brave e Firecrawl já estão configurados)
BRAVE_API_KEY=BSAzJ4rPne1JDWZxGZT-yXoSWvVErzm
FIRECRAWL_API_KEY=fc-7574224eba4a416eafbfcc0150b185f4
```

### Verify
```bash
# Test que tudo está funcionando
node -e "
require('dotenv').config();
const apis = {
  gemini: process.env.GEMINI_API_KEY ? '✅' : '❌',
  brave: process.env.BRAVE_API_KEY ? '✅' : '❌',
  firecrawl: process.env.FIRECRAWL_API_KEY ? '✅' : '❌',
};
console.log('API Status:', apis);
"
```

---

## 🎯 ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

### Semana 1
1. **SINAPI** (2h) — dados oficiais, confiança alta
2. **Google Gemini** (1.5h) — vision extraction real
3. **CUB MG** (1.5h) — índice regional

### Semana 2
4. **ORSE** (1.5h) — composições técnicas
5. **Testing & QA** (2h) — validar dados
6. **Documentation** (1h) — atualizar guides

### Semana 3
7. **ARCH-003 Governance** (1h) — resolver drift
8. **Performance tuning** (2h) — cache, logging
9. **Production ready** — merge to main

---

## ❓ FAQ

### P: SINAPI tem API pública?
**R:** Não exatamente. Dados são públicos mas em vários formatos. Opções:
- Fazer scraping de i9.com.br/tabela-sinapi-2026
- Baixar Excel de CAIXA mensalmente
- Usar serviço intermediário (pago)

### P: CUB é nacional ou regional?
**R:** Regional. Cada estado tem seu próprio CUB. MG usa Sinduscon-MG.

### P: Posso usar Gemini Flash (grátis) em produção?
**R:** Sim, mas com limites: 60 req/min, 2M tokens/dia. Para MVP é suficiente.

### P: E se exceder free tier do Gemini?
**R:** Cai em fallback para Claude via OpenRouter (também grátis com trial).

### P: ORSE é específico de MG?
**R:** Principalmente MG, mas Sergipe também tem um ORSE. Cada estado pode ter sua versão.

---

## 📞 LINKS IMPORTANTES

### Setup Diretos
- Google Gemini API: https://ai.google.dev/
- Google AI Studio (tester): https://aistudio.google.com/
- Firecrawl Docs: https://docs.firecrawl.dev/
- Brave Search API: https://api.search.brave.com/

### Dados Brasileiros
- CAIXA SINAPI: https://www.caixa.gov.br/
- Sinduscon-MG CUB: https://sinduscon-mg.org.br/
- Data Room MG (ORSE): http://dataroom.mg.gov.br/

### Community
- i9 Orçamentos: https://www.i9orcamentos.com.br/
- Sienge Blog: https://sienge.com.br/blog/
- CBIC: https://cbic.org.br/

---

**Última atualização:** 2026-03-31
**Status:** Pronto para implementar
**Tempo total:** ~8 horas de desenvolvimento
**Custo:** GRÁTIS (usando apenas free tiers)
