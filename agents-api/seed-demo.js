// Seed script — povoa o banco com dados de demonstração
const { db, initDb } = require('./config/db');
require('dotenv').config();

initDb();

console.log('🌱 Populando banco com dados de demonstração...\n');

// 1. Notificações de boas-vindas
const existingNotifs = db.prepare("SELECT COUNT(*) as c FROM notifications").get();
if (existingNotifs.c === 0) {
  const notifs = [
    { title: 'Bem-vindo ao Studio!', message: 'Seu ambiente de agentes IA está pronto. Explore o Mia Brain para começar.', type: 'success' },
    { title: 'Sentinela Ativo', message: 'O monitoramento contínuo está operacional. 6 checagens automáticas em execução.', type: 'info' },
    { title: 'Memória Operacional', message: 'O Archive Brain já está registrando decisões e aprendendo padrões.', type: 'info' },
  ];
  const ins = db.prepare("INSERT INTO notifications (title, message, type, is_seed) VALUES (?, ?, ?, 1)");
  for (const n of notifs) ins.run(n.title, n.message, n.type);
  console.log(`✅ ${notifs.length} notificações`);
}

// 2. Sentinel logs — amostra histórica
const existingSentinel = db.prepare("SELECT COUNT(*) as c FROM sentinel_logs").get();
if (existingSentinel.c === 0) {
  const logs = [
    { check_type: 'revenue', status: 'ok', metric: 'weekly_revenue', value: 0, threshold: 30, severity: 'ok', message: 'Receita semanal estável. Nenhuma queda detectada.' },
    { check_type: 'queue', status: 'ok', metric: 'draft_articles', value: 3, threshold: 20, severity: 'info', message: '3 artigos em rascunho. Fila saudável.' },
    { check_type: 'tasks', status: 'ok', metric: 'stuck_tasks', value: 0, threshold: 3, severity: 'ok', message: 'Nenhuma tarefa travada.' },
    { check_type: 'errors', status: 'ok', metric: 'error_rate', value: 2, threshold: 10, severity: 'info', message: '2 erros nas últimas 24h. Taxa normal.' },
    { check_type: 'campaigns', status: 'ok', metric: 'completion_rate', value: 0, threshold: 20, severity: 'info', message: 'Nenhuma campanha concluída ainda.' },
    { check_type: 'leads', status: 'ok', metric: 'total_leads', value: 0, threshold: 0, severity: 'info', message: 'Nenhum lead capturado ainda. Crie iscas digitais!' },
  ];
  const ins = db.prepare("INSERT INTO sentinel_logs (check_type, status, metric, value, threshold, severity, message, is_seed) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
  for (const l of logs) ins.run(l.check_type, l.status, l.metric, l.value, l.threshold, l.severity, l.message);
  console.log(`✅ ${logs.length} logs do Sentinela`);
}

// 3. Memory archive — entradas estratégicas
const existingMemory = db.prepare("SELECT COUNT(*) as c FROM memory_archive").get();
if (existingMemory.c === 0) {
  const entries = [
    { category: 'estrategica', title: 'Missão do Studio', content: 'Fornecer agentes de IA autônomos para criar, automatizar e escalar negócios digitais com mínimo esforço manual.', tags: 'missao,visao,estrategia', score: 10 },
    { category: 'aprendizado', title: 'Padrão: Preferência por UI escura', content: 'Usuários do Studio demonstram preferência por interfaces escuras com cards bem definidos e tipografia limpa.', tags: 'ux,design,preferencia', score: 8 },
    { category: 'operacional', title: 'Fluxo de Aprovação DISCORD', content: 'Todo conteúdo gerado por IA passa pelo fluxo PENDING → APPROVED → EXECUTING → COMPLETED via Discord.', tags: 'discord,approval,fluxo', score: 9 },
    { category: 'estrategica', title: 'Stack Tecnológica', content: 'Next.js + Express + SQLite + Gemini API + Ollama (modelos locais). Discord para governança.', tags: 'stack,tecnologia,arquitetura', score: 7 },
    { category: 'aprendizado', title: 'Padrão: Agentes preferem respostas estruturadas', content: 'Agentes com system prompts claros e objetivos produzem respostas 3x mais relevantes.', tags: 'ia,prompt,agentes', score: 6 },
  ];
  const ins = db.prepare("INSERT INTO memory_archive (category, title, content, tags, score, is_seed) VALUES (?, ?, ?, ?, ?, 1)");
  for (const e of entries) ins.run(e.category, e.title, e.content, e.tags, e.score);
  console.log(`✅ ${entries.length} memórias arquivadas`);
}

// 4. Agent learning — preferências
const existingLearning = db.prepare("SELECT COUNT(*) as c FROM agent_learning").get();
if (existingLearning.c === 0) {
  const prefs = [
    { agent_id: 'blogAgent', feature: 'style', value: 'diretto e informativo', score: 0.9 },
    { agent_id: 'blogAgent', feature: 'tone', value: 'profissional mas acessível', score: 0.85 },
    { agent_id: 'leadMagnetAgent', feature: 'format', value: 'PDF com checklist', score: 0.8 },
    { agent_id: 'financialAgent', feature: 'currency', value: 'BRL', score: 0.95 },
  ];
  const ins = db.prepare("INSERT OR IGNORE INTO agent_learning (agent_id, feature, value, score, is_seed) VALUES (?, ?, ?, ?, 1)");
  for (const p of prefs) ins.run(p.agent_id, p.feature, p.value, p.score);
  console.log(`✅ ${prefs.length} preferências de agentes`);
}

// 5. Audit logs — histórico
const existingAudit = db.prepare("SELECT COUNT(*) as c FROM audit_logs").get();
if (existingAudit.c === 0) {
  const logs = [
    { action: 'system-start', entity_type: 'system', entity_id: 'server', actor: 'system', details: { event: 'Agents API iniciada' }, status: 'success' },
    { action: 'db-init', entity_type: 'system', entity_id: 'database', actor: 'system', details: { tables: 18 }, status: 'success' },
    { action: 'seed-data', entity_type: 'system', entity_id: 'demo', actor: 'seed-script', details: { purpose: 'demonstração' }, status: 'success' },
  ];
  const ins = db.prepare("INSERT INTO audit_logs (action, entity_type, entity_id, actor, details, status, is_seed) VALUES (?, ?, ?, ?, ?, ?, 1)");
  for (const l of logs) ins.run(l.action, l.entity_type, l.entity_id, l.actor, JSON.stringify(l.details), l.status);
  console.log(`✅ ${logs.length} logs de auditoria`);
}

// 6. User demo
const existingUser = db.prepare("SELECT COUNT(*) as c FROM users WHERE clerk_id != 'super-admin-seed'").get();
if (existingUser.c === 0) {
  db.prepare("INSERT OR IGNORE INTO users (clerk_id, email, credits, plan, role) VALUES (?, ?, ?, ?, ?)")
    .run('demo-user-seed', 'demo@sualuma.online', 100, 'pro', 'user');
  console.log('✅ 1 usuário demo');
}

console.log('\n🌱 Seed concluído!');
