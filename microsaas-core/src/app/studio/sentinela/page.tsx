"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type SentinelLog = {
  id: number;
  check_type: string;
  status: string;
  metric: string;
  value: number;
  threshold: number;
  severity: string;
  message: string;
  created_at: string;
};

type SentinelStats = {
  total: number;
  bySeverity: { severity: string; count: number }[];
  byType: { check_type: string; count: number }[];
  recentAnomalies: SentinelLog[];
};

type GrowthOpp = {
  id: number;
  type: string;
  title: string;
  description: string;
  potential_score: number;
  category: string;
  status: string;
  created_at: string;
};

type GrowthStats = {
  total: number;
  byType: { type: string; count: number }[];
  top: GrowthOpp[];
};

const severityColor: Record<string, string> = { critical: "#ef4444", warning: "#eab308", info: "#3b82f6", ok: "#22c55e" };

export default function Sentinela() {
  const { user, isLoaded } = useSession();

  const [activeTab, setActiveTab] = useState<"monitor" | "growth" | "control">("monitor");
  const [logs, setLogs] = useState<SentinelLog[]>([]);
  const [stats, setStats] = useState<SentinelStats | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [growthOpps, setGrowthOpps] = useState<GrowthOpp[]>([]);
  const [growthStats, setGrowthStats] = useState<GrowthStats | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [competitive, setCompetitive] = useState<any>(null);
  const [agentsPaused, setAgentsPaused] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchLogs = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/sentinel/history?limit=30`); if (res.ok) setLogs(await res.json()); } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/sentinel/stats`); if (res.ok) setStats(await res.json()); } catch {}
  }, []);

  const fetchGrowth = useCallback(async () => {
    try {
      const [oppsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/growth/opportunities?limit=20`),
        fetch(`${API_URL}/api/growth/stats`),
      ]);
      if (oppsRes.ok) setGrowthOpps(await oppsRes.json());
      if (statsRes.ok) setGrowthStats(await statsRes.json());
    } catch {}
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try { const res = await fetch(`${API_URL}/api/audit/logs?limit=20`); if (res.ok) setAuditLogs(await res.json()); } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) { fetchLogs(); fetchStats(); fetchGrowth(); fetchAuditLogs(); }
  }, [isLoaded, user, fetchLogs, fetchStats, fetchGrowth, fetchAuditLogs]);

  const runAll = async () => {
    setRunning(true);
    try {
      await fetch(`${API_URL}/api/sentinel/check`, { method: "POST" });
      await fetchLogs();
      await fetchStats();
      const res = await fetch(`${API_URL}/api/sentinel/analyze`, { method: "POST" });
      if (res.ok) { const d = await res.json(); setAnalysis(d.analysis); }
    } catch {}
    setRunning(false);
  };

  const runTrends = async () => {
    setTrendLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetch(`${API_URL}/api/growth/trends`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche: "microsaas, agentes IA, empreendedorismo digital" }) }),
        fetch(`${API_URL}/api/growth/competitive`, { method: "POST" }),
      ]);
      if (tRes.ok) { const d = await tRes.json(); setTrends(d.trends); }
      if (cRes.ok) { const d = await cRes.json(); setCompetitive(d.analysis); }
    } catch {}
    setTrendLoading(false);
  };

  const discoverOpps = async () => {
    try {
      const res = await fetch(`${API_URL}/api/growth/discover`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche: "microsaas, agentes IA" }) });
      if (res.ok) fetchGrowth();
    } catch {}
  };

  const pauseAll = async () => {
    await fetch(`${API_URL}/api/control/pause-all`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "Comando manual do painel" }) });
    setAgentsPaused(true);
  };

  const resumeAll = async () => {
    await fetch(`${API_URL}/api/control/resume-all`, { method: "POST" });
    setAgentsPaused(false);
  };

  if (!isLoaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} /></div>;

  if (!user) return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
        <Link href="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  const anomalyCount = logs.filter(l => l.severity === "critical" || l.severity === "warning").length;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, left: -180, background: "radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)" }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: -80, right: -80, background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>🚨</span><span>Centro de Monitoramento</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Sentinela 24h + Growth</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Monitoramento contínuo, detecção de anomalias, inteligência de mercado e controle central do ecossistema.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/memoria" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Archive Brain</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { id: "monitor" as const, label: "🚨 Monitor" },
            { id: "growth" as const, label: "📈 Growth" },
            { id: "control" as const, label: "🛡️ Controle" },
          ].map(t => (
            <button key={t.id} className={`btn btn-sm ${activeTab === t.id ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11 }} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
          {agentsPaused && <span className="badge" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 10, marginLeft: 8 }}>🛑 PAUSADO</span>}
        </div>

        {activeTab === "monitor" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={runAll} disabled={running}>{running ? "⏳" : "🔍 Executar Verificação"}</button>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={fetchLogs}>🔄 Atualizar</button>
            </div>

            {stats && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
                  <div style={{ fontSize: 9, color: "var(--faint)" }}>Total Checks</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 80, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{anomalyCount}</div>
                  <div style={{ fontSize: 9, color: "var(--faint)" }}>Anomalias</div>
                </div>
                {stats.bySeverity.map((s: any) => (
                  <div key={s.severity} className="card" style={{ flex: 1, minWidth: 60, padding: "8px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: severityColor[s.severity] || "var(--faint)" }}>{s.count}</div>
                    <div style={{ fontSize: 9, color: "var(--faint)" }}>{s.severity}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Analysis */}
            {analysis && (
              <div className="card" style={{ padding: 16, marginBottom: 16, borderLeft: `4px solid ${analysis.priority === "crítica" ? "#ef4444" : analysis.priority === "alta" ? "#eab308" : "#3b82f6"}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🧬 Diagnóstico de Anomalias</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>{analysis.diagnosis}</div>
                <div style={{ fontSize: 11, marginBottom: 8 }}>
                  <strong>Causas prováveis:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                    {analysis.possibleCauses?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div style={{ fontSize: 11 }}>
                  <strong>Plano de ação:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                    {analysis.actionPlan?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: "var(--faint)" }}>Prioridade: {analysis.priority}</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {logs.map((log) => (
                <div key={log.id} style={{
                  padding: "8px 12px", borderRadius: 4, fontSize: 11,
                  background: log.severity === "critical" ? "rgba(239,68,68,0.08)" : log.severity === "warning" ? "rgba(245,158,11,0.08)" : "rgba(0,0,0,0.05)",
                  borderLeft: `3px solid ${severityColor[log.severity] || "#a1a1aa"}`,
                  display: "flex", justifyContent: "space-between", gap: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{log.check_type}</span>: {log.message}
                  </div>
                  <div style={{ flexShrink: 0, color: "var(--faint)" }}>
                    {log.created_at?.slice(0, 16)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "growth" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 320 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={runTrends} disabled={trendLoading}>{trendLoading ? "⏳" : "📊 Analisar Tendências"}</button>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={discoverOpps}>💡 Descobrir Oportunidades</button>
              </div>

              {trends && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📊 Tendências de Mercado</div>
                  {trends.trends?.map((t: any, i: number) => (
                    <div key={i} style={{ fontSize: 11, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontWeight: 600 }}>{t.trend}</span>
                      <span className="badge" style={{ fontSize: 9, marginLeft: 6, background: t.momentum === "alto" ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)", color: t.momentum === "alto" ? "#22c55e" : "#eab308" }}>{t.momentum}</span>
                      <div style={{ color: "var(--muted)", marginTop: 2 }}>{t.impact}</div>
                    </div>
                  ))}
                  {trends.keywordsEmergentes && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>🔑 Keywords Emergentes</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {trends.keywordsEmergentes.map((k: string, i: number) => (
                          <span key={i} className="badge" style={{ fontSize: 9, background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {trends.sugestoesConteudo && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>📝 Pautas Sugeridas</div>
                      {trends.sugestoesConteudo.map((s: string, i: number) => (
                        <div key={i} style={{ fontSize: 11, padding: "2px 0" }}>• {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {competitive && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔍 Inteligência Competitiva</div>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>{competitive.posicionamento}</div>
                  <div style={{ fontSize: 11, marginBottom: 6 }}><strong>Diferenciais:</strong></div>
                  <ul style={{ fontSize: 11, margin: "4px 0", paddingLeft: 20 }}>
                    {competitive.diferenciais?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                  <div style={{ fontSize: 11, marginBottom: 6 }}><strong>Movimentos Estratégicos:</strong></div>
                  <ul style={{ fontSize: 11, margin: "4px 0", paddingLeft: 20 }}>
                    {competitive.movimentosEstrategicos?.map((m: string, i: number) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}

              {/* Opportunities */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>💡 Oportunidades ({growthOpps.length})</div>
                {growthOpps.map((opp) => (
                  <div key={opp.id} style={{ fontSize: 11, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600 }}>{opp.title}</span>
                      <span style={{ color: opp.potential_score > 70 ? "#22c55e" : opp.potential_score > 40 ? "#eab308" : "#a1a1aa" }}>★ {opp.potential_score}</span>
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 2 }}>{opp.description}</div>
                    <div style={{ color: "var(--faint)", marginTop: 2, display: "flex", gap: 6 }}>
                      <span className="badge" style={{ fontSize: 8 }}>{opp.type}</span>
                      <span className="badge" style={{ fontSize: 8 }}>{opp.category}</span>
                      <span className="badge" style={{ fontSize: 8 }}>{opp.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 250 }}>
              {growthStats && (
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📊 Growth Stats</div>
                  <div style={{ fontSize: 11, lineHeight: 1.8 }}>
                    <div>💡 <strong>{growthStats.total}</strong> oportunidades</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", marginBottom: 4 }}>Por Tipo</div>
                    {growthStats.byType.map((t: any) => (
                      <div key={t.type} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "2px 0" }}>
                        <span>{t.type}</span>
                        <span style={{ fontWeight: 600 }}>{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card" style={{ padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🏆 Top Oportunidades</div>
                {growthStats?.top?.map((opp: GrowthOpp, i: number) => (
                  <div key={i} style={{ fontSize: 10, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <strong>{opp.title}</strong> ★{opp.potential_score}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "control" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div className="card" style={{ padding: 16, marginBottom: 16, borderLeft: `4px solid ${agentsPaused ? "#ef4444" : "#22c55e"}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🛡️</span> Status dos Agentes
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: agentsPaused ? "#ef4444" : "#22c55e", marginBottom: 12 }}>
                  {agentsPaused ? "🛑 PAUSADOS" : "✅ ATIVOS"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-sm" style={{ fontSize: 11, background: agentsPaused ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: agentsPaused ? "#22c55e" : "#ef4444", border: `1px solid ${agentsPaused ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}
                    onClick={agentsPaused ? resumeAll : pauseAll}>
                    {agentsPaused ? "▶️ Retomar Todos" : "🛑 Pausar Todos"}
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📋 Regras de Governança</div>
                <ul style={{ fontSize: 11, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                  <li>Nenhuma ação financeira crítica sem approval</li>
                  <li>Nenhuma publicação automática sem revisão</li>
                  <li>Nenhuma alteração de infraestrutura autônoma</li>
                  <li>Nenhuma exclusão de dados sem confirmação</li>
                  <li>Anti-loop: máx 3 ações consecutivas por agente</li>
                  <li>Todas as decisões registradas em audit_logs</li>
                </ul>
              </div>
            </div>

            <div style={{ flex: 2, minWidth: 320 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📋 Últimas Ações de Auditoria</div>
                {auditLogs.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {auditLogs.slice(0, 15).map((log: any) => (
                      <div key={log.id} style={{
                        padding: "6px 10px", borderRadius: 4, fontSize: 11,
                        background: log.status === "error" ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.05)",
                        borderLeft: `3px solid ${log.status === "error" ? "#ef4444" : log.status === "success" ? "#22c55e" : "#a1a1aa"}`,
                      }}>
                        <div style={{ fontWeight: 600 }}>{log.action}</div>
                        <div style={{ color: "var(--muted)", fontSize: 10 }}>
                          {log.entity_type} #{log.entity_id} · {log.actor}
                          <span style={{ float: "right" }}>{log.created_at?.slice(0, 16)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>Nenhum log de auditoria registrado ainda.</div>
                )}
                <div style={{ marginTop: 12, fontSize: 11, color: "var(--muted)" }}>
                  <strong>Limites de Autonomia:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                    <li>PAUSE ALL AGENTS: botão de emergência acima</li>
                    <li>Agentes não podem executar ações destrutivas</li>
                    <li>Toda ação crítica requer approval via Discord</li>
                    <li>Máximo 3 tentativas de automação antes de escalar para admin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}