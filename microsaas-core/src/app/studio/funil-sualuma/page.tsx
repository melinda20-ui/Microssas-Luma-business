"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type Diagnosis = {
  summary: string;
  topGap: string;
  topOpportunity: string;
  priorityActions: string[];
  dailyPriority: string;
};

type AgentContributions = Record<string, string>;

export default function FunilSualuma() {
  const { user, isLoaded } = useUser();

  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [contributions, setContributions] = useState<AgentContributions>({});
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [error, setError] = useState("");

  const runDiagnosis = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/agents/funnel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({
          message: context || "Diagnóstico geral do funil da Sualuma",
          context: context || "Negócio: MicroSaaS de agentes IA. Produtos: sites, conteudo, automacoes. Planos: Lite (R$49), Premium, Pro. Publico: pequenos empresarios brasileiros.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
        setContributions(data.agentContributions || {});
      } else {
        setError(data.error || "Erro ao gerar diagnóstico.");
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) runDiagnosis();
  }, [isLoaded, user]);

  if (!isLoaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} /></div>;

  if (!user) return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>Acesso Restrito</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Faça login.</p>
        <Link href="/sign-in" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  const AGENTS = [
    { id: "financial", icon: "💰", label: "Financeiro", desc: "Metas e receita" },
    { id: "ux", icon: "🎨", label: "UX", desc: "Experiência e atrito" },
    { id: "organic", icon: "📱", label: "Marketing Orgânico", desc: "SEO e conteúdo" },
    { id: "paid", icon: "💸", label: "Marketing Pago", desc: "Tráfego pago" },
    { id: "google", icon: "🔍", label: "Google Intelligence", desc: "Tendências" },
  ];

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, right: -180, background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>🔄</span><span>Coordenação Estratégica Multigentes</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Funil Sualuma</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              5 agentes conversam entre si para gerar um diagnóstico unificado. Ações prioritárias viram tarefas no Mia Brain.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/campaign-agent" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>📢 Campaign Agent</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>

        {/* Context input */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Contexto opcional para o diagnóstico (ex: 'Foco em aumentar conversao de planos')" value={context} onChange={(e) => setContext(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runDiagnosis()} />
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={runDiagnosis} disabled={loading}>{loading ? "⏳" : "🔄 Gerar Diagnóstico"}</button>
          </div>
        </div>

        {error && <div className="card" style={{ padding: 16, marginBottom: 16, borderLeft: "4px solid #ef4444", fontSize: 13 }}>{error}</div>}

        {loading && (
          <div className="card" style={{ padding: 24 }}>
            <div className="shimmer" style={{ height: 14, width: "60%", marginBottom: 12, borderRadius: 6 }} />
            <div className="shimmer" style={{ height: 10, width: "90%", marginBottom: 8, borderRadius: 6 }} />
            <div className="shimmer" style={{ height: 10, width: "75%", marginBottom: 8, borderRadius: 6 }} />
            <div className="shimmer" style={{ height: 10, width: "85%", borderRadius: 6 }} />
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)" }}>Consultando 5 agentes especialistas...</div>
          </div>
        )}

        {diagnosis && !loading && (
          <>
            {/* Main Diagnosis */}
            <div className="card" style={{ padding: 20, marginBottom: 20, borderLeft: "4px solid var(--indigo)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>🧬 Diagnóstico Estratégico</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{diagnosis.summary}</div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div className="card" style={{ flex: 1, minWidth: 200, padding: 14, borderLeft: "4px solid #ef4444" }}>
                  <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>🔴 Principal Gargalo</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginTop: 4 }}>{diagnosis.topGap}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 200, padding: 14, borderLeft: "4px solid #22c55e" }}>
                  <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>🟢 Maior Oportunidade</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginTop: 4 }}>{diagnosis.topOpportunity}</div>
                </div>
              </div>

              {diagnosis.priorityActions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🎯 Ações Prioritárias</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {diagnosis.priorityActions.map((action, i) => (
                      <div key={i} style={{ fontSize: 12, padding: "8px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--indigo)", fontWeight: 700 }}>#{i + 1}</span>
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diagnosis.dailyPriority && (
                <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600, marginBottom: 2 }}>⭐ Prioridade do Dia</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{diagnosis.dailyPriority}</div>
                </div>
              )}
            </div>

            {/* Agent Contributions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {AGENTS.map((agent) => (
                <div key={agent.id} className="card" style={{
                  flex: "1 1 180px", minWidth: 180, padding: 14,
                  borderLeft: `4px solid ${activeAgent === agent.id ? "var(--indigo)" : "var(--border)"}`,
                  cursor: "pointer", transition: "all 0.2s",
                }} onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{agent.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{agent.label}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{agent.desc}</div>
                  {activeAgent === agent.id && contributions[agent.id] && (
                    <div style={{ fontSize: 11, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", lineHeight: 1.5 }}>
                      {contributions[agent.id]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
