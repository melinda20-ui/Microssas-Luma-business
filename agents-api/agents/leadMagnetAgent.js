const { callGemini } = require('../config/llm');

const LEAD_MAGNET_MAP = {
  tdah: {
    magnet: '📋 Planner de Foco Semanal',
    description: ' planner semanal para manter o foco nas tarefas mais importantes',
    cta: 'Baixe o Planner de Foco Semanal gratuito',
    formPosition: 'middle',
  },
  financas: {
    magnet: '📊 Planilha de Metas Financeiras',
    description: ' planilha para acompanhar MRR, metas e conversões',
    cta: 'Receba a Planilha de Metas Financeiras',
    formPosition: 'end',
  },
  marketing: {
    magnet: '📋 Checklist de Funil de Conversão',
    description: ' checklist completo para otimizar seu funil de vendas',
    cta: 'Baixe o Checklist de Funil de Conversão',
    formPosition: 'middle',
  },
  produtividade: {
    magnet: '⚡ Kit de Produtividade Diária',
    description: ' kit com templates e rotinas para máxima produtividade',
    cta: 'Receba o Kit de Produtividade Diária',
    formPosition: 'end',
  },
  seo: {
    magnet: '🔍 Guia Rápido de SEO On-Page',
    description: ' guia prático com 20 ações de SEO para aplicar hoje',
    cta: 'Baixe o Guia Rápido de SEO On-Page',
    formPosition: 'middle',
  },
  negocios: {
    magnet: '📈 Template de Planejamento Estratégico',
    description: ' template para planejar o crescimento do seu negócio',
    cta: 'Receba o Template de Planejamento Estratégico',
    formPosition: 'end',
  },
};

async function leadMagnetAgent(req, res) {
  const { action, articleCategory, articleTitle, articleContent } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Campo obrigatório: action. Use: map, suggest, generate' });
  }

  switch (action) {
    case 'map': {
      const category = (articleCategory || '').toLowerCase();
      let matched = null;

      for (const [key, magnet] of Object.entries(LEAD_MAGNET_MAP)) {
        if (category.includes(key) || key.includes(category)) {
          matched = { key, ...magnet };
          break;
        }
      }

      if (!matched) {
        matched = {
          key: 'default',
          magnet: '📥 Conteúdo Exclusivo',
          description: ' material exclusivo para assinantes',
          cta: 'Baixe o material exclusivo gratuito',
          formPosition: 'end',
        };
      }

      return res.json({
        success: true,
        agent: 'lead-magnet',
        magnet: matched,
        leadMagnet: matched.magnet,
        cta: matched.cta,
        formPosition: matched.formPosition,
      });
    }

    case 'suggest': {
      const prompt = `Com base no título "${articleTitle}" e categoria "${articleCategory}", sugira uma isca digital (lead magnet) irresistible em português brasileiro.

A isca deve ser:
1. Específica para o tema do artigo
2. Oferecer valor prático imediato
3. Ter um nome atraente com emoji

Responda APENAS com o nome da isca e uma descrição curta em formato:
📌 Nome da Isca | Descrição curta`;

      try {
        const response = await callGemini(prompt, 'gemini-1.5-flash');
        const parts = response.split('|').map(p => p.trim());
        return res.json({
          success: true,
          agent: 'lead-magnet',
          action: 'suggested',
          magnet: parts[0] || '📥 Material Exclusivo',
          description: parts[1] || 'Material complementar gratuito',
          cta: `Baixe ${(parts[0] || 'o material').replace(/^[^\s]+\s/, '')}`,
          formPosition: 'end',
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    case 'generate': {
      const prompt = `Você é um especialista em conversão. Gere um CTA e formulário de captura para o artigo abaixo.

**Título:** ${articleTitle}
**Categoria:** ${articleCategory}
**Conteúdo:** ${(articleContent || '').slice(0, 1000)}

Gere:
1. 🧲 **Isca Digital** (lead magnet name)
2. 📝 **Texto do CTA** (chamada para ação)
3. 📋 **Campos do formulário** (mínimo: nome + email)
4. 📍 **Posição ideal** (meio ou final do artigo)
5. 💬 **Mensagem de agradecimento**

Formato: JSON
{
  "magnet": "string",
  "cta": "string",
  "fields": ["nome", "email"],
  "position": "middle|end",
  "thankYou": "string"
}`;

      try {
        const response = await callGemini(prompt, 'gemini-1.5-flash');
        let parsed = { magnet: '📥 Material Exclusivo', cta: 'Baixe agora', fields: ['nome', 'email'], position: 'end', thankYou: 'Obrigado!' };
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        } catch {}

        return res.json({
          success: true,
          agent: 'lead-magnet',
          action: 'generated',
          ...parsed,
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    default:
      return res.status(400).json({ error: `Ação "${action}" não reconhecida.` });
  }
}

module.exports = leadMagnetAgent;
