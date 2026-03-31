import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { ARCHITECT_SYSTEM_PROMPT } from './src/ai/prompts/architect-agent.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client configured for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL || "https://arch.egos.ia.br",
    "X-Title": "EGOS Arch",
  }
});

// --- Static files & presentation page ---
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.get('/apresentacao', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'apresentacao.html'));
});

// --- API Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'egos-arch-node-backend' });
});

// Endpoint for Conversational Agent (Iterative Co-creation)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Map the history from our frontend format to OpenAI/OpenRouter format
    const formattedHistory = history ? history.map((m: any) => {
      const content = [];
      if (m.parts && m.parts[0].text) {
        content.push({ type: "text", text: m.parts[0].text });
      }
      if (m.image) {
        content.push({ type: "image_url", image_url: { url: m.image } });
      }
      return {
        role: m.role === 'model' ? 'assistant' : 'user',
        content: content.length === 1 && content[0].type === 'text' ? content[0].text : content
      };
    }) : [];

    const userContent = [];
    if (message) {
      userContent.push({ type: "text", text: message });
    }
    if (req.body.image) {
      userContent.push({ type: "image_url", image_url: { url: req.body.image } });
    }

    const messages = [
      { role: "system", content: ARCHITECT_SYSTEM_PROMPT },
      ...formattedHistory,
      { role: "user", content: userContent.length === 1 && userContent[0].type === 'text' ? userContent[0].text : userContent }
    ];

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: messages as any,
      temperature: 0.7,
    });

    const botReply = completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

    res.json({ text: botReply });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Endpoint for Briefing Interpretation (Moved from frontend to backend for security)
app.post('/api/analyze-briefing', async (req, res) => {
  try {
    const { briefing } = req.body;

    if (!briefing) {
      return res.status(400).json({ error: 'Briefing text is required' });
    }

    const prompt = `
      Você é um arquiteto sênior analisando um briefing de cliente para o projeto EGOS Arch.
      O projeto atual foca em casas hexagonais modulares.
      
      Analise o seguinte briefing:
      "${briefing}"
      
      Extraia as seguintes informações e retorne ESTRITAMENTE em formato JSON:
      {
        "resumo": "Um resumo executivo de 2-3 frases do projeto",
        "geometria_principal": "A forma principal sugerida (ex: Hexagonal, Retangular)",
        "ambientes": [
          {"nome": "Nome do ambiente", "descricao": "Detalhes específicos do briefing"}
        ],
        "pontos_chave": ["Ponto 1", "Ponto 2"],
        "ambiguidades": ["Dúvida 1 que precisa ser esclarecida com o cliente", "Dúvida 2"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0]?.message?.content || '{}';
    const parsedResult = JSON.parse(resultText);

    res.json(parsedResult);
  } catch (error) {
    console.error('Error analyzing briefing:', error);
    res.status(500).json({ error: 'Failed to analyze briefing' });
  }
});

// Endpoint proxy para o Python Worker (Simulado aqui para o ambiente de preview)
app.post('/api/vision/extract-geometry', async (req, res) => {
  // Em produção no Windsurf, este endpoint fará um fetch para http://localhost:8000/api/vision/extract-geometry
  // Aqui estamos simulando a resposta do Python Worker
  setTimeout(() => {
    res.json({
      status: 'success',
      data: {
        lines: [{ x1: 0, y1: 0, x2: 100, y2: 100 }],
        polygons: ['hexagon']
      }
    });
  }, 1500);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
