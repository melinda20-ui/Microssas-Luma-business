"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { PageSkeleton } from "@/components/ui/LoadingState";

const stats = [
  { label: "Créditos de IA", value: "850", unit: "tokens", trend: "+12%" },
  { label: "Sites Ativos", value: "3", unit: "/ 5", trend: "Premium" },
  { label: "Posts Gerados", value: "42", unit: "este mês", trend: "+5" },
  { label: "Automações", value: "8", unit: "ativas", trend: "OK" },
];

const recentActivity = [
  { id: 1, type: "website", name: "Landing Page Barbearia", status: "Concluído", date: "Há 2 horas" },
  { id: 2, type: "content", name: "Pack 10 posts Instagram", status: "Em progresso", date: "Há 15 min" },
  { id: 3, type: "automation", name: "Webhook Kiwify → WhatsApp", status: "Ativo", date: "Ontem" },
];

export default function Dashboard() {
  const { user, isLoaded } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isLoaded) return <PageSkeleton />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#04040f] text-white flex items-center justify-center p-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 max-w-md w-full backdrop-blur-xl text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold font-outfit mb-3">Acesso Restrito</h2>
          <p className="text-white/50 text-sm mb-6">Faça login para acessar o dashboard.</p>
          <Link href="/login" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-grid" />
      
      <div className="flex min-h-screen">
        <aside className="w-[260px] border-r border-white/[0.06] bg-[rgba(4,4,15,0.5)] backdrop-blur-xl p-6 sticky top-0 h-screen shrink-0">
          <div className="nav-logo mb-10">⚡ MicroSaaS</div>
          
          <nav className="flex flex-col gap-2">
            {[
              { id: "overview", label: "Início", icon: "🏠" },
              { id: "websites", label: "Meus Sites", icon: "🌐" },
              { id: "content", label: "Conteúdos", icon: "✍️" },
              { id: "automations", label: "Automações", icon: "⚙️" },
              { id: "settings", label: "Configurações", icon: "⚙️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-500/15 border border-indigo-500/25 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-xs">
              <div className="font-semibold mb-2">Plano Premium</div>
              <div className="h-1 bg-white/10 rounded mb-2">
                <div className="w-[60%] h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded" />
              </div>
              <div className="text-white/40">60% dos recursos usados</div>
              <Link href="#planos" className="grad-text block mt-3 font-bold">
                Upgrade para Pro →
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-10 relative z-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold font-outfit mb-1">Olá, {user.name || "Usuário"}! 👋</h1>
              <p className="text-white/40">Aqui está o resumo dos seus agentes de IA hoje.</p>
            </div>
            <Link href="/chat" className="btn btn-primary">
              🤖 Novo Pedido IA
            </Link>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl hover:bg-white/[0.06] hover:border-indigo-500/25 transition-all">
                <div className="text-white/40 text-sm mb-2">{s.label}</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-extrabold">{s.value}</div>
                  <div className="text-xs text-white/20">{s.unit}</div>
                </div>
                <div className="text-green-400 text-xs mt-2 font-semibold">{s.trend}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
                <h3 className="text-lg font-semibold">Atividades Recentes</h3>
                <button className="btn btn-ghost btn-sm">Ver tudo</button>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-left">
                    <th className="px-6 py-3 text-xs text-white/30 font-semibold">NOME</th>
                    <th className="px-6 py-3 text-xs text-white/30 font-semibold">TIPO</th>
                    <th className="px-6 py-3 text-xs text-white/30 font-semibold">STATUS</th>
                    <th className="px-6 py-3 text-xs text-white/30 font-semibold">DATA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((a) => (
                    <tr key={a.id} className="border-t border-white/[0.06]">
                      <td className="px-6 py-4 font-medium">{a.name}</td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${a.type === 'website' ? 'purple' : a.type === 'content' ? 'cyan' : 'pink'}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: a.status === 'Ativo' || a.status === 'Concluído' ? 'var(--green)' : 'var(--orange)' }}>
                        ● {a.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl p-6 text-white">
                <h3 className="font-bold mb-3">Precisa de um site agora?</h3>
                <p className="text-sm text-white/80 mb-5">O Agente Website Builder cria sua porta de entrada no mundo digital em segundos.</p>
                <Link href="/chat?agent=website" className="block w-full py-3 bg-white text-purple-700 rounded-2xl font-bold text-center hover:brightness-110 transition-all">
                  🏗️ Gerar Site Agora
                </Link>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-base font-bold mb-4">Seu Assistente de Suporte</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl">🤖</div>
                  <div>
                    <div className="font-semibold">Mia</div>
                    <div className="text-xs text-green-400">Online 24/7</div>
                  </div>
                </div>
                <Link href="/chat?agent=support" className="block w-full py-3 border border-white/10 rounded-2xl text-sm font-bold text-center hover:bg-white/[0.06] transition-all">
                  Dúvida rápida com a Mia
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
