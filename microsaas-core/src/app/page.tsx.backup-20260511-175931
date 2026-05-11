"use client";

import Link from "next/link";
import { useState } from "react";

const agents = [
  {
    id: "website",
    icon: "🏗️",
    color: "purple",
    badge: "Gemini Pro",
    badgeClass: "badge-purple",
    title: "Website Builder",
    desc: "Descreva o seu negócio e receba um site completo, responsivo e profissional em minutos.",
    features: ["HTML/CSS/JS completo", "SEO otimizado", "Mobile-first", "Formulário de contato"],
  },
  {
    id: "content",
    icon: "✍️",
    color: "cyan",
    badge: "Gemini Flash",
    badgeClass: "badge-cyan",
    title: "Content Creator",
    desc: "Gere posts, artigos, e-mails e scripts de vídeo personalizados para o seu negócio.",
    features: ["Instagram & LinkedIn", "Blog & SEO", "E-mail marketing", "Scripts de vídeo"],
  },
  {
    id: "automation",
    icon: "⚙️",
    color: "pink",
    badge: "Gemini Pro",
    badgeClass: "badge-pink",
    title: "Automation Builder",
    desc: "Descreva uma automação em português e receba o workflow n8n pronto para importar.",
    features: ["Integração n8n", "WhatsApp & Email", "Formulários & CRM", "Agendamentos"],
  },
  {
    id: "analytics",
    icon: "📊",
    color: "green",
    badge: "Gemini Flash",
    badgeClass: "badge-green",
    title: "Business Intelligence",
    desc: "Análises do seu negócio com insights em linguagem natural e recomendações práticas.",
    features: ["Relatórios executivos", "Score de saúde", "Top 3 ações", "Previsões (Pro)"],
  },
  {
    id: "support",
    icon: "💬",
    color: "orange",
    badge: "Ollama Local",
    badgeClass: "badge-orange",
    title: "Customer Support",
    desc: "Mia, sua assistente de IA, atende clientes 24/7 com respostas instantâneas.",
    features: ["Chat em tempo real", "Histórico de sessão", "Escalada inteligente", "WhatsApp (Pro)"],
  },
];

const plans = [
  {
    name: "Lite",
    price: "R$ 97",
    period: "/mês",
    desc: "Para quem está começando",
    color: "cyan",
    featured: false,
    features: [
      { text: "1 Site gerado por IA", yes: true },
      { text: "10 conteúdos/mês", yes: true },
      { text: "Suporte via Mia (IA)", yes: true },
      { text: "Automações n8n", yes: false },
      { text: "Business Intelligence", yes: false },
      { text: "WhatsApp Bot", yes: false },
    ],
  },
  {
    name: "Premium",
    price: "R$ 197",
    period: "/mês",
    desc: "Mais vendido — melhor custo-benefício",
    color: "indigo",
    featured: true,
    features: [
      { text: "3 Sites gerados por IA", yes: true },
      { text: "50 conteúdos/mês", yes: true },
      { text: "Suporte via Mia (IA)", yes: true },
      { text: "5 Automações n8n", yes: true },
      { text: "Business Intelligence básico", yes: true },
      { text: "WhatsApp Bot", yes: false },
    ],
  },
  {
    name: "Pro",
    price: "R$ 397",
    period: "/mês",
    desc: "Para quem quer escalar de verdade",
    color: "purple",
    featured: false,
    features: [
      { text: "Sites ilimitados", yes: true },
      { text: "Conteúdo ilimitado", yes: true },
      { text: "Suporte via Mia + WhatsApp", yes: true },
      { text: "Automações ilimitadas", yes: true },
      { text: "BI avançado + previsões", yes: true },
      { text: "WhatsApp Bot integrado", yes: true },
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* Background */}
      <div className="bg-grid" />
      <div
        className="orb"
        style={{
          width: 600, height: 600, top: -100, left: -200,
          background: "radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)",
        }}
      />
      <div
        className="orb"
        style={{
          width: 500, height: 500, top: 300, right: -150,
          background: "radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)",
        }}
      />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 720 }}>
            <div className="hero-eyebrow animate-fade-up">
              <span>⚡</span>
              <span>5 Agentes de IA · Gemini + Ollama · Resultados em minutos</span>
            </div>
            <h1 className="hero-title animate-fade-up delay-1">
              Automatize seu negócio com{" "}
              <span className="grad-text">Agentes de IA</span>{" "}
              especializados
            </h1>
            <p className="hero-sub animate-fade-up delay-2">
              Sites prontos, conteúdo criado, automações ativadas e análises em tempo real —
              tudo gerado por IA em português, sem precisar de conhecimento técnico.
            </p>
            <div className="hero-ctas animate-fade-up delay-3">
              <Link href="/chat" className="btn btn-primary btn-lg">
                🤖 Falar com um Agente →
              </Link>
              <a href="#agentes" className="btn btn-outline btn-lg">
                Ver os Agentes
              </a>
            </div>
            <div className="hero-stats animate-fade-up delay-4">
              <div>
                <div className="stat-num">5</div>
                <div className="stat-label">Agentes especializados</div>
              </div>
              <div>
                <div className="stat-num">&lt; 2min</div>
                <div className="stat-label">Para gerar um site</div>
              </div>
              <div>
                <div className="stat-num">24/7</div>
                <div className="stat-label">Suporte com IA</div>
              </div>
              <div>
                <div className="stat-num">100%</div>
                <div className="stat-label">Em português</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STACKS */}
      <section style={{ padding: "32px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Powered by
          </span>
          {["🧠 Google Gemini", "🦙 Ollama", "⚙️ n8n", "▲ Next.js", "💳 Kiwify"].map((t) => (
            <span key={t} className="tech-pill">{t}</span>
          ))}
        </div>
      </section>

      {/* AGENTES */}
      <section id="agentes" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-eyebrow">Agentes de IA</div>
            <h2 className="section-title">
              5 especialistas trabalhando{" "}
              <span className="grad-text">para você</span>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Cada agente é treinado para uma função específica. Você descreve o que precisa,
              a IA entrega em minutos.
            </p>
          </div>
          <div className="agents-grid">
            {agents.map((a, i) => (
              <div key={a.id} className={`agent-card ${a.color} animate-fade-up delay-${i + 1}`}>
                <div className={`agent-icon ${a.color}`}>{a.icon}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 className="agent-title">{a.title}</h3>
                  <span className={`badge ${a.badgeClass}`}>{a.badge}</span>
                </div>
                <p className="agent-desc">{a.desc}</p>
                <ul className="agent-features">
                  {a.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link
                  href={`/chat?agent=${a.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 24, width: "100%" }}
                >
                  Usar agente →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="section" style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.04), transparent)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-eyebrow">Como funciona</div>
            <h2 className="section-title">
              Simples como{" "}
              <span className="grad-text-pink">mandar uma mensagem</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 }}>
            {[
              { step: "01", icon: "💬", title: "Descreva o que precisa", desc: "Escreva em português o que você quer — um site, um post, uma automação." },
              { step: "02", icon: "🤖", title: "O agente trabalha", desc: "O agente certo é acionado automaticamente e começa a gerar o resultado." },
              { step: "03", icon: "⚡", title: "Receba em minutos", desc: "Código pronto, conteúdo criado ou workflow ativado — sem esperar." },
              { step: "04", icon: "🚀", title: "Publique e escale", desc: "Use o resultado direto no seu negócio e peça mais quando precisar." },
            ].map((s) => (
              <div key={s.step} className="card" style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)", letterSpacing: 2, marginBottom: 16 }}>
                  PASSO {s.step}
                </div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="section-eyebrow">Planos</div>
            <h2 className="section-title">
              Escolha o plano{" "}
              <span className="grad-text">certo para você</span>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Todos os planos incluem acesso aos agentes de IA. Cancele quando quiser.
            </p>
          </div>
          <div className="pricing-grid">
            {plans.map((p) => (
              <div key={p.name} className={`pricing-card ${p.featured ? "featured" : ""}`}>
                {p.featured && (
                  <div style={{ marginBottom: 16 }}>
                    <span className="badge badge-purple">⭐ Mais Vendido</span>
                  </div>
                )}
                <div style={{ marginBottom: 8, fontSize: 13, color: "var(--muted)" }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                  <span className="price-num grad-text">{p.price}</span>
                  <span className="price-period">{p.period}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>{p.desc}</div>
                <div className="divider" />
                <ul className="price-features">
                  {p.features.map((f) => (
                    <li key={f.text}>
                      <span className={`check ${f.yes ? "yes" : "no"}`}>
                        {f.yes ? "✓" : "×"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://kiwify.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${p.featured ? "btn-primary" : "btn-outline"}`}
                  style={{ width: "100%" }}
                >
                  Assinar {p.name} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section">
        <div className="container">
          <div
            className="card"
            style={{
              padding: "80px 48px", textAlign: "center",
              background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))",
              borderColor: "rgba(99,102,241,0.3)",
            }}
          >
            <div className="orb animate-float" style={{ width: 300, height: 300, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 className="section-title">
                Pronto para automatizar{" "}
                <span className="grad-text">seu negócio?</span>
              </h2>
              <p className="section-sub" style={{ margin: "0 auto 40px" }}>
                Teste agora gratuitamente. Sem cartão de crédito.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/chat" className="btn btn-primary btn-lg">
                  🤖 Testar Agentes Grátis →
                </Link>
                <a href="#planos" className="btn btn-outline btn-lg">
                  Ver planos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
