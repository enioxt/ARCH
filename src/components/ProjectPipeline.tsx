import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Camera, Video, Map, Layers,
  TreePine, Home, DollarSign, Sparkles, ChevronDown,
  ChevronRight, Loader2, Copy, Check
} from 'lucide-react';

interface Deliverable {
  viewType: string;
  label: string;
  priority: string;
}

interface DeliverableGroup {
  category: string;
  items: Deliverable[];
}

interface GeneratedPrompt {
  viewType: string;
  label: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  recommendedModel: string;
  recommendedAspect: string;
  category: string;
  priority: string;
  estimatedCostUsd: number;
}

interface PromptCost {
  essential: { count: number; costUsd: number };
  recommended: { count: number; costUsd: number };
  optional: { count: number; costUsd: number };
  totalUsd: number;
  totalBrl: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Exteriores': <Home size={14} />,
  'Aereas': <Layers size={14} />,
  'Secao': <Layers size={14} />,
  'Interiores': <Home size={14} />,
  'Circulacao': <Layers size={14} />,
  'Area Externa': <TreePine size={14} />,
  'Video': <Video size={14} />,
  'Plantas': <Map size={14} />,
};

const PRIORITY_COLORS: Record<string, string> = {
  essential: 'bg-red-100 text-red-700 border-red-200',
  recommended: 'bg-blue-100 text-blue-700 border-blue-200',
  optional: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

function getIconForCategory(category: string) {
  const key = Object.keys(CATEGORY_ICONS).find(k => category.includes(k));
  return key ? CATEGORY_ICONS[key] : <Camera size={14} />;
}

// Default briefing for Casa Hexagonal (can be overridden by user)
const DEFAULT_BRIEFING = {
  projectName: 'Casa Hexagonal Rustica',
  geometry: 'hexagonal',
  floors: 3,
  totalArea: 150,
  location: 'rural Minas Gerais, Brazil',
  terrain: 'rolling green hills, cattle pasture, cerrado vegetation',
  style: 'rustic-modern',
  materials: ['quartzite stone', 'reclaimed wood', 'forged iron', 'glass'],
  rooms: [
    { name: 'Sala de Estar', floor: 0, description: 'Open-plan living room with home office', keyFeatures: ['floor-to-ceiling glass', 'sound system', 'stone walls'] },
    { name: 'Cozinha', floor: 0, description: 'Integrated kitchen with stone island', keyFeatures: ['stone countertops', 'open shelving', 'bar stools'] },
    { name: 'Suite 1', floor: 1, description: 'Master suite with panoramic view', keyFeatures: ['king bed', 'small closet', 'private balcony', 'ensuite'] },
    { name: 'Suite 2', floor: 1, description: 'Guest suite', keyFeatures: ['king bed', 'closet', 'ensuite', 'balcony access'] },
    { name: 'Suite 3', floor: 1, description: 'Third suite', keyFeatures: ['king bed', 'closet', 'ensuite', 'balcony access'] },
    { name: 'Ofuro / Spa', floor: 2, description: 'Glass-enclosed rooftop hot tub', keyFeatures: ['round 2.5m hot tub', 'privacy glass dome', 'ipe wood deck', '360 view'] },
  ],
  outdoorFeatures: ['churrasqueira under pergola', 'ground fire pit 15m from house with stone benches', 'kitchen garden with raised beds', 'fruit orchard'],
  excludeFeatures: ['swimming pool', 'garage', 'grass lawn'],
  sustainabilityFeatures: ['solar panels', 'rainwater cistern 5000L', 'composting area', 'natural ventilation'],
  specialElements: ['forged iron spiral staircase', '360-degree wraparound balcony', 'rooftop glass dome hot tub'],
  climate: 'tropical highland, 18-30°C, rainy summers',
};

export default function ProjectPipeline() {
  const [deliverables, setDeliverables] = useState<DeliverableGroup[]>([]);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [cost, setCost] = useState<PromptCost | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedViews, setCompletedViews] = useState<Set<string>>(new Set());

  // Load deliverables checklist
  useEffect(() => {
    fetch('/api/prompts/deliverables')
      .then(r => r.json())
      .then(data => setDeliverables(data))
      .catch(() => {});
  }, []);

  // Generate all prompts
  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_BRIEFING),
      });
      const data = await res.json();
      setPrompts(data.prompts || []);
      setCost(data.cost || null);
    } catch {
      // fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = (viewType: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(viewType);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const toggleComplete = (viewType: string) => {
    setCompletedViews(prev => {
      const next = new Set(prev);
      if (next.has(viewType)) next.delete(viewType);
      else next.add(viewType);
      return next;
    });
  };

  const totalDeliverables = deliverables.reduce((s, g) => s + g.items.length, 0);
  const completedCount = completedViews.size;
  const progressPct = totalDeliverables > 0 ? Math.round((completedCount / totalDeliverables) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <Layers size={20} />
            Pipeline de Entregaveis
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Checklist completo de visualizacoes para um projeto arquitetonico profissional.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-900">{progressPct}%</div>
          <div className="text-xs text-zinc-400">{completedCount}/{totalDeliverables} entregaveis</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Generate prompts button */}
      {prompts.length === 0 && (
        <button
          onClick={handleGeneratePrompts}
          disabled={isGenerating}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gerando prompts otimizados...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar Prompts para Todos os Entregaveis ({totalDeliverables})
            </>
          )}
        </button>
      )}

      {/* Cost summary */}
      {cost && (
        <div className="grid grid-cols-4 gap-3">
          {(['essential', 'recommended', 'optional'] as const).map(priority => (
            <div key={priority} className="bg-white border border-zinc-200 rounded-lg p-3 text-center">
              <div className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[priority]} px-2 py-0.5 rounded inline-block mb-1`}>
                {priority}
              </div>
              <div className="text-lg font-bold text-zinc-900">{cost[priority].count}</div>
              <div className="text-xs text-zinc-400">${cost[priority].costUsd.toFixed(3)}</div>
            </div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-emerald-700 mb-1">Total</div>
            <div className="text-lg font-bold text-emerald-700">${cost.totalUsd.toFixed(2)}</div>
            <div className="text-xs text-emerald-600">R$ {cost.totalBrl.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Deliverables groups */}
      {deliverables.map(group => {
        const isExpanded = expandedGroup === group.category;
        const groupCompleted = group.items.filter(i => completedViews.has(i.viewType)).length;

        return (
          <div key={group.category} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedGroup(isExpanded ? null : group.category)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="text-zinc-500">{getIconForCategory(group.category)}</span>
              <span className="font-medium text-sm text-zinc-900 flex-1 text-left">{group.category}</span>
              <span className="text-xs text-zinc-400">{groupCompleted}/{group.items.length}</span>
              <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${group.items.length > 0 ? (groupCompleted / group.items.length) * 100 : 0}%` }}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-100 px-4 py-2 space-y-1">
                {group.items.map(item => {
                  const isCompleted = completedViews.has(item.viewType);
                  const prompt = prompts.find(p => p.viewType === item.viewType);
                  const isPromptExpanded = expandedPrompt === item.viewType;

                  return (
                    <div key={item.viewType} className="py-2">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleComplete(item.viewType)}>
                          {isCompleted
                            ? <CheckCircle2 size={18} className="text-emerald-500" />
                            : <Circle size={18} className="text-zinc-300" />
                          }
                        </button>
                        <span className={`text-sm flex-1 ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority}
                        </span>
                        {prompt && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-400">${prompt.estimatedCostUsd.toFixed(3)}</span>
                            <button
                              onClick={() => setExpandedPrompt(isPromptExpanded ? null : item.viewType)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {isPromptExpanded ? 'Fechar' : 'Ver prompt'}
                            </button>
                            <button
                              onClick={() => copyPrompt(item.viewType, prompt.prompt)}
                              className="p-1 hover:bg-zinc-100 rounded"
                              title="Copiar prompt"
                            >
                              {copiedPrompt === item.viewType
                                ? <Check size={14} className="text-emerald-500" />
                                : <Copy size={14} className="text-zinc-400" />
                              }
                            </button>
                          </div>
                        )}
                      </div>

                      {isPromptExpanded && prompt && (
                        <div className="mt-2 ml-8 p-3 bg-zinc-50 rounded-lg text-xs">
                          <div className="flex gap-2 mb-2">
                            <span className="text-zinc-400">Modelo:</span>
                            <span className="font-medium">{prompt.recommendedModel}</span>
                            <span className="text-zinc-400">Aspecto:</span>
                            <span className="font-medium">{prompt.recommendedAspect}</span>
                          </div>
                          <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                            {prompt.prompt}
                          </div>
                          {prompt.negativePrompt && (
                            <div className="mt-2 text-zinc-400">
                              <span className="font-medium">Negativo:</span> {prompt.negativePrompt}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
