"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

type SystemStatus = {
  api: string;
  gemini: string;
  ollama: { online: boolean; models: string[] } | string;
  uptime: number;
  memory?: { heapUsed: number; heapTotal: number };
};

type UserProfile = {
  credits: number;
  plan: string;
  role: string;
  last_reset: string;
};

type SuperAdminCheck = {
  superAdmin: boolean;
  role: string;
};

const AGENT_META: Record<string, { icon: string; label: string; color: string; desc: string }> = {
  support:    { icon: "💬", label: "Mia (Suporte)",       color: "orange", desc: "Suporte 24/7 via Ollama + Gemini" },
  content:   { icon: "✍️", label: "Content Creator",      color: "cyan",   desc: "Posts, blogs, e-mails e scripts" },
  tiktok:    { icon: "📱", label: "TikTok Shop Agent",    color: "pink",   desc: "Roteiros e estratgia viral" },
  shopify:   { icon: "🛍️", label: "Shopify Expert",       color: "green",  desc: "Copy de vendas e SEO" },
  pinterest: { icon: "📌", label: "Pinterest Growth",     color: "orange", desc: "Tráfego visual e pins" },
  website:   { icon: "🏗️", label: "Website Builder",      color: "purple", desc: "Sites completos com Gemini Pro" },
  automation:{ icon: "⚙️", label: "Automation Builder",   color: "pink",   desc: "Workflows n8n com IA" },
  analytics: { icon: "📊", label: "Business Intelligence", color: "green",  desc: "Insights e análises de dados" },
};

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:3001";
const SYNC_INTERVAL = 30000;

function fmtUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function fmtMemory(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function StudioLab() {
  const { user, isLoaded } = useUser();

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [superAdmin, setSuperAdmin] = useState<SuperAdminCheck | null>(null);

  const [statusLoading, setStatusLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusError(null);
      const res = await fetch(`${API_URL}/api/status`);
      if (!res.ok) throw new Error(`Status API retornou ${res.status}`);
      const data: SystemStatus = await res.json();
      setStatus(data);
      console.log("[StudioLab] Status carregado:", data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao carregar status";
      console.error("[StudioLab] Erro ao buscar /api/status:", msg, err);
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setProfileError(null);
      const [userRes, adminRes] = await Promise.all([
        fetch(`${API_URL}/api/user/${userId}`),
        fetch(`${API_URL}/api/user/${userId}/super-admin`),
      ]);
      if (!userRes.ok) throw new Error(`User API retornou ${userRes.status}`);
      const userData: UserProfile = await userRes.json();
      const adminData: SuperAdminCheck = await adminRes.json();
      setProfile(userData);
      setSuperAdmin(adminData);
      console.log("[StudioLab] Perfil carregado:", userData, "SuperAdmin:", adminData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao carregar perfil";
      console.error("[StudioLab] Erro ao buscar perfil do usuário:", msg, err);
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    fetchStatus();
    if (user) fetchProfile(user.id);
  }, [isLoaded, user, fetchStatus, fetchProfile]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      if (user) fetchProfile(user.id);
    }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchStatus, fetchProfile]);

  const hasAnyError = statusError !== null || profileError !== null;
  const isDataReady = !statusLoading && !profileLoading;

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -80, left: -200, background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)" }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: -100, right: -100, background: "radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)" }} />

      <div style={{ paddingTop: 32, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>

          {/* Header */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="hero-eyebrow" style={{ marginBottom: 12 }}>
                <span>🧪</span>
                <span>Studio Lab · Painel ao Vivo</span>
              </div>
              <h1 className="section-title" style={{ fontSize: "2.2rem", marginBottom: 4 }}>
                {isLoaded && user
                  ? `Studio Lab`
                  : "Conectando..."}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Dados em tempo real do backend — sem fallbacks, sem cache.</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {superAdmin?.superAdmin && (
                <span className="badge badge-purple">Super Admin</span>
              )}
              <span className={`badge ${hasAnyError ? "badge-orange" : "badge-green"}`}>
                {hasAnyError ? "Alerta" : statusLoading || profileLoading ? "Carregando..." : "Online"}
              </span>
            </div>
          </header>

          {/* Loading State */}
          {!isDataReady && !hasAnyError && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card shimmer" style={{ padding: 24, minHeight: 100 }} />
              ))}
            </div>
          )}

          {/* Error State */}
          {hasAnyError && isDataReady && (
            <div className="card" style={{ padding: 24, marginBottom: 32, borderColor: "rgba(245,158,11,0.5)", background: "rgba(245,158,11,0.05)" }}>
              <h3 style={{ color: "#fcd34d", marginBottom: 8, fontSize: "1rem" }}>⚠️ Falha em Conexões</h3>
              {statusError && (
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                  <strong>Status API:</strong> {statusError}
                </p>
              )}
              {profileError && (
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  <strong>User API:</strong> {profileError}
                </p>
              )}
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setStatusLoading(true);
                  setProfileLoading(true);
                  setStatusError(null);
                  setProfileError(null);
                  fetchStatus();
                  if (user) fetchProfile(user.id);
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Stats Grid - Real Data */}
          {isDataReady && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
              {/* System Uptime */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Sistema</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{status ? fmtUptime(status.uptime) : "---"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Tempo de atividade da API</div>
              </div>

              {/* Gemini Status */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Google Gemini</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: status?.gemini === "configured" ? "var(--green)" : "var(--muted)" }}>
                  {status?.gemini === "configured" ? "Configurado" : status?.gemini || "---"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Chave API: {status?.gemini === "configured" ? "✅" : "❌"}
                </div>
              </div>

              {/* Ollama Status */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Ollama (Mia)</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: typeof status?.ollama === "object" && status.ollama.online ? "var(--green)" : "var(--muted)" }}>
                  {typeof status?.ollama === "object" && status.ollama.online ? "Online" : "Offline"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {typeof status?.ollama === "object" && status.ollama.models?.length
                    ? `Modelos: ${status.ollama.models.join(", ")}`
                    : typeof status?.ollama === "object" && !status.ollama.online
                    ? "Usando Gemini como fallback"
                    : "---"}
                </div>
              </div>

              {/* Memory */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Memória</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                  {status?.memory ? fmtMemory(status.memory.heapUsed) : "---"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  {status?.memory ? `Total: ${fmtMemory(status.memory.heapTotal)}` : "Uso de heap"}
                </div>
              </div>
            </div>
          )}

          {/* User Profile - Real Data */}
          {isDataReady && user && profile && (
            <div style={{ marginBottom: 48 }}>
              <h2 className="section-eyebrow" style={{ marginBottom: 16 }}>Perfil</h2>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {user.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.primaryEmailAddress?.emailAddress || "Usuário"}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        ID: {user.id.slice(0, 12)}...
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div className="card" style={{ padding: "12px 20px", borderColor: "rgba(16,185,129,0.3)" }}>
                      <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Créditos</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{profile.credits.toLocaleString()}</div>
                    </div>
                    <div className="card" style={{ padding: "12px 20px", borderColor: "rgba(99,102,241,0.3)" }}>
                      <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Plano</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, textTransform: "capitalize" }}>{profile.plan}</div>
                    </div>
                    <div className="card" style={{ padding: "12px 20px", borderColor: "rgba(124,58,237,0.3)" }}>
                      <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Função</div>
                      <div style={{ fontSize: "1.4rem", fontWeight: 800, textTransform: "capitalize" }}>{profile.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Not logged in state */}
          {isDataReady && !user && (
            <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ marginBottom: 8 }}>Autenticação Necessária</h2>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
                Faça login para ver seu perfil e créditos em tempo real.
              </p>
              <Link href="/sign-in" className="btn btn-primary">
                Fazer Login
              </Link>
            </div>
          )}

          {/* Agent Grid */}
          <div>
            <h2 className="section-eyebrow" style={{ marginBottom: 16 }}>Agentes Especialistas</h2>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
              {status && typeof status.ollama === "object" && status.ollama.online
                ? "Cérebro Azul (Ollama) online · Fallback Gemini ativo"
                : "Gemini como provedor principal"}
            </p>
            <div className="agents-grid">
              {Object.entries(AGENT_META).map(([id, meta]) => (
                <Link
                  key={id}
                  href={`/chat?agent=${id}`}
                  className={`agent-card ${meta.color}`}
                  style={{ textDecoration: "none", cursor: "pointer", display: "block" }}
                >
                  <div className={`agent-icon ${meta.color}`}>{meta.icon}</div>
                  <h3 className="agent-title">{meta.label}</h3>
                  <p className="agent-desc">{meta.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    <span className="badge" style={{
                      background: status?.gemini === "configured" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      border: `1px solid ${status?.gemini === "configured" ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)"}`,
                      color: status?.gemini === "configured" ? "#6ee7b7" : "#fcd34d"
                    }}>
                      {status?.gemini === "configured" ? "Disponível" : "Indisponível"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--faint)" }}>Acessar →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer debug info */}
          <div style={{ marginTop: 48, padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--faint)" }}>
            <details>
              <summary style={{ cursor: "pointer" }}>Logs de Depuração</summary>
              <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 11, lineHeight: 1.5 }}>
{`[System] API URL: ${API_URL}
[Auth] isLoaded: ${isLoaded}
[Auth] userId: ${user?.id || "none"}
[Status] last: ${JSON.stringify(status, null, 2)}
[Profile] last: ${JSON.stringify(profile, null, 2)}
[SuperAdmin] last: ${JSON.stringify(superAdmin, null, 2)}
[StatusError] ${statusError || "none"}
[ProfileError] ${profileError || "none"}
[Poll] Interval: 30s`}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
