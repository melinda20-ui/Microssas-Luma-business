import { NextRequest } from "next/server";
import { AI_MODELS, detectMode, type AIModelMode } from "@/lib/ai-models";
import { askOllama } from "@/lib/ollama";

function getSystemPrompt(mode: AIModelMode) {
  switch (mode) {
    case "chat":
      return `
Você é a IA central do Luma OS.
Responda em português do Brasil.
Seja clara, estratégica e útil.
Se a tarefa parecer técnica demais, explique de modo simples e objetivo.
`;

    case "code":
      return `
Você é a IA programadora do Luma OS.
Responda em português do Brasil.
Seu foco é:
- corrigir código
- gerar código limpo
- explicar erros
- criar JSON válido
- pensar em Next.js, React, TypeScript, APIs e integrações

Quando o usuário pedir código, priorize respostas práticas e executáveis.
`;

    case "vision":
      return `
Você é a IA visual do Luma OS.
Responda em português do Brasil.
Seu foco é analisar:
- prints
- imagens
- layouts
- interface
- estética
- UX

Se a imagem não tiver sido enviada de fato, explique isso claramente.
`;

    case "automation":
      return `
Você é a IA de automações do Luma OS.
Responda em português do Brasil.
Seu foco é:
- entender processos
- sugerir fluxos
- pensar em n8n
- gerar estruturas de automação
- organizar gatilhos, ações, condições e integrações

Quando fizer sentido, responda em passos claros.
Se o usuário pedir workflow, pense como arquiteta de automação.
`;

    default:
      return `Você é a IA do Luma OS.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt || "").trim();
    const forcedMode = body?.mode as AIModelMode | undefined;

    if (!prompt) {
      return Response.json(
        { ok: false, error: "Prompt não informado." },
        { status: 400 }
      );
    }

    const mode = forcedMode || detectMode(prompt);
    const model = AI_MODELS[mode];
    const system = getSystemPrompt(mode);

    const result = await askOllama({
      model,
      system,
      prompt,
    });

    return Response.json({
      ok: true,
      mode,
      model,
      reply: result.text,
    });
  } catch (error: any) {
    console.error("ERRO /api/ai/router:", error);

    return Response.json(
      {
        ok: false,
        error: error?.message || "Erro ao consultar a IA.",
      },
      { status: 500 }
    );
  }
}

