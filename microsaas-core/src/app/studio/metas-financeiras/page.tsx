"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type FinancialGoal = {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  category: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

type FinancialMetrics = {
  mrr: number;
  totalRevenue: number;
  totalUsers: number;
  payingUsers: number;
  freeUsers: number;
  conversionRate: number;
  planDistribution: Record<string, number>;
  fetchedAt: string;
};

const ACTIONS = [
  { id: "analyze", label: "📊 Analisar", desc: "Diagnóstico completo" },
  { id: "opportunities", label: "💰 Oportunidades", desc: "Receita não explorada" },
  { id: "goals", label: "🎯 Metas", desc: "Sugerir novas metas" },
  { id: "report", label: "📈 Relatório", desc: "Relatório executivo" },
];

const CATEGORY_ICONS: Record<string, string> = {
  revenue: "💰",
  conversion: "📊",
  retention: "🔄",
  acquisition: "🎯",
  upgrade: "⬆️",
};

export default function MetasFinanceiras() {
  const { user, isLoaded } = useUser();

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState("");
  const [activeAction, setActiveAction] = useState("analyze");
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const [goalForm, setGoalForm] = useState({ title: "", description: "", targetValue: 0, category: "revenue" });
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/agents/financial`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ action: "analyze" }),
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch {}
  }, [user]);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/financial/goals`);
      if (res.ok) setGoals(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchMetrics();
      fetchGoals();
    }
  }, [isLoaded, user, fetchMetrics, fetchGoals]);

  const callFinancialAgent = useCallback(async (action: string, msg?: string) => {
    if (!user) return;
    setLoading(true);
    setActiveAction(action);
    try {
      const res = await fetch(`${API_URL}/api/agents/financial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({
          action: msg ? "chat" : action,
          message: msg || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAgentResponse(data.response);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("[Financeiro] Erro:", err);
      setAgentResponse("⚠️ Erro de conexão com o agente financeiro.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createGoal = async () => {
    if (!user || !goalForm.title) return;
    try {
      const res = await fetch(`${API_URL}/api/financial/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          title: goalForm.title,
          description: goalForm.description,
          targetValue: goalForm.targetValue,
          category: goalForm.category,
        }),
      });
      if (res.ok) {
        const goal = await res.json();
        setGoals((prev) => [goal, ...prev]);
        setGoalForm({ title: "", description: "", targetValue: 0, category: "revenue" });
        setShowGoalForm(false);
      }
    } catch {}
  };

  const runDiagnosis = async () => {
    if (!user) return;
    setDiagnosisLoading(true);
    try {
      const finRes = await fetch(`${API_URL}/api/agents/financial`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({ action: "analyze" }),
      });
      const finData = await finRes.json();

      if (finData.success) {
        const googleRes = await fetch(`${API_URL}/api/agents/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body: JSON.stringify({
            action: "analyze",
            financialData: finData.metrics,
          }),
        });
        const googleData = await googleRes.json();
        setDiagnosis(googleData.success ? googleData.response : "Diagnóstico não disponível.");
      }
    } catch (err) {
      console.error("[Diagnóstico] Erro:", err);
      setDiagnosis("⚠️ Erro ao gerar diagnóstico unificado.");
    } finally {
      setDiagnosisLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !user) return;
    setChatResponse("");
    await callFinancialAgent("chat", chatInput);
    setChatInput("");
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

  const progressPct = (goals.filter(g => g.status === "active").length / Math.max(1, goals.length)) * 100;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -120, right: -180, background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)" }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: -80, left: -100, background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow">
              <span>💰</span>
              <span>Agente Financeiro Inteligente</span>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>
              Metas Financeiras
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>
              Acompanhe receitas, defina metas, detecte oportunidades e conecte finanças ao conteúdo.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/studio/ideias-conteudo" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
              💡 Ideias de Conteúdo
            </Link>
            <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
              🧠 Mia Brain
            </Link>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1 }}>

        {/* Metrics Row */}
        {metrics && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, borderLeft: "4px solid #22c55e" }}>
              <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>MRR</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>R$ {metrics.mrr.toFixed(0)}</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, borderLeft: "4px solid var(--indigo)" }}>
              <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>Receita Total</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>R$ {metrics.totalRevenue.toFixed(0)}</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, borderLeft: "4px solid #eab308" }}>
              <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>Conversão</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#eab308" }}>{metrics.conversionRate}%</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{metrics.payingUsers} de {metrics.totalUsers} usuários</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 140, padding: 16, borderLeft: "4px solid #a855f7" }}>
              <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1 }}>Metas Ativas</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#a855f7" }}>{goals.filter(g => g.status === "active").length}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

          {/* LEFT — Agent Panel */}
          <div style={{ flex: 1, minWidth: 300, maxWidth: 420 }}>
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🤖</span> Agente Financeiro
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    className={`btn btn-sm ${activeAction === a.id ? "btn-primary" : "btn-ghost"}`}
                    style={{ fontSize: 11 }}
                    onClick={() => callFinancialAgent(a.id)}
                    disabled={loading}
                    title={a.desc}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: 12 }}>
                  <div className="shimmer" style={{ height: 10, width: "90%", marginBottom: 6, borderRadius: 6 }} />
                  <div className="shimmer" style={{ height: 10, width: "65%", marginBottom: 6, borderRadius: 6 }} />
                  <div className="shimmer" style={{ height: 10, width: "80%", borderRadius: 6 }} />
                </div>
              ) : agentResponse ? (
                <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>
                  {agentResponse}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", padding: 8 }}>
                  Clique em uma ação para começar a análise financeira.
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>💬</span> Pergunte ao agente
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  className="chat-input"
                  style={{ flex: 1, fontSize: 12 }}
                  placeholder="Ex: Qual meu MRR atual?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  disabled={loading}
                />
                <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 12px" }} onClick={sendChat} disabled={loading || !chatInput.trim()}>
                  {loading ? "⏳" : "Enviar"}
                </button>
              </div>
              {chatResponse && (
                <div style={{ fontSize: 12, whiteSpace: "pre-wrap", padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                  {chatResponse}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Goals + Diagnosis */}
          <div style={{ flex: 2, minWidth: 320 }}>
            {/* Goals */}
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎯</span> Metas Financeiras ({goals.length})
                </div>
                <button className="btn btn-sm btn-primary" style={{ fontSize: 11 }} onClick={() => setShowGoalForm(!showGoalForm)}>
                  {showGoalForm ? "✕ Cancelar" : "+ Nova Meta"}
                </button>
              </div>

              {showGoalForm && (
                <div style={{ padding: 12, marginBottom: 12, background: "rgba(99,102,241,0.08)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Título da meta" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} />
                    <input className="chat-input" style={{ width: 120, fontSize: 12 }} placeholder="Meta R$" type="number" value={goalForm.targetValue || ""} onChange={(e) => setGoalForm({ ...goalForm, targetValue: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Descrição (opcional)" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} />
                    <select className="chat-input" style={{ width: 140, fontSize: 12 }} value={goalForm.category} onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}>
                      <option value="revenue">💰 Receita</option>
                      <option value="conversion">📊 Conversão</option>
                      <option value="retention">🔄 Retenção</option>
                      <option value="acquisition">🎯 Aquisição</option>
                      <option value="upgrade">⬆️ Upgrade</option>
                    </select>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={createGoal}>✅ Criar Meta</button>
                </div>
              )}

              {goals.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", padding: 8 }}>
                  Nenhuma meta cadastrada. Crie sua primeira meta ou peça sugestões ao agente.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {goals.map((g) => {
                    const pct = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0;
                    return (
                      <div key={g.id} className="card" style={{ padding: "12px 16px", borderLeft: `4px solid ${g.status === "active" ? "#22c55e" : g.status === "completed" ? "#818cf8" : "#a1a1aa"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                              <span>{CATEGORY_ICONS[g.category] || "🎯"}</span>
                              {g.title}
                              <span className="badge" style={{ fontSize: 9, background: g.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)", color: g.status === "active" ? "#22c55e" : "#818cf8" }}>
                                {g.status}
                              </span>
                            </div>
                            {g.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{g.description}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>R$ {g.current_value.toFixed(0)}</div>
                            <div style={{ fontSize: 10, color: "var(--faint)" }}>de R$ {g.target_value.toFixed(0)}</div>
                          </div>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: g.status === "active" ? "var(--grad)" : "rgba(99,102,241,0.5)", borderRadius: 2, transition: "width 0.6s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Strategic Diagnosis */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🧬</span> Diagnóstico Estratégico
                </div>
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={runDiagnosis} disabled={diagnosisLoading}>
                  {diagnosisLoading ? "⏳ Gerando..." : "🔄 Gerar Diagnóstico"}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                Unifica dados do <strong>Agente Financeiro</strong> + <strong>Google/Marketing Strategy</strong> para priorizar ações.
              </div>
              {diagnosisLoading ? (
                <div style={{ padding: 12 }}>
                  <div className="shimmer" style={{ height: 10, width: "85%", marginBottom: 6, borderRadius: 6 }} />
                  <div className="shimmer" style={{ height: 10, width: "60%", marginBottom: 6, borderRadius: 6 }} />
                  <div className="shimmer" style={{ height: 10, width: "75%", borderRadius: 6 }} />
                </div>
              ) : diagnosis ? (
                <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{diagnosis}</div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
                  Clique em "Gerar Diagnóstico" para cruzar dados financeiros com estratégia de marketing.
                  As tarefas críticas vão para o sistema de aprovação.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
