const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um especialista em design cognitivo para TDAH.
Revisa materiais digitais para garantir legibilidade, reduzir sobrecarga cognitiva e melhorar o foco visual.

**Regras:**
1. Parágrafos de no máximo 3 linhas
2. Uma ideia por parágrafo
3. Marcadores e listas sempre que possível
4. Destaque visual para palavras-chave
5. Instruções diretas, sem rodeios
6. Espaçamento generoso
7. Fontes sans-serif e tamanho mínimo 14px equivalente`;

const ACTIONS = {
  create: `Crie uma versão otimizada para TDAH desta isca digital:

**Título:** {{data}}
**Tipo:** {{type}}
**Conteúdo base:** {{description}}

Gere uma versão:
1. ✂️ **Versão Simplificada** — máximo 150 palavras, apenas o essencial
2. ✅ **Checklist de Consumo Rápido** — 5 itens que o leitor pode aplicar em 2 minutos
3. 🎯 **Foco Principal** — qual a ÚNICA coisa que o leitor deve lembrar
4. 🔄 **Estrutura de Repetição** — como reforçar a mensagem principal`,
};

async function leadMagnetTDAHAgent(req, res) {
  const { action, data, title, description, type } = req.body;
  if (!action || !ACTIONS[action]) {
    return res.status(400).json({ error: 'Ação inválida. Use: create', availableActions: Object.keys(ACTIONS) });
  }
  try {
    const prompt = ACTIONS[action]
      .replace('{{data}}', data || title || 'N/A')
      .replace('{{type}}', type || 'pdf')
      .replace('{{description}}', description || '');
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);
    res.json({ success: true, agent: 'lead-magnet-tdah', action, response, metadata: { generatedAt: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = leadMagnetTDAHAgent;
