const { callGemini } = require('../config/llm');

async function supervisorAgent(req, res) {
  const { action, referrals, message } = req.body;

  const actions = {
    analyze: `Você é um supervisor inteligente de indicações e serviços. Analise os dados fornecidos e gere:

1. 📊 **Panorama Geral** — total de indicações ativas, concluídas, paradas
2. 🔴 **Gargalos Detectados** — indicações paradas há mais de X dias
3. ⚡ **Ações Prioritárias** — top 3 ações para destravar indicações paradas
4. 🎯 **Próximo Passo** — a ação mais importante agora

**Dados das indicações:**
${JSON.stringify(referrals || [], null, 2)}

Seja direto, use emojis como marcadores. Máximo 15 linhas.`,

    alert: `Você é um sistema de alertas inteligentes para indicações. Gere alertas baseados nos dados:

**Regras de alerta:**
🔴 Alerta Vermelho: indicação parada >7 dias sem contato
🟡 Alerta Amarelo: indicação parada >3 dias
🟢 Alerta Verde: indicação avançando bem

**Dados:**
${JSON.stringify(referrals || [], null, 2)}

Liste apenas os alertas relevantes. Formato: [COR] motivo.`,

    suggest: `Com base nas indicações abaixo, sugira melhorias no processo de indicação:

${JSON.stringify(referrals || [], null, 2)}

Sugira:
1. 🔧 O que está funcionando
2. 🚧 O que pode melhorar
3. 💡 Ideia concreta de melhoria`,
  };

  if (!action || !actions[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: analyze, alert, suggest',
      availableActions: Object.keys(actions),
    });
  }

  const prompt = actions[action];

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash');

    res.json({
      success: true,
      agent: 'supervisor',
      action,
      response,
      metadata: {
        referralsCount: referrals?.length || 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Supervisor Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = supervisorAgent;
