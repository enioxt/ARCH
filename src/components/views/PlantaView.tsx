import React from 'react';
import { Map, Ruler, PenTool, Layers } from 'lucide-react';
import EmDesenvolvimentoCard from '../EmDesenvolvimentoCard';

export default function PlantaView() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Planta 2D Conceitual</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Planta gerada a partir do briefing e croqui. Edite paredes, portas e janelas.
          </p>
        </div>
      </div>

      <EmDesenvolvimentoCard
        icon={Map}
        titulo="Geração Automática de Planta Baixa"
        descricao="A partir do croqui desenhado e do briefing conversacional, o sistema gerará automaticamente uma planta baixa 2D completa — com paredes, portas, janelas, cotas e ambientes nomeados."
        capacidades={[
          'Interpretação de croqui via Gemini 2.5 Flash (visão)',
          'Geração de layout otimizado com regras arquitetônicas',
          'Editor interativo de paredes, aberturas e mobiliário',
          'Exportação em DXF compatível com AutoCAD/Revit',
        ]}
        tecnologia="Gemini 2.5 Flash + Canvas SVG"
        fase="Fase 2"
        semanas="3-4"
      />
    </div>
  );
}
