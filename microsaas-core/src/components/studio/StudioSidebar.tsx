"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

const STUDIO_ROUTES = [
  { href: "/studio-lab", label: "🎛️ Studio Lab", desc: "Central de controle" },
  { href: "/studio/mia-brain", label: "🧠 Mia Brain", desc: "Chat multigentes" },
  { href: "/studio/sentinela", label: "🚨 Sentinela", desc: "Monitoramento" },
  { href: "/studio/memoria", label: "🗂️ Archive Brain", desc: "Memória de longo prazo" },
  { href: "/studio/indique", label: "👁️ Indique & Ganhe", desc: "Supervisor de indicações" },
  { href: "/studio/onboarding-board", label: "🎨 Onboarding", desc: "Progresso do usuário" },
  { href: "/studio/servicos-e-indique", label: "🔗 Serviços + Indique", desc: "Serviços integrados" },
  { href: "/studio/ideias-conteudo", label: "💡 Ideias de Conteúdo", desc: "Geração de pautas" },
  { href: "/studio/blog-agent", label: "✍️ Blog Agent", desc: "Pipeline de artigos" },
  { href: "/studio/metas-financeiras", label: "💰 Metas Financeiras", desc: "Financeiro e métricas" },
  { href: "/studio/funil-sualuma", label: "🔁 Funil Sualuma", desc: "Inteligência de funil" },
  { href: "/studio/campaign-agent", label: "📢 Campaign Agent", desc: "Campanhas de marketing" },
  { href: "/studio/iscas-lab", label: "🧲 Iscas Lab", desc: "Lead magnets" },
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useSession();

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "rgba(0,0,0,0.3)",
      borderRight: "1px solid var(--border)", padding: 16,
      display: "flex", flexDirection: "column", gap: 4, overflowY: "auto",
      height: "calc(100vh - 80px)", position: "sticky", top: 80,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 1.5, margin: "0 8px 12px" }}>
        📋 Catálogo do Studio
      </div>

      {STUDIO_ROUTES.map((route) => {
        const isActive = pathname === route.href ||
          (route.href !== "/studio-lab" && pathname.startsWith(route.href));
        return (
          <Link
            key={route.href}
            href={route.href}
            style={{
              display: "flex", flexDirection: "column", gap: 1,
              padding: "8px 10px", borderRadius: 6, fontSize: 12,
              background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
              color: isActive ? "#a5b4fc" : "var(--text)",
              borderLeft: isActive ? "2px solid #818cf8" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontWeight: isActive ? 600 : 400 }}>{route.label}</span>
            <span style={{ fontSize: 10, color: "var(--faint)" }}>{route.desc}</span>
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        {user && (
          <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 8, padding: "0 8px" }}>
            {user.email}
          </div>
        )}
        <div style={{ display: "flex", gap: 6, padding: "0 8px" }}>
          {user ? (
            <button onClick={signOut} className="btn btn-sm btn-ghost" style={{ fontSize: 10, flex: 1 }}>
              Sair
            </button>
          ) : (
            <Link href="/login" className="btn btn-sm btn-primary" style={{ fontSize: 10, flex: 1, textAlign: "center" }}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
