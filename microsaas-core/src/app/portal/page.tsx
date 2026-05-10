import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardAccess, getDashboardUrl } from "@/lib/auth/dashboard-access";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const access = await getDashboardAccess();

  if (!access.authenticated) {
    redirect("/login?next=/portal");
  }

  if (access.target !== "choice") {
    redirect(getDashboardUrl(access.target));
  }

  return (
    <main className="portal-shell">
      <section className="portal-card">
        <p className="eyebrow">Sualuma</p>
        <h1>Escolha como você quer entrar agora</h1>
        <p className="subtitle">
          Sua conta tem acesso como Cliente IA e também como Prestador. Escolha o painel que deseja usar.
        </p>

        <div className="choices">
          <Link className="choice primary" href="https://dashboardcliente.sualuma.online/member-user">
            <span>Cliente IA</span>
            <strong>Entrar como Cliente IA</strong>
            <small>Acessar agentes, Mia, automações e benefícios de IA.</small>
          </Link>

          <Link className="choice" href="https://meuservico.sualuma.online/provider-services">
            <span>Prestador</span>
            <strong>Entrar como Prestador</strong>
            <small>Gerenciar serviços, propostas, entregas e oportunidades.</small>
          </Link>
        </div>
      </section>

      <style>{`
        .portal-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px;
          background:
            radial-gradient(circle at top left, rgba(124, 58, 237, .28), transparent 34%),
            radial-gradient(circle at bottom right, rgba(56, 189, 248, .22), transparent 34%),
            #070816;
          color: white;
          font-family: Inter, Arial, sans-serif;
        }

        .portal-card {
          width: min(960px, 100%);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 32px;
          padding: clamp(28px, 5vw, 56px);
          background: rgba(255,255,255,.06);
          box-shadow: 0 24px 80px rgba(0,0,0,.35);
          backdrop-filter: blur(18px);
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #7dd3fc;
          text-transform: uppercase;
          letter-spacing: .18em;
          font-size: 12px;
          font-weight: 800;
        }

        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .subtitle {
          max-width: 680px;
          margin: 18px 0 0;
          color: rgba(255,255,255,.68);
          font-size: 17px;
          line-height: 1.7;
        }

        .choices {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .choice {
          text-decoration: none;
          color: white;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.07);
          transition: transform .2s ease, border-color .2s ease, background .2s ease;
        }

        .choice:hover {
          transform: translateY(-3px);
          border-color: rgba(125,211,252,.55);
          background: rgba(255,255,255,.1);
        }

        .choice.primary {
          background: linear-gradient(135deg, rgba(124,58,237,.38), rgba(56,189,248,.18));
        }

        .choice span {
          display: inline-flex;
          margin-bottom: 14px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: #a78bfa;
        }

        .choice strong {
          display: block;
          font-size: 22px;
          margin-bottom: 10px;
        }

        .choice small {
          display: block;
          color: rgba(255,255,255,.64);
          line-height: 1.6;
          font-size: 14px;
        }

        @media (max-width: 720px) {
          .choices {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
