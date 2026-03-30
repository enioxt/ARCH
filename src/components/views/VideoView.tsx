import React from 'react';
import { Video, Crown, Film, Clapperboard } from 'lucide-react';
import EmDesenvolvimentoCard from '../EmDesenvolvimentoCard';

export default function VideoView() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            Video de Apresentação
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> Premium
            </span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Gere um passeio virtual ou vista orbital usando o modelo Veo 3.1.
          </p>
        </div>
      </div>

      <EmDesenvolvimentoCard
        icon={Video}
        titulo="Video Walkthrough por IA Generativa"
        descricao="Gere videos cinematográficos de 10-20 segundos do seu projeto — passeio virtual pelo interior, vista orbital externa, ou apresentação com transições suaves. Ideal para vender o projeto ao cliente."
        capacidades={[
          'Passeio virtual (walkthrough) pelo interior do projeto',
          'Vista orbital externa com paisagismo e iluminação dinâmica',
          'Resolução até 4K com opção de narração automática',
          'Custo estimado: ~US$ 1.50 por 10s de video gerado',
        ]}
        tecnologia="Google Veo 3.1 (Vertex AI)"
        fase="Fase 4"
        semanas="8-10"
      />
    </div>
  );
}
