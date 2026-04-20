import Link from "next/link";

const sections = [
  {
    title: "Chat inteligente",
    description:
      "Converse com seu centro de comando, peça estratégias, ideias e direcionamentos para o seu negócio.",
    href: "/chat",
  },
  {
    title: "Dashboard de automações",
    description:
      "Acompanhe status, falhas, revisões e próximas ações das suas automações.",
    href: "/automations",
  },
  {
    title: "Áreas de membros",
    description:
      "Acesse serviços contratados, cursos e áreas privadas da sua operação.",
    href: "/auth",
  },
  {
    title: "Mini Empresa",
    description:
      "Central operacional para organizar sua empresa, tarefas, visão e crescimento.",
    href: "/auth",
  },
  {
    title: "Editor de vídeo com IA",
    description:
      "Ambiente privado para criação, fila de edição e revisão dos seus vídeos.",
    href: "/auth",
  },
  {
    title: "Planos",
    description:
      "Veja qual plano faz mais sentido para o momento da sua empresa.",
    href: "/plans",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-5 md:px-6">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.32em] text-[#00F0FF]">
              LUMA OS
            </p>
            <p className="mt-2 text-xs text-white/40">
              Sistema operacional criativo
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/plans"
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80"
            >
              Ver planos
            </Link>

            <Link
              href="/plans"
              className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]"
            >
              Entrar
            </Link>
          </div>
        </header>

        <section className="mb-10 pt-4">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Plataforma para microempresas, serviços, automações e IA
          </div>

          <h1 className="max-w-5xl text-4xl font-semibold leading-tight md:text-6xl">
            Organize sua empresa, converse com sua IA e opere tudo em um único sistema.
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            O Luma OS reúne chat, áreas privadas, automações, cursos, serviços,
            operação empresarial e edição de vídeo em uma única experiência.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/plans"
              className="rounded-2xl bg-[#7A00FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]"
            >
              Entrar no sistema
            </Link>

            <Link
              href="/chat"
              className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-5 py-3 text-sm font-medium text-[#00F0FF]"
            >
              Ver chat
            </Link>

            <Link
              href="/plans"
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/80"
            >
              Ver planos
            </Link>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((item) => (
            <article
              key={item.title}
              className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_30px_rgba(122,0,255,0.05)]"
            >
              <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-8 inline-flex rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-5 py-3 text-sm font-medium text-[#00F0FF]"
              >
                Acessar
              </Link>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#0b0d12] p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
                Como funciona
              </p>

              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                Primeiro você escolhe o plano. Depois entra, cria sua conta e acessa sua área.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                O fluxo foi pensado para ser simples: a pessoa entende os planos,
                escolhe o ideal, cria sua conta e depois segue para pagamento e liberação.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/40">Passo 1</p>
                  <p className="mt-2 text-lg font-semibold">Ver planos</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/40">Passo 2</p>
                  <p className="mt-2 text-lg font-semibold">Criar conta / entrar</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/40">Passo 3</p>
                  <p className="mt-2 text-lg font-semibold">Pagamento e acesso</p>
                </div>
              </div>

              <Link
                href="/plans"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7A00FF] px-5 py-4 text-sm font-semibold text-white"
              >
                Começar agora
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
