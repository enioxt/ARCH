import React, { useState, useEffect } from 'react';
import { Camera, Loader2, Download, DollarSign, Sparkles, AlertCircle } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  type: string;
  costPerUnit: number;
  available: boolean;
}

interface GenerationResult {
  url: string;
  modelName: string;
  provider: string;
  costUsd: number;
  costBrl: number;
  durationMs: number;
}

const PRESET_PROMPTS = [
  {
    label: 'Exterior — Fachada Principal',
    prompt: 'Photorealistic architectural render of a 3-story hexagonal rural house in Minas Gerais, Brazil. Rough-cut quartzite stone walls, hand-forged iron spiral staircase visible on exterior, dense tropical garden with heliconia and banana trees, wide roof overhangs, golden hour light, cattle pasture in background. NO swimming pool. Style: high-end architectural photography, 24mm lens.',
  },
  {
    label: 'Ofuro Panoramico (Rooftop)',
    prompt: 'Photorealistic render of a rooftop glass-enclosed hot tub/spa area on top of a hexagonal house in rural Brazil. Round hot tub 2.5m diameter, terracotta tile surround, ipe wood benches, semi-opaque privacy glass walls, 360-degree panoramic view of Minas Gerais rolling green hills, golden sunset light, steam rising, tropical plants around glass dome base. Rustic-modern luxury. Architectural photography.',
  },
  {
    label: 'Vista de Cima — Planta',
    prompt: 'Aerial photorealistic render (drone shot, directly from above) of a hexagonal house site. Rooftop: round glass dome with hot tub visible inside. Second floor below: hexagonal form divided into 3 equal sectors (3 suites with closets), 360-degree wraparound balcony connecting all rooms, iron railing with bamboo privacy screens. Dense tropical garden surrounding house, kitchen garden with raised beds, fruit orchard (mango, avocado), NO pool, NO grass lawn. Rural Minas Gerais, golden hour.',
  },
  {
    label: 'Cozinha + Churrasqueira + Lareira',
    prompt: 'Photorealistic architectural render of a ground floor open kitchen area connected to living room in a hexagonal stone house, rural Brazil. Open-plan kitchen with stone countertops, exposed wood beam ceiling. Covered churrasqueira (BBQ area) in front facing the garden, rustic iron and stone construction. 15 meters ahead in the garden: ground-level fire pit (lareira de chao) burning wood, circular stone bench seating around it for 8 people, positioned away from house for smoke. Stone path connecting kitchen to fire pit area. Dense tropical garden on sides. Evening light, warm amber tones. NO pool.',
  },
  {
    label: 'Interior — Suite Master',
    prompt: 'Photorealistic interior render. Master bedroom in hexagonal house, trapezoidal room, one full glass wall facing rural Minas Gerais landscape. Quartzite stone walls, reclaimed wood ceiling beams. King bed on reclaimed wood platform, stone block nightstands, hand-forged iron wall sconces. Private balcony through sliding glass door, iron railing, hammock visible. Wooden ceiling fan. Warm afternoon light. Architectural photography.',
  },
  {
    label: 'Escada Espiral Central',
    prompt: 'Photorealistic interior render. Central spiral staircase inside a hexagonal house connecting 3 levels. Hand-forged iron with thick patinated handrail, quartzite stone steps. Skylight at rooftop level lets natural light cascade down 8 meters. Ground floor: living room with exposed stone wall visible. Second floor landing: wooden floor, 3 suite doors. Climbing plants wrapping the staircase. Warm afternoon light beam from above. Wide angle architectural photography.',
  },
];

export default function RendersView() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, watermark, text overlay');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GenerationResult[]>([]);
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(-1);

  // Load available models
  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        const imageModels = data.image || [];
        setModels(imageModels);
        const first = imageModels.find((m: ModelInfo) => m.available) || imageModels[0];
        if (first) setSelectedModel(first.id);
      })
      .catch(() => setModels([]));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          modelId: selectedModel,
          negativePrompt,
          width: 1024,
          height: 1024,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setGallery(prev => [data.result, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setPrompt(PRESET_PROMPTS[idx].prompt);
  };

  const currentModelCost = models.find(m => m.id === selectedModel)?.costPerUnit ?? 0;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <Camera size={20} />
            Renders Fotorrealistas
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Gere imagens diretamente via API — escolha o modelo, ajuste o prompt, veja o custo em tempo real.
          </p>
        </div>
        {gallery.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-zinc-400">Total gasto</div>
            <div className="text-sm font-semibold text-emerald-600">
              R$ {gallery.reduce((s, r) => s + r.costBrl, 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Preset prompts */}
      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
          Prompts Pre-definidos — Casa Hexagonal
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => selectPreset(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedPreset === i
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generation controls */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
        {/* Prompt */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setSelectedPreset(-1); }}
            placeholder="Descreva a imagem que deseja gerar..."
            rows={4}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>

        {/* Negative prompt */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Prompt Negativo</label>
          <input
            value={negativePrompt}
            onChange={e => setNegativePrompt(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Model selector + cost */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Modelo</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {models.map(m => (
                <option key={m.id} value={m.id} disabled={!m.available}>
                  {m.name} ({m.provider}) — ${m.costPerUnit.toFixed(3)}/img
                  {!m.available ? ' [sem API key]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center px-4">
            <div className="text-xs text-zinc-400">Custo</div>
            <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
              <DollarSign size={14} />
              {currentModelCost.toFixed(3)}
            </div>
            <div className="text-[10px] text-zinc-400">
              R$ {(currentModelCost * 5.5).toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Gerar Render
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            Galeria ({gallery.length} render{gallery.length > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {gallery.map((result, i) => (
              <div key={i} className="bg-white rounded-xl border border-zinc-200 overflow-hidden group">
                <div className="relative aspect-square">
                  <img
                    src={result.url}
                    alt={`Render ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={result.url}
                    download={`render-${i + 1}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={16} />
                  </a>
                </div>
                <div className="p-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>{result.modelName} ({result.provider})</span>
                  <span className="font-semibold text-emerald-600">
                    R$ {result.costBrl.toFixed(2)} — {(result.durationMs / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {gallery.length === 0 && !isGenerating && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-zinc-400">
            <Camera size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Selecione um prompt e clique em Gerar Render</p>
            <p className="text-xs mt-1">Custo visivel antes de gerar — Transparencia Radical</p>
          </div>
        </div>
      )}
    </div>
  );
}
