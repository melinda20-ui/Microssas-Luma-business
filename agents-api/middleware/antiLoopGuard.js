const { db } = require('../config/db');

const agentCallCount = {};
const MAX_CALLS_PER_MINUTE = 20;
const WINDOW_MS = 60 * 1000;

function resetCounts() {
  const now = Date.now();
  for (const key of Object.keys(agentCallCount)) {
    if (now - agentCallCount[key].start > WINDOW_MS) {
      delete agentCallCount[key];
    }
  }
}
setInterval(resetCounts, 30 * 1000);

const antiLoopGuard = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const agentPath = req.path;

  const key = `${userId}:${agentPath}`;
  const now = Date.now();

  if (!agentCallCount[key]) {
    agentCallCount[key] = { count: 1, start: now };
  } else {
    agentCallCount[key].count++;
  }

  if (agentCallCount[key].count > MAX_CALLS_PER_MINUTE) {
    const errMsg = `[Anti-Loop] ${key} excedeu ${MAX_CALLS_PER_MINUTE} chamadas/min`;

    try {
      db.prepare(
        "INSERT INTO audit_logs (action, entity_type, entity_id, actor, details, status) VALUES (?, ?, ?, ?, ?, ?)"
      ).run('anti-loop-triggered', 'agent', agentPath, userId, JSON.stringify({ count: agentCallCount[key].count }), 'error');
    } catch {}

    console.error(errMsg);
    return res.status(429).json({
      error: 'Limite de chamadas excedido. Tente novamente em alguns instantes.',
      retryAfter: 60,
    });
  }

  next();
};

module.exports = antiLoopGuard;
