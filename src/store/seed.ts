import { v4 as uuidv4 } from 'uuid';
import { Project } from '../schemas/project.schema';

export const seedProjects: Project[] = [
  {
    id: uuidv4(),
    name: 'RES-BIO-001: Residência Bioclimática Passiva',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Projeto de residência unifamiliar de alto padrão com foco em arquitetura bioclimática passiva e certificação LEED Platinum.
Localização: Terreno em declive de 15%, face norte, 1200m².
Área construída alvo: 450m².
Orçamento limite: R$ 4.500.000,00 (R$ 10.000/m²).
Premissas:
- Zero emissão de carbono na operação (Net Zero Energy).
- Uso de madeira engenheirada (CLT) para estrutura principal.
- Ventilação cruzada em 100% dos ambientes de permanência.
- Captação de água pluvial com cisterna de 15.000L.
- Placas fotovoltaicas (mínimo 15kWp) integradas à cobertura.
Programa: 4 suítes (sendo 1 master com 45m²), living integrado com cozinha (open concept, 80m²), home office acústico (15m²), área gourmet externa (40m²), piscina com borda infinita e aquecimento solar, garagem para 3 carros com carregador EV (11kW).`,
        analysis: {
          resumo: 'Residência unifamiliar Net Zero focada em eficiência térmica e materiais sustentáveis (CLT).',
          geometria_principal: 'Volumes retangulares sobrepostos, rotacionados para otimizar a insolação norte. Coberturas em borboleta para captação pluvial e solar.',
          ambientes: [
            { nome: 'Suíte Master', descricao: 'Quarto principal com closet e banheiro duplo. Orientação leste.', areaEstimada: 45 },
            { nome: 'Suítes Secundárias (3x)', descricao: 'Quartos para filhos/hóspedes com banheiro integrado.', areaEstimada: 60 },
            { nome: 'Living Integrado', descricao: 'Sala de estar, jantar e cozinha em conceito aberto com pé-direito duplo.', areaEstimada: 80 },
            { nome: 'Home Office', descricao: 'Escritório com isolamento acústico (STC 50) e entrada independente.', areaEstimada: 15 },
            { nome: 'Área Gourmet', descricao: 'Espaço externo coberto com churrasqueira e forno de pizza.', areaEstimada: 40 },
            { nome: 'Garagem', descricao: 'Vagas para 3 veículos com infraestrutura para carregamento elétrico.', areaEstimada: 45 }
          ],
          pontos_chave: [
            'Estrutura em CLT reduz pegada de carbono em 40% vs concreto.',
            'Custo estimado no limite do budget (R$ 10k/m²).',
            'Necessidade de estudo de sombreamento para fachadas oeste.'
          ],
          ambiguidades: [
            'A inclinação de 15% do terreno pode exigir contenções que impactem o orçamento de R$ 4.5M.',
            'A integração das placas solares na cobertura borboleta precisa de detalhamento para evitar perdas de eficiência.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'DC-SUB-002: Data Center Subterrâneo Edge',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Data Center Edge Tier III subterrâneo para processamento de IA de baixa latência.
Localização: Área urbana densa, terreno de 800m², construção 100% no subsolo (3 níveis).
Área construída alvo: 2000m².
Carga de TI: 2.5 MW.
PUE Alvo: < 1.25.
Premissas:
- Resfriamento por imersão líquida (Liquid Immersion Cooling) para racks de alta densidade (até 100kW/rack).
- Estrutura em concreto armado com aditivos cristalizantes para impermeabilização total.
- Reutilização do calor dissipado (Waste Heat Recovery) para aquecimento de edifícios vizinhos.
- Segurança física nível militar (anti-intrusão, gaiola de Faraday).
Programa: 3 salões de dados (400m² cada), sala elétrica (UPS/Baterias de Lítio - 250m²), sala mecânica (chillers/bombas - 200m²), NOC (Network Operations Center - 50m²), doca de carga segura (100m²).`,
        analysis: {
          resumo: 'Data Center subterrâneo de alta densidade com foco em resfriamento líquido e recuperação de calor.',
          geometria_principal: 'Cilindro estrutural profundo (tipo poço) para otimizar contenção de empuxo de terra e distribuição circular de utilidades.',
          ambientes: [
            { nome: 'Salões de Dados (3x)', descricao: 'Área de racks com tanques de resfriamento por imersão.', areaEstimada: 1200 },
            { nome: 'Sala Elétrica', descricao: 'Sistemas UPS modulares e baterias de íon-lítio.', areaEstimada: 250 },
            { nome: 'Sala Mecânica', descricao: 'Trocadores de calor e bombas de circulação primária.', areaEstimada: 200 },
            { nome: 'NOC', descricao: 'Centro de operações de rede blindado com monitoramento 24/7.', areaEstimada: 50 },
            { nome: 'Doca Segura', descricao: 'Área de recebimento de equipamentos com eclusa de segurança.', areaEstimada: 100 }
          ],
          pontos_chave: [
            'Resfriamento líquido reduz área mecânica necessária em 60%.',
            'Geometria cilíndrica reduz custos de contenção em 25%.',
            'PUE de 1.25 é altamente agressivo para data centers urbanos.'
          ],
          ambiguidades: [
            'A viabilidade de exportar calor para vizinhos depende de infraestrutura distrital inexistente no briefing.',
            'O lençol freático não foi especificado, risco crítico para obras subterrâneas.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'HOSP-MOD-003: Complexo Hospitalar Modular',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Hospital Geral de 150 leitos com construção modular off-site (Volumetric Modular Construction).
Localização: Região metropolitana, terreno plano de 15.000m².
Área construída alvo: 12.000m².
Cronograma: Fast-track (12 meses do projeto à operação).
Premissas:
- Módulos pré-fabricados em aço (steel frame volumétrico) com acabamentos hospitalares pré-instalados.
- Flexibilidade pandêmica: alas de internação conversíveis em UTI com pressão negativa em < 24h.
- Certificação EDGE Advanced (redução de 40% em energia, água e energia embutida nos materiais).
- Fluxos estritamente separados (pacientes, insumos limpos, resíduos, funcionários).
Programa: Pronto Atendimento (1000m²), Imagem/Diagnóstico (800m²), Centro Cirúrgico (6 salas, 1200m²), UTI (20 leitos, 800m²), Internação (130 leitos, 5000m²), Apoio Técnico/Logístico (3200m²).`,
        analysis: {
          resumo: 'Hospital modular de rápida execução com alas flexíveis e fluxos otimizados.',
          geometria_principal: 'Espinha dorsal central (circulação e shafts) com blocos modulares perpendiculares (formato em pente) para maximizar iluminação natural e facilitar expansões.',
          ambientes: [
            { nome: 'Internação', descricao: 'Quartos modulares pré-fabricados com banheiro acoplado.', areaEstimada: 5000 },
            { nome: 'Centro Cirúrgico', descricao: 'Salas cirúrgicas modulares com fluxo unidirecional limpo/sujo.', areaEstimada: 1200 },
            { nome: 'UTI', descricao: 'Leitos de terapia intensiva com infraestrutura para conversão em pressão negativa.', areaEstimada: 800 },
            { nome: 'Pronto Atendimento', descricao: 'Área de triagem, consultórios e observação.', areaEstimada: 1000 },
            { nome: 'Apoio Logístico', descricao: 'CME, farmácia, nutrição e gestão de resíduos.', areaEstimada: 3200 }
          ],
          pontos_chave: [
            'Construção off-site reduz cronograma em 40%.',
            'Formato em pente garante luz natural em 100% dos leitos.',
            'Conversibilidade de leitos exige superdimensionamento de HVAC.'
          ],
          ambiguidades: [
            'O transporte de módulos volumétricos de grandes dimensões até o terreno urbano pode ser um gargalo logístico.',
            'Vibração estrutural em módulos de aço precisa ser mitigada para equipamentos de ressonância magnética.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'LOG-LM-004: Galpão Logístico Last-Mile Multi-Storey',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Centro de distribuição urbano vertical (Multi-Storey Warehouse) para e-commerce last-mile.
Localização: Zona industrial consolidada, terreno de 10.000m².
Área construída alvo: 25.000m² (3 pavimentos).
Sobrecarga de piso: 2.5 ton/m² em todos os níveis.
Premissas:
- Rampas circulares para acesso de VUCs (Veículos Urbanos de Carga) até o 3º pavimento.
- Pé-direito livre de 8m por pavimento.
- Automação total: piso superplano (FF 60 / FL 40) para operação de robôs AMR e empilhadeiras filoguiadas.
- Cobertura 100% fotovoltaica (2MWp) para carregamento da frota de entrega elétrica.
Programa: Armazenagem (20.000m²), Docas cross-docking (3.000m²), Escritórios/Apoio motoristas (2.000m²).`,
        analysis: {
          resumo: 'Galpão logístico vertical de alta densidade para operações urbanas automatizadas.',
          geometria_principal: 'Bloco prismático massivo com rampas helicoidais externas nas extremidades para separar fluxos de subida e descida.',
          ambientes: [
            { nome: 'Armazenagem', descricao: 'Área de racks e operação de robôs AMR.', areaEstimada: 20000 },
            { nome: 'Docas', descricao: 'Plataformas de carga/descarga com niveladoras embutidas.', areaEstimada: 3000 },
            { nome: 'Apoio/Escritórios', descricao: 'Administração, refeitório e vestiários para motoristas.', areaEstimada: 2000 },
            { nome: 'Rampas Helicoidais', descricao: 'Acesso veicular aos pavimentos superiores (área não computada na útil).', areaEstimada: 0 }
          ],
          pontos_chave: [
            'Verticalização multiplica o potencial do terreno urbano caro.',
            'Piso superplano em pavimentos elevados exige controle rigoroso de flechas estruturais.',
            'Geração solar cobre 100% da demanda da frota elétrica.'
          ],
          ambiguidades: [
            'Rampas para VUCs consomem grande área do lote; avaliar viabilidade de elevadores de carga pesada como alternativa.',
            'Pé-direito de 8m + estrutura robusta resulta em altura total do edifício > 30m, sujeito a restrições de gabarito aéreo.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'RETRO-ESG-005: Retrofit Corporativo ESG',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Retrofit de edifício de escritórios da década de 1980 para adequação a padrões ESG e certificação WELL v2 Platinum.
Localização: Centro histórico, edifício de 15 pavimentos.
Área construída: 18.000m² (existente).
Premissas:
- Preservação da fachada brutalista original em concreto aparente, com inserção de nova pele de vidro de alta performance (fachada dupla/respirável).
- Substituição total do sistema de ar-condicionado por vigas frias (chilled beams) e ventilação por deslocamento (DOAS).
- Reuso de águas cinzas e negras (sistema de biorreator a membrana - MBR no subsolo).
- Design biofílico: criação de terraços verdes a cada 3 andares, removendo lajes existentes.
Programa: Lajes corporativas open-space (12.000m²), Coworking/Incubadora (3.000m²), Rooftop com restaurante e horta urbana (1.000m²), Áreas comuns e técnicas (2.000m²).`,
        analysis: {
          resumo: 'Retrofit profundo focando em saúde (WELL), eficiência energética e preservação do patrimônio brutalista.',
          geometria_principal: 'Volume prismático existente perfurado por átrios de pé-direito triplo (terraços biofílicos) nas esquinas, criando bolsões de vegetação visíveis da rua.',
          ambientes: [
            { nome: 'Lajes Corporativas', descricao: 'Escritórios flexíveis com piso elevado e vigas frias.', areaEstimada: 12000 },
            { nome: 'Coworking', descricao: 'Espaços colaborativos e salas de reunião modulares.', areaEstimada: 3000 },
            { nome: 'Rooftop', descricao: 'Restaurante farm-to-table com horta produtiva.', areaEstimada: 1000 },
            { nome: 'Terraços Biofílicos', descricao: 'Áreas de descompressão com vegetação densa.', areaEstimada: 0 }
          ],
          pontos_chave: [
            'Fachada dupla melhora conforto térmico sem descaracterizar o brutalismo.',
            'Vigas frias reduzem o pé-direito técnico necessário, ideal para prédios antigos.',
            'Demolição de lajes para terraços exige reforço estrutural complexo.'
          ],
          ambiguidades: [
            'O sistema MBR no subsolo pode conflitar com as vagas de garagem existentes.',
            'A capacidade de carga da laje de cobertura para suportar a horta urbana e restaurante precisa ser verificada.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'EDU-SENS-006: Escola Parque Sensorial',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Escola de ensino infantil (0-6 anos) baseada na pedagogia Reggio Emilia, focada em neuroarquitetura e inclusão de crianças neurodivergentes.
Localização: Bairro residencial arborizado, terreno de 5.000m².
Área construída alvo: 2.500m² (térreo + 1).
Premissas:
- Arquitetura como "terceiro educador": espaços fluidos, sem corredores cegos, integração visual total.
- Controle sensorial: iluminação circadiana ajustável, acústica de alta absorção (Tempo de Reverberação < 0.4s), paleta de cores de baixo estímulo.
- Materiais naturais e táteis (cortiça, madeira, linóleo, terra batida).
- Pátio central naturalizado (sem piso emborrachado, com topografia lúdica, água e areia).
Programa: 12 Salas de referência (ateliês) (900m²), Piazza central (área de encontro) (400m²), Refeitório pedagógico (300m²), Áreas administrativas e apoio (400m²), Pátio externo naturalizado (500m² de área construída coberta/varandas).`,
        analysis: {
          resumo: 'Escola infantil inovadora focada em neuroarquitetura, estímulos sensoriais controlados e integração com a natureza.',
          geometria_principal: 'Planta orgânica em formato de "C" ou anel, abraçando o pátio central. Telhados curvos e ausência de quinas vivas.',
          ambientes: [
            { nome: 'Salas de Referência', descricao: 'Ateliês com acesso direto ao exterior e banheiros infantis integrados.', areaEstimada: 900 },
            { nome: 'Piazza Central', descricao: 'Coração da escola, espaço de pé-direito duplo para encontros e exposições.', areaEstimada: 400 },
            { nome: 'Refeitório', descricao: 'Cozinha visível e bancadas na altura das crianças para autonomia.', areaEstimada: 300 },
            { nome: 'Varandas de Transição', descricao: 'Áreas cobertas entre o interior e o pátio natural.', areaEstimada: 500 }
          ],
          pontos_chave: [
            'Acústica rigorosa é fundamental para o conforto de crianças autistas.',
            'A Piazza elimina a necessidade de corredores, otimizando a área útil.',
            'Uso de terra batida e cortiça exige manutenção especializada.'
          ],
          ambiguidades: [
            'O controle de acesso e segurança no pátio naturalizado aberto precisa ser detalhado.',
            'Climatização em espaços de conceito aberto e fluidos pode ser ineficiente energeticamente.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'MOB-HUB-007: Hub de Mobilidade Urbana',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Estação intermodal de transporte integrando metrô, BRT, ciclovias e vertiporto (eVTOL).
Localização: Nó viário central, terreno de 20.000m².
Área construída alvo: 35.000m².
Premissas:
- Estrutura de grande vão livre em aço e membrana tensionada (ETFE) para iluminação natural e leveza.
- Vertiporto no rooftop com 4 pads de pouso e infraestrutura de carregamento megawatt.
- Concourse comercial e de serviços para captura de valor imobiliário (Transit-Oriented Development - TOD).
- Pavimento cinético: captação de energia pelos passos dos pedestres nas áreas de alto fluxo.
Programa: Plataformas de Metrô (subsolo, 8.000m²), Terminal BRT (térreo, 10.000m²), Concourse/Shopping (mezanino, 12.000m²), Vertiporto e saguão de embarque aéreo (cobertura, 5.000m²).`,
        analysis: {
          resumo: 'Megaestrutura intermodal preparando a cidade para a mobilidade aérea urbana (eVTOL) e integração de modais terrestres.',
          geometria_principal: 'Cobertura em casca fluida (ETFE) unificando os diferentes níveis. Eixo de circulação vertical monumental (átrio central).',
          ambientes: [
            { nome: 'Concourse Comercial', descricao: 'Área de circulação principal com varejo e serviços.', areaEstimada: 12000 },
            { nome: 'Terminal BRT', descricao: 'Plataformas de ônibus com portas de plataforma automáticas.', areaEstimada: 10000 },
            { nome: 'Plataformas Metrô', descricao: 'Estação subterrânea com ventilação natural via poços do átrio.', areaEstimada: 8000 },
            { nome: 'Vertiporto', descricao: 'Pads de pouso, hangares rápidos e lounge de passageiros VIP.', areaEstimada: 5000 }
          ],
          pontos_chave: [
            'Cobertura em ETFE reduz carga estrutural e necessidade de iluminação artificial.',
            'O vertiporto exige reforço estrutural extremo para impacto de pouso e baterias pesadas.',
            'Wayfinding (sinalização) intuitivo é crítico devido à complexidade de 4 modais.'
          ],
          ambiguidades: [
            'A regulamentação de ruído para eVTOLs em áreas urbanas densas pode restringir a operação do vertiporto.',
            'O custo do pavimento cinético vs. energia gerada geralmente não se paga; avaliar como elemento de marketing.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'ECO-RES-008: Resort Flutuante Sustentável',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Eco-resort de luxo composto por módulos flutuantes autossuficientes em represa de área de preservação.
Localização: Espelho d'água de represa tropical.
Área construída alvo: 8.000m² (distribuídos em 40 módulos).
Premissas:
- Zero impacto no leito da represa: fundações flutuantes em EPS de alta densidade revestido com concreto naval.
- Autossuficiência (Off-grid): dessalinização/purificação solar, tratamento de esgoto por biodigestores acoplados a jardins flutuantes (wetlands), energia solar e eólica de eixo vertical.
- Construção modular em bambu engenheirado e palha sintética de longa duração.
Programa: 30 Bangalôs flutuantes (100m² cada), Hub Central (Recepção, Restaurante, Spa - 3.000m²), Módulos de serviço e staff (2.000m²).`,
        analysis: {
          resumo: 'Resort de luxo 100% off-grid e flutuante, focado em turismo regenerativo e mínimo impacto ambiental.',
          geometria_principal: 'Arranjo fractal inspirado em vitórias-régias. Hub central circular conectado aos bangalôs por passarelas flutuantes articuladas.',
          ambientes: [
            { nome: 'Hub Central', descricao: 'Cúpula geodésica em bambu abrigando áreas sociais.', areaEstimada: 3000 },
            { nome: 'Bangalôs (30x)', descricao: 'Suítes privativas com deck submersível e piscina natural.', areaEstimada: 3000 },
            { nome: 'Módulos de Serviço', descricao: 'Geração de energia, tratamento de água e alojamento staff.', areaEstimada: 2000 }
          ],
          pontos_chave: [
            'Jardins flutuantes tratam efluentes e criam habitat para fauna local.',
            'Passarelas articuladas absorvem variações do nível da água (até 3 metros).',
            'Bambu engenheirado oferece resistência estrutural com pegada de carbono negativa.'
          ],
          ambiguidades: [
            'A estabilidade hidrodinâmica dos módulos maiores (Hub Central) sob ventos fortes requer testes em tanque de provas.',
            'A logística de abastecimento e descarte de resíduos sólidos pesados (off-grid) não está clara.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'AGRI-VERT-009: Fazenda Vertical Urbana',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Edifício de agricultura em ambiente controlado (CEA - Controlled Environment Agriculture) para produção de alimentos no centro da cidade.
Localização: Lote residual urbano, 1.500m².
Área construída alvo: 15.000m² (10 pavimentos).
Premissas:
- Produção aeropônica automatizada de hortaliças e morangos.
- Iluminação 100% artificial com LEDs de espectro otimizado (rosa/roxo).
- Edifício hermético (sala limpa classe ISO 8) para controle de pragas sem pesticidas.
- Fachada ativa: painéis BIPV (Building Integrated Photovoltaics) e fotobiorreatores de microalgas para sombreamento e geração de biomassa.
Programa: Áreas de cultivo (10.000m²), Processamento e embalagem (2.000m²), Laboratórios de P&D (1.000m²), Mercado/Restaurante no térreo (1.000m²), Utilidades (1.000m²).`,
        analysis: {
          resumo: 'Fábrica de alimentos verticalizada de alta tecnologia, reduzindo a distância farm-to-table para zero.',
          geometria_principal: 'Torre cega (sem janelas nas áreas de cultivo para controle de luz), revestida por tubos de vidro verde (fotobiorreatores de algas).',
          ambientes: [
            { nome: 'Áreas de Cultivo', descricao: 'Salas limpas com racks verticais automatizados e iluminação LED.', areaEstimada: 10000 },
            { nome: 'Processamento', descricao: 'Área de colheita robótica, lavagem e embalagem a vácuo.', areaEstimada: 2000 },
            { nome: 'Mercado/Restaurante', descricao: 'Interface pública no térreo vendendo a produção do prédio.', areaEstimada: 1000 },
            { nome: 'Laboratórios', descricao: 'Pesquisa em genômica de plantas e otimização de nutrientes.', areaEstimada: 1000 }
          ],
          pontos_chave: [
            'Consumo de água 95% menor que agricultura tradicional (aeroponia de ciclo fechado).',
            'Carga térmica altíssima devido aos LEDs exige sistema de HVAC industrial.',
            'Fotobiorreatores na fachada filtram CO2 do ar urbano e geram fertilizante.'
          ],
          ambiguidades: [
            'O consumo de energia elétrica para iluminação e HVAC pode inviabilizar o OPEX se não houver PPA (Power Purchase Agreement) de energia renovável barata.',
            'A sobrecarga estrutural dos tanques de água e racks de cultivo em 10 andares é massiva.'
          ]
        }
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'AERO-RES-010: Centro de Pesquisa Aeroespacial',
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        createdAt: new Date().toISOString(),
        status: 'analyzing',
        briefing: `Instalação de P&D para desenvolvimento de microssatélites e propulsão iônica.
Localização: Parque tecnológico adjacente a aeroporto, 30.000m².
Área construída alvo: 18.000m².
Premissas:
- Salas limpas ISO 5 e ISO 7 de grande porte (pé-direito de 12m) para montagem de satélites.
- Câmara de vácuo térmico (TVAC) e mesa vibratória (Shaker) isoladas acusticamente e estruturalmente (fundações independentes).
- Arquitetura de alta segurança (Tempest/SCIF) para proteção contra espionagem eletromagnética.
- Estrutura em pórticos de aço de grandes vãos (40m) sem pilares intermediários.
Programa: Salas Limpas de Integração (5.000m²), Laboratórios de Testes Ambientais (3.000m²), Escritórios de Engenharia (6.000m²), Auditório e Centro de Visitantes (2.000m²), Apoio e Utilidades (2.000m²).`,
        analysis: {
          resumo: 'Complexo de engenharia de ponta com requisitos extremos de controle de contaminação, vibração e segurança da informação.',
          geometria_principal: 'Dois volumes contrastantes: um bloco horizontal massivo, cego e metálico (Laboratórios) e um anel de vidro suspenso (Escritórios) orbitando o bloco principal.',
          ambientes: [
            { nome: 'Salas Limpas', descricao: 'Área de montagem com controle absoluto de partículas, temperatura e umidade.', areaEstimada: 5000 },
            { nome: 'Escritórios', descricao: 'Áreas de trabalho open-plan para engenheiros de software e hardware.', areaEstimada: 6000 },
            { nome: 'Laboratórios de Testes', descricao: 'Abriga a câmara TVAC e testes de vibração/acústica.', areaEstimada: 3000 },
            { nome: 'Centro de Visitantes', descricao: 'Área pública para exibição de maquetes e educação científica.', areaEstimada: 2000 }
          ],
          pontos_chave: [
            'Fundações independentes (blocos de inércia) para equipamentos de teste evitam propagação de vibração para as salas limpas.',
            'Blindagem eletromagnética (SCIF) encarece o custo do m² da área de escritórios em 300%.',
            'Pé-direito de 12m nas salas limpas exige fluxo laminar de ar massivo (plenum de teto inteiro).'
          ],
          ambiguidades: [
            'A proximidade com o aeroporto pode gerar interferências de radar nos testes de antenas dos satélites.',
            'O consumo de nitrogênio líquido para a câmara TVAC exige tanques criogênicos externos não previstos no programa.'
          ]
        }
      }
    ]
  }
];
