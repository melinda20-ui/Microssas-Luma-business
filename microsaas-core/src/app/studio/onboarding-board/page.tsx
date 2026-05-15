"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "http://localhost:3001";

type OnboardingStep = {
  id: string;
  label: string;
  description: string;
  status: "completed" | "current" | "pending" | "blocked";
  icon: string;
};

type OnboardingProgress = {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  steps: OnboardingStep[];
  startedAt: string;
  daysSinceStart: number;
};

const SAMPLE_ONBOARDING: OnboardingProgress = {
  totalSteps: 6,
  completedSteps: 3,
  currentStep: "Configurar automações",
  daysSinceStart: 5,
  startedAt: "10/05/2026",
  steps: [
    { id: "s1", label: "Criar conta", description: "Cadastro e verificação de e-mail", status: "completed", icon: "✅" },
    { id: "s2", label: "Definir plano", description: "Escolha do plano ideal (Lite, Premium, Pro)", status: "completed", icon: "✅" },
    { id: "s3", label: "Primeiro site", description: "Criação do primeiro site com IA", status: "completed", icon: "✅" },
    { id: "s4", label: "Configurar automações", description: "Conectar n8n e criar workflows", status: "current", icon: "⏳" },
    { id: "s5", label: "Conteúdo inicial", description: "Gerar primeiros posts e blog", status: "pending", icon: "📝" },
    { id: "s6", label: "Análises", description: "Configurar dashboard e métricas", status: "blocked", icon: "🔒" },
  ],
};

export default function OnboardingBoard() {
  const { user, isLoaded } = useUser();

  const [onboarding] = useState<OnboardingProgress>(SAMPLE_ONBOARDING);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [explanationInput, setExplanationInput] = useState("");
  const [explanationOutput, setExplanationOutput] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);

  const progressPct = Math.round((onboarding.completedSteps / onboarding.totalSteps) * 100);

  const callUxAgent = useCallback(async (action: string, msg?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/ux`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({
          action,
          onboardingData: onboarding,
          message: msg || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === "analyze") setAnalysis(data.response);
        if (action === "suggest") setSuggestion(data.response);
        if (action === "explain") setExplanationOutput(data.response);
      }
    } catch (err) {
      console.error("[UX Agent] Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [user, onboarding]);

  useEffect(() => {
    if (isLoaded && user) {
      callUxAgent("analyze");
    }
  }, [isLoaded, user, callUxAgent]);

  const handleExplain = async () => {
    if (!explanationInput.trim() || explainLoading || !user) return;
    setExplainLoading(true);
    setExplanationOutput("");
    try {
      const res = await fetch(`${API_URL}/api/agents/ux`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({
          action: "explain",
          onboardingData: onboarding,
          message: explanationInput,
        }),
      });
      const data = await res.json();
      if (data.success) setExplanationOutput(data.response);
    } catch (err) {
      console.error("[UX Agent] Explain error:", err);
    } finally {
      setExplainLoading(false);
    }
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

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 450, height: 450, top: -80, left: -100, background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)" }} />

      <header style={{ padding: "24px 32px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="hero-eyebrow">
              <span>🎨</span>
              <span>Agente UX de Onboarding</span>
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0 0" }}>
              Onboarding Board
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              Acompanhe o progresso do onboarding, detecte travas e receba sugestões do agente UX.
            </p>
          </div>
          <Link href="/studio/mia-brain" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
            🧠 Mia Brain
          </Link>
        </div>
      </header>

      <main style={{ padding: "24px 32px", position: "relative", zIndex: 1, display: "flex", gap: 24, flexWrap: "wrap" }}>

        {/* LEFT — Progress & Steps */}
        <div style={{ flex: 2, minWidth: 320 }}>
          {/* Progress card */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Progresso do Onboarding</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {onboarding.completedSteps} de {onboarding.totalSteps} etapas concluídas · {onboarding.daysSinceStart} dias
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--indigo)" }}>{progressPct}%</div>
              </div>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--grad)", borderRadius: 4, transition: "width 0.6s" }} />
            </div>
          </div>

          {/* Steps timeline */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📋 Etapas</div>
            {onboarding.steps.map((step, idx) => (
              <div
                key={step.id}
                className="card"
                style={{
                  padding: "12px 16px",
                  marginBottom: 8,
                  borderLeft: `4px solid ${
                    step.status === "completed" ? "#22c55e" :
                    step.status === "current" ? "#eab308" :
                    step.status === "blocked" ? "#ef4444" :
                    "var(--border)"
                  }`,
                  opacity: step.status === "pending" ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
                      {step.status === "completed" ? "✅" : step.status === "current" ? "⏳" : step.status === "blocked" ? "🔒" : "📝"}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {step.label}
                        {step.status === "current" && (
                          <span className="badge" style={{ fontSize: 9, marginLeft: 8, background: "rgba(234,179,8,0.15)", color: "#eab308" }}>ATUAL</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{step.description}</div>
                    </div>
                  </div>
                  {step.status === "blocked" && (
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: 10, padding: "4px 8px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
                      onClick={() => callUxAgent("explain", `Por que a etapa "${step.label}" está bloqueada?`)}
                    >
                      🔓 Destravar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — UX Agent Panel */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
          {/* Analysis */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🎨</span> Agente UX
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <button
                className={`btn btn-sm ${analysis ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: 11 }}
                onClick={() => callUxAgent("analyze")}
                disabled={loading}
              >
                📊 Analisar
              </button>
              <button
                className={`btn btn-sm ${suggestion ? "btn-primary" : "btn-ghost"}`}
                style={{ fontSize: 11 }}
                onClick={() => callUxAgent("suggest")}
                disabled={loading}
              >
                💡 Sugerir
              </button>
            </div>

            {loading && (
              <div style={{ padding: 12 }}>
                <div className="shimmer" style={{ height: 10, width: "85%", marginBottom: 6, borderRadius: 6 }} />
                <div className="shimmer" style={{ height: 10, width: "60%", marginBottom: 6, borderRadius: 6 }} />
                <div className="shimmer" style={{ height: 10, width: "75%", borderRadius: 6 }} />
              </div>
            )}

            {analysis && !loading && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>📊 Análise de Progresso</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{analysis}</div>
              </div>
            )}

            {suggestion && !loading && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💡 Sugestão de Melhoria</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{suggestion}</div>
              </div>
            )}
          </div>

          {/* Explain / Ask */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span>❓</span> Pergunte ao agente
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="chat-input"
                style={{ flex: 1, fontSize: 12 }}
                placeholder="Ex: Como concluir esta etapa?"
                value={explanationInput}
                onChange={(e) => setExplanationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExplain()}
                disabled={explainLoading}
              />
              <button
                className="btn btn-primary"
                style={{ fontSize: 11, padding: "6px 12px" }}
                onClick={handleExplain}
                disabled={explainLoading || !explanationInput.trim()}
              >
                {explainLoading ? "⏳" : "Perguntar"}
              </button>
            </div>
            {explanationOutput && (
              <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                {explanationOutput}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
