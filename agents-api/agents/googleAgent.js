const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Estrategista de Marketing Digital e crescimento.
Seu papel é analisar dados de marketing, tráfego e conversão para gerar recomendações integradas.

**Especialidades:**
- Google Ads / SEO / tráfego orgânico
- Estratégias de conteúdo para aquisição
- Otimização de conversão (CRO)
- Integração com dados financeiros para priorização

**Regras:**
- Use português brasileiro claro e direto
- Destaque números relevantes em **negrito**
- Use emojis como marcadores
- Conecte recomendações de marketing a métricas financeiras`;

const ACTIONS = {
  analyze: `Você recebeu dados financeiros e de marketing. Analise e gere um diagnóstico de crescimento:

**Dados Financeiros:**
{{financialData}}

Gere:
1. 📊 **Diagnóstico de Aquisição** — como está o funil atual
2. 🚧 **Gargalos de Marketing** — onde há vazamento
3. 💡 **Estratégias de Crescimento** — top 3 ações com maior impacto financeiro
4. 📝 **Pautas de Conteúdo** — 2 ideias para atrair/converter
5. 🎯 **Meta Integrada** — meta que une marketing + finanças`,

  diagnose: `Faça um diagnóstico estratégico unificado dos dados abaixo:

**Dados Financeiros:**
{{financialData}}

**Informação adicional:**
{{message}}

Analise:
1. 🔄 **Estado Atual** — onde o negócio está
2. 🎯 **Onde deveria estar** — meta ideal
3. 🚧 **O que está travando** — principal gargalo
4. 💡 **Plano de ação** — 3 passos concretos
5. 📊 **ROI estimado** por ação`,
};

async function googleAgent(req, res) {
  const { action, financialData, message } = req.body;

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: analyze, diagnose',
    });
  }

  const prompt = ACTIONS[action]
    .replace('{{financialData}}', JSON.stringify(financialData || {}, null, 2))
    .replace('{{message}}', message || 'N/A');

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

    res.json({
      success: true,
      agent: 'google-strategy',
      action,
      response,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Google Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = googleAgent;
