import React, { useEffect, useState } from 'react';
import { Activity, Database, Cpu, DollarSign, Clock, ShieldCheck, Zap, Download } from 'lucide-react';
import { logger, TelemetryEvent } from '../../telemetry/logger';

export default function ObservabilidadeView() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    // Initial load
    setEvents(logger.getEvents());

    // Subscribe to new events
    const unsubscribe = logger.subscribe((newEvents) => {
      setEvents([...newEvents]);
    });

    return () => unsubscribe();
  }, []);

  const totalCost = events.reduce((sum, event) => sum + (event.estimatedCostUsd || 0), 0);
  const uniqueModels = new Set(events.map(e => e.modelUsed).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Telemetria EGOS</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Transparência radical: custos, modelos utilizados e performance do projeto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <DollarSign size={20} />
            <h3 className="text-sm font-medium">Custo Total do Projeto</h3>
          </div>
          <div className="text-3xl font-semibold text-zinc-900 tracking-tight">$ {totalCost.toFixed(4)}</div>
          <p className="text-xs text-zinc-400 mt-2">Acumulado em {events.length} interações</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Cpu size={20} />
            <h3 className="text-sm font-medium">Modelos Utilizados</h3>
          </div>
          <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{uniqueModels}</div>
          <p className="text-xs text-zinc-400 mt-2">Modelos distintos acionados</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Activity size={20} />
            <h3 className="text-sm font-medium">Eventos Registrados</h3>
          </div>
          <div className="text-3xl font-semibold text-zinc-900 tracking-tight">{events.length}</div>
          <p className="text-xs text-zinc-400 mt-2">Ações monitoradas no projeto</p>
        </div>
      </div>

      {/* Detailed Logs */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Trilha de Decisão (Audit Log)</h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            Logs imutáveis via EGOS
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wider sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Data/Hora</th>
                <th className="px-6 py-3 font-medium">Ação</th>
                <th className="px-6 py-3 font-medium">Modelo/Provider</th>
                <th className="px-6 py-3 font-medium">Latência</th>
                <th className="px-6 py-3 font-medium">Custo Estimado</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Nenhum evento registrado ainda. Inicie o projeto para gerar logs.
                  </td>
                </tr>
              ) : (
                events.slice().reverse().map((event) => (
                  <tr key={event.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">{event.eventName}</td>
                    <td className="px-6 py-4 text-zinc-600 flex items-center gap-2">
                      {event.modelUsed ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          {event.modelUsed} ({event.provider})
                        </>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {event.latencyMs ? `${(event.latencyMs / 1000).toFixed(2)}s` : '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-mono text-xs">
                      {event.estimatedCostUsd ? `$ ${event.estimatedCostUsd.toFixed(4)}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Sucesso</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
