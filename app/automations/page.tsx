import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const stats = [
  {
    label: "Automações ativas",
    value: "12",
    tone: "cyan",
  },
  {
    label: "Em revisão",
    value: "04",
    tone: "purple",
  },
  {
    label: "Com erro",
    value: "02",
    tone: "rose",
  },
  {
    label: "Execuções hoje",
    value: "186",
    tone: "emerald",
  },
];

const automations = [
  {
    name: "Lead → CRM → WhatsApp",
    category: "Vendas",
    status: "Ativa",
    statusColor: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20",
    lastRun: "há 3 min",
    note: "Captura lead do formulário e envia para atendimento.",
  },
  {
    name: "Novo cliente → Área de membros",
    category: "Onboarding",
    status: "Revisão",
    statusColor: "text-[#d7b8ff] bg-[#7A00FF]/10 border-[#7A00FF]/20",
    lastRun: "há 18 min",
    note: "Cria acesso inicial, briefing e checklist do projeto.",
  },
  {
    name: "Upload de vídeo → fila de edição",
    category: "Mídia IA",
    status: "Erro",
    statusColor: "text-rose-300 bg-rose-500/10 border-rose-500/20",
    lastRun: "há 1 h",
    note: "Falha na etapa de envio do arquivo para processamento.",
  },
  {
    name: "Pedido aprovado → cobrança e entrega",
    category: "Financeiro",
    status: "Pausada",
    statusColor: "text-white/70 bg-white/5 border-white/10",
    lastRun: "ontem",
    note: "Aguardando ajuste na integração de pagamento.",
  },
];

const activityBars = [
  { day: "Seg", height: "h-16" },
  { day: "Ter", height: "h-24" },
  { day: "Qua", height: "h-20" },
  { day: "Qui", height: "h-28" },
  { day: "Sex", height: "h-24" },
  { day: "Sáb", height: "h-12" },
  { day: "Dom", height: "h-10" },
];

export default async function AutomationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-5 md:px-6">
        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/member-user"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80"
            >
              ←
            </Link>

            <div>
              <p className="text-sm font-semibold text-white">Automações</p>
              <p className="text-xs text-white/40">
                Centro de orquestração do Luma OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF] md:block">
              Orquestração ativa
            </div>

            <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)] transition hover:bg-[#8d28ff]">
              Nova automação
            </button>
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff] shadow-[0_0_18px_rgba(122,0,255,0.12)]">
            Painel operacional privado
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Gerencie, acompanhe e refine suas automações em um só painel.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Veja o status dos fluxos, acompanhe erros, identifique gargalos e
            use o comando manual para orientar o agente a ajustar a automação
            certa sem precisar entrar no n8n.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(122,0,255,0.05)] backdrop-blur-xl"
            >
              <p className="text-xs text-white/40">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
                  Atividade
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Ritmo de execução das automações
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-[#0b0d12] px-3 py-1 text-xs text-white/55">
                Últimos 7 dias
              </div>
            </div>

            <div className="flex h-44 items-end justify-between gap-3 rounded-[24px] border border-white/10 bg-[#0b0d12] p-5">
              {activityBars.map((bar, index) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className={`w-full max-w-10 rounded-t-2xl bg-gradient-to-t ${
                      index % 2 === 0
                        ? "from-[#7A00FF] to-[#00F0FF]"
                        : "from-[#00F0FF] to-[#A855F7]"
                    } ${bar.height}`}
                  />
                  <span className="text-[11px] text-white/40">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
            <p className="text-sm font-semibold text-[#A855F7]">
              Agente de automações
            </p>
            <p className="mt-3 text-sm leading-7 text-white/75">
              “Posso revisar, reorganizar e sugerir melhorias nas suas automações.
              Diga o que você quer alterar e eu preparo a próxima ação.”
            </p>

            <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                Quero corrigir o erro da automação de vídeo.
              </div>

              <div className="rounded-2xl border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-4 py-3 text-sm text-[#e5d3ff]">
                Posso revisar o fluxo, identificar o ponto de falha e preparar a
                alteração para sua aprovação.
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <input
                placeholder="Descreva a alteração que você quer..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00F0FF]"
              />
              <button className="rounded-2xl bg-[#7A00FF] px-5 py-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]">
                Enviar
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Suas automações
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Visão geral dos fluxos e do status operacional
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-2 text-xs text-[#00F0FF]">
                Todas
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                Ativas
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                Erros
              </button>
              <button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70">
                Revisão
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {automations.map((automation) => (
              <article
                key={automation.name}
                className="rounded-[24px] border border-white/10 bg-[#0b0d12] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
                        {automation.category}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${automation.statusColor}`}
                      >
                        {automation.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {automation.name}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                      {automation.note}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <div className="text-sm text-white/45">
                      Última execução:{" "}
                      <span className="text-white/75">{automation.lastRun}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                        Ver detalhes
                      </button>
                      <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                        Editar
                      </button>
                      <button className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-2 text-xs text-[#00F0FF]">
                        Ação rápida
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
