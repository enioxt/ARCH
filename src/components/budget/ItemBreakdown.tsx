/**
 * ItemBreakdown — Detailed listing of all budget items
 *
 * Shows:
 * - Item name, unit, quantity
 * - Low/mid/high prices
 * - Total per scenario
 * - Confidence score
 * - Sources
 */

import React, { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { BudgetReport, BudgetItem } from '../../schemas/budget.schema';
import { formatBRL } from '../../lib/budget-calculator';

interface ItemBreakdownProps {
  budget: BudgetReport;
}

export default function ItemBreakdown({ budget }: ItemBreakdownProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const groupedByCategory = budget.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, BudgetItem[]>
  );

  const categoryIcons: Record<string, string> = {
    foundation: '🏗️',
    structure: '🏢',
    roof: '🏠',
    wall: '🧱',
    finish: '🎨',
    electrical: '⚡',
    plumbing: '💧',
    hvac: '❄️',
    solar: '☀️',
    appliances: '🔧',
    labor: '👷',
    equipment: '🚜',
    logistics: '🚚',
    contingency: '⚠️',
    other: '📦',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category} className="rounded-lg border border-zinc-200 overflow-hidden">
          {/* Category Header */}
          <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
            <h4 className="font-bold text-zinc-900">
              {categoryIcons[category]} {category.replace('_', ' ')}
            </h4>
            <p className="text-sm text-zinc-500 mt-1">
              {items.length} {items.length === 1 ? 'item' : 'itens'} •{' '}
              {formatBRL(items.reduce((a, b) => a + b.totalMid, 0))} (padrão)
            </p>
          </div>

          {/* Items */}
          <div className="divide-y divide-zinc-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 hover:bg-zinc-50 transition">
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="w-full text-left flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-zinc-900 truncate">{item.name}</h5>
                      {item.confidenceScore < 0.75 && (
                        <div title="Confiança baixa" className="flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600">
                      {item.quantity} {item.unit}
                      {item.description && ` • ${item.description}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-zinc-900">
                        {formatBRL(item.totalMid)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {(item.confidenceScore * 100).toFixed(0)}% confiança
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 transition ${
                        expandedItem === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {expandedItem === item.id && (
                  <div className="mt-4 pt-4 border-t border-zinc-200 space-y-4">
                    {/* Price scenarios */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-xs text-emerald-600 font-semibold">ECONÔMICO</p>
                        <p className="text-lg font-bold text-emerald-900 mt-1">
                          {formatBRL(item.totalLow)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold">PADRÃO</p>
                        <p className="text-lg font-bold text-blue-900 mt-1">
                          {formatBRL(item.totalMid)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold">PREMIUM</p>
                        <p className="text-lg font-bold text-purple-900 mt-1">
                          {formatBRL(item.totalHigh)}
                        </p>
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-600">Fator de perda:</span>
                        <span className="font-semibold text-zinc-900 ml-2">
                          {(item.wasteFactor * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600">Fator regional:</span>
                        <span className="font-semibold text-zinc-900 ml-2">
                          {(item.regionalFactor * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600">Fator de complexidade:</span>
                        <span className="font-semibold text-zinc-900 ml-2">
                          {(item.complexityFactor * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600">Confiança:</span>
                        <span className="font-semibold text-zinc-900 ml-2">
                          {(item.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Sources */}
                    {item.sources.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 mb-2">Fontes:</p>
                        <div className="space-y-1 text-sm">
                          {item.sources.map((source) => (
                            <div key={source.id} className="flex items-center gap-2 text-zinc-600">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                              <span>{source.name}</span>
                              {source.url && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  ↗
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assumptions */}
                    {item.assumptions.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 mb-2">Premissas:</p>
                        <ul className="text-sm text-zinc-600 space-y-1">
                          {item.assumptions.map((assumption, idx) => (
                            <li key={idx}>• {assumption}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
