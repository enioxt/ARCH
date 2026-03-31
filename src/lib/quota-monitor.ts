/**
 * Quota Monitor System
 *
 * Controla e monitora cotas de uso de todas as APIs
 * - Rastreia requisições por API
 * - Alerta quando próximo ao limite
 * - Bloqueia requisições quando exceder quota
 * - Log estruturado de uso
 *
 * Ref: DIAGNOSTIC_FULL_2026-03-31.md, API_QUOTAS.md
 */

import { logger } from '../telemetry/logger';

/**
 * Configuração de quotas por API
 * Formato: { requestsUsed, requestsLimit, resetDate, costUsed, costLimit }
 */
export const API_QUOTAS = {
  // ===== SEARCH APIs =====
  gemini: {
    name: 'Google Gemini',
    tier: 'free',
    requestsPerDay: 60,  // 60 req/min = 86.400/day, but practical limit 60/day for MVP
    requestsPerMonth: 2_000_000,  // tokens, not requests
    costPerRequest: 0,
    monthlyBudgetUSD: 0,
    resetTime: 'daily',  // 00:00 UTC
    description: 'Vision extraction + multimodal AI',
  },

  // Tavily: Advanced search + web context
  tavily: {
    name: 'Tavily AI',
    tier: 'dev',
    requestsPerDay: 100,  // dev tier: 100 searches/day free
    requestsPerMonth: 3_000,  // ~100/day × 30 days
    costPerRequest: 0,
    monthlyBudgetUSD: 0,  // free dev tier
    resetTime: 'daily',
    description: 'Advanced search + research',
  },

  // Exa: Agentic search
  exa: {
    name: 'Exa AI',
    tier: 'free_trial',
    requestsPerDay: 1000,  // estimated from free tier
    requestsPerMonth: 30_000,
    costPerRequest: 0.007,  // $7/1000
    monthlyBudgetUSD: 50,  // safety limit
    resetTime: 'monthly',
    description: 'Neural search for price discovery',
  },

  // Brave Search: Fallback search
  brave: {
    name: 'Brave Search API',
    tier: 'pay_as_you_go',
    requestsPerDay: 10_000,  // limit set by us
    requestsPerMonth: 300_000,
    costPerRequest: 0.005,  // $5/1000
    monthlyBudgetUSD: 50,  // safety limit
    resetTime: 'monthly',
    description: 'Fallback search provider',
  },

  // ===== SCRAPING =====
  firecrawl: {
    name: 'Firecrawl',
    tier: 'starter',
    requestsPerDay: 100,  // 3000/month = ~100/day
    requestsPerMonth: 3_000,
    costPerRequest: 0.0053,  // $16/month ÷ 3000
    monthlyBudgetUSD: 16,  // $16/month plan
    resetTime: 'monthly',
    description: 'Web scraping for supplier prices',
  },

  // ===== GENERATION =====
  falAI: {
    name: 'fal.ai',
    tier: 'paid',
    requestsPerDay: 100,  // safety limit
    requestsPerMonth: 3_000,
    costPerRequest: 0.10,  // average: $0.05-0.30 per generation
    monthlyBudgetUSD: 200,  // free trial $20 + estimated spend
    resetTime: 'monthly',
    description: 'Image + video generation (Flux, Luma, Recraft)',
  },

  togetherAI: {
    name: 'Together AI',
    tier: 'free',
    requestsPerDay: 1000,
    requestsPerMonth: 30_000,
    costPerRequest: 0,
    monthlyBudgetUSD: 0,
    resetTime: 'monthly',
    description: 'SDXL + Flux Schnell (free)',
  },

  // ===== AI/LLM =====
  openrouter: {
    name: 'OpenRouter',
    tier: 'pay_as_you_go',
    requestsPerDay: 1000,
    requestsPerMonth: 30_000,
    costPerRequest: 0.0001,  // varies by model, ~$0.0001-0.001
    monthlyBudgetUSD: 100,  // trial + safety
    resetTime: 'monthly',
    description: 'Multi-provider AI router (Claude, Perplexity, etc)',
  },

  openai: {
    name: 'OpenAI API',
    tier: 'free_trial',
    requestsPerDay: 100,
    requestsPerMonth: 3_000,
    costPerRequest: 0.0001,  // varies by model
    monthlyBudgetUSD: 0,
    resetTime: 'monthly',
    description: 'GPT-4 Turbo (fallback)',
  },

  anthropic: {
    name: 'Anthropic Claude',
    tier: 'free_trial',
    requestsPerDay: 100,
    requestsPerMonth: 3_000,
    costPerRequest: 0,
    monthlyBudgetUSD: 0,
    resetTime: 'monthly',
    description: 'Claude API (fallback)',
  },
};

/**
 * Runtime quota tracking (in-memory + logs)
 * Structure: { [apiName]: { used, limit, alerts, lastReset } }
 */
export const quotaState: Record<
  string,
  {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    costUsed: number;
    costLimit: number;
    lastReset: Date;
    alerts: string[];
  }
> = {};

/**
 * Initialize quota tracking for all APIs
 */
export function initializeQuotas() {
  Object.entries(API_QUOTAS).forEach(([apiName, config]) => {
    quotaState[apiName] = {
      dailyUsed: 0,
      dailyLimit: config.requestsPerDay,
      monthlyUsed: 0,
      monthlyLimit: config.requestsPerMonth,
      costUsed: 0,
      costLimit: config.monthlyBudgetUSD,
      lastReset: new Date(),
      alerts: [],
    };
  });

  logger.log({
    eventName: 'quota_monitor_initialized',
    apisTracked: Object.keys(API_QUOTAS).length,
  });
}

/**
 * Log API usage and check quotas
 *
 * @param apiName - API identifier (must match API_QUOTAS key)
 * @param usage - Object with requestCount, costUSD, metadata
 * @returns { allowed: boolean, alerts: string[] }
 */
export function logAPIUsage(
  apiName: string,
  usage: {
    requestCount?: number;
    costUSD?: number;
    itemQueried?: string;
    latencyMs?: number;
    status: 'success' | 'error';
    metadata?: Record<string, any>;
  }
): { allowed: boolean; alerts: string[] } {
  if (!API_QUOTAS[apiName]) {
    logger.log({
      eventName: 'quota_error',
      error: `Unknown API: ${apiName}`,
    });
    return { allowed: false, alerts: [`Unknown API: ${apiName}`] };
  }

  const config = API_QUOTAS[apiName];
  const state = quotaState[apiName];
  const alerts: string[] = [];

  // Update counters
  const requestCount = usage.requestCount || 1;
  const costUSD = usage.costUSD || requestCount * config.costPerRequest;

  state.dailyUsed += requestCount;
  state.monthlyUsed += requestCount;
  state.costUsed += costUSD;

  // Check daily quota
  if (state.dailyUsed > state.dailyLimit) {
    alerts.push(
      `⚠️ DAILY QUOTA EXCEEDED: ${state.dailyUsed}/${state.dailyLimit} requests`
    );
  } else if (state.dailyUsed > state.dailyLimit * 0.9) {
    alerts.push(
      `🟡 DAILY QUOTA WARNING: ${state.dailyUsed}/${state.dailyLimit} (90%)`
    );
  }

  // Check monthly quota
  if (state.monthlyUsed > state.monthlyLimit) {
    alerts.push(
      `⚠️ MONTHLY QUOTA EXCEEDED: ${state.monthlyUsed}/${state.monthlyLimit} requests`
    );
  } else if (state.monthlyUsed > state.monthlyLimit * 0.9) {
    alerts.push(
      `🟡 MONTHLY QUOTA WARNING: ${state.monthlyUsed}/${state.monthlyLimit} (90%)`
    );
  }

  // Check cost budget
  if (state.costUsed > state.costLimit) {
    alerts.push(
      `⚠️ COST BUDGET EXCEEDED: $${state.costUsed.toFixed(2)}/$${state.costLimit.toFixed(2)}`
    );
  } else if (state.costUsed > state.costLimit * 0.8) {
    alerts.push(
      `🟡 COST WARNING: $${state.costUsed.toFixed(2)}/$${state.costLimit.toFixed(2)} (80%)`
    );
  }

  // Log usage
  logger.log({
    eventName: 'api_usage_logged',
    provider: apiName,
    requestCount,
    costUSD,
    dailyProgress: `${state.dailyUsed}/${state.dailyLimit}`,
    monthlyProgress: `${state.monthlyUsed}/${state.monthlyLimit}`,
    costProgress: `$${state.costUsed.toFixed(2)}/$${state.costLimit.toFixed(2)}`,
    itemQueried: usage.itemQueried,
    latencyMs: usage.latencyMs,
    status: usage.status,
    alerts,
    metadata: usage.metadata,
  });

  // Store alerts in state
  state.alerts.push(...alerts);

  // Determine if request should be allowed
  const allowed =
    state.dailyUsed <= state.dailyLimit &&
    state.monthlyUsed <= state.monthlyLimit &&
    state.costUsed <= state.costLimit;

  return { allowed, alerts };
}

/**
 * Get current quota status for all APIs
 */
export function getQuotaStatus() {
  const status: Record<string, any> = {};

  Object.entries(API_QUOTAS).forEach(([apiName, config]) => {
    const state = quotaState[apiName];
    const dailyPercentage = (state.dailyUsed / state.dailyLimit) * 100;
    const monthlyPercentage = (state.monthlyUsed / state.monthlyLimit) * 100;
    const costPercentage = (state.costUsed / state.costLimit) * 100;

    status[apiName] = {
      name: config.name,
      tier: config.tier,
      daily: {
        used: state.dailyUsed,
        limit: state.dailyLimit,
        percentage: dailyPercentage.toFixed(1),
        status:
          dailyPercentage > 100
            ? '🔴 EXCEEDED'
            : dailyPercentage > 90
              ? '🟡 WARNING'
              : '🟢 OK',
      },
      monthly: {
        used: state.monthlyUsed,
        limit: state.monthlyLimit,
        percentage: monthlyPercentage.toFixed(1),
        status:
          monthlyPercentage > 100
            ? '🔴 EXCEEDED'
            : monthlyPercentage > 90
              ? '🟡 WARNING'
              : '🟢 OK',
      },
      cost: {
        used: `$${state.costUsed.toFixed(2)}`,
        limit: `$${state.costLimit.toFixed(2)}`,
        percentage: costPercentage.toFixed(1),
        status:
          costPercentage > 100
            ? '🔴 EXCEEDED'
            : costPercentage > 80
              ? '🟡 WARNING'
              : '🟢 OK',
      },
      alerts: state.alerts,
      lastReset: state.lastReset.toISOString(),
    };
  });

  return status;
}

/**
 * Reset daily quotas (call at 00:00 UTC)
 */
export function resetDailyQuotas() {
  Object.values(quotaState).forEach((state) => {
    state.dailyUsed = 0;
    state.alerts = [];
    state.lastReset = new Date();
  });

  logger.log({
    eventName: 'quota_daily_reset',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Reset monthly quotas (call on 1st of month at 00:00 UTC)
 */
export function resetMonthlyQuotas() {
  Object.values(quotaState).forEach((state) => {
    state.monthlyUsed = 0;
    state.costUsed = 0;
    state.alerts = [];
    state.lastReset = new Date();
  });

  logger.log({
    eventName: 'quota_monthly_reset',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if API usage is allowed
 * Returns true if within quotas, false if exceeded
 */
export function isAPIUsageAllowed(apiName: string): boolean {
  if (!quotaState[apiName]) return false;

  const state = quotaState[apiName];
  const config = API_QUOTAS[apiName];

  return (
    state.dailyUsed < state.dailyLimit &&
    state.monthlyUsed < state.monthlyLimit &&
    state.costUsed < state.costLimit
  );
}

/**
 * Throw error if quota exceeded (for use in API handlers)
 */
export function enforceQuota(apiName: string) {
  if (!isAPIUsageAllowed(apiName)) {
    const state = quotaState[apiName];
    throw new Error(
      `API quota exceeded for ${apiName}: ` +
        `daily ${state.dailyUsed}/${state.dailyLimit}, ` +
        `monthly ${state.monthlyUsed}/${state.monthlyLimit}, ` +
        `cost $${state.costUsed.toFixed(2)}/$${state.costLimit.toFixed(2)}`
    );
  }
}

/**
 * Get recommendations based on current usage
 */
export function getQuotaRecommendations(): string[] {
  const recommendations: string[] = [];
  const today = new Date();

  Object.entries(quotaState).forEach(([apiName, state]) => {
    const config = API_QUOTAS[apiName];
    const dailyPercentage = (state.dailyUsed / state.dailyLimit) * 100;
    const monthlyPercentage = (state.monthlyUsed / state.monthlyLimit) * 100;
    const costPercentage = (state.costUsed / state.costLimit) * 100;

    if (dailyPercentage > 80) {
      recommendations.push(
        `⚠️ ${config.name}: Daily quota at ${dailyPercentage.toFixed(0)}%, consider waiting until reset`
      );
    }

    if (monthlyPercentage > 80) {
      recommendations.push(
        `⚠️ ${config.name}: Monthly quota at ${monthlyPercentage.toFixed(0)}%, may need to upgrade or reduce usage`
      );
    }

    if (costPercentage > 80 && config.monthlyBudgetUSD > 0) {
      recommendations.push(
        `⚠️ ${config.name}: Cost budget at ${costPercentage.toFixed(0)}%, ${config.monthlyBudgetUSD > 50 ? 'consider optimization' : 'upgrade recommended'}`
      );
    }
  });

  return recommendations;
}

// Initialize on module load
initializeQuotas();
