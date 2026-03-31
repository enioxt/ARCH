/**
 * Budget API Client
 *
 * Client-side functions to call budget API endpoints
 * Handles fetch, error handling, and type safety
 */

import { BudgetReport } from '../schemas/budget.schema';
import { logger } from '../telemetry/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cost?: number;
  latency?: number;
}

/**
 * Build initial budget from project
 * POST /api/budget/build-from-project
 */
export async function buildBudgetFromProject(
  projectId: string,
  region: string = 'BR',
  scenario: 'economico' | 'padrao' | 'premium' = 'padrao'
): Promise<BudgetReport> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/build-from-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, region, scenario }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<BudgetReport> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to build budget');
    }

    logger.log({
      eventName: 'budget_build_api_call',
      projectId,
      latency: Date.now() - startTime,
      cost: result.cost || 0,
    });

    return result.data;
  } catch (error) {
    logger.error('Budget build API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    throw error;
  }
}

/**
 * Research prices for budget items
 * POST /api/budget/research-prices
 */
export async function researchPrices(
  projectId: string,
  itemIds: string[] = [],
  sources: string[] = ['sinapi', 'retail'],
  region: string = 'BR'
): Promise<{ itemsUpdated: number; prices: any; cost: number }> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/research-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, itemIds, sources, region }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to research prices');
    }

    logger.log({
      eventName: 'price_research_api_call',
      projectId,
      itemsUpdated: result.data.itemsUpdated,
      latency: Date.now() - startTime,
      cost: result.cost || 0,
    });

    return {
      itemsUpdated: result.data.itemsUpdated,
      prices: result.data.prices,
      cost: result.cost || 0,
    };
  } catch (error) {
    logger.error('Price research API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    throw error;
  }
}

/**
 * Recalculate budget scenarios
 * POST /api/budget/recalculate
 */
export async function recalculateBudget(projectId: string): Promise<BudgetReport> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/recalculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<BudgetReport> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to recalculate budget');
    }

    logger.log({
      eventName: 'budget_recalculate_api_call',
      projectId,
      latency: Date.now() - startTime,
    });

    return result.data;
  } catch (error) {
    logger.error('Budget recalculate API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    throw error;
  }
}

/**
 * Get latest budget for project
 * GET /api/budget/:projectId/latest
 */
export async function getLatestBudget(projectId: string): Promise<BudgetReport | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/${projectId}/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No budget found
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<BudgetReport> = await response.json();

    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    logger.error('Get latest budget API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    return null;
  }
}

/**
 * Get all budget versions for project
 * GET /api/budget/:projectId/versions
 */
export async function getBudgetVersions(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/${projectId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.versions || [];
  } catch (error) {
    logger.error('Get budget versions API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    return [];
  }
}

/**
 * Lock budget (make immutable)
 * POST /api/budget/:projectId/lock
 */
export async function lockBudget(projectId: string, notes?: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/${projectId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to lock budget');
    }

    logger.log({
      eventName: 'budget_locked',
      projectId,
    });
  } catch (error) {
    logger.error('Lock budget API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
    });
    throw error;
  }
}

/**
 * Generate budget report (PDF/Excel)
 * POST /api/budget/:projectId/report
 */
export async function generateBudgetReport(
  projectId: string,
  format: 'pdf' | 'excel' = 'pdf'
): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/budget/${projectId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    logger.log({
      eventName: 'budget_report_generated',
      projectId,
      format,
    });

    return blob;
  } catch (error) {
    logger.error('Generate budget report API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId,
      format,
    });
    throw error;
  }
}
