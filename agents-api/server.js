// Load luma-os primary env first (canonical source), then project .env as overrides
const lumaEnv = '/root/luma-os/.env.local';
const lumaEnv2 = '/root/luma-os/.env';
if (require('fs').existsSync(lumaEnv)) require('dotenv').config({ path: lumaEnv });
if (require('fs').existsSync(lumaEnv2)) require('dotenv').config({ path: lumaEnv2 });
require('dotenv').config();
const express = require('express');
const path = require('path');
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
const leadMagnetUXAgent = require('./agents/leadMagnetUXAgent');
const leadMagnetCopyAgent = require('./agents/leadMagnetCopyAgent');
const leadMagnetTDAHAgent = require('./agents/leadMagnetTDAHAgent');
const { sendArticleForApproval, sendPublishConfirmation } = require('./services/discordService');
const { sendForApproval, handleApprovalAction, sendWeeklySummary } = require('./services/discordControlCenter');
const { cleanupCompletedTasks, getOperationHistory, getKanbanStats } = require('./services/kanbanCleanup');
const { checkAlerts, getAlerts, clearAlerts } = require('./services/alertService');
const { archive, recall, learn, getPreferences, getLearningStats, getStrategicMemory, detectPatterns } = require('./services/memoryService');
const { runAllChecks, analyzeAnomalies, getSentinelHistory, getSentinelStats } = require('./services/sentinelService');
const { analyzeTrends, discoverOpportunities, competitiveAnalysis, saveOpportunity, getOpportunities, getGrowthStats } = require('./services/growthService');
const { saveVersion, listVersions, rollback } = require('./services/contentVersioning');
const { getImageForSuggestion, getStats: getImageStats } = require('./services/imageCache');
const videoAutomationAgent = require('./agents/videoAutomationAgent');
const organicMarketingAgent = require('./agents/organicMarketingAgent');
const paidMarketingAgent = require('./agents/paidMarketingAgent');
const funnelCoordinator = require('./agents/funnelCoordinator');
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

// Meta-dados dos agentes (catálogo)
const AGENT_META = {
  support:    { icon: "💬", label: "Mia (Suporte)",       color: "orange", desc: "Suporte 24/7 via Ollama + Gemini" },
  content:   { icon: "✍️", label: "Content Creator",      color: "cyan",   desc: "Posts, blogs, e-mails e scripts" },
  tiktok:    { icon: "📱", label: "TikTok Shop Agent",    color: "pink",   desc: "Roteiros e estrategia viral" },
  shopify:   { icon: "🛍️", label: "Shopify Expert",       color: "green",  desc: "Copy de vendas e SEO" },
  pinterest: { icon: "📌", label: "Pinterest Growth",     color: "orange", desc: "Trafico visual e pins" },
  website:   { icon: "🏗️", label: "Website Builder",      color: "purple", desc: "Sites completos com Gemini Pro" },
  automation:{ icon: "⚙️", label: "Automation Builder",   color: "pink",   desc: "Workflows n8n com IA" },
  analytics: { icon: "📊", label: "Business Intelligence", color: "green",  desc: "Insights e analises de dados" },
};

app.get('/api/agents/meta', (req, res) => {
  res.json(AGENT_META);
});

app.get('/api/agents/meta/:id', (req, res) => {
  const meta = AGENT_META[req.params.id];
  if (!meta) return res.status(404).json({ error: 'Agente nao encontrado' });
  res.json(meta);
});

// 🪵 Log automático de agentes bem-sucedidos no operation_history
function logAgentAction(agentId, handler) {
  return async (req, res) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body && body.success) {
        try {
          const title = body.title || body.content || `Execucao: ${agentId}`;
          const desc = body.description || (typeof body.content === 'string' ? body.content.slice(0, 100) : '');
          db.prepare(`
            INSERT INTO operation_history (source_table, title, description, status, metadata)
            VALUES (?, ?, ?, 'COMPLETED', ?)
          `).run(
            `agent_${agentId}`,
            typeof title === 'string' ? title.slice(0, 200) : `Agente ${agentId}`,
            typeof desc === 'string' ? desc.slice(0, 300) : '',
            JSON.stringify({ agentId, ...(body.metadata || {}) })
          );
        } catch (_) {}
      }
      return originalJson(body);
    };
    return handler(req, res);
  };
}

const creditMiddleware = require('./middleware/creditMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

// 🛡️ Anti-Loop Guard para todos os agentes
const antiLoopGuard = require('./middleware/antiLoopGuard');
app.all('/api/agents/*', antiLoopGuard);

// 🏗️ Website Builder — Gemini Pro (5 Créditos)
app.post('/api/agents/website', heavyLimiter, creditMiddleware(5), logAgentAction('website', websiteBuilderAgent));

// ✍️ Content Creator — Gemini Flash (2 Créditos)
app.post('/api/agents/content', creditMiddleware(2), logAgentAction('content', contentCreatorAgent));

// ⚙️ Automation Builder — Gemini Pro (5 Créditos)
app.post('/api/agents/automation', heavyLimiter, creditMiddleware(5), logAgentAction('automation', automationBuilderAgent));

// 📊 Business Intelligence — Gemini Flash (2 Créditos)
app.post('/api/agents/analytics', creditMiddleware(2), logAgentAction('analytics', businessIntelligenceAgent));

// 💬 Customer Support — Ollama/Gemini (1 Crédito)
app.post('/api/agents/support', creditMiddleware(1), logAgentAction('support', customerSupportAgent));
app.delete('/api/agents/support/session/:sessionId', clearSession);

// 🎬 Video Factory — Gemini Pro + FFmpeg (5 Créditos)
app.post('/api/agents/video', upload.single('video'), creditMiddleware(5), logAgentAction('video', videoAutomationAgent));

// 🛒 Sales Agents (2 Créditos cada)
app.post('/api/agents/tiktok', creditMiddleware(2), logAgentAction('tiktok', tiktokShopAgent));
app.post('/api/agents/shopify', creditMiddleware(2), logAgentAction('shopify', shopifyAgent));
app.post('/api/agents/pinterest', creditMiddleware(2), logAgentAction('pinterest', pinterestAgent));

// 🧠 TDAH Specialist — Organização cognitiva (1 crédito)
app.post('/api/agents/tdah', creditMiddleware(1), logAgentAction('tdah', tdahAgent));

// 👁️ Supervisor Inteligente — Indicações (1 crédito)
app.post('/api/agents/supervisor', creditMiddleware(1), logAgentAction('supervisor', supervisorAgent));

// 🎨 UX Specialist — Onboarding (1 crédito)
app.post('/api/agents/ux', creditMiddleware(1), logAgentAction('ux', uxAgent));

// 💰 Financial Intelligence (2 créditos)
app.post('/api/agents/financial', creditMiddleware(2), logAgentAction('financial', financialAgent));

// 📈 Google/Marketing Strategy (1 crédito)
app.post('/api/agents/google', creditMiddleware(1), logAgentAction('google', googleAgent));

// 🔍 Google SEO Intelligence (2 créditos)
app.post('/api/agents/google-seo', creditMiddleware(2), logAgentAction('google-seo', googleSeoAgent));

// 📱 Marketing Orgânico (1 crédito)
app.post('/api/agents/organic-marketing', creditMiddleware(1), logAgentAction('organic-marketing', organicMarketingAgent));

// 💰 Marketing Pago (2 créditos)
app.post('/api/agents/paid-marketing', creditMiddleware(2), logAgentAction('paid-marketing', paidMarketingAgent));

// 🔄 Funnel Coordinator — Orquestração multigentes (3 créditos)
app.post('/api/agents/funnel', creditMiddleware(3), logAgentAction('funnel', funnelCoordinator));

// ✍️ Blog Agent — Geração e publicação (3 créditos)
app.post('/api/agents/blog', creditMiddleware(3), logAgentAction('blog', blogAgent));

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
    'blog': blogAgent,
    'organic-marketing': organicMarketingAgent,
    'paid-marketing': paidMarketingAgent,
    'funnel': funnelCoordinator
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
// 📈 REVENUE HISTORY (temporal charts)
// ========================

// Snapshot manual dos dados atuais
app.post('/api/financial/revenue-snapshot', (req, res) => {
  try {
    const { readFinancialMetrics } = require('./services/stripeReader');
    const m = readFinancialMetrics();
    if (!m) return res.status(500).json({ error: 'Não foi possível ler métricas financeiras' });
    const today = new Date().toISOString().slice(0, 10);
    db.prepare(`
      INSERT INTO revenue_history (date, mrr, total_revenue, paying_users, total_users, conversion_rate)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        mrr = excluded.mrr,
        total_revenue = excluded.total_revenue,
        paying_users = excluded.paying_users,
        total_users = excluded.total_users,
        conversion_rate = excluded.conversion_rate,
        snapshot_at = CURRENT_TIMESTAMP
    `).run(today, m.mrr, m.totalRevenue, m.payingUsers, m.totalUsers, m.conversionRate);
    res.json({ success: true, date: today, metrics: m });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Histórico temporal
app.get('/api/financial/revenue-history', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const rows = db.prepare(`
    SELECT date, mrr, total_revenue, paying_users, total_users, conversion_rate, snapshot_at
    FROM revenue_history
    ORDER BY date DESC
    LIMIT ?
  `).all(days);
  res.json(rows.reverse());
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
// 🧲 LEAD MAGNET LAB (BLOCO 8)
// ========================

app.post('/api/agents/lead-magnet', logAgentAction('lead-magnet', leadMagnetAgent));
app.post('/api/agents/lead-magnet-ux', logAgentAction('lead-magnet-ux', leadMagnetUXAgent));
app.post('/api/agents/lead-magnet-copy', logAgentAction('lead-magnet-copy', leadMagnetCopyAgent));
app.post('/api/agents/lead-magnet-tdah', logAgentAction('lead-magnet-tdah', leadMagnetTDAHAgent));

// Inventário CRUD
app.get('/api/lead-magnets', (req, res) => {
  const magnets = db.prepare('SELECT * FROM lead_magnets ORDER BY created_at DESC').all();
  res.json(magnets);
});

app.get('/api/lead-magnets/:id', (req, res) => {
  const magnet = db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(req.params.id);
  if (!magnet) return res.status(404).json({ error: 'Isca não encontrada' });
  res.json(magnet);
});

app.post('/api/lead-magnets', (req, res) => {
  const { title, description, type, category, objective, funnelStage, niche, content, cta, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'title obrigatório' });
  const result = db.prepare(`
    INSERT INTO lead_magnets (title, description, type, category, objective, funnel_stage, niche, content, cta, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || '', type || 'pdf', category || 'geral', objective || 'lead', funnelStage || 'top', niche || '', content || '', cta || '', tags || '');
  const magnet = db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(result.lastInsertRowid);
  console.log(`[LeadMagnet] #${magnet.id} criada: ${title}`);
  res.json(magnet);
});

app.patch('/api/lead-magnets/:id', (req, res) => {
  const { title, description, type, category, objective, funnelStage, niche, content, cta, status, seoScore, tags } = req.body;
  const updates = []; const params = [];
  if (title) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (type) { updates.push('type = ?'); params.push(type); }
  if (category) { updates.push('category = ?'); params.push(category); }
  if (objective) { updates.push('objective = ?'); params.push(objective); }
  if (funnelStage) { updates.push('funnel_stage = ?'); params.push(funnelStage); }
  if (niche) { updates.push('niche = ?'); params.push(niche); }
  if (content !== undefined) { updates.push('content = ?'); params.push(content); }
  if (cta !== undefined) { updates.push('cta = ?'); params.push(cta); }
  if (status) { updates.push('status = ?'); params.push(status); }
  if (seoScore !== undefined) { updates.push('seo_score = ?'); params.push(seoScore); }
  if (tags !== undefined) { updates.push('tags = ?'); params.push(tags); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);
  db.prepare(`UPDATE lead_magnets SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const magnet = db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(req.params.id);
  res.json(magnet);
});

app.delete('/api/lead-magnets/:id', (req, res) => {
  db.prepare('DELETE FROM lead_magnets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Gerar isca com 3 agentes em paralelo
app.post('/api/lead-magnets/generate', async (req, res) => {
  const { title, type, category, niche, audience } = req.body;
  if (!title) return res.status(400).json({ error: 'title obrigatório' });
  try {
    const { callGemini } = require('./config/llm');
    const prompt = `Crie uma isca digital (lead magnet) completa para o título: "${title}".

Tipo: ${type || 'pdf'}
Categoria: ${category || 'geral'}
Nichos: ${niche || 'empreendedorismo'}
Público: ${audience || 'Pequenos empresários brasileiros'}

Gere um JSON válido (sem markdown) com:
{
  "description": "descrição em 2 linhas",
  "content": "conteúdo principal em 200-300 palavras com valor prático imediato",
  "cta": "chamada para ação irresistível",
  "seo_score": numero_de_0_a_100,
  "tags": "tag1, tag2, tag3"
}`;
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Resposta inválida da IA' });
    const generated = JSON.parse(jsonMatch[0]);

    // Salvar no banco
    const result = db.prepare(`
      INSERT INTO lead_magnets (title, description, type, category, niche, content, cta, seo_score, tags, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).run(title, generated.description || '', type || 'pdf', category || 'geral', niche || '', generated.content || '', generated.cta || '', generated.seo_score || 75, generated.tags || '');
    const magnet = db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(result.lastInsertRowid);

    // Criar versão inicial
    db.prepare('INSERT INTO lead_magnet_versions (magnet_id, version, content) VALUES (?, ?, ?)').run(magnet.id, 1, JSON.stringify({ content: generated.content, cta: generated.cta }));

    res.json({ success: true, magnet, generated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Match: artigo → melhor isca
app.post('/api/lead-magnets/match', (req, res) => {
  const { articleTitle, articleCategory, articleContent } = req.body;
  const category = (articleCategory || '').toLowerCase();
  const magnets = db.prepare("SELECT * FROM lead_magnets WHERE status = 'published' OR status = 'approved'").all();

  if (magnets.length === 0) {
    return res.json({ success: true, matched: null, message: 'Nenhuma isca publicada disponível' });
  }

  // Score matching simples: categoria match + keyword match no título
  let best = null; let bestScore = 0;
  for (const m of magnets) {
    let score = 0;
    const mCat = (m.category || '').toLowerCase();
    const mTitle = (m.title || '').toLowerCase();
    const aTitle = (articleTitle || '').toLowerCase();
    const aContent = (articleContent || '').toLowerCase();

    if (category && mCat.includes(category)) score += 30;
    if (mTitle && aTitle.includes(mTitle.slice(0, 20))) score += 20;
    const words = aTitle.split(' ').concat(aContent.slice(0, 200).split(' '));
    const mWords = mTitle.split(' ');
    for (const w of mWords) { if (w.length > 3 && words.includes(w)) score += 5; }
    if (m.download_count > 0) score += Math.min(m.download_count, 10);

    if (score > bestScore) { bestScore = score; best = m; }
  }

  res.json({ success: true, matched: best, score: bestScore, total: magnets.length });
});

// Captura de lead
app.post('/api/lead-magnets/capture', (req, res) => {
  const { name, email, magnetId, magnetTitle, originArticle, originArticleId, category, funnelStage } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name e email obrigatórios' });

  // Evitar duplicatas
  const existing = db.prepare("SELECT id FROM lead_captures WHERE email = ? AND magnet_id = ?").get(email, magnetId || null);
  if (existing) return res.json({ success: true, existing: true, id: existing.id });

  const result = db.prepare(`
    INSERT INTO lead_captures (name, email, magnet_id, magnet_title, origin_article, origin_article_id, category, funnel_stage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, email, magnetId || null, magnetTitle || '', originArticle || '', originArticleId || null, category || 'geral', funnelStage || 'top');

  // Incrementar contagem de conversão da isca
  if (magnetId) {
    db.prepare('UPDATE lead_magnets SET conversion_count = conversion_count + 1 WHERE id = ?').run(magnetId);
  }

  res.json({ success: true, id: result.lastInsertRowid, existing: false });
});

// Log de download
app.post('/api/lead-magnets/:id/download', (req, res) => {
  const { leadId } = req.body;
  db.prepare('INSERT INTO lead_magnet_downloads (magnet_id, lead_id, ip, user_agent) VALUES (?, ?, ?, ?)')
    .run(req.params.id, leadId || null, req.ip || '', req.headers['user-agent'] || '');
  db.prepare('UPDATE lead_magnets SET download_count = download_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Estatísticas
app.get('/api/lead-magnets/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM lead_magnets').get();
  const published = db.prepare("SELECT COUNT(*) as c FROM lead_magnets WHERE status = 'published' OR status = 'approved'").get();
  const totalDownloads = db.prepare('SELECT COALESCE(SUM(download_count), 0) as t FROM lead_magnets').get();
  const totalConversions = db.prepare('SELECT COALESCE(SUM(conversion_count), 0) as t FROM lead_magnets').get();
  const totalLeads = db.prepare('SELECT COUNT(*) as c FROM lead_captures').get();
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM lead_magnets GROUP BY category').all();
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM lead_magnets GROUP BY type').all();
  const byFunnelStage = db.prepare('SELECT funnel_stage, COUNT(*) as count FROM lead_magnets GROUP BY funnel_stage').all();
  const recentLeads = db.prepare('SELECT * FROM lead_captures ORDER BY created_at DESC LIMIT 10').all();
  res.json({
    total: total.c, published: published.c, totalDownloads: totalDownloads.t,
    totalConversions: totalConversions.t, totalLeads: totalLeads.c,
    byCategory, byType, byFunnelStage, recentLeads,
  });
});

// Aprovação via Discord
app.post('/api/lead-magnets/:id/approve-discord', async (req, res) => {
  const magnet = db.prepare('SELECT * FROM lead_magnets WHERE id = ?').get(req.params.id);
  if (!magnet) return res.status(404).json({ error: 'Isca não encontrada' });
  try {
    await sendArticleForApproval({
      id: magnet.id, title: magnet.title,
      content: magnet.content || magnet.description,
      excerpt: magnet.description, category: magnet.category,
      tags: magnet.tags, seoScore: magnet.seo_score,
      leadMagnet: magnet.title, brandingApplied: true,
    });
    res.json({ success: true, message: 'Isca enviada para aprovação no Discord.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Versionamento
app.get('/api/lead-magnets/:id/versions', (req, res) => {
  const versions = db.prepare('SELECT * FROM lead_magnet_versions WHERE magnet_id = ? ORDER BY version DESC').all(req.params.id);
  res.json(versions);
});

app.post('/api/lead-magnets/:id/versions', (req, res) => {
  const { content, createdBy } = req.body;
  if (!content) return res.status(400).json({ error: 'content obrigatório' });
  const maxVer = db.prepare("SELECT COALESCE(MAX(version), 0) as mv FROM lead_magnet_versions WHERE magnet_id = ?").get(req.params.id);
  const version = maxVer.mv + 1;
  db.prepare('INSERT INTO lead_magnet_versions (magnet_id, version, content, created_by) VALUES (?, ?, ?, ?)')
    .run(req.params.id, version, JSON.stringify(content), createdBy || 'system');
  db.prepare('UPDATE lead_magnets SET version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(version, req.params.id);
  res.json({ success: true, version });
});

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
// 📢 CAMPAIGNS
// ========================

app.get('/api/campaigns', (req, res) => {
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const { clerkId, title, description, platform, objective, budget, audience, creative } = req.body;
  if (!clerkId || !title) return res.status(400).json({ error: 'Campos obrigatórios: clerkId, title' });
  const result = db.prepare(
    `INSERT INTO campaigns (clerk_id, title, description, platform, objective, budget, audience, creative)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(clerkId, title, description || '', platform || 'organic', objective || 'conversion', budget || 0, audience || '', creative || '');
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);
  console.log(`[Campaign] #${campaign.id} criada: ${title}`);
  res.json(campaign);
});

app.patch('/api/campaigns/:id', (req, res) => {
  const { status, reviewNotes, approvedBy } = req.body;
  const updates = [];
  const params = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (reviewNotes) { updates.push('review_notes = ?'); params.push(reviewNotes); }
  if (approvedBy) { updates.push('approved_by = ?'); params.push(approvedBy); }
  if (status === 'APPROVED') { updates.push('approved_at = CURRENT_TIMESTAMP'); }
  if (status === 'EXECUTING') { updates.push('executed_at = CURRENT_TIMESTAMP'); }
  if (status === 'COMPLETED') { updates.push('completed_at = CURRENT_TIMESTAMP'); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  db.prepare(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  res.json(campaign);
});

app.delete('/api/campaigns/:id', (req, res) => {
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ========================
// 📢 CAMPAIGN AUTOMATION
// ========================

// Gerar campanha com IA
app.post('/api/campaigns/generate', async (req, res) => {
  const { clerkId, brief } = req.body;
  if (!clerkId || !brief) return res.status(400).json({ error: 'Campos obrigatórios: clerkId, brief' });
  try {
    const { callGemini } = require('./config/llm');
    const prompt = `Crie uma campanha de marketing completa para este brief: "${brief}"

Gere um JSON válido (sem markdown) com:
{
  "title": "título da campanha",
  "description": "descrição em 2 linhas",
  "platform": "organic | meta-ads | google-ads | tiktok-ads | email",
  "objective": "conversion | traffic | leads | awareness | retention",
  "budget": numero_estimado,
  "audience": "público-alvo detalhado",
  "creative": "headline e descrição do criativo"
}`;
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Resposta inválida da IA' });
    const suggestion = JSON.parse(jsonMatch[0]);
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sequências de email para campanha
app.get('/api/campaigns/:id/sequences', (req, res) => {
  const sequences = db.prepare('SELECT * FROM email_sequences WHERE campaign_id = ? ORDER BY days_after_start ASC').all(req.params.id);
  res.json(sequences);
});

app.post('/api/campaigns/:id/sequences', (req, res) => {
  const { subject, body, daysAfterStart } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject obrigatório' });
  const result = db.prepare(
    'INSERT INTO email_sequences (campaign_id, subject, body, days_after_start) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, subject, body || '', daysAfterStart || 0);
  const seq = db.prepare('SELECT * FROM email_sequences WHERE id = ?').get(result.lastInsertRowid);
  res.json(seq);
});

app.patch('/api/campaigns/:id/sequences/:seqId', (req, res) => {
  const { subject, body, daysAfterStart, status } = req.body;
  const updates = []; const params = [];
  if (subject) { updates.push('subject = ?'); params.push(subject); }
  if (body) { updates.push('body = ?'); params.push(body); }
  if (daysAfterStart !== undefined) { updates.push('days_after_start = ?'); params.push(daysAfterStart); }
  if (status) { updates.push('status = ?'); params.push(status); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.seqId);
  db.prepare(`UPDATE email_sequences SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json({ success: true });
});

// Conectar campanha a blog posts
app.get('/api/campaigns/:id/blog-connections', (req, res) => {
  const posts = db.prepare('SELECT id, title, category, status, campaign_id FROM content_queue WHERE campaign_id = ?').all(req.params.id);
  res.json(posts);
});

app.post('/api/campaigns/:id/connect-blog', (req, res) => {
  const { postIds } = req.body;
  if (!postIds || !Array.isArray(postIds)) return res.status(400).json({ error: 'postIds array obrigatório' });
  const update = db.prepare('UPDATE content_queue SET campaign_id = ? WHERE id = ?');
  const txn = db.transaction((ids) => {
    for (const pid of ids) { update.run(req.params.id, pid); }
  });
  txn(postIds);
  res.json({ success: true, connected: postIds.length });
});

// Insights de campanhas
app.get('/api/campaigns/insights', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM campaigns').get();
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM campaigns GROUP BY status').all();
  const byPlatform = db.prepare('SELECT platform, COUNT(*) as count FROM campaigns GROUP BY platform').all();
  const totalBudget = db.prepare('SELECT COALESCE(SUM(budget), 0) as total FROM campaigns').get();
  const avgBudget = db.prepare('SELECT COALESCE(AVG(budget), 0) as avg FROM campaigns WHERE budget > 0').get();
  res.json({ total: total.c, byStatus, byPlatform, totalBudget: totalBudget.total, avgBudget: avgBudget.avg });
});

// ========================
// 🎮 BLOCO 9 — DISCORD CONTROL CENTER
// ========================

// Aprovação unificada para qualquer fluxo
app.post('/api/discord/approve-flow', async (req, res) => {
  const { flowType, item, actor } = req.body;
  if (!flowType || !item) return res.status(400).json({ error: 'flowType e item obrigatórios' });
  try {
    const result = await sendForApproval(flowType, item, actor || req.headers['x-user-email'] || 'admin');
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ação do Discord (POSTAR, SALVAR, REJEITAR, REGERAR, PAUSAR, RETOMAR)
app.post('/api/discord/action', async (req, res) => {
  const { customId, actor } = req.body;
  if (!customId) return res.status(400).json({ error: 'customId obrigatório' });
  try {
    const result = await handleApprovalAction(customId, actor || req.headers['x-user-email'] || 'discord-user');
    if (result.error) return res.status(400).json(result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resumo semanal
app.post('/api/discord/weekly-summary', async (req, res) => {
  try {
    const result = await sendWeeklySummary();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// 📋 OPERATIONS CONTROL
// ========================

// Histórico operacional
app.get('/api/operations/history', (req, res) => {
  const { sourceTable, limit } = req.query;
  res.json(getOperationHistory(sourceTable, parseInt(limit) || 50));
});

// Estatísticas do Kanban
app.get('/api/operations/kanban-stats', (req, res) => {
  res.json(getKanbanStats());
});

// Limpeza manual
app.post('/api/operations/cleanup', (req, res) => {
  const result = cleanupCompletedTasks();
  res.json({ success: true, ...result });
});

// ========================
// 🚨 ALERTS
// ========================

// Verificar alertas
app.get('/api/alerts/check', (req, res) => {
  const alerts = checkAlerts();
  res.json({ alerts, count: alerts.length });
});

// Listar alertas ativos
app.get('/api/alerts', (req, res) => {
  const { severity } = req.query;
  res.json(getAlerts(severity));
});

// Limpar alertas
app.delete('/api/alerts', (req, res) => {
  clearAlerts();
  res.json({ success: true });
});

// ========================
// 👤 LEADS (segmentação)
// ========================

// Listar leads com filtros
app.get('/api/leads', (req, res) => {
  const { category, funnelStage, search, limit } = req.query;
  let query = 'SELECT * FROM lead_captures WHERE 1=1';
  const params = [];
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (funnelStage) { query += ' AND funnel_stage = ?'; params.push(funnelStage); }
  if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit) || 100);
  const leads = db.prepare(query).all(...params);
  res.json(leads);
});

// Segmentação de leads
app.get('/api/leads/segmentation', (req, res) => {
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM lead_captures WHERE category != "" GROUP BY category ORDER BY count DESC').all();
  const byFunnelStage = db.prepare('SELECT funnel_stage, COUNT(*) as count FROM lead_captures GROUP BY funnel_stage ORDER BY count DESC').all();
  const byMagnet = db.prepare('SELECT magnet_title, COUNT(*) as count FROM lead_captures WHERE magnet_title != "" GROUP BY magnet_title ORDER BY count DESC LIMIT 10').all();
  const byOrigin = db.prepare('SELECT origin_article, COUNT(*) as count FROM lead_captures WHERE origin_article != "" GROUP BY origin_article ORDER BY count DESC LIMIT 10').all();
  const total = db.prepare('SELECT COUNT(*) as c FROM lead_captures').get();
  res.json({ total: total.c, byCategory, byFunnelStage, byMagnet, byOrigin });
});

// ========================
// 📋 AUDIT LOGS
// ========================

app.get('/api/audit/logs', (req, res) => {
  const { entityType, action, limit } = req.query;
  let query = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];
  if (entityType) { query += ' AND entity_type = ?'; params.push(entityType); }
  if (action) { query += ' AND action = ?'; params.push(action); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit) || 100);
  const logs = db.prepare(query).all(...params);
  res.json(logs);
});

app.get('/api/audit/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get();
  const byAction = db.prepare('SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC').all();
  const byEntity = db.prepare('SELECT entity_type, COUNT(*) as count FROM audit_logs GROUP BY entity_type ORDER BY count DESC').all();
  const recentErrors = db.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE status = 'error' AND created_at > datetime('now', '-1 day')").get();
  res.json({ total: total.c, byAction, byEntity, recentErrors: recentErrors.c });
});

// ========================
// 🧠 BLOCO 10A — MEMÓRIA DE LONGO PRAZO
// ========================

// Arquivar memória
app.post('/api/memory/archive', (req, res) => {
  const { category, title, content, tags, score, source, metadata } = req.body;
  if (!category || !title || !content) return res.status(400).json({ error: 'category, title, content obrigatórios' });
  const entry = archive(category, title, content, tags, score, source, metadata);
  res.json(entry);
});

// Recuperar memórias
app.get('/api/memory/recall', (req, res) => {
  const { category, search, limit } = req.query;
  res.json(recall(category, search, parseInt(limit) || 20));
});

// Memória estratégica (top scored)
app.get('/api/memory/strategic', (req, res) => {
  res.json(getStrategicMemory(parseInt(req.query.limit) || 10));
});

// Padrões detectados
app.get('/api/memory/patterns', (req, res) => {
  const { category } = req.query;
  res.json(detectPatterns(category || 'all'));
});

// ========================
// 🤖 AGENT LEARNING
// ========================

// Registrar aprendizado
app.post('/api/learning/record', (req, res) => {
  const { agentId, feature, value, scoreDelta } = req.body;
  if (!agentId || !feature || !value) return res.status(400).json({ error: 'agentId, feature, value obrigatórios' });
  const result = learn(agentId, feature, value, scoreDelta);
  res.json(result);
});

// Preferências do agente
app.get('/api/learning/preferences', (req, res) => {
  const { agentId, feature, minScore } = req.query;
  if (!agentId) return res.status(400).json({ error: 'agentId obrigatório' });
  res.json(getPreferences(agentId, feature, parseFloat(minScore) || 0));
});

// Estatísticas de aprendizado
app.get('/api/learning/stats', (req, res) => {
  res.json(getLearningStats());
});

// ========================
// 🚨 BLOCO 10B — SENTINELA 24H
// ========================

// Executar todas as verificações
app.post('/api/sentinel/check', async (req, res) => {
  try {
    const results = await runAllChecks();
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analisar anomalias com IA
app.post('/api/sentinel/analyze', async (req, res) => {
  try {
    const analysis = await analyzeAnomalies();
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Histórico do sentinel
app.get('/api/sentinel/history', (req, res) => {
  const { severity, checkType, limit } = req.query;
  res.json(getSentinelHistory(severity, checkType, parseInt(limit) || 50));
});

// Estatísticas do sentinel
app.get('/api/sentinel/stats', (req, res) => {
  res.json(getSentinelStats());
});

// ========================
// 📈 BLOCO 10C — GROWTH LOOP
// ========================

// Analisar tendências
app.post('/api/growth/trends', async (req, res) => {
  const { niche } = req.body;
  try {
    const trends = await analyzeTrends(niche);
    res.json({ success: true, trends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Descobrir oportunidades
app.post('/api/growth/discover', async (req, res) => {
  const { niche } = req.body;
  try {
    const opportunities = await discoverOpportunities(niche);
    // Save each opportunity
    const saved = [];
    for (const opp of opportunities) {
      const s = saveOpportunity(opp.type, opp.title, opp.description, opp.potentialScore, opp.category, 'gemini', opp);
      saved.push(s);
    }
    res.json({ success: true, opportunities: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Análise competitiva
app.post('/api/growth/competitive', async (req, res) => {
  try {
    const analysis = await competitiveAnalysis();
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar oportunidades
app.get('/api/growth/opportunities', (req, res) => {
  const { status, type, limit } = req.query;
  res.json(getOpportunities(status, type, parseInt(limit) || 50));
});

// Salvar oportunidade manual
app.post('/api/growth/opportunities', (req, res) => {
  const { type, title, description, potentialScore, category, source, metadata } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type, title obrigatórios' });
  const opp = saveOpportunity(type, title, description, potentialScore, category, source, metadata);
  res.json(opp);
});

// Estatísticas de growth
app.get('/api/growth/stats', (req, res) => {
  res.json(getGrowthStats());
});

// ========================
// 🛡️ BLOCO 10D — GOVERNANÇA E CONTROLE
// ========================

// PAUSE ALL AGENTS (emergency stop)
let agentsPaused = false;
const agentQueue = [];

app.post('/api/control/pause-all', (req, res) => {
  agentsPaused = true;
  const reason = req.body.reason || 'Comando manual';
  console.log(`[CONTROL] 🛑 PAUSE ALL AGENTS: ${reason}`);
  archive('governance', 'PAUSE ALL AGENTS', reason, 'emergency', 0, 'admin', { reason, timestamp: new Date().toISOString() });
  res.json({ success: true, paused: true, reason, agentsPaused: true });
});

app.post('/api/control/resume-all', (req, res) => {
  agentsPaused = false;
  console.log('[CONTROL] ▶️ RESUME ALL AGENTS');
  res.json({ success: true, paused: false });
});

app.get('/api/control/status', (req, res) => {
  res.json({ agentsPaused, queuedActions: agentQueue.length });
});

// ========================
// 🚀 ONBOARDING PROGRESS
// ========================
// Listar notificações (suporta ?seed=1 para incluir dados de demonstração)
app.get('/api/notifications', (req, res) => {
  const showSeed = req.query.seed === '1';
  const notifs = showSeed
    ? db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20").all()
    : db.prepare("SELECT * FROM notifications WHERE is_seed != 1 ORDER BY created_at DESC LIMIT 20").all();
  res.json(notifs);
});

// Listar vault de vídeos
app.get('/api/video-vault', (req, res) => {
  const vault = db.prepare("SELECT * FROM video_vault ORDER BY created_at DESC LIMIT 20").all();
  res.json(vault);
});

app.get('/api/onboarding/progress', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  if (!userId) return res.json({ error: 'userId required' }, 400);

  const user = db.prepare("SELECT clerk_id, plan, created_at FROM users WHERE clerk_id = ?").get(userId) || {};
  const contentCount = db.prepare("SELECT COUNT(*) as c FROM content_queue WHERE clerk_id = ?").get(userId);
  const campaignCount = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE clerk_id = ?").get(userId);
  const magnetCount = db.prepare("SELECT COUNT(*) as c FROM lead_magnets").get();
  const taskCount = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE clerk_id = ? AND status = 'COMPLETED'").get(userId);

  const steps = [
    { id: "s1", label: "Criar conta", description: "Cadastro e verificação de e-mail", status: "completed", icon: "✅" },
    { id: "s2", label: "Definir plano", description: "Escolha do plano ideal", status: user.plan && user.plan !== 'free' ? "completed" : (user.plan ? "current" : "pending"), icon: user.plan && user.plan !== 'free' ? "✅" : "⏳" },
    { id: "s3", label: "Primeiro conteúdo", description: "Criação do primeiro artigo ou ideia", status: contentCount.c > 0 ? "completed" : "pending", icon: contentCount.c > 0 ? "✅" : "📝" },
    { id: "s4", label: "Criar campanha", description: "Configurar primeira campanha de marketing", status: campaignCount.c > 0 ? "completed" : "pending", icon: campaignCount.c > 0 ? "✅" : "📢" },
    { id: "s5", label: "Isca digital", description: "Publicar primeiro lead magnet", status: magnetCount.c > 0 ? "completed" : "pending", icon: magnetCount.c > 0 ? "✅" : "🧲" },
    { id: "s6", label: "Automações", description: "Agentes executando tarefas", status: taskCount.c > 2 ? "completed" : "pending", icon: taskCount.c > 2 ? "✅" : "⚙️" },
  ];

  const completed = steps.filter(s => s.status === "completed").length;
  const current = steps.find(s => s.status === "current" || s.status === "pending");

  res.json({
    totalSteps: steps.length,
    completedSteps: completed,
    currentStep: current?.label || "Completo",
    steps,
    startedAt: user.created_at || new Date().toISOString(),
    daysSinceStart: user.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) : 0,
  });
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

  // Discord Bot — conversacional (usando luma-os env como fonte)
  const { startBot } = require('./services/discordBot');
  startBot().then(bot => {
    if (bot) console.log(`💬 Discord Bot: ✅ Online e ouvindo mensagens`);
    else console.log(`💬 Discord Bot: ⏸️ Desativado (sem token ou desabilitado)`);
  });
});

module.exports = app;
