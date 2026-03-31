import { z } from 'zod';

/**
 * Budget Module Schemas — EGOS ARCH
 *
 * Complete type definitions for cost estimation with 3 scenarios,
 * source traceability, and confidence scoring.
 *
 * Ref: docs/CAPABILITY_REGISTRY.md, egos_arch_modulo_orcamento_v1.md
 */

// ============================================================================
// COST SOURCES
// ============================================================================

export const CostSourceSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'sinapi',      // CAIXA/IBGE official
    'cub',         // CUB Sinduscon-MG regional index
    'orse',        // ORSE composition library
    'sicro',       // DNIT infrastructure reference
    'supplier',    // Direct supplier quote
    'retail',      // Retail store (Leroy Merlin, Telhanorte, etc)
    'internal',    // User's own historical data
  ]),
  name: z.string(),                    // Source display name
  url: z.string().url().optional(),    // Link to source (for retail/suppliers)
  region: z.string().optional(),       // State code (MG, SP, etc)
  collectedAt: z.string().datetime(),  // When data was collected
  confidence: z.number().min(0).max(1), // 0-1 confidence in this source
});

export type CostSource = z.infer<typeof CostSourceSchema>;

// ============================================================================
// PRICE POINTS
// ============================================================================

export const PricePointSchema = z.object({
  sourceId: z.string().uuid(),
  unit: z.string(), // m, m2, m3, kg, un, etc
  currency: z.literal('BRL'),
  low: z.number().positive(),    // Minimum price observed
  mid: z.number().positive(),    // Typical/median price
  high: z.number().positive(),   // Maximum price observed
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

export type PricePoint = z.infer<typeof PricePointSchema>;

// ============================================================================
// BUDGET ITEMS
// ============================================================================

export const BudgetItemSchema = z.object({
  id: z.string().uuid(),

  // Item identification
  category: z.enum([
    'foundation',
    'structure',
    'roof',
    'wall',
    'finish',
    'electrical',
    'plumbing',
    'hvac',
    'solar',
    'appliances',
    'labor',
    'equipment',
    'logistics',
    'contingency',
    'other'
  ]),
  name: z.string(),                     // e.g., "Concreto fck 30 MPa"
  description: z.string().optional(),   // e.g., "Para fundação tipo radier"

  // Quantity & factors
  quantity: z.number().positive(),
  unit: z.string(),                     // m3, kg, m2, etc
  wasteFactor: z.number().min(1).default(1.05),      // 5% waste typical
  regionalFactor: z.number().min(0.8).max(1.3).default(1), // Regional adjustment
  complexityFactor: z.number().min(0.8).max(1.5).default(1), // Task complexity

  // Pricing
  sources: z.array(CostSourceSchema),
  prices: z.array(PricePointSchema),
  chosenScenario: z.enum(['low', 'mid', 'high']),

  // Calculated totals
  totalLow: z.number().nonnegative(),
  totalMid: z.number().nonnegative(),
  totalHigh: z.number().nonnegative(),

  // Quality metrics
  confidenceScore: z.number().min(0).max(1),

  // Audit trail
  assumptions: z.array(z.string()),
  lastUpdated: z.string().datetime(),
});

export type BudgetItem = z.infer<typeof BudgetItemSchema>;

// ============================================================================
// BUDGET SCENARIOS
// ============================================================================

export const BudgetScenarioSchema = z.object({
  scenario: z.enum(['economico', 'padrao', 'premium']),
  description: z.string(),

  // Subtotals by category
  subtotalMaterials: z.number().nonnegative(),
  subtotalLabor: z.number().nonnegative(),
  subtotalEquipment: z.number().nonnegative(),
  subtotalLogistics: z.number().nonnegative(),

  // Adjustments
  contingency: z.number().nonnegative(),           // Contingency reserve (usually 5-10%)
  bdi: z.number().nonnegative(),                  // Overhead + risk markup
  taxes: z.number().nonnegative(),                // Taxes/fees

  // Final
  total: z.number().nonnegative(),
});

export type BudgetScenario = z.infer<typeof BudgetScenarioSchema>;

// ============================================================================
// FULL BUDGET REPORT
// ============================================================================

export const BudgetReportSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  projectName: z.string(),
  version: z.string(), // e.g., "1.0.0", "1.0.1"
  region: z.string(),  // e.g., "MG"

  // Metadata
  generatedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Core data
  scenarios: z.array(BudgetScenarioSchema).length(3), // Always 3: eco, std, prem
  items: z.array(BudgetItemSchema),

  // Methodology & transparency
  methodology: z.array(z.string()), // e.g., "SINAPI v4.2.0 + market research"
  alerts: z.array(z.string()),      // e.g., "Item X confidence < 0.75"
  assumptions: z.record(z.string(), z.string()), // Global assumptions

  // Status
  status: z.enum(['draft', 'validated', 'locked']),
  lockedAt: z.string().datetime().optional(),
  lockedBy: z.string().optional(),
});

export type BudgetReport = z.infer<typeof BudgetReportSchema>;

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

/**
 * POST /api/budget/build-from-project
 * Generate initial budget from project data
 */
export const BuildBudgetRequestSchema = z.object({
  projectId: z.string().uuid(),
  region: z.string().default('MG'),
  scenario: z.enum(['economico', 'padrao', 'premium']).optional(),
});

export type BuildBudgetRequest = z.infer<typeof BuildBudgetRequestSchema>;

/**
 * POST /api/budget/research-prices
 * Fetch and update prices for specific items
 */
export const ResearchPricesRequestSchema = z.object({
  projectId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).optional(), // null = all items
  sources: z.array(z.enum([
    'sinapi', 'cub', 'orse', 'sicro', 'supplier', 'retail', 'internal'
  ])).optional(),
});

export type ResearchPricesRequest = z.infer<typeof ResearchPricesRequestSchema>;

/**
 * POST /api/budget/recalculate
 * Recalculate scenarios with current item prices
 */
export const RecalculateBudgetRequestSchema = z.object({
  projectId: z.string().uuid(),
  versionId: z.string().uuid().optional(),
});

export type RecalculateBudgetRequest = z.infer<typeof RecalculateBudgetRequestSchema>;

/**
 * POST /api/budget/:projectId/lock
 * Lock budget version (finalize for approval)
 */
export const LockBudgetRequestSchema = z.object({
  lockedBy: z.string().email().optional(),
  notes: z.string().optional(),
});

export type LockBudgetRequest = z.infer<typeof LockBudgetRequestSchema>;

/**
 * GET /api/budget/:projectId/versions
 * List all budget versions for a project
 */
export const BudgetVersionListSchema = z.array(
  z.object({
    id: z.string().uuid(),
    version: z.string(),
    createdAt: z.string().datetime(),
    status: z.enum(['draft', 'validated', 'locked']),
    total: z.object({
      economico: z.number(),
      padrao: z.number(),
      premium: z.number(),
    }),
  })
);

export type BudgetVersionList = z.infer<typeof BudgetVersionListSchema>;

// ============================================================================
// TELEMETRY EVENTS
// ============================================================================

export const BudgetTelemetryEventSchema = z.union([
  z.object({
    type: z.literal('budget_research_started'),
    projectId: z.string().uuid(),
    itemCount: z.number(),
  }),
  z.object({
    type: z.literal('budget_source_fetched'),
    projectId: z.string().uuid(),
    source: z.enum(['sinapi', 'cub', 'orse', 'sicro', 'supplier', 'retail', 'internal']),
    itemsFetched: z.number(),
    latencyMs: z.number(),
    costUsd: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('budget_item_normalized'),
    projectId: z.string().uuid(),
    itemId: z.string().uuid(),
    confidence: z.number().min(0).max(1),
  }),
  z.object({
    type: z.literal('budget_scenario_recalculated'),
    projectId: z.string().uuid(),
    scenario: z.enum(['economico', 'padrao', 'premium']),
    total: z.number(),
  }),
  z.object({
    type: z.literal('budget_report_generated'),
    projectId: z.string().uuid(),
    itemCount: z.number(),
    totalEconomico: z.number(),
    totalPadrao: z.number(),
    totalPremium: z.number(),
    latencyMs: z.number(),
    costUsd: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('budget_manual_override'),
    projectId: z.string().uuid(),
    itemId: z.string().uuid(),
    oldValue: z.number(),
    newValue: z.number(),
    reason: z.string(),
  }),
  z.object({
    type: z.literal('budget_locked'),
    projectId: z.string().uuid(),
    version: z.string(),
    lockedBy: z.string(),
  }),
]);

export type BudgetTelemetryEvent = z.infer<typeof BudgetTelemetryEventSchema>;
