import Link from "next/link";

const plans = [
  {
    name: "Teste grátis",
    price: "30 dias",
    highlight: false,
    description:
      "Teste completo da plataforma por 30 dias para validar a experiência real no seu negócio.",
    features: [
      "Teste por 30 dias",
      "Cadastro com cartão para ativação",
      "Cancelamento a qualquer momento",
      "Acesso inicial à experiência da plataforma",
      "Validação prática antes de assinar",
    ],
    cta: "Começar teste de 30 dias",
    note: "Você pode cancelar antes do fim do período de teste.",
  },
  {
    name: "Básico",
    price: "R$ 49/mês",
    highlight: false,
    description: "Ideal para quem está começando a estruturar a operação.",
    features: [
      "Mini Empresa essencial",
      "Acesso ao chat",
      "Cursos básicos",
      "1 área de serviço ativa",
    ],
    cta: "Assinar Básico",
    note: "Plano inicial para pequenos testes operacionais.",
  },
  {
    name: "Prime",
    price: "R$ 97/mês",
    highlight: true,
    description: "Mais recomendado para pequenos negócios em crescimento.",
    features: [
      "Mini Empresa completa",
      "Automações iniciais",
      "Cursos e serviços liberados",
      "Área do usuário avançada",
      "Prioridade média no suporte",
    ],
    cta: "Assinar Prime",
    note: "Melhor equilíbrio entre estrutura, automação e custo.",
  },
  {
    name: "Premium",
    price: "R$ 197/mês",
    highlight: false,
    description: "Para empresas que querem operar com automação e escala.",
    features: [
      "Mais automações liberadas",
      "Mais áreas de membros",
      "Recursos avançados",
      "Dashboard operacional ampliado",
      "Prioridade alta no suporte",
    ],
    cta: "Assinar Premium",
    note: "Ideal para empresas em fase de expansão.",
  },
  {
    name: "Pro",
    price: "R$ 397/mês",
    highlight: false,
    description: "Para operações robustas e times que querem controle total.",
    features: [
      "Tudo do Premium",
      "Acesso ampliado aos agentes",
      "Orquestração avançada",
      "Recursos de equipe",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    note: "Pensado para estruturas mais completas e profissionais.",
  },
];

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Planos do Luma OS
          </div>

          <h1 className="text-4xl font-semibold md:text-6xl">
            Escolha o plano ideal para o momento da sua empresa
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Comece com um teste de 30 dias, valide a plataforma com calma e,
            depois disso, escolha o plano que mais combina com a fase da sua operação.
          </p>
        </header>

        <section className="mb-8 rounded-[30px] border border-[#00F0FF]/20 bg-[#00F0FF]/10 p-5 text-center">
          <p className="text-sm font-semibold text-[#00F0FF]">
            Teste grátis de 30 dias com cartão para ativação
          </p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Você poderá cancelar quando quiser durante o período de teste.
            Depois a gente conecta tudo isso ao Stripe para a cobrança e a gestão automática.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[30px] border p-6 ${
                plan.highlight
                  ? "border-[#7A00FF]/40 bg-[#7A00FF]/10 shadow-[0_0_40px_rgba(122,0,255,0.18)]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              {plan.highlight && (
                <div className="mb-4 inline-flex rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/10 px-3 py-1 text-xs text-[#00F0FF]">
                  Mais recomendado
                </div>
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-[#00F0FF]">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <p className="mt-6 text-xs leading-5 text-white/40">{plan.note}</p>

              <Link
                href="/auth"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ${
                  plan.highlight
                    ? "bg-[#7A00FF] text-white"
                    : "border border-white/10 bg-white/[0.05] text-white/85"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/80"
          >
            Voltar para home
          </Link>
        </div>
      </div>
    </main>
  );
}
