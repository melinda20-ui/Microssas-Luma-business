const { callGemini } = require('../config/llm');

async function uxAgent(req, res) {
  const { action, onboardingData, message } = req.body;

  const actions = {
    analyze: `Você é um especialista em UX e onboarding. Analise o progresso do usuário e gere:

1. 📍 **Etapa Atual** — onde o usuário está agora
2. ✅ **Etapas Concluídas** — o que já foi feito
3. ⏳ **Etapas Pendentes** — o que falta
4. 🔴 **Travas Detectadas** — onde o usuário está parado há mais tempo
5. 💡 **Sugestão** — como destravar a próxima etapa

**Dados de progresso:**
${JSON.stringify(onboardingData || {}, null, 2)}

Use linguagem simples, motivadora, sem jargão técnico. Máximo 12 linhas.`,

    suggest: `Com base nos dados de onboarding, sugira melhorias no fluxo:

${JSON.stringify(onboardingData || {}, null, 2)}

Analise:
1. 🚧 Onde os usuários mais desistem
2. 💡 1 melhoria concreta para reduzir atrito
3. 📋 Próximo passo recomendado para o usuário`,

    explain: `O usuário pediu explicação sobre uma etapa. Responda de forma simples e acolhedora:

**Pergunta do usuário:** ${message || "Explique esta etapa"}

**Dados de progresso:**
${JSON.stringify(onboardingData || {}, null, 2)}

Explique em no máximo 6 linhas, sem jargão, com tom encorajador.`,
  };

  if (!action || !actions[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: analyze, suggest, explain',
      availableActions: Object.keys(actions),
    });
  }

  const prompt = actions[action];

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash');

    res.json({
      success: true,
      agent: 'ux-specialist',
      action,
      response,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[UX Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = uxAgent;
