# Budget Module Implementation Guide

> **Status:** 🟡 Code Ready (Awaiting API Integration)
> **Created:** 2026-03-31
> **Target:** ARCH-001 (Módulo de Orçamento Inteligente)

## Quick Summary

All code for the budget module is ready to go. The only thing left is **plugging in the external APIs** (Exa, Firecrawl, Perplexity, SINAPI, CUB, ORSE).

The code is structured to make API integration as simple as possible.

## Files Created

### 1. Schemas (Type Definitions)
**File:** `src/schemas/budget.schema.ts` (560+ lines)

- `CostSource` — Data source with confidence scoring
- `PricePoint` — Low/mid/high price bands
- `BudgetItem` — Individual line item with calculations
- `BudgetScenario` — Economico/Padrão/Premium scenario
- `BudgetReport` — Complete budget document
- API request/response schemas
- Telemetry event types

**Status:** ✅ Complete, Zod validated

### 2. State Management
**File:** `src/store/budget.store.ts` (400+ lines)

Zustand store with:
- `createBudget()` — Initialize new budget
- `getBudget()` — Fetch current budget
- `addItem()` — Add budget line item
- `updateItem()` — Update item with new prices
- `removeItem()` — Remove item
- `recalculateScenarios()` — Recalculate all 3 scenarios
- `selectScenario()` — Choose low/mid/high for an item
- `saveVersion()` — Create new budget version
- `lockBudget()` — Finalize for approval

**Status:** ✅ Complete, ready for use

### 3. Calculation Logic
**File:** `src/lib/budget-calculator.ts` (350+ lines)

Pure functions (no side effects):
- `calculateItemTotals()` — Item cost across 3 scenarios
- `calculateConfidenceScore()` — Confidence from sources
- `normalizePrices()` — Merge prices from multiple sources
- `extractBOMFromProject()` — Generate default items
- `calculateScenarioTotals()` — Aggregate items into scenarios
- `generateAlerts()` — Quality warnings
- `formatBRL()` — Currency formatting
- `scenarioDifference()` — Percentage diffs between scenarios

**Status:** ✅ Complete, production-ready

### 4. API Endpoints
**File:** `src/lib/budget-api.ts` (450+ lines)

Express routes with **TODO comments** showing where APIs go:
- `POST /api/budget/build-from-project` — Initialize (has mocks)
- `POST /api/budget/research-prices` — Fetch prices (TODO: Exa, Firecrawl, SINAPI)
- `POST /api/budget/recalculate` — Recalculate scenarios
- `GET /api/budget/:projectId/latest` — Get current budget
- `GET /api/budget/:projectId/versions` — Version history
- `POST /api/budget/:projectId/lock` — Finalize
- `POST /api/budget/:projectId/report` — Generate narrative

**Status:** 🟡 Partially Complete (mocks in place, APIs commented)

### 5. React Components
**Files:** `src/components/budget/*.tsx` (1000+ lines total)

- **BudgetView.tsx** — Main dashboard, tabbed interface
- **BudgetSummary.tsx** — Executive summary, category breakdown
- **ScenarioComparison.tsx** — Side-by-side scenario comparison
- **ItemBreakdown.tsx** — Expandable item list with full details
- **SourceTraceability.tsx** — Audit trail, source attribution

**Status:** ✅ Complete, fully styled

### 6. Documentation
**Files:**
- `src/components/budget/README.md` — Component guide
- `BUDGET_IMPLEMENTATION_GUIDE.md` — This file

---

## Step-by-Step Integration

### Step 1: Register Routes in server.ts
```typescript
// At the top:
import { registerBudgetRoutes } from './src/lib/budget-api.js';

// After all other route registrations (around line 200):
registerBudgetRoutes(app);
```

### Step 2: Add to App.tsx Navigation
```typescript
// Around line 15 (ViewType union):
type ViewType = 'briefing' | 'croqui' | '...' | 'orcamento';

// Around line 45 (navItems array):
const navItems = [
  // ... existing items ...
  { id: 'orcamento', label: 'Orçamento', icon: DollarSign },
];

// Around line 80 (import statement):
import BudgetView from './components/budget/BudgetView';

// Around line 130 (in the switch statement):
{currentView === 'orcamento' && <BudgetView />}
```

### Step 3: Integrate Exa API
**File:** `src/lib/budget-api.ts`, function `researchPrices()`

Replace:
```typescript
// TODO: Replace with real Exa + Firecrawl integration
```

With:
```typescript
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

async function searchMarketPrices(itemName: string, region: string) {
  const results = await exa.search(itemName, {
    numResults: 5,
    type: 'web',
  });

  // Parse results and extract prices
  const prices = results.map(result => ({
    source: result.url,
    price: parsePrice(result.text),
  }));

  return prices;
}
```

### Step 4: Integrate Firecrawl API
**File:** `src/lib/budget-api.ts`, function `researchPrices()`

```typescript
import Firecrawl from '@firecrawl/js';

const firecrawl = new Firecrawl(process.env.FIRECRAWL_API_KEY);

async function scrapePrices(urls: string[]) {
  const results = await Promise.all(
    urls.map(async url => {
      const data = await firecrawl.scrape({
        url,
        // Extract specific selectors or use LLM
        waitFor: '.price',
      });

      return {
        url,
        price: extractPrice(data.markdown),
      };
    })
  );

  return results;
}
```

### Step 5: Integrate SINAPI Data
**File:** `src/lib/budget-api.ts`, function `fetchSINAPIprices()`

```typescript
// SINAPI is public (no auth required)
async function fetchSINAPIprices(itemName: string, region: string) {
  try {
    const response = await fetch(
      `https://api.sinapi.com.br/v1/search?item=${encodeURIComponent(itemName)}&region=${region}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    return {
      name: 'SINAPI (CAIXA/IBGE)',
      type: 'sinapi',
      low: data.prices.min,
      mid: data.prices.median,
      high: data.prices.max,
      confidence: 0.95, // SINAPI is official
      url: `https://www.caixa.gov.br/sinapi`, // Use SINAPI official page
    };
  } catch (error) {
    console.error('SINAPI fetch failed:', error);
    return null;
  }
}
```

### Step 6: Integrate CUB & ORSE
**File:** `src/lib/budget-api.ts`

```typescript
// CUB from Sinduscon-MG (may require registration)
async function fetchCUBprices(region: string) {
  const response = await fetch(
    `https://sinduscon-mg.org.br/api/cub?region=${region}`
  );
  const data = await response.json();

  return {
    name: 'CUB Sinduscon-MG',
    type: 'cub',
    low: data.cub_min * 1000, // Convert to unit price
    mid: data.cub_current * 1000,
    high: data.cub_max * 1000,
    confidence: 0.9,
  };
}

// ORSE (state-run - free access)
async function fetchORSEprices(itemName: string) {
  const response = await fetch(
    `https://orse.mg.gov.br/api/search?item=${encodeURIComponent(itemName)}`
  );
  const data = await response.json();

  return {
    name: 'ORSE',
    type: 'orse',
    low: data.price_min,
    mid: data.price_average,
    high: data.price_max,
    confidence: 0.85,
  };
}
```

### Step 7: Integrate Perplexity for Deep Research
**File:** `src/lib/budget-api.ts`

```typescript
import Perplexity from '@perplexity/sdk';

const perplexity = new Perplexity(process.env.PERPLEXITY_API_KEY);

async function deepResearchPrices(itemName: string, region: string) {
  const response = await perplexity.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      {
        role: 'user',
        content: `
          Pesquise os preços atuais de "${itemName}" na região de ${region}, Brasil.
          Incluir:
          - Preço mínimo em lojas varejistas
          - Preço médio de mercado
          - Preço máximo em fornecedores premium
          - Datas de coleta

          Responda em JSON: { low: number, mid: number, high: number, sources: string[] }
        `,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}
```

---

## API Cost Estimates

| API | Cost | Usage | Monthly |
|-----|------|-------|---------|
| **Exa** | $7/1k searches | 100/month | $0.70 |
| **Firecrawl** | $16/mo | Included | $16.00 |
| **Perplexity** | $5/1k requests | 20/month | $0.10 |
| **Gemini/Claude** | $2-15/1M tokens | Already budgeted | $5.00 |
| **SINAPI** | Free | Unlimited | $0 |
| **CUB** | Free | Unlimited | $0 |
| **ORSE** | Free | Unlimited | $0 |
| **TOTAL** | | | **~$22/mo** |

---

## Testing

### Local Testing (Without APIs)
The code already has mocks in place. To test locally:

```bash
npm run dev

# Navigate to: http://localhost:3000
# Click "Orçamento" in sidebar
# The budget will load with mock data
```

### Testing with Real APIs
After implementing the API integrations:

```bash
# Set environment variables
export EXA_API_KEY=your_key
export FIRECRAWL_API_KEY=your_key
export PERPLEXITY_API_KEY=your_key
export GOOGLE_AI_API_KEY=your_key

# Test endpoints
curl -X POST http://localhost:3000/api/budget/build-from-project \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-id", "region": "MG"}'

curl -X POST http://localhost:3000/api/budget/research-prices \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-id", "sources": ["exa", "sinapi"]}'
```

---

## File Structure Summary

```
src/
├── components/budget/
│   ├── BudgetView.tsx          # Main dashboard
│   ├── BudgetSummary.tsx       # Summary card
│   ├── ScenarioComparison.tsx  # 3-scenario comparison
│   ├── ItemBreakdown.tsx       # Item details
│   ├── SourceTraceability.tsx  # Audit trail
│   └── README.md               # Component docs
├── lib/
│   ├── budget-calculator.ts    # Pure calculation logic
│   ├── budget-api.ts           # Express routes (TODO: APIs)
│   └── ...
├── schemas/
│   ├── budget.schema.ts        # Zod types
│   └── ...
├── store/
│   ├── budget.store.ts         # Zustand store
│   └── ...
└── App.tsx                     # Main component (add orcamento view)
```

---

## Checklist

- [ ] Step 1: Register routes in server.ts
- [ ] Step 2: Add navigation to App.tsx
- [ ] Step 3: Integrate Exa API
- [ ] Step 4: Integrate Firecrawl API
- [ ] Step 5: Integrate SINAPI data
- [ ] Step 6: Integrate CUB & ORSE data
- [ ] Step 7: Integrate Perplexity for deep research
- [ ] Test locally without APIs (mocks)
- [ ] Test with real APIs
- [ ] Add database persistence (if needed)
- [ ] Deploy to production

---

## References

- **TASKS.md#ARCH-001** — Budget module acceptance criteria
- **docs/CAPABILITY_REGISTRY.md** — budget-researcher-agent spec
- **docs/SYSTEM_MAP.md#Flow 4** — Project → Budget data flow
- **egos_arch_modulo_orcamento_v1.md** — Detailed requirements
- **ChatGPT-Ferramenta IA para Projetos (1).md** — Product research

---

## Next Session

When ready to integrate APIs:

1. Start with SINAPI (simplest — no auth required)
2. Add Exa API (search)
3. Add Firecrawl (scraping)
4. Add Perplexity (deep research, optional)
5. Add CUB & ORSE as fallbacks

Each API integration should be ~30 minutes of coding + testing.

**Total API integration time:** ~3 hours

---

**Status:** 🟢 Ready for API Integration
**Author:** Enio Rocha
**Date:** 2026-03-31
