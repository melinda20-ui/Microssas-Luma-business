import Link from "next/link";

const professionals = [
  {
    name: "Studio Prime Web",
    specialty: "Criação de Sites",
    price: "A partir de R$ 1.500",
    rating: "5.0",
    desc: "Sites premium, landing pages e páginas de vendas com visual profissional.",
  },
  {
    name: "Luma Social Lab",
    specialty: "Marketing & Conteúdo",
    price: "A partir de R$ 790/mês",
    rating: "4.9",
    desc: "Estratégia de conteúdo, posicionamento digital e crescimento orgânico.",
  },
  {
    name: "Flow Automation",
    specialty: "Automações",
    price: "Sob consulta",
    rating: "5.0",
    desc: "Integrações com n8n, agentes, automações e fluxos operacionais.",
  },
  {
    name: "BrandPulse",
    specialty: "Branding",
    price: "A partir de R$ 980",
    rating: "4.8",
    desc: "Identidade visual, posicionamento e estrutura de marca para microempresas.",
  },
  {
    name: "VideoCraft Pro",
    specialty: "Edição de Vídeo",
    price: "A partir de R$ 450",
    rating: "4.9",
    desc: "Edição estratégica de vídeos, cortes virais e conteúdo para redes sociais.",
  },
  {
    name: "CopyGrowth",
    specialty: "Copywriting",
    price: "A partir de R$ 300",
    rating: "4.9",
    desc: "Textos de vendas, páginas, anúncios e funis com foco em conversão.",
  },
];

export default function ServicesPage() {
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
              <p className="text-sm font-semibold text-white">Serviços</p>
              <p className="text-xs text-white/40">
                Contrate profissionais e acompanhe tudo na plataforma
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
            Contratação
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff] shadow-[0_0_18px_rgba(122,0,255,0.12)]">
            Rede de talentos
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Encontre profissionais e transforme demandas em projetos.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Escolha especialistas, veja portfólios, contrate dentro da plataforma
            e acompanhe o projeto em uma área de membros organizada.
          </p>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[#00F0FF]">
              Como funciona
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-sm font-semibold text-white">1. Escolha</p>
                <p className="mt-2 text-xs leading-6 text-white/50">
                  Navegue pelos perfis e encontre o serviço ideal.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-sm font-semibold text-white">2. Contrate</p>
                <p className="mt-2 text-xs leading-6 text-white/50">
                  Envie briefing, requisitos e referências.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b0d12] p-4">
                <p className="text-sm font-semibold text-white">3. Acompanhe</p>
                <p className="mt-2 text-xs leading-6 text-white/50">
                  Veja etapas, suporte, arquivos e progresso na área de membros.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
            <p className="text-sm font-semibold text-[#A855F7]">Área de membros</p>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Toda contratação abre um espaço com briefing, progresso, mensagens,
              arquivos e atendimento assistido por IA.
            </p>

            <button className="mt-6 rounded-2xl bg-[#7A00FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]">
              Ver fluxo do projeto
            </button>
          </div>
        </section>

        <section className="mb-6">
          <div className="rounded-[24px] border border-white/10 bg-[#0b0d12] p-3 shadow-[0_0_30px_rgba(122,0,255,0.06)]">
            <input
              placeholder="Buscar criação de sites, automação, branding, copy..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00F0FF]"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {professionals.map((pro) => (
            <article
              key={pro.name}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
                  {pro.specialty}
                </span>

                <span className="text-xs text-[#00F0FF]">★ {pro.rating}</span>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#7A00FF] text-sm font-semibold text-black shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                  {pro.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">{pro.name}</h2>
                  <p className="text-xs text-white/40">{pro.specialty}</p>
                </div>
              </div>

              <p className="text-sm leading-6 text-white/55">{pro.desc}</p>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/35">Preço</p>
                  <p className="mt-1 text-sm font-medium text-[#00F0FF]">
                    {pro.price}
                  </p>
                </div>

                <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)] transition hover:bg-[#8d28ff]">
                  Contratar
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}


