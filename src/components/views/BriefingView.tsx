import React from 'react';
import { FileText, CheckCircle2, AlertCircle, ArrowRight, Bot } from 'lucide-react';
import { useProjectStore } from '../../store/project.store';
import { CopilotChat } from './CopilotChat';

export default function BriefingView() {
  const { project } = useProjectStore();
  const analysis = project?.versions.find(v => v.id === project.currentVersionId)?.analysis;

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Co-criação de Briefing
          </h2>
          <p className="text-slate-500 mt-1">
            Converse com o EGOS Master Architect para definir o escopo do seu projeto.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
          Avançar para Croqui
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Chat Interface */}
        <div className="flex flex-col h-full">
          <CopilotChat />
        </div>

        {/* Right Column: Live Extracted Data (JSON State) */}
        <div className="flex flex-col h-full overflow-y-auto bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Extração em Tempo Real
          </h3>
          
          {!analysis ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
              <Bot className="w-12 h-12 mb-3 opacity-20" />
              <p>O arquiteto está aguardando suas informações.</p>
              <p className="text-sm mt-1">O escopo será extraído automaticamente durante a conversa.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Resumo */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resumo Executivo</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{analysis.resumo}</p>
              </div>

              {/* Geometria */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Geometria Base</h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {analysis.geometria_principal}
                </div>
              </div>

              {/* Ambientes */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Programa de Necessidades</h4>
                <div className="space-y-3">
                  {analysis.ambientes.map((room, idx) => (
                    <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <span className="font-medium text-slate-900 text-sm">{room.nome}</span>
                      <span className="text-slate-500 text-sm">{room.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ambiguidades */}
              {analysis.ambiguidades && analysis.ambiguidades.length > 0 && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Pontos de Atenção
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.ambiguidades.map((amb, idx) => (
                      <li key={idx} className="text-amber-800 text-sm">{amb}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
