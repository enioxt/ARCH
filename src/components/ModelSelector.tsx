import React from 'react';
import { Cpu, Zap, Star, Crown, Check } from 'lucide-react';
import { getModelsForType, estimateCost, type ModelType, type ModelTier, type AIModel } from '../lib/ai-providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelSelectorProps {
  type: ModelType;
  onSelect: (modelId: string) => void;
  selectedModelId?: string;
}

// ---------------------------------------------------------------------------
// Tier visual config
// ---------------------------------------------------------------------------

interface TierStyle {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: React.ReactNode;
}

const TIER_STYLES: Record<ModelTier, TierStyle> = {
  economy: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Economy',
    icon: <Zap size={12} />,
  },
  standard: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Standard',
    icon: <Cpu size={12} />,
  },
  premium: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    label: 'Premium',
    icon: <Star size={12} />,
  },
  ultra: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Ultra',
    icon: <Crown size={12} />,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCost(model: AIModel): string {
  const cost = estimateCost(model.id);
  const formatted = cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;

  const unitLabels: Record<string, string> = {
    per_image: '/img',
    per_second: '/5s',
    per_model: '/model',
    per_1k_tokens: '/1k tok',
  };

  return `~${formatted} ${unitLabels[model.unit] ?? ''}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ModelSelector({ type, onSelect, selectedModelId }: ModelSelectorProps) {
  const models = getModelsForType(type);

  if (models.length === 0) {
    return (
      <div className="text-sm text-zinc-500 py-6 text-center">
        Nenhum modelo disponível para este tipo.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {models.map((model) => {
        const isSelected = model.id === selectedModelId;
        const tier = TIER_STYLES[model.tier];

        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model.id)}
            className={[
              'relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all',
              isSelected
                ? 'border-zinc-900 bg-zinc-50 ring-2 ring-zinc-900/10'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm',
            ].join(' ')}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}

            {/* Model name */}
            <div className="font-semibold text-sm text-zinc-900">{model.name}</div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Provider badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                {model.provider}
              </span>

              {/* Tier badge */}
              <span
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                  tier.bg,
                  tier.text,
                  tier.border,
                ].join(' ')}
              >
                {tier.icon}
                {tier.label}
              </span>
            </div>

            {/* Cost estimate */}
            <div className="text-xs text-zinc-500 mt-auto pt-1">
              {formatCost(model)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
