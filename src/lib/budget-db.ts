/**
 * Budget Database Operations
 *
 * CRUD operations for budgets, budget_items, price_sources
 */

import { query, transaction, PoolClient } from './db';
import { BudgetReport, BudgetItem, PriceSource } from '../schemas/budget.schema';
import { logger } from '../telemetry/logger';

// ============================================================================
// PROJECTS
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type?: string;
  area_m2?: number;
  floors?: number;
  rooms?: number;
  region?: string;
  city?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const result = await query(
    `INSERT INTO projects (name, description, project_type, area_m2, floors, rooms, region, city, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.description,
      data.project_type,
      data.area_m2,
      data.floors,
      data.rooms,
      data.region,
      data.city,
      data.status || 'draft',
    ]
  );

  return result.rows[0];
}

export async function getProject(id: string): Promise<Project | null> {
  const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function listProjects(limit = 50, offset = 0): Promise<Project[]> {
  const result = await query(
    'SELECT * FROM projects ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
}

// ============================================================================
// BUDGETS
// ============================================================================

export async function saveBudget(budget: BudgetReport): Promise<string> {
  return await transaction(async (client) => {
    // 1. Insert or update budget
    const budgetResult = await client.query(
      `INSERT INTO budgets (
        id, project_id, version, status, region, scenario_default,
        total_low, total_mid, total_high,
        methodology, assumptions, alerts,
        generated_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        total_low = EXCLUDED.total_low,
        total_mid = EXCLUDED.total_mid,
        total_high = EXCLUDED.total_high,
        methodology = EXCLUDED.methodology,
        assumptions = EXCLUDED.assumptions,
        alerts = EXCLUDED.alerts,
        updated_at = EXCLUDED.updated_at
      RETURNING id`,
      [
        budget.id,
        budget.projectId,
        budget.version,
        budget.status,
        budget.region,
        'padrao', // Default scenario
        budget.scenarios.find((s) => s.scenario === 'economico')?.total || 0,
        budget.scenarios.find((s) => s.scenario === 'padrao')?.total || 0,
        budget.scenarios.find((s) => s.scenario === 'premium')?.total || 0,
        JSON.stringify(budget.methodology),
        JSON.stringify(budget.assumptions),
        JSON.stringify(budget.alerts),
        budget.generatedAt,
        budget.updatedAt,
      ]
    );

    const budgetId = budgetResult.rows[0].id;

    // 2. Delete old budget items (if updating)
    await client.query('DELETE FROM budget_items WHERE budget_id = $1', [budgetId]);

    // 3. Insert budget items
    for (const item of budget.items) {
      const itemResult = await client.query(
        `INSERT INTO budget_items (
          id, budget_id, category, name, description,
          quantity, unit, waste_factor, regional_factor, complexity_factor,
          chosen_scenario, total_low, total_mid, total_high, confidence_score,
          assumptions, last_updated, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          item.id,
          budgetId,
          item.category,
          item.name,
          item.description,
          item.quantity,
          item.unit,
          item.wasteFactor,
          item.regionalFactor,
          item.complexityFactor,
          item.chosenScenario,
          item.totalLow,
          item.totalMid,
          item.totalHigh,
          item.confidenceScore,
          JSON.stringify(item.assumptions || []),
          item.lastUpdated,
          0, // display_order
        ]
      );

      const itemId = itemResult.rows[0].id;

      // 4. Insert price sources for this item
      for (const source of item.sources || []) {
        await client.query(
          `INSERT INTO price_sources (
            budget_item_id, name, type, url,
            low, mid, high, confidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [itemId, source.name, source.type, source.url, source.low, source.mid, source.high, source.confidence]
        );
      }

      // 5. Insert price points for historical tracking
      for (const pricePoint of item.prices || []) {
        await client.query(
          `INSERT INTO price_points (
            budget_item_id, scenario, price
          ) VALUES ($1, $2, $3)`,
          [itemId, pricePoint.scenario, pricePoint.price]
        );
      }
    }

    // 6. Log audit event
    await client.query(
      `INSERT INTO budget_audit_log (budget_id, event_type, event_description, actor)
       VALUES ($1, $2, $3, $4)`,
      [budgetId, 'updated', 'Budget saved', 'system']
    );

    logger.log({
      eventName: 'budget_saved',
      budgetId,
      projectId: budget.projectId,
      itemCount: budget.items.length,
    });

    return budgetId;
  });
}

export async function getBudget(budgetId: string): Promise<BudgetReport | null> {
  const budgetResult = await query('SELECT * FROM budgets WHERE id = $1', [budgetId]);

  if (budgetResult.rows.length === 0) {
    return null;
  }

  const budgetRow = budgetResult.rows[0];

  // Fetch budget items
  const itemsResult = await query('SELECT * FROM budget_items WHERE budget_id = $1 ORDER BY display_order, name', [
    budgetId,
  ]);

  const items: BudgetItem[] = [];

  for (const itemRow of itemsResult.rows) {
    // Fetch price sources for this item
    const sourcesResult = await query('SELECT * FROM price_sources WHERE budget_item_id = $1', [itemRow.id]);

    const sources = sourcesResult.rows.map((source) => ({
      name: source.name,
      type: source.type,
      url: source.url,
      low: parseFloat(source.low),
      mid: parseFloat(source.mid),
      high: parseFloat(source.high),
      confidence: parseFloat(source.confidence),
    }));

    // Fetch price points
    const pricesResult = await query('SELECT * FROM price_points WHERE budget_item_id = $1', [itemRow.id]);

    const prices = pricesResult.rows.map((price) => ({
      scenario: price.scenario,
      price: parseFloat(price.price),
    }));

    items.push({
      id: itemRow.id,
      category: itemRow.category,
      name: itemRow.name,
      description: itemRow.description,
      quantity: parseFloat(itemRow.quantity),
      unit: itemRow.unit,
      wasteFactor: parseFloat(itemRow.waste_factor),
      regionalFactor: parseFloat(itemRow.regional_factor),
      complexityFactor: parseFloat(itemRow.complexity_factor),
      sources,
      prices,
      chosenScenario: itemRow.chosen_scenario,
      totalLow: parseFloat(itemRow.total_low),
      totalMid: parseFloat(itemRow.total_mid),
      totalHigh: parseFloat(itemRow.total_high),
      confidenceScore: parseFloat(itemRow.confidence_score),
      assumptions: JSON.parse(itemRow.assumptions || '[]'),
      lastUpdated: itemRow.last_updated,
    });
  }

  // Reconstruct budget report
  const budget: BudgetReport = {
    id: budgetRow.id,
    projectId: budgetRow.project_id,
    projectName: '', // Will need to join with projects table
    version: budgetRow.version,
    region: budgetRow.region,
    generatedAt: budgetRow.generated_at,
    updatedAt: budgetRow.updated_at,
    scenarios: [
      {
        scenario: 'economico',
        description: 'Cenário econômico com preços baixos',
        subtotalMaterials: 0, // TODO: Calculate from items
        subtotalLabor: 0,
        subtotalEquipment: 0,
        subtotalLogistics: 0,
        contingency: 0,
        bdi: 0,
        taxes: 0,
        total: parseFloat(budgetRow.total_low),
      },
      {
        scenario: 'padrao',
        description: 'Cenário padrão com preços médios',
        subtotalMaterials: 0,
        subtotalLabor: 0,
        subtotalEquipment: 0,
        subtotalLogistics: 0,
        contingency: 0,
        bdi: 0,
        taxes: 0,
        total: parseFloat(budgetRow.total_mid),
      },
      {
        scenario: 'premium',
        description: 'Cenário premium com preços altos',
        subtotalMaterials: 0,
        subtotalLabor: 0,
        subtotalEquipment: 0,
        subtotalLogistics: 0,
        contingency: 0,
        bdi: 0,
        taxes: 0,
        total: parseFloat(budgetRow.total_high),
      },
    ],
    items,
    methodology: JSON.parse(budgetRow.methodology || '[]'),
    alerts: JSON.parse(budgetRow.alerts || '[]'),
    assumptions: JSON.parse(budgetRow.assumptions || '{}'),
    status: budgetRow.status,
  };

  return budget;
}

export async function getLatestBudget(projectId: string): Promise<BudgetReport | null> {
  const result = await query(
    'SELECT id FROM budgets WHERE project_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [projectId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return getBudget(result.rows[0].id);
}

export async function listBudgetVersions(projectId: string): Promise<Array<{ id: string; version: string; updatedAt: string }>> {
  const result = await query(
    'SELECT id, version, updated_at FROM budgets WHERE project_id = $1 ORDER BY updated_at DESC',
    [projectId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    version: row.version,
    updatedAt: row.updated_at,
  }));
}

export async function lockBudget(budgetId: string): Promise<void> {
  await query('UPDATE budgets SET status = $1, locked_at = NOW() WHERE id = $2', ['locked', budgetId]);

  await query(
    `INSERT INTO budget_audit_log (budget_id, event_type, event_description, actor)
     VALUES ($1, $2, $3, $4)`,
    [budgetId, 'locked', 'Budget locked for editing', 'system']
  );

  logger.log({
    eventName: 'budget_locked',
    budgetId,
  });
}
