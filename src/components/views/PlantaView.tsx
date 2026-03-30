import React from 'react';
import { Map, Download, Edit3, Maximize2, Layers } from 'lucide-react';

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
        <div className="flex items-center gap-3">
          <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2">
            <Edit3 size={16} />
            Editar Layout
          </button>
          <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Download size={16} />
            Exportar DXF
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col min-h-[600px] relative">
        {/* Toolbar */}
        <div className="absolute top-4 left-4 bg-white border border-zinc-200 rounded-lg shadow-sm p-1 flex flex-col gap-1 z-10">
          <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors" title="Camadas">
            <Layers size={18} />
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors" title="Ajustar à tela">
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Canvas Area (Mocked with CSS) */}
        <div className="flex-1 bg-zinc-50 relative overflow-hidden flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          
          {/* Hexagon Floor Plan Mock */}
          <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            {/* Base Hexagon */}
            <div 
              className="absolute inset-0 border-4 border-zinc-800 bg-white shadow-xl"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              {/* Internal Divisions (Y shape for 3 suites) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-zinc-800 transform rotate-30 origin-center" />
                <div className="w-full h-1 bg-zinc-800 transform -rotate-30 origin-center" />
                <div className="w-1 h-full bg-zinc-800 origin-center" />
              </div>

              {/* Room Labels */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-sm font-bold text-zinc-800">Suíte 1</span>
                <span className="text-xs text-zinc-500 font-mono">24m²</span>
              </div>
              
              <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-sm font-bold text-zinc-800">Suíte 2</span>
                <span className="text-xs text-zinc-500 font-mono">24m²</span>
              </div>

              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
                <span className="text-sm font-bold text-zinc-800">Suíte Master</span>
                <span className="text-xs text-zinc-500 font-mono">32m²</span>
              </div>

              {/* Central Core (Circulation/Stairs) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-zinc-800 bg-zinc-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Circ.</span>
              </div>
            </div>

            {/* Balconies (Outer Hexagon) */}
            <div 
              className="absolute -inset-8 border-2 border-dashed border-emerald-600/50 bg-emerald-50/30 -z-10"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            
            {/* Balcony Labels */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Varanda Panorâmica</span>
            </div>
          </div>

        </div>

        {/* Properties Panel */}
        <div className="h-48 border-t border-zinc-200 bg-white p-6 grid grid-cols-4 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Áreas</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-zinc-500">Área Interna</span><span className="font-medium text-zinc-900">120 m²</span></li>
              <li className="flex justify-between"><span className="text-zinc-500">Varandas</span><span className="font-medium text-zinc-900">45 m²</span></li>
              <li className="flex justify-between pt-2 border-t border-zinc-100"><span className="font-semibold text-zinc-900">Total Construído</span><span className="font-bold text-zinc-900">165 m²</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Ambientes</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-zinc-700">3 Suítes</span></li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-zinc-700">Circulação Central</span></li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-zinc-700">Varanda Perimetral</span></li>
            </ul>
          </div>
          <div className="col-span-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Observações da IA</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              A divisão em 3 setores (120° cada) otimiza a vista panorâmica para todas as suítes. O núcleo central foi reservado para circulação vertical (escada/elevador) e shafts de instalação, garantindo que a periferia do hexágono seja 100% aproveitada para iluminação e ventilação natural.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
