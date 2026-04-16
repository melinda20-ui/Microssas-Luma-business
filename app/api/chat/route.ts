import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { message, chatId } = await req.json();

  let chat;

  // cria ou pega chat
  if (!chatId) {
    chat = await prisma.chat.create({ data: {} });
  } else {
    chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });
  }

  // salva mensagem do usuário
  await prisma.message.create({
    data: {
      content: message,
      role: "user",
      chatId: chat!.id,
    },
  });

  // 🔥 CHAMADA REAL DO OLLAMA
  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
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

  const ollamaData = await ollamaRes.json();
  const resposta = ollamaData.response;

  // salva resposta da IA
  await prisma.message.create({
    data: {
      content: resposta,
      role: "assistant",
      chatId: chat!.id,
    },
  });

  return Response.json({
    reply: resposta,
    chatId: chat!.id,
  });
}
