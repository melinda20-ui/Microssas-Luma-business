const { callGemini } = require('../config/llm');

/**
 * 🏗️ Website Builder Agent
 * Usa Gemini (grande capacidade de gerar código HTML/CSS/JS)
 */
async function websiteBuilderAgent(req, res) {
  const {
    businessType,
    businessName,
    description,
    colors = 'azul e branco',
    sections = ['hero', 'sobre', 'serviços', 'contato'],
    style = 'moderno e profissional',
    plan = 'lite'
  } = req.body;

  if (!businessType || !businessName) {
    return res.status(400).json({
      error: 'Campos obrigatórios: businessType, businessName'
    });
  }

  const systemInstruction = `Você é um expert em design e desenvolvimento web. 
Crie sites modernos, profissionais e responsivos em HTML, CSS e JavaScript puro.
Sempre use boas práticas de SEO, acessibilidade e performance.
Responda SOMENTE com o código HTML completo, sem explicações extras.`;

  const prompt = `Crie um site completo e profissional para:

**Negócio:** ${businessName}
**Tipo:** ${businessType}
**Descrição:** ${description || 'Empresa de qualidade no mercado'}
**Estilo:** ${style}
**Cores:** ${colors}
**Seções a incluir:** ${sections.join(', ')}
**Plano:** ${plan}

Requisitos técnicos:
- HTML5 completo com meta tags SEO
- CSS inline no <style> (sem frameworks externos)
- JavaScript vanilla para interatividade
- Design responsivo (mobile-first)
- Animações suaves com CSS
- Formulário de contato funcional
- Paleta de cores: ${colors}
- Fonte: usar Google Fonts (Inter ou Outfit)
- Footer com copyright
${plan === 'pro' ? '- Adicionar seção de depoimentos e FAQ\n- Chat widget no canto inferior direito' : ''}
${plan === 'premium' ? '- Adicionar seção de depoimentos' : ''}

Gere o HTML completo e funcional do site.`;

  try {
    const siteCode = await callGemini(prompt, 'gemini-1.5-pro', systemInstruction);

    res.json({
      success: true,
      agent: 'website-builder',
      businessName,
      html: siteCode,
      message: `Site de ${businessName} gerado com sucesso!`,
      metadata: {
        sections,
        style,
        colors,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = websiteBuilderAgent;
