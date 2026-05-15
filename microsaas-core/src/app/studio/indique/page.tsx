"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type Referral = {
  id: string;
  name: string;
  email: string;
  status: "active" | "converted" | "stalled" | "lost";
  daysSinceContact: number;
  lastContact: string;
  notes: string;
};

type SupervisionResult = {
  analysis: string;
  alerts: string;
  suggestion: string;
};

const SAMPLE_REFERRALS: Referral[] = [
  { id: "1", name: "Ana Silva", email: "ana@example.com", status: "active", daysSinceContact: 1, lastContact: "14/05", notes: "Interessada no plano Premium" },
  { id: "2", name: "Carlos Oliveira", email: "carlos@example.com", status: "stalled", daysSinceContact: 9, lastContact: "06/05", notes: "Pediu mais informações" },
  { id: "3", name: "Mariana Costa", email: "mariana@example.com", status: "converted", daysSinceContact: 0, lastContact: "15/05", notes: "Fechou Plano Pro" },
  { id: "4", name: "João Santos", email: "joao@example.com", status: "active", daysSinceContact: 2, lastContact: "13/05", notes: "Agendou demo" },
  { id: "5", name: "Patrícia Lima", email: "patricia@example.com", status: "stalled", daysSinceContact: 14, lastContact: "01/05", notes: "Sem retorno após proposta" },
  { id: "6", name: "Roberto Alves", email: "roberto@example.com", status: "lost", daysSinceContact: 30, lastContact: "15/04", notes: "Não teve interesse" },
];

export default function IndiquePage() {
  const { user, isLoaded } = useUser();

  const [referrals] = useState<Referral[]>(SAMPLE_REFERRALS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SupervisionResult | null>(null);
  const [activeAction, setActiveAction] = useState<string>("analyze");

  const callSupervisor = useCallback(async (action: string) => {
    if (!user) return;
    setLoading(true);
    setActiveAction(action);
    try {
      const res = await fetch(`${API_URL}/api/agents/supervisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({ action, referrals }),
      });
      const data = await res.json();
      if (data.success) {
        setResult((prev) => ({
          analysis: action === "analyze" ? data.response : prev?.analysis || "",
          alerts: action === "alert" ? data.response : prev?.alerts || "",
          suggestion: action === "suggest" ? data.response : prev?.suggestion || "",
        }));
      }
    } catch (err) {
      console.error("[Supervisor] Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [user, referrals]);

  useEffect(() => {
    if (isLoaded && user) {
      callSupervisor("analyze");
    }
  }, [isLoaded, user, callSupervisor]);

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

  const active = referrals.filter((r) => r.status === "active");
  const stalled = referrals.filter((r) => r.status === "stalled");
  const converted = referrals.filter((r) => r.status === "converted");
  const lost = referrals.filter((r) => r.status === "lost");

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 400, height: 400, top: -100, right: -120, background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow">
              <span>👁️</span>
              <span>Supervisor Inteligente de Indicações</span>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>
              Indique & Ganhe
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              Acompanhe suas indicações ativas, detecte gargalos e receba sugestões prioritárias.
            </p>
          </div>
          <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            🧠 Mia Brain
          </Link>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT — Stats & Table */}
        <div style={{ flex: 2, minWidth: 320 }}>
          {/* Stats cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="card" style={{ flex: 1, minWidth: 120, padding: 16, borderLeft: "4px solid #22c55e" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>{active.length}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Ativas</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 120, padding: 16, borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{stalled.length}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Paradas</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 120, padding: 16, borderLeft: "4px solid #eab308" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#eab308" }}>{converted.length}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Convertidas</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 120, padding: 16, borderLeft: "4px solid var(--faint)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--faint)" }}>{lost.length}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Perdidas</div>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📋 Indicações ({referrals.length})</span>
              <span style={{ fontSize: 10, color: "var(--faint)" }}>Atualizado automaticamente</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                    <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 600 }}>Nome</th>
                    <th style={{ textAlign: "left", padding: "8px 6px", fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: "center", padding: "8px 6px", fontWeight: 600 }}>Dias sem contato</th>
                    <th style={{ textAlign: "right", padding: "8px 6px", fontWeight: 600 }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 6px" }}>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 10, color: "var(--faint)" }}>{r.notes}</div>
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        <span className="badge" style={{
                          fontSize: 10,
                          background: r.status === "active" ? "rgba(34,197,94,0.15)" : r.status === "stalled" ? "rgba(239,68,68,0.15)" : r.status === "converted" ? "rgba(99,102,241,0.15)" : "rgba(113,113,122,0.15)",
                          color: r.status === "active" ? "#22c55e" : r.status === "stalled" ? "#ef4444" : r.status === "converted" ? "#818cf8" : "#a1a1aa",
                        }}>
                          {r.status === "active" ? "🟢 Ativa" : r.status === "stalled" ? "🔴 Parada" : r.status === "converted" ? "🔵 Convertida" : "⚪ Perdida"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "center", color: r.daysSinceContact > 7 ? "#ef4444" : r.daysSinceContact > 3 ? "#eab308" : "var(--text)" }}>
                        {r.daysSinceContact}d
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right" }}>
                        {r.status === "stalled" && (
                          <button className="btn btn-sm" style={{ fontSize: 10, padding: "4px 8px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
                            🔄 Reengajar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — Agent Panel */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>👁️</span> Supervisor Inteligente
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {[
                { id: "analyze", label: "📊 Analisar", color: "" },
                { id: "alert", label: "🔔 Alertas", color: "" },
                { id: "suggest", label: "💡 Sugerir", color: "" },
              ].map((a) => (
                <button
                  key={a.id}
                  className={`btn btn-sm ${activeAction === a.id ? "btn-primary" : "btn-ghost"}`}
                  style={{ fontSize: 11 }}
                  onClick={() => callSupervisor(a.id)}
                  disabled={loading}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 16 }}>
                <div className="shimmer" style={{ height: 12, width: "90%", marginBottom: 8, borderRadius: 6 }} />
                <div className="shimmer" style={{ height: 12, width: "70%", marginBottom: 8, borderRadius: 6 }} />
                <div className="shimmer" style={{ height: 12, width: "80%", borderRadius: 6 }} />
              </div>
            ) : result ? (
              <div>
                {result.analysis && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>📊 Análise</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result.analysis}</div>
                  </div>
                )}
                {result.alerts && activeAction === "alert" && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🔔 Alertas</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result.alerts}</div>
                  </div>
                )}
                {result.suggestion && activeAction === "suggest" && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💡 Sugestões</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text)" }}>{result.suggestion}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Carregando análise inicial...</div>
            )}
          </div>

          {/* Stalled referral alert */}
          {stalled.length > 0 && (
            <div className="card" style={{ padding: 16, borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                🔴 {stalled.length} indicação(ões) parada(s)
              </div>
              {stalled.map((r) => (
                <div key={r.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{r.daysSinceContact} dias sem contato · {r.notes}</div>
                </div>
              ))}
              <button className="btn btn-sm" style={{ width: "100%", marginTop: 8, fontSize: 11 }} onClick={() => callSupervisor("alert")}>
                🔔 Gerar alertas detalhados
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
