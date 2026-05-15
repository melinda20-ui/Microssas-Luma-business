const { callGemini } = require('../config/llm');
const { readAll } = require('../services/stripeReader');
const { db } = require('../config/db');

const SYSTEM_PROMPT = `Você é um Diretor Financeiro (CFO) de IA para pequenos negócios.
Sua função é analisar dados financeiros, detectar oportunidades de receita, sugerir metas e gerar relatórios estratégicos.

**Regras:**
1. Use linguagem clara, direta e em português brasileiro
2. Destaque números com **negrito**
3. Use emojis como marcadores visuais
4. Toda sugestão crítica requer aprovação (nunca execute automaticamente)
5. Quando detectar oportunidade, sugira também uma pauta de conteúdo relacionada`;

async function financialAgent(req, res) {
  const { action, message, goalId } = req.body;

  if (!action || !['analyze', 'goals', 'report', 'chat', 'opportunities'].includes(action)) {
    return res.status(400).json({
      error: 'Ação inválida. Use: analyze, goals, report, chat, opportunities',
    });
  }

  try {
    const financialData = await readAll();
    const metrics = financialData.metrics;

    const goals = db.prepare('SELECT * FROM financial_goals ORDER BY created_at DESC').all();

    let prompt = '';

    switch (action) {
      case 'analyze':
        prompt = `Analise os dados financeiros abaixo e gere um diagnóstico completo:

**Métricas Atuais:**
- MRR: R$ ${metrics.mrr}
- Receita Total: R$ ${metrics.totalRevenue}
- Total de Usuários: ${metrics.totalUsers}
- Usuários Pagantes: ${metrics.payingUsers}
- Taxa de Conversão: ${metrics.conversionRate}%
- Pedidos (30d): ${metrics.recentOrders30d}

**Distribuição de Planos:**
${JSON.stringify(metrics.planDistribution, null, 2)}

**Receita por Serviço:**
${JSON.stringify(metrics.revenueByService, null, 2)}

**Metas Ativas:**
${goals.length > 0 ? goals.map(g => `- ${g.title}: R$ ${g.target_value} (${g.status})`).join('\n') : 'Nenhuma meta cadastrada'}

Gere:
1. 📊 **Panorama Financeiro** (resumo executivo)
2. 🟢 **Oportunidades de Receita** (top 3)
3. 🔴 **Gargalos Detectados**
4. 🎯 **Próxima Meta Sugerida**
5. 📝 **Pauta de Conteúdo** (baseada nas lacunas financeiras)`;
        break;

      case 'goals':
        prompt = `Com base nos dados financeiros abaixo, sugira metas financeiras SMART:

**Métricas:**
- MRR: R$ ${metrics.mrr}
- Conversão: ${metrics.conversionRate}%
- Usuários pagantes: ${metrics.payingUsers}

**Metas existentes:**
${goals.length > 0 ? goals.map(g => `- ${g.title}: R$ ${g.target_value} (${g.status})`).join('\n') : 'Nenhuma'}

Sugira:
1. 🎯 **3 metas financeiras** para os próximos 30/60/90 dias
2. 📊 **Indicador-chave** para cada meta
3. 🚀 **Ação principal** para atingir cada meta
4. 📝 **Ideia de conteúdo** para apoiar cada meta`;
        break;

      case 'report':
        prompt = `Gere um relatório financeiro executivo completo:

**Métricas:**
- MRR: R$ ${metrics.mrr}
- Receita Total: R$ ${metrics.totalRevenue}
- Conversão: ${metrics.conversionRate}%
- Usuários: ${metrics.totalUsers} (${metrics.payingUsers} pagantes)

**Distribuição:**
${JSON.stringify(metrics.planDistribution, null, 2)}

**Últimos pedidos:**
${financialData.local?.orders ? JSON.stringify(financialData.local.orders.slice(0, 5)) : 'N/A'}

Formato:
1. 📊 **Resumo Executivo** (3 linhas)
2. 📈 **Tendências**
3. ✅ **O que está funcionando**
4. ⚠️ **O que precisa atenção**
5. 💡 **Recomendações** (top 3)
6. 🎯 **Meta da Semana**`;
        break;

      case 'chat':
        if (!message) {
          return res.status(400).json({ error: 'Campo obrigatório: message' });
        }
        prompt = `Responda à pergunta do usuário com base nos dados financeiros atuais:

**Contexto Financeiro:**
- MRR: R$ ${metrics.mrr}
- Receita Total: R$ ${metrics.totalRevenue}
- Conversão: ${metrics.conversionRate}%
- Usuários: ${metrics.totalUsers} (${metrics.payingUsers} pagantes)

**Pergunta do usuário:** ${message}

Responda de forma direta e acionável. Se não houver dados suficientes para responder, sugira o que seria necessário.`;
        break;

      case 'opportunities':
        prompt = `Analise os dados e detecte oportunidades de receita não exploradas:

**Métricas:**
- ${metrics.freeUsers} usuários gratuitos de ${metrics.totalUsers} totais
- Taxa de conversão: ${metrics.conversionRate}%
- MRR atual: R$ ${metrics.mrr}

**Planos:**
${JSON.stringify(metrics.planDistribution, null, 2)}

**Receita por serviço:**
${JSON.stringify(metrics.revenueByService, null, 2)}

Identifique:
1. 💰 **Top 3 oportunidades de receita imediata**
2. 🔄 **Estratégia de upgrade** (de grátis para pago)
3. 📊 **Estimativa de impacto** (R$ potencial)
4. 📝 **Ideia de conteúdo** para cada oportunidade`;
        break;
    }

    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

    res.json({
      success: true,
      agent: 'financial',
      action,
      response,
      metrics,
      goals: goals || [],
      metadata: {
        dataSource: financialData.stripe ? 'stripe+local' : 'local',
        fetchedAt: metrics.fetchedAt,
      },
    });

  } catch (err) {
    console.error('[Financial Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = financialAgent;
