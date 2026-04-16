"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId,
        }),
      });

      const data = await res.json();

      setChatId(data.chatId);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar." },
      ]);
    }

    setLoading(false);
  }

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      {/* HEADER */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-bold">Luma Chat</h1>
      </div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[70%] p-3 rounded-xl ${
              msg.role === "user"
                ? "bg-purple-600 ml-auto"
                : "bg-zinc-800"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="text-sm opacity-50">Pensando...</div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-white/10 flex gap-2">
        <input
          className="flex-1 p-3 rounded-xl bg-zinc-900 outline-none"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-purple-600 rounded-xl"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}
