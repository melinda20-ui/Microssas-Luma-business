import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const shortcuts = [
  {
    title: "Histórico de chats",
    desc: "Retome conversas e contextos anteriores.",
    href: "/coming-soon",
  },
  {
    title: "Dashboard de agentes",
    desc: "Veja agentes ativos e funções disponíveis.",
    href: "/coming-soon",
  },
  {
    title: "Dashboard de automações",
    desc: "Acompanhe status, falhas e revisões.",
    href: "/automations",
  },
  {
    title: "Área de membros - Serviços",
    desc: "Acesse seus serviços contratados e projetos em andamento.",
    href: "/member-services",
  },
  {
    title: "Área de membros - Cursos",
    desc: "Acesse os cursos adquiridos e continue seus estudos.",
    href: "/member-courses",
  },
  {
    title: "Mini Empresa",
    desc: "Central operacional do seu negócio.",
    href: "/mini-company",
  },
];

export default async function MemberUserPage() {
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
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80"
            >
              ←
            </Link>
            <div>
              <p className="text-sm font-semibold text-white">Painel do usuário</p>
              <p className="text-xs text-white/40">
                Seu centro principal dentro do Luma OS
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
            Conta ativa
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Dashboard central
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Tudo o que importa para você operar sua empresa em um só lugar.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Acesse chats, agentes, automações, serviços contratados, cursos e sua
            mini empresa com uma navegação clara e centralizada.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
              Visão geral
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Chats</p>
                <p className="mt-2 text-2xl font-semibold text-white">18</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Agentes</p>
                <p className="mt-2 text-2xl font-semibold text-[#d7b8ff]">7</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Automações</p>
                <p className="mt-2 text-2xl font-semibold text-[#00F0FF]">12</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-xs text-white/35">Projetos</p>
                <p className="mt-2 text-2xl font-semibold text-white">5</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6">
            <p className="text-sm font-semibold text-[#A855F7]">Ação rápida</p>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Entre no seu chat, revise automações ou acesse sua mini empresa
              com um clique.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/chat"
                className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white"
              >
                Abrir chat
              </Link>
              <Link
                href="/automations"
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80"
              >
                Ver automações
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
            >
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.desc}</p>

              <Link
                href={item.href}
                className="mt-6 inline-flex rounded-2xl border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-4 py-3 text-sm font-medium text-[#00F0FF]"
              >
                Acessar
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
