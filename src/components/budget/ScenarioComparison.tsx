/**
 * ScenarioComparison — Side-by-side comparison of all 3 scenarios
 *
 * Shows:
 * - Economico vs Padrão vs Premium
 * - Percentage differences
 * - Visual comparison
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetReport } from '../../schemas/budget.schema';
import { formatBRL, scenarioDifference } from '../../lib/budget-calculator';

interface ScenarioComparisonProps {
  budget: BudgetReport;
}

export default function ScenarioComparison({ budget }: ScenarioComparisonProps) {
  const diff = scenarioDifference(
    budget.scenarios[0].total,
    budget.scenarios[1].total,
    budget.scenarios[2].total
  );

  const minTotal = Math.min(...budget.scenarios.map((s) => s.total));
  const maxTotal = Math.max(...budget.scenarios.map((s) => s.total));
  const range = maxTotal - minTotal;

  return (
    <div className="rounded-lg border border-zinc-200 p-6">
      <h3 className="font-bold text-zinc-900 mb-6">Comparação de Cenários</h3>

      <div className="space-y-6">
        {budget.scenarios.map((scenario, idx) => {
          const barWidth = ((scenario.total - minTotal) / range) * 100;
          const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];
          const labels = ['econômico', 'padrão', 'premium'];

          return (
            <div key={scenario.scenario} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${colors[idx]}`}
                  />
                  <span className="font-semibold text-zinc-900 capitalize">
                    {scenario.scenario}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({scenario.description})
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-zinc-900">
                    {formatBRL(scenario.total)}
                  </div>
                  {idx > 0 && (
                    <div className="text-xs text-zinc-500">
                      +{idx === 1 ? diff.ecoToPadrao.toFixed(1) : diff.padroToPremium.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Bar chart */}
              <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colors[idx]} transition-all`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Breakdown by category */}
              <div className="grid grid-cols-4 gap-3 text-xs mt-3 pl-6">
                <div>
                  <span className="text-zinc-500">Materiais</span>
                  <div className="font-semibold text-zinc-900">
                    {formatBRL(scenario.subtotalMaterials)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Mão de Obra</span>
                  <div className="font-semibold text-zinc-900">
                    {formatBRL(scenario.subtotalLabor)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Equipamentos</span>
                  <div className="font-semibold text-zinc-900">
                    {formatBRL(scenario.subtotalEquipment)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500">Contingência</span>
                  <div className="font-semibold text-zinc-900">
                    {formatBRL(scenario.contingency)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-8 pt-6 border-t border-zinc-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-zinc-500 font-semibold">AMPLITUDE</p>
          <p className="text-lg font-bold text-zinc-900 mt-1">
            {formatBRL(maxTotal - minTotal)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {((maxTotal - minTotal) / minTotal * 100).toFixed(1)}% de diferença
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-zinc-500 font-semibold">CENÁRIO RECOMENDADO</p>
          <p className="text-lg font-bold text-blue-600 mt-1">Padrão</p>
          <p className="text-xs text-zinc-500 mt-1">Melhor custo-benefício</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-zinc-500 font-semibold">CONFIANÇA MÉDIA</p>
          <p className="text-lg font-bold text-zinc-900 mt-1">
            {(budget.items.reduce((a, b) => a + b.confidenceScore, 0) / budget.items.length * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-zinc-500 mt-1">{budget.items.length} itens</p>
        </div>
      </div>
    </div>
  );
}
