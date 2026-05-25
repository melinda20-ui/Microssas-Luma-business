"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const sidebarItems = [
  { label: "Lobby Principal", icon: "🏛️", active: true },
  { label: "Empresas", icon: "🏢", active: false },
  { label: "Estratégia", icon: "🎯", active: false },
  { label: "CRM & Funis", icon: "🔁", active: false },
  { label: "Marketing", icon: "📈", active: false },
  { label: "Drive & Mídia", icon: "📁", active: false },
  { label: "Escritório Virtual", icon: "💻", active: false },
];

const sectors = [
  { label: "Estratégia", icon: "🎯", gradient: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20", desc: "Planejamento e decisões", href: "/studio/mia-brain" },
  { label: "CRM & Funis", icon: "🔁", gradient: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/20", desc: "Gestão de relacionamento", href: "/funilmaster" },
  { label: "Marketing", icon: "📈", gradient: "from-green-500/20 to-emerald-500/10", border: "border-green-500/20", glow: "shadow-green-500/20", desc: "Tráfego e campanhas", href: "/studio/campaign-agent" },
  { label: "Drive & Mídia", icon: "📁", gradient: "from-orange-500/20 to-yellow-500/10", border: "border-orange-500/20", glow: "shadow-orange-500/20", desc: "Ativos e arquivos", href: "/dashboard/video-factory" },
  { label: "Postagens", icon: "✍️", gradient: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/20", glow: "shadow-pink-500/20", desc: "Conteúdo e redes", href: "/studio/blog-agent" },
  { label: "Escritório Virtual", icon: "💻", gradient: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/20", desc: "Salas e reuniões", href: "/studio-lab" },
];

const kpis = [
  { label: "Empresas", value: "7", suffix: "", color: "from-blue-400 to-cyan-400" },
  { label: "Funcionários", value: "24", suffix: "", color: "from-purple-400 to-pink-400" },
  { label: "Leads Hoje", value: "342", suffix: "", color: "from-green-400 to-emerald-400" },
  { label: "Vendas", value: "R$ 58.430", suffix: "", color: "from-orange-400 to-yellow-400" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HoldingLobby() {
  const [activeSidebar, setActiveSidebar] = useState("Lobby Principal");

  return (
    <div className="min-h-screen bg-[#060816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-72 border-r border-white/[0.06] bg-black/40 backdrop-blur-2xl p-6 flex flex-col relative z-10 shrink-0"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            HOLDING EMPRESAS
          </h1>
          <p className="text-white/40 text-sm mt-1 font-light tracking-wide">milakadosh.online</p>
        </motion.div>

        <nav className="space-y-1.5 flex-1">
          {sidebarItems.map((item, i) => (
            <motion.a
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => setActiveSidebar(item.label)}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium cursor-pointer
                transition-all duration-300 relative group
                ${activeSidebar === item.label
                  ? "bg-blue-500/15 border border-blue-500/25 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                }
              `}
            >
              {activeSidebar === item.label && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-2xl bg-blue-500/10 border border-blue-500/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-lg">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </motion.a>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-6 border-t border-white/[0.06] mt-6"
        >
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              LS
            </div>
            <div className="text-xs">
              <p className="font-medium text-white/70">Luma Santos</p>
              <p className="text-white/30">CEO • Holding</p>
            </div>
          </div>
        </motion.div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              className="w-[500px] bg-white/[0.04] border border-white/[0.07] rounded-2xl py-3.5 px-12 text-sm text-white/70 placeholder:text-white/25 outline-none transition-all duration-300 focus:border-blue-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_30px_rgba(59,130,246,0.08)] backdrop-blur-xl"
              placeholder="Buscar empresas, salas e funcionários..."
            />
          </div>

          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                3
              </span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                LS
              </div>
              <div>
                <h3 className="font-semibold text-sm">Luma Santos</h3>
                <p className="text-xs text-white/40">CEO • Holding</p>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* KPI Cards */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-5 mb-8"
        >
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white/[0.03] border border-white/[0.06] p-6 rounded-3xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(59,130,246,0.06)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} />
              <h3 className="text-white/40 text-sm font-light tracking-wide">{kpi.label}</h3>
              <p className={`text-4xl font-bold mt-2 bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}>
                {kpi.value}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-400/60">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                <span className="text-[11px]">+8% que ontem</span>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Building */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative bg-white/[0.02] border border-white/[0.06] rounded-[40px] p-10 backdrop-blur-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-semibold">Prédio Operacional</h2>
              <p className="text-sm text-white/30 mt-1">6 setores · clique para acessar</p>
            </div>
            <div className="flex gap-2">
              {["all", "active", "idle"].map((status) => (
                <span key={status} className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-300 cursor-pointer ${
                  status === "all"
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                    : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]"
                }`}>
                  {status === "all" ? "Todos" : status === "active" ? "Ativos" : "Ociosos"}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 relative z-10">
            {sectors.map((sector, i) => (
              <motion.a
                key={sector.label}
                href={sector.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`
                  group relative h-52 rounded-3xl bg-gradient-to-br ${sector.gradient}
                  border ${sector.border} p-6 cursor-pointer overflow-hidden
                  transition-all duration-500
                  hover:border-white/20 hover:shadow-[0_0_50px_-12px] ${sector.glow}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.03] rounded-full blur-2xl group-hover:bg-white/[0.06] transition-all duration-700" />

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">
                      {sector.icon}
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-white transition-colors duration-300">
                      {sector.label}
                    </h3>
                    <p className="text-sm text-white/40 mt-1 group-hover:text-white/60 transition-colors duration-300">
                      {sector.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/20 group-hover:text-white/50 transition-colors duration-300">
                    <span>Acessar setor</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Bottom status bar */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex items-center justify-between text-xs text-white/20"
        >
          <div className="flex items-center gap-4">
            <span>© 2026 Holding Milakadosh</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Todos os sistemas operacionais</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
            <span>Online</span>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
