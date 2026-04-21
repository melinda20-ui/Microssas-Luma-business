require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { checkOllamaStatus } = require('./config/llm');

// Agentes
const websiteBuilderAgent = require('./agents/websiteBuilder');
const contentCreatorAgent = require('./agents/contentCreator');
const automationBuilderAgent = require('./agents/automationBuilder');
const businessIntelligenceAgent = require('./agents/businessIntelligence');
const { customerSupportAgent, clearSession } = require('./agents/customerSupport');
const { initDb } = require('./config/db');
const { startJob } = require('./services/cleanupJob');
const blogManager = require('./agents/blogManager');

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializa Banco de Dados e Serviços
initDb();
startJob(); // Inicia o vigilante de 15 dias

// ========================
// MIDDLEWARES
// ========================
app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : [];
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limit global: 100 req/min por IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' }
});
app.use(globalLimiter);

// Rate limit restrito para agentes pesados (website + automation)
const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Limite de gerações atingido. Aguarde 1 minuto.' }
});

// ========================
// HEALTH CHECK
// ========================
app.get('/', (req, res) => {
  res.json({
    service: 'MicroSaaS Agents API',
    version: '1.0.0',
    status: 'online',
    agents: [
      'website-builder',
      'content-creator',
      'automation-builder',
      'business-intelligence',
      'customer-support'
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', async (req, res) => {
  const ollamaStatus = await checkOllamaStatus();
  res.json({
    api: 'online',
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
    ollama: ollamaStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// ========================
// ROTAS DOS AGENTES
// ========================

const creditMiddleware = require('./middleware/creditMiddleware');

// 🏢 Buscar Perfil/Créditos do Usuário
app.get('/api/user/:clerkId', (req, res) => {
    const user = db.prepare('SELECT credits, plan, last_reset FROM users WHERE clerk_id = ?').get(req.params.clerkId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
});

// 🏗️ Website Builder — Gemini Pro (5 Créditos)
app.post('/api/agents/website', heavyLimiter, creditMiddleware(5), websiteBuilderAgent);

// ✍️ Content Creator — Gemini Flash (2 Créditos)
app.post('/api/agents/content', creditMiddleware(2), contentCreatorAgent);

// ⚙️ Automation Builder — Gemini Pro (5 Créditos)
app.post('/api/agents/automation', heavyLimiter, creditMiddleware(5), automationBuilderAgent);

// 📊 Business Intelligence — Gemini Flash (2 Créditos)
app.post('/api/agents/analytics', creditMiddleware(2), businessIntelligenceAgent);

// 💬 Customer Support — Ollama/Gemini (1 Crédito)
app.post('/api/agents/support', creditMiddleware(1), customerSupportAgent);
app.delete('/api/agents/support/session/:sessionId', clearSession);

// 🎬 Video Factory — Gemini Pro + FFmpeg (5 Créditos)
app.post('/api/agents/video', upload.single('video'), creditMiddleware(5), videoAutomationAgent);

// Servir arquivos de vídeo estáticos
app.use('/api/videos', express.static(path.join(__dirname, 'storage/videos')));

// ✍️ Blog Manager — Internal CMS
app.get('/api/blog', blogManager.getAll);
app.get('/api/blog/:slug', blogManager.getBySlug);
app.post('/api/blog/save', blogManager.save);

// ========================
// ROTA UNIFICADA — CHAT
// ========================
app.post('/api/chat', async (req, res) => {
  const { agent, ...body } = req.body;

  const agentMap = {
    'website': websiteBuilderAgent,
    'content': contentCreatorAgent,
    'automation': automationBuilderAgent,
    'analytics': businessIntelligenceAgent,
    'support': customerSupportAgent
  };

  const handler = agentMap[agent];
  if (!handler) {
    return res.status(400).json({
      error: `Agente "${agent}" não encontrado. Opções: ${Object.keys(agentMap).join(', ')}`
    });
  }

  req.body = body;
  return handler(req, res);
});

// ========================
// ERRO 404
// ========================
app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} não encontrada` });
});

// ========================
// ERRO GLOBAL
// ========================
app.use((err, req, res, _next) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// ========================
// START
// ========================
app.listen(PORT, () => {
  console.log(`\n🤖 MicroSaaS Agents API iniciada!`);
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🔑 Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ Chave não encontrada'}`);
  console.log(`🦙 Ollama: Verificando...`);
  checkOllamaStatus().then(status => {
    console.log(`🦙 Ollama: ${status.online ? `✅ Online | Modelos: ${status.models.join(', ')}` : '⚠️ Offline (usando Gemini como fallback)'}`);
    console.log(`\n🚀 Agentes prontos para uso!\n`);
  });
});

module.exports = app;
