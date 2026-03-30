import React, { useState } from 'react';
import { Video, Play, Download, Crown, Sparkles, Clock } from 'lucide-react';

export default function VideoView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4'); // Placeholder video
    }, 4000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            Vídeo de Apresentação
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> Premium
            </span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Gere um passeio virtual ou vista orbital usando o modelo Veo 3.1.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Video size={16} />
            )}
            Gerar Vídeo (10s)
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Main Video View */}
        <div className="flex-1 bg-zinc-900 relative group overflow-hidden flex items-center justify-center">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
              <Video size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Nenhum vídeo gerado ainda</p>
              <p className="text-xs mt-2 opacity-60 max-w-xs">Gere um vídeo para visualizar a casa em movimento, com iluminação dinâmica e paisagismo.</p>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-md flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-medium flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  Renderizando com Veo 3.1...
                </span>
                <span className="text-zinc-400 text-sm flex items-center gap-2">
                  <Clock size={14} />
                  Isso pode levar alguns minutos
                </span>
                
                {/* Progress Bar Mock */}
                <div className="w-64 h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-amber-500 w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <div className="h-48 border-t border-zinc-200 bg-white p-6 grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Configurações de Geração</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-zinc-500">Duração</span>
                <select className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-900 text-xs font-medium">
                  <option>10 segundos</option>
                  <option>20 segundos</option>
                </select>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-zinc-500">Resolução</span>
                <select className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-900 text-xs font-medium">
                  <option>1080p</option>
                  <option>4K (Premium)</option>
                </select>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-zinc-500">Tipo de Câmera</span>
                <select className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-zinc-900 text-xs font-medium">
                  <option>Orbital (Externa)</option>
                  <option>Walkthrough (Interna)</option>
                </select>
              </li>
            </ul>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Estimativa de Custo</h3>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                <Crown size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Geração Premium</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  A geração de vídeo utiliza o modelo Veo 3.1 do Google Vertex AI. 
                  Um vídeo de 10s em 1080p consome aproximadamente <span className="font-bold">US$ 1.50</span> do seu saldo de créditos.
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-xs font-mono text-amber-800 bg-amber-200/50 px-2 py-1 rounded">Saldo Atual: US$ 45.00</span>
                  <a href="#" className="text-xs font-medium text-amber-700 hover:underline">Comprar mais créditos</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
