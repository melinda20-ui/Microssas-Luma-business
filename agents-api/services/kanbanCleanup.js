const { db } = require('../config/db');

function cleanupCompletedTasks() {
  const moved = db.prepare(`
    INSERT OR IGNORE INTO operation_history (original_id, source_table, title, description, status, original_created_at, metadata)
    SELECT id, 'brain_tasks', title, description, 'COMPLETED', created_at, payload
    FROM brain_tasks
    WHERE status = 'COMPLETED'
      AND created_at < datetime('now', '-1 day')
      AND archived_at IS NULL
      AND id NOT IN (SELECT original_id FROM operation_history WHERE source_table = 'brain_tasks')
  `).run();

  if (moved.changes > 0) {
    db.prepare(`
      UPDATE brain_tasks SET archived_at = CURRENT_TIMESTAMP
      WHERE status = 'COMPLETED'
        AND created_at < datetime('now', '-1 day')
        AND archived_at IS NULL
        AND id IN (SELECT original_id FROM operation_history WHERE source_table = 'brain_tasks')
    `).run();
    console.log(`[KanbanCleanup] ${moved.changes} tarefas concluídas arquivadas.`);
  }

  const archived = db.prepare(`
    INSERT OR IGNORE INTO operation_history (original_id, source_table, title, description, status, original_created_at, metadata)
    SELECT id, 'brain_tasks', title, description, 'ARCHIVED', created_at, payload
    FROM brain_tasks
    WHERE archived_at IS NOT NULL
      AND archived_at < datetime('now', '-1 day')
      AND id NOT IN (SELECT original_id FROM operation_history WHERE source_table = 'brain_tasks')
  `).run();

  if (archived.changes > 0) {
    console.log(`[KanbanCleanup] ${archived.changes} tarefas arquivadas adicionadas ao histórico.`);
  }

  // Limpar tarefas PENDING muito antigas (> 30 dias)
  const stale = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'PENDING' AND created_at < datetime('now', '-30 days')").get();
  if (stale.c > 0) {
    console.log(`[KanbanCleanup] ⚠️ ${stale.c} tarefas PENDING há mais de 30 dias. Sugerindo revisão.`);
  }

  return { moved: moved.changes, archived: archived.changes, stale: stale.c };
}

function getOperationHistory(sourceTable, limit = 50) {
  if (sourceTable) {
    return db.prepare('SELECT * FROM operation_history WHERE source_table = ? ORDER BY archived_at DESC LIMIT ?').all(sourceTable, limit);
  }
  return db.prepare('SELECT * FROM operation_history ORDER BY archived_at DESC LIMIT ?').all(limit);
}

function getKanbanStats() {
  const active = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE archived_at IS NULL").get();
  const completed = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'COMPLETED'").get();
  const archived = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE archived_at IS NOT NULL").get();
  const inHistory = db.prepare("SELECT COUNT(*) as c FROM operation_history").get();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM brain_tasks WHERE archived_at IS NULL GROUP BY status").all();
  const pendingOld = db.prepare("SELECT COUNT(*) as c FROM brain_tasks WHERE status = 'PENDING' AND created_at < datetime('now', '-7 days')").get();
  return { active: active.c, completed: completed.c, archived: archived.c, inHistory: inHistory.c, byStatus, pendingOldDays: pendingOld.c };
}

module.exports = { cleanupCompletedTasks, getOperationHistory, getKanbanStats };