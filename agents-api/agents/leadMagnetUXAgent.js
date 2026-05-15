const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Designer UX especializado em conversão e materiais digitais.
Cria estruturas visuais para iscas digitais (PDFs, checklists, guias, templates).
Prioriza clareza, escaneabilidade e experiência mobile.

**Regras:**
1. Estrutura limpa com hierarquia visual clara
2. Seções curtas e escaneáveis
3. Prioridade máxima para mobile (largura < 480px)
4. Use emojis como marcadores visuais
5. Inclua espaçamento generoso entre seções`;

const ACTIONS = {
  create: `Crie a estrutura visual completa para esta isca digital:

**Título:** {{data}}
**Tipo:** {{type}}
**Descrição:** {{description}}

Gere:
1. 📐 **Layout** — estrutura de páginas/seções
2. 🎯 **Hierarquia Visual** — o que aparece primeiro, segundo, terceiro
3. 📱 **Versão Mobile** — como adaptar para celular
4. ✅ **Checklist de Clareza** — 5 itens para garantir escaneabilidade
5. 🎨 **Paleta sugerida** (apenas texto, sem cores específicas)`,

  review: `Revise a estrutura visual abaixo e sugira melhorias:

**Isca:** {{title}}
**Estrutura Atual:**
{{data}}

Avalie:
1. 🔍 **Clareza** (1-10)
2. 📱 **Mobile-friendly** (1-10)
3. ⚡ **Escaneabilidade** (1-10)
4. 💡 **3 melhorias específicas**
5. ✅ **Versão otimizada** (resumo em 5 linhas)`,
};

async function leadMagnetUXAgent(req, res) {
  const { action, data, title, type, description } = req.body;
  if (!action || !ACTIONS[action]) {
    return res.status(400).json({ error: 'Ação inválida. Use: create, review', availableActions: Object.keys(ACTIONS) });
  }
  try {
    let prompt = ACTIONS[action]
      .replace('{{data}}', data || 'N/A')
      .replace('{{title}}', title || 'Isca Digital')
      .replace('{{type}}', type || 'pdf')
      .replace('{{description}}', description || '');
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);
    res.json({ success: true, agent: 'lead-magnet-ux', action, response, metadata: { generatedAt: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = leadMagnetUXAgent;
