export async function POST(req: Request) {
  try {
    const body = await req.json();
    const originalPrompt = body.prompt || "";
    const prompt = originalPrompt.toLowerCase();

    if (!prompt) {
      return Response.json({
        ok: false,
        error: "Prompt vazio",
      });
    }

    const automationHints = [
      "n8n",
      "workflow",
      "automação",
      "automacao",
      "fluxo",
      "pipeline",
      "webhook",
      "gatilho",
      "trigger",
      "popup",
      "formulário",
      "formulario",
      "google sheets",
      "planilha",
      "excel",
      "notion",
      "whatsapp",
      "crm",
      "lead",
    ];

    const isAutomation = automationHints.some((hint) =>
      prompt.includes(hint)
    );

    if (isAutomation) {
      const automationSystemPrompt = `
Você é uma arquiteta especialista em automações n8n.

Sua tarefa é analisar o pedido do usuário e gerar uma resposta em JSON válido.

REGRAS:
- Responda APENAS com JSON válido.
- Não use markdown.
- Não explique fora do JSON.
- Pense como alguém que cria fluxos n8n reais.
- Os nodes devem ser coerentes com o pedido do usuário.
- Se o pedido envolver WhatsApp, Notion, Google Sheets, formulário, popup, CRM ou webhook, reflita isso nos nodes e steps.

Formato obrigatório:
{
  "name": "Nome da automação",
  "description": "Descrição curta",
  "sourcePrompt": "pedido original do usuário",
  "steps": [
    "etapa 1",
    "etapa 2"
  ],
  "nodes": [
    {
      "type": "tipo_do_node",
      "name": "Nome do node"
    }
  ]
}
`;

      const automationResponse = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt: `${automationSystemPrompt}\n\nPedido do usuário:\n${originalPrompt}`,
          stream: false,
        }),
      });

      if (!automationResponse.ok) {
        const errorText = await automationResponse.text();
        throw new Error("Erro no Ollama (automação): " + errorText);
      }

      const automationData = await automationResponse.json();
      const rawText = automationData.response?.trim() || "";

      let parsedJson: any = null;

      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = {
          name: "Automação gerada com fallback",
          description: "O modelo respondeu fora do JSON ideal, então foi aplicado fallback.",
          sourcePrompt: originalPrompt,
          steps: [
            "Interpretar o pedido do usuário",
            "Estruturar a automação",
            "Organizar as etapas principais",
            "Preparar para importação no n8n",
          ],
          nodes: [
            {
              type: "trigger",
              name: "Entrada inicial",
            },
            {
              type: "logic",
              name: "Processamento",
            },
            {
              type: "output",
              name: "Saída final",
            },
          ],
          rawModelResponse: rawText,
        };
      }

      return Response.json({
        ok: true,
        mode: "automation",
        reply: "Automação estruturada com o Ollama.",
        askToImport: true,
        json: parsedJson,
      });
    }

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: originalPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Erro no Ollama: " + errorText);
    }

    const data = await response.json();

    return Response.json({
      ok: true,
      mode: "chat",
      reply: data.response,
    });
  } catch (error: any) {
    return Response.json({
      ok: false,
      error: error.message,
    });
  }
}
