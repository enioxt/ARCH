// Multi-provider AI router for ARCH
// Supports fal.ai, together-ai, and openrouter

export type ModelType = 'image' | 'video' | '3d' | 'chat';
export type ModelTier = 'economy' | 'standard' | 'premium' | 'ultra';
export type CostUnit = 'per_image' | 'per_second' | 'per_model' | 'per_1k_tokens';

export interface AIModel {
  id: string;
  name: string;
  type: ModelType;
  tier: ModelTier;
  costPerUnit: number; // USD
  unit: CostUnit;
  provider: string;
}

export interface AIProvider {
  name: string;
  baseUrl: string;
  models: AIModel[];
  apiKeyEnvVar: string;
}

const TIER_ORDER: Record<ModelTier, number> = {
  economy: 0,
  standard: 1,
  premium: 2,
  ultra: 3,
};

// ---------------------------------------------------------------------------
// Provider definitions
// ---------------------------------------------------------------------------

const falProvider: AIProvider = {
  name: 'fal.ai',
  baseUrl: 'https://fal.run',
  apiKeyEnvVar: 'FAL_KEY',
  models: [
    {
      id: 'fal-flux-1.1-pro',
      name: 'FLUX 1.1 Pro',
      type: 'image',
      tier: 'premium',
      costPerUnit: 0.04,
      unit: 'per_image',
      provider: 'fal.ai',
    },
    {
      id: 'fal-seedream-v4',
      name: 'SeedReam v4',
      type: 'image',
      tier: 'standard',
      costPerUnit: 0.03,
      unit: 'per_image',
      provider: 'fal.ai',
    },
    {
      id: 'fal-wan-2.5',
      name: 'Wan 2.5',
      type: 'video',
      tier: 'standard',
      costPerUnit: 0.05,
      unit: 'per_second',
      provider: 'fal.ai',
    },
    {
      id: 'fal-kling-2.5',
      name: 'Kling 2.5',
      type: 'video',
      tier: 'premium',
      costPerUnit: 0.07,
      unit: 'per_second',
      provider: 'fal.ai',
    },
    {
      id: 'fal-veo-3.1-fast',
      name: 'Veo 3.1 Fast',
      type: 'video',
      tier: 'ultra',
      costPerUnit: 0.10,
      unit: 'per_second',
      provider: 'fal.ai',
    },
    {
      id: 'fal-triposr',
      name: 'TripoSR',
      type: '3d',
      tier: 'standard',
      costPerUnit: 0.07,
      unit: 'per_model',
      provider: 'fal.ai',
    },
  ],
};

const togetherProvider: AIProvider = {
  name: 'together-ai',
  baseUrl: 'https://api.together.xyz/v1',
  apiKeyEnvVar: 'TOGETHER_API_KEY',
  models: [
    {
      id: 'together-sdxl',
      name: 'SDXL',
      type: 'image',
      tier: 'economy',
      costPerUnit: 0.002,
      unit: 'per_image',
      provider: 'together-ai',
    },
    {
      id: 'together-flux-dev',
      name: 'FLUX Dev',
      type: 'image',
      tier: 'standard',
      costPerUnit: 0.015,
      unit: 'per_image',
      provider: 'together-ai',
    },
    {
      id: 'together-imagen-4-fast',
      name: 'Imagen 4 Fast',
      type: 'image',
      tier: 'standard',
      costPerUnit: 0.02,
      unit: 'per_image',
      provider: 'together-ai',
    },
    {
      id: 'together-imagen-4-ultra',
      name: 'Imagen 4 Ultra',
      type: 'image',
      tier: 'ultra',
      costPerUnit: 0.06,
      unit: 'per_image',
      provider: 'together-ai',
    },
  ],
};

const openrouterProvider: AIProvider = {
  name: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  models: [
    {
      id: 'openrouter-gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      type: 'chat',
      tier: 'economy',
      costPerUnit: 0.0001, // $0.10 per 1M tokens → $0.0001 per 1k tokens
      unit: 'per_1k_tokens',
      provider: 'openrouter',
    },
  ],
};

// ---------------------------------------------------------------------------
// All providers & models
// ---------------------------------------------------------------------------

export const providers: AIProvider[] = [
  falProvider,
  togetherProvider,
  openrouterProvider,
];

const allModels: AIModel[] = providers.flatMap((p) => p.models);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns models of the given type, sorted by tier (economy → ultra). */
export function getModelsForType(type: ModelType): AIModel[] {
  return allModels
    .filter((m) => m.type === type)
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

/** Finds a model by its unique id, or undefined if not found. */
export function getModelById(id: string): AIModel | undefined {
  return allModels.find((m) => m.id === id);
}

export interface EstimateCostParams {
  count?: number;
  seconds?: number;
  resolution?: string; // reserved for future resolution-based pricing
}

/**
 * Estimates the USD cost for a generation request.
 *
 * - Images: costPerUnit * count (default 1)
 * - Video:  costPerUnit * seconds (default 5)
 * - 3D:     costPerUnit * count (default 1)
 * - Chat:   costPerUnit * count (count = thousands of tokens, default 1)
 */
export function estimateCost(modelId: string, params: EstimateCostParams = {}): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  switch (model.unit) {
    case 'per_image':
      return model.costPerUnit * (params.count ?? 1);
    case 'per_second':
      return model.costPerUnit * (params.seconds ?? 5);
    case 'per_model':
      return model.costPerUnit * (params.count ?? 1);
    case 'per_1k_tokens':
      return model.costPerUnit * (params.count ?? 1);
  }
}
