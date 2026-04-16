"use client";

import Link from "next/link";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá, Luma. Bem-vinda ao seu centro de comando. O que vamos criar hoje?",
    },
  ]);

  function handleSend() {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      {
        role: "assistant",
        content:
          "Recebi seu comando. Na próxima etapa vamos ligar essa tela ao backend real.",
      },
    ]);

    setInput("");
  }

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#050507]/90 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80"
            >
              ←
            </Link>

            <div>
              <p className="text-sm font-semibold text-white">Luma Chat</p>
              <p className="text-xs text-white/40">Modo conversa</p>
            </div>
          </div>

          <div className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
            Ativo
          </div>
        </header>

        <section className="flex-1 px-3 pb-36 pt-4 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "assistant"
                    ? "mr-auto max-w-[88%] rounded-[24px] border border-white/10 bg-[#0b0d12] px-4 py-4 shadow-[0_0_24px_rgba(122,0,255,0.06)] md:max-w-[75%]"
                    : "ml-auto max-w-[88%] rounded-[24px] border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-4 shadow-[0_0_24px_rgba(0,240,255,0.08)] md:max-w-[75%]"
                }
              >
                <p
                  className={
                    message.role === "assistant"
                      ? "mb-2 text-sm font-semibold text-[#A855F7]"
                      : "mb-2 text-sm font-semibold text-[#00F0FF]"
                  }
                >
                  {message.role === "assistant" ? "Agente" : "Você"}
                </p>

                <p className="text-[15px] leading-7 text-white/85">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#050507]/92 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                🔇 Voz OFF
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                🎙 Falar
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                🧠 Agente
              </button>
            </div>

            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Envie uma mensagem para o Luma OS..."
                className="max-h-40 min-h-[56px] flex-1 resize-none rounded-[24px] border border-white/10 bg-[#0b0d12] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.12)]"
              />

              <button
                onClick={handleSend}
                className="inline-flex h-14 min-w-[92px] items-center justify-center rounded-[20px] bg-[#7A00FF] px-5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(122,0,255,0.32)] transition hover:bg-[#8d28ff]"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
