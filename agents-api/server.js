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
const { initDb, SUPER_ADMIN_EMAIL } = require('./config/db');
const { startJob } = require('./services/cleanupJob');
const blogManager = require('./agents/blogManager');
const tiktokShopAgent = require('./agents/tiktokShopAgent');
const shopifyAgent = require('./agents/shopifyAgent');
const pinterestAgent = require('./agents/pinterestAgent');
const tdahAgent = require('./agents/tdahAgent');
const supervisorAgent = require('./agents/supervisorAgent');
const uxAgent = require('./agents/uxAgent');
const financialAgent = require('./agents/financialAgent');
const googleAgent = require('./agents/googleAgent');
const googleSeoAgent = require('./agents/googleSeoAgent');
const { blogAgent, getQueue, updateQueueStatus, publishBatch, getStats } = require('./agents/blogAgent');
const leadMagnetAgent = require('./agents/leadMagnetAgent');
const { sendArticleForApproval, sendPublishConfirmation } = require('./services/discordService');
const { saveVersion, listVersions, rollback } = require('./services/contentVersioning');
const { getImageForSuggestion, getStats: getImageStats } = require('./services/imageCache');
const { db } = require('./config/db');

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
    const user = db.prepare('SELECT credits, plan, role, last_reset FROM users WHERE clerk_id = ?').get(req.params.clerkId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
});

// 🔐 Verificar super-admin
app.get('/api/user/:clerkId/super-admin', (req, res) => {
    const user = db.prepare('SELECT email, role FROM users WHERE clerk_id = ?').get(req.params.clerkId);
    const isSuperAdmin = user && user.role === 'super-admin' && user.email === SUPER_ADMIN_EMAIL;
    res.json({ superAdmin: !!isSuperAdmin, role: user?.role || 'none' });
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

// 🛒 Sales Agents (2 Créditos cada)
app.post('/api/agents/tiktok', creditMiddleware(2), tiktokShopAgent);
app.post('/api/agents/shopify', creditMiddleware(2), shopifyAgent);
app.post('/api/agents/pinterest', creditMiddleware(2), pinterestAgent);

// 🧠 TDAH Specialist — Organização cognitiva (1 crédito)
app.post('/api/agents/tdah', creditMiddleware(1), tdahAgent);

// 👁️ Supervisor Inteligente — Indicações (1 crédito)
app.post('/api/agents/supervisor', creditMiddleware(1), supervisorAgent);

// 🎨 UX Specialist — Onboarding (1 crédito)
app.post('/api/agents/ux', creditMiddleware(1), uxAgent);

// 💰 Financial Intelligence (2 créditos)
app.post('/api/agents/financial', creditMiddleware(2), financialAgent);

// 📈 Google/Marketing Strategy (1 crédito)
app.post('/api/agents/google', creditMiddleware(1), googleAgent);

// 🔍 Google SEO Intelligence (2 créditos)
app.post('/api/agents/google-seo', creditMiddleware(2), googleSeoAgent);

// ✍️ Blog Agent — Geração e publicação (3 créditos)
app.post('/api/agents/blog', creditMiddleware(3), blogAgent);

// 💳 Billing & Stripe
const marketplaceRoutes = require('./routes/marketplace');
const billingRoutes = require('./routes/billing');
app.use('/api/billing', billingRoutes);
app.use('/api/marketplace', marketplaceRoutes);

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
    'support': customerSupportAgent,
    'tiktok': tiktokShopAgent,
    'shopify': shopifyAgent,
    'pinterest': pinterestAgent,
    'tdah': tdahAgent,
    'supervisor': supervisorAgent,
    'ux': uxAgent,
    'financial': financialAgent,
    'google': googleAgent,
    'google-seo': googleSeoAgent,
    'blog': blogAgent
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
// 🧠 BRAIN TASKS (Mia Brain)
// ========================

// Listar tarefas por sessão
app.get('/api/brain/tasks/:sessionId', (req, res) => {
    const tasks = db.prepare('SELECT * FROM brain_tasks WHERE session_id = ? ORDER BY created_at DESC').all(req.params.sessionId);
    res.json(tasks);
});

// Listar tarefas pendentes do usuário
app.get('/api/brain/tasks/pending/:clerkId', (req, res) => {
    const tasks = db.prepare("SELECT * FROM brain_tasks WHERE clerk_id = ? AND status = 'PENDING' ORDER BY created_at DESC").all(req.params.clerkId);
    res.json(tasks);
});

// Criar tarefa (PENDING por padrão)
app.post('/api/brain/tasks', (req, res) => {
    const { sessionId, clerkId, agentId, title, description, payload } = req.body;
    if (!sessionId || !clerkId || !agentId || !title) {
        return res.status(400).json({ error: 'Campos obrigatórios: sessionId, clerkId, agentId, title' });
    }
    const result = db.prepare(
        'INSERT INTO brain_tasks (session_id, clerk_id, agent_id, title, description, payload) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(sessionId, clerkId, agentId, title, description || '', JSON.stringify(payload || {}));
    const task = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(result.lastInsertRowid);
    console.log(`[Brain] Tarefa #${task.id} criada: "${title}" (${agentId})`);
    res.status(201).json(task);
});

// Aprovar tarefa (PENDING → APPROVED)
app.patch('/api/brain/tasks/:id/approve', (req, res) => {
    const { clerkId } = req.body;
    if (!clerkId) return res.status(400).json({ error: 'clerkId obrigatório' });
    const task = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    if (task.status !== 'PENDING') return res.status(400).json({ error: `Tarefa já está como ${task.status}` });
    db.prepare("UPDATE brain_tasks SET status = 'APPROVED', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(clerkId, req.params.id);
    const updated = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    console.log(`[Brain] Tarefa #${task.id} APROVADA por ${clerkId}`);
    res.json(updated);
});

// Iniciar execução (APPROVED → EXECUTING)
app.patch('/api/brain/tasks/:id/execute', (req, res) => {
    const task = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    if (task.status !== 'APPROVED') return res.status(400).json({ error: `Tarefa precisa ser aprovada primeiro. Status atual: ${task.status}` });
    db.prepare("UPDATE brain_tasks SET status = 'EXECUTING', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    console.log(`[Brain] Tarefa #${task.id} EXECUTANDO`);
    res.json(updated);
});

// Completar tarefa (EXECUTING → COMPLETED)
app.patch('/api/brain/tasks/:id/complete', (req, res) => {
    const task = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    if (task.status !== 'EXECUTING') return res.status(400).json({ error: `Tarefa não está em execução. Status atual: ${task.status}` });
    db.prepare("UPDATE brain_tasks SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    console.log(`[Brain] Tarefa #${task.id} COMPLETADA`);
    res.json(updated);
});

// Rejeitar tarefa (qualquer status → REJECTED)
app.patch('/api/brain/tasks/:id/reject', (req, res) => {
    db.prepare("UPDATE brain_tasks SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM brain_tasks WHERE id = ?').get(req.params.id);
    console.log(`[Brain] Tarefa #${updated.id} REJEITADA`);
    res.json(updated);
});

// ========================
// 🎯 FINANCIAL GOALS
// ========================

// Listar metas
app.get('/api/financial/goals', (req, res) => {
  const goals = db.prepare('SELECT * FROM financial_goals ORDER BY created_at DESC').all();
  res.json(goals);
});

// Criar meta
app.post('/api/financial/goals', (req, res) => {
  const { clerkId, title, description, targetValue, category, dueDate } = req.body;
  if (!clerkId || !title) {
    return res.status(400).json({ error: 'Campos obrigatórios: clerkId, title' });
  }
  const result = db.prepare(
    `INSERT INTO financial_goals (clerk_id, title, description, target_value, category, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(clerkId, title, description, targetValue || 0, category || 'revenue', dueDate || null);
  const goal = db.prepare('SELECT * FROM financial_goals WHERE id = ?').get(result.lastInsertRowid);
  console.log(`[Financeiro] Meta #${goal.id} criada: ${title}`);
  res.json(goal);
});

// Atualizar meta
app.patch('/api/financial/goals/:id', (req, res) => {
  const { currentValue, status } = req.body;
  db.prepare(
    `UPDATE financial_goals SET current_value = COALESCE(?, current_value), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(currentValue, status, req.params.id);
  const goal = db.prepare('SELECT * FROM financial_goals WHERE id = ?').get(req.params.id);
  res.json(goal);
});

// Deletar meta
app.delete('/api/financial/goals/:id', (req, res) => {
  db.prepare('DELETE FROM financial_goals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========================
// 💡 CONTENT IDEAS
// ========================

// Listar ideias
app.get('/api/content/ideas', (req, res) => {
  const ideas = db.prepare(`
    SELECT ci.*, fg.title as goal_title FROM content_ideas ci
    LEFT JOIN financial_goals fg ON ci.financial_goal_id = fg.id
    ORDER BY ci.created_at DESC
  `).all();
  res.json(ideas);
});

// Criar ideia
app.post('/api/content/ideas', (req, res) => {
  const { clerkId, title, description, category, financialGoalId, platform } = req.body;
  if (!clerkId || !title) {
    return res.status(400).json({ error: 'Campos obrigatórios: clerkId, title' });
  }
  const result = db.prepare(
    `INSERT INTO content_ideas (clerk_id, title, description, category, financial_goal_id, platform)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(clerkId, title, description, category || 'acquisition', financialGoalId || null, platform || 'blog');
  const idea = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(result.lastInsertRowid);
  res.json(idea);
});

// Atualizar ideia
app.patch('/api/content/ideas/:id', (req, res) => {
  const { status, platform } = req.body;
  db.prepare(
    `UPDATE content_ideas SET status = COALESCE(?, status), platform = COALESCE(?, platform) WHERE id = ?`
  ).run(status, platform, req.params.id);
  const idea = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(req.params.id);
  res.json(idea);
});

// Deletar ideia
app.delete('/api/content/ideas/:id', (req, res) => {
  db.prepare('DELETE FROM content_ideas WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========================
// ✍️ BLOG AGENT — Content Queue & Publishing
// ========================

// Listar fila de conteúdo
app.get('/api/blog/queue', getQueue);

// Atualizar item da fila
app.patch('/api/blog/queue/:id', updateQueueStatus);

// Publicar batch (até 5/dia, mínimo 20 artigos totais)
app.post('/api/blog/publish', publishBatch);

// Estatísticas do blog
app.get('/api/blog/stats', getStats);

// ========================
// 🧲 LEAD MAGNETS
// ========================

app.post('/api/agents/lead-magnet', leadMagnetAgent);

// ========================
// 🚀 DISCORD APPROVAL
// ========================

app.post('/api/discord/approve', async (req, res) => {
  const { queueId } = req.body;
  if (!queueId) return res.status(400).json({ error: 'queueId obrigatório' });
  const item = db.prepare('SELECT * FROM content_queue WHERE id = ?').get(queueId);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  try {
    await sendArticleForApproval({
      id: item.id, title: item.title, content: item.content || item.excerpt,
      excerpt: item.excerpt, category: item.category, tags: item.tags,
      seoScore: item.seo_score, leadMagnet: item.lead_magnet, brandingApplied: item.branding_applied,
    });
    res.json({ success: true, message: 'Artigo enviado para aprovação no Discord.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/discord/confirm', async (req, res) => {
  const { queueId, approvedBy } = req.body;
  if (!queueId) return res.status(400).json({ error: 'queueId obrigatório' });
  const item = db.prepare('SELECT * FROM content_queue WHERE id = ?').get(queueId);
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  db.prepare("UPDATE content_queue SET status = 'reviewed', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(approvedBy || 'discord-admin', queueId);
  try { await sendPublishConfirmation({ title: item.title, category: item.category, seoScore: item.seo_score }, approvedBy); } catch {}
  res.json({ success: true, message: 'Artigo aprovado via Discord.' });
});

// ========================
// 📦 CONTENT VERSIONING
// ========================

app.get('/api/content/versions/:postId', (req, res) => {
  res.json(listVersions(req.params.postId));
});

app.post('/api/content/rollback/:postId', (req, res) => {
  const { version } = req.body;
  const content = rollback(req.params.postId, version);
  if (!content) return res.status(404).json({ error: 'Versão não encontrada' });
  res.json({ success: true, content });
});

// ========================
// 🖼️ IMAGE CACHE
// ========================

app.get('/api/images/stats', (req, res) => {
  res.json(getImageStats());
});

app.post('/api/images/suggest', (req, res) => {
  const { context } = req.body;
  if (!context) return res.status(400).json({ error: 'context obrigatório' });
  res.json(getImageForSuggestion(context));
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
