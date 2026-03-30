import React from 'react';
import { Construction, Cpu, Calendar, type LucideIcon } from 'lucide-react';

interface EmDesenvolvimentoCardProps {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  capacidades: string[];
  tecnologia: string;
  fase: string;
  semanas: string;
}

export default function EmDesenvolvimentoCard({
  icon: Icon,
  titulo,
  descricao,
  capacidades,
  tecnologia,
  fase,
  semanas,
}: EmDesenvolvimentoCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[500px]">
      <div className="relative w-full max-w-2xl">
        {/* Animated gradient border */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-300 opacity-60 animate-[gradient-shift_4s_ease_infinite] bg-[length:200%_100%]" />

        {/* Card body */}
        <div className="relative bg-white rounded-2xl p-10 shadow-sm">
          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <Icon size={28} className="text-zinc-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-zinc-900">{titulo}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                  <Construction size={12} />
                  Em Desenvolvimento
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium border border-zinc-200">
                  <Calendar size={12} />
                  {fase} — Semanas {semanas}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed mb-8">
            {descricao}
          </p>

          {/* Capabilities */}
          <div className="mb-8">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              O que esta funcionalidade fará
            </h4>
            <ul className="space-y-3">
              {capacidades.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] font-bold text-zinc-400">{idx + 1}</span>
                  </div>
                  {cap}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech footer */}
          <div className="flex items-center gap-3 pt-6 border-t border-zinc-100">
            <Cpu size={14} className="text-zinc-400" />
            <span className="text-xs text-zinc-500">
              Tecnologia: <span className="font-semibold text-zinc-700">{tecnologia}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
