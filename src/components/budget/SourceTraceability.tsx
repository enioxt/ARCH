/**
 * SourceTraceability — Source attribution and audit trail
 *
 * Shows:
 * - All data sources used
 * - Collection date
 * - Confidence per source
 * - Links to source data
 * - Audit trail
 */

import React, { useState } from 'react';
import { ExternalLink, Calendar } from 'lucide-react';
import { BudgetReport } from '../../schemas/budget.schema';

interface SourceTraceabilityProps {
  budget: BudgetReport;
}

export default function SourceTraceability({ budget }: SourceTraceabilityProps) {
  const [filterType, setFilterType] = useState<string | null>(null);

  // Collect all unique sources
  const allSources = Array.from(
    new Map(
      budget.items
        .flatMap((item) => item.sources)
        .map((source) => [source.id, source])
    ).values()
  );

  const filteredSources = filterType
    ? allSources.filter((source) => source.type === filterType)
    : allSources;

  const sourceTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
    sinapi: {
      label: 'SINAPI (CAIXA/IBGE)',
      icon: '📊',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    cub: {
      label: 'CUB Sinduscon-MG',
      icon: '📈',
      color: 'bg-green-50 border-green-200 text-green-900',
    },
    orse: {
      label: 'ORSE',
      icon: '📋',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
    sicro: {
      label: 'SICRO/DNIT',
      icon: '🚧',
      color: 'bg-orange-50 border-orange-200 text-orange-900',
    },
    supplier: {
      label: 'Fornecedor Direto',
      icon: '🏭',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    retail: {
      label: 'Varejo (Lojas)',
      icon: '🛒',
      color: 'bg-pink-50 border-pink-200 text-pink-900',
    },
    internal: {
      label: 'Histórico Interno',
      icon: '📁',
      color: 'bg-gray-50 border-gray-200 text-gray-900',
    },
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType(null)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            filterType === null
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          Todas ({allSources.length})
        </button>

        {Array.from(new Set(allSources.map((s) => s.type))).map((type) => {
          const count = allSources.filter((s) => s.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filterType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {sourceTypeLabels[type]?.label || type} ({count})
            </button>
          );
        })}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredSources.map((source) => {
          const typeInfo = sourceTypeLabels[source.type];
          const itemCount = budget.items.filter((item) =>
            item.sources.some((s) => s.id === source.id)
          ).length;

          return (
            <div
              key={source.id}
              className={`rounded-lg border p-6 ${typeInfo?.color || 'bg-zinc-50'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeInfo?.icon}</span>
                  <div>
                    <h4 className="font-bold">{source.name}</h4>
                    <p className="text-xs opacity-75">{typeInfo?.label}</p>
                  </div>
                </div>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-75 hover:opacity-100 transition"
                    title="Visitar fonte"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-75">Confiança:</span>
                  <span className="font-semibold">
                    {(source.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-75">Itens:</span>
                  <span className="font-semibold">{itemCount}</span>
                </div>

                {source.region && (
                  <div className="flex justify-between">
                    <span className="opacity-75">Região:</span>
                    <span className="font-semibold">{source.region}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="opacity-75">Coletado:</span>
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(source.collectedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <div className="w-full h-2 rounded-full opacity-30 bg-current overflow-hidden">
                  <div
                    className="h-full bg-current"
                    style={{ width: `${source.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology section */}
      <div className="rounded-lg border border-zinc-200 p-6 bg-zinc-50">
        <h3 className="font-bold text-zinc-900 mb-4">Rastreabilidade de Dados</h3>

        <div className="space-y-4 text-sm text-zinc-700">
          <p>
            Este orçamento foi elaborado utilizando <strong>{allSources.length} fontes de dados</strong> distintas.
          </p>

          <div className="bg-white rounded-lg p-4 border border-zinc-200 space-y-2">
            <p className="font-semibold text-zinc-900">Princípios de Confiabilidade:</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Todas as fontes têm data de coleta registrada</li>
              <li>✓ Preços são validados contra múltiplas fontes quando possível</li>
              <li>✓ Itens com confiança &lt;75% marcados para revisão humana</li>
              <li>✓ Histórico completo de alterações mantido</li>
              <li>✓ Fatores de ajuste regional aplicados consistentemente</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-zinc-200 space-y-2">
            <p className="font-semibold text-zinc-900">Próximos Passos:</p>
            <ul className="space-y-1 text-xs">
              <li>
                1. Revisar itens com confiança baixa ({budget.items.filter(i => i.confidenceScore < 0.75).length})
              </li>
              <li>2. Coletar orçamentos adicionais de fornecedores regionais</li>
              <li>3. Validar com o cliente antes de finalizar</li>
              <li>4. Bloquear versão aprovada para auditoria</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Audit trail */}
      <div className="rounded-lg border border-zinc-200 p-6">
        <h3 className="font-bold text-zinc-900 mb-4">Trilha de Auditoria</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-zinc-700">
            <span>Criado:</span>
            <span className="font-mono text-zinc-900">
              {new Date(budget.generatedAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex justify-between text-zinc-700">
            <span>Atualizado:</span>
            <span className="font-mono text-zinc-900">
              {new Date(budget.updatedAt).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex justify-between text-zinc-700">
            <span>Status:</span>
            <span className="font-semibold">
              {budget.status === 'locked' && '🔒 Bloqueado'}
              {budget.status === 'draft' && '✏️ Rascunho'}
              {budget.status === 'validated' && '✅ Validado'}
            </span>
          </div>

          {budget.lockedAt && budget.lockedBy && (
            <div className="flex justify-between text-zinc-700">
              <span>Bloqueado por:</span>
              <span className="font-mono text-zinc-900">
                {budget.lockedBy} em {new Date(budget.lockedAt).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
