"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const AGENTS = [
  { id: "support",    label: "💬 Mia (Suporte)",       color: "orange", desc: "Tire dúvidas sobre a plataforma" },
  { id: "content",   label: "✍️ Content Creator",      color: "cyan",   desc: "Gere posts, blog e e-mails" },
  { id: "tiktok",    label: "📱 TikTok Shop Agent",    color: "pink",   desc: "Roteiros e ganchos virais" },
  { id: "shopify",   label: "🛍️ Shopify Expert",      color: "green",  desc: "Copy de vendas e SEO e-commerce" },
  { id: "pinterest", label: "📌 Pinterest Growth",     color: "red",    desc: "Estratégia de tráfego visual" },
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
import { Mic, Volume2, VolumeX, Square } from "lucide-react";

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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useAudio, setUseAudio] = useState(false);
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
      case "tiktok":     return { ...base, topic: text, target: "Público Geral" };
      case "shopify":    return { ...base, productName: text, features: "Qualidade Premium" };
      case "pinterest":  return { ...base, topic: text, nitch: "Trending" };
      case "website":    return { ...base, businessType: "negócio", businessName: text, description: text };
      case "automation": return { ...base, description: text };
      case "analytics":  return { ...base, businessName: "Meu Negócio", period: "último mês", metrics: { visitors: text } };
      default:           return { ...base, message: text };
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const speak = (text: string) => {
    if (!useAudio) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
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
        : activeAgent === "tiktok" || activeAgent === "shopify" || activeAgent === "pinterest"
        ? `${API_URL}/api/agents/${activeAgent}`
        : `${API_URL}/api/agents/chat`; // Fallback

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
      
      if (useAudio) speak(responseText);

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "⚠️ Não consegui conectar com a API de agentes.",
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
              {activeAgent === "tiktok" && ["Roteiro de unboxing viral", "3 ganchos para cosméticos", "Hashtags trending agora"].map((s) => (
                <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => setInput(s)}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="chat-input-area" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                onClick={toggleListening}
                title="Falar com a IA"
              >
                {isListening ? <Square size={18} fill="white" /> : <Mic size={18} />}
              </button>

              <button 
                className={`p-3 rounded-full transition-all ${useAudio ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                onClick={() => setUseAudio(!useAudio)}
                title={useAudio ? "Áudio Ativado" : "Ativar Áudio"}
              >
                {useAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <input
                id="chat-input"
                className="chat-input"
                style={{ flex: 1 }}
                type="text"
                placeholder={`Fale com ${currentAgent.label}...`}
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
                style={{ borderRadius: "50%", width: 44, height: 44, padding: 0, flexShrink: 0 }}
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
