const { callGemini } = require('../config/llm');

async function tdahAgent(req, res) {
  const { message, context, mode = 'organize' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Campo obrigatório: message' });
  }

  const prompts = {
    organize: `Você é um especialista em organização para pessoas com TDAH. Sua missão é pegar informações confusas ou bagunçadas e reorganizá-las de forma CLARA, VISUAL e PRIORIZADA.

**REGRAS:**
1. Use emojis como marcadores visuais (🔴🟡🟢 para prioridade)
2. Separe em exatamente 3 categorias: URGENTE | IMPORTANTE | OPCIONAL
3. Cada categoria no máximo 5 itens
4. Após listar, sugira o PRÓXIMO PASSO ÚNICO (apenas 1)
5. NUNCA liste mais que 15 itens no total
6. Use frases curtas (máximo 15 palavras por item)
7. Destaque a ação mais importante com ⭐
8. Termine com um "✅ Foco do momento:" e a micro-ação

**Formato obrigatório:**
🔴 **URGENTE** (faça agora)
- [item 1]
- [item 2]

🟡 **IMPORTANTE** (faça hoje)
- [item 1]
- [item 2]

🟢 **OPCIONAL** (faça quando puder)
- [item 1]
- [item 2]

⭐ **Foco do momento:**
[apenas 1 ação]

✅ **Próximo passo:**
[apenas 1 passo]`,

    focus: `Você é um coach de foco para TDAH. O usuário está disperso. Sua missão é trazer clareza mental imediata.

Analise a mensagem do usuário e:
1. Identifique a ÚNICA coisa mais importante que ele precisa fazer agora
2. Elimine o ruído — ignore distrações
3. Sugira um micro-passo de 2 minutos para começar
4. Use no máximo 4 linhas de resposta
5. Termine com um cronômetro sugestivo: "⏱ Tente por apenas 5 minutos"`,

    calm: `Você é um redutor de ansiedade para TDAH. O usuário está sobrecarregado.

1. Valide o sentimento ("É normal se sentir assim")
2. Respire com ele ("Inspire por 4 segundos...")
3. Liste apenas 2 coisas que ele NÃO precisa fazer agora
4. Liste apenas 1 coisa pequena que ele PODE fazer
5. Máximo 6 linhas. Tom acolhedor.`,
  };

  const systemInstruction = `Especialista em organização cognitiva para TDAH. Português brasileiro. Tom gentil, direto e sem julgamento.`;
  const prompt = `${prompts[prompts[mode] ? mode : 'organize']}

**Informação do usuário:**
${message}

${context ? `**Contexto adicional:**\n${context}` : ''}`;

  try {
    const response = await callGemini(prompt, 'gemini-1.5-flash', systemInstruction);

    res.json({
      success: true,
      agent: 'tdah-specialist',
      mode,
      response,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[TDAH Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = tdahAgent;
