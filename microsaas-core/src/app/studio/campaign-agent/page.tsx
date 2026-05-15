"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type Campaign = {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  platform: string;
  objective: string;
  budget: number;
  audience: string;
  creative: string;
  status: string;
  review_notes: string;
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  completed_at: string | null;
  created_at: string;
};

const STATUS_FLOW = ["PENDING", "REVIEW", "APPROVED", "EXECUTING", "COMPLETED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-500/40 bg-yellow-500/10",
  REVIEW: "border-blue-500/40 bg-blue-500/10",
  APPROVED: "border-green-500/40 bg-green-500/10",
  EXECUTING: "border-purple-500/40 bg-purple-500/10",
  COMPLETED: "border-zinc-500/40 bg-zinc-500/10",
};
const PLATFORMS = ["organic", "meta-ads", "google-ads", "tiktok-ads", "email"];
const OBJECTIVES = ["conversion", "traffic", "leads", "awareness", "retention"];

export default function CampaignAgent() {
  const { user, isLoaded } = useUser();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("organic");
  const [agentResult, setAgentResult] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", platform: "organic", objective: "conversion", budget: 0, audience: "", creative: "" });

  const fetchCampaigns = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/campaigns`); if (res.ok) setCampaigns(await res.json()); } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchCampaigns();
  }, [isLoaded, user, fetchCampaigns]);

  const createCampaign = async () => {
    if (!user || !form.title) return;
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, ...form }),
      });
      if (res.ok) {
        fetchCampaigns();
        setForm({ title: "", description: "", platform: "organic", objective: "conversion", budget: 0, audience: "", creative: "" });
        setShowForm(false);
      }
    } catch {}
  };

  const updateStatus = async (id: number, status: string, notes = "") => {
    try {
      await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes: notes, approvedBy: user?.id }),
      });
      fetchCampaigns();
    } catch {}
  };

  const callMarketingAgent = async (action: string) => {
    if (!user) return;
    setAgentLoading(true);
    const agent = selectedAgent === "organic" ? "organic-marketing" : "paid-marketing";
    try {
      const res = await fetch(`${API_URL}/api/agents/${agent}`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action, data: JSON.stringify(form) || "Negocio: MicroSaaS IA. Nicho: pequenos empresarios." }),
      });
      const data = await res.json();
      setAgentResult(data.success ? data.response : "Erro.");
    } catch {}
    setAgentLoading(false);
  };

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

  const pendingReview = campaigns.filter(c => c.status === "PENDING" || c.status === "REVIEW").length;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 450, height: 450, top: -80, left: -100, background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>📢</span><span>Campaign Agent</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Campanhas Inteligentes</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Crie, revise e publique campanhas orgânicas e pagas. Fluxo de aprovação: PENDING → REVIEW → APPROVED → EXECUTING → COMPLETED.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/funil-sualuma" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🔄 Funil Sualuma</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT — Campaigns */}
        <div style={{ flex: 2, minWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              📋 Campanhas ({campaigns.length})
              {pendingReview > 0 && <span className="badge" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 10 }}>{pendingReview} pendentes</span>}
            </div>
            <button className="btn btn-sm btn-primary" style={{ fontSize: 11 }} onClick={() => setShowForm(!showForm)}>{showForm ? "✕" : "+ Nova Campanha"}</button>
          </div>

          {showForm && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📢 Nova Campanha</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <input className="chat-input" style={{ flex: 1, minWidth: 200, fontSize: 12 }} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <select className="chat-input" style={{ width: 130, fontSize: 12 }} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>{PLATFORMS.map(p => (<option key={p} value={p}>{p}</option>))}</select>
                <select className="chat-input" style={{ width: 130, fontSize: 12 }} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}>{OBJECTIVES.map(o => (<option key={o} value={o}>{o}</option>))}</select>
                <input className="chat-input" style={{ width: 100, fontSize: 12 }} placeholder="Orçamento R$" type="number" value={form.budget || ""} onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Público-alvo" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
                <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Criativo / headline" value={form.creative} onChange={(e) => setForm({ ...form, creative: e.target.value })} />
              </div>
              <input className="chat-input" style={{ width: "100%", fontSize: 12, marginBottom: 8 }} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={createCampaign}>✅ Criar</button>
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={() => {
                  const agent = selectedAgent === "organic" ? "organic-marketing" : "paid-marketing";
                  const action = selectedAgent === "organic" ? "campaign" : "campaign";
                  callMarketingAgent(action);
                }} disabled={agentLoading}>
                  🤖 Sugerir com IA
                </button>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Nenhuma campanha</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Crie sua primeira campanha ou peça sugestão ao agente.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>📢 Nova Campanha</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.map((c) => {
                const statusIdx = STATUS_FLOW.indexOf(c.status);
                return (
                  <div key={c.id} className={`card ${STATUS_COLORS[c.status] || ""}`} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {c.title}
                          <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{c.platform}</span>
                          <span className="badge" style={{ fontSize: 9, background: c.status === "PENDING" ? "rgba(234,179,8,0.15)" : c.status === "REVIEW" ? "rgba(59,130,246,0.15)" : c.status === "APPROVED" ? "rgba(34,197,94,0.15)" : c.status === "EXECUTING" ? "rgba(168,85,247,0.15)" : "rgba(113,113,122,0.15)", color: c.status === "PENDING" ? "#eab308" : c.status === "REVIEW" ? "#60a5fa" : c.status === "APPROVED" ? "#22c55e" : c.status === "EXECUTING" ? "#a855f7" : "#a1a1aa" }}>{c.status}</span>
                        </div>
                        {c.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{c.description}</div>}
                        <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 4, display: "flex", gap: 12 }}>
                          {c.budget > 0 && <span>💰 R$ {c.budget.toFixed(0)}</span>}
                          <span>🎯 {c.objective}</span>
                          {c.approved_by && <span>✅ {c.approved_by}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {c.status === "PENDING" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => updateStatus(c.id, "REVIEW")}>🔍 Revisar</button>}
                        {c.status === "REVIEW" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateStatus(c.id, "APPROVED")}>✅ Aprovar</button>}
                        {c.status === "APPROVED" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(168,85,247,0.15)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.3)" }} onClick={() => updateStatus(c.id, "EXECUTING")}>▶ Executar</button>}
                        {c.status === "EXECUTING" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateStatus(c.id, "COMPLETED")}>✅ Completar</button>}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${((statusIdx + 1) / STATUS_FLOW.length) * 100}%`, background: "var(--grad)", borderRadius: 2, transition: "width 0.6s" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "var(--faint)", marginTop: 4, textAlign: "right" }}>Status {statusIdx + 1}/{STATUS_FLOW.length}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Agent Panel */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 380 }}>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🤖</span> Sugestão de Campanha
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { id: "organic", label: "📱 Orgânico" },
                { id: "paid", label: "💰 Pago" },
              ].map(a => (
                <button key={a.id} className={`btn btn-sm ${selectedAgent === a.id ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setSelectedAgent(a.id)}>{a.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {[
                { action: selectedAgent === "organic" ? "diagnose" : "campaign", label: "🎯 Sugerir" },
                { action: selectedAgent === "organic" ? "content" : "optimize", label: "⚡ Otimizar" },
                { action: selectedAgent === "organic" ? "funnel" : "scale", label: "📈 Escalar" },
              ].map(a => (
                <button key={a.action} className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={() => callMarketingAgent(a.action)} disabled={agentLoading}>{a.label}</button>
              ))}
            </div>
            {agentLoading && <div style={{ padding: 8 }}><div className="shimmer" style={{ height: 10, width: "80%", borderRadius: 6 }} /></div>}
            {agentResult && !agentLoading && (
              <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto", padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>
                {agentResult}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📊 Resumo</div>
            {[
              { label: "PENDENTES", count: campaigns.filter(c => c.status === "PENDING").length, color: "#eab308" },
              { label: "EM REVISÃO", count: campaigns.filter(c => c.status === "REVIEW").length, color: "#60a5fa" },
              { label: "APROVADAS", count: campaigns.filter(c => c.status === "APPROVED").length, color: "#22c55e" },
              { label: "EXECUTANDO", count: campaigns.filter(c => c.status === "EXECUTING").length, color: "#a855f7" },
              { label: "CONCLUÍDAS", count: campaigns.filter(c => c.status === "COMPLETED").length, color: "#a1a1aa" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: s.color }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
