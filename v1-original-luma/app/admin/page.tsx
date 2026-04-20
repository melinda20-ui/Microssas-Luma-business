import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-[#050507] text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-semibold">Painel de Conteúdo</h1>
        <p className="mt-3 text-white/60">
          Gerencie posts e páginas do blog e do site.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/posts"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="text-2xl font-semibold">Posts</h2>
            <p className="mt-2 text-white/60">Criar, editar e publicar artigos.</p>
          </Link>

          <Link
            href="/admin/pages"
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="text-2xl font-semibold">Páginas</h2>
            <p className="mt-2 text-white/60">Editar páginas fixas do site.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
