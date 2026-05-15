const { db } = require('../config/db');
const { sendAlert } = require('./discordControlCenter');

const alertHistory = [];
const MAX_ALERTS = 50;

function addAlert(title, description, severity = 'warning', source = 'system') {
  const alert = { id: Date.now(), title, description, severity, source, createdAt: new Date().toISOString() };
  alertHistory.unshift(alert);
  if (alertHistory.length > MAX_ALERTS) alertHistory.length = MAX_ALERTS;

  // Send to Discord for critical+warning
  if (severity !== 'info') {
    sendAlert(title, description, severity).catch(() => {});
  }

  return alert;
}

function checkAlerts() {
  const alerts = [];

  // 1. Agents stuck — brain_tasks PENDING > 7 days
  const stuckTasks = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'PENDING' AND created_at < datetime('now', '-7 days')").get();
  if (stuckTasks.c > 0) {
    alerts.push(addAlert(
      'Tarefas Esquecidas',
      `${stuckTasks.c} tarefas estão PENDING há mais de 7 dias sem revisão.`,
      'warning', 'kanban'
    ));
  }

  // 2. Queue buildup — content_queue draft > 10
  const queueBuildup = db.prepare("SELECT COUNT(*) as c FROM content_queue WHERE status = 'draft'").get();
  if (queueBuildup.c > 15) {
    alerts.push(addAlert(
      'Fila de Artigos Acumulada',
      `${queueBuildup.c} artigos em rascunho aguardando revisão. Considere revisar ou arquivar.`,
      'warning', 'blog'
    ));
  }

  // 3. Critical errors in audit_logs (last 24h)
  const recentErrors = db.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE status = 'error' AND created_at > datetime('now', '-1 day')").get();
  if (recentErrors.c > 5) {
    alerts.push(addAlert(
      'Múltiplos Erros Recentes',
      `${recentErrors.c} erros registrados nas últimas 24h. Verifique os logs de auditoria.`,
      'critical', 'system'
    ));
  }

  // 4. Lead magnets with 0 downloads
  const zeroDownloads = db.prepare("SELECT COUNT(*) as c FROM lead_magnets WHERE status IN ('published', 'approved') AND download_count = 0").get();
  if (zeroDownloads.c > 3) {
    alerts.push(addAlert(
      'Iscas sem Downloads',
      `${zeroDownloads.c} iscas publicadas nunca foram baixadas. Considere revisar CTAs e distribuição.`,
      'info', 'leads'
    ));
  }

  // 5. Campaigns stuck in PENDING
  const stuckCampaigns = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE status = 'PENDING' AND created_at < datetime('now', '-14 days')").get();
  if (stuckCampaigns.c > 0) {
    alerts.push(addAlert(
      'Campanhas Paradas',
      `${stuckCampaigns.c} campanhas estão PENDING há mais de 14 dias.`,
      'warning', 'campaigns'
    ));
  }

  return alerts;
}

function getAlerts(severity) {
  if (severity) return alertHistory.filter(a => a.severity === severity);
  return [...alertHistory];
}

function clearAlerts() {
  alertHistory.length = 0;
  return true;
}

module.exports = { checkAlerts, getAlerts, clearAlerts, addAlert };