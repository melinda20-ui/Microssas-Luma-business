type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OllamaGenerateResponse = {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string;
  done: boolean;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

export async function askOllama(params: {
  model: string;
  system?: string;
  prompt: string;
}) {
  const messages: OllamaMessage[] = [];

  if (params.system) {
    messages.push({
      role: "system",
      content: params.system,
    });
  }

  messages.push({
    role: "user",
    content: params.prompt,
  });

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages,
      stream: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro no Ollama: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;

  return {
    raw: data,
    text: data.message?.content || data.response || "",
  };
}
