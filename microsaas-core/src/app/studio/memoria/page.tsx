"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type MemoryEntry = {
  id: number;
  category: string;
  title: string;
  content: string;
  tags: string;
  score: number;
  source: string;
  created_at: string;
};

type LearningStat = {
  agent_id: string;
  feature: string;
  value: string;
  score: number;
  count: number;
  last_seen: string;
};

export default function Memoria() {
  const { user, isLoaded } = useSession();

  const [archive, setArchive] = useState<MemoryEntry[]>([]);
  const [strategic, setStrategic] = useState<MemoryEntry[]>([]);
  const [patterns, setPatterns] = useState<{ word: string; count: number }[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"archive" | "strategic" | "learning">("archive");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchArchive = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      params.set("limit", "30");
      const res = await fetch(`${API_URL}/api/memory/recall?${params}`);
      if (res.ok) setArchive(await res.json());
    } catch {}
    setLoading(false);
  }, [search, category]);

  const fetchStrategic = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/memory/strategic?limit=10`);
      if (res.ok) setStrategic(await res.json());
    } catch {}
  }, []);

  const fetchPatterns = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/memory/patterns?category=${category || 'all'}`);
      if (res.ok) setPatterns(await res.json());
    } catch {}
  }, [category]);

  const fetchLearning = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/learning/stats`);
      if (res.ok) setLearningStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchArchive();
      fetchStrategic();
      fetchPatterns();
      fetchLearning();
    }
  }, [isLoaded, user, fetchArchive, fetchStrategic, fetchPatterns, fetchLearning]);

  const categoryColors: Record<string, string> = {
    governance: "#ef4444", decision: "#818cf8", strategy: "#22c55e",
    campaign: "#a855f7", content: "#eab308", learning: "#3b82f6",
  };

  if (!isLoaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} /></div>;

  if (!user) return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <Link href="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 450, height: 450, top: -100, right: -150, background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>🧠</span><span>Memória de Longo Prazo</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Archive Brain</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Memória persistente do ecossistema: decisões, estratégias, aprovações e aprendizado operacional dos agentes.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/sentinela" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🚨 Sentinela</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { id: "archive" as const, label: "🗂️ Arquivo" },
            { id: "strategic" as const, label: "⭐ Estratégica" },
            { id: "learning" as const, label: "🤖 Aprendizado" },
          ].map(t => (
            <button key={t.id} className={`btn btn-sm ${activeTab === t.id ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {activeTab === "archive" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Buscar na memória..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="chat-input" style={{ width: 150, fontSize: 12 }} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas categorias</option>
                <option value="governance">🛡️ Governança</option>
                <option value="decision">📋 Decisões</option>
                <option value="strategy">🎯 Estratégia</option>
                <option value="campaign">📢 Campanhas</option>
                <option value="content">✍️ Conteúdo</option>
                <option value="learning">🤖 Aprendizado</option>
              </select>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={fetchArchive}>🔍 Buscar</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {archive.map((entry) => (
                <div key={entry.id} className="card" style={{ padding: "12px 16px", borderLeft: `4px solid ${categoryColors[entry.category] || "#a1a1aa"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {entry.title}
                        <span className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>{entry.category}</span>
                        <span className="badge" style={{ fontSize: 9, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>★ {entry.score.toFixed(1)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{entry.content}</div>
                      <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 4 }}>🧠 {entry.source} · {entry.created_at?.slice(0, 10)} {entry.tags && `· 🏷️ ${entry.tags}`}</div>
                    </div>
                  </div>
                </div>
              ))}
              {archive.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", padding: 16 }}>Nenhuma memória encontrada.</div>}
            </div>
          </>
        )}

        {activeTab === "strategic" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>⭐ Memória Estratégica</div>
              {strategic.map((entry) => (
                <div key={entry.id} className="card" style={{ padding: "12px 16", marginBottom: 8, borderLeft: `4px solid ${categoryColors[entry.category] || "#a1a1aa"}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{entry.content}</div>
                  <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 2 }}>★ {entry.score.toFixed(1)} · {entry.category} · {entry.created_at?.slice(0, 10)}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📊 Padrões Detectados</div>
                {patterns.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span>{p.word}</span>
                    <span style={{ fontWeight: 600, color: "#818cf8" }}>{p.count}x</span>
                  </div>
                ))}
                {patterns.length === 0 && <div style={{ fontSize: 11, color: "var(--muted)" }}>Sem padrões ainda.</div>}
              </div>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📈 Score de Memória</div>
                <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                  <div>📦 <strong>{archive.length}</strong> entradas no arquivo</div>
                  <div>⭐ <strong>{strategic.length}</strong> entradas estratégicas</div>
                  <div>📊 <strong>{patterns.length}</strong> padrões detectados</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "learning" && learningStats && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 300 }}>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🤖 Estatísticas de Aprendizado</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#818cf8" }}>{learningStats.totalEntries}</div>
                    <div style={{ fontSize: 9, color: "var(--faint)" }}>Preferências</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🏆 Top Features</div>
                {learningStats.topFeatures.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span>{f.agent_id} · {f.feature} ({f.count}x)</span>
                    <span style={{ fontWeight: 600, color: "#22c55e" }}>★ {f.avg_score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 250 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🔄 Recentes</div>
                {learningStats.recent.map((r: any, i: number) => (
                  <div key={i} style={{ fontSize: 10, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "#818cf8" }}>{r.agent_id}</span> · {r.feature}: {r.value} <span style={{ color: "var(--faint)" }}>(★{r.score})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}