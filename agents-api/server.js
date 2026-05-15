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
const leadMagnetUXAgent = require('./agents/leadMagnetUXAgent');
const leadMagnetCopyAgent = require('./agents/leadMagnetCopyAgent');
const leadMagnetTDAHAgent = require('./agents/leadMagnetTDAHAgent');
const { sendArticleForApproval, sendPublishConfirmation } = require('./services/discordService');
const { saveVersion, listVersions, rollback } = require('./services/contentVersioning');
const { getImageForSuggestion, getStats: getImageStats } = require('./services/imageCache');
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

// 📱 Marketing Orgânico (1 crédito)
app.post('/api/agents/organic-marketing', creditMiddleware(1), organicMarketingAgent);

// 💰 Marketing Pago (2 créditos)
app.post('/api/agents/paid-marketing', creditMiddleware(2), paidMarketingAgent);

// 🔄 Funnel Coordinator — Orquestração multigentes (3 créditos)
app.post('/api/agents/funnel', creditMiddleware(3), funnelCoordinator);

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

app.post('/api/agents/lead-magnet', leadMagnetAgent);
app.post('/api/agents/lead-magnet-ux', leadMagnetUXAgent);
app.post('/api/agents/lead-magnet-copy', leadMagnetCopyAgent);
app.post('/api/agents/lead-magnet-tdah', leadMagnetTDAHAgent);

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
