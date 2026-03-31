# Budget Module Components

## Overview

Complete budget/cost estimation module with:
- 3 scenarios (economico/padrão/premium)
- Source traceability
- Confidence scoring
- BOM extraction from projects
- API integration ready (Exa, Firecrawl, Perplexity, SINAPI, CUB, ORSE)

## Components

### BudgetView (Main)
Entry point for the budget dashboard. Handles:
- Budget initialization
- Scenario switching
- Item management
- Version control

**Props:** None (uses stores)

**Usage:**
```tsx
import BudgetView from '@/components/budget/BudgetView';

<BudgetView />
```

### BudgetSummary
Displays executive summary with:
- Category breakdown (materials, labor, equipment, logistics)
- Contingency & BDI calculation
- Methodology used
- Key assumptions

**Props:**
```tsx
interface BudgetSummaryProps {
  budget: BudgetReport;
}
```

### ScenarioComparison
Side-by-side comparison of all 3 scenarios with:
- Visual bar charts
- Percentage differences
- Category breakdown
- Recommendations

**Props:**
```tsx
interface ScenarioComparisonProps {
  budget: BudgetReport;
}
```

### ItemBreakdown
Expandable list of all budget items with:
- Quantity & unit
- Low/mid/high price scenarios
- Confidence scores
- Source attribution
- Adjustment factors (waste, regional, complexity)

**Props:**
```tsx
interface ItemBreakdownProps {
  budget: BudgetReport;
}
```

### SourceTraceability
Complete audit trail showing:
- All data sources used
- Collection dates
- Confidence per source
- External links
- Methodology notes
- Change history

**Props:**
```tsx
interface SourceTraceabilityProps {
  budget: BudgetReport;
}
```

## Stores Used

### useBudgetStore
Zustand store for budget state:
```tsx
const { budgets, getBudget, createBudget, addItem, updateItem, recalculateScenarios, lockBudget } = useBudgetStore();
```

**Key methods:**
- `createBudget(projectId, name, region)` - Initialize budget
- `addItem(projectId, item)` - Add budget item
- `updateItem(projectId, itemId, updates)` - Update item
- `recalculateScenarios(projectId)` - Recalculate all scenarios
- `lockBudget(projectId, lockedBy)` - Finalize budget

### useProjectStore
Get current project:
```tsx
const { project } = useProjectStore();
```

## Utilities

### budget-calculator.ts
Core calculation functions:
- `calculateItemTotals()` - Item cost across scenarios
- `calculateConfidenceScore()` - Confidence from sources
- `extractBOMFromProject()` - BOM from project data
- `calculateScenarioTotals()` - Scenario aggregation
- `generateAlerts()` - Quality warnings
- `formatBRL()` - Currency formatting

### budget-api.ts
API endpoints (ready for integration):
- `POST /api/budget/build-from-project` - Initialize
- `POST /api/budget/research-prices` - Fetch prices (Exa, Firecrawl, SINAPI)
- `POST /api/budget/recalculate` - Recalculate scenarios
- `GET /api/budget/:projectId/latest` - Get current
- `GET /api/budget/:projectId/versions` - Version history
- `POST /api/budget/:projectId/lock` - Finalize
- `POST /api/budget/:projectId/report` - Generate narrative report

## Integration Steps

### 1. Add to App.tsx
```tsx
import BudgetView from './components/budget/BudgetView';

// In ViewType union:
type ViewType = '...' | 'orcamento';

// In navItems:
{ id: 'orcamento', label: 'Orçamento', icon: DollarSign }

// In switch/render:
{currentView === 'orcamento' && <BudgetView />}
```

### 2. Register API routes in server.ts
```typescript
import { registerBudgetRoutes } from './src/lib/budget-api.js';

// After other routes:
registerBudgetRoutes(app);
```

### 3. Add to project store
Budget integration happens automatically through `useBudgetStore`.

## Data Flow

```
Project
  ↓
BudgetView (initializes budget)
  ↓
useBudgetStore (state management)
  ↓
budget-calculator (business logic)
  ↓
UI Components (BudgetSummary, ItemBreakdown, etc)
```

## API Integration (To be implemented)

### Exa Integration
```typescript
// In budget-api.ts:
import Exa from 'exa-js';
const exa = new Exa(process.env.EXA_API_KEY);

async function searchPrices(itemName: string, region: string) {
  const results = await exa.search(itemName, { numResults: 5 });
  // Process results...
}
```

### Firecrawl Integration
```typescript
import Firecrawl from '@firecrawl/js';
const fc = new Firecrawl(process.env.FIRECRAWL_API_KEY);

async function extractPrices(urls: string[]) {
  const results = await Promise.all(
    urls.map(url => fc.scrape({ url }))
  );
  // Extract prices...
}
```

### SINAPI Integration
```typescript
// SINAPI is public (no auth required)
async function fetchSINAPI(itemName: string, region: string) {
  const response = await fetch(
    `https://api.caixa.gov.br/sinapi/v1/search?item=${itemName}&region=${region}`
  );
  const data = await response.json();
  return parseSINAPIResponse(data);
}
```

### Perplexity Integration
```typescript
import Perplexity from '@perplexity/sdk';
const pp = new Perplexity(process.env.PERPLEXITY_API_KEY);

async function deepResearch(itemName: string) {
  const response = await pp.chat.completions.create({
    model: 'sonar-pro',
    messages: [
      { role: 'user', content: `Pesquisa de preço para ${itemName}...` }
    ]
  });
  // Parse response...
}
```

## Telemetry Events

All budget actions emit telemetry:
```
budget_research_started
budget_source_fetched
budget_item_normalized
budget_scenario_recalculated
budget_report_generated
budget_manual_override
budget_locked
```

See `src/schemas/budget.schema.ts` for full event schemas.

## Next Steps

1. ✅ Schemas & validation (Zod)
2. ✅ Store management (Zustand)
3. ✅ Calculation logic (business rules)
4. ✅ UI components (React)
5. ⏳ API endpoints (Express routes with mocks)
6. ⏳ API integrations (Exa, Firecrawl, Perplexity, SINAPI, CUB, ORSE)
7. ⏳ Database persistence (PostgreSQL)
8. ⏳ Export functionality (PDF, CSV, Excel)
9. ⏳ Multi-user collaboration (WebSocket sync)
10. ⏳ Historical tracking & diffs

## References

- **TASKS.md#ARCH-001** — Budget module spec
- **docs/CAPABILITY_REGISTRY.md** — budget-researcher-agent
- **docs/SYSTEM_MAP.md** — Flow 4: Project → Budget
- **egos_arch_modulo_orcamento_v1.md** — Detailed requirements

## Author

Enio Rocha (@enioxt)

## Status

🟡 **In Development** — Core code ready, APIs pending
