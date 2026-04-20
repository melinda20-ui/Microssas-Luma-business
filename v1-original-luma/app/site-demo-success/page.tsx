import Link from "next/link";

export default function SiteDemoSuccessPage() {
  return (
    <main className="min-h-screen bg-[#eef3f1] text-[#17212b]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          Solicitação recebida
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          Bem-vinda(o). Nós vamos criar 3 modelos do site que você solicitou.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-black/60 md:text-base">
          Você vai receber os modelos por e-mail, junto com o orçamento, e também
          um aviso no WhatsApp. Em até 3 horas, você terá esse retorno.
        </p>

        <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-6 text-left shadow-[0_15px_35px_rgba(0,0,0,0.05)]">
          <p className="text-sm leading-7 text-black/65">
            Enquanto aguarda, vá para o nosso blog e explore conteúdos sobre negócios,
            marketing, produtividade, finanças e identidade.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/blog"
            className="rounded-2xl bg-[#0f766e] px-5 py-4 text-sm font-semibold text-white"
          >
            Ir para o blog
          </Link>

          <Link
            href="/site-service"
            className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm text-black/75"
          >
            Voltar para a página de sites
          </Link>
        </div>
      </div>
    </main>
  );
}
