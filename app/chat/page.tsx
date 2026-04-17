"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AutomationJson = {
  name?: string;
  description?: string;
  sourcePrompt?: string;
  steps?: string[];
  nodes?: { type: string; name: string }[];
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [automationStep, setAutomationStep] = useState("Preparando automação...");
  const [automationJson, setAutomationJson] = useState<AutomationJson | null>(null);
  const [showImportQuestion, setShowImportQuestion] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  const simulateAutomationProgress = async () => {
    setAutomationStep("Lendo o seu pedido...");
    await new Promise((r) => setTimeout(r, 900));

    setAutomationStep("Interpretando a lógica da automação...");
    await new Promise((r) => setTimeout(r, 900));

    setAutomationStep("Montando estrutura e nós...");
    await new Promise((r) => setTimeout(r, 1000));

    setAutomationStep("Preparando JSON final...");
    await new Promise((r) => setTimeout(r, 900));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMessage: ChatMessage = { role: "user", content: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userText }),
      });

      const data = await res.json();

      if (data.mode === "automation") {
        setShowAutomationModal(true);
        setAutomationJson(null);
        setShowImportQuestion(false);
        setImportStatus("");

        await simulateAutomationProgress();

        setAutomationJson(data.json || null);
        setShowImportQuestion(!!data.askToImport);

        const aiMessage: ChatMessage = {
          role: "assistant",
          content: `Automação pronta: ${data.json?.name || "Workflow sem nome"}`,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: data.reply || "Erro ao responder.",
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erro na conexão com a IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportToN8N = async () => {
    setImportStatus("Enviando para o n8n...");
    await new Promise((r) => setTimeout(r, 1500));
    setImportStatus(
      "Automação pronta para importação no n8n. Na próxima etapa vamos conectar isso de verdade."
    );
  };

  return (
    <main className="min-h-screen bg-[#050507] text-white px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-6 text-3xl font-semibold">Chat IA Luma OS</h1>

        <div className="mb-6 rounded-3xl border border-white/10 bg-[#0b0d12] p-4">
          <div className="space-y-5">
            {messages.length === 0 && (
              <p className="text-white/45">
                Peça automações, ajuda com código, organização ou estruturação de fluxos.
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <p className="mb-1 text-sm font-semibold text-white/70">
                  {msg.role === "user" ? "Você" : "IA"}
                </p>
                <div
                  className={`rounded-2xl p-4 text-sm leading-7 ${
                    msg.role === "user"
                      ? "bg-[#7A00FF]/15 border border-[#7A00FF]/20 text-white"
                      : "bg-white/[0.04] border border-white/10 text-white/90"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
              </div>
            ))}

            {loading && (
              <div>
                <p className="mb-1 text-sm font-semibold text-white/70">IA</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
                  Pensando...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 py-4 text-white outline-none placeholder:text-white/35"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-2xl bg-[#7A00FF] px-5 py-4 font-semibold text-white disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      </div>

      {showAutomationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-3 sm:p-4">
          <div className="mx-auto flex min-h-full items-center justify-center">
            <div className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-3xl rounded-3xl border border-white/10 bg-[#0b0d12] shadow-[0_0_50px_rgba(122,0,255,0.25)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                <h2 className="text-lg sm:text-2xl font-semibold">Criando automação</h2>
                <button
                  onClick={() => setShowAutomationModal(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs sm:text-sm text-white/70"
                >
                  Fechar
                </button>
              </div>

              <div className="max-h-[78vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-5">
                {!automationJson ? (
                  <div className="space-y-4">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]" />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm sm:text-base text-white/85">
                      {automationStep}
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-white/50">
                      <p>• Lendo seu pedido</p>
                      <p>• Definindo a lógica</p>
                      <p>• Organizando a automação</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-4">
                      <p className="text-xs sm:text-sm text-[#00F0FF]">Automação pronta</p>
                      <h3 className="mt-2 text-lg sm:text-xl font-semibold text-white">
                        {automationJson.name || "Workflow gerado"}
                      </h3>
                      {automationJson.description && (
                        <p className="mt-2 text-sm text-white/70">
                          {automationJson.description}
                        </p>
                      )}
                    </div>

                    {automationJson.sourcePrompt && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="mb-2 text-sm font-semibold text-white/80">
                          Pedido entendido
                        </p>
                        <p className="text-sm text-white/65 break-words">
                          {automationJson.sourcePrompt}
                        </p>
                      </div>
                    )}

                    {automationJson.steps && automationJson.steps.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="mb-3 text-sm font-semibold text-white/80">Etapas</p>
                        <ul className="space-y-2 text-sm text-white/70">
                          {automationJson.steps.map((step, idx) => (
                            <li key={idx}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {automationJson.nodes && automationJson.nodes.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="mb-3 text-sm font-semibold text-white/80">Nós</p>
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                          {automationJson.nodes.map((node, idx) => (
                            <div
                              key={idx}
                              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm"
                            >
                              <p className="font-semibold text-white">{node.name}</p>
                              <p className="mt-1 text-white/50">{node.type}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-sm font-semibold text-white/80">JSON gerado</p>
                      <div className="max-h-64 overflow-y-auto rounded-2xl bg-black/30 p-3 sm:p-4">
                        <pre className="whitespace-pre-wrap break-words text-[11px] sm:text-xs leading-6 text-white/70">
                          {JSON.stringify(automationJson, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {showImportQuestion && (
                      <div className="rounded-2xl border border-[#7A00FF]/20 bg-[#7A00FF]/10 p-4">
                        <p className="text-sm text-white">
                          Deseja importar essa automação agora para o n8n?
                        </p>

                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleImportToN8N}
                            className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white"
                          >
                            Sim, importar para o n8n
                          </button>

                          <button
                            onClick={() => setShowImportQuestion(false)}
                            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70"
                          >
                            Não agora
                          </button>
                        </div>

                        {importStatus && (
                          <p className="mt-4 text-sm text-[#d7b8ff]">{importStatus}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
