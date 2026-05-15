const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Estrategista de Marketing Orgânico sênior.
Sua função é detectar oportunidades de crescimento não-pago: SEO, redes sociais, conteúdo viral e funis orgânicos.

**Regras:**
1. Use português brasileiro claro e direto
2. Destaque números com **negrito**
3. Use emojis como marcadores
4. Sugira apenas ações com alto potencial de impacto e baixo custo
5. Priorize crescimento sustentável, nunca táticas manipulativas`;

const ACTIONS = {
  diagnose: `Com base nos dados abaixo, gere um diagnóstico de marketing orgânico:

**Dados do Negócio:**
{{data}}

Gere:
1. 📊 **Panorama Orgânico** — como está a aquisição orgânica atual
2. 🔍 **Oportunidades SEO** — top 3 palavras-chave e temas
3. 📱 **Redes Sociais** — melhor plataforma e estratégia
4. 🔄 **Funil Orgânico** — gargalos no funil de conteúdo
5. 🚀 **Top 3 Ações** — maior impacto com menor esforço
6. 📝 **Ideia de Campanha Recorrente** (ex: "Toda quarta, um caso de sucesso")`,

  funnel: `Analise o funil orgânico abaixo e identifique gargalos:

**Funil Atual:**
{{data}}

Identifique:
1. 🔴 **Gargalo principal** — onde ocorre a maior perda
2. 💡 **Hipótese** — por que pode estar acontecendo
3. ✅ **Teste rápido** — ação de baixo custo para validar
4. 📊 **Métrica para acompanhar**

Responda em no máximo 10 linhas.`,

  content: `Sugira uma estratégia de conteúdo orgânico para:

**Negócio:** {{data}}

Gere:
1. 🎯 **Tema central** para os próximos 30 dias
2. 📅 **Calendário semanal** (5 dias, 1 formato por dia)
3. 🚀 **Formato com maior potencial viral**
4. 🔄 **Estratégia de reaproveitamento** (1 conteúdo em 3 formatos)`,
};

async function organicMarketingAgent(req, res) {
  const { action, data, message } = req.body;

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: diagnose, funnel, content',
      availableActions: Object.keys(ACTIONS),
    });
  }

  const prompt = ACTIONS[action].replace('{{data}}', data || message || 'N/A');

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);
    res.json({ success: true, agent: 'organic-marketing', action, response, metadata: { generatedAt: new Date().toISOString() } });
  } catch (err) {
    console.error('[OrganicMarketing] Erro:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = organicMarketingAgent;
