"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SiteDemoRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    segment: "",
    currentSite: "",
    referenceSite: "",
    name: "",
    email: "",
    whatsapp: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const existing = JSON.parse(
      localStorage.getItem("luma_site_briefings") || "[]"
    );

    const newBriefing = {
      id: Date.now(),
      createdAt: new Date().toLocaleString("pt-BR"),
      status: "Novo briefing",
      comments: [],
      ...form,
    };

    localStorage.setItem(
      "luma_site_briefings",
      JSON.stringify([newBriefing, ...existing])
    );

    router.push("/site-demo-success");
  };

  return (
    <main className="min-h-screen bg-[#eef3f1] text-[#17212b]">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6">
        <header className="mb-8">
          <Link
            href="/site-service"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/75"
          >
            ← Voltar
          </Link>
        </header>

        <section className="rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.06)] md:p-8">
          <div className="mb-6 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
            Demonstração grátis
          </div>

          <h1 className="text-3xl font-semibold md:text-5xl">
            Vamos montar 3 modelos para o seu site
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60 md:text-base">
            Preencha as informações abaixo. Em até 3 horas você receberá os modelos
            e o orçamento por e-mail, além de um aviso no WhatsApp.
          </p>

          <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            Você receberá: 1 modelo futurista, 1 modelo moderno e 1 modelo mais institucional,
            todos baseados no que sua empresa precisa comunicar.
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Qual é o segmento da sua empresa?
              </label>
              <input
                value={form.segment}
                onChange={(e) => handleChange("segment", e.target.value)}
                placeholder="Ex: moda feminina, clínica, imobiliária, consultoria..."
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Qual é o seu site atual? (se tiver)
              </label>
              <input
                value={form.currentSite}
                onChange={(e) => handleChange("currentSite", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Qual site de referência você gostaria de ter?
              </label>
              <input
                value={form.referenceSite}
                onChange={(e) => handleChange("referenceSite", e.target.value)}
                placeholder="Cole aqui um link ou nome de referência"
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Seu nome
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Digite seu nome"
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Seu e-mail
              </label>
              <input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                type="email"
                placeholder="voce@empresa.com"
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black/70">
                Seu WhatsApp
              </label>
              <input
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full rounded-2xl border border-black/10 bg-[#f8fbfa] px-4 py-4 text-sm outline-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f766e] px-5 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,118,110,0.22)]"
            >
              Enviar e continuar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}


