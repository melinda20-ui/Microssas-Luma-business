const { callOllama } = require('../config/llm');

/**
 * 💬 Customer Support Agent
 * Usa Ollama (local, rápido) — ideal para respostas imediatas de suporte
 */

// Histórico de conversas em memória (em produção, usar Redis ou banco)
const conversations = new Map();

const SYSTEM_PROMPT = `Você é um assistente de suporte amigável e eficiente do MicroSaaS.
Seu nome é "Mia" e você ajuda clientes com dúvidas sobre os serviços.

Serviços disponíveis:
- Plano Lite: Criação de 1 site + 10 posts/mês de conteúdo + suporte básico
- Plano Premium: 3 sites + 50 posts/mês + 5 automações n8n + análises básicas
- Plano Pro: Sites ilimitados + conteúdo ilimitado + automações ilimitadas + análises avançadas + WhatsApp

Regras de resposta:
1. Seja sempre educado, objetivo e em português brasileiro
2. Se não souber a resposta, diga que vai escalar para a equipe humana
3. Para problemas técnicos graves, diga "Vou acionar nosso time técnico"
4. Não invente informações sobre preços, sempre oriente a verificar no site
5. Responda em no máximo 3 parágrafos curtos`;

async function customerSupportAgent(req, res) {
  const {
    message,
    sessionId = 'default',
    clientName = 'Cliente',
    plan = 'lite'
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Campo obrigatório: message' });
  }

  // Manter histórico da conversa
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }

  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

  // Construir contexto da conversa
  const conversationContext = history.slice(-6) // Últimas 6 mensagens
    .map(m => `${m.role === 'user' ? clientName : 'Mia'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${SYSTEM_PROMPT}

Histórico da conversa:
${conversationContext}

Responda à última mensagem do ${clientName} de forma natural e útil:`;

  try {
    const response = await callOllama(fullPrompt, undefined, null);

    // Salvar resposta no histórico
    history.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });

    // Detectar se precisa escalar para humano
    const needsEscalation = response.includes('equipe técnica') ||
      response.includes('time técnico') ||
      response.includes('escalar');

    res.json({
      success: true,
      agent: 'customer-support',
      agentName: 'Mia',
      response,
      sessionId,
      needsEscalation,
      turnCount: Math.floor(history.length / 2),
      metadata: {
        plan,
        clientName,
        respondedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Limpar histórico de uma sessão
async function clearSession(req, res) {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  res.json({ success: true, message: `Sessão ${sessionId} encerrada.` });
}

module.exports = { customerSupportAgent, clearSession };
