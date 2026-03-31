/**
 * ARCH Meta-Prompt Generator
 *
 * Takes structured briefing data and generates world-class prompts
 * for each required architectural view. Based on best practices from:
 * - Midjourney architecture community
 * - ArchViz professional standards (CGArchitect, Ronen Bekerman)
 * - V-Ray / Corona render reference language
 * - Real estate photography composition rules
 *
 * Output: optimized prompts ready to send to any image/video generation API.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectBriefing {
  projectName: string;
  geometry: string;           // e.g. 'hexagonal', 'retangular', 'circular'
  floors: number;
  totalArea: number;          // m²
  location: string;           // e.g. 'rural Minas Gerais, Brazil'
  terrain: string;            // e.g. 'rolling hills, pasture, cerrado'
  style: string;              // e.g. 'rustic-modern', 'contemporary', 'tropical'
  materials: string[];        // e.g. ['quartzite stone', 'reclaimed wood', 'forged iron']
  rooms: RoomSpec[];
  outdoorFeatures: string[];  // e.g. ['churrasqueira', 'fire pit', 'kitchen garden']
  excludeFeatures: string[];  // e.g. ['pool', 'garage']
  sustainabilityFeatures: string[];
  specialElements: string[];  // e.g. ['rooftop hot tub', 'spiral staircase', '360 balcony']
  climate: string;            // e.g. 'tropical highland, 18-30°C'
  budget?: string;
}

export interface RoomSpec {
  name: string;
  floor: number;              // 0 = ground, 1 = second, 2 = rooftop
  description: string;
  keyFeatures: string[];
}

export type ViewType =
  | 'exterior_front'
  | 'exterior_side'
  | 'exterior_rear'
  | 'exterior_night'
  | 'aerial_top_down'
  | 'aerial_45deg'
  | 'cross_section'
  | 'interior_living'
  | 'interior_kitchen'
  | 'interior_bedroom'
  | 'interior_bathroom'
  | 'circulation'
  | 'outdoor_social'
  | 'rooftop'
  | 'landscape_context'
  | 'video_walkthrough'
  | 'video_orbital'
  | 'video_interior'
  | 'floor_plan_ground'
  | 'floor_plan_upper'
  | 'floor_plan_roof';

export interface GeneratedPrompt {
  viewType: ViewType;
  label: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  recommendedModel: string;
  recommendedAspect: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
  category: 'image' | 'video' | 'plan';
  priority: 'essential' | 'recommended' | 'optional';
  estimatedCostUsd: number;
}

// ---------------------------------------------------------------------------
// Prompt construction rules (ArchViz best practices)
// ---------------------------------------------------------------------------

const ARCHVIZ_RULES = {
  photoQuality: 'Photorealistic architectural render, professional photography quality, 8K resolution',
  lighting: {
    day: 'golden hour natural light, soft shadows, warm color temperature 5500K',
    night: 'warm amber interior light, subtle landscape uplighting, clear sky',
    overcast: 'soft diffused overcast light, even shadows, moody atmosphere',
    sunset: 'dramatic sunset golden light, long shadows, warm-cool contrast',
  },
  camera: {
    exterior: '24mm wide angle lens, f/8, slight upward angle, dramatic foreground',
    interior: '16mm ultra-wide angle, f/5.6, eye-level height 1.5m, converging lines',
    aerial: 'drone shot, 50mm equivalent, nadir or 45-degree angle',
    detail: '85mm portrait lens, f/2.8, shallow depth of field, close-up',
  },
  composition: {
    rule_of_thirds: 'subject placed at intersection of thirds',
    leading_lines: 'paths, walls, and edges guide the eye to focal point',
    foreground_interest: 'plants, furniture, or materials in foreground for depth',
    framing: 'architectural elements frame the main view',
  },
  materials_language: {
    stone: 'rough-cut natural stone, irregular blocks, organic texture, weathered patina',
    wood: 'reclaimed hardwood, hand-hewn beams, natural grain visible, wax/oil finish',
    iron: 'hand-forged dark iron, artisan craftsmanship, patinated warm-brown surface',
    glass: 'floor-to-ceiling glass panels, minimal frames, indoor-outdoor continuity',
    concrete: 'exposed board-formed concrete, subtle texture, warm grey tone',
  },
  negative_universal: 'blurry, low quality, distorted, watermark, text overlay, cartoon, anime, illustration, CGI look, plastic, unrealistic lighting, oversaturated, HDR look, chromatic aberration',
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function buildMaterialsString(materials: string[]): string {
  return materials
    .map(m => ARCHVIZ_RULES.materials_language[m as keyof typeof ARCHVIZ_RULES.materials_language] || m)
    .join(', ');
}

function buildExclusionString(excludes: string[]): string {
  return excludes.map(e => `NO ${e}`).join('. ') + '.';
}

function buildRoomDescription(rooms: RoomSpec[], floor: number): string {
  return rooms
    .filter(r => r.floor === floor)
    .map(r => `${r.name}: ${r.description} (${r.keyFeatures.join(', ')})`)
    .join('. ');
}

/**
 * Generates ALL prompts needed for a complete architectural project.
 * Returns them sorted by priority (essential first).
 */
export function generateProjectPrompts(briefing: ProjectBriefing): GeneratedPrompt[] {
  const mats = buildMaterialsString(briefing.materials);
  const exclusions = buildExclusionString(briefing.excludeFeatures);
  const groundRooms = buildRoomDescription(briefing.rooms, 0);
  const upperRooms = buildRoomDescription(briefing.rooms, 1);
  const rooftopDesc = buildRoomDescription(briefing.rooms, 2);
  const sustainStr = briefing.sustainabilityFeatures.join(', ');
  const specialStr = briefing.specialElements.join(', ');
  const outdoorStr = briefing.outdoorFeatures.join(', ');

  const base = `${briefing.geometry} house, ${briefing.floors} floors, ${briefing.totalArea}m², ${briefing.location}`;
  const styleTag = `Style: ${briefing.style}`;
  const terrainTag = `Surroundings: ${briefing.terrain}`;

  const prompts: GeneratedPrompt[] = [
    // === ESSENTIAL: Exterior views ===
    {
      viewType: 'exterior_front',
      label: 'Fachada Principal — Dia',
      description: 'Vista frontal principal da edificacao com paisagismo',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Front elevation view of a ${base}. ${styleTag}. Materials: ${mats}. Ground floor visible: ${groundRooms}. ${terrainTag}. ${exclusions} Special elements: ${specialStr}. Dense landscape with tropical plants at building base. ${ARCHVIZ_RULES.lighting.day}. ${ARCHVIZ_RULES.camera.exterior}. ${ARCHVIZ_RULES.composition.foreground_interest}.`,
    },
    {
      viewType: 'exterior_side',
      label: 'Vista Lateral — Materialidade',
      description: 'Vista lateral mostrando materiais e texturas',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Side elevation of a ${base}. FOCUS on materials and construction quality: ${mats}. Walls showing natural aging and patina. Living wall / vertical garden on one face. ${terrainTag}. ${exclusions} ${ARCHVIZ_RULES.lighting.overcast}. ${ARCHVIZ_RULES.camera.exterior}. Low angle emphasizing material texture and craftsmanship.`,
    },
    {
      viewType: 'exterior_night',
      label: 'Vista Noturna — Atmosfera',
      description: 'Iluminacao noturna revelando interiores',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Night exterior view of a ${base}. ${ARCHVIZ_RULES.lighting.night}. Interior warm light glowing through glass panels, casting patterns on ${briefing.materials[0]} walls. ${specialStr} illuminated subtly. Flush path lights, fire bowl near entrance. Clear Milky Way sky visible. ${terrainTag} as dark silhouette. ${exclusions} Long exposure effect, bokeh, ISO grain texture.`,
    },

    // === ESSENTIAL: Aerial views ===
    {
      viewType: 'aerial_top_down',
      label: 'Vista Aerea — Planta do Topo',
      description: 'Vista de cima mostrando layout dos pavimentos',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '1:1',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Top-down aerial drone view (nadir) of a ${base}. Rooftop: ${rooftopDesc || specialStr}. Second floor visible below: ${upperRooms}. Ground floor at edges: ${groundRooms}. Outdoor: ${outdoorStr}. Site layout: dense tropical garden, ${exclusions} ${terrainTag}. Sustainability: ${sustainStr}. ${ARCHVIZ_RULES.camera.aerial}. ${ARCHVIZ_RULES.lighting.day}.`,
    },
    {
      viewType: 'aerial_45deg',
      label: 'Vista Aerea — 45 Graus',
      description: 'Perspectiva aerea mostrando volumetria e entorno',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Aerial drone shot at 45-degree angle of a ${base}. Full volumetry visible: ${briefing.floors} levels with ${specialStr}. Materials: ${mats}. Site context: ${terrainTag}. Outdoor areas: ${outdoorStr}. ${exclusions} Professional real estate drone photography. ${ARCHVIZ_RULES.lighting.sunset}.`,
    },

    // === ESSENTIAL: Cross-section ===
    {
      viewType: 'cross_section',
      label: 'Secao Transversal — Todos os Andares',
      description: 'Corte mostrando todos os pavimentos simultaneamente',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '4:3',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal + ', exterior background visible',
      prompt: `Architectural cross-section render of a ${base}, sliced in half showing all ${briefing.floors} levels simultaneously. Ground floor (3.2m height): ${groundRooms}. Second floor (3.0m): ${upperRooms}. Rooftop (2.5m): ${rooftopDesc || specialStr}. Central circulation: ${briefing.specialElements.find(e => e.includes('staircase')) || 'staircase connecting all levels'}. Materials: ${mats}. Annotations with heights. Natural light entering through glass walls. White background on cut surfaces. Professional architectural rendering.`,
    },

    // === ESSENTIAL: Interior views ===
    {
      viewType: 'interior_living',
      label: 'Interior — Area Social',
      description: 'Sala de estar e areas integradas',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Interior wide-angle shot of the ground floor of a ${base}. Open-plan layout: ${groundRooms}. Materials: ${mats}. Ceiling: exposed wood beams. Floor: large natural stone tiles. Glass walls open to landscape. ${specialStr} visible. ${ARCHVIZ_RULES.camera.interior}. ${ARCHVIZ_RULES.lighting.day}. ${ARCHVIZ_RULES.composition.leading_lines}.`,
    },
    {
      viewType: 'interior_kitchen',
      label: 'Interior — Cozinha Integrada',
      description: 'Cozinha com fluxo para area social e exterior',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Kitchen area of a ${base}. Open to living room, NO walls between them. Stone countertops, open shelving in reclaimed wood, ${mats}. View through open glass doors to outdoor: ${outdoorStr}. Continuous floor from kitchen to terrace. ${ARCHVIZ_RULES.camera.interior}. ${ARCHVIZ_RULES.lighting.day}. Warm, inviting atmosphere.`,
    },
    {
      viewType: 'interior_bedroom',
      label: 'Interior — Suite Principal',
      description: 'Suite master com vista panoramica',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Master bedroom in the ${briefing.geometry} house, ${briefing.location}. Trapezoidal room shape. One full glass wall facing landscape. Walls: ${briefing.materials[0]}. Ceiling: ${briefing.materials[1] || 'exposed beams'}. King bed on low platform, natural textiles. Private balcony visible through sliding glass. ${ARCHVIZ_RULES.camera.interior}. ${ARCHVIZ_RULES.lighting.day}. Calm, restful atmosphere.`,
    },
    {
      viewType: 'interior_bathroom',
      label: 'Interior — Banheiro em Pedra',
      description: 'Banheiro com materiais naturais de durabilidade',
      category: 'image',
      priority: 'optional',
      recommendedModel: 'flux-schnell',
      recommendedAspect: '4:3',
      estimatedCostUsd: 0.003,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Ensuite bathroom in ${briefing.geometry} house. Natural materials that improve with age: ${briefing.materials[0]} wall sealed for water, hexagonal stone floor tiles, open concept shower with rainfall head, sculpted stone basin sink. Skylight above shower, frosted glass ventilation opening. Trailing monstera plant. ${ARCHVIZ_RULES.camera.detail}. Steamy, intimate atmosphere.`,
    },

    // === RECOMMENDED: Circulation ===
    {
      viewType: 'circulation',
      label: 'Circulacao — Escada Central',
      description: 'Escada conectando todos os pavimentos',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '3:4',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Central ${briefing.specialElements.find(e => e.includes('staircase')) || 'spiral staircase'} inside a ${base}. Connecting ${briefing.floors} levels. Materials: ${mats}. Skylight at top lets natural light cascade down. Climbing plants wrapping the structure. Ground floor visible: living room. Upper landing: bedroom doors. ${ARCHVIZ_RULES.camera.interior}. Dramatic vertical composition.`,
    },

    // === RECOMMENDED: Outdoor social ===
    {
      viewType: 'outdoor_social',
      label: 'Area Externa — Social',
      description: 'Churrasqueira, lareira, jardim, area de convivio',
      category: 'image',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.025,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Outdoor social area of a ${base}. Features: ${outdoorStr}. House glass walls glowing warm in background. Stone paths connecting areas. ${terrainTag}. ${exclusions} Early evening atmosphere, fire burning, warm social scene. ${ARCHVIZ_RULES.lighting.sunset}. Lifestyle architectural photography.`,
    },

    // === ROOFTOP ===
    {
      viewType: 'rooftop',
      label: 'Rooftop — Ofuro/Spa',
      description: 'Area de cobertura com vista panoramica',
      category: 'image',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.04,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Rooftop level of a ${base}. ${rooftopDesc || specialStr}. Arriving at top of staircase, looking into glass-enclosed rooftop space. 360-degree panoramic view of ${briefing.terrain}. Steam rising, golden sunset light filtered through glass. Tropical plants. Intimate luxury atmosphere. ${ARCHVIZ_RULES.camera.interior}.`,
    },

    // === LANDSCAPE ===
    {
      viewType: 'landscape_context',
      label: 'Contexto — Casa no Terreno',
      description: 'Vista distante mostrando integracao com entorno',
      category: 'image',
      priority: 'optional',
      recommendedModel: 'flux-schnell',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.003,
      negativePrompt: ARCHVIZ_RULES.negative_universal,
      prompt: `${ARCHVIZ_RULES.photoQuality}. Wide landscape view of a ${base} from 100m distance. House sitting naturally in the ${briefing.terrain}. Dense tropical garden around the house. Access road visible. Scale of building relative to landscape. ${exclusions} ${ARCHVIZ_RULES.lighting.day}. Landscape photography, 50mm lens.`,
    },

    // === VIDEO ===
    {
      viewType: 'video_walkthrough',
      label: 'Video — Walkthrough Exterior',
      description: 'Camera se aproximando pela entrada principal',
      category: 'video',
      priority: 'recommended',
      recommendedModel: 'wan-2.5',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.50,
      negativePrompt: '',
      prompt: `Cinematic walkthrough of a ${base}. Camera slowly approaches from the tropical garden, past plants and stone paths, revealing the ${briefing.materials[0]} facade, ${specialStr}. ${ARCHVIZ_RULES.lighting.sunset}. Professional real estate video, smooth camera movement, 4K quality.`,
    },
    {
      viewType: 'video_orbital',
      label: 'Video — Vista Orbital',
      description: 'Drone circulando a edificacao',
      category: 'video',
      priority: 'recommended',
      recommendedModel: 'wan-2.5',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.50,
      negativePrompt: '',
      prompt: `Cinematic aerial drone shot orbiting a ${base} at 30 meters height. Revealing: ${specialStr}, outdoor areas (${outdoorStr}), dense garden, ${briefing.terrain} in background. ${ARCHVIZ_RULES.lighting.day}. Professional drone video, smooth orbit, 4K.`,
    },
    {
      viewType: 'video_interior',
      label: 'Video — Passeio Interior',
      description: 'Camera percorrendo os ambientes internos',
      category: 'video',
      priority: 'optional',
      recommendedModel: 'kling-2.5',
      recommendedAspect: '16:9',
      estimatedCostUsd: 0.70,
      negativePrompt: '',
      prompt: `Smooth interior walkthrough of a ${base}. Camera enters through doorway into: ${groundRooms}. Pans to central circulation. Materials: ${mats}. Warm afternoon natural light through glass walls. Professional architectural video, cinematic quality.`,
    },

    // === FLOOR PLANS ===
    {
      viewType: 'floor_plan_ground',
      label: 'Planta Baixa — Terreo',
      description: 'Layout do pavimento terreo',
      category: 'plan',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '1:1',
      estimatedCostUsd: 0.04,
      negativePrompt: 'photorealistic, 3d render, perspective, shadows',
      prompt: `Clean architectural floor plan of the ground floor of a ${briefing.geometry} house, ${briefing.totalArea}m² total. Rooms: ${groundRooms}. Central ${briefing.specialElements.find(e => e.includes('staircase')) || 'staircase'}. Professional 2D architectural drawing, black lines on white background, room labels, dimensions in meters, furniture layout indicated, door swings shown, north arrow. CAD-quality technical drawing.`,
    },
    {
      viewType: 'floor_plan_upper',
      label: 'Planta Baixa — Pavimento Superior',
      description: 'Layout dos quartos e circulacao',
      category: 'plan',
      priority: 'essential',
      recommendedModel: 'flux-pro-1.1',
      recommendedAspect: '1:1',
      estimatedCostUsd: 0.04,
      negativePrompt: 'photorealistic, 3d render, perspective, shadows',
      prompt: `Clean architectural floor plan of the upper floor of a ${briefing.geometry} house. ${briefing.floors > 1 ? upperRooms : 'Same as ground floor'}. 360-degree balcony wrapping the perimeter. Central staircase. Professional 2D architectural drawing, black lines on white, room labels, dimensions, furniture layout, north arrow. CAD-quality.`,
    },
    {
      viewType: 'floor_plan_roof',
      label: 'Planta Baixa — Cobertura',
      description: 'Layout da cobertura e elementos especiais',
      category: 'plan',
      priority: 'recommended',
      recommendedModel: 'flux-dev',
      recommendedAspect: '1:1',
      estimatedCostUsd: 0.025,
      negativePrompt: 'photorealistic, 3d render, perspective, shadows',
      prompt: `Clean architectural roof plan of a ${briefing.geometry} house. ${rooftopDesc || specialStr}. ${sustainStr ? `Sustainability elements: ${sustainStr}` : ''}. Professional 2D drawing, black lines on white, labels, dimensions. CAD-quality.`,
    },
  ];

  // Sort by priority
  const priorityOrder = { essential: 0, recommended: 1, optional: 2 };
  return prompts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Returns the complete deliverables checklist for a project.
 */
export function getRequiredDeliverables(): {
  category: string;
  items: { viewType: ViewType; label: string; priority: string }[];
}[] {
  return [
    {
      category: 'Exteriores (4 renders minimo)',
      items: [
        { viewType: 'exterior_front', label: 'Fachada Principal', priority: 'essential' },
        { viewType: 'exterior_side', label: 'Vista Lateral', priority: 'recommended' },
        { viewType: 'exterior_rear', label: 'Vista Posterior', priority: 'optional' },
        { viewType: 'exterior_night', label: 'Vista Noturna', priority: 'recommended' },
      ],
    },
    {
      category: 'Aereas (2 renders minimo)',
      items: [
        { viewType: 'aerial_top_down', label: 'Top-Down (Planta)', priority: 'essential' },
        { viewType: 'aerial_45deg', label: '45 Graus (Volumetria)', priority: 'essential' },
      ],
    },
    {
      category: 'Secao (1 render)',
      items: [
        { viewType: 'cross_section', label: 'Corte Transversal', priority: 'essential' },
      ],
    },
    {
      category: 'Interiores (4 renders minimo)',
      items: [
        { viewType: 'interior_living', label: 'Area Social', priority: 'essential' },
        { viewType: 'interior_kitchen', label: 'Cozinha', priority: 'recommended' },
        { viewType: 'interior_bedroom', label: 'Suite Principal', priority: 'recommended' },
        { viewType: 'interior_bathroom', label: 'Banheiro', priority: 'optional' },
      ],
    },
    {
      category: 'Circulacao e Rooftop (2 renders)',
      items: [
        { viewType: 'circulation', label: 'Escada / Circulacao', priority: 'recommended' },
        { viewType: 'rooftop', label: 'Cobertura / Spa', priority: 'essential' },
      ],
    },
    {
      category: 'Area Externa (2 renders)',
      items: [
        { viewType: 'outdoor_social', label: 'Area Social Externa', priority: 'recommended' },
        { viewType: 'landscape_context', label: 'Contexto Paisagistico', priority: 'optional' },
      ],
    },
    {
      category: 'Video (2 videos)',
      items: [
        { viewType: 'video_walkthrough', label: 'Walkthrough Exterior', priority: 'recommended' },
        { viewType: 'video_orbital', label: 'Vista Orbital', priority: 'recommended' },
        { viewType: 'video_interior', label: 'Passeio Interior', priority: 'optional' },
      ],
    },
    {
      category: 'Plantas Baixas (3 plantas)',
      items: [
        { viewType: 'floor_plan_ground', label: 'Terreo', priority: 'essential' },
        { viewType: 'floor_plan_upper', label: 'Pavimento Superior', priority: 'essential' },
        { viewType: 'floor_plan_roof', label: 'Cobertura', priority: 'recommended' },
      ],
    },
  ];
}

/**
 * Calculate total cost for generating all prompts.
 */
export function calculateTotalCost(prompts: GeneratedPrompt[]): {
  essential: { count: number; costUsd: number };
  recommended: { count: number; costUsd: number };
  optional: { count: number; costUsd: number };
  totalUsd: number;
  totalBrl: number;
} {
  const groups = { essential: { count: 0, costUsd: 0 }, recommended: { count: 0, costUsd: 0 }, optional: { count: 0, costUsd: 0 } };
  for (const p of prompts) {
    groups[p.priority].count++;
    groups[p.priority].costUsd += p.estimatedCostUsd;
  }
  const totalUsd = groups.essential.costUsd + groups.recommended.costUsd + groups.optional.costUsd;
  return { ...groups, totalUsd, totalBrl: totalUsd * 5.50 };
}
