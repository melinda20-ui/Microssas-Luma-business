import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="flex flex-col justify-center px-6 py-16 md:px-10">
          <div className="mb-4 inline-flex w-fit rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Acesso seguro
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-6xl">
            Entre ou crie sua conta para acessar o Luma OS.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 md:text-base">
            Tenha acesso ao seu chat, agentes, automações, mini empresa,
            cursos e serviços contratados em um só sistema.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/80"
            >
              Voltar para home
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-16 md:px-10">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(122,0,255,0.08)] backdrop-blur-xl">
            <div className="space-y-4">
              <Link
                href="/sign-in"
                className="block w-full rounded-2xl bg-[#7A00FF] px-4 py-4 text-center text-sm font-semibold text-white shadow-[0_0_24px_rgba(122,0,255,0.28)]"
              >
                Entrar no Luma OS
              </Link>

              <Link
                href="/sign-up"
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-center text-sm text-white/80"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

