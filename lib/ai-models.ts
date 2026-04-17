export const AI_MODELS = {
  chat: process.env.OLLAMA_MODEL_CHAT || "llama3.2:3b",
  code: process.env.OLLAMA_MODEL_CODE || "qwen2.5-coder:7b",
  vision: process.env.OLLAMA_MODEL_VISION || "llava:7b",
  automation: process.env.OLLAMA_MODEL_AUTOMATION || "qwen2.5:7b-instruct",
} as const;

export type AIModelMode = keyof typeof AI_MODELS;

export function detectMode(input: string): AIModelMode {
  const text = input.toLowerCase();

  const automationHints = [
    "automação",
    "automacao",
    "workflow",
    "n8n",
    "fluxo",
    "webhook",
    "gatilho",
    "trigger",
    "crm",
    "pipeline",
  ];

  const codeHints = [
    "código",
    "codigo",
    "programa",
    "programação",
    "programacao",
    "typescript",
    "javascript",
    "react",
    "next",
    "node",
    "json",
    "api",
    "corrige",
    "erro",
    "bug",
    "schema",
  ];

  const visionHints = [
    "imagem",
    "print",
    "screenshot",
    "foto",
    "analisa essa imagem",
    "analisa esse print",
    "arquivo visual",
  ];

  if (automationHints.some((hint) => text.includes(hint))) {
    return "automation";
  }

  if (visionHints.some((hint) => text.includes(hint))) {
    return "vision";
  }

  if (codeHints.some((hint) => text.includes(hint))) {
    return "code";
  }

  return "chat";
}
