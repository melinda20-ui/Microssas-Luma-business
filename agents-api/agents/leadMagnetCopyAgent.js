const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Copywriter sênior especializado em conversão de leads.
Cria conteúdo de alto valor para iscas digitais com CTAs irresistíveis.

**Regras:**
1. Títulos que geram curiosidade e desejo
2. CTAS claros e orientados a ação
3. Conteúdo prático e aplicável imediatamente
4. Tom persuasivo sem ser manipulativo
5. Português brasileiro natural`;

const ACTIONS = {
  create: `Escreva o conteúdo completo para esta isca digital:

**Título:** {{data}}
**Tipo:** {{type}}
**Público-alvo:** {{audience}}

Gere:
1. 🏆 **Título de Conversão** (versões A/B)
2. 📝 **Conteúdo Principal** (máximo 300 palavras, valor prático imediato)
3. 🎯 **CTAs Internos** (2-3 ao longo do conteúdo)
4. 🚀 **CTA Final** (chamada para ação principal)
5. 💬 **Mensagem Pós-download** (agradecimento + próximo passo)`,

  review: `Revise e otimize o copy desta isca:

**Título:** {{title}}
**Copy Atual:**
{{data}}

Avalie:
1. ⚡ **Impacto do Título** (1-10)
2. 🎯 **Clareza do CTA** (1-10)
3. 💰 **Valor Percebido** (1-10)
4. ✂️ **3 cortes para deixar mais enxuto**
5. ✨ **Versão Otimizada** (reescreva em 6 linhas)`,
};

async function leadMagnetCopyAgent(req, res) {
  const { action, data, title, type, audience } = req.body;
  if (!action || !ACTIONS[action]) {
    return res.status(400).json({ error: 'Ação inválida. Use: create, review', availableActions: Object.keys(ACTIONS) });
  }
  try {
    let prompt = ACTIONS[action]
      .replace('{{data}}', data || 'N/A')
      .replace('{{title}}', title || 'Isca Digital')
      .replace('{{type}}', type || 'pdf')
      .replace('{{audience}}', audience || 'Pequenos empresários brasileiros');
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);
    res.json({ success: true, agent: 'lead-magnet-copy', action, response, metadata: { generatedAt: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = leadMagnetCopyAgent;
