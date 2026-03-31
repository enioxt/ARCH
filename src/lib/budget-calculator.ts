/**
 * Budget Calculator Utilities
 *
 * Core calculation logic for:
 * - Scenario generation (economico/padrao/premium)
 * - Item total calculation
 * - Confidence scoring
 * - Cost normalization
 *
 * This module is API-agnostic. The actual price data
 * will be populated by external APIs (Exa, Firecrawl, SINAPI, etc).
 *
 * Ref: egos_arch_modulo_orcamento_v1.md
 */

import {
  BudgetItem,
  BudgetReport,
  BudgetScenario,
  CostSource,
} from '../schemas/budget.schema';

/**
 * Calculate total cost for a single item across 3 scenarios
 *
 * Formula: quantity × price_unit × waste_factor × regional_factor × complexity_factor
 */
export function calculateItemTotals(
  quantity: number,
  unit: string,
  prices: { low: number; mid: number; high: number },
  wasteFactor: number = 1.05,
  regionalFactor: number = 1.0,
  complexityFactor: number = 1.0
): { low: number; mid: number; high: number } {
  const multiplier = quantity * wasteFactor * regionalFactor * complexityFactor;

  return {
    low: prices.low * multiplier,
    mid: prices.mid * multiplier,
    high: prices.high * multiplier,
  };
}

/**
 * Calculate confidence score for an item based on its sources
 *
 * Rules (from spec):
 * - 0.95+: SINAPI/ORSE/CUB recent + supplier validated
 * - 0.75–0.94: Multiple consistent sources
 * - 0.50–0.74: Single source or partial data
 * - < 0.50: Estimated/inferred
 */
export function calculateConfidenceScore(sources: CostSource[]): number {
  if (sources.length === 0) return 0;

  // Average confidence of all sources, weighted by recency
  const now = new Date();
  const scores = sources.map((source) => {
    const age = now.getTime() - new Date(source.collectedAt).getTime();
    const ageInDays = age / (1000 * 60 * 60 * 24);

    // Decay confidence over time: halved every 30 days
    const recencyDecay = Math.pow(0.5, ageInDays / 30);

    // Official sources (SINAPI, CUB, ORSE) get 10% boost
    const isOfficial = ['sinapi', 'cub', 'orse', 'sicro'].includes(source.type);
    const baseConfidence = source.confidence * (isOfficial ? 1.1 : 1.0);

    return Math.min(1, baseConfidence * recencyDecay);
  });

  // Return weighted average
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Normalize prices from multiple sources
 *
 * For each source, calculates the low/mid/high band
 * and merges them into a unified price point.
 */
export function normalizePrices(sources: CostSource[]): {
  low: number;
  mid: number;
  high: number;
} {
  if (sources.length === 0) {
    return { low: 0, mid: 0, high: 0 };
  }

  const prices = sources.flatMap((source) => {
    // In real usage, source.prices would come from the data structure
    // For now, we'll use a mock approach
    return [
      { low: 100, mid: 120, high: 150 }, // mock
    ];
  });

  // Calculate percentiles across all sources
  const allLows = prices.map((p) => p.low).sort((a, b) => a - b);
  const allMids = prices.map((p) => p.mid).sort((a, b) => a - b);
  const allHighs = prices.map((p) => p.high).sort((a, b) => a - b);

  const percentile25 = (arr: number[]) => arr[Math.floor(arr.length * 0.25)];
  const percentile50 = (arr: number[]) => arr[Math.floor(arr.length * 0.5)];
  const percentile75 = (arr: number[]) => arr[Math.floor(arr.length * 0.75)];

  return {
    low: percentile25(allLows),
    mid: percentile50(allMids),
    high: percentile75(allHighs),
  };
}

/**
 * Extract BOM (Bill of Materials) from project data
 *
 * Returns a list of standard construction items that should be in the budget
 */
export function extractBOMFromProject(
  projectName: string,
  projectArea?: number,
  projectType: string = 'residential'
): Partial<BudgetItem>[] {
  // Standard items for a residential project
  // In real usage, this would be extracted from the actual design/geometry

  const standardItems: Partial<BudgetItem>[] = [
    // Foundation
    {
      category: 'foundation',
      name: 'Concreto fck 30 MPa',
      unit: 'm3',
      quantity: 5, // mock
    },
    {
      category: 'foundation',
      name: 'Aço CA-50',
      unit: 'kg',
      quantity: 800,
    },

    // Structure
    {
      category: 'structure',
      name: 'Bloco cerâmico 14cm',
      unit: 'un',
      quantity: 1000,
    },
    {
      category: 'structure',
      name: 'Argamassa para assentamento',
      unit: 'm3',
      quantity: 3,
    },

    // Roofing
    {
      category: 'roof',
      name: 'Telha cerâmica tipo francesa',
      unit: 'un',
      quantity: 2000,
    },
    {
      category: 'roof',
      name: 'Estrutura madeira para cobertura',
      unit: 'm3',
      quantity: 2,
    },

    // Finishing
    {
      category: 'finish',
      name: 'Reboco/chapisco',
      unit: 'm2',
      quantity: 500,
    },
    {
      category: 'finish',
      name: 'Massa corrida',
      unit: 'l',
      quantity: 100,
    },
    {
      category: 'finish',
      name: 'Tinta acrílica',
      unit: 'l',
      quantity: 50,
    },

    // Electrical
    {
      category: 'electrical',
      name: 'Fio/cabo flexível 2.5mm',
      unit: 'metro',
      quantity: 500,
    },
    {
      category: 'electrical',
      name: 'Disjuntor 20A',
      unit: 'un',
      quantity: 10,
    },

    // Plumbing
    {
      category: 'plumbing',
      name: 'Tubo PVC esgoto 100mm',
      unit: 'metro',
      quantity: 50,
    },
    {
      category: 'plumbing',
      name: 'Cano cobre 1/2"',
      unit: 'metro',
      quantity: 100,
    },

    // Labor (per square meter typical)
    {
      category: 'labor',
      name: 'Pedreiro',
      unit: 'dia',
      quantity: 30,
    },
    {
      category: 'labor',
      name: 'Eletricista',
      unit: 'dia',
      quantity: 10,
    },
    {
      category: 'labor',
      name: 'Encanador',
      unit: 'dia',
      quantity: 10,
    },
  ];

  return standardItems;
}

/**
 * Calculate scenario totals from items
 *
 * Sums all items by category and applies:
 * - Contingency (5-10% of subtotal)
 * - BDI / Overhead markup (15-30%)
 * - Taxes (ICMS, PIS, etc) (5-17% depending on state)
 */
export function calculateScenarioTotals(
  items: BudgetItem[],
  scenario: 'economico' | 'padrao' | 'premium',
  contingencyRate: number = 0.1,
  bdiRate: number = 0.25,
  taxRate: number = 0.17
): BudgetScenario {
  let subtotalMaterials = 0;
  let subtotalLabor = 0;
  let subtotalEquipment = 0;
  let subtotalLogistics = 0;

  // Get the appropriate total for each scenario
  items.forEach((item) => {
    const itemTotal =
      scenario === 'economico'
        ? item.totalLow
        : scenario === 'premium'
        ? item.totalHigh
        : item.totalMid;

    if (item.category === 'labor') {
      subtotalLabor += itemTotal;
    } else if (item.category === 'equipment') {
      subtotalEquipment += itemTotal;
    } else if (item.category === 'logistics') {
      subtotalLogistics += itemTotal;
    } else {
      subtotalMaterials += itemTotal;
    }
  });

  const subtotal = subtotalMaterials + subtotalLabor + subtotalEquipment + subtotalLogistics;
  const contingency = subtotal * contingencyRate;
  const bdi = (subtotal + contingency) * bdiRate;
  const taxes = (subtotal + contingency + bdi) * taxRate;
  const total = subtotal + contingency + bdi + taxes;

  return {
    scenario,
    description: {
      economico: 'Cenário com preços mínimos e materiais básicos',
      padrao: 'Cenário com preços médios e padrão de mercado',
      premium: 'Cenário com preços altos e materiais premium',
    }[scenario],
    subtotalMaterials,
    subtotalLabor,
    subtotalEquipment,
    subtotalLogistics,
    contingency,
    bdi,
    taxes,
    total,
  };
}

/**
 * Generate alerts for budget items
 *
 * Returns warnings like:
 * - Items with low confidence score
 * - Items with missing sources
 * - Outlier prices
 */
export function generateAlerts(budget: BudgetReport): string[] {
  const alerts: string[] = [];

  budget.items.forEach((item) => {
    if (item.confidenceScore < 0.75) {
      alerts.push(
        `⚠️ Item "${item.name}": confiança baixa (${(item.confidenceScore * 100).toFixed(0)}%). Revisão humana recomendada.`
      );
    }

    if (item.sources.length === 0) {
      alerts.push(`⚠️ Item "${item.name}": sem fontes de preço definidas.`);
    }

    // Check for price outliers (>50% difference between low and high)
    const priceDiff = (item.totalHigh - item.totalLow) / item.totalMid;
    if (priceDiff > 0.5) {
      alerts.push(
        `⚠️ Item "${item.name}": grande variação de preço entre cenários (${(priceDiff * 100).toFixed(0)}%).`
      );
    }
  });

  return alerts;
}

/**
 * Format currency for display (BRL)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate percentage difference between scenarios
 */
export function scenarioDifference(
  economico: number,
  padrao: number,
  premium: number
): { ecoToPadrao: number; padroToPremium: number; ecoToPremium: number } {
  return {
    ecoToPadrao: ((padrao - economico) / economico) * 100,
    padroToPremium: ((premium - padrao) / padrao) * 100,
    ecoToPremium: ((premium - economico) / economico) * 100,
  };
}
