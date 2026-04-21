const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Agente Especialista em TikTok Shop / Viral
 */
const tiktokShopAgent = async (req, res) => {
    const { topic = 'produto inovador', target = 'Geração Z' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um Estrategista Viral de TikTok Shop.
    Sua missão é criar um roteiro de vídeo para o produto/tópico: ${topic}.
    O público-alvo é: ${target}.
    
    Estruture a resposta em:
    1. 🎯 HOOK (0-3s): 3 opções de ganchos impossíveis de ignorar.
    2. 🎬 ROTEIRO (15-45s): Texto para locução e indicações visuais.
    3. 🛍️ CTA (Call to Action): Como pedir para comprar na loja.
    4. #️⃣ HASHTAGS: As 5 melhores para viralizar agora.`;

    try {
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar estratégia TikTok.' });
    }
};

module.exports = tiktokShopAgent;
