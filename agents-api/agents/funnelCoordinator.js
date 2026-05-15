const { callGemini } = require('../config/llm');
const { db } = require('../config/db');

const ORCHESTRATOR_PROMPT = `Você é um Coordenador Estratégico de Funil.
Sua função é ouvir 7 especialistas, fazer com que eles deliberem entre si e gerar um diagnóstico unificado e acionável.

**Especialistas disponíveis:**
1. 📊 Financeiro — metas, receita, MRR, oportunidades de receita, campanhas mais lucrativas
2. 🎨 UX — experiência do usuário, onboarding, pontos de atrito, abandono de funil
3. 📱 Marketing Orgânico — SEO, redes sociais, funil orgânico, conteúdo viral
4. 💰 Marketing Pago — Meta Ads, Google Ads, TikTok Ads, ROAS
5. 🔍 Google Intelligence — tendências, keywords, SEO técnico
6. ✅ Tarefas — transformar sugestões em ações executáveis no sistema de aprovação
7. 🧠 Mia — supervisão geral, coordenação e explicação dos diagnósticos

**Formato obrigatório do diagnóstico (JSON válido, sem markdown):**
{
  "diagnosis": {
    "summary": "resumo executivo em 3 linhas",
    "topGap": "principal gargalo identificado",
    "topOpportunity": "maior oportunidade",
    "conversionPriority": "ação #1 para aumentar conversão",
    "retentionPriority": "ação #1 para aumentar retenção",
    "dailySalesPriority": "ação #1 para aumentar vendas diárias",
    "abandonmentReduction": "ação #1 para reduzir abandono",
    "priorityActions": ["ação1", "ação2", "ação3"],
    "dailyPriority": "única ação mais importante hoje"
  },
  "agentContributions": {
    "financial": "contribuição do agente financeiro (após deliberação)",
    "ux": "contribuição do agente UX (após deliberação)",
    "organic": "contribuição do marketing orgânico (após deliberação)",
    "paid": "contribuição do marketing pago (após deliberação)",
    "google": "contribuição do google intelligence (após deliberação)",
    "tarefas": "tarefas recomendadas pelo agente de tarefas",
    "mia": "supervisão e explicação da Mia"
  },
  "collectiveIntelligence": {
    "googleSharesWithMarketing": "tendências que o Google identificou que o Marketing deve usar",
    "financeiroPrioritizes": "campanha mais lucrativa segundo o Financeiro",
    "uxDetectsAbandonment": "ponto de abandono identificado pelo UX",
    "tarefasActions": "ações transformadas em tarefas executáveis",
    "miaSupervision": "avaliação geral da Mia sobre o diagnóstico"
  }
}

**Contexto para análise:**
{{context}}`;

const AGENT_QUESTIONS = {
  financial: 'Com base neste diagnóstico, qual o maior gargalo financeiro, a oportunidade de receita mais imediata e qual campanha seria mais lucrativa? Responda em 3 linhas.',
  ux: 'Onde o usuário mais desiste no funil atual, como reduzir o atrito e qual o principal ponto de abandono? Responda em 3 linhas.',
  organic: 'Qual a maior oportunidade de aquisição orgânica não explorada, qual canal orgânico tem melhor custo-benefício e que tipo de conteúdo viral poderia funcionar? Responda em 3 linhas.',
  paid: 'Qual canal pago teria melhor ROAS para este negócio, qual criativo/testaria primeiro e qual público teria melhor conversão? Responda em 3 linhas.',
  google: 'Quais tendências de busca, keywords sazonais ou tópicos estão sendo negligenciados e que o marketing deveria aproveitar? Responda em 3 linhas.',
  tarefas: 'Com base nas respostas dos outros agentes, transforme as 3 principais sugestões em tarefas executáveis com status PENDING. Liste cada tarefa com título e descrição clara.',
  mia: 'Como supervisora geral, avalie a consistência das respostas dos agentes, identifique contradições, valide as prioridades e explique o diagnóstico de forma simples para o dono do negócio. Responda em 4 linhas.',
};

const REFINE_PROMPT = `Você é {agent} e acabou de ver as respostas dos seus colegas especialistas.
Com base no que os outros agentes disseram, refine sua resposta anterior.
Mantenha o que faz sentido, ajuste o que precisa ser corrigido e adicione algo novo que não tinha considerado.

**Sua resposta anterior:** {ownAnswer}

**Respostas dos colegas:**
{peerAnswers}

Responda em no máximo 3 linhas com sua análise refinada.`;

async function callAgent(question, context) {
  try {
    const prompt = `${question}\n\nContexto: ${context}`;
    const response = await callGemini(prompt, 'gemini-1.5-flash');
    return response.trim();
  } catch {
    return 'Indisponível no momento.';
  }
}

async function refineAgent(agentName, ownAnswer, peerAnswers) {
  try {
    const prompt = REFINE_PROMPT
      .replace('{agent}', agentName)
      .replace('{ownAnswer}', ownAnswer)
      .replace('{peerAnswers}', peerAnswers);
    const response = await callGemini(prompt, 'gemini-1.5-flash');
    return response.trim();
  } catch {
    return ownAnswer;
  }
}

async function funnelCoordinator(req, res) {
  const { message, context } = req.body;

  if (!message && !context) {
    return res.status(400).json({ error: 'Campo obrigatório: message ou context' });
  }

  try {
    const fullContext = (context || message || '');
    const userEmail = req.headers['x-user-email'] || 'admin@sualuma.com';

    // Round 1: Collect all 7 agent insights in parallel
    const round1 = {};
    const agentNames = Object.keys(AGENT_QUESTIONS);
    const agentLabels = {
      financial: 'Financeiro', ux: 'UX', organic: 'Marketing Orgânico',
      paid: 'Marketing Pago', google: 'Google Intelligence',
      tarefas: 'Tarefas', mia: 'Mia',
    };

    await Promise.all(agentNames.map(async (agent) => {
      round1[agent] = await callAgent(AGENT_QUESTIONS[agent], fullContext);
    }));

    // Round 2: Deliberation — each agent sees others' answers and refines
    const round2 = {};
    await Promise.all(agentNames.map(async (agent) => {
      const peerAnswers = Object.entries(round1)
        .filter(([k]) => k !== agent)
        .map(([k, v]) => `${agentLabels[k]}: ${v}`)
        .join('\n\n');
      round2[agent] = await refineAgent(agentLabels[agent], round1[agent], peerAnswers);
    }));

    // Generate unified diagnosis with refined insights
    const orchestratorPrompt = ORCHESTRATOR_PROMPT.replace('{{context}}', JSON.stringify({
      context: fullContext,
      agentInsights: round2,
    }));

    const diagnosisRaw = await callGemini(orchestratorPrompt, 'gemini-1.5-flash');

    // Parse the JSON response
    let diagnosis = {
      diagnosis: {
        summary: 'Diagnóstico gerado.',
        topGap: 'Não identificado',
        topOpportunity: 'Não identificada',
        conversionPriority: 'Não identificada',
        retentionPriority: 'Não identificada',
        dailySalesPriority: 'Não identificada',
        abandonmentReduction: 'Não identificada',
        priorityActions: ['Revisar dados'],
        dailyPriority: 'Revisar dashboard',
      },
      agentContributions: round2,
      collectiveIntelligence: {
        googleSharesWithMarketing: round2.google || 'N/A',
        financeiroPrioritizes: round2.financial || 'N/A',
        uxDetectsAbandonment: round2.ux || 'N/A',
        tarefasActions: round2.tarefas || 'N/A',
        miaSupervision: round2.mia || 'N/A',
      },
    };

    try {
      const jsonMatch = diagnosisRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        diagnosis = { ...diagnosis, ...parsed };
        if (parsed.agentContributions) {
          diagnosis.agentContributions = { ...diagnosis.agentContributions, ...parsed.agentContributions };
        }
        if (parsed.collectiveIntelligence) {
          diagnosis.collectiveIntelligence = { ...diagnosis.collectiveIntelligence, ...parsed.collectiveIntelligence };
        }
      }
    } catch {}

    // Create brain_tasks for priority actions
    const actionsToCreate = [
      ...(diagnosis.diagnosis?.priorityActions || []),
      diagnosis.diagnosis?.conversionPriority,
      diagnosis.diagnosis?.retentionPriority,
      diagnosis.diagnosis?.dailySalesPriority,
      diagnosis.diagnosis?.abandonmentReduction,
    ].filter(Boolean);

    const uniqueActions = [...new Set(actionsToCreate)];
    let tasksCreated = 0;

    for (const action of uniqueActions) {
      try {
        const existing = db.prepare("SELECT id FROM brain_tasks WHERE title = ? AND status = 'PENDING'").get(action.slice(0, 80));
        if (existing) continue;
        db.prepare(
          `INSERT INTO brain_tasks (session_id, clerk_id, agent_id, title, description, payload)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          `funnel_${Date.now()}`,
          req.headers['x-user-id'] || 'system',
          'funnel-coordinator',
          action.slice(0, 80),
          `Ação priorizada pelo diagnóstico estratégico multigentes: ${action}`,
          JSON.stringify({
            diagnosis: diagnosis.diagnosis,
            collectiveIntelligence: diagnosis.collectiveIntelligence,
            source: 'funnel-coordinator',
            approvedBy: userEmail,
          })
        );
        tasksCreated++;
      } catch {}
    }

    // Log decision
    console.log(`[FunnelCoordinator] Diagnóstico gerado. ${agentNames.length} agentes consultados, ${tasksCreated} tarefas criadas.`);

    res.json({
      success: true,
      agent: 'funnel-coordinator',
      diagnosis: diagnosis.diagnosis,
      agentContributions: diagnosis.agentContributions,
      collectiveIntelligence: diagnosis.collectiveIntelligence,
      deliberation: {
        round1,
        round2,
      },
      metadata: {
        agentsConsulted: agentNames.length,
        deliberationRounds: 2,
        tasksCreated,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error('[FunnelCoordinator] Erro:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = funnelCoordinator;