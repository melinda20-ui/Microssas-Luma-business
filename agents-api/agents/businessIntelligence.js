const { callGemini } = require('../config/llm');

/**
 * 📊 Business Intelligence Agent
 * Usa Gemini para análise de dados e geração de insights em linguagem natural
 */
async function businessIntelligenceAgent(req, res) {
  const {
    businessName,
    period = 'último mês',
    metrics = {},
    plan = 'premium'
  } = req.body;

  if (!businessName) {
    return res.status(400).json({ error: 'Campo obrigatório: businessName' });
  }

  // Métricas padrão se não fornecidas
  const defaultMetrics = {
    revenue: metrics.revenue || 'não informado',
    visitors: metrics.visitors || 'não informado',
    conversions: metrics.conversions || 'não informado',
    topProducts: metrics.topProducts || [],
    socialEngagement: metrics.socialEngagement || 'não informado',
    newClients: metrics.newClients || 'não informado',
    churnRate: metrics.churnRate || 'não informado',
    ...metrics
  };

  const isPro = plan === 'pro';

  const prompt = `Você é um analista de negócios sênior especializado em pequenas e médias empresas brasileiras.

Analise os dados abaixo e gere um relatório executivo completo em português.

**Empresa:** ${businessName}
**Período:** ${period}
**Dados disponíveis:**
${JSON.stringify(defaultMetrics, null, 2)}

Gere um relatório com:
1. **📊 Resumo Executivo** (3-4 linhas com os principais números)
2. **✅ Pontos Positivos** (o que está funcionando bem)
3. **⚠️ Pontos de Atenção** (o que precisa melhorar)
4. **🎯 Top 3 Recomendações** (ações concretas para os próximos 30 dias)
${isPro ? `5. **📈 Previsão** (tendências para os próximos 3 meses)
6. **💡 Oportunidades Ocultas** (insights avançados baseados nos dados)` : ''}

Use linguagem clara, direta e motivadora. Seja específico e evite clichês.
Formate com emojis e markdown para facilitar a leitura.`;

  try {
    const report = await callGemini(prompt, 'gemini-1.5-flash');

    // Score de saúde do negócio (simplificado)
    const healthScore = calculateHealthScore(defaultMetrics);

    res.json({
      success: true,
      agent: 'business-intelligence',
      businessName,
      period,
      report,
      healthScore,
      healthLabel: healthScore >= 70 ? '🟢 Saudável' : healthScore >= 40 ? '🟡 Atenção' : '🔴 Crítico',
      metadata: {
        plan,
        metricsAnalyzed: Object.keys(defaultMetrics).length,
        isPro,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function calculateHealthScore(metrics) {
  let score = 50; // Baseline
  if (metrics.revenue && metrics.revenue !== 'não informado') score += 10;
  if (metrics.conversions && metrics.conversions !== 'não informado') score += 10;
  if (metrics.visitors && metrics.visitors !== 'não informado') score += 10;
  if (metrics.newClients && metrics.newClients !== 'não informado') score += 10;
  if (metrics.churnRate && metrics.churnRate !== 'não informado') {
    const churn = parseFloat(metrics.churnRate);
    if (!isNaN(churn)) score += churn < 5 ? 10 : churn < 15 ? 5 : -10;
  }
  return Math.min(100, Math.max(0, score));
}

module.exports = businessIntelligenceAgent;
