export async function POST(req: Request) {
  try {
    const { message, attachments = [] } = await req.json();

    const attachmentText =
      attachments.length > 0
        ? `\n\nArquivos enviados:\n${attachments
            .map(
              (file: any) =>
                `- ${file.name} (${file.type || "tipo desconhecido"}, ${file.size} bytes)`
            )
            .join("\n")}`
        : "";

    const prompt = `${message}${attachmentText}

Se houver arquivos, reconheça que eles foram enviados. Se você ainda não puder ler o conteúdo completo deles, diga isso com clareza e diga o que já consegue identificar pelos nomes e tipos.`;

    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "luma-brain",
        prompt,
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      const txt = await ollamaRes.text();
      return Response.json(
        { ok: false, error: `Erro Ollama: ${txt}` },
        { status: 500 }
      );
    }

    const ollamaData = await ollamaRes.json();

    return Response.json({
      ok: true,
      reply: ollamaData.response || "Sem resposta do Ollama.",
    });
  } catch (error: any) {
    console.error("ERRO NA API /api/chat:", error);
    return Response.json(
      { ok: false, error: error?.message || "Erro interno no backend." },
      { status: 500 }
    );
  }
}
