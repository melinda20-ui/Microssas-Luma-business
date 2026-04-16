import Link from "next/link";

const tabs = ["Agentes", "Skills", "Templates", "Serviços", "Cursos"];

const items = [
  {
    title: "Agente de Sites",
    category: "Agentes",
    price: "A partir de R$ 97",
    desc: "Cria estruturas, páginas e ideias de sites com execução guiada.",
  },
  {
    title: "Skill de Copy",
    category: "Skills",
    price: "A partir de R$ 29",
    desc: "Melhora headlines, ofertas e textos de páginas de vendas.",
  },
  {
    title: "Template de Landing Page",
    category: "Templates",
    price: "A partir de R$ 49",
    desc: "Modelo pronto para páginas de captura, oferta e demonstração.",
  },
  {
    title: "Criação de Site Profissional",
    category: "Serviços",
    price: "Sob consulta",
    desc: "Solicite um site com briefing, aprovação e acompanhamento.",
  },
  {
    title: "Curso de Sites e Automações",
    category: "Cursos",
    price: "Gratuito + Premium",
    desc: "Aprenda a vender, estruturar e escalar usando IA e sistemas.",
  },
  {
    title: "Agente Financeiro",
    category: "Agentes",
    price: "A partir de R$ 67",
    desc: "Ajuda a entender entradas, saídas, metas e visão de caixa.",
  },
];

export default function MarketplacePage() {
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
              <p className="text-sm font-semibold text-white">Marketplace</p>
              <p className="text-xs text-white/40">
                Agentes, skills, serviços e modelos
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
            Premium
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff] shadow-[0_0_18px_rgba(122,0,255,0.12)]">
            Ecossistema comercial
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Encontre, compre e ative recursos para a sua empresa.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
            Explore agentes prontos, skills específicas, templates visuais,
            serviços profissionais e cursos organizados dentro do seu ecossistema.
          </p>
        </section>

        <section className="mb-5">
          <div className="rounded-[24px] border border-white/10 bg-[#0b0d12] p-3 shadow-[0_0_30px_rgba(122,0,255,0.06)]">
            <input
              placeholder="Buscar agentes, serviços, skills ou templates..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#00F0FF]"
            />
          </div>
        </section>

        <section className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm ${
                index === 0
                  ? "border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_24px_rgba(0,240,255,0.12)]"
                  : "border border-white/10 bg-white/[0.04] text-white/75"
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(122,0,255,0.06)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-[#7A00FF]/20 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
                  {item.category}
                </span>

                <span className="text-xs text-white/45">Luma Verified</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.desc}</p>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/35">Preço</p>
                  <p className="mt-1 text-sm font-medium text-[#00F0FF]">
                    {item.price}
                  </p>
                </div>

                <button className="rounded-2xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)] transition hover:bg-[#8d28ff]">
                  Ver detalhes
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

