import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const kanbanColumns = [
  {
    title: "A Fazer",
    items: ["Site imobiliária", "Página de vendas IA"],
  },
  {
    title: "Em andamento",
    items: ["Site coach premium", "Landing page consultoria"],
  },
  {
    title: "Finalizando",
    items: ["Blog clínica", "Página curso online"],
  },
];

const recentProjects = [
  "Loja Moda",
  "Site Coach",
  "Landing IA",
  "Ecommerce",
  "Blog Feminino",
  "Página Webinar",
];

const chartBars = [
  { label: "Seg", value: 45 },
  { label: "Ter", value: 62 },
  { label: "Qua", value: 38 },
  { label: "Qui", value: 78 },
  { label: "Sex", value: 56 },
  { label: "Sáb", value: 30 },
  { label: "Dom", value: 48 },
];

export default async function ProviderDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const goal = 10000;
  const current = 4500;
  const remaining = goal - current;
  const progress = Math.min((current / goal) * 100, 100);

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-5 md:px-6">
        <header className="mb-8 border-b border-white/10 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Painel do Prestador</p>
              <p className="mt-1 text-xs text-white/45">
                Operação, metas, projetos, clientes e inteligência de produção
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
                Marketplace
              </button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
                Agentes
              </button>
              <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white">
                Edição de vídeo
              </button>
            </div>
          </div>
        </header>

        {/* META / GAME */}
        <section className="mb-8 rounded-[30px] border border-[#7A00FF]/20 bg-gradient-to-r from-[#0b0d12] via-[#11131b] to-[#171126] p-5 shadow-[0_0_40px_rgba(122,0,255,0.10)]">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d7b8ff]">
                Progresso da meta
              </p>
              <h1 className="mt-2 text-2xl font-semibold md:text-4xl">
                Você está construindo seu resultado dentro da plataforma
              </h1>
            </div>

            <div className="rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-sm text-[#00F0FF]">
              Meta do mês: R$ {goal.toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">Já atingido</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                R$ {current.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">Falta para meta</p>
              <p className="mt-2 text-3xl font-semibold text-[#d7b8ff]">
                R$ {remaining.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/40">Progresso</p>
              <p className="mt-2 text-3xl font-semibold text-[#00F0FF]">
                {Math.round(progress)}%
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="h-4 w-full rounded-full bg-white/10">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-white/55">
              Continue avançando. Cada novo projeto entregue aproxima você da sua meta financeira.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-white/40">Orçamentos pedidos</p>
            <p className="mt-2 text-2xl font-semibold text-white">18</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-white/40">Propostas visualizadas</p>
            <p className="mt-2 text-2xl font-semibold text-[#00F0FF]">11</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-white/40">Não aceitaram</p>
            <p className="mt-2 text-2xl font-semibold text-[#ff9cb5]">4</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-white/40">Faturamento recebido</p>
            <p className="mt-2 text-2xl font-semibold text-white">R$ 4.500</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs text-white/40">Faturamento pendente</p>
            <p className="mt-2 text-2xl font-semibold text-[#d7b8ff]">R$ 2.000</p>
          </div>
        </section>

        {/* ANÁLISE + GRÁFICO */}
        <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
            <h2 className="text-xl font-semibold">Leitura de performance</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Você está atraindo interesse, mas ainda há espaço para melhorar a conversão
              entre orçamento enviado e proposta aceita. Isso ajuda a perceber se seu serviço
              está sendo desejado, se a oferta está clara e se o preço está coerente com o valor percebido.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-white/40">Taxa de interesse</p>
                <p className="mt-2 text-2xl font-semibold text-[#00F0FF]">61%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-white/40">Conversão atual</p>
                <p className="mt-2 text-2xl font-semibold text-white">38%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-white/40">Perda percebida</p>
                <p className="mt-2 text-2xl font-semibold text-[#ff9cb5]">22%</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Movimento da semana</h2>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/50">
                Últimos 7 dias
              </span>
            </div>

            <div className="flex h-52 items-end justify-between gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              {chartBars.map((bar, i) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className={`w-full max-w-10 rounded-t-2xl ${
                      i % 2 === 0
                        ? "bg-gradient-to-t from-[#00F0FF] to-[#7A00FF]"
                        : "bg-gradient-to-t from-[#7A00FF] to-[#d7b8ff]"
                    }`}
                    style={{ height: `${bar.value * 1.5}px` }}
                  />
                  <span className="text-[11px] text-white/40">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KANBAN + CHAT */}
        <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Fluxo de projetos</h2>
              <span className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
                Estilo Trello
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {kanbanColumns.map((column) => (
                <div
                  key={column.title}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-3"
                >
                  <h3 className="mb-3 text-sm font-semibold text-white/85">
                    {column.title}
                  </h3>

                  <div className="space-y-3">
                    {column.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
              <h2 className="text-xl font-semibold">Chat com cliente</h2>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80">
                  Cliente: Quero algo moderno, mas que pareça confiável.
                </div>

                <div className="rounded-2xl border border-[#7A00FF]/20 bg-[#7A00FF]/10 p-3 text-sm text-[#ead8ff]">
                  Você: Perfeito. Vou montar opções com esse equilíbrio.
                </div>
              </div>

              <input
                placeholder="Responder..."
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
              <h2 className="text-xl font-semibold">Assistente IA</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Sugestão: melhorar o texto da proposta para aumentar a taxa de fechamento.
              </p>

              <input
                placeholder="Fale com a IA..."
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </section>

        {/* PROJETOS RECENTES */}
        <section className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projetos recentes</h2>
            <span className="text-sm text-white/45">
              Continue de onde parou
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {recentProjects.map((project) => (
              <button
                key={project}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-white/80 transition hover:bg-white/[0.06]"
              >
                {project}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
