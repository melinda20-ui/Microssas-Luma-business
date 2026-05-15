const { db } = require('../config/db');
const { callGemini } = require('../config/llm');

function archive(category, title, content, tags, score, source, metadata = {}) {
  const result = db.prepare(
    'INSERT INTO memory_archive (category, title, content, tags, score, source, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(category, title, content, tags || '', score || 0, source || 'system', JSON.stringify(metadata));
  return db.prepare('SELECT * FROM memory_archive WHERE id = ?').get(result.lastInsertRowid);
}

function recall(category, search, limit = 20) {
  let query = 'SELECT * FROM memory_archive WHERE 1=1';
  const params = [];
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (search) { query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  query += ' ORDER BY score DESC, created_at DESC LIMIT ?';
  params.push(limit);
  return db.prepare(query).all(...params);
}

async function learn(agentId, feature, value, scoreDelta = 1) {
  const existing = db.prepare("SELECT * FROM agent_learning WHERE agent_id = ? AND feature = ? AND value = ?").get(agentId, feature, value);
  if (existing) {
    db.prepare("UPDATE agent_learning SET score = score + ?, count = count + 1, last_seen = CURRENT_TIMESTAMP WHERE id = ?")
      .run(scoreDelta, existing.id);
    return { ...existing, score: existing.score + scoreDelta, count: existing.count + 1 };
  }
  const result = db.prepare(
    'INSERT INTO agent_learning (agent_id, feature, value, score) VALUES (?, ?, ?, ?)'
  ).run(agentId, feature, value, scoreDelta);
  return db.prepare('SELECT * FROM agent_learning WHERE id = ?').get(result.lastInsertRowid);
}

function getPreferences(agentId, feature, minScore = 0) {
  return db.prepare(
    'SELECT * FROM agent_learning WHERE agent_id = ? AND feature = ? AND score >= ? ORDER BY score DESC'
  ).all(agentId, feature, minScore);
}

function getLearningStats() {
  const totalEntries = db.prepare('SELECT COUNT(*) as c FROM agent_learning').get();
  const topFeatures = db.prepare('SELECT agent_id, feature, COUNT(*) as count, AVG(score) as avg_score FROM agent_learning GROUP BY agent_id, feature ORDER BY avg_score DESC LIMIT 20').all();
  const recent = db.prepare('SELECT * FROM agent_learning ORDER BY last_seen DESC LIMIT 10').all();
  return { totalEntries: totalEntries.c, topFeatures, recent };
}

function getStrategicMemory(limit = 10) {
  return db.prepare("SELECT * FROM memory_archive WHERE score > 0 ORDER BY score DESC, created_at DESC LIMIT ?").all(limit);
}

function detectPatterns(category) {
  const entries = db.prepare("SELECT content, score FROM memory_archive WHERE category = ? AND score > 0").all(category);
  if (entries.length < 3) return [];
  const patterns = [];
  const words = entries.flatMap(e => (e.content || '').toLowerCase().split(' '));
  const freq = {};
  for (const w of words) { if (w.length > 4) freq[w] = (freq[w] || 0) + 1; }
  const common = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return common.map(([word, count]) => ({ word, count, category }));
}

module.exports = { archive, recall, learn, getPreferences, getLearningStats, getStrategicMemory, detectPatterns };