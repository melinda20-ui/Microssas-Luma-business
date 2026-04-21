"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const AGENTS = [
  { id: "support",    label: "💬 Mia (Suporte)",       color: "orange", desc: "Tire dúvidas sobre a plataforma" },
  { id: "content",   label: "✍️ Content Creator",      color: "cyan",   desc: "Gere posts, blog e e-mails" },
  { id: "website",   label: "🏗️ Website Builder",      color: "purple", desc: "Crie sites completos com IA" },
  { id: "automation",label: "⚙️ Automation Builder",   color: "pink",   desc: "Crie workflows n8n" },
  { id: "analytics", label: "📊 Business Intelligence", color: "green",  desc: "Analise seus dados" },
];

interface Message {
  role: "user" | "agent";
  content: string;
  agent?: string;
  ts: string;
}

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:3001";

import { useUser } from "@clerk/nextjs";

function ChatContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialAgent = searchParams.get("agent") || "support";

  const [activeAgent, setActiveAgent] = useState(initialAgent);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "👋 Olá! Sou Mia, sua assistente de IA. Selecione um agente acima e me diga o que você precisa!",
      agent: "support",
      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPayload = (agent: string, text: string) => {
    const base = { plan: "premium", sessionId };
    switch (agent) {
      case "support":    return { ...base, message: text };
      case "content":    return { ...base, contentType: "instagram", topic: text, businessName: "Meu Negócio", quantity: 3 };
      case "website":    return { ...base, businessType: "negócio", businessName: text, description: text };
      case "automation": return { ...base, description: text };
      case "analytics":  return { ...base, businessName: "Meu Negócio", period: "último mês", metrics: { visitors: text } };
      default:           return { ...base, message: text };
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const endpoint = activeAgent === "support"
        ? `${API_URL}/api/agents/support`
        : activeAgent === "analytics"
        ? `${API_URL}/api/agents/analytics`
        : `${API_URL}/api/agents/${activeAgent}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || ""
        },
        body: JSON.stringify(getPayload(activeAgent, currentInput)),
      });

      if (res.status === 402) {
        const errorData = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: `🚫 **Créditos Insuficientes**\n\n${errorData.message}\n\n[Clique aqui para recarregar](/dashboard/billing)`,
            agent: activeAgent,
            ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      const data = await res.json();

      let responseText = "";
      if (data.response)      responseText = data.response;
      else if (data.content)  responseText = data.content;
      else if (data.report)   responseText = data.report;
      else if (data.message)  responseText = data.message;
      else if (data.html)     responseText = `✅ Site gerado com sucesso!\n\n**${data.businessName}**\n\nO código HTML foi gerado. Você pode baixar ou visualizar no dashboard.`;
      else if (data.workflow)  responseText = `✅ Workflow n8n criado!\n\n${data.instructions?.join("\n") || "Importe no seu n8n para ativar."}`;
      else if (data.error)    responseText = `❌ Erro: ${data.error}`;
      else                    responseText = JSON.stringify(data, null, 2);

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: responseText,
          agent: activeAgent,
          ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "⚠️ Não consegui conectar com a API de agentes. Certifique-se de que o servidor está rodando na porta 3001.",
          agent: activeAgent,
          ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const currentAgent = AGENTS.find((a) => a.id === activeAgent)!;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -100, right: -150, background: "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)" }} />

      {/* Chat Layout */}
      <div style={{ paddingTop: 32, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="container" style={{ flex: 1, paddingTop: 32, paddingBottom: 32, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <h1 className="section-title" style={{ fontSize: "2rem" }}>
              {currentAgent.label}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{currentAgent.desc}</p>
          </div>

          {/* Chat Window */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Agent Tabs */}
            <div className="agent-tabs">
              {AGENTS.map((a) => (
                <button
                  key={a.id}
                  id={`tab-${a.id}`}
                  className={`agent-tab ${activeAgent === a.id ? "active" : ""}`}
                  onClick={() => setActiveAgent(a.id)}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="chat-messages" style={{ flex: 1 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  {m.role === "agent" && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      🤖
                    </div>
                  )}
                  <div>
                    <div className={`chat-bubble ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4, textAlign: m.role === "user" ? "right" : "left" }}>
                      {m.ts}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                  <div className="chat-bubble agent shimmer" style={{ minWidth: 120, height: 44 }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div style={{ padding: "8px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeAgent === "support" && ["Como funciona o Plano Pro?", "Como criar um site?", "Quais automações posso criar?"].map((s) => (
                <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
              {activeAgent === "content" && ["Posts de Instagram para restaurante", "Blog post sobre marketing digital", "Script para vídeo de vendas"].map((s) => (
                <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
              {activeAgent === "website" && ["Barbearia Moderna", "Loja de Roupas Femininas", "Consultório de Psicologia"].map((s) => (
                <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                id="chat-input"
                className="chat-input"
                type="text"
                placeholder={`Mensagem para ${currentAgent.label}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
              />
              <button
                id="chat-send"
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ borderRadius: "50%", width: 48, height: 48, padding: 0, flexShrink: 0 }}
              >
                {loading ? "⏳" : "→"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Carregando...</div>}>
      <ChatContent />
    </Suspense>
  );
}
