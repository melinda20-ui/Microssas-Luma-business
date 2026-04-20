"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const portfolio = [
  {
    title: "Site institucional premium",
    type: "Site empresarial",
    description:
      "Para empresas que querem presença forte, confiança e captação de clientes.",
  },
  {
    title: "Landing page de alta conversão",
    type: "Página de vendas",
    description:
      "Ideal para campanhas, ofertas, lançamentos e captação de leads.",
  },
  {
    title: "Blog estratégico com SEO",
    type: "Blog",
    description:
      "Estrutura pensada para atrair tráfego orgânico, ranquear e vender com conteúdo.",
  },
  {
    title: "Loja virtual elegante",
    type: "E-commerce",
    description:
      "Visual moderno, experiência mobile e foco em compra com confiança.",
  },
  {
    title: "Portal com área privada",
    type: "Área de membros",
    description:
      "Perfeito para serviços, acompanhamento de projetos e comunicação com clientes.",
  },
  {
    title: "Site para expert ou curso",
    type: "Infoproduto",
    description:
      "Ideal para especialistas, mentorias, consultorias e produtos digitais.",
  },
];

const faq = [
  {
    question: "Como funciona a demonstração grátis?",
    answer:
      "Você envia seu segmento, referências e objetivo. Depois disso, criamos 3 propostas visuais para você avaliar qual direção faz mais sentido para o seu negócio.",
  },
  {
    question: "O que acontece depois que eu escolho o modelo?",
    answer:
      "Depois da escolha, você recebe o orçamento. Com o pagamento aprovado, começamos a construção do seu site.",
  },
  {
    question: "Quanto tempo leva a entrega?",
    answer:
      "Sites comuns costumam levar cerca de 15 dias. Projetos maiores, com mais de 8 páginas ou e-commerce, podem chegar a 30 dias.",
  },
  {
    question: "Vocês entregam backup?",
    answer:
      "Sim. Entregamos backup e mantemos uma cópia de segurança para garantir estabilidade e segurança do projeto.",
  },
  {
    question: "Tem garantia?",
    answer:
      "Sim. Após a entrega, você tem 15 dias de garantia para correções de erros ou problemas sem custo adicional.",
  },
  {
    question: "O que vem como bônus?",
    answer:
      "Você recebe indexação inicial no Google, SEO estrutural do que for escrito no site e acesso à área de membros de serviços para acompanhar tudo.",
  },
];

const products = [
  { name: "Vestido Aura", price: "R$ 149,90" },
  { name: "Conjunto Glow", price: "R$ 129,90" },
  { name: "Blazer Lumi", price: "R$ 189,90" },
  { name: "Body Signature", price: "R$ 79,90" },
];

export default function SiteServicePage() {
  const [seconds, setSeconds] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) return 15 * 60;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1020] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <header className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.3em] text-cyan-300">
              LUMA STUDIO
            </p>
            <p className="mt-2 text-sm text-white/55">
              Sites, páginas de vendas, blogs e estruturas digitais que passam confiança e vendem mais
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="https://wa.me/5500000000000"
              className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-200"
            >
              WhatsApp ao vivo
            </Link>
            <Link
              href="/site-demo-request"
              className="rounded-2xl bg-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(217,70,239,0.4)] animate-pulse"
            >
              Peça sua demonstração grátis agora
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
              Apresente sua empresa com mais autoridade, clareza e conversão
            </div>

            <h1 className="max-w-5xl text-4xl font-semibold leading-tight md:text-6xl">
              Nós criamos sites que fazem sua empresa parecer maior, mais profissional e mais confiável.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
              Se hoje você sente que sua empresa não transmite o nível que ela realmente tem,
              nós resolvemos isso criando 3 propostas visuais baseadas no que você quer:
              uma mais futurista, uma mais moderna e uma mais institucional.
              Você escolhe a direção. Depois disso, seguimos para produção.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/site-demo-request"
                className="rounded-2xl bg-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_0_25px_rgba(217,70,239,0.4)] animate-pulse"
              >
                Peça sua demonstração grátis agora
              </Link>
              <Link
                href="https://wa.me/5500000000000"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80"
              >
                Falar com atendimento
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs text-white/45">Modelos iniciais</p>
                <p className="mt-2 text-2xl font-semibold">3</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs text-white/45">Prazo médio</p>
                <p className="mt-2 text-2xl font-semibold">15–30d</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs text-white/45">Garantia</p>
                <p className="mt-2 text-2xl font-semibold">15d</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs text-white/45">Bônus</p>
                <p className="mt-2 text-2xl font-semibold">SEO</p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="mb-4 rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
              <p className="text-sm font-semibold text-fuchsia-200">Promoção relâmpago</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">
                {minutes}:{secs}
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Código de condição especial:{" "}
                <span className="font-semibold text-cyan-200">LUMA15</span>
              </p>
            </div>

            <div className="mb-5 aspect-video rounded-[28px] border border-white/10 bg-[#121a31] p-4">
              <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-white/15 text-center text-white/45">
                Espaço para vídeo de vendas
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-[#121a31] p-5">
              <p className="text-sm font-semibold text-cyan-200">
                Como funciona nosso trabalho
              </p>

              <div className="space-y-3 text-sm leading-7 text-white/70">
                <p>1. Você envia seu segmento, referências e o que quer comunicar.</p>
                <p>2. Nós montamos 3 direções visuais para você comparar.</p>
                <p>3. Você escolhe a que mais combina com sua empresa.</p>
                <p>4. Após o pagamento, começamos a construção localmente.</p>
                <p>5. Depois entregamos, subimos na sua hospedagem e mantemos backup.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                Portfólio
              </p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
                Estruturas que podemos criar para o seu negócio
              </h2>
            </div>

            <Link
              href="/site-demo-request"
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 md:inline-flex"
            >
              Quero meus modelos
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portfolio.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_14px_30px_rgba(0,0,0,0.15)]"
              >
                <div className="mb-4 aspect-[16/10] rounded-[22px] bg-gradient-to-br from-cyan-300/20 to-fuchsia-500/20" />
                <div className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                  {item.type}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-3xl font-semibold md:text-4xl">
              O que está incluso no serviço
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
              Depois que você escolhe um dos modelos, seguimos para a construção do seu site,
              preparamos backups, subimos tudo para a sua plataforma e entregamos com organização
              e segurança.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                "3 modelos iniciais para decisão",
                "Construção completa do site",
                "Backup entregue + backup reserva",
                "SEO estrutural e indexação inicial no Google",
                "Acesso à área de membros de serviços",
                "Prazo entre 15 e 30 dias",
                "15 dias de garantia após entrega",
                "Organização para futura manutenção",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-[#121a31] p-4 text-sm leading-7 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="rounded-[34px] border border-white/10 bg-[#121a31] p-6">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Vitrine da loja integrada ao ecossistema
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
              Também podemos construir uma experiência de vitrine inspirada em grandes
              e-commerces, com visual mais clean e compra mais agradável.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.name}
                  className="rounded-[22px] border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-4 aspect-[3/4] rounded-[16px] bg-gradient-to-b from-[#1f2948] to-[#11182e]" />
                  <h3 className="text-sm font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-cyan-200">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {faq.map((item) => (
              <article
                key={item.question}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/15 to-cyan-400/10 p-8 text-white">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Agora é a hora de ver 3 modelos do seu futuro site
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                Clique no botão, envie suas referências e em até 3 horas você recebe
                seus modelos e o orçamento por e-mail e WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/site-demo-request"
                className="rounded-2xl bg-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_0_25px_rgba(217,70,239,0.4)] animate-pulse"
              >
                Peça sua demonstração grátis agora
              </Link>
              <Link
                href="https://wa.me/5500000000000"
                className="rounded-2xl border border-white/20 px-5 py-4 text-sm font-medium text-white"
              >
                WhatsApp ao vivo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
