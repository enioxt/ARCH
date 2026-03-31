/**
 * Model Gem Hunter — ARCH
 *
 * Descobre e rankeia modelos de IA por custo-beneficio (quality/cost ratio).
 * Inspirado no gem_hunter pattern do EGOS kernel.
 *
 * Fontes: fal.ai, Together AI, Replicate, Hugging Face, OpenRouter
 *
 * Uso:
 *   import { getGemModels, getGemsByType } from './model-gem-hunter'
 *   const imageGems = getGemsByType('image')
 */

export interface GemModel {
  id: string;
  name: string;
  provider: string;
  type: 'image' | 'video' | '3d' | 'chat';
  costPerUnit: number;
  unit: string;
  qualityScore: number;     // 1-10 (10 = top tier like Imagen 4 Ultra)
  valueRatio: number;       // qualityScore / costPerUnit (higher = better gem)
  freeAccess: string | null; // URL for free access (Hugging Face, etc.)
  apiAccess: string;         // Provider for API access
  notes: string;
}

// Gem models — cheap but surprisingly good quality
const GEM_REGISTRY: GemModel[] = [
  // === IMAGE GEMS ===
  {
    id: 'flux-schnell',
    name: 'FLUX.1 Schnell',
    provider: 'Black Forest Labs',
    type: 'image',
    costPerUnit: 0.003,
    unit: 'per_image',
    qualityScore: 7,
    valueRatio: 2333,
    freeAccess: 'https://huggingface.co/spaces/black-forest-labs/FLUX.1-schnell',
    apiAccess: 'fal.ai / Replicate / Together AI',
    notes: '4-step inference, muito rapido. Qualidade surpreendente para o preco.'
  },
  {
    id: 'sdxl-turbo',
    name: 'SDXL Turbo',
    provider: 'Stability AI',
    type: 'image',
    costPerUnit: 0.002,
    unit: 'per_image',
    qualityScore: 6,
    valueRatio: 3000,
    freeAccess: 'https://huggingface.co/spaces/stabilityai/sdxl-turbo',
    apiAccess: 'Together AI / Fireworks',
    notes: 'Mais barato que existe. Bom para prototipagem rapida.'
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    provider: 'Black Forest Labs',
    type: 'image',
    costPerUnit: 0.015,
    unit: 'per_image',
    qualityScore: 8,
    valueRatio: 533,
    freeAccess: 'https://huggingface.co/spaces/black-forest-labs/FLUX.1-dev',
    apiAccess: 'fal.ai / Replicate / Together AI',
    notes: 'Melhor custo-beneficio geral. Quase tao bom quanto Flux Pro.'
  },
  {
    id: 'seedream-v4',
    name: 'Seedream V4',
    provider: 'ByteDance',
    type: 'image',
    costPerUnit: 0.03,
    unit: 'per_image',
    qualityScore: 8,
    valueRatio: 267,
    freeAccess: null,
    apiAccess: 'fal.ai',
    notes: 'Novo modelo da ByteDance, qualidade excelente, bom para arquitetura.'
  },
  {
    id: 'flux-1.1-pro',
    name: 'FLUX 1.1 Pro',
    provider: 'Black Forest Labs',
    type: 'image',
    costPerUnit: 0.04,
    unit: 'per_image',
    qualityScore: 9,
    valueRatio: 225,
    freeAccess: null,
    apiAccess: 'fal.ai / Replicate',
    notes: 'Top tier acessivel. Melhor que DALL-E 3 em muitos benchmarks.'
  },
  {
    id: 'imagen-4-fast',
    name: 'Imagen 4.0 Fast',
    provider: 'Google',
    type: 'image',
    costPerUnit: 0.02,
    unit: 'per_image',
    qualityScore: 8,
    valueRatio: 400,
    freeAccess: 'https://aistudio.google.com',
    apiAccess: 'Together AI / Vertex AI',
    notes: 'Google Imagen mais barato. Acesso gratis via AI Studio.'
  },
  {
    id: 'imagen-4-ultra',
    name: 'Imagen 4.0 Ultra',
    provider: 'Google',
    type: 'image',
    costPerUnit: 0.06,
    unit: 'per_image',
    qualityScore: 10,
    valueRatio: 167,
    freeAccess: 'https://aistudio.google.com',
    apiAccess: 'Together AI / Vertex AI',
    notes: 'Melhor modelo de imagem atual. Referencia top tier.'
  },

  // === VIDEO GEMS ===
  {
    id: 'wan-2.5',
    name: 'Wan 2.5',
    provider: 'Alibaba',
    type: 'video',
    costPerUnit: 0.05,
    unit: 'per_second',
    qualityScore: 7,
    valueRatio: 140,
    freeAccess: null,
    apiAccess: 'fal.ai / Alibaba DashScope',
    notes: 'Mais barato para video. Ja temos quota no DashScope.'
  },
  {
    id: 'kling-2.5-turbo',
    name: 'Kling 2.5 Turbo',
    provider: 'Kuaishou',
    type: 'video',
    costPerUnit: 0.07,
    unit: 'per_second',
    qualityScore: 8,
    valueRatio: 114,
    freeAccess: 'https://klingai.com',
    apiAccess: 'fal.ai',
    notes: 'Otimo custo-beneficio. 5s gratis por dia no site.'
  },
  {
    id: 'veo-3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'Google',
    type: 'video',
    costPerUnit: 0.10,
    unit: 'per_second',
    qualityScore: 9,
    valueRatio: 90,
    freeAccess: 'https://aistudio.google.com',
    apiAccess: 'fal.ai / Vertex AI',
    notes: 'Melhor video por preco. Versao Fast 4x mais barata que Standard.'
  },

  // === 3D GEMS ===
  {
    id: 'triposr',
    name: 'TripoSR',
    provider: 'Tripo AI / Stability',
    type: '3d',
    costPerUnit: 0.07,
    unit: 'per_model',
    qualityScore: 6,
    valueRatio: 86,
    freeAccess: 'https://huggingface.co/spaces/stabilityai/TripoSR',
    apiAccess: 'fal.ai / Replicate',
    notes: 'Unico modelo 3D acessivel. Gratis no Hugging Face.'
  },
  {
    id: 'tripo3d-v2.5',
    name: 'Tripo3D v2.5',
    provider: 'Tripo AI',
    type: '3d',
    costPerUnit: 0.40,
    unit: 'per_model',
    qualityScore: 8,
    valueRatio: 20,
    freeAccess: null,
    apiAccess: 'fal.ai',
    notes: 'Melhor qualidade 3D disponivel via API.'
  },

  // === CHAT GEMS ===
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    type: 'chat',
    costPerUnit: 0.10,
    unit: 'per_1M_tokens',
    qualityScore: 8,
    valueRatio: 80,
    freeAccess: 'https://aistudio.google.com',
    apiAccess: 'OpenRouter (ja integrado)',
    notes: 'Ja usado no ARCH. Excelente para briefings arquitetonicos.'
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: 'Alibaba',
    type: 'chat',
    costPerUnit: 0.08,
    unit: 'per_1M_tokens',
    qualityScore: 7,
    valueRatio: 88,
    freeAccess: null,
    apiAccess: 'Alibaba DashScope (ja integrado)',
    notes: 'Mais barato que Gemini. Orquestrador primario do EGOS.'
  },
];

/**
 * Returns all gem models sorted by value ratio (best gems first)
 */
export function getGemModels(): GemModel[] {
  return [...GEM_REGISTRY].sort((a, b) => b.valueRatio - a.valueRatio);
}

/**
 * Returns gems filtered by type, sorted by value ratio
 */
export function getGemsByType(type: GemModel['type']): GemModel[] {
  return GEM_REGISTRY
    .filter(m => m.type === type)
    .sort((a, b) => b.valueRatio - a.valueRatio);
}

/**
 * Returns only models with free access (Hugging Face, AI Studio, etc.)
 */
export function getFreeGems(): GemModel[] {
  return GEM_REGISTRY
    .filter(m => m.freeAccess !== null)
    .sort((a, b) => b.valueRatio - a.valueRatio);
}

/**
 * Returns the best gem (highest value ratio) for a given type
 */
export function getBestGem(type: GemModel['type']): GemModel | undefined {
  const gems = getGemsByType(type);
  return gems[0];
}

/**
 * Returns cost estimate for a full project using specified tier
 */
export function estimateProjectCost(tier: 'economy' | 'standard' | 'premium'): {
  renders4: number;
  video30s: number;
  model3d: number;
  chat: number;
  totalUsd: number;
  totalBrl: number;
} {
  const imageGems = getGemsByType('image');
  const videoGems = getGemsByType('video');
  const gems3d = getGemsByType('3d');

  const tierIndex = tier === 'economy' ? 0 : tier === 'standard' ? Math.floor(imageGems.length / 2) : imageGems.length - 1;

  const imageModel = imageGems[Math.min(tierIndex, imageGems.length - 1)];
  const videoModel = videoGems[Math.min(tierIndex, videoGems.length - 1)];
  const model3d = gems3d[Math.min(tierIndex, gems3d.length - 1)];

  const renders4 = (imageModel?.costPerUnit ?? 0.04) * 4;
  const video30s = (videoModel?.costPerUnit ?? 0.05) * 30;
  const model3dCost = model3d?.costPerUnit ?? 0.07;
  const chat = 0.01;

  const totalUsd = renders4 + video30s + model3dCost + chat;
  const BRL_RATE = 5.50;

  return {
    renders4,
    video30s,
    model3d: model3dCost,
    chat,
    totalUsd,
    totalBrl: totalUsd * BRL_RATE,
  };
}
