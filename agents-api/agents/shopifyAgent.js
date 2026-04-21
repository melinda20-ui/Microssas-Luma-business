const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Agente Especialista em E-commerce Shopify
 */
const shopifyAgent = async (req, res) => {
    const { productName = 'produto', features = 'qualidade' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um Copywriter Sênior especializado em Shopify e Conversão.
    Crie uma página de produto irresistível para: ${productName}.
    Características principais: ${features}.
    
    Estruture a resposta em:
    1. 🏷️ TÍTULO SEO: Otimizado para busca.
    2. 📝 DESCRIÇÃO PERSUASIVA: Use o método AIDA (Atenção, Interesse, Desejo, Ação).
    3. ✨ BENEFÍCIOS (Bullet Points): Foque na transformação do cliente.
    4. 📦 SUGESTÃO DE UPSELL: O que vender junto?
    5. 🔍 META DESCRIPTION: Para o Google.`;

    try {
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar conteúdo Shopify.' });
    }
};

module.exports = shopifyAgent;
