import React, { useState, useEffect } from 'react';
import { Video, Loader2, Download, DollarSign, Play, AlertCircle, Crown } from 'lucide-react';

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

const VIDEO_PRESETS = [
  {
    label: 'Walkthrough Exterior',
    prompt: 'Cinematic walkthrough of a 3-story hexagonal stone house in rural Minas Gerais, Brazil. Camera slowly approaches from the tropical garden, past heliconia plants and stone paths, revealing the quartzite stone facade, forged iron spiral staircase, and glass dome rooftop. Golden hour light, professional real estate video, smooth camera movement.',
    duration: 5,
  },
  {
    label: 'Vista Orbital Aerea',
    prompt: 'Cinematic aerial drone shot orbiting a hexagonal stone house in rural Brazil. Camera circles the house at 30 meters height, revealing the glass dome rooftop hot tub, 360-degree balcony with 3 suite sectors, dense tropical garden, kitchen garden with raised beds, and churrasqueira area. Rolling green hills of Minas Gerais in background. Golden hour, professional quality.',
    duration: 8,
  },
  {
    label: 'Interior Walkthrough',
    prompt: 'Smooth interior walkthrough of a hexagonal house. Camera enters through stone doorway into open-plan living room with exposed quartzite walls and wood beam ceiling. Pans across kitchen with stone countertops, then approaches central forged iron spiral staircase, looking up through 3 levels to rooftop skylight. Warm afternoon natural light streaming through floor-to-ceiling glass walls. Professional architectural video.',
    duration: 10,
  },
  {
    label: 'Subida ao Ofuro (Escada → Rooftop)',
    prompt: 'POV camera slowly ascending a forged iron spiral staircase inside a hexagonal house. Stone steps, patinated iron handrail, climbing plants wrapping the staircase. Pass second floor landing with wooden floor and suite doors. Continue up to rooftop, emerging into a glass-enclosed spa area with round hot tub, steam rising, panoramic 360-degree sunset view of Minas Gerais hills. Transition from interior warm light to golden sunset. Cinematic quality.',
    duration: 10,
  },
];

export default function VideoView() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [durationSec, setDurationSec] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<GenerationResult[]>([]);
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(-1);

  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        const videoModels = data.video || [];
        setModels(videoModels);
        const first = videoModels.find((m: ModelInfo) => m.available) || videoModels[0];
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
          durationSeconds: durationSec,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed');

      setVideos(prev => [data.result, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setPrompt(VIDEO_PRESETS[idx].prompt);
    setDurationSec(VIDEO_PRESETS[idx].duration);
  };

  const currentModelCost = models.find(m => m.id === selectedModel)?.costPerUnit ?? 0;
  const estimatedCost = currentModelCost * durationSec;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <Video size={20} />
            Video de Apresentacao
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> Premium
            </span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Gere videos walkthrough, vista orbital e passeios virtuais diretamente via API.
          </p>
        </div>
        {videos.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-zinc-400">Total gasto</div>
            <div className="text-sm font-semibold text-emerald-600">
              R$ {videos.reduce((s, r) => s + r.costBrl, 0).toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Presets */}
      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
          Cenas Pre-definidas
        </label>
        <div className="flex flex-wrap gap-2">
          {VIDEO_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => selectPreset(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedPreset === i
                  ? 'bg-purple-50 border-purple-300 text-purple-700'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Prompt do Video</label>
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setSelectedPreset(-1); }}
            placeholder="Descreva o video que deseja gerar..."
            rows={4}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
          />
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Modelo</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {models.map(m => (
                <option key={m.id} value={m.id} disabled={!m.available}>
                  {m.name} ({m.provider}) — ${m.costPerUnit.toFixed(2)}/s
                  {!m.available ? ' [sem API key]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Duracao</label>
            <select
              value={durationSec}
              onChange={e => setDurationSec(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value={5}>5 segundos</option>
              <option value={8}>8 segundos</option>
              <option value={10}>10 segundos</option>
              <option value={15}>15 segundos</option>
              <option value={30}>30 segundos</option>
            </select>
          </div>

          <div className="text-center px-4">
            <div className="text-xs text-zinc-400">Custo est.</div>
            <div className="text-lg font-bold text-purple-600 flex items-center gap-1">
              <DollarSign size={14} />
              {estimatedCost.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-400">
              R$ {(estimatedCost * 5.5).toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Play size={16} />
                Gerar Video
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

      {/* Video gallery */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            Videos Gerados ({videos.length})
          </h3>
          <div className="space-y-4">
            {videos.map((result, i) => (
              <div key={i} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <video
                  src={result.url}
                  controls
                  className="w-full max-h-[480px] object-contain bg-black"
                />
                <div className="p-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>{result.modelName} ({result.provider})</span>
                  <span className="font-semibold text-purple-600">
                    R$ {result.costBrl.toFixed(2)} — {(result.durationMs / 1000).toFixed(1)}s de processamento
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {videos.length === 0 && !isGenerating && (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-zinc-400">
            <Video size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Selecione uma cena e clique em Gerar Video</p>
            <p className="text-xs mt-1">Video de 5s: ~R$ {(currentModelCost * 5 * 5.5).toFixed(2)} (Transparencia Radical)</p>
          </div>
        </div>
      )}
    </div>
  );
}
