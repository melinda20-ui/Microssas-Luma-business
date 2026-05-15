"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type LeadMagnet = {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  objective: string;
  funnel_stage: string;
  niche: string;
  content: string;
  cta: string;
  seo_score: number;
  download_count: number;
  conversion_count: number;
  status: string;
  tags: string;
  version: number;
  created_at: string;
};

type LeadMagnetStats = {
  total: number;
  published: number;
  totalDownloads: number;
  totalConversions: number;
  totalLeads: number;
  byCategory: { category: string; count: number }[];
  byType: { type: string; count: number }[];
  byFunnelStage: { funnel_stage: string; count: number }[];
  recentLeads: { name: string; email: string; magnet_title: string; created_at: string }[];
};

const TYPES = ["pdf", "checklist", "guide", "template", "spreadsheet", "notion", "ebook"];
const CATEGORIES = ["geral", "tdah", "financas", "marketing", "produtividade", "seo", "negocios"];
const FUNNEL_STAGES = ["top", "middle", "bottom"];
const STATUSES = ["draft", "review", "approved", "published", "archived"];

function magnetIcon(type: string) {
  const map: Record<string, string> = { pdf: "📄", checklist: "✅", guide: "📖", template: "📋", spreadsheet: "📊", notion: "🧠", ebook: "📚" };
  return map[type] || "📦";
}

function stageColor(stage: string) {
  const map: Record<string, string> = { top: "#22c55e", middle: "#eab308", bottom: "#ef4444" };
  return map[stage] || "#a1a1aa";
}

function stageLabel(stage: string) {
  const map: Record<string, string> = { top: "Topo", middle: "Meio", bottom: "Fundo" };
  return map[stage] || stage;
}

export default function IscasLab() {
  const { user, isLoaded } = useSession();

  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [stats, setStats] = useState<LeadMagnetStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"inventory" | "create" | "stats">("inventory");
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);

  // Generation form
  const [genForm, setGenForm] = useState({ title: "", type: "pdf", category: "geral", niche: "", audience: "" });
  const [genResult, setGenResult] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  // Agent results
  const [uxResult, setUxResult] = useState("");
  const [copyResult, setCopyResult] = useState("");
  const [tdahResult, setTdahResult] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "pdf", category: "geral", objective: "lead", funnelStage: "top", niche: "", content: "", cta: "", tags: "" });

  const fetchMagnets = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/lead-magnets`); if (res.ok) setMagnets(await res.json()); } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/lead-magnets/stats`); if (res.ok) setStats(await res.json()); } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) { fetchMagnets(); fetchStats(); }
  }, [isLoaded, user, fetchMagnets, fetchStats]);

  const generateWithIA = async () => {
    if (!genForm.title.trim()) return;
    setGenLoading(true); setGenResult(""); setUxResult(""); setCopyResult(""); setTdahResult("");
    try {
      const res = await fetch(`${API_URL}/api/lead-magnets/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genForm),
      });
      const data = await res.json();
      if (data.success) {
        setForm({
          title: data.magnet.title,
          description: data.magnet.description,
          type: data.magnet.type,
          category: data.magnet.category,
          objective: "lead",
          funnelStage: "top",
          niche: data.magnet.niche,
          content: data.magnet.content,
          cta: data.magnet.cta,
          tags: data.magnet.tags,
        });
        setGenResult(`✅ Isca gerada!\n\nTítulo: ${data.magnet.title}\nSEO Score: ${data.magnet.seo_score}\n\nConteúdo e CTA preenchidos no formulário.`);
        setShowForm(true);
        setSelectedMagnet(data.magnet);
        fetchMagnets();
      }
    } catch {}
    setGenLoading(false);
  };

  const createMagnet = async () => {
    if (!form.title) return;
    try {
      const res = await fetch(`${API_URL}/api/lead-magnets`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description, type: form.type,
          category: form.category, objective: form.objective, funnelStage: form.funnelStage,
          niche: form.niche, content: form.content, cta: form.cta, tags: form.tags,
        }),
      });
      if (res.ok) {
        fetchMagnets(); fetchStats();
        setForm({ title: "", description: "", type: "pdf", category: "geral", objective: "lead", funnelStage: "top", niche: "", content: "", cta: "", tags: "" });
        setShowForm(false);
      }
    } catch {}
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_URL}/api/lead-magnets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      fetchMagnets();
    } catch {}
  };

  const sendToDiscord = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/lead-magnets/${id}/approve-discord`, { method: "POST" });
    } catch {}
  };

  const callUxAgent = async (magnet: LeadMagnet) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/lead-magnet-ux`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", title: magnet.title, type: magnet.type, description: magnet.description, data: magnet.content }),
      });
      const data = await res.json();
      setUxResult(data.success ? data.response : "Erro.");
    } catch {}
    setAgentLoading(false);
  };

  const callCopyAgent = async (magnet: LeadMagnet) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/lead-magnet-copy`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", title: magnet.title, type: magnet.type, audience: magnet.niche, data: magnet.content }),
      });
      const data = await res.json();
      setCopyResult(data.success ? data.response : "Erro.");
    } catch {}
    setAgentLoading(false);
  };

  const callTdahAgent = async (magnet: LeadMagnet) => {
    setAgentLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/lead-magnet-tdah`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", title: magnet.title, type: magnet.type, description: magnet.content }),
      });
      const data = await res.json();
      setTdahResult(data.success ? data.response : "Erro.");
    } catch {}
    setAgentLoading(false);
  };

  const callAllAgents = async (magnet: LeadMagnet) => {
    setUxResult(""); setCopyResult(""); setTdahResult("");
    setSelectedMagnet(magnet);
    await Promise.all([callUxAgent(magnet), callCopyAgent(magnet), callTdahAgent(magnet)]);
  };

  if (!isLoaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} /></div>;

  if (!user) return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>Acesso Restrito</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Faça login.</p>
        <Link href="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  const publishedMagnets = magnets.filter(m => m.status === "published" || m.status === "approved");
  const topDownloads = [...magnets].sort((a, b) => b.download_count - a.download_count).slice(0, 5);

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, right: -180, background: "radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)" }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: -80, left: -100, background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>🧪</span><span>Lead Magnet Lab</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Laboratório de Iscas Digitais</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Fábrica automática de iscas digitais inteligentes. Gere, publique e conecte artigos a lead magnets com 3 agentes especialistas.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/blog-agent" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>✍️ Blog Agent</Link>
            <Link href="/studio/funil-sualuma" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🔄 Funil</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>
        {/* Stats bar */}
        {stats && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
              <div style={{ fontSize: 9, color: "var(--faint)" }}>Iscas</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{stats.published}</div>
              <div style={{ fontSize: 9, color: "var(--faint)" }}>Publicadas</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#818cf8" }}>{stats.totalDownloads}</div>
              <div style={{ fontSize: 9, color: "var(--faint)" }}>Downloads</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{stats.totalConversions}</div>
              <div style={{ fontSize: 9, color: "var(--faint)" }}>Conversões</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#eab308" }}>{stats.totalLeads}</div>
              <div style={{ fontSize: 9, color: "var(--faint)" }}>Leads</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { id: "inventory" as const, label: "📦 Inventário" },
            { id: "create" as const, label: "🔬 Criar Isca" },
            { id: "stats" as const, label: "📊 Performance" },
          ].map(t => (
            <button key={t.id} className={`btn btn-sm ${activeTab === t.id ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* TAB: INVENTORY */}
        {activeTab === "inventory" && (
          <>
            {/* Inventory header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>📦 Inventário ({magnets.length} iscas)</div>
              <button className="btn btn-sm btn-primary" style={{ fontSize: 11 }} onClick={() => { setActiveTab("create"); setShowForm(true); }}>+ Nova Isca</button>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <span key={c} className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.1)", color: "#a5b4fc", cursor: "pointer" }}>{c}</span>
              ))}
            </div>

            {magnets.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
                <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Nenhuma isca ainda</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Crie sua primeira isca digital ou use o gerador com IA.</p>
                <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab("create"); setShowForm(true); }}>🔬 Criar Isca</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {magnets.map((m) => {
                  const isExpanded = selectedMagnet?.id === m.id;
                  return (
                    <div key={m.id} className="card" style={{
                      padding: "12px 16px",
                      borderLeft: `4px solid ${m.status === "published" ? "#22c55e" : m.status === "approved" ? "#818cf8" : m.status === "draft" ? "#eab308" : "#a1a1aa"}`,
                      cursor: "pointer",
                    }} onClick={() => setSelectedMagnet(isExpanded ? null : m)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {magnetIcon(m.type)} {m.title}
                            <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>{m.type}</span>
                            <span className="badge" style={{ fontSize: 9, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>{m.category}</span>
                          </div>
                          {m.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{m.description}</div>}
                          <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ color: stageColor(m.funnel_stage) }}>🎯 {stageLabel(m.funnel_stage)}</span>
                            <span>📥 {m.download_count} downloads</span>
                            <span>🔄 {m.conversion_count} conversões</span>
                            <span>📊 SEO {m.seo_score}</span>
                            <span className="badge" style={{ fontSize: 9, background: m.status === "published" ? "rgba(34,197,94,0.15)" : m.status === "draft" ? "rgba(234,179,8,0.15)" : "rgba(99,102,241,0.15)", color: m.status === "published" ? "#22c55e" : m.status === "draft" ? "#eab308" : "#818cf8" }}>{m.status}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {m.status === "draft" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }} onClick={(e) => { e.stopPropagation(); updateStatus(m.id, "review"); }}>🔍 Revisar</button>}
                          {m.status === "review" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={(e) => { e.stopPropagation(); updateStatus(m.id, "approved"); }}>✅ Aprovar</button>}
                          {m.status === "approved" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(168,85,247,0.15)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.3)" }} onClick={(e) => { e.stopPropagation(); updateStatus(m.id, "published"); }}>📦 Publicar</button>}
                          {m.status !== "archived" && <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }} onClick={(e) => { e.stopPropagation(); sendToDiscord(m.id); }}>📢 Discord</button>}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                          {/* Content preview */}
                          {m.content && (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>CONTEÚDO</div>
                              <div style={{ fontSize: 11, padding: "8px 12px", background: "rgba(0,0,0,0.15)", borderRadius: 6, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto" }}>{m.content}</div>
                            </div>
                          )}
                          {m.cta && (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>CTA</div>
                              <div style={{ fontSize: 11, padding: "6px 10px", background: "rgba(16,185,129,0.1)", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>{m.cta}</div>
                            </div>
                          )}

                          {/* Agent Buttons */}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                            <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); callAllAgents(m); }} disabled={agentLoading}>🎨 3 Agentes</button>
                            <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); callUxAgent(m); }} disabled={agentLoading}>🎨 UX</button>
                            <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); callCopyAgent(m); }} disabled={agentLoading}>✍️ Copy</button>
                            <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); callTdahAgent(m); }} disabled={agentLoading}>🧠 TDAH</button>
                          </div>

                          {/* Agent results */}
                          {uxResult && <div style={{ fontSize: 11, padding: 8, marginBottom: 6, background: "rgba(99,102,241,0.08)", borderRadius: 6, whiteSpace: "pre-wrap", maxHeight: 150, overflow: "auto" }}>🎨 UX: {uxResult}</div>}
                          {copyResult && <div style={{ fontSize: 11, padding: 8, marginBottom: 6, background: "rgba(16,185,129,0.08)", borderRadius: 6, whiteSpace: "pre-wrap", maxHeight: 150, overflow: "auto" }}>✍️ Copy: {copyResult}</div>}
                          {tdahResult && <div style={{ fontSize: 11, padding: 8, marginBottom: 6, background: "rgba(234,179,8,0.08)", borderRadius: 6, whiteSpace: "pre-wrap", maxHeight: 150, overflow: "auto" }}>🧠 TDAH: {tdahResult}</div>}

                          {/* Tags */}
                          {m.tags && <div style={{ fontSize: 10, color: "var(--faint)" }}>🏷️ {m.tags}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Top Downloads sidebar */}
            {topDownloads.length > 0 && (
              <div className="card" style={{ padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🏆 Top Downloads</div>
                {topDownloads.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span>#{i + 1} {magnetIcon(m.type)} {m.title}</span>
                    <span style={{ fontWeight: 600, color: "#22c55e" }}>{m.download_count}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB: CREATE */}
        {activeTab === "create" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 320 }}>
              {/* AI Generator */}
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🤖</span> Gerar Isca com IA
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <input className="chat-input" style={{ flex: 1, minWidth: 200, fontSize: 12 }} placeholder="Título da isca... Ex: 'Checklist de SEO da Lude'" value={genForm.title} onChange={(e) => setGenForm({ ...genForm, title: e.target.value })} />
                  <select className="chat-input" style={{ width: 110, fontSize: 12 }} value={genForm.type} onChange={(e) => setGenForm({ ...genForm, type: e.target.value })}>{TYPES.map(t => (<option key={t} value={t}>{t}</option>))}</select>
                  <select className="chat-input" style={{ width: 120, fontSize: 12 }} value={genForm.category} onChange={(e) => setGenForm({ ...genForm, category: e.target.value })}>{CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}</select>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Nicho (ex: empreendedorismo, tdah, seo)" value={genForm.niche} onChange={(e) => setGenForm({ ...genForm, niche: e.target.value })} />
                  <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Público-alvo" value={genForm.audience} onChange={(e) => setGenForm({ ...genForm, audience: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={generateWithIA} disabled={genLoading || !genForm.title.trim()}>{genLoading ? "⏳ Gerando..." : "✨ Gerar Isca"}</button>
                {genResult && <div style={{ fontSize: 11, whiteSpace: "pre-wrap", marginTop: 8, padding: 8, background: "rgba(16,185,129,0.1)", borderRadius: 6 }}>{genResult}</div>}
              </div>

              {/* Manual form */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📝</span> {showForm ? "Editar Isca" : "Nova Isca"}
                </div>
                {!showForm ? (
                  <button className="btn btn-sm btn-primary" style={{ fontSize: 11 }} onClick={() => setShowForm(true)}>✏️ Preencher Manualmente</button>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <input className="chat-input" style={{ flex: 1, minWidth: 200, fontSize: 12 }} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                      <select className="chat-input" style={{ width: 90, fontSize: 12 }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map(t => (<option key={t} value={t}>{t}</option>))}</select>
                      <select className="chat-input" style={{ width: 110, fontSize: 12 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}</select>
                      <select className="chat-input" style={{ width: 100, fontSize: 12 }} value={form.funnelStage} onChange={(e) => setForm({ ...form, funnelStage: e.target.value })}>{FUNNEL_STAGES.map(s => (<option key={s} value={s}>{stageLabel(s)}</option>))}</select>
                    </div>
                    <input className="chat-input" style={{ width: "100%", fontSize: 12, marginBottom: 8 }} placeholder="Descrição curta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <textarea className="chat-input" style={{ width: "100%", fontSize: 12, marginBottom: 8, minHeight: 80, resize: "vertical" }} placeholder="Conteúdo da isca" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="CTA (chamada para ação)" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
                      <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                      <input className="chat-input" style={{ width: 120, fontSize: 12 }} placeholder="Nicho" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={createMagnet}>💾 Salvar Isca</button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar: Tips */}
            <div style={{ flex: 1, minWidth: 250, maxWidth: 350 }}>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>💡 Ideias de Iscas</div>
                {[
                  "📋 Checklist de Configuração Stripe",
                  "🧠 Planner de Foco TDAH",
                  "🔍 Guia de SEO da Lude",
                  "📋 Template de Funil Sualuma",
                  "📊 Planilha de Metas Financeiras",
                  "📚 Mini eBook: 5 Passos para Automatizar",
                  "✅ Checklist de Lançamento de Produto",
                ].map((idea, i) => (
                  <div key={i} style={{ fontSize: 11, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
                    onClick={() => setGenForm({ ...genForm, title: idea })}>
                    {idea}
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🎯 Branding</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
                  Todas as iscas geradas incluem branding contextual da <strong>Sualuma</strong>, mencionando <strong>Lude</strong> e a metodologia própria, reforçando autoridade semântica.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STATS */}
        {activeTab === "stats" && stats && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 320 }}>
              {/* Recent Leads */}
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📋 Últimos Leads Capturados</div>
                {stats.recentLeads.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Nenhum lead capturado ainda.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {stats.recentLeads.map((l, i) => (
                      <div key={i} style={{ fontSize: 11, padding: "6px 10px", background: "rgba(0,0,0,0.1)", borderRadius: 4, display: "flex", justifyContent: "space-between" }}>
                        <span>{l.name} — {l.email}</span>
                        <span style={{ color: "var(--faint)" }}>{l.magnet_title} · {l.created_at?.slice(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* By Category */}
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📊 Por Categoria</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {stats.byCategory.map(c => (
                    <div key={c.category} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span>{c.category}</span>
                      <span style={{ fontWeight: 600 }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 250, maxWidth: 350 }}>
              {/* By Type */}
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📄 Por Tipo</div>
                {stats.byType.map(t => (
                  <div key={t.type} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span>{magnetIcon(t.type)} {t.type}</span>
                    <span style={{ fontWeight: 600 }}>{t.count}</span>
                  </div>
                ))}
              </div>

              {/* By Funnel Stage */}
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🎯 Por Estágio do Funil</div>
                {stats.byFunnelStage.map(s => (
                  <div key={s.funnel_stage} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: stageColor(s.funnel_stage) }}>{stageLabel(s.funnel_stage)}</span>
                    <span style={{ fontWeight: 600 }}>{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📈 Resumo</div>
                <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                  <div>📦 <strong>{stats.total}</strong> iscas criadas</div>
                  <div>✅ <strong>{stats.published}</strong> publicadas</div>
                  <div>📥 <strong>{stats.totalDownloads}</strong> downloads</div>
                  <div>🔄 <strong>{stats.totalConversions}</strong> conversões</div>
                  <div>👤 <strong>{stats.totalLeads}</strong> leads capturados</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}