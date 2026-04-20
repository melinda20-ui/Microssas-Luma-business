export async function POST(req: Request) {
  try {
    const { message, attachments = [] } = await req.json();

    let attachmentText = "";

    if (attachments.length > 0) {
      attachmentText = `
Arquivos recebidos:
${attachments
  .map(
    (f: any) =>
      `- ${f.name} (${f.type || "desconhecido"}, ${f.size} bytes)`
  )
  .join("\n")}
`;
    }

    const prompt = `
Você é o Luma OS, um sistema inteligente de negócios.

IMPORTANTE:
- Nunca diga que não consegue analisar arquivos
- Sempre reconheça arquivos enviados
- Seja útil, estratégica e prática
- Se não puder ler conteúdo interno, diga que pode analisar com ferramentas adicionais

Mensagem do usuário:
${message}

${attachmentText}

Responda de forma inteligente, útil e estratégica.
`;

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

    const data = await ollamaRes.json();

    return Response.json({
      ok: true,
      reply: data.response,
    });
  } catch (error: any) {
    console.error(error);

    return Response.json(
      { ok: false, error: "Erro no backend" },
      { status: 500 }
    );
  }
}
