import React from 'react';
import { Box, Rotate3D, Sun, Mountain } from 'lucide-react';
import EmDesenvolvimentoCard from '../EmDesenvolvimentoCard';

export default function Massa3DView() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Massa 3D</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Visualização volumétrica do projeto. Avalie proporções, insolação e implantação no terreno.
          </p>
        </div>
      </div>

      <EmDesenvolvimentoCard
        icon={Box}
        titulo="Volumetria 3D Automatizada"
        descricao="A geometria definida no briefing será extrudada automaticamente em um modelo 3D navegável. Visualize proporções, pé-direito, implantação no terreno e estudo de insolação — tudo no navegador."
        capacidades={[
          'Extrusão automática da planta baixa em malha 3D (Trimesh)',
          'Viewer WebGL com rotação, zoom e cortes',
          'Estudo de insolação por latitude/longitude do terreno',
          'Sugestão automática de materiais baseada no briefing',
        ]}
        tecnologia="Trimesh + Three.js (React Three Fiber)"
        fase="Fase 3"
        semanas="5-7"
      />
    </div>
  );
}
