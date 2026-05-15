const { db } = require('../config/db');
const { callGemini } = require('../config/llm');

async function analyzeTrends(niche) {
  const prompt = `Como especialista em tendências de mercado, analise o nicho "${niche || 'microsaas, agentes IA, empreendedorismo digital'}" e gere insights:

Gere um JSON válido (sem markdown):
{
  "trends": [
    {"trend": "nome da tendência", "momentum": "baixo|médio|alto", "impact": "descrição do impacto para a Sualuma"}
  ],
  "keywordsEmergentes": ["keyword1", "keyword2", "keyword3"],
  "oportunidades": ["oportunidade1", "oportunidade2"],
  "riscos": ["risco1", "risco2"],
  "sugestoesConteudo": ["pauta1", "pauta2", "pauta3"]
}`;

  try {
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return null;
}

async function discoverOpportunities(niche) {
  const prompt = `Como estrategista de crescimento para a Sualuma (microsaas de agentes IA), identifique oportunidades não exploradas no nicho "${niche || 'pequenos empresários brasileiros'}".

Gere um JSON válido (sem markdown) com um array de oportunidades:
[
  {
    "type": "produto | conteudo | parceria | monetizacao",
    "title": "título da oportunidade",
    "description": "descrição em 2 linhas",
    "potentialScore": 0-100,
    "category": "geral | tdah | financas | marketing | produtividade | seo"
  }
]

Mínimo 3 oportunidades.`;

  try {
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return [];
}

async function competitiveAnalysis() {
  const prompt = `Como analista de inteligência competitiva, analise o posicionamento da Sualuma (microsaas de agentes IA para pequenos empresários brasileiros).

Gere um JSON válido (sem markdown):
{
  "posicionamento": "análise do posicionamento atual",
  "diferenciais": ["diferencial1", "diferencial2", "diferencial3"],
  "vulnerabilidades": ["vulnerabilidade1", "vulnerabilidade2"],
  "movimentosEstrategicos": ["movimento1", "movimento2", "movimento3"],
  "recomendacoes": ["recomendação1", "recomendação2"]
}`;

  try {
    const raw = await callGemini(prompt, 'gemini-1.5-flash');
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return null;
}

function saveOpportunity(type, title, description, potentialScore, category, source, metadata = {}) {
  const result = db.prepare(
    'INSERT INTO growth_opportunities (type, title, description, potential_score, category, source, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(type, title, description || '', potentialScore || 0, category || 'geral', source || 'system', JSON.stringify(metadata));
  return db.prepare('SELECT * FROM growth_opportunities WHERE id = ?').get(result.lastInsertRowid);
}

function getOpportunities(status, type, limit = 50) {
  let query = 'SELECT * FROM growth_opportunities WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (type) { query += ' AND type = ?'; params.push(type); }
  query += ' ORDER BY potential_score DESC, created_at DESC LIMIT ?';
  params.push(limit);
  return db.prepare(query).all(...params);
}

function getGrowthStats() {
  const total = db.prepare("SELECT COUNT(*) as c FROM growth_opportunities").get();
  const byType = db.prepare("SELECT type, COUNT(*) as count FROM growth_opportunities GROUP BY type").all();
  const byStatus = db.prepare("SELECT status, COUNT(*) as count FROM growth_opportunities GROUP BY status").all();
  const top = db.prepare("SELECT * FROM growth_opportunities ORDER BY potential_score DESC LIMIT 5").all();
  return { total: total.c, byType, byStatus, top };
}

module.exports = { analyzeTrends, discoverOpportunities, competitiveAnalysis, saveOpportunity, getOpportunities, getGrowthStats };