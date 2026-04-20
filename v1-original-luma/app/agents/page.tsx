import Link from "next/link";

const plans = [
  {
    name: "Teste grátis",
    agents: 2,
    status: "Exploração inicial",
    highlight: false,
    color: "border-white/10 bg-white/[0.04] text-white",
  },
  {
    name: "Básico",
    agents: 4,
    status: "Operação essencial",
    highlight: false,
    color: "border-white/10 bg-white/[0.04] text-white",
  },
  {
    name: "Prime",
    agents: 7,
    status: "Mais recomendado",
    highlight: true,
    color: "border-[#7A00FF]/30 bg-[#7A00FF]/10 text-white",
  },
  {
    name: "Premium",
    agents: 10,
    status: "Escala avançada",
    highlight: false,
    color: "border-white/10 bg-white/[0.04] text-white",
  },
  {
    name: "Pro",
    agents: 12,
    status: "Operação completa",
    highlight: false,
    color: "border-white/10 bg-white/[0.04] text-white",
  },
];

const agentList = [
  {
    name: "Agente Captador",
    role: "Captação de leads",
    status: "Operando",
    statusColor: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20",
    level: "Nível 4",
    benefit: "Capta leads automaticamente e alimenta a base.",
    gain: "Economiza horas de prospecção manual.",
    progress: 88,
  },
  {
    name: "Agente SDR",
    role: "Pré-vendas",
    status: "Ativo parcial",
    statusColor: "text-[#d7b8ff] bg-[#7A00FF]/10 border-[#7A00FF]/20",
    level: "Nível 3",
    benefit: "Faz abordagem inicial e qualifica interessados.",
    gain: "Substitui a primeira camada de atendimento comercial.",
    progress: 64,
  },
  {
    name: "Agente Distribuidor de Iscas",
    role: "Nutrição",
    status: "Implementar",
    statusColor: "text-white/70 bg-white/5 border-white/10",
    level: "Nível 1",
    benefit: "Entrega materiais gratuitos e prepara o lead.",
    gain: "Aumenta conversão antes da venda.",
    progress: 22,
  },
  {
    name: "Agente de Funil",
    role: "Jornada comercial",
    status: "Operando",
    statusColor: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20",
    level: "Nível 4",
    benefit: "Leva o lead até reunião ou página de venda.",
    gain: "Reduz perda de oportunidade no meio do caminho.",
    progress: 81,
  },
  {
    name: "Agente Programador",
    role: "Infraestrutura técnica",
    status: "Ativo parcial",
    statusColor: "text-[#d7b8ff] bg-[#7A00FF]/10 border-[#7A00FF]/20",
    level: "Nível 3",
    benefit: "Ajuda a construir, corrigir e automatizar o sistema.",
    gain: "Substitui parte do trabalho técnico operacional.",
    progress: 59,
  },
  {
    name: "Agente Conteúdo & SEO",
    role: "Tráfego e autoridade",
    status: "Implementar",
    statusColor: "text-white/70 bg-white/5 border-white/10",
    level: "Nível 1",
    benefit: "Cria conteúdo para blog, SEO e crescimento orgânico.",
    gain: "Atrai tráfego sem depender só de anúncios.",
    progress: 18,
  },
];

const stats = [
  {
    label: "Agentes liberados",
    value: "7",
    color: "text-[#00F0FF]",
  },
  {
    label: "Agentes operando",
    value: "3",
    color: "text-white",
  },
  {
    label: "Economia operacional",
    value: "32h/mês",
    color: "text-[#d7b8ff]",
  },
  {
    label: "Capacidade estimada",
    value: "+2 CLTs",
    color: "text-[#00F0FF]",
  },
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Agentes</p>
            <p className="mt-1 text-xs text-white/45">
              Centro de operação dos agentes do Luma OS
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/plans"
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80"
            >
              Ver planos
            </Link>
            <Link
              href="/member-user"
              className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white"
            >
              Voltar ao painel
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="mb-8 rounded-[30px] border border-[#7A00FF]/20 bg-gradient-to-r from-[#0b0d12] via-[#11131b] to-[#171126] p-5 shadow-[0_0_40px_rgba(122,0,255,0.10)]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
                Sistema de trabalho automatizado
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                Seus agentes operam como uma equipe digital dentro da plataforma.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
                Cada agente executa uma função estratégica que antes exigiria tempo,
                energia e contratação humana. Conforme você sobe de plano, mais agentes
                são liberados para operar e acelerar seu crescimento.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-[#d7b8ff]">Plano ativo</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Prime</h2>
              <p className="mt-2 text-sm text-white/60">
                Seu plano libera até <span className="font-semibold text-[#00F0FF]">7 agentes</span>.
              </p>

              <div className="mt-5 h-4 w-full rounded-full bg-white/10">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]"
                  style={{ width: "68%" }}
                />
              </div>

              <p className="mt-3 text-sm text-white/55">
                Você está usando 68% da capacidade operacional liberada no seu plano.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-xs text-white/40">{item.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* PLANOS */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Agentes disponíveis por plano
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Quanto maior o plano, maior a quantidade de agentes liberados e maior
              a capacidade operacional do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[28px] border p-5 ${plan.color}`}
              >
                {plan.highlight && (
                  <div className="mb-4 inline-flex rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
                    Mais recomendado
                  </div>
                )}

                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-white/60">{plan.status}</p>

                <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/40">Agentes liberados</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {plan.agents}
                  </p>
                </div>

                <button className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
                  Selecionar plano
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* AGENTES */}
        <section className="mb-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Seus agentes
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Veja o status de implementação, o nível de operação e o benefício
                gerado por cada agente.
              </p>
            </div>

            <div className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-4 py-2 text-sm text-[#d7b8ff]">
              Quanto mais agentes operando, mais sua empresa trabalha sozinha
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {agentList.map((agent) => (
              <article
                key={agent.name}
                className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5 shadow-[0_0_30px_rgba(122,0,255,0.04)]"
              >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
                        {agent.role}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${agent.statusColor}`}
                      >
                        {agent.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                        {agent.level}
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold text-white">
                      {agent.name}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-white/60">
                      {agent.benefit}
                    </p>

                    <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-[#00F0FF]">
                        Ganho gerado
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/75">
                        {agent.gain}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">
                        Nível de operação
                      </p>
                      <span className="text-sm text-[#00F0FF]">
                        {agent.progress}%
                      </span>
                    </div>

                    <div className="h-4 w-full rounded-full bg-white/10">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]"
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Impacto</p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          Alto
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-white/40">Retorno</p>
                        <p className="mt-2 text-xl font-semibold text-[#d7b8ff]">
                          Crescente
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
                        Ver detalhes
                      </button>
                      <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white">
                        Evoluir agente
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* UPSELL */}
        <section className="rounded-[30px] border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Suba de plano e desbloqueie mais trabalho automatizado
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
                Quanto mais agentes você libera, menos sua operação depende de mão
                humana para captar, nutrir, vender, organizar e crescer. O sistema
                passa a operar como uma equipe digital trabalhando por você.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/plans"
                className="rounded-2xl bg-[#7A00FF] px-5 py-4 text-sm font-semibold text-white"
              >
                Ver upgrade de plano
              </Link>
              <Link
                href="/coming-soon"
                className="rounded-2xl border border-white/15 px-5 py-4 text-sm text-white/80"
              >
                Comparar benefícios
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
