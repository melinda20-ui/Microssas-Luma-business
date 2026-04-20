import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const courses = [
  {
    title: "Criação de Sites que Vendem",
    progress: "68%",
    status: "Em andamento",
    lessons: "14/22 aulas concluídas",
  },
  {
    title: "Automação para Microempresas",
    progress: "22%",
    status: "Recém iniciado",
    lessons: "3/18 aulas concluídas",
  },
  {
    title: "Estrutura Empresarial com IA",
    progress: "100%",
    status: "Concluído",
    lessons: "12/12 aulas concluídas",
  },
];

export default async function MemberCoursesPage() {
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
              <p className="text-sm font-semibold text-white">Área de membros</p>
              <p className="text-xs text-white/40">Cursos adquiridos</p>
            </div>
          </div>

          <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/80">
            Explorar novos cursos
          </button>
        </header>

        <section className="mb-8">
          <div className="mb-4 inline-flex rounded-full border border-[#7A00FF]/25 bg-[#7A00FF]/10 px-3 py-1 text-xs text-[#d7b8ff]">
            Biblioteca premium
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Todos os seus cursos organizados em uma jornada clara.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Continue do ponto em que parou, acompanhe progresso e acesse suas
            formações em um ambiente estruturado.
          </p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Cursos ativos</p>
            <p className="mt-3 text-3xl font-semibold text-white">3</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Concluídos</p>
            <p className="mt-3 text-3xl font-semibold text-[#00F0FF]">1</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs text-white/40">Horas estudadas</p>
            <p className="mt-3 text-3xl font-semibold text-[#d7b8ff]">27h</p>
          </div>
        </section>

        <section className="space-y-4">
          {courses.map((course) => (
            <article
              key={course.title}
              className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-white">{course.title}</h2>
                  <p className="mt-2 text-sm text-white/55">{course.lessons}</p>
                  <p className="mt-1 text-sm text-white/40">{course.status}</p>

                  <div className="mt-4 h-3 w-full max-w-xl rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#7A00FF]"
                      style={{ width: course.progress }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/45">Progresso: {course.progress}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75">
                    Ver trilha
                  </button>
                  <button className="rounded-xl bg-[#7A00FF] px-4 py-3 text-sm font-semibold text-white">
                    Continuar curso
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
