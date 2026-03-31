/**
 * BudgetSummary — Executive Summary Card
 *
 * Shows:
 * - Total by category (materials, labor, equipment, logistics)
 * - Contingency and BDI breakdown
 * - Methodology
 * - Key assumptions
 */

import React from 'react';
import { BudgetReport } from '../../schemas/budget.schema';
import { formatBRL } from '../../lib/budget-calculator';

interface BudgetSummaryProps {
  budget: BudgetReport;
}

export default function BudgetSummary({ budget }: BudgetSummaryProps) {
  const standardScenario = budget.scenarios[1]; // Padrão

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="rounded-lg border border-zinc-200 p-6">
        <h3 className="font-bold text-zinc-900 mb-4">Composição do Orçamento (Cenário Padrão)</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Materiais</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.subtotalMaterials)}
            </span>
            <div className="w-24 bg-zinc-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${(standardScenario.subtotalMaterials / standardScenario.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Mão de Obra</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.subtotalLabor)}
            </span>
            <div className="w-24 bg-zinc-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(standardScenario.subtotalLabor / standardScenario.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Equipamentos</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.subtotalEquipment)}
            </span>
            <div className="w-24 bg-zinc-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{
                  width: `${(standardScenario.subtotalEquipment / standardScenario.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Logística</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.subtotalLogistics)}
            </span>
            <div className="w-24 bg-zinc-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${(standardScenario.subtotalLogistics / standardScenario.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Subtotal</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(
                standardScenario.subtotalMaterials +
                standardScenario.subtotalLabor +
                standardScenario.subtotalEquipment +
                standardScenario.subtotalLogistics
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Contingência (10%)</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.contingency)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">BDI / Overhead (25%)</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.bdi)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Impostos (17%)</span>
            <span className="font-semibold text-zinc-900">
              {formatBRL(standardScenario.taxes)}
            </span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-zinc-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatBRL(standardScenario.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Assumptions & Methodology */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-zinc-200 p-6">
          <h4 className="font-bold text-zinc-900 mb-4">Premissas</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            {Object.entries(budget.assumptions).map(([key, value]) => (
              <li key={key} className="flex gap-2">
                <span className="font-semibold text-zinc-700">{key}:</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 p-6">
          <h4 className="font-bold text-zinc-900 mb-4">Metodologia</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            {budget.methodology.map((method, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-500">✓</span>
                <span>{method}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
