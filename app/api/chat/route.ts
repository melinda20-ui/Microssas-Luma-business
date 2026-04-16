export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "luma-brain",
        prompt: message,
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
