/**
 * Budget API Routes
 *
 * Endpoints for the budget module:
 * - POST /api/budget/build-from-project
 * - POST /api/budget/research-prices
 * - POST /api/budget/recalculate
 * - GET /api/budget/:projectId/latest
 * - GET /api/budget/:projectId/versions
 * - POST /api/budget/:projectId/lock
 * - POST /api/budget/:projectId/report
 *
 * These are prepared for API integration:
 * - Exa (price search)
 * - Firecrawl (web scraping)
 * - Perplexity (deep research)
 * - SINAPI/CUB/ORSE (public data)
 *
 * Ref: CAPABILITY_REGISTRY.md, SYSTEM_MAP.md, TASKS.md#ARCH-001
 */

import { Express, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  BudgetReport,
  BudgetItem,
  CostSource,
  PricePoint,
  BuildBudgetRequest,
  ResearchPricesRequest,
} from '../schemas/budget.schema';
import {
  calculateItemTotals,
  calculateConfidenceScore,
  extractBOMFromProject,
  calculateScenarioTotals,
  generateAlerts,
  formatBRL,
  scenarioDifference,
} from './budget-calculator';
import { logger } from '../telemetry/logger';

/**
 * MOCK DATA SOURCES (will be replaced by real APIs)
 *
 * In production:
 * - sinapiClient: Fetch from CAIXA SINAPI API
 * - cubClient: Fetch from Sinduscon-MG CUB API
 * - orseClient: Fetch from ORSE database
 * - exaSearch: Exa API for market price discovery
 * - firecrawl: Firecrawl for supplier website scraping
 * - perplexity: Perplexity for deep research
 */

interface PriceSource {
  name: string;
  type: 'sinapi' | 'cub' | 'orse' | 'supplier' | 'retail';
  low: number;
  mid: number;
  high: number;
  url?: string;
  confidence: number;
}

/**
 * Fetch prices from SINAPI API (REAL INTEGRATION)
 *
 * Endpoints:
 * - POST /busca - Full-text search
 * - GET /preco?codigo=...&uf=... - Exact code lookup
 *
 * API URL: http://204.168.217.125:8008 (production VPS)
 */
async function fetchSINAPIprices(itemName: string, region: string): Promise<PriceSource | null> {
  const SINAPI_API_URL = process.env.SINAPI_API_URL || 'http://204.168.217.125:8008';

  try {
    // Use full-text search endpoint
    const response = await fetch(`${SINAPI_API_URL}/busca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: itemName,
        uf: region || 'BR', // Default to national prices
        limit: 1, // We only need the best match
      }),
    });

    if (!response.ok) {
      logger.warn('SINAPI API error', { status: response.status, item: itemName });
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      logger.info('SINAPI: No results found', { item: itemName, region });
      return null;
    }

    // Get the first (best) result
    const result = data.results[0];

    // Calculate confidence based on data age
    const dataReferencia = new Date(result.data_referencia);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - dataReferencia.getTime()) / (1000 * 60 * 60 * 24));

    let confidence = 0.95; // Start high for SINAPI (official source)
    if (daysDiff > 30) confidence = 0.85;
    if (daysDiff > 90) confidence = 0.70;
    if (daysDiff > 180) confidence = 0.55;

    // SINAPI provides single price, we estimate low/high as ±15%
    const midPrice = parseFloat(result.preco_atual);
    const lowPrice = midPrice * 0.85;
    const highPrice = midPrice * 1.15;

    return {
      name: `SINAPI (${result.tabela_origem})`,
      type: 'sinapi',
      low: lowPrice,
      mid: midPrice,
      high: highPrice,
      url: `${SINAPI_API_URL}/preco?codigo=${result.codigo}&uf=${result.uf}`,
      confidence,
    };
  } catch (error) {
    logger.error('SINAPI API fetch failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      item: itemName,
    });
    return null;
  }
}

/**
 * Fetch prices from Brave Search API + Firecrawl
 *
 * Workflow:
 * 1. Search via Brave API: https://api.search.brave.com/res/v1/web/search
 * 2. Extract prices via Firecrawl: https://api.firecrawl.dev/v0/scrape
 *
 * API Keys:
 * - process.env.BRAVE_API_KEY (X-Subscription-Token header)
 * - process.env.FIRECRAWL_API_KEY (Authorization Bearer token)
 */
async function fetchRetailPrices(itemName: string, region: string): Promise<PriceSource | null> {
  // STEP 1: Search with Brave API
  // const braveKey = process.env.BRAVE_API_KEY;
  // if (!braveKey) throw new Error('BRAVE_API_KEY not set');
  //
  // const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(itemName)} preço ${region}`, {
  //   headers: {
  //     'Accept': 'application/json',
  //     'X-Subscription-Token': braveKey,
  //   },
  // });
  // const searchResults = await searchResponse.json();
  // const urls = searchResults.results?.slice(0, 5).map((r: any) => r.url) || [];
  //
  // STEP 2: Scrape prices with Firecrawl
  // const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  // if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not set');
  //
  // const scrapedData = await Promise.all(
  //   urls.map(url =>
  //     fetch('https://api.firecrawl.dev/v0/scrape', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${firecrawlKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         url,
  //         formats: ['markdown', 'html'],
  //         onlyMainContent: true,
  //       }),
  //     }).then(r => r.json())
  //   )
  // );
  //
  // STEP 3: Parse prices from Firecrawl markdown output
  // const prices = scrapedData
  //   .map(data => {
  //     const text = data.markdown || '';
  //     // Use regex to extract price patterns (R$ XX,XX or similar)
  //     const priceMatches = text.match(/R\$\s*[\d.,]+/g) || [];
  //     return priceMatches.map(p => parseFloat(p.replace('R$', '').replace('.', '').replace(',', '.')));
  //   })
  //   .flat()
  //   .filter(p => p > 0);
  //
  // STEP 4: Aggregate and return
  // if (prices.length === 0) return null;
  // return {
  //   name: `Market Average (${region})`,
  //   type: 'retail',
  //   low: Math.min(...prices),
  //   mid: prices[Math.floor(prices.length / 2)],
  //   high: Math.max(...prices),
  //   url: urls[0],
  //   confidence: 0.75,
  // };

  // MOCK ONLY - Remove in production
  const mockPrices: Record<string, PriceSource> = {
    'Concreto fck 30 MPa': {
      name: 'Market Average (Leroy Merlin, C&C, Telhanorte)',
      type: 'retail',
      low: 480,
      mid: 550,
      high: 620,
      confidence: 0.75,
    },
    'Bloco cerâmico 14cm': {
      name: 'Market Average (Local suppliers)',
      type: 'retail',
      low: 1.3,
      mid: 1.6,
      high: 2.2,
      confidence: 0.7,
    },
  };

  return mockPrices[itemName] || null;
}

/**
 * MOCK: Fetch prices from CUB (Sinduscon-MG)
 */
async function fetchCUBprices(region: string): Promise<PriceSource | null> {
  // TODO: Real CUB API integration
  // const cub = await cubClient.getLatestCUB(region);

  // MOCK ONLY
  return {
    name: 'CUB Sinduscon-MG',
    type: 'cub',
    low: 8500, // per m2
    mid: 9200,
    high: 10000,
    confidence: 0.9,
  };
}

/**
 * Build initial budget from project data
 * POST /api/budget/build-from-project
 */
export async function buildBudgetFromProject(
  req: Request<{}, {}, BuildBudgetRequest>,
  res: Response
) {
  try {
    const { projectId, region = 'MG', scenario = 'padrao' } = req.body;
    const startTime = Date.now();

    // Extract BOM from project (mock - will use vision extraction)
    const bomItems = extractBOMFromProject('Hexagonal House', 200, 'residential');

    // Create budget items with placeholders for prices
    const items: BudgetItem[] = bomItems.map((bomItem) => ({
      id: uuidv4(),
      category: bomItem.category as any,
      name: bomItem.name || 'Item',
      description: `Item para projeto (preço pendente)`,
      quantity: bomItem.quantity || 1,
      unit: bomItem.unit || 'un',
      wasteFactor: 1.05,
      regionalFactor: 1.0,
      complexityFactor: 1.0,
      sources: [],
      prices: [],
      chosenScenario: scenario as any,
      totalLow: 0,
      totalMid: 0,
      totalHigh: 0,
      confidenceScore: 0,
      assumptions: ['Preços pendentes de pesquisa (Exa, Firecrawl, SINAPI)'],
      lastUpdated: new Date().toISOString(),
    }));

    // Create budget report
    const budgetReport: BudgetReport = {
      id: uuidv4(),
      projectId,
      projectName: 'Project Name',
      version: '1.0.0',
      region,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenarios: [
        calculateScenarioTotals(items, 'economico'),
        calculateScenarioTotals(items, 'padrao'),
        calculateScenarioTotals(items, 'premium'),
      ],
      items,
      methodology: [
        'BOM extraction from project geometry',
        'Awaiting: Exa, Firecrawl, SINAPI, CUB, ORSE APIs',
      ],
      alerts: [
        '⚠️ Preços ainda não pesquisados. Execute /api/budget/research-prices para atualizar.',
        ...generateAlerts({
          id: '',
          projectId,
          projectName: '',
          version: '',
          region,
          generatedAt: '',
          updatedAt: '',
          scenarios: [],
          items,
          methodology: [],
          alerts: [],
          assumptions: {},
          status: 'draft',
        }),
      ],
      assumptions: {
        wasteFactor: '5% (standard construction waste)',
        contingency: '10% (contingency reserve)',
        bdi: '25% (overhead + risk)',
        tax: '17% (regional ICMS + PIS)',
      },
      status: 'draft',
    };

    const latency = Date.now() - startTime;

    logger.log({
      eventName: 'budget_research_started',
      projectId,
      itemCount: items.length,
      latencyMs: latency,
    });

    res.json({
      success: true,
      data: budgetReport,
      cost: 0, // APIs not called yet
    });
  } catch (error: any) {
    logger.log({
      eventName: 'budget_error',
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to build budget',
    });
  }
}

/**
 * Research prices for budget items
 * POST /api/budget/research-prices
 *
 * Calls external APIs:
 * - Exa for search
 * - Firecrawl for scraping
 * - Perplexity for deep research
 * - SINAPI/CUB/ORSE for official data
 */
export async function researchPrices(
  req: Request<{}, {}, ResearchPricesRequest>,
  res: Response
) {
  try {
    const { projectId, itemIds, sources = ['sinapi', 'cub', 'retail'] } = req.body;
    const startTime = Date.now();

    let totalCost = 0;
    const results: Record<string, PriceSource[]> = {};

    // MOCK: Fetch prices for each item
    for (const source of sources) {
      if (source === 'sinapi') {
        // TODO: Real SINAPI integration
        // MOCK ONLY
        results['Concreto fck 30 MPa'] = [
          await fetchSINAPIprices('Concreto fck 30 MPa', 'MG'),
        ].filter(Boolean) as PriceSource[];
        totalCost += 0.05; // Mock API cost
      } else if (source === 'retail') {
        // TODO: Real Exa + Firecrawl integration
        // const exaResults = await exa.search(itemName);
        // const prices = await firecrawl.extractPrices(exaResults);
        // MOCK ONLY
        results['Concreto fck 30 MPa'] = [
          ...(results['Concreto fck 30 MPa'] || []),
          await fetchRetailPrices('Concreto fck 30 MPa', 'MG'),
        ].filter(Boolean) as PriceSource[];
        totalCost += 0.07; // Mock Exa cost per search
      } else if (source === 'cub') {
        // TODO: Real CUB integration
        // MOCK ONLY
        totalCost += 0.02;
      }
    }

    const latency = Date.now() - startTime;

    logger.log({
      eventName: 'budget_source_fetched',
      projectId,
      sourcesQueried: sources,
      itemsUpdated: Object.keys(results).length,
      latencyMs: latency,
      costUsd: totalCost,
    });

    res.json({
      success: true,
      data: {
        projectId,
        itemsUpdated: Object.keys(results).length,
        prices: results,
        sources: sources,
      },
      cost: totalCost,
      latency,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to research prices',
    });
  }
}

/**
 * Recalculate budget scenarios
 * POST /api/budget/recalculate
 */
export async function recalculateBudget(req: Request, res: Response) {
  try {
    const { projectId } = req.body;

    // In real usage, would fetch budget from database
    // then recalculate all scenarios with current item prices

    res.json({
      success: true,
      message: `Budget for project ${projectId} recalculated`,
      // Return updated budget...
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get latest budget
 * GET /api/budget/:projectId/latest
 */
export async function getLatestBudget(req: Request<{ projectId: string }>, res: Response) {
  try {
    const { projectId } = req.params;

    // TODO: Fetch from database
    // const budget = await db.budgets.findLatest(projectId);

    res.json({
      success: true,
      data: {
        projectId,
        // budget data...
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get budget versions
 * GET /api/budget/:projectId/versions
 */
export async function getBudgetVersions(req: Request<{ projectId: string }>, res: Response) {
  try {
    const { projectId } = req.params;

    // TODO: Fetch from database
    // const versions = await db.budgets.getVersions(projectId);

    res.json({
      success: true,
      data: {
        projectId,
        versions: [],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Lock budget
 * POST /api/budget/:projectId/lock
 */
export async function lockBudget(req: Request<{ projectId: string }>, res: Response) {
  try {
    const { projectId } = req.params;
    const { lockedBy, notes } = req.body;

    logger.log({
      eventName: 'budget_locked',
      projectId,
      lockedBy,
      notes,
    });

    res.json({
      success: true,
      message: `Budget locked`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Generate budget report
 * POST /api/budget/:projectId/report
 *
 * Generates a narrative report with:
 * - Executive summary
 * - Item breakdown
 * - Scenario comparison
 * - Source attribution
 * - Confidence scores
 * - Recommendations
 */
export async function generateBudgetReport(
  req: Request<{ projectId: string }>,
  res: Response
) {
  try {
    const { projectId } = req.params;

    // TODO: Generate from actual budget data

    const report = {
      projectId,
      title: 'Orçamento de Obra — Relatório Executivo',
      generatedAt: new Date().toISOString(),
      sections: [
        {
          title: 'Sumário Executivo',
          content: `Orçamento preparado para o projeto no valor de R$ XX a R$ XX mil.`,
        },
        {
          title: 'Cenários',
          content: `
            - Econômico: R$ X
            - Padrão: R$ Y
            - Premium: R$ Z
          `,
        },
        {
          title: 'Metodologia',
          content: 'Baseado em SINAPI + pesquisa de mercado regional',
        },
      ],
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Register budget routes on Express app
 */
export function registerBudgetRoutes(app: Express) {
  // Budget routes
  app.post('/api/budget/build-from-project', buildBudgetFromProject);
  app.post('/api/budget/research-prices', researchPrices);
  app.post('/api/budget/recalculate', recalculateBudget);
  app.get('/api/budget/:projectId/latest', getLatestBudget);
  app.get('/api/budget/:projectId/versions', getBudgetVersions);
  app.post('/api/budget/:projectId/lock', lockBudget);
  app.post('/api/budget/:projectId/report', generateBudgetReport);
}
