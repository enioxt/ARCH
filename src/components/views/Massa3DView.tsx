import React from 'react';
import { Box, Rotate3D, Layers, Eye } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Eye size={16} />
            Modo Imersivo
          </button>
          <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Rotate3D size={16} />
            Gerar Renders
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[600px] relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 bg-white border border-zinc-200 rounded-lg shadow-sm p-1 flex flex-col gap-1 z-10">
          <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors" title="Alternar Visualização">
            <Layers size={18} />
          </button>
        </div>

        {/* 3D Viewer Area (Mocked with CSS) */}
        <div className="flex-1 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
          {/* Grid Floor */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(1000px) rotateX(60deg) scale(2)', transformOrigin: 'bottom' }} />
          
          {/* 3D Hexagon Mock */}
          <div className="relative w-64 h-64 transform-gpu perspective-1000">
            <div className="w-full h-full relative transform-style-3d animate-spin-slow">
              {/* Top Face */}
              <div 
                className="absolute inset-0 bg-emerald-500/80 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', transform: 'translateZ(64px)' }}
              />
              {/* Bottom Face */}
              <div 
                className="absolute inset-0 bg-zinc-800/90 border-2 border-zinc-700"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', transform: 'translateZ(-64px)' }}
              />
              
              {/* Side Faces (Simplified Mock) */}
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-600/60 to-emerald-400/60 border border-emerald-500/50" style={{ transform: 'rotateY(0deg) translateZ(110px)' }} />
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-700/60 to-emerald-500/60 border border-emerald-500/50" style={{ transform: 'rotateY(60deg) translateZ(110px)' }} />
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-800/60 to-emerald-600/60 border border-emerald-500/50" style={{ transform: 'rotateY(120deg) translateZ(110px)' }} />
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-900/60 to-emerald-700/60 border border-emerald-500/50" style={{ transform: 'rotateY(180deg) translateZ(110px)' }} />
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-800/60 to-emerald-600/60 border border-emerald-500/50" style={{ transform: 'rotateY(240deg) translateZ(110px)' }} />
              <div className="absolute inset-x-0 top-1/4 bottom-1/4 bg-gradient-to-r from-emerald-700/60 to-emerald-500/60 border border-emerald-500/50" style={{ transform: 'rotateY(300deg) translateZ(110px)' }} />
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-700 flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-400">Arraste para rotacionar</span>
            <div className="w-px h-4 bg-zinc-600" />
            <span className="text-xs font-mono text-emerald-400">Volumetria: 480m³</span>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="h-48 border-t border-zinc-200 bg-white p-6 grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Parâmetros Volumétricos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-zinc-500">Pé-direito</span><span className="font-medium text-zinc-900">3.20 m</span></li>
              <li className="flex justify-between"><span className="text-zinc-500">Altura Total</span><span className="font-medium text-zinc-900">4.50 m</span></li>
              <li className="flex justify-between"><span className="text-zinc-500">Balanço Varanda</span><span className="font-medium text-zinc-900">1.50 m</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Materiais Sugeridos</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-stone-300 border border-stone-400" /><span className="text-zinc-700">Concreto Aparente</span></li>
              <li className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-700 border border-amber-800" /><span className="text-zinc-700">Madeira Cumaru</span></li>
              <li className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-sky-200 border border-sky-300" /><span className="text-zinc-700">Vidro Temperado</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Análise de Insolação</h3>
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <p className="text-xs text-zinc-600 leading-relaxed">
                As varandas perimetrais atuam como brises horizontais, protegendo as suítes do sol direto no verão, mas permitindo aquecimento passivo no inverno. A face sul (mata) recebe luz difusa ideal.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        @keyframes spin-slow {
          from { transform: rotateX(-20deg) rotateY(0deg); }
          to { transform: rotateX(-20deg) rotateY(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}} />
    </div>
  );
}
