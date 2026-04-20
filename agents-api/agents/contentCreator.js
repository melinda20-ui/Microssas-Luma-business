const { callGemini } = require('../config/llm');

/**
 * ✍️ Content Creator Agent
 * Usa Gemini Flash para geração de conteúdo rápido e criativo
 */
async function contentCreatorAgent(req, res) {
  const {
    contentType,        // 'instagram', 'blog', 'email', 'linkedin', 'script', 'ad'
    businessName,
    businessNiche,
    topic,
    tone = 'profissional e amigável',
    quantity = 1,
    language = 'pt-BR',
    plan = 'lite'
  } = req.body;

  if (!contentType || !topic) {
    return res.status(400).json({
      error: 'Campos obrigatórios: contentType, topic'
    });
  }

  // Limite por plano
  const planLimits = { lite: 3, premium: 10, pro: 999 };
  const limit = planLimits[plan] || 3;
  const actualQuantity = Math.min(quantity, limit);

  const contentTemplates = {
    instagram: `Crie ${actualQuantity} post(s) para Instagram sobre "${topic}" com emojis, hashtags relevantes e chamada para ação. Formato: legenda + hashtags separados.`,
    blog: `Escreva um artigo completo para blog sobre "${topic}" com introdução, desenvolvimento em tópicos, conclusão e meta description para SEO.`,
    email: `Crie ${actualQuantity} email(s) de marketing sobre "${topic}" com assunto atrativo, corpo persuasivo e CTA claro.`,
    linkedin: `Crie ${actualQuantity} post(s) para LinkedIn sobre "${topic}" com tom profissional, insights de valor e engajamento.`,
    script: `Escreva um script de vídeo para YouTube/Reels sobre "${topic}" com gancho nos primeiros 5 segundos, desenvolvimento e CTA final.`,
    ad: `Crie ${actualQuantity} anúncio(s) para "${topic}" com headline impactante, descrição persuasiva e CTA. Formato: Facebook/Instagram Ads.`
  };

  const prompt = `Você é um copywriter expert em marketing digital e conteúdo para negócios brasileiros.

**Empresa:** ${businessName || 'Empresa do cliente'}
**Nicho:** ${businessNiche || 'Negócio em geral'}
**Tipo de conteúdo:** ${contentType}
**Assunto/Tema:** ${topic}
**Tom de voz:** ${tone}
**Idioma:** ${language}

Tarefa: ${contentTemplates[contentType] || `Crie conteúdo do tipo ${contentType} sobre ${topic}`}

Seja criativo, persuasivo e adequado para o público brasileiro. Use linguagem natural e envolvente.`;

  try {
    const content = await callGemini(prompt, 'gemini-1.5-flash');

    res.json({
      success: true,
      agent: 'content-creator',
      contentType,
      topic,
      content,
      quantity: actualQuantity,
      message: `${actualQuantity} conteúdo(s) gerado(s) com sucesso!`,
      metadata: {
        tone,
        language,
        planLimit: limit,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = contentCreatorAgent;
