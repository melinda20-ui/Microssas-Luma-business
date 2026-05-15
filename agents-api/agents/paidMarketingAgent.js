const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Especialista em Tráfego Pago e Performance Marketing.
Sua função é sugerir campanhas otimizadas para Meta Ads, Google Ads e TikTok Ads.

**Regras:**
1. Use português brasileiro claro e direto
2. Inclua estimativas realistas de CPC e CPM
3. Use emojis como marcadores
4. Sugira apenas campanhas com potencial de ROAS positivo
5. Todo criativo deve ser específico, nunca genérico
6. Considere orçamentos enxutos (R$30-100/dia)`;

const ACTIONS = {
  campaign: `Com base nos dados abaixo, sugira uma campanha paga completa:

**Dados do Negócio:**
{{data}}

Gere uma sugestão completa de campanha:

1. 🎯 **Objetivo** (conversão, tráfego, leads)
2. 📍 **Plataforma** (Meta Ads / Google Ads / TikTok Ads)
3. 💰 **Orçamento estimado** (CPC, CPM, diário)
4. 👥 **Público-alvo** (segmentação detalhada)
5. 🖼️ **Criativo** (headline, descrição, formato)
6. 🚀 **Estratégia de remarketing**
7. 📊 **Métrica de sucesso**
8. 💡 **Potencial de escala** (Baixo/Médio/Alto)`,

  optimize: `Analise a campanha abaixo e sugira otimizações:

**Campanha Atual:**
{{data}}

Sugira:
1. ⚡ **Melhoria de criativo**
2. 🎯 **Ajuste de segmentação**
3. 💰 **Otimização de budget**
4. 🔄 **Estratégia de remarketing**
5. 📈 **Previsão de melhoria** (estimativa de %)

Responda em no máximo 12 linhas.`,

  scale: `Identifique campanhas com potencial de escala:

**Dados:**
{{data}}

Analise:
1. 🔍 **Qual campanha escalar primeiro**
2. 📈 **Quanto aumentar o budget** (%, R$)
3. ⚠️ **Riscos** de escalar rápido demais
4. ✅ **Sinal verde** — qual métrica indica que pode escalar`,
};

async function paidMarketingAgent(req, res) {
  const { action, data, message } = req.body;

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: campaign, optimize, scale',
      availableActions: Object.keys(ACTIONS),
    });
  }

  const prompt = ACTIONS[action].replace('{{data}}', data || message || 'N/A');

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);
    res.json({ success: true, agent: 'paid-marketing', action, response, metadata: { generatedAt: new Date().toISOString() } });
  } catch (err) {
    console.error('[PaidMarketing] Erro:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = paidMarketingAgent;
