"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá, Luma. Bem-vinda ao seu centro de comando.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
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
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Erro na API");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erro ao conectar com a IA.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === "user"
                ? "bg-purple-600 self-end ml-auto"
                : "bg-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 p-3 rounded-lg bg-gray-900"
        />

        <button
          onClick={sendMessage}
          className="bg-purple-600 px-4 rounded-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

