// Real-time cost tracker for ARCH AI operations

import type { ModelType } from './ai-providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CostEntry {
  timestamp: Date;
  modelId: string;
  modelName: string;
  provider: string;
  type: ModelType;
  costUsd: number;
  costBrl: number;
  durationMs: number;
  metadata: Record<string, string | number>;
}

export interface CostBreakdown {
  byType: Record<string, number>;
  byProvider: Record<string, number>;
  totalUsd: number;
  totalBrl: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** USD → BRL conversion rate. Update as needed. */
export const USD_TO_BRL = 5.50;

// ---------------------------------------------------------------------------
// CostTracker
// ---------------------------------------------------------------------------

export class CostTracker {
  private entries: CostEntry[] = [];

  /** Record a new cost entry. */
  record(entry: CostEntry): void {
    this.entries.push(entry);
  }

  /** Sum of all recorded costs in USD. */
  getTotalUsd(): number {
    return this.entries.reduce((sum, e) => sum + e.costUsd, 0);
  }

  /** Sum of all recorded costs in BRL. */
  getTotalBrl(): number {
    return this.entries.reduce((sum, e) => sum + e.costBrl, 0);
  }

  /** Filter entries by model type ('image' | 'video' | '3d' | 'chat'). */
  getByType(type: ModelType): CostEntry[] {
    return this.entries.filter((e) => e.type === type);
  }

  /** Filter entries by provider name. */
  getByProvider(provider: string): CostEntry[] {
    return this.entries.filter((e) => e.provider === provider);
  }

  /** Filter entries recorded today (local time). */
  getToday(): CostEntry[] {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.entries.filter((e) => e.timestamp >= startOfDay);
  }

  /** Aggregate breakdown by type and provider. */
  getBreakdown(): CostBreakdown {
    const byType: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    for (const entry of this.entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + entry.costUsd;
      byProvider[entry.provider] = (byProvider[entry.provider] ?? 0) + entry.costUsd;
    }

    return {
      byType,
      byProvider,
      totalUsd: this.getTotalUsd(),
      totalBrl: this.getTotalBrl(),
    };
  }
}

/** Singleton instance shared across the application. */
export const costTracker = new CostTracker();
