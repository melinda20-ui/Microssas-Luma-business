const { callGemini } = require('../config/llm');

/**
 * ⚙️ Automation Builder Agent
 * Usa Gemini Pro para gerar workflows n8n em JSON prontos para importar
 */
async function automationBuilderAgent(req, res) {
  const {
    description,    // "Quero enviar WhatsApp quando alguém preencher meu formulário"
    trigger,        // 'webhook', 'schedule', 'email', 'form', 'purchase'
    actions = [],   // ['send_whatsapp', 'save_spreadsheet', 'send_email']
    platform,       // 'n8n'
    plan = 'premium'
  } = req.body;

  if (!description) {
    return res.status(400).json({
      error: 'Descreva o que a automação deve fazer (campo: description)'
    });
  }

  const systemInstruction = `Você é um expert em automação com n8n.
Você gera workflows n8n válidos em formato JSON.
Sempre retorne um JSON válido que pode ser importado diretamente no n8n.
O JSON deve seguir exatamente o schema do n8n com: name, nodes, connections, settings.`;

  const prompt = `Crie um workflow n8n completo para a seguinte automação:

**Descrição do cliente:** ${description}
**Gatilho:** ${trigger || 'a ser determinado pelo contexto'}
**Ações desejadas:** ${actions.length > 0 ? actions.join(', ') : 'a serem determinadas pelo contexto'}

Retorne APENAS o JSON do workflow n8n, válido e completo, que pode ser importado diretamente.
O workflow deve:
1. Ter nome descritivo em português
2. Incluir tratamento de erros básico
3. Usar nodes nativos do n8n quando possível
4. Incluir comentários nos nodes para facilitar entendimento

Exemplo de estrutura esperada:
{
  "name": "Nome da Automação",
  "nodes": [...],
  "connections": {...},
  "settings": {"executionOrder": "v1"}
}

RETORNE APENAS O JSON, SEM MARKDOWN, SEM EXPLICAÇÕES.`;

  try {
    const workflowRaw = await callGemini(prompt, 'gemini-1.5-pro', systemInstruction);

    // Extrair JSON da resposta
    let workflow;
    try {
      const jsonMatch = workflowRaw.match(/\{[\s\S]*\}/);
      workflow = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(workflowRaw);
    } catch {
      workflow = null;
    }

    res.json({
      success: true,
      agent: 'automation-builder',
      description,
      workflow,
      workflowRaw: workflow ? null : workflowRaw,
      message: 'Workflow n8n gerado! Importe no seu n8n para ativar.',
      instructions: [
        '1. Acesse seu n8n',
        '2. Clique em "+ Novo Workflow"',
        '3. Clique nos 3 pontos → "Importar de JSON"',
        '4. Cole o JSON gerado',
        '5. Configure as credenciais necessárias',
        '6. Ative o workflow'
      ],
      metadata: {
        trigger,
        actions,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = automationBuilderAgent;
