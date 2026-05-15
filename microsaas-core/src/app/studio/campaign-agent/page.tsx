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

type EmailSequence = {
  id: number;
  campaign_id: number;
  subject: string;
  body: string;
  days_after_start: number;
  status: string;
  sent_at: string | null;
};

type CampaignInsights = {
  total: number;
  byStatus: { status: string; count: number }[];
  byPlatform: { platform: string; count: number }[];
  totalBudget: number;
  avgBudget: number;
};

type BlogPost = {
  id: number;
  title: string;
  category: string;
  status: string;
  campaign_id: number | null;
};

const STATUS_FLOW = ["PENDING", "REVIEW", "APPROVED", "EXECUTING", "COMPLETED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-500/40 bg-yellow-500/10",
  REVIEW: "border-blue-500/40 bg-blue-500/10",
  APPROVED: "border-green-500/40 bg-green-500/10",
  EXECUTING: "border-purple-500/40 bg-purple-500/10",
  COMPLETED: "border-zinc-500/40 bg-zinc-500/10",
};
const STATUS_TEXT_COLORS: Record<string, string> = {
  PENDING: "#eab308", REVIEW: "#60a5fa", APPROVED: "#22c55e",
  EXECUTING: "#a855f7", COMPLETED: "#a1a1aa",
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
  const [briefInput, setBriefInput] = useState("");

  const [insights, setInsights] = useState<CampaignInsights | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [availablePosts, setAvailablePosts] = useState<BlogPost[]>([]);
  const [showSeqForm, setShowSeqForm] = useState(false);
  const [seqForm, setSeqForm] = useState({ subject: "", body: "", daysAfterStart: 0 });
  const [seqLoading, setSeqLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/campaigns`); if (res.ok) setCampaigns(await res.json()); } catch {}
  }, []);

  const fetchInsights = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/campaigns/insights`); if (res.ok) setInsights(await res.json()); } catch {}
  }, []);

  const fetchAvailablePosts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/blog/queue`);
      if (res.ok) {
        const posts = await res.json();
        setAvailablePosts(posts.filter((p: BlogPost) => !p.campaign_id));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCampaigns();
      fetchInsights();
      fetchAvailablePosts();
    }
  }, [isLoaded, user, fetchCampaigns, fetchInsights, fetchAvailablePosts]);

  const createCampaign = async () => {
    if (!user || !form.title) return;
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, ...form }),
      });
      if (res.ok) {
        fetchCampaigns();
        fetchInsights();
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
      fetchInsights();
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

  const generateWithIA = async () => {
    if (!user || !briefInput.trim()) return;
    setAgentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, brief: briefInput }),
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        setForm({
          title: data.suggestion.title || "",
          description: data.suggestion.description || "",
          platform: PLATFORMS.includes(data.suggestion.platform) ? data.suggestion.platform : "organic",
          objective: OBJECTIVES.includes(data.suggestion.objective) ? data.suggestion.objective : "conversion",
          budget: data.suggestion.budget || 0,
          audience: data.suggestion.audience || "",
          creative: data.suggestion.creative || "",
        });
        setAgentResult(`✅ Campanha gerada por IA! Preenchemos o formulário com:\n\nTítulo: ${data.suggestion.title}\nPlataforma: ${data.suggestion.platform}\nPúblico: ${data.suggestion.audience}\n\nRevise e ajuste antes de criar.`);
        setShowForm(true);
      }
    } catch {}
    setAgentLoading(false);
  };

  const expandCampaign = async (id: number) => {
    if (expandedCampaign === id) { setExpandedCampaign(null); return; }
    setExpandedCampaign(id);
    try {
      const [seqRes, blogRes] = await Promise.all([
        fetch(`${API_URL}/api/campaigns/${id}/sequences`),
        fetch(`${API_URL}/api/campaigns/${id}/blog-connections`),
      ]);
      if (seqRes.ok) setSequences(await seqRes.json());
      if (blogRes.ok) setBlogPosts(await blogRes.json());
    } catch {}
  };

  const addSequence = async (campaignId: number) => {
    if (!seqForm.subject) return;
    setSeqLoading(true);
    try {
      await fetch(`${API_URL}/api/campaigns/${campaignId}/sequences`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seqForm),
      });
      setSeqForm({ subject: "", body: "", daysAfterStart: 0 });
      setShowSeqForm(false);
      expandCampaign(campaignId);
    } catch {}
    setSeqLoading(false);
  };

  const connectBlogPost = async (campaignId: number, postId: number) => {
    try {
      await fetch(`${API_URL}/api/campaigns/${campaignId}/connect-blog`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: [postId] }),
      });
      expandCampaign(campaignId);
      fetchAvailablePosts();
    } catch {}
  };

  const createBrainTask = async (campaign: Campaign) => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/api/brain/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: `campaign_${campaign.id}`,
          clerkId: user.id,
          agentId: campaign.platform === "email" ? "email-marketing" : "campaign-agent",
          title: `Executar campanha: ${campaign.title}`,
          description: `Campanha #${campaign.id}: ${campaign.description || campaign.title}. Plataforma: ${campaign.platform}. Objetivo: ${campaign.objective}. Orçamento: R$${campaign.budget}`,
          payload: { campaignId: campaign.id, platform: campaign.platform, objective: campaign.objective, budget: campaign.budget },
        }),
      });
    } catch {}
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
  const executing = campaigns.filter(c => c.status === "EXECUTING").length;
  const completed = campaigns.filter(c => c.status === "COMPLETED").length;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 450, height: 450, top: -80, left: -100, background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)" }} />
      <div className="orb" style={{ width: 300, height: 300, bottom: -60, right: -60, background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>📢</span><span>Campaign Agent</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Campanhas Inteligentes</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Crie, publique e automatize campanhas orgânicas, pagas e email. Conecte ao blog, gere sequências e integre ao sistema de tarefas.
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
          {/* Stats bar */}
          {insights && (
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{insights.total}</div>
                <div style={{ fontSize: 9, color: "var(--faint)" }}>Total</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#eab308" }}>{pendingReview}</div>
                <div style={{ fontSize: 9, color: "var(--faint)" }}>Pendentes</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#a855f7" }}>{executing}</div>
                <div style={{ fontSize: 9, color: "var(--faint)" }}>Executando</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{completed}</div>
                <div style={{ fontSize: 9, color: "var(--faint)" }}>Completas</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 100, padding: "8px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>R$ {insights.totalBudget.toFixed(0)}</div>
                <div style={{ fontSize: 9, color: "var(--faint)" }}>Orçamento Total</div>
              </div>
            </div>
          )}

          {/* AI Brief Generator */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🤖</span> Gerar Campanha com IA
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Descreva sua campanha ideal... Ex: 'Quero uma campanha para vender planos Premium para empresários no Instagram'" value={briefInput} onChange={(e) => setBriefInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateWithIA()} />
              <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={generateWithIA} disabled={agentLoading || !briefInput.trim()}>✨ Gerar</button>
            </div>
          </div>

          {/* Header + New Campaign */}
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={createCampaign}>✅ Criar</button>
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={() => callMarketingAgent(selectedAgent === "organic" ? "diagnose" : "campaign")} disabled={agentLoading}>🤖 Sugerir</button>
              </div>
            </div>
          )}

          {campaigns.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Nenhuma campanha</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Crie sua primeira campanha ou use o gerador com IA acima.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>📢 Nova Campanha</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.map((c) => {
                const statusIdx = STATUS_FLOW.indexOf(c.status);
                const isExpanded = expandedCampaign === c.id;
                return (
                  <div key={c.id} className={`card ${STATUS_COLORS[c.status] || ""}`} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {c.title}
                          <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{c.platform}</span>
                          <span className="badge" style={{ fontSize: 9, background: `${STATUS_TEXT_COLORS[c.status]}15`, color: STATUS_TEXT_COLORS[c.status] }}>{c.status}</span>
                        </div>
                        {c.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{c.description}</div>}
                        <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {c.budget > 0 && <span>💰 R$ {c.budget.toFixed(0)}</span>}
                          <span>🎯 {c.objective}</span>
                          {c.audience && <span>👥 {c.audience}</span>}
                          {c.approved_by && <span>✅ {c.approved_by}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {c.status === "PENDING" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => updateStatus(c.id, "REVIEW")}>🔍 Revisar</button>}
                        {c.status === "REVIEW" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateStatus(c.id, "APPROVED")}>✅ Aprovar</button>}
                        {c.status === "APPROVED" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(168,85,247,0.15)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.3)" }} onClick={() => updateStatus(c.id, "EXECUTING")}>▶ Executar</button>}
                        {c.status === "EXECUTING" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateStatus(c.id, "COMPLETED")}>✅ Completar</button>}
                        <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }} onClick={() => expandCampaign(c.id)}>{isExpanded ? "▲" : "▼"}</button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${((statusIdx + 1) / STATUS_FLOW.length) * 100}%`, background: "var(--grad)", borderRadius: 2, transition: "width 0.6s" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "var(--faint)", marginTop: 4, textAlign: "right" }}>Status {statusIdx + 1}/{STATUS_FLOW.length}</div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                        {/* Creative display */}
                        {c.creative && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>CRIATIVO</div>
                            <div style={{ fontSize: 11, padding: "8px 12px", background: "rgba(0,0,0,0.15)", borderRadius: 6, whiteSpace: "pre-wrap" }}>{c.creative}</div>
                          </div>
                        )}

                        {/* Email sequences */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)" }}>SEQUÊNCIAS DE EMAIL ({sequences.length})</div>
                            <button className="btn btn-sm" style={{ fontSize: 9, padding: "2px 8px" }} onClick={() => setShowSeqForm(!showSeqForm)}>+ Adicionar</button>
                          </div>
                          {showSeqForm && (
                            <div style={{ padding: 8, marginBottom: 8, background: "rgba(99,102,241,0.08)", borderRadius: 6 }}>
                              <input className="chat-input" style={{ width: "100%", fontSize: 11, marginBottom: 4 }} placeholder="Assunto do email" value={seqForm.subject} onChange={(e) => setSeqForm({ ...seqForm, subject: e.target.value })} />
                              <input className="chat-input" style={{ width: "100%", fontSize: 11, marginBottom: 4 }} placeholder="Corpo do email (opcional)" value={seqForm.body} onChange={(e) => setSeqForm({ ...seqForm, body: e.target.value })} />
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input className="chat-input" style={{ width: 80, fontSize: 11 }} placeholder="Dias após início" type="number" value={seqForm.daysAfterStart} onChange={(e) => setSeqForm({ ...seqForm, daysAfterStart: parseInt(e.target.value) || 0 })} />
                                <button className="btn btn-sm btn-primary" style={{ fontSize: 10 }} onClick={() => addSequence(c.id)} disabled={seqLoading || !seqForm.subject}>Salvar</button>
                              </div>
                            </div>
                          )}
                          {sequences.map((s) => (
                            <div key={s.id} style={{ fontSize: 10, padding: "4px 8px", background: "rgba(0,0,0,0.1)", borderRadius: 4, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                              <span>📧 D+{s.days_after_start}: {s.subject}</span>
                              <span style={{ color: s.status === "sent" ? "#22c55e" : "var(--faint)" }}>{s.status}</span>
                            </div>
                          ))}
                        </div>

                        {/* Blog connections */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 6 }}>ARTIGOS CONECTADOS ({blogPosts.length})</div>
                          {blogPosts.map((p) => (
                            <div key={p.id} style={{ fontSize: 10, padding: "4px 8px", background: "rgba(0,0,0,0.1)", borderRadius: 4, marginBottom: 4 }}>
                              📝 {p.title} <span style={{ color: "var(--faint)" }}>({p.status})</span>
                            </div>
                          ))}
                          {availablePosts.length > 0 && (
                            <select className="chat-input" style={{ width: "100%", fontSize: 10, marginTop: 4 }} value="" onChange={(e) => { if (e.target.value) connectBlogPost(c.id, parseInt(e.target.value)); }}>
                              <option value="">Conectar artigo...</option>
                              {availablePosts.map((p) => (
                                <option key={p.id} value={p.id}>{p.title} ({p.category})</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Task integration */}
                        <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={() => createBrainTask(c)}>➕ Criar tarefa no Mia Brain</button>
                      </div>
                    )}
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
              <span>🤖</span> Agente de Marketing
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
              <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 350, overflow: "auto", padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>
                {agentResult}
              </div>
            )}
          </div>

          {/* Status breakdown */}
          {insights && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📊 Distribuição</div>
              {insights.byStatus.map((s) => (
                <div key={s.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: STATUS_TEXT_COLORS[s.status] || "var(--faint)" }}>{s.status}</span>
                  <span style={{ fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--faint)" }}>Orçamento médio: R$ {insights.avgBudget.toFixed(0)}</div>
              </div>
            </div>
          )}

          {/* Platforms */}
          {insights && insights.byPlatform.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📡 Plataformas</div>
              {insights.byPlatform.map((p) => (
                <div key={p.platform} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span>{p.platform}</span>
                  <span style={{ fontWeight: 600 }}>{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}