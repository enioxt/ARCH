/**
 * BudgetView — Main Budget Dashboard
 *
 * Layout:
 * - Summary (top)
 * - Scenario tabs (mid)
 * - Item breakdown (bottom)
 * - Source traceability (side)
 *
 * Ref: SYSTEM_MAP.md, .windsurfrules
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Download,
  Lock,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useBudgetStore } from '../../store/budget.store';
import { useProjectStore } from '../../store/project.store';
import { BudgetReport } from '../../schemas/budget.schema';
import { formatBRL, scenarioDifference } from '../../lib/budget-calculator';
import BudgetSummary from './BudgetSummary';
import ScenarioComparison from './ScenarioComparison';
import ItemBreakdown from './ItemBreakdown';
import SourceTraceability from './SourceTraceability';

export default function BudgetView() {
  const { project } = useProjectStore();
  const {
    budgets,
    createBudget,
    getBudget,
    recalculateScenarios,
    lockBudget
  } = useBudgetStore();

  const [budget, setBudget] = useState<BudgetReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'items' | 'sources'>('summary');

  // Initialize budget on project change
  useEffect(() => {
    if (!project) return;

    const existingBudget = getBudget(project.id);
    if (!existingBudget) {
      // Create new budget
      createBudget(project.id, project.name, 'MG').then((newBudget) => {
        setBudget(newBudget);
      });
    } else {
      setBudget(existingBudget);
    }
  }, [project?.id]);

  if (!project || !budget) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500">Carregando módulo de orçamento...</p>
        </div>
      </div>
    );
  }

  const difference = scenarioDifference(
    budget.scenarios[0].total,
    budget.scenarios[1].total,
    budget.scenarios[2].total
  );

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Orçamento</h2>
                <p className="text-sm text-zinc-500">Estimativa de custos do projeto</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => recalculateScenarios(project.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
                Recalcular
              </button>

              <button
                onClick={() => lockBudget(project.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  budget.status === 'locked'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                {budget.status === 'locked' ? 'Bloqueado' : 'Bloquear'}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-900 hover:bg-blue-200 transition">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-600 font-semibold">ECONÔMICO</p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {formatBRL(budget.scenarios[0].total)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">PADRÃO</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {formatBRL(budget.scenarios[1].total)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                +{difference.ecoToPadrao.toFixed(1)}% vs Econômico
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold">PREMIUM</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {formatBRL(budget.scenarios[2].total)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                +{difference.ecoToPremium.toFixed(1)}% vs Econômico
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-t border-zinc-200 pt-4">
            {['summary', 'items', 'sources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-semibold text-sm transition border-b-2 ${
                  activeTab === tab
                    ? 'text-zinc-900 border-blue-500'
                    : 'text-zinc-600 border-transparent hover:text-zinc-900'
                }`}
              >
                {tab === 'summary' && '📊 Resumo'}
                {tab === 'items' && '📋 Itens'}
                {tab === 'sources' && '🔗 Fontes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {budget.alerts.length > 0 && (
        <div className="p-6 bg-amber-50 border-b border-amber-200">
          {budget.alerts.map((alert, idx) => (
            <div key={idx} className="flex gap-3 mb-2 last:mb-0">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">{alert}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <BudgetSummary budget={budget} />
            <ScenarioComparison budget={budget} />
          </div>
        )}

        {activeTab === 'items' && <ItemBreakdown budget={budget} />}

        {activeTab === 'sources' && <SourceTraceability budget={budget} />}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
        <p>
          Orçamento versão {budget.version} • Atualizado em{' '}
          {new Date(budget.updatedAt).toLocaleString('pt-BR')}
        </p>
        <p className="mt-2">
          Status: <span className="font-semibold">{budget.status.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
}
