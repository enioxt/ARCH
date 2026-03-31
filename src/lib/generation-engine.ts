/**
 * ARCH Generation Engine
 *
 * Connects directly to AI APIs to generate images and videos.
 * Providers: fal.ai (primary), Together AI (budget), Google GenAI (Imagen)
 *
 * Each provider returns { imageUrl, costUsd, model, provider, durationMs }
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  width?: number;
  height?: number;
  /** For video: duration in seconds */
  durationSeconds?: number;
  /** Optional: reference image URL or base64 for img2img */
  referenceImage?: string;
}

export interface GenerationResult {
  url: string;                // URL or base64 data URI of result
  modelId: string;
  modelName: string;
  provider: string;
  costUsd: number;
  costBrl: number;
  durationMs: number;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

export interface GenerationError {
  error: string;
  provider: string;
  modelId: string;
  statusCode?: number;
}

const USD_TO_BRL = 5.50;

// ---------------------------------------------------------------------------
// Model Registry — maps modelId → provider + endpoint + cost
// ---------------------------------------------------------------------------

interface ModelConfig {
  name: string;
  provider: 'fal' | 'together' | 'google';
  type: 'image' | 'video';
  endpoint: string;         // fal: model path, together: model name, google: model name
  costPerUnit: number;      // USD per image or per second of video
  defaultWidth: number;
  defaultHeight: number;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // === FAL.AI IMAGE ===
  'flux-schnell': {
    name: 'FLUX.1 Schnell',
    provider: 'fal',
    type: 'image',
    endpoint: 'fal-ai/flux/schnell',
    costPerUnit: 0.003,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  'flux-dev': {
    name: 'FLUX.1 Dev',
    provider: 'fal',
    type: 'image',
    endpoint: 'fal-ai/flux/dev',
    costPerUnit: 0.025,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  'flux-pro-1.1': {
    name: 'FLUX 1.1 Pro',
    provider: 'fal',
    type: 'image',
    endpoint: 'fal-ai/flux-pro/v1.1',
    costPerUnit: 0.04,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  'seedream-v4': {
    name: 'Seedream V4',
    provider: 'fal',
    type: 'image',
    endpoint: 'fal-ai/seedream/v4',
    costPerUnit: 0.03,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },

  // === TOGETHER AI IMAGE ===
  'sdxl-turbo': {
    name: 'SDXL Turbo',
    provider: 'together',
    type: 'image',
    endpoint: 'stabilityai/stable-diffusion-xl-base-1.0',
    costPerUnit: 0.002,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  'flux-schnell-free': {
    name: 'FLUX Schnell FREE',
    provider: 'together',
    type: 'image',
    endpoint: 'black-forest-labs/FLUX.1-schnell',
    costPerUnit: 0.0,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },

  // === GOOGLE GENAI (Imagen) ===
  'imagen-4-fast': {
    name: 'Imagen 4.0 Fast',
    provider: 'google',
    type: 'image',
    endpoint: 'imagen-4.0-generate-001',
    costPerUnit: 0.02,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },
  'imagen-4-ultra': {
    name: 'Imagen 4.0 Ultra',
    provider: 'google',
    type: 'image',
    endpoint: 'imagen-4.0-ultra-generate-001',
    costPerUnit: 0.06,
    defaultWidth: 1024,
    defaultHeight: 1024,
  },

  // === FAL.AI VIDEO ===
  'wan-2.5': {
    name: 'Wan 2.5',
    provider: 'fal',
    type: 'video',
    endpoint: 'fal-ai/wan/v2.5/1.3b/text-to-video',
    costPerUnit: 0.05,
    defaultWidth: 1280,
    defaultHeight: 720,
  },
  'kling-2.5': {
    name: 'Kling 2.5',
    provider: 'fal',
    type: 'video',
    endpoint: 'fal-ai/kling-video/v2.5/standard/text-to-video',
    costPerUnit: 0.07,
    defaultWidth: 1280,
    defaultHeight: 720,
  },
  'veo-3.1-fast': {
    name: 'Veo 3.1 Fast',
    provider: 'fal',
    type: 'video',
    endpoint: 'fal-ai/veo3',
    costPerUnit: 0.10,
    defaultWidth: 1920,
    defaultHeight: 1080,
  },
};

// ---------------------------------------------------------------------------
// Provider implementations
// ---------------------------------------------------------------------------

/**
 * fal.ai uses an async queue pattern:
 * 1. POST to queue.fal.run → get request_id + response_url
 * 2. Poll response_url until status is 'COMPLETED'
 * 3. GET the result
 */
async function generateFal(
  config: ModelConfig,
  req: GenerationRequest,
  apiKey: string
): Promise<GenerationResult> {
  const start = Date.now();
  const headers = {
    'Authorization': `Key ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const body: Record<string, unknown> = {
    prompt: req.prompt,
    image_size: config.type === 'image'
      ? { width: req.width ?? config.defaultWidth, height: req.height ?? config.defaultHeight }
      : undefined,
    num_images: 1,
    output_format: 'jpeg',
  };

  if (req.negativePrompt) {
    body.negative_prompt = req.negativePrompt;
  }

  if (config.type === 'video') {
    delete body.image_size;
    delete body.num_images;
    delete body.output_format;
    body.aspect_ratio = '16:9';
    body.duration = String(req.durationSeconds ?? 5);
    body.resolution = '1080p';
  }

  if (req.referenceImage) {
    body.image_url = req.referenceImage;
  }

  // Step 1: Submit to queue
  const submitRes = await fetch(`https://queue.fal.run/${config.endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const errorText = await submitRes.text();
    throw new Error(`fal.ai submit error ${submitRes.status}: ${errorText}`);
  }

  const { request_id, response_url } = await submitRes.json();

  // Step 2: Poll for completion (max 5 minutes)
  const maxWaitMs = 300_000;
  const pollIntervalMs = 2000;
  let elapsed = 0;

  while (elapsed < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    elapsed += pollIntervalMs;

    const statusRes = await fetch(
      `https://queue.fal.run/${config.endpoint}/requests/${request_id}/status`,
      { headers: { 'Authorization': `Key ${apiKey}` } }
    );

    if (!statusRes.ok) continue;

    const statusData = await statusRes.json();
    if (statusData.status === 'COMPLETED') break;
    if (statusData.status === 'FAILED') {
      throw new Error(`fal.ai generation failed: ${statusData.error || 'unknown error'}`);
    }
  }

  // Step 3: Get result
  const resultRes = await fetch(response_url, { headers: { 'Authorization': `Key ${apiKey}` } });

  if (!resultRes.ok) {
    const errorText = await resultRes.text();
    throw new Error(`fal.ai result error ${resultRes.status}: ${errorText}`);
  }

  const data = await resultRes.json();
  const durationMs = Date.now() - start;

  // fal.ai returns images in data.images[0].url and videos in data.video.url
  let resultUrl: string;
  if (config.type === 'video') {
    resultUrl = data.video?.url ?? data.output?.url ?? '';
  } else {
    resultUrl = data.images?.[0]?.url ?? data.output?.url ?? '';
  }

  const costUsd = config.type === 'video'
    ? config.costPerUnit * (req.durationSeconds ?? 5)
    : config.costPerUnit;

  return {
    url: resultUrl,
    modelId: req.modelId,
    modelName: config.name,
    provider: 'fal.ai',
    costUsd,
    costBrl: costUsd * USD_TO_BRL,
    durationMs,
    type: config.type,
    width: req.width ?? config.defaultWidth,
    height: req.height ?? config.defaultHeight,
  };
}

async function generateTogether(
  config: ModelConfig,
  req: GenerationRequest,
  apiKey: string
): Promise<GenerationResult> {
  const start = Date.now();

  const body = {
    model: config.endpoint,
    prompt: req.prompt,
    negative_prompt: req.negativePrompt ?? '',
    width: req.width ?? config.defaultWidth,
    height: req.height ?? config.defaultHeight,
    n: 1,
    response_format: 'url',
  };

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Together AI error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - start;
  const resultUrl = data.data?.[0]?.url ?? data.data?.[0]?.b64_json ?? '';

  return {
    url: resultUrl,
    modelId: req.modelId,
    modelName: config.name,
    provider: 'together-ai',
    costUsd: config.costPerUnit,
    costBrl: config.costPerUnit * USD_TO_BRL,
    durationMs,
    type: 'image',
    width: req.width ?? config.defaultWidth,
    height: req.height ?? config.defaultHeight,
  };
}

async function generateGoogle(
  config: ModelConfig,
  req: GenerationRequest,
  apiKey: string
): Promise<GenerationResult> {
  const start = Date.now();

  // Use @google/genai SDK
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateImages({
    model: config.endpoint,
    prompt: req.prompt,
    config: {
      numberOfImages: 1,
    },
  });

  const durationMs = Date.now() - start;

  // Google GenAI returns base64 image data
  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  const resultUrl = imageBytes
    ? `data:image/png;base64,${imageBytes}`
    : '';

  return {
    url: resultUrl,
    modelId: req.modelId,
    modelName: config.name,
    provider: 'google',
    costUsd: config.costPerUnit,
    costBrl: config.costPerUnit * USD_TO_BRL,
    durationMs,
    type: 'image',
    width: req.width ?? config.defaultWidth,
    height: req.height ?? config.defaultHeight,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an image or video using the specified model.
 * Automatically routes to the correct provider.
 */
export async function generate(
  req: GenerationRequest,
  apiKeys: { fal?: string; together?: string; google?: string }
): Promise<GenerationResult> {
  const config = MODEL_CONFIGS[req.modelId];
  if (!config) {
    throw new Error(`Unknown model: ${req.modelId}. Available: ${Object.keys(MODEL_CONFIGS).join(', ')}`);
  }

  switch (config.provider) {
    case 'fal': {
      if (!apiKeys.fal) throw new Error('FAL_KEY not configured');
      return generateFal(config, req, apiKeys.fal);
    }
    case 'together': {
      if (!apiKeys.together) throw new Error('TOGETHER_API_KEY not configured');
      return generateTogether(config, req, apiKeys.together);
    }
    case 'google': {
      if (!apiKeys.google) throw new Error('GOOGLE_AI_API_KEY not configured');
      return generateGoogle(config, req, apiKeys.google);
    }
  }
}

/**
 * Returns all available models grouped by type.
 */
export function getAvailableModels(apiKeys: { fal?: string; together?: string; google?: string }) {
  const models = Object.entries(MODEL_CONFIGS).map(([id, config]) => {
    const hasKey = (config.provider === 'fal' && !!apiKeys.fal)
      || (config.provider === 'together' && !!apiKeys.together)
      || (config.provider === 'google' && !!apiKeys.google);

    return {
      id,
      ...config,
      available: hasKey,
    };
  });

  return {
    image: models.filter(m => m.type === 'image'),
    video: models.filter(m => m.type === 'video'),
  };
}

/**
 * Estimate cost for a full project.
 */
export function estimateFullProjectCost(tier: 'economy' | 'standard' | 'premium') {
  const tiers = {
    economy: { image: 'sdxl-turbo', video: 'wan-2.5', renders: 4, videoSec: 10 },
    standard: { image: 'flux-dev', video: 'kling-2.5', renders: 4, videoSec: 15 },
    premium: { image: 'flux-pro-1.1', video: 'veo-3.1-fast', renders: 4, videoSec: 30 },
  };

  const t = tiers[tier];
  const imgCost = (MODEL_CONFIGS[t.image]?.costPerUnit ?? 0.02) * t.renders;
  const vidCost = (MODEL_CONFIGS[t.video]?.costPerUnit ?? 0.05) * t.videoSec;
  const chatCost = 0.01;
  const totalUsd = imgCost + vidCost + chatCost;

  return {
    renders: { count: t.renders, model: t.image, costUsd: imgCost },
    video: { seconds: t.videoSec, model: t.video, costUsd: vidCost },
    chat: { costUsd: chatCost },
    totalUsd,
    totalBrl: totalUsd * USD_TO_BRL,
    egosCommission5pct: totalUsd * 0.05,
  };
}
