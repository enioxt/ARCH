# PROMPT PACK — Casa Hexagonal no Sitio

> **Projeto:** EGOS Arch v0.1.0-alpha
> **Gerado por:** Claude Opus 4.6 (1M context)
> **Data:** 2026-03-30
> **Uso:** Cole estes prompts nas ferramentas indicadas para gerar visualizacoes do projeto

---

## 1. RENDERS EXTERIORES (Google AI Studio / Imagen 4 / ChatGPT)

### Prompt 1A: Vista Frontal — Dia
```
Photorealistic architectural render of a modern hexagonal house in rural Brazil.
The house has 3 levels:
- Ground floor: open hexagonal base with large glass panels, living room visible from entrance, small home office area
- Second floor: hexagonal form divided into 3 equal sectors, each with a private balcony with panoramic views, natural plant dividers between balconies for privacy
- Rooftop: round glass-enclosed spa/hot tub area with mirrored glass panels for privacy, visible from outside as a sleek glass dome

Surroundings: green pasture in front, small forest (10-15 mature tropical trees) behind the house, 2000m² lot with trees planted around the perimeter.

Style: Contemporary tropical architecture, clean lines, natural materials (wood, stone, glass), low environmental impact. The hexagonal roof creates a cube-like silhouette when viewed from the front.

Lighting: Golden hour, warm afternoon sun, soft shadows.
Camera: Eye-level front view, 24mm wide angle lens.
Quality: 8K, architectural photography, magazine cover quality.
```

### Prompt 1B: Vista Aerea — Planta
```
Aerial architectural render looking straight down at a hexagonal house.
The hexagon is clearly divided into 3 equal sectors by interior walls radiating from the center.
Each sector contains one bedroom suite with en-suite bathroom.
Each sector has a private balcony extending outward.
Between the balconies: lush tropical plants creating natural privacy screens.

The ground floor below is a larger, more open hexagonal footprint.
Surrounding the house: a 2000m² lot with perimeter tree plantings, a small forest behind, and open pasture in front.

Style: Clean architectural plan visualization, photorealistic from above.
Camera: Directly overhead (bird's eye view), 50mm equivalent.
Lighting: Midday sun, even shadows.
Quality: 8K, architectural aerial photography.
```

### Prompt 1C: Vista Interior — Sala + Som
```
Photorealistic interior render of a modern hexagonal living room in rural Brazil.
Open plan ground floor with:
- Living area with comfortable modular sofa facing large glass panels overlooking green pasture
- Home office nook with standing desk and monitor
- Dedicated sound room section with 9.1 Dolby Atmos system: 4 in-ceiling height speakers, 5 wall-mounted speakers at ear level, 1 subwoofer hidden in custom cabinet
- The speakers are flush-mounted (in-wall/in-ceiling) for clean aesthetics
- Natural wood flooring, exposed concrete ceiling, tropical plants

The hexagonal geometry is visible in the ceiling and floor patterns.
Through the glass walls: green landscape, trees, blue sky.

Style: Scandinavian-tropical fusion, warm tones, natural materials.
Lighting: Natural daylight streaming through large windows.
Camera: Interior wide angle, 16mm lens, standing height.
Quality: 8K, interior design magazine quality.
```

### Prompt 1D: Vista Cobertura — Ofuro Panoramico
```
Photorealistic render of a rooftop spa on top of a hexagonal house.
Round hot tub/ofuro for 10 people, built with natural stone and wood.
Surrounded by floor-to-ceiling mirrored glass panels that:
- From outside: reflect the sky and trees (complete privacy)
- From inside: provide crystal clear 360-degree panoramic views

The view shows: rolling green hills, small forest, rural Brazilian landscape.
Solar protection: retractable fabric canopy in neutral tone.
Ambient lighting: warm LED strips around the tub perimeter.
Tropical plants in large ceramic pots around the edges.

Style: Luxury resort meets rural retreat, zen atmosphere.
Lighting: Sunset, warm golden light, steam rising from the water.
Camera: Interior of the spa looking outward through the glass.
Quality: 8K, luxury travel magazine.
```

---

## 2. VIDEO WALKTHROUGH (Alibaba DashScope / Veo 3.1 / Runway)

### Prompt 2A: Walkthrough Completo (30 segundos)
```
Cinematic architectural walkthrough video of a modern hexagonal house in rural Brazil.

Shot sequence:
0-5s: Drone approaching from pasture, revealing hexagonal silhouette against forest backdrop
5-10s: Walking through front entrance into open living room, camera pans to reveal sound system and glass walls
10-15s: Ascending wooden staircase to second floor, camera rotates to show 3 bedroom suites divided by walls radiating from center
15-20s: Stepping onto one of the private balconies, panoramic view of surrounding landscape with plant privacy screens visible
20-25s: Ascending to rooftop spa, camera reveals round hot tub with mirrored glass dome
25-30s: Final shot from inside spa looking out through mirrored glass at 360-degree sunset view

Style: Luxury real estate video, smooth dolly/gimbal movement, cinematic color grading.
Music suggestion: Ambient acoustic guitar, Brazilian bossa nova undertones.
Resolution: 1080p, 24fps, cinematic aspect ratio.
```

### Prompt 2B: Para Alibaba wan2.1-kf2v-plus (Keyframe-to-Video)

**Keyframe 1 (inicio):**
```
Exterior view of modern hexagonal house, green pasture foreground, forest background, golden hour lighting, architectural photography
```

**Keyframe 2 (fim):**
```
Interior rooftop spa, round hot tub with warm water, mirrored glass walls reflecting sunset, panoramic rural Brazilian landscape visible through glass, luxury atmosphere
```

---

## 3. PLANTA 2D (Google AI Studio / Gemini)

### Prompt 3A: Floor Plan — Segundo Piso
```
Generate a clean 2D architectural floor plan of a regular hexagonal building.
The hexagon is divided into exactly 3 equal sectors by walls radiating from the center point to 3 alternating vertices.

Each sector contains:
- Master bedroom (approximately 20m²)
- En-suite bathroom with shower, toilet, and vanity (approximately 8m²)
- Walk-in closet (approximately 4m²)
- Private balcony (approximately 6m²) extending outward from the hexagonal perimeter

Between each balcony: a 1.5m gap filled with tropical plants for privacy screening.

Central area: small landing/circulation space with staircase access.

Total hexagonal footprint: approximately 120m² (each side ~7m).

Style: Clean black and white architectural plan with room labels in Portuguese.
Include: dimensions, door swings, bathroom fixtures, north arrow.
Scale: 1:100
```

### Prompt 3B: Floor Plan — Terreo
```
Generate a clean 2D architectural floor plan of a hexagonal ground floor.
Slightly larger footprint than the upper floor (extended in front and back).

Layout:
- Front 1/3: Entrance foyer + Living room with modular sofa facing garden view
- Left 1/3: Home office with desk and bookshelves + Storage/utility room
- Right 1/3: Dedicated sound room (acoustically treated) with 9.1 speaker layout marked

Central: Open staircase to upper floor.
Back: Large glass sliding doors opening to rear garden terrace.
Right side exterior: Outdoor deck area marked for 8-person hot tub.

Style: Clean black and white architectural plan, room labels in Portuguese.
Include: speaker positions marked with "S" symbols, furniture layout, dimensions.
Scale: 1:100
```

---

## 4. DESIGN STITCH (Google Stitch — ja configurado)

### Prompt 4A: Dashboard do Projeto ARCH
```
Create a modern dark-mode dashboard for an AI-powered architectural design tool called "EGOS Arch".

Layout:
- Left sidebar: Project navigation (Briefing, Croqui, Planta 2D, Massa 3D, Renders, Video, Export)
- Top header: Project name "Casa Hexagonal — Sitio Rural" + version badge "v0.1.0-alpha"
- Main area: Split view — left shows 2D hexagonal floor plan, right shows 3D perspective render
- Bottom bar: Timeline with project phases (Fase 1-4) and progress indicators
- Floating panel: AI chat assistant with recent messages about the hexagonal design

Color scheme: Navy #0A0E27 background, Blue #2563EB accents, white text.
Font: Inter.
Style: Professional architect software, clean, minimal, dark enterprise aesthetic.
```

---

## 5. SISTEMA DE SOM — Especificacao Tecnica

### Calculo para a Sala Hexagonal (~40m²)

**Sistema 9.1.4 Dolby Atmos recomendado:**

| Componente | Qtd | Modelo Sugerido | Preco Estimado |
|-----------|-----|----------------|----------------|
| Frontal L/C/R (in-wall) | 3 | KEF Ci160QS | R$ 4.500 |
| Surround (in-wall) | 4 | KEF Ci130QS | R$ 4.000 |
| Subwoofer (in-wall) | 1 | KEF Ci200QSb | R$ 2.500 |
| Atmos Height (in-ceiling) | 4 | KEF Ci130CR | R$ 4.000 |
| Receiver AVR | 1 | Denon AVR-X3800H | R$ 8.000 |
| Cabos + instalacao | 1 | - | R$ 3.000 |
| **TOTAL** | | | **R$ 26.000** |

**Alternativa economica (7.1.2 — R$15.000):**
- Frontal: 3x JBL Arena 2 In-Wall (R$ 2.400)
- Surround: 4x JBL Arena 2 In-Ceiling (R$ 2.400)
- Sub: 1x JBL Arena Sub 100P (R$ 1.500)
- Atmos: 2x JBL Arena 2 In-Ceiling (R$ 1.200)
- Receiver: Yamaha RX-V6A (R$ 5.500)
- Cabos: R$ 2.000

**Posicionamento no hexagono:**
```
        [Atmos FL]    [Atmos FR]
    [SL]                        [SR]
         [FL]   [C]   [FR]
              [SUB]
    [SBL]                      [SBR]
        [Atmos RL]    [Atmos RR]
```

---

## 6. COMO USAR CADA FERRAMENTA

### Google AI Studio (voce tem creditos)
1. Abra https://aistudio.google.com
2. Selecione "Gemini 2.5 Flash" ou "Imagen 3"
3. Cole o prompt 1A, 1B, 1C ou 1D
4. Para video: use "Veo 2" se disponivel

### ChatGPT (sua conta)
1. Abra https://chatgpt.com
2. Cole qualquer prompt da secao 1 (renders)
3. GPT-4o gera imagens diretamente
4. Para plantas: cole prompts da secao 3

### Alibaba DashScope (ja configurado)
1. Use a API diretamente via curl ou script
2. Endpoint: `POST /api/v1/services/aigc/video-generation/video-synthesis`
3. Modelo: `wan2.1-kf2v-plus` (keyframe-to-video)
4. Cole os keyframes do prompt 2B

### Google Stitch (ja configurado no EGOS)
1. No Windsurf/Claude Code, use `/stitch`
2. Cole o prompt 4A
3. Receba o HTML/CSS do dashboard

---

*Pack de prompts gerado por EGOS Arch + Claude Opus 4.6 (1M context)*
*Projeto: Casa Hexagonal — Sitio Rural de Enio Rocha*
