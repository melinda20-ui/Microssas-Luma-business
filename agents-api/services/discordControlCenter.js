const { sendToDiscord } = require('./discordService');
const { db } = require('../config/db');

const FLOW_TYPES = ['article', 'campaign', 'task', 'asset', 'magnet'];

function audit(action, entityType, entityId, actor, details = {}, status = 'success') {
  try {
    db.prepare(
      'INSERT INTO audit_logs (action, entity_type, entity_id, actor, details, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(action, entityType, String(entityId || ''), actor || 'system', JSON.stringify(details), status);
  } catch {}
}

async function sendForApproval(flowType, item, actor) {
  if (!FLOW_TYPES.includes(flowType)) throw new Error(`Tipo de fluxo inválido: ${flowType}`);

  const emojiMap = { article: '✍️', campaign: '📢', task: '✅', asset: '📦', magnet: '🧲' };
  const emoji = emojiMap[flowType] || '📋';

  const embed = {
    title: `${emoji} Novo ${flowType} para Aprovação: ${item.title}`,
    description: (item.description || item.excerpt || '').slice(0, 300),
    color: flowType === 'article' ? 0xFFA500 : flowType === 'campaign' ? 0xEC4899 : flowType === 'task' ? 0x22C55E : flowType === 'asset' ? 0x818CF8 : 0x8B5CF6,
    fields: [
      { name: '📂 Tipo', value: flowType, inline: true },
      { name: '🆔 ID', value: String(item.id || 'novo'), inline: true },
      ...(item.category ? [{ name: '📂 Categoria', value: item.category, inline: true }] : []),
      ...(item.seoScore ? [{ name: '📊 SEO Score', value: `${item.seoScore}/100`, inline: true }] : []),
      { name: '📝 Detalhes', value: (item.content || item.description || '').slice(0, 400) + '...', inline: false },
      ...(item.leadMagnet ? [{ name: '🧲 Lead Magnet', value: item.leadMagnet, inline: true }] : []),
    ],
    footer: { text: `${flowType} #${item.id || 'novo'} · ${new Date().toLocaleString('pt-BR')}` },
  };

  const result = await sendToDiscord({
    content: `@here **Novo ${flowType} aguardando aprovação!**`,
    embeds: [embed],
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 3, label: '✅ POSTAR', custom_id: `approve_${flowType}_${item.id || 'new'}` },
          { type: 2, style: 2, label: '📁 SALVAR', custom_id: `draft_${flowType}_${item.id || 'new'}` },
          { type: 2, style: 4, label: '❌ REJEITAR', custom_id: `reject_${flowType}_${item.id || 'new'}` },
          { type: 2, style: 1, label: '🔁 REGERAR', custom_id: `regenerate_${flowType}_${item.id || 'new'}` },
        ],
      },
      {
        type: 1,
        components: [
          { type: 2, style: 2, label: '⏸ PAUSAR', custom_id: `pause_${flowType}_${item.id || 'new'}` },
          { type: 2, style: 3, label: '▶ RETOMAR', custom_id: `resume_${flowType}_${item.id || 'new'}` },
        ],
      },
    ],
  });

  audit('approval-request', flowType, item.id, actor, { title: item.title });
  return result;
}

async function handleApprovalAction(customId, actor) {
  const parts = customId.split('_');
  if (parts.length < 3) return { error: 'custom_id inválido' };

  const [action, flowType, ...idParts] = parts;
  const entityId = idParts.join('_');

  if (!FLOW_TYPES.includes(flowType)) return { error: `Tipo de fluxo inválido: ${flowType}` };

  let result = { action, flowType, entityId, actor };

  switch (action) {
    case 'approve':
      result.status = 'approved';
      if (flowType === 'article') {
        db.prepare("UPDATE content_queue SET status = 'reviewed', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(actor, entityId);
      } else if (flowType === 'campaign') {
        db.prepare("UPDATE campaigns SET status = 'APPROVED', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(actor, entityId);
      } else if (flowType === 'task') {
        db.prepare("UPDATE brain_tasks SET status = 'APPROVED', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(actor, entityId);
      } else if (flowType === 'magnet') {
        db.prepare("UPDATE lead_magnets SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(entityId);
      }
      break;

    case 'draft':
      result.status = 'draft';
      if (flowType === 'article') {
        db.prepare("UPDATE content_queue SET status = 'draft' WHERE id = ?").run(entityId);
      } else if (flowType === 'magnet') {
        db.prepare("UPDATE lead_magnets SET status = 'draft' WHERE id = ?").run(entityId);
      }
      break;

    case 'reject':
      result.status = 'rejected';
      if (flowType === 'article') {
        db.prepare("UPDATE content_queue SET status = 'draft' WHERE id = ?").run(entityId);
      } else if (flowType === 'campaign') {
        db.prepare("UPDATE campaigns SET status = 'PENDING' WHERE id = ?").run(entityId);
      } else if (flowType === 'task') {
        db.prepare("UPDATE brain_tasks SET status = 'PENDING' WHERE id = ?").run(entityId);
      } else if (flowType === 'magnet') {
        db.prepare("UPDATE lead_magnets SET status = 'draft' WHERE id = ?").run(entityId);
      }
      break;

    case 'regenerate':
      result.status = 'regenerating';
      if (flowType === 'article') {
        db.prepare("UPDATE content_queue SET status = 'draft' WHERE id = ?").run(entityId);
      } else if (flowType === 'magnet') {
        db.prepare("UPDATE lead_magnets SET status = 'draft' WHERE id = ?").run(entityId);
      }
      break;

    case 'pause':
      result.status = 'paused';
      if (flowType === 'campaign') {
        db.prepare("UPDATE campaigns SET status = 'PENDING' WHERE id = ?").run(entityId);
      }
      break;

    case 'resume':
      result.status = 'resumed';
      if (flowType === 'campaign') {
        db.prepare("UPDATE campaigns SET status = 'EXECUTING' WHERE id = ?").run(entityId);
      }
      break;

    default:
      return { error: `Ação desconhecida: ${action}` };
  }

  audit(`${action}_${flowType}`, flowType, entityId, actor, result);
  return result;
}

async function sendWeeklySummary() {
  const pendingTasks = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'PENDING'").get();
  const completedTasks = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'COMPLETED'").get();
  const pendingArticles = db.prepare("SELECT COUNT(*) as c FROM content_queue WHERE status = 'draft'").get();
  const activeCampaigns = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE status = 'EXECUTING' OR status = 'APPROVED'").get();
  const totalMagnets = db.prepare("SELECT COUNT(*) as c FROM lead_magnets WHERE status = 'published' OR status = 'approved'").get();
  const totalLeads = db.prepare("SELECT COUNT(*) as c FROM lead_captures").get();

  const embed = {
    title: '📊 Resumo Semanal do Studio',
    color: 0x818CF8,
    fields: [
      { name: '✅ Tarefas Concluídas', value: String(completedTasks.c), inline: true },
      { name: '⏳ Tarefas Pendentes', value: String(pendingTasks.c), inline: true },
      { name: '✍️ Artigos Pendentes', value: String(pendingArticles.c), inline: true },
      { name: '📢 Campanhas Ativas', value: String(activeCampaigns.c), inline: true },
      { name: '🧲 Iscas Publicadas', value: String(totalMagnets.c), inline: true },
      { name: '👤 Leads Capturados', value: String(totalLeads.c), inline: true },
    ],
    footer: { text: `Gerado em ${new Date().toLocaleString('pt-BR')}` },
  };

  const report = await sendToDiscord({
    content: '📊 **Resumo Semanal do Ecossistema Sualuma**',
    embeds: [embed],
  });

  audit('weekly-summary', 'system', null, 'system', { pendingTasks: pendingTasks.c, completedTasks: completedTasks.c });
  return report;
}

async function sendAlert(title, description, severity = 'warning') {
  const colorMap = { critical: 0xEF4444, warning: 0xF59E0B, info: 0x3B82F6 };
  const emojiMap = { critical: '🚨', warning: '⚠️', info: 'ℹ️' };

  return sendToDiscord({
    content: `${emojiMap[severity] || 'ℹ️'} **${title}**`,
    embeds: [{
      title,
      description: description.slice(0, 1000),
      color: colorMap[severity] || 0x3B82F6,
      footer: { text: `Severidade: ${severity} · ${new Date().toLocaleString('pt-BR')}` },
    }],
  });
}

module.exports = { sendForApproval, handleApprovalAction, sendWeeklySummary, sendAlert, audit };