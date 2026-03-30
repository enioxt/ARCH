import React from 'react';
import { Camera, Sparkles, Palette, Image as ImageIcon } from 'lucide-react';
import EmDesenvolvimentoCard from '../EmDesenvolvimentoCard';

export default function RendersView() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Renders Conceituais</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Imagens fotorrealistas geradas a partir da massa 3D e do briefing.
          </p>
        </div>
      </div>

      <EmDesenvolvimentoCard
        icon={Camera}
        titulo="Renders Fotorrealistas por IA"
        descricao="A partir da massa 3D e do briefing estético, o sistema gerará imagens fotorrealistas de múltiplos ângulos — fachada, interiores, vista aérea e entardecer — com materiais, paisagismo e iluminação global."
        capacidades={[
          'Geração multi-ângulo a partir de prompt + geometria 3D',
          'Controle de estilo: moderno, rústico, brutalista, tropical',
          'Galeria comparativa de opções de materialidade',
          'Download em alta resolução (4K) para apresentação ao cliente',
        ]}
        tecnologia="Gemini Imagen 4 / GPT Image"
        fase="Fase 3"
        semanas="5-7"
      />
    </div>
  );
}
