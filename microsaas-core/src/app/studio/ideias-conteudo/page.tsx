"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type ContentIdea = {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  category: string;
  financial_goal_id: number | null;
  goal_title: string | null;
  status: string;
  platform: string;
  seo_score: number;
  tags: string;
  keywords: string;
  created_at: string;
};

type FinancialGoal = {
  id: number;
  title: string;
  target_value: number;
  current_value: number;
  category: string;
  status: string;
};

const CATEGORIES = [
  { id: "acquisition", label: "🎯 Aquisição", desc: "Atrair novos clientes" },
  { id: "conversion", label: "📊 Conversão", desc: "Transformar leads em vendas" },
  { id: "retention", label: "🔄 Retenção", desc: "Manter clientes ativos" },
  { id: "upgrade", label: "⬆️ Upgrade", desc: "Aumentar ticket médio" },
];

const PLATFORMS = ["blog", "instagram", "linkedin", "email", "tiktok", "youtube"];

export default function IdeiasConteudo() {
  const { user, isLoaded } = useSession();

  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [suggestions, setSuggestions] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordResults, setKeywordResults] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", category: "acquisition", platform: "blog",
    financialGoalId: null as number | null,
  });
  const [showForm, setShowForm] = useState(false);

  const fetchIdeas = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/content/ideas`); if (res.ok) setIdeas(await res.json()); } catch {}
  }, []);

  const fetchGoals = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/financial/goals`); if (res.ok) setGoals(await res.json()); } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) { fetchIdeas(); fetchGoals(); }
  }, [isLoaded, user, fetchIdeas, fetchGoals]);

  const generateSuggestions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const finRes = await fetch(`${API_URL}/api/agents/financial`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action: "opportunities" }),
      });
      const finData = await finRes.json();
      if (finData.success) {
        const contentRes = await fetch(`${API_URL}/api/agents/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-email": user.email || "" },
          body: JSON.stringify({
            action: "blog",
            message: `Com base nas oportunidades abaixo, gere 5 ideias em JSON:\n\n${finData.response}\n\n[{"title":"","description":"","category":"","platform":""}]`,
          }),
        });
        const contentData = await contentRes.json();
        const content = contentData.response || contentData.content || "";
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            for (const idea of parsed) {
              await fetch(`${API_URL}/api/content/ideas`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clerkId: user.id, title: idea.title, description: idea.description, category: idea.category || "acquisition", platform: idea.platform || "blog" }),
              });
            }
            fetchIdeas();
          }
        } catch {}
        setSuggestions(content);
      }
    } catch (err) { console.error("[Ideias] Erro:", err); setSuggestions("⚠️ Erro."); }
    finally { setLoading(false); }
  };

  const runSeoAnalysis = async (ideaId?: number) => {
    if (!user) return;
    setSeoLoading(true);
    try {
      const targets = ideaId ? ideas.filter(i => i.id === ideaId) : ideas;
      const topics = targets.map(i => ({ title: i.title, description: i.description, category: i.category }));
      const res = await fetch(`${API_URL}/api/agents/google-seo`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action: "analyze", topics }),
      });
      const data = await res.json();
      if (data.success && data.data?.results) {
        for (const r of data.data.results) {
          const idea = targets.find(i => i.title === r.topic);
          if (idea) {
            await fetch(`${API_URL}/api/content/ideas/${idea.id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ seo_score: r.score, tags: r.tags?.join(", ") || "", keywords: r.primaryKeywords?.join(", ") || "" }),
            });
          }
        }
        fetchIdeas();
        setSuggestions(data.response);
      }
    } catch (err) { console.error("[SEO] Erro:", err); }
    finally { setSeoLoading(false); }
  };

  const generateKeywords = async () => {
    if (!user || !keywordInput.trim()) return;
    setSeoLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/google-seo`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action: "keywords", niche: keywordInput, topic: keywordInput }),
      });
      const data = await res.json();
      if (data.success) setKeywordResults(data.response);
    } catch {}
    setSeoLoading(false);
  };

  const createIdea = async () => {
    if (!user || !form.title) return;
    try {
      const res = await fetch(`${API_URL}/api/content/ideas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, ...form }),
      });
      if (res.ok) {
        const idea = await res.json();
        setIdeas((prev) => [idea, ...prev]);
        setForm({ title: "", description: "", category: "acquisition", platform: "blog", financialGoalId: null });
        setShowForm(false);
      }
    } catch {}
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/content/ideas/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchIdeas();
    } catch {}
  };

  const filteredIdeas = activeCategory === "all" ? ideas : ideas.filter((i) => i.category === activeCategory);
  const avgScore = ideas.length > 0 ? Math.round(ideas.reduce((s, i) => s + (i.seo_score || 0), 0) / ideas.length) : 0;

  if (!isLoaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} /></div>;

  if (!user) return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>Acesso Restrito</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Faça login para acessar.</p>
        <Link href="/login" className="btn btn-primary">Fazer Login</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 400, height: 400, top: -80, left: -120, background: "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)" }} />
      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>💡</span><span>Conteúdo + SEO Intelligence</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Ideias de Conteúdo</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>Gere pautas com IA, analise SEO, detecte keywords e publique artigos otimizados.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/blog-agent" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>✍️ Blog Agent</Link>
            <Link href="/studio/metas-financeiras" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>💰 Metas Financeiras</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>
      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 320 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <button className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveCategory("all")}>📋 Todas ({ideas.length})</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`btn btn-sm ${activeCategory === c.id ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveCategory(c.id)}>{c.label} ({ideas.filter((i) => i.category === c.id).length})</button>
            ))}
            <button className="btn btn-sm btn-primary" style={{ fontSize: 11, marginLeft: "auto" }} onClick={() => setShowForm(!showForm)}>{showForm ? "✕ Cancelar" : "+ Nova Ideia"}</button>
          </div>

          {showForm && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>✍️ Nova Ideia de Conteúdo</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <input className="chat-input" style={{ flex: 1, minWidth: 200, fontSize: 12 }} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <select className="chat-input" style={{ width: 150, fontSize: 12 }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}</select>
                <select className="chat-input" style={{ width: 130, fontSize: 12 }} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>{PLATFORMS.map((p) => (<option key={p} value={p}>{p}</option>))}</select>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                {goals.length > 0 && (
                  <select className="chat-input" style={{ width: 200, fontSize: 12 }} value={form.financialGoalId || ""} onChange={(e) => setForm({ ...form, financialGoalId: e.target.value ? parseInt(e.target.value) : null })}>
                    <option value="">Sem meta</option>
                    {goals.filter((g) => g.status === "active").map((g) => (<option key={g.id} value={g.id}>{g.title}</option>))}
                  </select>
                )}
              </div>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={createIdea}>✅ Criar</button>
            </div>
          )}

          {filteredIdeas.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
              <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Nenhuma ideia ainda</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Crie manualmente ou use a IA.</p>
              <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={generateSuggestions} disabled={loading}>{loading ? "⏳ Gerando..." : "🤖 Gerar com IA"}</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredIdeas.map((idea) => {
                const cat = CATEGORIES.find((c) => c.id === idea.category);
                const score = idea.seo_score || 0;
                return (
                  <div key={idea.id} className="card" style={{ padding: "14px 16px", borderLeft: `4px solid ${idea.category === "acquisition" ? "#22c55e" : idea.category === "conversion" ? "#eab308" : idea.category === "retention" ? "#818cf8" : "#a855f7"}`, opacity: idea.status === "published" ? 1 : idea.status === "draft" ? 0.8 : 0.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {idea.title}
                          <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{idea.platform}</span>
                          <span className="badge" style={{ fontSize: 9, background: score >= 80 ? "rgba(34,197,94,0.15)" : score >= 50 ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)", color: score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444" }}>SEO {score}/100</span>
                          <span className="badge" style={{ fontSize: 9, background: idea.status === "published" ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)", color: idea.status === "published" ? "#22c55e" : "#eab308" }}>{idea.status}</span>
                        </div>
                        {idea.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{idea.description}</div>}
                        <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                          <span>{cat?.label || idea.category}</span>
                          {idea.goal_title && <span>🎯 {idea.goal_title}</span>}
                          {idea.tags && <span>🏷️ {idea.tags}</span>}
                          {idea.keywords && <span>🔑 {idea.keywords}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "flex-start" }}>
                        <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => runSeoAnalysis(idea.id)} disabled={seoLoading} title="Analisar SEO">🔍 SEO</button>
                        {idea.status === "draft" && <button className="btn btn-sm" style={{ fontSize: 10, padding: "4px 8px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateStatus(idea.id, "published")}>✅ Publicar</button>}
                        <button className="btn btn-sm" style={{ fontSize: 10, padding: "4px 8px", background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => updateStatus(idea.id, "archived")}>🗑 Arquivar</button>
                      </div>
                    </div>
                    {score > 0 && <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${score}%`, background: score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444", borderRadius: 2 }} /></div></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 280, maxWidth: 380 }}>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><span>🤖</span> Gerar Ideias com IA</div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Agente financeiro + content creator.</p>
            <button className="btn btn-primary" style={{ width: "100%", fontSize: 12, marginBottom: 8 }} onClick={generateSuggestions} disabled={loading}>{loading ? "⏳ Gerando..." : "🚀 Gerar Ideias"}</button>
            <div style={{ fontSize: 10, color: "var(--faint)" }}>{ideas.length} ideias · {ideas.filter((i) => i.status === "published").length} publicadas · SEO médio {avgScore}</div>
          </div>

          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><span>🔍</span> Análise SEO</div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Avalie títulos, gere keywords e tags, otimize metadados.</p>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", fontSize: 11, marginBottom: 8 }} onClick={() => runSeoAnalysis()} disabled={seoLoading || ideas.length === 0}>
              {seoLoading ? "⏳ Analisando..." : "📊 Analisar Todas as Ideias"}
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="chat-input" style={{ flex: 1, fontSize: 11 }} placeholder="Nicho para keywords..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateKeywords()} />
              <button className="btn btn-sm btn-primary" style={{ fontSize: 10 }} onClick={generateKeywords} disabled={seoLoading || !keywordInput.trim()}>🔑</button>
            </div>
            {keywordResults && <div style={{ fontSize: 11, whiteSpace: "pre-wrap", marginTop: 8, padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 6, maxHeight: 200, overflow: "auto" }}>{keywordResults}</div>}
          </div>

          {suggestions && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span>📝</span> Resultados</div>
              <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>{suggestions}</div>
            </div>
          )}

          {goals.filter(g => g.status === "active").length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span>🎯</span> Metas Vinculáveis</div>
              {goals.filter(g => g.status === "active").map((g) => (
                <div key={g.id} style={{ fontSize: 11, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontWeight: 600 }}>{g.title}</div>
                  <div style={{ color: "var(--muted)" }}>R$ {g.current_value.toFixed(0)} / R$ {g.target_value.toFixed(0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
