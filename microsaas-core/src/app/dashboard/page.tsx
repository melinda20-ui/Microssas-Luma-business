"use client";

import Link from "next/link";
import { useState } from "react";

const stats = [
  { label: "Créditos de IA", value: "850", unit: "tokens", trend: "+12%" },
  { label: "Sites Ativos", value: "3", unit: "/ 5", trend: "Premium" },
  { label: "Posts Gerados", value: "42", unit: "este mês", trend: "+5" },
  { label: "Automações", value: "8", unit: "ativas", trend: "OK" },
];

const recentActivity = [
  { id: 1, type: "website", name: "Landing Page Barbearia", status: "Concluído", date: "Há 2 horas" },
  { id: 2, type: "content", name: "Pack 10 posts Instagram", status: "Em progresso", date: "Há 15 min" },
  { id: 3, type: "automation", name: "Webhook Kiwify → WhatsApp", status: "Ativo", date: "Ontem" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <div className="bg-grid" />
      
      {/* Sidebar Simples */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 260, borderRight: "1px solid var(--border)", background: "rgba(4,4,15,0.5)", backdropFilter: "blur(20px)", padding: 24, position: "sticky", top: 0, height: "100vh" }}>
          <div className="nav-logo" style={{ marginBottom: 40, display: "block" }}>⚡ MicroSaaS</div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "overview", label: "Início", icon: "🏠" },
              { id: "websites", label: "Meus Sites", icon: "🌐" },
              { id: "content", label: "Conteúdos", icon: "✍️" },
              { id: "automations", label: "Automações", icon: "⚙️" },
              { id: "settings", label: "Configurações", icon: "⚙️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn btn-ghost"
                style={{ 
                  justifyContent: "flex-start", 
                  width: "100%", 
                  background: activeTab === item.id ? "rgba(99,102,241,0.15)" : "transparent",
                  color: activeTab === item.id ? "var(--text)" : "var(--muted)",
                  borderColor: activeTab === item.id ? "var(--indigo)" : "transparent",
                }}
              >
                <span style={{ marginRight: 12 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: 40 }}>
            <div className="card" style={{ padding: 16, fontSize: 13 }}>
              <div style={{ marginBottom: 10, fontWeight: 600 }}>Plano Premium</div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 8 }}>
                <div style={{ width: "60%", height: "100%", background: "var(--grad)", borderRadius: 2 }}></div>
              </div>
              <div style={{ color: "var(--muted)" }}>60% dos recursos usados</div>
              <Link href="#planos" className="grad-text" style={{ display: "block", marginTop: 12, fontWeight: 700, textDecoration: "none" }}>
                Upgrade para Pro →
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "40px 60px", position: "relative", zIndex: 1 }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <div>
              <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: 4 }}>Olá, Emerson! 👋</h1>
              <p style={{ color: "var(--muted)" }}>Aqui está o resumo dos seus agentes de IA hoje.</p>
            </div>
            <Link href="/chat" className="btn btn-primary">
              🤖 Novo Pedido IA
            </Link>
          </header>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 48 }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "var(--faint)" }}>{s.unit}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--green)", marginTop: 8, fontWeight: 600 }}>{s.trend}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            {/* Recent Items */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem" }}>Atividades Recentes</h3>
                <button className="btn btn-ghost btn-sm">Ver tudo</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
                    <th style={{ padding: "12px 24px", fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>NOME</th>
                    <th style={{ padding: "12px 24px", fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>TIPO</th>
                    <th style={{ padding: "12px 24px", fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: "12px 24px", fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>DATA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "16px 24px", fontWeight: 500 }}>{a.name}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className={`badge badge-${a.type === 'website' ? 'purple' : a.type === 'content' ? 'cyan' : 'pink'}`}>
                          {a.type}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: a.status === 'Ativo' || a.status === 'Concluído' ? 'var(--green)' : 'var(--orange)' }}>
                        ● {a.status}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: "var(--muted)" }}>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Agent Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card" style={{ padding: 24, background: "var(--grad)", border: "none", color: "white" }}>
                <h3 style={{ marginBottom: 12 }}>Precisa de um site agora?</h3>
                <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>O Agente Website Builder cria sua porta de entrada no mundo digital em segundos.</p>
                <Link href="/chat?agent=website" className="btn" style={{ background: "white", color: "var(--purple)", width: "100%" }}>
                  🏗️ Gerar Site Agora
                </Link>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>Seu Assistente de Suporte</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Mia</div>
                    <div style={{ fontSize: 12, color: "var(--green)" }}>Online 24/7</div>
                  </div>
                </div>
                <Link href="/chat?agent=support" className="btn btn-outline btn-sm" style={{ width: "100%" }}>
                  Dúvida rápida com a Mia
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        body { background: #04040f !important; }
      `}</style>
    </>
  );
}
