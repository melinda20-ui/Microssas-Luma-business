"use client";

import { useState } from "react";

const funnelStages = [
  {
    id: "antes",
    icon: "🔍",
    title: "Antes do Lead Entrar",
    subtitle: "Prospecção & Atração",
    description:
      "O lead é identificado pelo agente de prospecção em fóruns, LinkedIn e comunidades. Um convite personalizado é enviado para testar a plataforma gratuitamente.",
    details: [
      "Prospecção ativa em fóruns e LinkedIn",
      "Artigos no blog para tráfego orgânico",
      "Convite personalizado com benefício claro",
      "Link direto para teste gratuito",
    ],
    color: "#3b82f6",
  },
  {
    id: "entra",
    icon: "🚪",
    title: "Lead Entra",
    subtitle: "Primeiro Contato & Onboarding",
    description:
      "O lead acessa a plataforma, cria sua conta e é guiado por um onboarding rápido que mostra o valor imediato da plataforma.",
    details: [
      "Cadastro simplificado (menos de 30s)",
      "Onboarding interativo com IA",
      "Primeira entrega de valor em < 2 min",
      "CTA claro: testar um agente",
    ],
    color: "#06b6d4",
  },
  {
    id: "durante",
    icon: "⚡",
    title: "Durante",
    subtitle: "Ativação & Uso",
    description:
      "O lead experimenta os agentes de IA, cria seu primeiro site ou conteúdo e sente o valor da plataforma na prática.",
    details: [
      "Uso dos 5 agentes de IA especializados",
      "Resultados imediatos (site, conteúdo, automação)",
      "Suporte via Mia (IA) 24/7",
      "Gratificação instantânea",
    ],
    color: "#8b5cf6",
  },
  {
    id: "upgrade",
    icon: "🚀",
    title: "Após Upgrade",
    subtitle: "Expansão & Fidelização",
    description:
      "O lead vê valor e decide fazer upgrade para um plano premium, desbloqueando recursos avançados e suporte prioritário.",
    details: [
      "Acesso a todos os agentes sem limites",
      "Automações avançadas com n8n",
      "Business Intelligence completo",
      "Suporte prioritário via WhatsApp",
    ],
    color: "#10b981",
  },
  {
    id: "downgrade",
    icon: "🔄",
    title: "Após Downgrade",
    subtitle: "Retenção & Reengajamento",
    description:
      "Se o lead fizer downgrade, a plataforma mantém engajamento com recursos do plano gratuito e campanhas de reengajamento automatizadas.",
    details: [
      "Plano gratuito mantém funcionalidades básicas",
      "Campanhas de reengajamento automatizadas",
      "Ofertas exclusivas para retorno",
      "Métricas de satisfação contínuas",
    ],
    color: "#f59e0b",
  },
];

const canvasSections = [
  {
    title: "Parcerias Chave",
    items: [
      "Fornecedores de IA (Gemini, Ollama)",
      "Integradores n8n",
      "Afiliados e parceiros de conteúdo",
      "Proprietários de comunidades",
    ],
  },
  {
    title: "Atividades Chave",
    items: [
      "Desenvolvimento de agentes IA",
      "Geração de tráfego orgânico",
      "Prospecção ativa de leads",
      "Suporte e onboarding",
    ],
  },
  {
    title: "Recursos Chave",
    items: [
      "Modelos de IA (Gemini + Ollama)",
      "Equipe de desenvolvimento",
      "Base de clientes fiéis",
      "Infraestrutura cloud",
    ],
  },
  {
    title: "Proposta de Valor",
    items: [
      "Automação de negócios em português",
      "Resultados em minutos",
      "Sem conhecimento técnico",
      "5 agentes especializados",
    ],
  },
  {
    title: "Relacionamento",
    items: [
      "Suporte via IA 24/7 (Mia)",
      "WhatsApp prioritário (Pro)",
      "Comunidade de usuários",
      "Onboarding guiado",
    ],
  },
  {
    title: "Canais",
    items: [
      "Site (sualuma.online)",
      "LinkedIn e fóruns",
      "Blog com SEO",
      "Indicação de parceiros",
    ],
  },
  {
    title: "Segmentos",
    items: [
      "Microempreendedores",
      "Profissionais autônomos",
      "Pequenas empresas",
      "Vendedores digitais",
    ],
  },
  {
    title: "Custos",
    items: [
      "APIs de IA (Gemini + Ollama)",
      "Infraestrutura e hosting",
      "Marketing e tráfego",
      "Comissões de afiliados",
    ],
  },
  {
    title: "Receitas",
    items: [
      "Assinaturas mensais (Lite/Premium/Pro)",
      "Comissões de marketplace",
      "Serviços premium",
      "Indicações pagas",
    ],
  },
];

const defaultSwot = {
  strengths: [
    "Agentes de IA especializados em português",
    "Resultados em minutos",
    "Interface simples e intuitiva",
    "5 agentes em um só lugar",
  ],
  weaknesses: [
    "Marca nova no mercado",
    "Base de clientes inicial",
    "Dependência de APIs externas",
    "Recursos limitados no plano grátis",
  ],
  opportunities: [
    "Mercado de IA em crescimento acelerado",
    "Poucos concorrentes focados no BR",
    "Parcerias com comunidades e afiliados",
    "Amiga com 60 vendedores de crédito",
  ],
  threats: [
    "Gigantes de IA (OpenAI, Google)",
    "Mudanças em preços de API",
    "Novos concorrentes low-cost",
    "Dependência de tráfego orgânico",
  ],
};

export default function FunilMaster() {
  const [activeStage, setActiveStage] = useState("antes");
  const [swotItems, setSwotItems] = useState(defaultSwot);
  const [newSwot, setNewSwot] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });

  const activeData = funnelStages.find((s) => s.id === activeStage);

  const addSwotItem = (cat: keyof typeof swotItems) => {
    const v = newSwot[cat].trim();
    if (!v) return;
    setSwotItems((p) => ({ ...p, [cat]: [...p[cat], v] }));
    setNewSwot((p) => ({ ...p, [cat]: "" }));
  };

  const removeSwotItem = (cat: keyof typeof swotItems, i: number) => {
    setSwotItems((p) => ({ ...p, [cat]: p[cat].filter((_, idx) => idx !== i) }));
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .funil-page input:focus {
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
          border-color: #3b82f6 !important;
        }
      `}</style>

      <div
        className="funil-page"
        style={{
          background: "linear-gradient(180deg, #eef5ff 0%, #f5f9ff 40%, #f8fafc 100%)",
          minHeight: "100vh",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ============================================================ */}
        {/* HERO                                                         */}
        {/* ============================================================ */}
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px 20px",
            animation: "slideUp 0.6s ease-out",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 50,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#3b82f6",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
              marginBottom: 20,
            }}
          >
            <span>🧠</span>
            <span>Studio Luma · Estratégia</span>
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: "#0a1628",
              marginBottom: 12,
              letterSpacing: "-1px",
            }}
          >
            Funil{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Master
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
              color: "#475569",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            A jornada completa do lead: da prospecção à fidelização.
            Entenda cada etapa e maximize seus resultados.
          </p>
        </div>

        {/* ============================================================ */}
        {/* MENTAL MAP — FUNNEL FLOW                                     */}
        {/* ============================================================ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 20px" }}>
          {/* Flow dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 40,
              padding: "0 10px",
            }}
          >
            {funnelStages.map((s, i) => (
              <div
                key={s.id}
                style={{ display: "flex", alignItems: "center", flex: 1 }}
              >
                <button
                  onClick={() => setActiveStage(s.id)}
                  title={s.title}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      activeStage === s.id ? s.color : "white",
                    border: `2.5px solid ${s.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                    boxShadow:
                      activeStage === s.id
                        ? `0 0 0 5px ${s.color}25, 0 4px 15px ${s.color}40`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                    transform: activeStage === s.id ? "scale(1.1)" : "scale(1)",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {s.icon}
                </button>
                {i < funnelStages.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: `linear-gradient(90deg, ${s.color}, ${funnelStages[i + 1].color})`,
                      margin: "0 6px",
                      borderRadius: 2,
                      opacity: 0.5,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Stage labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 32,
              padding: "0 4px",
            }}
          >
            {funnelStages.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  textAlign: "center",
                  padding: "8px 12px",
                  borderRadius: 10,
                  transition: "all 0.3s",
                  background:
                    activeStage === s.id
                      ? `${s.color}10`
                      : "none",
                  flex: 1,
                  maxWidth: 180,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: activeStage === s.id ? 700 : 500,
                    color: activeStage === s.id ? s.color : "#94a3b8",
                    transition: "color 0.3s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.title}
                </div>
              </button>
            ))}
          </div>

          {/* Active stage detail */}
          {activeData && (
            <div
              key={activeData.id}
              style={{
                background: "white",
                borderRadius: 24,
                padding: 36,
                boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
                border: "1px solid rgba(59,130,246,0.08)",
                animation: "fadeIn 0.35s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: `${activeData.color}12`,
                    border: `2px solid ${activeData.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {activeData.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: activeData.color,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {activeData.subtitle}
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#0a1628",
                      margin: 0,
                    }}
                  >
                    {activeData.title}
                  </h2>
                </div>
              </div>
              <p
                style={{
                  fontSize: 15,
                  color: "#475569",
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}
              >
                {activeData.description}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                }}
              >
                {activeData.details.map((d) => (
                  <div
                    key={d}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      background: "#f8fafc",
                      borderRadius: 12,
                      fontSize: 14,
                      color: "#1e293b",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <span style={{ color: activeData.color, fontSize: 14 }}>
                      ◆
                    </span>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* CANVAS DO NEGÓCIO                                            */}
        {/* ============================================================ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Estratégia
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                color: "#0a1628",
                marginBottom: 8,
              }}
            >
              Canvas do Negócio
            </h2>
            <p style={{ color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              A estrutura completa do modelo de negócio da plataforma Luma
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {canvasSections.map((sec) => (
              <div
                key={sec.title}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(59,130,246,0.06)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 20px rgba(0,0,0,0.04)";
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#3b82f6",
                    marginBottom: 14,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #eef2ff",
                    paddingBottom: 10,
                  }}
                >
                  {sec.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {sec.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        padding: "7px 0",
                        borderBottom: "1px solid #f8fafc",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color: "#3b82f6",
                          fontSize: 8,
                          flexShrink: 0,
                        }}
                      >
                        ●
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* SWOT SIMULATOR                                               */}
        {/* ============================================================ */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 100px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Análise
            </div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontWeight: 800,
                color: "#0a1628",
                marginBottom: 8,
              }}
            >
              Simulador SWOT
            </h2>
            <p style={{ color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Adicione, edite e remova itens em cada quadrante para analisar
              o cenário estratégico do seu negócio
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Strengths */}
            <SwotQuadrant
              title="Forças"
              icon="💪"
              label="Strengths — Fatores internos positivos"
              color="#10b981"
              bgColor="#f0fdf4"
              textColor="#166534"
              items={swotItems.strengths}
              inputValue={newSwot.strengths}
              onInputChange={(v) =>
                setNewSwot((p) => ({ ...p, strengths: v }))
              }
              onAdd={() => addSwotItem("strengths")}
              onRemove={(i) => removeSwotItem("strengths", i)}
            />

            {/* Weaknesses */}
            <SwotQuadrant
              title="Fraquezas"
              icon="⚠️"
              label="Weaknesses — Fatores internos negativos"
              color="#ef4444"
              bgColor="#fef2f2"
              textColor="#991b1b"
              items={swotItems.weaknesses}
              inputValue={newSwot.weaknesses}
              onInputChange={(v) =>
                setNewSwot((p) => ({ ...p, weaknesses: v }))
              }
              onAdd={() => addSwotItem("weaknesses")}
              onRemove={(i) => removeSwotItem("weaknesses", i)}
            />

            {/* Opportunities */}
            <SwotQuadrant
              title="Oportunidades"
              icon="🌍"
              label="Opportunities — Fatores externos positivos"
              color="#3b82f6"
              bgColor="#eff6ff"
              textColor="#1e40af"
              items={swotItems.opportunities}
              inputValue={newSwot.opportunities}
              onInputChange={(v) =>
                setNewSwot((p) => ({ ...p, opportunities: v }))
              }
              onAdd={() => addSwotItem("opportunities")}
              onRemove={(i) => removeSwotItem("opportunities", i)}
            />

            {/* Threats */}
            <SwotQuadrant
              title="Ameaças"
              icon="🎯"
              label="Threats — Fatores externos negativos"
              color="#f59e0b"
              bgColor="#fffbeb"
              textColor="#92400e"
              items={swotItems.threats}
              inputValue={newSwot.threats}
              onInputChange={(v) =>
                setNewSwot((p) => ({ ...p, threats: v }))
              }
              onAdd={() => addSwotItem("threats")}
              onRemove={(i) => removeSwotItem("threats", i)}
            />
          </div>

          {/* SWOT Footer hint */}
          <div
            style={{
              textAlign: "center",
              marginTop: 32,
              padding: "20px 24px",
              background: "white",
              borderRadius: 16,
              border: "1px solid rgba(59,130,246,0.08)",
              boxShadow: "0 2px 15px rgba(0,0,0,0.03)",
            }}
          >
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              💡 Dica: Use o SWOT para planejar suas estratégias de growth.
              Revise trimestralmente e atualize os itens conforme o mercado evolui.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SwotQuadrant({
  title,
  icon,
  label,
  color,
  bgColor,
  textColor,
  items,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
}: {
  title: string;
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  items: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
        borderTop: `4px solid ${color}`,
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 2,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#0a1628",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 16px" }}>
        {label}
      </p>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={`Adicionar ${title.toLowerCase()}...`}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: 10,
            border: "1.5px solid #e2e8f0",
            fontSize: 13,
            outline: "none",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.2s",
            background: "#fafafa",
          }}
        />
        <button
          onClick={onAdd}
          style={{
            padding: "9px 18px",
            background: color,
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: inputValue.trim() ? 1 : 0.5,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              background: bgColor,
              borderRadius: 10,
              fontSize: 13,
              color: textColor,
              border: `1px solid ${color}15`,
              animation: "fadeIn 0.25s ease",
            }}
          >
            <span>{item}</span>
            <button
              onClick={() => onRemove(i)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 18,
                padding: "0 2px",
                lineHeight: 1,
                transition: "color 0.2s",
                opacity: 0.6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.opacity = "0.6";
              }}
            >
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 16,
              color: "#cbd5e1",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Nenhum item ainda. Adicione acima.
          </div>
        )}
      </div>
    </div>
  );
}
