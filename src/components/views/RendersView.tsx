import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Download, Sparkles, SlidersHorizontal, Maximize2 } from 'lucide-react';

export default function RendersView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [renders, setRenders] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, we would add new renders here
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Renders Conceituais</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Imagens fotorrealistas geradas a partir da massa 3D e do briefing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Estilos
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Gerar Novas Vistas
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Main Render View */}
        <div className="flex-1 bg-zinc-900 relative group overflow-hidden">
          <img 
            src={renders[0]} 
            alt="Main Render" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div>
              <h3 className="text-white font-medium text-lg">Vista Frontal - Entardecer</h3>
              <p className="text-zinc-300 text-sm">Hexágono integrado ao pasto com iluminação quente</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-md transition-colors">
                <Maximize2 size={20} />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-md transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>

          {isGenerating && (
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-medium">Renderizando com GPT Image 1.5...</span>
                <span className="text-zinc-400 text-sm">Aplicando materiais e iluminação global</span>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnails Gallery */}
        <div className="h-48 border-t border-zinc-200 bg-zinc-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Galeria de Vistas</h3>
            <span className="text-xs text-zinc-400 font-mono">4 Imagens Geradas</span>
          </div>
          
          <div className="grid grid-cols-4 gap-4 h-24">
            {renders.map((render, i) => (
              <div 
                key={i} 
                className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${i === 0 ? 'border-zinc-900 shadow-md' : 'border-transparent hover:border-zinc-300'}`}
              >
                <img 
                  src={render} 
                  alt={`Render ${i+1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {i === 0 && (
                  <div className="absolute top-2 right-2 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Atual
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
