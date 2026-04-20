import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const jobs = [
  {
    title: "Vídeo institucional - lançamento",
    status: "Processando",
    statusClass: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20",
    progress: "72%",
    note: "Legenda automática e cortes inteligentes em andamento.",
  },
  {
    title: "Short viral - oferta da semana",
    status: "Revisão",
    statusClass: "text-[#d7b8ff] bg-[#7A00FF]/10 border-[#7A00FF]/20",
    progress: "90%",
    note: "Aguardando sua aprovação final antes da exportação.",
  },
  {
    title: "Aula gravada - módulo 3",
    status: "Fila",
    statusClass: "text-white/80 bg-white/5 border-white/10",
    progress: "12%",
    note: "Na fila de renderização com prioridade normal.",
  },
];

export default async function VideoEditorPage() {
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
              <p className="text-sm font-semibold text-white">Área privada</p>
              <p className="text-xs text-white/40">Editor de vídeos com IA</p>
            </div>
          </div>

          <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]">
            Novo vídeo
          </button>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Estúdio inteligente
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Edite vídeos com apoio de IA, fila de processamento e revisão centralizada.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Envie materiais, acompanhe o progresso, revise cortes e organize a
            produção do seu conteúdo em um só painel.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Vídeos em processamento</p>
            <p className="mt-3 text-3xl font-semibold text-white">3</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Prontos para revisão</p>
            <p className="mt-3 text-3xl font-semibold text-[#d7b8ff]">1</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Exports este mês</p>
            <p className="mt-3 text-3xl font-semibold text-[#00F0FF]">18</p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
              Nova tarefa
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs text-white/45">Nome do projeto</label>
                <input
                  placeholder="Ex: Vídeo de oferta relâmpago"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/45">Objetivo do vídeo</label>
                <textarea
                  rows={5}
                  placeholder="Explique o que a IA deve fazer: cortar pausas, destacar pontos, legendar, fazer zoom..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-[#7A00FF] px-5 py-3 text-sm font-semibold text-white">
                  Enviar vídeo
                </button>
                <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/80">
                  Importar do Drive
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm font-semibold text-[#A855F7]">Comando rápido</p>
            <p className="mt-3 text-sm leading-7 text-white/75">
              “Quero que a IA tire pausas, crie cortes virais e exporte versões
              para Reels, Shorts e TikTok.”
            </p>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b0d12] p-4 text-sm text-white/70">
              O agente de vídeo poderá transformar esse pedido em uma fila real
              de edição, revisão e exportação.
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {jobs.map((job) => (
            <article
              key={job.title}
              className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${job.statusClass}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-2 text-sm text-white/55">{job.note}</p>

                  <div className="mt-4 h-3 w-full max-w-xl rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]"
                      style={{ width: job.progress }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/45">Progresso: {job.progress}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                    Ver detalhes
                  </button>
                  <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                    Revisar
                  </button>
                  <button className="rounded-xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-2 text-xs text-[#00F0FF]">
                    Abrir edição
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
