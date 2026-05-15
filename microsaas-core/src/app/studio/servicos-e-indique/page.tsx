"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { readPageContext, formatContext } from "@/components/studio/domReader";

const API_URL = "http://localhost:3001";

type PriorityItem = {
  category: "urgent" | "important" | "optional";
  text: string;
};

type AgentResponse = {
  urgent: string[];
  important: string[];
  optional: string[];
  focus: string;
  next: string;
};

function parseAgentResponse(raw: string): AgentResponse {
  const def: AgentResponse = { urgent: [], important: [], optional: [], focus: "", next: "" };

  const sections = raw.split(/\n(?=🔴|🟡|🟢|⭐|✅)/);
  for (const s of sections) {
    const lines = s.split("\n").map(l => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
    if (s.startsWith("🔴")) {
      def.urgent = lines.slice(1).filter(l => !l.startsWith("🔴"));
    } else if (s.startsWith("🟡")) {
      def.important = lines.slice(1).filter(l => !l.startsWith("🟡"));
    } else if (s.startsWith("🟢")) {
      def.optional = lines.slice(1).filter(l => !l.startsWith("🟢"));
    } else if (s.startsWith("⭐")) {
      def.focus = lines[0]?.replace(/^\*\*Foco do momento:\*\*\s*/, "").replace(/^\⭐\s*/, "").trim() || "";
    } else if (s.startsWith("✅")) {
      def.next = lines[0]?.replace(/^\*\*Próximo passo:\*\*\s*/, "").replace(/^✅\s*/, "").trim() || "";
    }
  }

  if (!def.focus) {
    const focusMatch = raw.match(/Foco do momento:?\s*\*?([^\n]+)/);
    if (focusMatch) def.focus = focusMatch[1].trim();
  }
  if (!def.next) {
    const nextMatch = raw.match(/Próximo passo:?\s*\*?([^\n]+)/);
    if (nextMatch) def.next = nextMatch[1].trim();
  }

  return def;
}

const QUICK_ACTIONS = [
  { label: "Organizar ideias", query: "Preciso organizar minhas ideias e tarefas. Me ajude a priorizar o que é mais importante agora.", icon: "🧹" },
  { label: "Estou sobrecarregado", query: "Estou me sentindo sobrecarregado com muitas coisas ao mesmo tempo. Me ajude a reduzir a ansiedade.", icon: "😮‍💨" },
  { label: "Foco urgente", query: "Estou muito disperso hoje. Me ajude a encontrar foco no que realmente importa.", icon: "🎯" },
  { label: "Revisar semana", query: "Me ajude a revisar minha semana e planejar os próximos dias.", icon: "📅" },
];

export default function ServicosIndique() {
  const { user, isLoaded } = useUser();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [mode, setMode] = useState<string>("organize");
  const [focusMode, setFocusMode] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [pageContext, setPageContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageContext(formatContext(readPageContext()));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentResponse, rawResponse]);

  const callTdahAgent = useCallback(async (text: string, selectedMode: string) => {
    if (!user) return;
    setLoading(true);
    setShowInput(false);
    try {
      const res = await fetch(`${API_URL}/api/agents/tdah`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({ message: text, mode: selectedMode }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        setRawResponse(data.response);
        setAgentResponse(parseAgentResponse(data.response));
      } else {
        setRawResponse(data.error || "Sem resposta do agente.");
        setAgentResponse(null);
      }
    } catch (err) {
      console.error("[TDAH] Erro:", err);
      setRawResponse("⚠️ Erro de conexão com o agente TDAH.");
      setAgentResponse(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    await callTdahAgent(input, mode);
    setInput("");
  };

  const handleQuickAction = (query: string) => {
    callTdahAgent(query, mode);
  };

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ marginBottom: 8 }}>Acesso Restrito</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Faça login para acessar.</p>
          <Link href="/sign-in" className="btn btn-primary">Fazer Login</Link>
        </div>
      </div>
    );
  }

  const priorityCount = (agentResponse?.urgent?.length || 0) + (agentResponse?.important?.length || 0) + (agentResponse?.optional?.length || 0);

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 400, height: 400, top: -80, left: -120, background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)" }} />
      <div className="orb" style={{ width: 300, height: 300, bottom: -60, right: -80, background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)" }} />

      {/* Header */}
      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow">
              <span>🧠</span>
              <span>Agente Especialista TDAH</span>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>
              Serviços & Indique
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Organize suas ideias, destaque prioridades e reduza a sobrecarga mental.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className={`btn btn-sm ${focusMode ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFocusMode(!focusMode)}
              style={{ fontSize: 12 }}
            >
              {focusMode ? "🎯 Modo Foco" : "🔲 Modo Normal"}
            </button>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
              🧠 Mia Brain
            </Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* LEFT PANEL — Input / Actions */}
        <div style={{ flex: focusMode ? 0 : 1, minWidth: focusMode ? 0 : 300, maxWidth: focusMode ? 0 : 480, transition: "all 0.4s", overflow: "hidden" }}>
          {/* Mode selector */}
          <div className="card" style={{ padding: 16, marginBottom: 16, display: focusMode ? "none" : undefined }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>🧭 Modo do agente</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "organize", label: "Organizar", icon: "📋" },
                { id: "focus", label: "Foco", icon: "🎯" },
                { id: "calm", label: "Acalmar", icon: "🧘" },
              ].map((m) => (
                <button
                  key={m.id}
                  className={`btn btn-sm ${mode === m.id ? "btn-primary" : "btn-ghost"}`}
                  style={{ fontSize: 11 }}
                  onClick={() => setMode(m.id)}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 16, marginBottom: 16, display: focusMode ? "none" : undefined }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>⚡ Ações rápidas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "flex-start", fontSize: 12, padding: "8px 12px", textAlign: "left" }}
                  onClick={() => handleQuickAction(a.query)}
                  disabled={loading}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <div className="card" style={{ padding: 16, display: showInput || focusMode ? undefined : "none" }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--muted)" }}>
              💬 {focusMode ? "Comando rápido" : "Descreva como você está se sentindo ou o que precisa organizar"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="chat-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder={focusMode ? "Digite seu foco..." : "Ex: Preciso organizar os serviços e indicações da semana..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ borderRadius: "50%", width: 38, height: 38, padding: 0, flexShrink: 0 }}
              >
                {loading ? "⏳" : "→"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div className="shimmer" style={{ height: 16, width: "70%", margin: "0 auto 12px", borderRadius: 8 }} />
              <div className="shimmer" style={{ height: 12, width: "50%", margin: "0 auto", borderRadius: 8 }} />
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Results */}
        <div style={{ flex: 2, minWidth: 320, transition: "all 0.4s" }}>
          {/* Priority Matrix */}
          {agentResponse && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                {/* Urgent */}
                <div className="card" style={{ flex: 1, minWidth: 200, padding: 16, borderLeft: "4px solid #ef4444" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🔴</span> URGENTE
                    <span style={{ fontSize: 10, color: "var(--faint)", fontWeight: 400 }}>({agentResponse.urgent.length})</span>
                  </div>
                  {agentResponse.urgent.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Nada urgente</div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {agentResponse.urgent.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#ef4444", flexShrink: 0 }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Important */}
                <div className="card" style={{ flex: 1, minWidth: 200, padding: 16, borderLeft: "4px solid #eab308" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#eab308", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🟡</span> IMPORTANTE
                    <span style={{ fontSize: 10, color: "var(--faint)", fontWeight: 400 }}>({agentResponse.important.length})</span>
                  </div>
                  {agentResponse.important.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Nada importante pendente</div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {agentResponse.important.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#eab308", flexShrink: 0 }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Optional */}
                <div className="card" style={{ flex: 1, minWidth: 200, padding: 16, borderLeft: "4px solid #22c55e" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🟢</span> OPCIONAL
                    <span style={{ fontSize: 10, color: "var(--faint)", fontWeight: 400 }}>({agentResponse.optional.length})</span>
                  </div>
                  {agentResponse.optional.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Nada opcional</div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {agentResponse.optional.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <span style={{ color: "#22c55e", flexShrink: 0 }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Focus + Next Step */}
              {(agentResponse.focus || agentResponse.next) && (
                <div className="card" style={{ padding: 20, marginBottom: 16, borderLeft: "4px solid var(--indigo)" }}>
                  {agentResponse.focus && (
                    <div style={{ marginBottom: agentResponse.next ? 12 : 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        ⭐ Foco do momento
                      </div>
                      <div style={{ fontSize: 14, color: "var(--indigo)", fontWeight: 600 }}>
                        {agentResponse.focus}
                      </div>
                    </div>
                  )}
                  {agentResponse.next && (
                    <div style={{ paddingTop: agentResponse.focus ? 12 : 0, borderTop: agentResponse.focus ? "1px solid var(--border)" : undefined }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        ✅ Próximo passo
                      </div>
                      <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 600 }}>
                        {agentResponse.next}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw toggle */}
              <details style={{ marginTop: 12 }}>
                <summary style={{ fontSize: 11, color: "var(--faint)", cursor: "pointer" }}>
                  📄 Ver resposta completa do agente ({rawResponse.length} caracteres)
                </summary>
                <pre style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 8, whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}>
                  {rawResponse}
                </pre>
              </details>

              {/* New analysis button */}
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setAgentResponse(null); setRawResponse(""); setShowInput(true); }}>
                  ↻ Nova análise
                </button>
              </div>
            </>
          )}

          {/* Empty state */}
          {!agentResponse && !loading && (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Organização inteligente para sua mente</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 400, margin: "0 auto" }}>
                O agente TDAH ajuda a transformar pensamentos bagunçados em ações claras e priorizadas.
                Use uma ação rápida ao lado ou digite como você está se sentindo.
              </p>
              <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", fontSize: 20 }}>
                <span title="Organizar">📋</span>
                <span title="Foco">🎯</span>
                <span title="Acalmar">🧘</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
