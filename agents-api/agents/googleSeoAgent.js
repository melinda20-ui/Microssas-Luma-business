const { callGemini } = require('../config/llm');

const SYSTEM_PROMPT = `Você é um Especialista em SEO e Google Intelligence.
Sua função é analisar tópicos, detectar oportunidades de busca orgânica, avaliar metadados e gerar otimizações SEO.

**Regras:**
1. Use português brasileiro
2. Seja específico com dados (volume de busca, dificuldade, CPC estimado)
3. Use emojis como marcadores visuais
4. Baseie recomendações em práticas SEO comprovadas (E-E-A-T, intenção de busca, featured snippets)
5. Nunca sugira keyword stuffing ou práticas manipulativas`;

const ACTIONS = {
  analyze: `Você receberá uma lista de tópicos/ideias de conteúdo. Analise cada um e gere:

**Tópicos para análise:**
{{topics}}

Para cada tópico, gere:
1. 🔍 **Volume de busca estimado** (Baixo/Médio/Alto)
2. 📈 **Dificuldade SEO** (Fácil/Médio/Difícil)
3. 🎯 **Palavras-chave primárias** (3)
4. 🔑 **Palavras-chave secundárias** (5)
5. 📝 **SEO Title sugerido** (<60 caracteres)
6. 📄 **Meta Description** (<160 caracteres)
7. 🏷️ **Tags** (5)
8. ⭐ **SEO Score** (0-100)
9. 💡 **Melhoria sugerida**

Responda em formato JSON:
{
  "results": [
    {
      "topic": "string",
      "searchVolume": "Baixo|Médio|Alto",
      "difficulty": "Fácil|Médio|Difícil",
      "primaryKeywords": ["string"],
      "secondaryKeywords": ["string"],
      "seoTitle": "string",
      "metaDescription": "string",
      "tags": ["string"],
      "score": number,
      "improvement": "string"
    }
  ]
}`,

  keywords: `Gere uma lista de palavras-chave estratégicas para o nicho abaixo. Considere tendências sazonais e oportunidades de baixa concorrência.

**Nicho:** {{niche}}
**Tema principal:** {{topic}}

Gere exatamente 10 palavras-chave no formato:
- Palavra-chave | Volume (Alto/Médio/Baixo) | Dificuldade (Fácil/Médio/Difícil) | Intenção (Informacional/Comercial/Transacional/Navegacional)

Priorize palavras-chave de cauda longa com boa relação volume/dificuldade.`,

  evaluate: `Avalie o SEO do artigo abaixo e sugira melhorias.

**Título:** {{title}}
**Conteúdo:** {{content}}

Avalie (0-100):
1. **SEO Score:** (título, headings, densidade keywords, meta)
2. **Legibilidade:** (estrutura, parágrafos, transições)
3. **Engajamento:** (CTA, gancho inicial, fechamento)
4. **Completude:** (cobre o tópico? responde a intenção de busca?)

Formato:
📊 **SEO Score:** X/100
📖 **Legibilidade:** X/100
🎯 **Engajamento:** X/100
✅ **Completude:** X/100

🔧 **Melhorias sugeridas:**
- [item 1]
- [item 2]

🏷️ **Tags recomendadas:**
tag1, tag2, tag3

📝 **Meta Description sugerida:**
...`,

  trends: `Com base no conhecimento geral, analise tendências atuais de busca no Brasil para o nicho:

**Nicho:** {{niche}}

Identifique:
1. 📈 **3 tópicos em alta** (com justificativa)
2. 🔥 **Oportunidade sazonal** (próximos 30-60 dias)
3. 💡 **Ideia de conteúdo** para cada tendência
4. 📊 **Potencial de tráfego** (Baixo/Médio/Alto)

Responda em formato JSON:
{
  "trends": [
    {
      "topic": "string",
      "reason": "string",
      "contentIdea": "string",
      "trafficPotential": "string"
    }
  ],
  "seasonalOpportunity": {
    "topic": "string",
    "window": "string",
    "contentIdea": "string"
  }
}`,
};

async function googleSeoAgent(req, res) {
  const { action, topics, niche, title, content, topic } = req.body;

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: analyze, keywords, evaluate, trends',
      availableActions: Object.keys(ACTIONS),
    });
  }

  let prompt = ACTIONS[action];

  switch (action) {
    case 'analyze':
      if (!topics) return res.status(400).json({ error: 'Campo obrigatório: topics' });
      prompt = prompt.replace('{{topics}}', JSON.stringify(topics, null, 2));
      break;
    case 'keywords':
      if (!niche) return res.status(400).json({ error: 'Campo obrigatório: niche' });
      prompt = prompt.replace('{{niche}}', niche).replace('{{topic}}', topic || '');
      break;
    case 'evaluate':
      if (!title) return res.status(400).json({ error: 'Campo obrigatório: title' });
      if (!content) return res.status(400).json({ error: 'Campo obrigatório: content' });
      prompt = prompt.replace('{{title}}', title).replace('{{content}}', content.slice(0, 2000));
      break;
    case 'trends':
      if (!niche) return res.status(400).json({ error: 'Campo obrigatório: niche' });
      prompt = prompt.replace('{{niche}}', niche);
      break;
  }

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

    let parsedResponse = response;
    const jsonMatch = response.match(/```json\n?([\s\S]*?)```|({[\s\S]*"results"[\s\S]*})|({[\s\S]*"trends"[\s\S]*})/);
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[2] || jsonMatch[3]);
      } catch {}
    }

    res.json({
      success: true,
      agent: 'google-seo',
      action,
      response,
      data: typeof parsedResponse === 'object' ? parsedResponse : null,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[GoogleSEO Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = googleSeoAgent;
