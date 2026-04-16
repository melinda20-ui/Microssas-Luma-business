export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = body.message

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: false,
      }),
    })

    const data = await response.json()

    return Response.json({
      reply: data.response,
    })
  } catch (error) {
    return Response.json(
      { error: "Erro ao conectar com IA" },
      { status: 500 }
    )
  }
}
