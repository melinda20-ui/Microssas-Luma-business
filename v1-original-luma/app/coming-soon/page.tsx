import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
          Em construção
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
          Esta área ainda está sendo preparada no Luma OS.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
          O botão já está ativo para manter a navegação funcionando.
          Na próxima etapa, esta página será transformada em uma área real da plataforma.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/member-user"
            className="rounded-2xl bg-[#7A00FF] px-5 py-3 text-sm font-semibold text-white"
          >
            Voltar ao painel do usuário
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/80"
          >
            Ir para home
          </Link>
        </div>
      </div>
    </main>
  );
}
