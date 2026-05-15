"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import Link from "next/link";
import API_BASE from "@/lib/api";

const API_URL = API_BASE;

type Diagnosis = {
  summary: string;
  topGap: string;
  topOpportunity: string;
  conversionPriority: string;
  retentionPriority: string;
  dailySalesPriority: string;
  abandonmentReduction: string;
  priorityActions: string[];
  dailyPriority: string;
};

type AgentContributions = Record<string, string>;

type CollectiveIntelligence = {
  googleSharesWithMarketing: string;
  financeiroPrioritizes: string;
  uxDetectsAbandonment: string;
  tarefasActions: string;
  miaSupervision: string;
};

const AGENTS = [
  { id: "financial", icon: "💰", label: "Financeiro", desc: "Metas, receita, MRR" },
  { id: "ux", icon: "🎨", label: "UX", desc: "Experiência e atrito" },
  { id: "organic", icon: "📱", label: "Marketing Orgânico", desc: "SEO e conteúdo" },
  { id: "paid", icon: "💸", label: "Marketing Pago", desc: "Tráfego pago" },
  { id: "google", icon: "🔍", label: "Google Intelligence", desc: "Tendências" },
  { id: "tarefas", icon: "✅", label: "Tarefas", desc: "Ações executáveis" },
  { id: "mia", icon: "🧠", label: "Mia", desc: "Supervisão geral" },
];

export default function FunilSualuma() {
  const { user, isLoaded } = useSession();

  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [contributions, setContributions] = useState<AgentContributions>({});
  const [collective, setCollective] = useState<CollectiveIntelligence | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDeliberation, setShowDeliberation] = useState(false);
  const [deliberation, setDeliberation] = useState<{ round1: AgentContributions; round2: AgentContributions } | null>(null);

  const runDiagnosis = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/agents/funnel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-user-email": user.email || "" },
        body: JSON.stringify({
          message: context || "Diagnóstico geral do funil da Sualuma",
          context: context || "Negócio: MicroSaaS de agentes IA. Produtos: sites, conteudo, automacoes. Planos: Lite (R$49), Premium, Pro. Publico: pequenos empresarios brasileiros.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
        setContributions(data.agentContributions || {});
        setCollective(data.collectiveIntelligence || null);
        setDeliberation(data.deliberation || null);
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
        <Link href="/login" className="btn btn-primary">Login</Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, right: -180, background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)" }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: -80, left: -80, background: "radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow"><span>🔄</span><span>Coordenação Estratégica Multigentes</span></div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>Funil Sualuma</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              7 agentes conversam, deliberam entre si e geram diagnóstico unificado com prioridades de conversão, retenção e vendas diárias.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/campaign-agent" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>📢 Campaign Agent</Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>🧠 Mia Brain</Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Contexto opcional (ex: 'Foco em aumentar conversao de planos')" value={context} onChange={(e) => setContext(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runDiagnosis()} />
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
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)" }}>Consultando 7 agentes em 2 rodadas de deliberação...</div>
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

              {/* Priority Dimensions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <PriorityCard icon="📈" label="Aumentar Conversão" value={diagnosis.conversionPriority} color="#818cf8" />
                <PriorityCard icon="🔄" label="Aumentar Retenção" value={diagnosis.retentionPriority} color="#22c55e" />
                <PriorityCard icon="💰" label="Vendas Diárias" value={diagnosis.dailySalesPriority} color="#eab308" />
                <PriorityCard icon="🚪" label="Reduzir Abandono" value={diagnosis.abandonmentReduction} color="#ef4444" />
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

            {/* Collective Intelligence */}
            {collective && (
              <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🧠</span> Inteligência Coletiva
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <CollectiveRow icon="🔍" label="Google → Marketing" value={collective.googleSharesWithMarketing} />
                  <CollectiveRow icon="💰" label="Financeiro prioriza" value={collective.financeiroPrioritizes} />
                  <CollectiveRow icon="🎨" label="UX detecta abandono" value={collective.uxDetectsAbandonment} />
                  <CollectiveRow icon="✅" label="Tarefas geradas" value={collective.tarefasActions} />
                  <CollectiveRow icon="🧠" label="Supervisão Mia" value={collective.miaSupervision} />
                </div>
              </div>
            )}

            {/* Agent Contributions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {AGENTS.map((agent) => (
                <div key={agent.id} className="card" style={{
                  flex: "1 1 170px", minWidth: 170, padding: 14,
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

            {/* Deliberation Viewer */}
            {deliberation && (
              <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>💬</span> Deliberação entre Agentes
                  </div>
                  <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={() => setShowDeliberation(!showDeliberation)}>
                    {showDeliberation ? "Ocultar" : "Mostrar"} detalhes
                  </button>
                </div>
                {showDeliberation && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {AGENTS.map((agent) => {
                      const r1 = deliberation.round1?.[agent.id];
                      const r2 = deliberation.round2?.[agent.id];
                      if (!r1 && !r2) return null;
                      return (
                        <div key={agent.id} style={{ padding: 12, background: "rgba(0,0,0,0.15)", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            {agent.icon} {agent.label}
                          </div>
                          {r1 && (
                            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
                              <span style={{ color: "var(--faint)" }}>Rodada 1:</span> {r1.slice(0, 200)}
                            </div>
                          )}
                          {r2 && r2 !== r1 && (
                            <div style={{ fontSize: 10, color: "#6ee7b7" }}>
                              <span style={{ color: "var(--faint)" }}>Rodada 2 (refinada):</span> {r2.slice(0, 250)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div style={{ fontSize: 10, color: "var(--faint)", textAlign: "center", padding: "8px 0" }}>
              7 agentes · 2 rodadas de deliberação · Diagnóstico gerado por IA · Ações viram tarefas no Mia Brain
            </div>
          </>
        )}
      </main>
    </>
  );
}

function PriorityCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  if (!value) return null;
  return (
    <div className="card" style={{ flex: "1 1 200px", padding: "10px 14px", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

function CollectiveRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ padding: "8px 12px", background: "rgba(99,102,241,0.05)", borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}