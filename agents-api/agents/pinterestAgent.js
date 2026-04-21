const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Agente Especialista em Pinterest Marketing
 */
const pinterestAgent = async (req, res) => {
    const { topic = 'estilo de vida', nitch = 'decoração' } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Você é um Especialista em Pinterest Growth.
    Crie uma estratégia de Pins para o nicho: ${nitch} sobre o tema ${topic}.
    
    Estruture a resposta em:
    1. 📌 3 TÍTULOS DE PINS: Com gatilhos visuais e SEO.
    2. 📄 DESCRIÇÃO DO PIN: Rica em palavras-chave relevantes.
    3. 🖼️ IDEIA VISUAL: O que deve conter na imagem/vídeo do Pin?
    4. 📈 ESTRATÉGIA DE BOARD: Em quais pastas salvar para atrair tráfego?`;

    try {
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar estratégia Pinterest.' });
    }
};

module.exports = pinterestAgent;
