"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type QueueItem = {
  id: number;
  clerk_id: string;
  title: string;
  content: string | null;
  excerpt: string;
  category: string;
  tags: string;
  seo_score: number;
  status: string;
  idea_id: number | null;
  lead_magnet: string;
  branding_applied: number;
  image_descriptions: string;
  approved_by: string | null;
  approved_at: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
};

type BlogStats = {
  totalPosts: number;
  published: number;
  drafts: number;
  todayPublished: number;
  canAutoPublish: boolean;
  remainingToday: number;
  maxPerDay: number;
  minimumForAuto: number;
  categories: Record<string, number>;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  status: string;
  tags: string;
  date: string;
  readTime: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "border-yellow-500/40 bg-yellow-500/10",
  reviewed: "border-blue-500/40 bg-blue-500/10",
  published: "border-green-500/40 bg-green-500/10",
  revision: "border-red-500/40 bg-red-500/10",
};

export default function BlogAgent() {
  const { user, isLoaded } = useSession();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState<"queue" | "generate">("queue");
  const [generateForm, setGenerateForm] = useState({ title: "", niche: "Tecnologia", keywords: "" });
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

  const fetchQueue = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/blog/queue`); if (res.ok) setQueue(await res.json()); } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/blog/stats`); if (res.ok) setStats(await res.json()); } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) { fetchQueue(); fetchStats(); }
  }, [isLoaded, user, fetchQueue, fetchStats]);

  const generateArticle = async () => {
    if (!user || !generateForm.title) return;
    setGenerating(true);
    setResult("");
    try {
      const res = await fetch(`${API_URL}/api/agents/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-email": user.email || "" },
        body: JSON.stringify({ action: "generate", title: generateForm.title, niche: generateForm.niche, keywords: generateForm.keywords, clerkId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.post?.content || "Artigo gerado!");
        fetchQueue();
        fetchStats();
      } else {
        setResult("⚠️ " + (data.error || "Erro ao gerar artigo."));
      }
    } catch (err) { console.error("[BlogAgent] Erro:", err); setResult("⚠️ Erro de conexão."); }
    finally { setGenerating(false); }
  };

  const reviewArticle = async (item: QueueItem) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action: "review", content: item.content || item.excerpt, title: item.title, queueId: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.feedback);
        if (data.approved) setSelectedItem({ ...item, status: "reviewed" });
        fetchQueue();
      }
    } catch {}
    setLoading(false);
  };

  const publishBatch = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/blog/publish`, { method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.id } });
      const data = await res.json();
      setResult(data.message || (data.success ? `✅ ${data.published} artigos publicados!` : ""));
      if (data.success) { fetchQueue(); fetchStats(); }
    } catch {}
    setLoading(false);
  };

  const updateQueueStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_URL}/api/blog/queue/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchQueue();
    } catch {}
  };

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

  const pendingCount = queue.filter(q => q.status === "draft").length;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, right: -150, background: "radial-gradient(circle, rgba(234,179,8,0.1), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>✍️</span><span>Blog Agent — Copy + Publicação</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Blog Agent</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Crie artigos completos com IA, revise, agende e publique até 5x/dia. Mínimo 20 artigos no total para ativar publicação automática.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/ideias-conteudo" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>💡 Ideias</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT — Stats + Tabs */}
        <div style={{ flex: 2, minWidth: 320 }}>
          {/* Stats */}
          {stats && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div className="card" style={{ flex: 1, minWidth: 100, padding: 12, borderLeft: "4px solid #22c55e" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{stats.published}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Publicados</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 100, padding: 12, borderLeft: "4px solid #eab308" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#eab308" }}>{stats.totalPosts}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Total</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 100, padding: 12, borderLeft: "4px solid #818cf8" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#818cf8" }}>{stats.remainingToday}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Restantes hoje</div>
              </div>
              <div className="card" style={{ flex: 1, minWidth: 100, padding: 12, borderLeft: "4px solid var(--indigo)" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{pendingCount}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>Na fila</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button className={`btn btn-sm ${activeTab === "queue" ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveTab("queue")}>📋 Fila ({queue.length})</button>
            <button className={`btn btn-sm ${activeTab === "generate" ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveTab("generate")}>✍️ Gerar Artigo</button>
          </div>

          {activeTab === "generate" && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>✍️ Gerar Novo Artigo</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Título do artigo" value={generateForm.title} onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })} />
                <input className="chat-input" style={{ width: 150, fontSize: 12 }} placeholder="Nicho" value={generateForm.niche} onChange={(e) => setGenerateForm({ ...generateForm, niche: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Palavras-chave (separadas por vírgula)" value={generateForm.keywords} onChange={(e) => setGenerateForm({ ...generateForm, keywords: e.target.value })} />
                <button className="btn btn-primary" style={{ fontSize: 11, whiteSpace: "nowrap" }} onClick={generateArticle} disabled={generating || !generateForm.title}>
                  {generating ? "⏳ Gerando..." : "🚀 Gerar Artigo"}
                </button>
              </div>
              <div style={{ fontSize: 10, color: "var(--faint)" }}>Gera artigo de 1000-1200 palavras com introdução, desenvolvimento, CTA e fechamento.</div>
            </div>
          )}

          {/* Queue */}
          {queue.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontSize: "1rem", marginBottom: 4 }}>Fila vazia</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Gere seu primeiro artigo para começar.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("generate")}>✍️ Gerar Artigo</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {queue.map((item) => (
                <div key={item.id} className={`card ${STATUS_COLORS[item.status] || ""}`} style={{ padding: "12px 16px", cursor: "pointer" }} onClick={() => setSelectedItem(item)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {item.title}
                        <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{item.category}</span>
                        <span className="badge" style={{
                          fontSize: 9,
                          background: item.status === "published" ? "rgba(34,197,94,0.15)" : item.status === "reviewed" ? "rgba(59,130,246,0.15)" : item.status === "revision" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                          color: item.status === "published" ? "#22c55e" : item.status === "reviewed" ? "#60a5fa" : item.status === "revision" ? "#ef4444" : "#eab308",
                        }}>{item.status}</span>
                        {item.seo_score > 0 && <span className="badge" style={{ fontSize: 9, background: item.seo_score >= 80 ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)", color: item.seo_score >= 80 ? "#22c55e" : "#eab308" }}>SEO {item.seo_score}</span>}
                      </div>
                      {item.excerpt && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{item.excerpt.slice(0, 120)}...</div>}
                      {item.tags && <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 4 }}>🏷️ {item.tags}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {item.status === "draft" && (
                        <>
                          <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => reviewArticle(item)} disabled={loading}>🔍 Revisar</button>
                          <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }} onClick={() => updateQueueStatus(item.id, "reviewed")}>✅ Aprovar</button>
                        </>
                      )}
                      {item.status === "reviewed" && (
                        <button className="btn btn-sm" style={{ fontSize: 9, padding: "4px 6px", background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }} onClick={() => updateQueueStatus(item.id, "draft")}>↩ Voltar</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Controls + Output */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 380 }}>
          {/* Publish controls */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🚀</span> Publicação Automática
            </div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
              {stats?.canAutoPublish
                ? `✅ Mínimo de ${stats.minimumForAuto} artigos atingido! Você pode publicar até ${stats.remainingToday} hoje.`
                : `⏳ Necessário mínimo ${stats?.minimumForAuto || 20} artigos no total para ativar. Atual: ${stats?.totalPosts || 0}.`}
            </p>
            <button
              className={`btn ${stats?.canAutoPublish ? "btn-primary" : "btn-ghost"}`}
              style={{ width: "100%", fontSize: 12 }}
              onClick={publishBatch}
              disabled={loading || !stats?.canAutoPublish}
            >
              {loading ? "⏳ Publicando..." : stats?.canAutoPublish ? `📨 Publicar (até ${stats.remainingToday})` : "🔒 Publicação bloqueada"}
            </button>
            {stats?.todayPublished !== undefined && stats?.maxPerDay && (
              <div style={{ marginTop: 8, fontSize: 10, color: "var(--faint)" }}>
                Hoje: {stats.todayPublished}/{stats.maxPerDay} publicados
                {stats.todayPublished > 0 && (
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(stats.todayPublished / stats.maxPerDay) * 100}%`, background: stats.todayPublished >= stats.maxPerDay ? "#ef4444" : "var(--grad)", borderRadius: 2 }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lead Magnet + Discord + Image Info */}
          {selectedItem && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>🧲</span> Detalhes do Artigo #{selectedItem.id}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                {selectedItem.lead_magnet && <div style={{ marginBottom: 4 }}>🧲 <strong>Lead Magnet:</strong> {selectedItem.lead_magnet}</div>}
                <div style={{ marginBottom: 4 }}>🏷️ <strong>Branding:</strong> {selectedItem.branding_applied ? '✅ Aplicado' : '❌ Não aplicado'}</div>
                {selectedItem.image_descriptions && <div style={{ marginBottom: 4 }}>🖼️ <strong>Imagens:</strong> {selectedItem.image_descriptions}</div>}
                {selectedItem.approved_by && <div style={{ marginBottom: 4 }}>✅ <strong>Aprovado por:</strong> {selectedItem.approved_by} em {selectedItem.approved_at}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="btn btn-sm" style={{ fontSize: 10, background: "rgba(88,101,242,0.15)", color: "#8b9cf7", border: "1px solid rgba(88,101,242,0.3)" }}
                  onClick={async () => {
                    await fetch(`${API_URL}/api/discord/approve`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ queueId: selectedItem.id }) });
                    setResult("✅ Enviado para aprovação no Discord!");
                  }}>
                  🚀 Enviar para Discord
                </button>
                <button className="btn btn-sm" style={{ fontSize: 10, background: "rgba(34,197,94,0.15)", color: "#6ee7b7", border: "1px solid rgba(34,197,94,0.3)" }}
                  onClick={async () => {
                    await fetch(`${API_URL}/api/discord/confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ queueId: selectedItem.id, approvedBy: user?.id }) });
                    setResult("✅ Aprovação registrada!");
                    fetchQueue();
                  }}>
                  ✅ Confirmar Aprovação
                </button>
              </div>
            </div>
          )}

          {/* Result output */}
          {result && (
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between" }}>
                <span>📄 Resultado</span>
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={() => setResult("")}>✕ Fechar</button>
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto", padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>
                {result}
              </div>
            </div>
          )}

          {/* Categories summary */}
          {stats?.categories && Object.keys(stats.categories).length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📊</span> Conteúdo por Categoria
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(stats.categories).map(([cat, count]) => (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                    <span>{cat}</span>
                    <span className="badge" style={{ fontSize: 10 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
