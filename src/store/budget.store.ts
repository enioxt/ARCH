/**
 * Budget Store — Zustand
 *
 * State management for budget module.
 * Handles budget creation, updates, scenarios, and versions.
 *
 * Ref: CAPABILITY_REGISTRY.md, SYSTEM_MAP.md
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  BudgetReport,
  BudgetItem,
  BudgetScenario,
  BudgetVersionList,
} from '../schemas/budget.schema';
import { logger } from '../telemetry/logger';
import {
  buildBudgetFromProject,
  researchPrices,
  recalculateBudget as recalculateBudgetAPI,
  getLatestBudget,
  lockBudget as lockBudgetAPI,
} from '../lib/budget-client';

interface BudgetState {
  // Current budget
  budgets: Record<string, BudgetReport>; // projectId -> current budget
  budgetVersions: Record<string, BudgetReport[]>; // projectId -> version history

  // Actions
  createBudget: (projectId: string, projectName: string, region: string) => Promise<BudgetReport>;
  getBudget: (projectId: string) => BudgetReport | null;
  getVersions: (projectId: string) => BudgetVersionList;

  // Item management
  addItem: (projectId: string, item: BudgetItem) => void;
  updateItem: (projectId: string, itemId: string, updates: Partial<BudgetItem>) => void;
  removeItem: (projectId: string, itemId: string) => void;

  // Scenario management
  recalculateScenarios: (projectId: string) => void;
  selectScenario: (projectId: string, itemId: string, scenario: 'low' | 'mid' | 'high') => void;

  // Version management
  saveVersion: (projectId: string, notes?: string) => void;
  lockBudget: (projectId: string, lockedBy?: string) => void;

  // Utilities
  clearBudget: (projectId: string) => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: {},
  budgetVersions: {},

  /**
   * Create a new budget for a project (calls backend API)
   */
  createBudget: async (projectId: string, projectName: string, region: string) => {
    try {
      // Call backend API to build budget from project
      const newBudget = await buildBudgetFromProject(projectId, region, 'padrao');

      // Update local store
      set((state) => ({
        budgets: { ...state.budgets, [projectId]: newBudget },
        budgetVersions: { ...state.budgetVersions, [projectId]: [newBudget] },
      }));

      logger.log({
        eventName: 'budget_created',
        projectId,
        budgetId: newBudget.id,
        region,
      });

      // Trigger price research in background (don't await)
      researchPrices(projectId, [], ['sinapi', 'retail'], region)
        .then((result) => {
          logger.log({
            eventName: 'prices_researched_background',
            projectId,
            itemsUpdated: result.itemsUpdated,
            cost: result.cost,
          });
          // TODO: Update budget with researched prices
        })
        .catch((err) => {
          logger.error('Background price research failed', { error: err.message });
        });

      return newBudget;
    } catch (error) {
      logger.error('Create budget failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
      });
      throw error;
    }
  },

  /**
   * Get current budget for a project
   */
  getBudget: (projectId: string) => {
    return get().budgets[projectId] || null;
  },

  /**
   * Get all budget versions for a project
   */
  getVersions: (projectId: string): BudgetVersionList => {
    const versions = get().budgetVersions[projectId] || [];
    return versions.map((budget) => ({
      id: budget.id,
      version: budget.version,
      createdAt: budget.generatedAt,
      status: budget.status,
      total: {
        economico: budget.scenarios[0].total,
        padrao: budget.scenarios[1].total,
        premium: budget.scenarios[2].total,
      },
    }));
  },

  /**
   * Add a new item to the budget
   */
  addItem: (projectId: string, item: BudgetItem) => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      const updatedBudget = {
        ...budget,
        items: [...budget.items, item],
        updatedAt: new Date().toISOString(),
      };

      return {
        budgets: { ...state.budgets, [projectId]: updatedBudget },
      };
    });

    logger.log({
      eventName: 'budget_item_added',
      projectId,
      itemId: item.id,
      category: item.category,
    });
  },

  /**
   * Update a budget item
   */
  updateItem: (projectId: string, itemId: string, updates: Partial<BudgetItem>) => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      const updatedItems = budget.items.map((item) =>
        item.id === itemId
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
          : item
      );

      const updatedBudget = {
        ...budget,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        budgets: { ...state.budgets, [projectId]: updatedBudget },
      };
    });

    logger.log({
      eventName: 'budget_item_updated',
      projectId,
      itemId,
    });
  },

  /**
   * Remove an item from the budget
   */
  removeItem: (projectId: string, itemId: string) => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      const updatedItems = budget.items.filter((item) => item.id !== itemId);
      const updatedBudget = {
        ...budget,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        budgets: { ...state.budgets, [projectId]: updatedBudget },
      };
    });

    logger.log({
      eventName: 'budget_item_removed',
      projectId,
      itemId,
    });
  },

  /**
   * Recalculate all scenarios with current item data
   */
  recalculateScenarios: (projectId: string) => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      // Recalculate each scenario
      const updatedScenarios = budget.scenarios.map((scenario) => {
        let subtotalMaterials = 0;
        let subtotalLabor = 0;
        let subtotalEquipment = 0;
        let subtotalLogistics = 0;

        budget.items.forEach((item) => {
          const scenarioValue =
            scenario.scenario === 'economico'
              ? item.totalLow
              : scenario.scenario === 'premium'
              ? item.totalHigh
              : item.totalMid;

          if (item.category === 'labor') {
            subtotalLabor += scenarioValue;
          } else if (item.category === 'equipment') {
            subtotalEquipment += scenarioValue;
          } else if (item.category === 'logistics') {
            subtotalLogistics += scenarioValue;
          } else {
            subtotalMaterials += scenarioValue;
          }
        });

        const subtotal =
          subtotalMaterials + subtotalLabor + subtotalEquipment + subtotalLogistics;

        // Standard assumptions: 10% contingency, 25% BDI, 17% taxes
        const contingency = subtotal * 0.1;
        const bdi = (subtotal + contingency) * 0.25;
        const taxes = (subtotal + contingency + bdi) * 0.17;
        const total = subtotal + contingency + bdi + taxes;

        return {
          ...scenario,
          subtotalMaterials,
          subtotalLabor,
          subtotalEquipment,
          subtotalLogistics,
          contingency,
          bdi,
          taxes,
          total,
        };
      });

      const updatedBudget = {
        ...budget,
        scenarios: updatedScenarios,
        updatedAt: new Date().toISOString(),
      };

      return {
        budgets: { ...state.budgets, [projectId]: updatedBudget },
      };
    });

    // Trigger scenario recalculation
    get().recalculateScenarios(projectId);

    logger.log({
      eventName: 'budget_scenarios_recalculated',
      projectId,
    });
  },

  /**
   * Select which price scenario (low/mid/high) to use for an item
   */
  selectScenario: (projectId: string, itemId: string, scenario: 'low' | 'mid' | 'high') => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      const updatedItems = budget.items.map((item) => {
        if (item.id !== itemId) return item;

        // Recalculate totals based on scenario (use sources for pricing)
        const primarySource = item.sources[0];
        if (!primarySource) return item;

        const basePrice =
          scenario === 'low' ? primarySource.low : scenario === 'high' ? primarySource.high : primarySource.mid;

        const totalPrice = basePrice * item.quantity * item.wasteFactor * item.regionalFactor * item.complexityFactor;

        return {
          ...item,
          chosenScenario: scenario,
          totalLow: scenario === 'low' ? totalPrice : item.totalLow,
          totalMid: scenario === 'mid' ? totalPrice : item.totalMid,
          totalHigh: scenario === 'high' ? totalPrice : item.totalHigh,
          lastUpdated: new Date().toISOString(),
        };
      });

      const updatedBudget = {
        ...budget,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      return {
        budgets: { ...state.budgets, [projectId]: updatedBudget },
      };
    });

    logger.log({
      eventName: 'budget_item_scenario_selected',
      projectId,
      itemId,
      scenario,
    });
  },

  /**
   * Save current budget as a new version
   */
  saveVersion: (projectId: string, notes?: string) => {
    set((state) => {
      const budget = state.budgets[projectId];
      if (!budget) return state;

      // Increment version
      const [major, minor, patch] = budget.version.split('.').map(Number);
      const newVersion = `${major}.${minor}.${patch + 1}`;

      const newBudget = {
        ...budget,
        id: uuidv4(),
        version: newVersion,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const versions = state.budgetVersions[projectId] || [];

      return {
        budgets: { ...state.budgets, [projectId]: newBudget },
        budgetVersions: {
          ...state.budgetVersions,
          [projectId]: [...versions, newBudget],
        },
      };
    });

    logger.log({
      eventName: 'budget_version_saved',
      projectId,
      notes,
    });
  },

  /**
   * Lock a budget (finalize for approval)
   */
  lockBudget: async (projectId: string, lockedBy?: string) => {
    try {
      // Call backend API to lock budget
      await lockBudgetAPI(projectId, lockedBy);

      // Update local store
      set((state) => {
        const budget = state.budgets[projectId];
        if (!budget) return state;

        const lockedBudget = {
          ...budget,
          status: 'locked' as const,
          lockedAt: new Date().toISOString(),
          lockedBy,
        };

        return {
          budgets: { ...state.budgets, [projectId]: lockedBudget },
        };
      });

      logger.log({
        eventName: 'budget_locked',
        projectId,
        lockedBy,
      });
    } catch (error) {
      logger.error('Lock budget failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
      });
      throw error;
    }
  },

  /**
   * Clear budget for a project
   */
  clearBudget: (projectId: string) => {
    set((state) => {
      const { [projectId]: _, ...remaining } = state.budgets;
      return { budgets: remaining };
    });
  },
}));
