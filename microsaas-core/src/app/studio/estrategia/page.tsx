"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  Rocket,
  Globe,
  BrainCircuit,
  Zap,
  BarChart3,
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  ChevronRight,
} from "lucide-react";

const kpis = [
  { label: "Receita Anual", value: "R$ 2.4M", change: "+23%", color: "from-blue-400 to-cyan-400", progress: 68 },
  { label: "Usuários", value: "24.5k", change: "+12%", color: "from-purple-400 to-pink-400", progress: 45 },
  { label: "Crescimento", value: "187%", change: "+8%", color: "from-green-400 to-emerald-400", progress: 82 },
  { label: "Engajamento", value: "94.2%", change: "+5%", color: "from-orange-400 to-yellow-400", progress: 94 },
];

const goals = [
  {
    title: "Expandir holding para 100 mil usuários",
    progress: 23,
    quarter: "Q2 2026",
    color: "blue",
    icon: <Users className="w-5 h-5" />,
    owner: "Luma",
  },
  {
    title: "Construir IA operacional proprietária",
    progress: 45,
    quarter: "Q3 2026",
    color: "purple",
    icon: <BrainCircuit className="w-5 h-5" />,
    owner: "Mia",
  },
  {
    title: "Escalar ecossistema Sualuma",
    progress: 31,
    quarter: "Q4 2026",
    color: "cyan",
    icon: <Globe className="w-5 h-5" />,
    owner: "João",
  },
  {
    title: "Automação completa de funis",
    progress: 67,
    quarter: "Q2 2026",
    color: "green",
    icon: <Zap className="w-5 h-5" />,
    owner: "Time",
  },
];

const roadmap = [
  { year: "2024", label: "Fundação", desc: "Criação da holding e primeira empresa", done: true, icon: "🌱" },
  { year: "2025", label: "Estruturação", desc: "Squad de agentes e CRM operacional", done: true, icon: "🏗️" },
  { year: "2026", label: "Escala", desc: "IA proprietária e 100k usuários", done: false, icon: "🚀" },
  { year: "2027", label: "Liderança", desc: "Maior holding de IA do Brasil", done: false, icon: "👑" },
];

const team = [
  { name: "Luma Santos", role: "CEO • Holding", status: "online", avatar: "LS", color: "from-purple-500 to-pink-500" },
  { name: "João", role: "Estratégia", status: "online", avatar: "J", color: "from-blue-500 to-cyan-500" },
  { name: "Mia", role: "IA Supervisora", status: "online", avatar: "M", color: "from-green-500 to-emerald-500" },
  { name: "Ana", role: "Marketing", status: "idle", avatar: "A", color: "from-orange-500 to-yellow-500" },
];

const timeline = [
  { date: "Jan 2026", title: "Migração de infraestrutura", status: "done", desc: "Cloud migrada com sucesso" },
  { date: "Fev 2026", title: "IA Squad operacional", status: "done", desc: "5 agentes em produção" },
  { date: "Mar 2026", title: "Painel holding em tempo real", status: "done", desc: "Dashboards implantados" },
  { date: "Abr 2026", title: "Automação de funis completa", status: "current", desc: "Em andamento" },
  { date: "Mai 2026", title: "Escalar para 50k usuários", status: "pending", desc: "Próximo marco" },
  { date: "Jun 2026", title: "Lançamento IA proprietária", status: "pending", desc: "Beta fechado" },
];

const annualGoals = [
  { label: "Receita", value: 78, color: "from-blue-400 to-cyan-400" },
  { label: "Usuários", value: 45, color: "from-purple-400 to-pink-400" },
  { label: "Produto", value: 92, color: "from-green-400 to-emerald-400" },
  { label: "Equipe", value: 60, color: "from-orange-400 to-yellow-400" },
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const colors: Record<string, string> = {
  blue: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 shadow-blue-500/10",
  purple: "from-purple-500/20 to-pink-500/10 border-purple-500/20 shadow-purple-500/10",
  cyan: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20 shadow-cyan-500/10",
  green: "from-green-500/20 to-emerald-500/10 border-green-500/20 shadow-green-500/10",
};

const barColors: Record<string, string> = {
  blue: "from-blue-500 to-cyan-400",
  purple: "from-purple-500 to-pink-400",
  cyan: "from-cyan-500 to-blue-400",
  green: "from-green-500 to-emerald-400",
};

const progressColors: Record<string, string> = {
  blue: "stroke-blue-500",
  purple: "stroke-purple-500",
  cyan: "stroke-cyan-500",
  green: "stroke-green-500",
  orange: "stroke-orange-500",
};

const ringColors: Record<string, string> = {
  blue: "from-blue-500 to-cyan-400",
  purple: "from-purple-500 to-pink-400",
  green: "from-green-500 to-emerald-400",
  orange: "from-orange-500 to-yellow-400",
};

function CircularGauge({ value, color, size = 64, strokeWidth = 4, label }: { value: number; color: string; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gauge-${color.replace(/\s/g, "")})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id={`gauge-${color.replace(/\s/g, "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.includes("blue") ? "#3b82f6" : color.includes("purple") ? "#a855f7" : color.includes("green") ? "#22c55e" : "#f59e0b"} />
            <stop offset="100%" stopColor={color.includes("blue") ? "#06b6d4" : color.includes("purple") ? "#ec4899" : color.includes("green") ? "#10b981" : "#eab308"} />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold">{value}%</span>
    </div>
  );
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px] h-20">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: "easeOut" }}
          className={`w-4 rounded-sm bg-gradient-to-t ${color} opacity-80 hover:opacity-100 transition-opacity`}
        />
      ))}
    </div>
  );
}

function MiniLineChart() {
  const points = [20, 45, 38, 62, 55, 78, 70, 90, 85, 95, 88, 100];
  const width = 240;
  const height = 64;
  const max = Math.max(...points);
  const stepX = width / (points.length - 1);
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${height - (p / max) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="w-full">
      <motion.path
        d={pathD}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RadarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const cx = 100;
  const cy = 100;
  const r = 80;
  const angleStep = (2 * Math.PI) / data.length;

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygonPoints = (scale: number) =>
    data
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * scale * Math.cos(angle);
        const y = cy + r * scale * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");

  const dataPoints = data
    .map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const val = (d.value / 100) * r;
      const x = cx + val * Math.cos(angle);
      const y = cy + val * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(level)}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}
      <motion.polygon
        points={dataPoints}
        fill="rgba(59,130,246,0.1)"
        stroke="url(#radarGrad)"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <defs>
        <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const val = (d.value / 100) * r;
        const x = cx + val * Math.cos(angle);
        const y = cy + val * Math.sin(angle);
        return (
          <g key={d.label}>
            <motion.circle
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              className={d.color.replace("from-", "text-").split(" ")[0].replace("from-", "text-")}
              initial={{ r: 0 }}
              animate={{ r: 3 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
            <text
              x={cx + (r + 16) * Math.cos(angle)}
              y={cy + (r + 16) * Math.sin(angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/40 text-[8px]"
              fontSize="8"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SalaEstrategica() {
  return (
    <div className="min-h-screen bg-[#050816] text-white p-8 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-100px] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center gap-2 text-sm font-medium text-blue-300/70 tracking-widest uppercase">
            <Activity className="w-4 h-4" />
            Holding
          </span>
          <span className="w-1 h-1 rounded-full bg-blue-400/40" />
          <span className="text-sm text-white/30">Sala Executiva</span>
          <span className="w-1 h-1 rounded-full bg-blue-400/40" />
          <span className="flex items-center gap-1.5 text-xs text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
            Tempo real
          </span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-100 via-white to-blue-200 bg-clip-text text-transparent">
          Sala Estratégica
        </h1>
        <p className="text-white/40 mt-2 text-lg font-light max-w-2xl">
          Planejamento da holding, visão anual e indicadores executivos
        </p>
      </motion.div>

      {/* KPI Gauges Row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-5 mb-6 relative z-10"
      >
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={item}
            whileHover={{ y: -4 }}
            className="relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_0_40px_rgba(59,130,246,0.06)]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-white/40 text-xs font-light tracking-wide">{kpi.label}</p>
                <p className={`text-3xl font-bold mt-1 bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}>
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-400/60">
                  <TrendingUp className="w-3 h-3" />
                  <span>{kpi.change}</span>
                  <span className="text-white/20 ml-1">vs mês anterior</span>
                </div>
              </div>
              <CircularGauge value={kpi.progress} color={kpi.color} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-5 relative z-10"
      >
        {/* Strategic Plan */}
        <motion.div variants={item} className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <h2 className="text-xl font-semibold">Plano Estratégico 2026</h2>
              </div>
              <p className="text-white/30 text-xs mt-1">4 metas ativas · {Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)}% conclusão média</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
                Ao vivo
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
                Q2 2026
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {goals.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className={`p-5 rounded-2xl bg-gradient-to-r ${colors[g.color]} border relative overflow-hidden group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${barColors[g.color]} bg-opacity-20 text-white`}>
                      {g.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-sm">{g.title}</h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          g.color === "blue" ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" :
                          g.color === "purple" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" :
                          g.color === "cyan" ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" :
                          "bg-green-500/10 text-green-300 border border-green-500/20"
                        }`}>{g.quarter}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">Responsável: {g.owner}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{g.progress}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden relative z-10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.progress}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${barColors[g.color]}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Online Team + Mini Chart */}
        <motion.div variants={item} className="flex flex-col gap-5">
          {/* Online Team */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-xl font-semibold">Equipe Online</h3>
            </div>
            <p className="text-white/30 text-xs mb-6">{team.filter(m => m.status === "online").length} online · {team.filter(m => m.status === "idle").length} ausente</p>

            <div className="space-y-3">
              {team.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-sm font-bold shadow-lg relative`}>
                      {m.avatar}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050816] ${
                        m.status === "online" ? "bg-green-400" : "bg-yellow-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-white/40">{m.role}</p>
                    </div>
                    <span className="text-xs text-white/20 flex items-center gap-1">
                      {m.status === "online" ? "Ativo" : "Ausente"}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-all">
                  <Plus className="w-4 h-4 text-white/30" />
                </div>
                <div>
                  <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Convidar membro</p>
                  <p className="text-xs text-white/20">Adicionar ao conselho</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Mini Chart */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold">Crescimento</h3>
            </div>
            <MiniBarChart data={[20, 35, 28, 45, 52, 48, 68, 75, 82, 78, 91, 100]} color="from-blue-500 to-cyan-400" />
            <div className="flex justify-between text-[10px] text-white/20 mt-2">
              <span>Jan</span><span>Jun</span><span>Dez</span>
            </div>
          </div>
        </motion.div>

        {/* Annual Vision */}
        <motion.div variants={item} className="col-span-1 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="text-xl font-semibold">Visão Anual</h3>
          </div>
          <p className="text-white/30 text-xs mb-6">Metas da holding 2026</p>

          <RadarChart data={annualGoals} />

          <div className="mt-6 space-y-3">
            {annualGoals.map((g) => (
              <div key={g.label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">{g.label}</span>
                    <span className="text-white/70 font-medium">{g.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${g.value}%` }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${g.color}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div variants={item} className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-4 h-4 text-blue-400" />
            <h3 className="text-xl font-semibold">Roadmap</h3>
          </div>
          <p className="text-white/30 text-xs mb-8">Evolução da holding · 4 fases</p>

          <div className="grid grid-cols-4 gap-4">
            {roadmap.map((r, i) => (
              <motion.div
                key={r.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className="text-center relative"
              >
                <div className="relative mb-4">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-xl relative z-10 transition-all duration-300 ${
                    r.done
                      ? "bg-green-500/15 border border-green-500/30 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                      : "bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.15]"
                  }`}>
                    {r.icon}
                  </div>
                  {i < roadmap.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+32px)] right-0 h-[2px] bg-gradient-to-r from-white/[0.08] to-transparent hidden md:block" />
                  )}
                </div>
                <h4 className="text-lg font-bold bg-gradient-to-r from-white/80 to-white/40 bg-clip-text text-transparent">{r.year}</h4>
                <p className="text-xs font-medium text-white/50 mt-1">{r.label}</p>
                <p className="text-[11px] text-white/30 mt-1 leading-relaxed">{r.desc}</p>
                <div className={`mt-3 inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full ${
                  r.done
                    ? "bg-green-500/10 text-green-300 border border-green-500/20"
                    : "bg-white/[0.03] text-white/30 border border-white/[0.06]"
                }`}>
                  {r.done ? (
                    <><CheckCircle2 className="w-3 h-3" /> Concluído</>
                  ) : (
                    <><Circle className="w-3 h-3" /> Em andamento</>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Anual progress line */}
          <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs text-white/30 mb-3">
              <span>Progresso Anual</span>
              <span className="text-white/50 font-medium">42%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "42%" }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[10px] text-white/20 mt-2">
              <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
            </div>
          </div>
        </motion.div>

        {/* Strategic Timeline */}
        <motion.div variants={item} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-xl font-semibold">Timeline</h3>
          </div>
          <p className="text-white/30 text-xs mb-6">Marcos estratégicos</p>

          <div className="space-y-0 relative">
            <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-gradient-to-b from-blue-500/40 via-purple-500/20 to-transparent" />
            {timeline.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex items-start gap-4 pb-5 relative group cursor-pointer"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 shrink-0 mt-0.5 transition-all duration-300 ${
                  t.status === "done"
                    ? "bg-green-500/20 border border-green-500/30 text-green-300"
                    : t.status === "current"
                    ? "bg-blue-500/20 border border-blue-500/30 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "bg-white/[0.03] border border-white/[0.06] text-white/30"
                }`}>
                  {t.status === "done" ? <CheckCircle2 className="w-3 h-3" /> : t.status === "current" ? <Zap className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-white/30 font-mono">{t.date}</p>
                  <p className={`text-sm mt-0.5 ${
                    t.status === "done" ? "text-white/60" : t.status === "current" ? "text-white font-medium" : "text-white/40"
                  }`}>{t.title}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">{t.desc}</p>
                </div>
                {t.status === "current" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    Atual
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mini line chart insight */}
          <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[11px] text-white/30 mb-2">Crescimento acumulado</p>
            <MiniLineChart />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Status Bar */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 flex items-center justify-between text-xs text-white/20 relative z-10 pt-6 border-t border-white/[0.04]"
      >
        <div className="flex items-center gap-4">
          <span>© 2026 Holding Milakadosh</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Todos os sistemas operacionais</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-green-400/40">Sala Estratégica Online</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
            <span>Sistemas operacionais</span>
          </div>
          <span className="text-white/10">v2.4.1</span>
        </div>
      </motion.footer>
    </div>
  );
}
