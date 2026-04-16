"use client";

import { useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type UploadedFile = {
  name: string;
  path: string;
  size: number;
  type: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá, Luma. Bem-vinda ao seu centro de comando.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [listening, setListening] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function speakText(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((voice) =>
      voice.lang.toLowerCase().includes("pt")
    );

    if (ptVoice) utterance.voice = ptVoice;

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }

  function startListening() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      setInput(texto);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
  }

  async function uploadSelectedFiles(): Promise<UploadedFile[]> {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || "Falha ao enviar arquivos.");
    }

    return data.files as UploadedFile[];
  }

  async function sendMessage() {
    if (!input.trim() && files.length === 0) return;

    const userMessage =
      input.trim() || `Enviei ${files.length} arquivo(s) para você analisar.`;

    const localFileNames = files.map((file) => file.name);
    const userBubble =
      localFileNames.length > 0
        ? `${userMessage}\n\nArquivos: ${localFileNames.join(", ")}`
        : userMessage;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userBubble },
    ]);

    setInput("");
    setLoading(true);

    try {
      const uploadedFiles = await uploadSelectedFiles();

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          attachments: uploadedFiles,
        }),
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

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (autoSpeak && data.reply) {
        speakText(data.reply);
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erro ao conectar com a IA ou ao enviar arquivos.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-screen flex-col bg-black p-4 text-white">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-xl p-3 whitespace-pre-wrap ${
              msg.role === "user"
                ? "ml-auto bg-purple-600"
                : "bg-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="max-w-[80%] rounded-xl bg-gray-800 p-3 text-white/70">
            Pensando...
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`rounded-lg px-3 py-2 text-sm ${
              autoSpeak ? "bg-purple-600" : "bg-zinc-800"
            }`}
          >
            {autoSpeak ? "🔊 Voz ON" : "🔇 Voz OFF"}
          </button>

          <button
            onClick={startListening}
            className={`rounded-lg px-3 py-2 text-sm ${
              listening ? "bg-cyan-600 text-black" : "bg-zinc-800"
            }`}
          >
            {listening ? "🎤 Ouvindo..." : "🎙 Falar"}
          </button>

          <button
            onClick={() => speakText("Teste de voz do Luma OS")}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
          >
            🧪 Testar voz
          </button>

          <button
            onClick={stopSpeaking}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
          >
            🛑 Parar voz
          </button>

          <label className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-2 text-sm">
            📎 Arquivos
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />
          </label>
        </div>

        {files.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-zinc-900 p-3 text-sm text-white/80">
            {files.map((file) => (
              <div key={file.name}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-lg bg-gray-900 p-3 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            className="rounded-lg bg-purple-600 px-4"
            disabled={loading}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
