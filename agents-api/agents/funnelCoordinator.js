const { callGemini } = require('../config/llm');
const { db } = require('../config/db');

const ORCHESTRATOR_PROMPT = `Você é um Coordenador Estratégico de Funil.
Sua função é ouvir múltiplos especialistas e gerar um diagnóstico unificado e acionável.

**Especialistas disponíveis:**
1. 📊 Financeiro — metas, receita, MRR, oportunidades de receita
2. 🎨 UX — experiência do usuário, onboarding, pontos de atrito
3. 📱 Marketing Orgânico — SEO, redes sociais, funil orgânico
4. 💰 Marketing Pago — Meta Ads, Google Ads, TikTok Ads
5. 🔍 Google Intelligence — tendências, keywords, SEO
6. 🧠 Mia — supervisão geral e coordenação

**Formato obrigatório do diagnóstico:**
{
  "diagnosis": {
    "summary": "resumo executivo em 3 linhas",
    "topGap": "principal gargalo identificado",
    "topOpportunity": "maior oportunidade",
    "priorityActions": ["ação1", "ação2", "ação3"],
    "dailyPriority": "única ação mais importante hoje"
  },
  "agentContributions": {
    "financial": "contribuição do agente financeiro",
    "ux": "contribuição do agente UX",
    "organic": "contribuição do marketing orgânico",
    "paid": "contribuição do marketing pago",
    "google": "contribuição do google intelligence"
  }
}

**Contexto para análise:**
{{context}}`;

const AGENT_QUESTIONS = {
  financial: 'Com base neste diagnóstico, qual o maior gargalo financeiro e a oportunidade de receita mais imediata? Responda em 2 linhas.',
  ux: 'Onde o usuário mais desiste no funil atual e como reduzir o atrito? Responda em 2 linhas.',
  organic: 'Qual a maior oportunidade de aquisição orgânica não explorada? Responda em 2 linhas.',
  paid: 'Qual canal pago teria melhor ROAS para este negócio? Responda em 1 linha.',
  google: 'Quais tendências de busca ou keywords estão sendo negligenciadas? Responda em 2 linhas.',
};

async function funnelCoordinator(req, res) {
  const { message, context } = req.body;

  if (!message && !context) {
    return res.status(400).json({ error: 'Campo obrigatório: message ou context' });
  }

  try {
    const fullContext = (context || message || '');

    // Collect agent insights in parallel
    const insights = {};
    const agentPromises = Object.entries(AGENT_QUESTIONS).map(async ([agent, question]) => {
      try {
        const agentPrompt = `${question}\n\nContexto: ${fullContext}`;
        const response = await callGemini(agentPrompt, 'gemini-1.5-flash');
        insights[agent] = response.trim();
      } catch {
        insights[agent] = 'Indisponível no momento.';
      }
    });

    await Promise.all(agentPromises);

    // Generate unified diagnosis
    const orchestratorPrompt = ORCHESTRATOR_PROMPT.replace('{{context}}', JSON.stringify({
      context: fullContext,
      agentInsights: insights,
    }));

    const diagnosisRaw = await callGemini(orchestratorPrompt, 'gemini-1.5-flash');

    // Parse the JSON response
    let diagnosis = {
      diagnosis: {
        summary: 'Diagnóstico gerado.',
        topGap: 'Não identificado',
        topOpportunity: 'Não identificada',
        priorityActions: ['Revisar dados'],
        dailyPriority: 'Revisar dashboard',
      },
      agentContributions: insights,
    };

    try {
      const jsonMatch = diagnosisRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        diagnosis = { ...diagnosis, ...parsed };
      }
    } catch {}

    // Create brain_tasks for priority actions
    if (diagnosis.diagnosis?.priorityActions) {
      for (const action of diagnosis.diagnosis.priorityActions) {
        try {
          db.prepare(
            `INSERT INTO brain_tasks (session_id, clerk_id, agent_id, title, description, payload)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).run(
            `funnel_${Date.now()}`,
            req.headers['x-user-id'] || 'system',
            'funnel-coordinator',
            action.slice(0, 80),
            `Ação priorizada pelo diagnóstico estratégico: ${action}`,
            JSON.stringify({ diagnosis: diagnosis.diagnosis, source: 'funnel-coordinator' })
          );
        } catch {}
      }
    }

    res.json({
      success: true,
      agent: 'funnel-coordinator',
      diagnosis: diagnosis.diagnosis,
      agentContributions: diagnosis.agentContributions,
      rawResponse: diagnosisRaw,
      metadata: {
        agentsConsulted: Object.keys(AGENT_QUESTIONS).length,
        tasksCreated: diagnosis.diagnosis?.priorityActions?.length || 0,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error('[FunnelCoordinator] Erro:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = funnelCoordinator;
