import Link from "next/link";

const modules = [
  {
    title: "Planejamento 12 Semanas",
    desc: "Defina metas, ciclos de execução e prioridades estratégicas.",
    tag: "Estratégia",
  },
  {
    title: "Marketing",
    desc: "Organize campanhas, funis, conteúdo e distribuição.",
    tag: "Aquisição",
  },
  {
    title: "Conteúdo",
    desc: "Planeje postagens, roteiros, pautas e produção criativa.",
    tag: "Criação",
  },
  {
    title: "Financeiro",
    desc: "Acompanhe entradas, saídas, metas e visão de caixa.",
    tag: "Controle",
  },
  {
    title: "Vendas",
    desc: "Gerencie leads, oportunidades, etapas e propostas.",
    tag: "CRM",
  },
  {
    title: "Projetos e Tarefas",
    desc: "Visualize o andamento da operação e do time.",
    tag: "Operação",
  },
  {
    title: "E-mails",
    desc: "Centralize comunicações e tenha visão unificada.",
    tag: "Inbox",
  },
  {
    title: "Automação de E-mails",
    desc: "Crie fluxos, disparos, campanhas e jornadas.",
    tag: "Automação",
  },
  {
    title: "Calendário",
    desc: "Conecte agenda, compromissos, prazos e lembretes.",
    tag: "Agenda",
  },
  {
    title: "Contador",
    desc: "Organize obrigações fiscais, documentos e impostos.",
    tag: "Fiscal",
  },
  {
    title: "Funcionários",
    desc: "Cadastre equipe, papéis, responsabilidades e acessos.",
    tag: "Equipe",
  },
  {
    title: "Vida",
    desc: "Estruture rotina, hábitos e organização pessoal.",
    tag: "Pessoal",
  },
];

export default function MiniCompanyPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-5 md:px-6">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80"
            >
              ←
            </Link>

            <div>
              <p className="text-sm font-semibold text-white">Mini Empresa</p>
              <p className="text-xs text-white/40">
                Estrutura operacional para microempreendedores
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
            Workspace
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff] shadow-[0_0_18px_rgba(122,0,255,0.12)]">
            Sistema empresarial
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Tudo que uma microempresa precisa para rodar em um só lugar.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Planejamento, marketing, vendas, financeiro, tarefas, e-mails,
            automações e organização em uma estrutura pronta para execução.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
              Visão geral
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Seu escritório digital pronto para crescer.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              Centralize sua operação e transforme caos em clareza com painéis,
              módulos e fluxos organizados por prioridade.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Módulos</p>
                <p className="mt-2 text-xl font-semibold text-white">12</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Status</p>
                <p className="mt-2 text-xl font-semibold text-[#00F0FF]">
                  Ativo
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Expansão</p>
                <p className="mt-2 text-xl font-semibold text-white">+∞</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Modo</p>
                <p className="mt-2 text-xl font-semibold text-white">Premium</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
            <p className="text-sm font-semibold text-[#A855F7]">
              Agente operacional
            </p>
            <p className="mt-3 text-sm leading-7 text-white/75">
              “Posso te ajudar a organizar finanças, estruturar marketing,
              acompanhar tarefas e criar clareza operacional.”
            </p>

            <button className="mt-6 rounded-2xl bg-[#7A00FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]">
              Abrir centro de comando
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
                  {module.tag}
                </span>

                <span className="text-xs text-white/35">Módulo</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{module.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{module.desc}</p>

              <div className="mt-6">
                <button className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-sm font-medium text-[#00F0FF]">
                  Explorar módulo
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
