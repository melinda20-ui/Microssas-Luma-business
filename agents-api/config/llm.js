const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * Chama o Gemini — usado para tarefas complexas como geração de sites e automações
 */
async function callGemini(prompt, model = 'gemini-1.5-flash', systemInstruction = null) {
  try {
    const config = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;

    const genModel = genAI.getGenerativeModel({ model, ...config });
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('[Gemini Error]', err.message);
    throw new Error(`Gemini falhou: ${err.message}`);
  }
}

/**
 * Chama o Ollama local — usado para tarefas rápidas como suporte e respostas simples
 */
async function callOllama(prompt, model = OLLAMA_MODEL, systemPrompt = null) {
  try {
    const finalPrompt = systemPrompt
      ? `${systemPrompt}\n\nUsuário: ${prompt}\nAssistente:`
      : prompt;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model,
      prompt: finalPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024
      }
    }, { timeout: 60000 });

    return response.data.response;
  } catch (err) {
    console.error('[Ollama Error]', err.message);
    // Fallback para Gemini se Ollama falhar
    console.log('[Fallback] Tentando Gemini como backup...');
    return await callGemini(prompt);
  }
}

/**
 * Verifica se o Ollama está disponível na VPS
 */
async function checkOllamaStatus() {
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    const models = res.data.models?.map(m => m.name) || [];
    return { online: true, models };
  } catch {
    return { online: false, models: [] };
  }
}

module.exports = { callGemini, callOllama, checkOllamaStatus };
