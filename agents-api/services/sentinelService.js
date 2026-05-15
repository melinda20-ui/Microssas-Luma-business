const { db } = require('../config/db');
const { callGemini } = require('../config/llm');
const { sendAlert } = require('./discordControlCenter');

function logCheck(checkType, status, metric, value, threshold, severity, message, details = {}) {
  db.prepare(
    `INSERT INTO sentinel_logs (check_type, status, metric, value, threshold, severity, message, details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(checkType, status, metric || '', value || 0, threshold || 0, severity || 'info', message || '', JSON.stringify(details));
}

async function runAllChecks() {
  const checks = [];

  // 1. Revenue drop
  const recentRevenue = db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM orders WHERE status = 'completed' AND created_at > datetime('now', '-7 days')").get();
  const prevRevenue = db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM orders WHERE status = 'completed' AND created_at > datetime('now', '-14 days') AND created_at <= datetime('now', '-7 days')").get();
  const revenueDrop = prevRevenue.total > 0 ? ((prevRevenue.total - recentRevenue.total) / prevRevenue.total) * 100 : 0;
  if (revenueDrop > 30) {
    logCheck('revenue', 'anomaly', 'weekly_revenue_drop', revenueDrop, 30, 'critical', `Queda de ${revenueDrop.toFixed(0)}% na receita semanal`);
    sendAlert('🚨 Queda de Faturamento', `Receita caiu ${revenueDrop.toFixed(0)}% comparado à semana anterior.`, 'critical').catch(() => {});
  }

  // 2. Queue buildup
  const draftArticles = db.prepare("SELECT COUNT(*) as c FROM content_queue WHERE status = 'draft'").get();
  if (draftArticles.c > 20) {
    logCheck('queue', 'warning', 'draft_articles', draftArticles.c, 20, 'warning', `${draftArticles.c} artigos em rascunho`);
  }

  // 3. Stuck tasks
  const stuckTasks = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'PENDING' AND created_at < datetime('now', '-14 days')").get();
  if (stuckTasks.c > 3) {
    logCheck('tasks', 'warning', 'stuck_tasks', stuckTasks.c, 3, 'warning', `${stuckTasks.c} tarefas travadas há mais de 14 dias`);
    sendAlert('⚠️ Tarefas Travadas', `${stuckTasks.c} tarefas estão PENDING há mais de 14 dias.`, 'warning').catch(() => {});
  }

  // 4. Error rate
  const recentErrors = db.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE status = 'error' AND created_at > datetime('now', '-24 hours')").get();
  if (recentErrors.c > 10) {
    logCheck('errors', 'critical', 'error_rate', recentErrors.c, 10, 'critical', `${recentErrors.c} erros nas últimas 24h`);
    sendAlert('🚨 Alta Taxa de Erros', `${recentErrors.c} erros registrados nas últimas 24 horas.`, 'critical').catch(() => {});
  }

  // 5. Campaign completion rate
  const totalCampaigns = db.prepare("SELECT COUNT(*) as c FROM campaigns").get();
  const completedCampaigns = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE status = 'COMPLETED'").get();
  const completionRate = totalCampaigns.c > 0 ? (completedCampaigns.c / totalCampaigns.c) * 100 : 0;
  logCheck('campaigns', completionRate < 20 ? 'warning' : 'ok', 'completion_rate', completionRate, 20, completionRate < 20 ? 'warning' : 'info', `Taxa de conclusão: ${completionRate.toFixed(0)}%`);

  // 6. Lead magnet conversion
  const totalMagnets = db.prepare("SELECT COUNT(*) as c FROM lead_magnets WHERE status IN ('published', 'approved')").get();
  const totalDownloads = db.prepare("SELECT COALESCE(SUM(download_count), 0) as t FROM lead_magnets WHERE status IN ('published', 'approved')").get();
  const totalLeads = db.prepare("SELECT COUNT(*) as c FROM lead_captures").get();
  logCheck('leads', 'info', 'total_leads', totalLeads.c, 0, 'info', `${totalLeads.c} leads capturados de ${totalDownloads.t} downloads`);

  checks.push({ revenueDrop, draftArticles: draftArticles.c, stuckTasks: stuckTasks.c, recentErrors: recentErrors.c, completionRate, totalLeads: totalLeads.c });
  return checks;
}

async function analyzeAnomalies() {
  const recentLogs = db.prepare("SELECT * FROM sentinel_logs WHERE severity IN ('critical', 'warning') ORDER BY created_at DESC LIMIT 10").all();
  if (recentLogs.length === 0) return null;

  const prompt = `Analise os seguintes alertas do sistema Sualuma e sugira diagnóstico, causas prováveis e plano de ação:

${recentLogs.map(l => `- [${l.severity}] ${l.check_type}: ${l.message} (${l.created_at})`).join('\n')}

Gere um JSON válido (sem markdown):
{
  "diagnosis": "diagnóstico em 2 linhas",
  "possibleCauses": ["causa1", "causa2"],
  "actionPlan": ["ação1", "ação2", "ação3"],
  "priority": "baixa | média | alta | crítica"
}`;

  try {
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return null;
}

function getSentinelHistory(severity, checkType, limit = 50) {
  let query = 'SELECT * FROM sentinel_logs WHERE 1=1';
  const params = [];
  if (severity) { query += ' AND severity = ?'; params.push(severity); }
  if (checkType) { query += ' AND check_type = ?'; params.push(checkType); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);
  return db.prepare(query).all(...params);
}

function getSentinelStats() {
  const total = db.prepare("SELECT COUNT(*) as c FROM sentinel_logs").get();
  const bySeverity = db.prepare("SELECT severity, COUNT(*) as count FROM sentinel_logs GROUP BY severity").all();
  const byType = db.prepare("SELECT check_type, COUNT(*) as count FROM sentinel_logs GROUP BY check_type").all();
  const lastCheck = db.prepare("SELECT * FROM sentinel_logs ORDER BY created_at DESC LIMIT 1").get();
  const recentAnomalies = db.prepare("SELECT * FROM sentinel_logs WHERE severity IN ('critical', 'warning') ORDER BY created_at DESC LIMIT 10").all();
  return { total: total.c, bySeverity, byType, lastCheck, recentAnomalies };
}

module.exports = { logCheck, runAllChecks, analyzeAnomalies, getSentinelHistory, getSentinelStats };