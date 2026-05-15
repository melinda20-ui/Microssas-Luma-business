"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { readPageContext, formatContext, type PageContext } from "@/components/studio/domReader";

const API_URL = "http://localhost:3001";

type TaskStatus = "PENDING" | "APPROVED" | "EXECUTING" | "COMPLETED" | "REJECTED";

type BrainTask = {
  id: number;
  session_id: string;
  clerk_id: string;
  agent_id: string;
  title: string;
  description: string;
  payload: string;
  status: TaskStatus;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  role: "user" | "mia";
  content: string;
  agent?: string;
  ts: string;
};

type AgentMeta = {
  icon: string;
  label: string;
  color: string;
  desc: string;
};

const AGENTS: Record<string, AgentMeta> = {
  mia:        { icon: "🧠", label: "Mia (Cérebro)",   color: "purple", desc: "Coordenação central e suporte" },
  support:    { icon: "💬", label: "Suporte",          color: "orange", desc: "Suporte técnico 24/7" },
  content:   { icon: "✍️", label: "Content Creator",  color: "cyan",   desc: "Posts, blogs, e-mails" },
  website:   { icon: "🏗️", label: "Website Builder",  color: "purple", desc: "Sites completos com IA" },
  automation:{ icon: "⚙️", label: "Automation",       color: "pink",   desc: "Workflows n8n" },
  analytics: { icon: "📊", label: "Business Intel",    color: "green",  desc: "Insights e análises" },
  tiktok:    { icon: "📱", label: "TikTok Shop",       color: "pink",   desc: "Estratégia viral" },
  shopify:   { icon: "🛍️", label: "Shopify Expert",    color: "green",  desc: "Copy de vendas" },
  pinterest: { icon: "📌", label: "Pinterest Growth",  color: "orange", desc: "Tráfego visual" },
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING:    "border-yellow-500/40 bg-yellow-500/10",
  APPROVED:   "border-blue-500/40 bg-blue-500/10",
  EXECUTING:  "border-green-500/40 bg-green-500/10",
  COMPLETED:  "border-zinc-600/40 bg-zinc-600/10",
  REJECTED:   "border-red-500/40 bg-red-500/10",
};

function genSessionId() {
  return `brain_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function MiaBrain() {
  const { user, isLoaded } = useUser();
  const [sessionId] = useState(genSessionId);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  const [activeAgent, setActiveAgent] = useState("mia");
  const [autoMode, setAutoMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "mia",
      content: "🧠 Olá! Sou Mia, o cérebro do Studio. Posso coordenar os agentes especialistas para você. Selecione um agente manualmente ou ative o **Modo Automático** e eu decido quem acionar.",
      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<BrainTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [contextVisible, setContextVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollDown(); }, [messages]);

  useEffect(() => {
    setPageContext(readPageContext());
  }, []);

  const refreshTasks = useCallback(async () => {
    if (!user) return;
    setTasksLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks/${sessionId}`);
      if (res.ok) {
        const data: BrainTask[] = await res.json();
        setTasks(data);
        console.log(`[MiaBrain] ${data.length} tarefas carregadas`);
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao carregar tarefas:", err);
    } finally {
      setTasksLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    refreshTasks();
    const interval = setInterval(refreshTasks, 10000);
    return () => clearInterval(interval);
  }, [isLoaded, user, refreshTasks]);

  const createTask = async (agentId: string, title: string, description: string, payload: object) => {
    if (!user) return null;
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user.id },
        body: JSON.stringify({
          sessionId,
          clerkId: user.id,
          agentId,
          title,
          description,
          payload,
        }),
      });
      if (res.ok) {
        const task: BrainTask = await res.json();
        setTasks((prev) => [task, ...prev]);
        console.log(`[MiaBrain] Tarefa #${task.id} criada:`, title);
        return task;
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao criar tarefa:", err);
    }
    return null;
  };

  const approveTask = async (taskId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks/${taskId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id }),
      });
      if (res.ok) {
        const updated: BrainTask = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        setMessages((prev) => [
          ...prev,
          {
            role: "mia",
            content: `✅ Tarefa **#${taskId}** aprovada. Iniciando execução...`,
            ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao aprovar tarefa:", err);
    }
  };

  const executeTask = async (taskId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks/${taskId}/execute`, { method: "PATCH" });
      if (res.ok) {
        const updated: BrainTask = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        setTimeout(() => completeTask(taskId), 2000);
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao executar tarefa:", err);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks/${taskId}/complete`, { method: "PATCH" });
      if (res.ok) {
        const updated: BrainTask = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao completar tarefa:", err);
    }
  };

  const rejectTask = async (taskId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/brain/tasks/${taskId}/reject`, { method: "PATCH" });
      if (res.ok) {
        const updated: BrainTask = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (err) {
      console.error("[MiaBrain] Erro ao rejeitar tarefa:", err);
    }
  };

  const callAgent = async (agentId: string, text: string): Promise<string> => {
    if (!user) return "❌ Autenticação necessária.";
    try {
      let endpoint = `${API_URL}/api/agents/support`;
      let body: Record<string, unknown> = { message: text, sessionId, plan: "pro" };

      if (agentId === "mia") {
        endpoint = `${API_URL}/api/agents/support`;
        body = { message: text, sessionId, clientName: user.primaryEmailAddress?.emailAddress || "Admin", plan: "pro" };
      } else {
        body = { agent: agentId, ...body };
        const agentMap: Record<string, string> = {
          support: "/api/agents/support",
          content: "/api/agents/content",
          website: "/api/agents/website",
          automation: "/api/agents/automation",
          analytics: "/api/agents/analytics",
          tiktok: "/api/agents/tiktok",
          shopify: "/api/agents/shopify",
          pinterest: "/api/agents/pinterest",
        };
        endpoint = `${API_URL}${agentMap[agentId] || agentMap.support}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return `⚠️ Erro ${res.status}: ${errData.error || errData.message || res.statusText}`;
      }

      const data = await res.json();
      return data.response || data.content || data.report || data.message || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error(`[MiaBrain] Erro ao chamar agente ${agentId}:`, err);
      return `⚠️ Erro de conexão com o agente ${agentId}. Verifique se a API está rodando.`;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: input,
      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    const ctx = pageContext;

    try {
      let targetAgent = activeAgent;
      let enrichedInput = currentInput;

      if (ctx && ctx.path) {
        enrichedInput = `[Contexto da página: ${ctx.title} (${ctx.url})]\n\n${currentInput}`;
      }

      if (autoMode && activeAgent === "mia") {
        const lower = currentInput.toLowerCase();
        if (lower.includes("site") || lower.includes("website") || lower.includes("página")) {
          targetAgent = "website";
        } else if (lower.includes("conteúdo") || lower.includes("post") || lower.includes("blog") || lower.includes("artigo")) {
          targetAgent = "content";
        } else if (lower.includes("n8n") || lower.includes("workflow") || lower.includes("automação") || lower.includes("fluxo")) {
          targetAgent = "automation";
        } else if (lower.includes("análise") || lower.includes("relatório") || lower.includes("dashboard") || lower.includes("insight")) {
          targetAgent = "analytics";
        } else if (lower.includes("tiktok") || lower.includes("viral") || lower.includes("short")) {
          targetAgent = "tiktok";
        } else if (lower.includes("shopify") || lower.includes("produto") || lower.includes("e-commerce")) {
          targetAgent = "shopify";
        } else if (lower.includes("pinterest") || lower.includes("pin") || lower.includes("tráfego visual")) {
          targetAgent = "pinterest";
        } else {
          targetAgent = "mia";
        }
      }

      const agentLabel = AGENTS[targetAgent]?.label || targetAgent;
      const response = await callAgent(targetAgent, enrichedInput);

      const needsApproval = targetAgent !== "mia" && targetAgent !== "support";
      if (needsApproval && response.length > 20) {
        await createTask(
          targetAgent,
          currentInput.slice(0, 80),
          `Ação sugerida pelo agente ${agentLabel}: ${currentInput.slice(0, 200)}`,
          { agentResponse: response.slice(0, 500), originalInput: currentInput }
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "mia",
          content: needsApproval
            ? `🤖 **${agentLabel}** respondeu:\n\n${response.slice(0, 1000)}${response.length > 1000 ? "\n\n*(resumo - veja tarefa para completo)*" : ""}\n\n---\n📋 Tarefa criada para aprovação. Revise no painel ao lado.`
            : `🤖 **${agentLabel}**\n\n${response}`,
          agent: targetAgent,
          ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("[MiaBrain] sendMessage error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "mia",
          content: "⚠️ Erro ao processar sua mensagem. Verifique o console para detalhes.",
          ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="shimmer" style={{ width: 300, height: 48, borderRadius: 12 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ marginBottom: 8 }}>Acesso Restrito</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Faça login para acessar o Mia Brain.</p>
          <Link href="/sign-in" className="btn btn-primary">Fazer Login</Link>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const approvedTasks = tasks.filter((t) => t.status === "APPROVED");
  const executingTasks = tasks.filter((t) => t.status === "EXECUTING");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <>
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: -100, right: -150, background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)" }} />
      <div style={{ paddingTop: 32, minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>

          {/* LEFT PANEL — Task Board */}
          <aside style={{ width: 340, borderRight: "1px solid var(--border)", background: "rgba(4,4,15,0.6)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>🧠</span>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Mia Brain</h2>
                  <p style={{ fontSize: 11, color: "var(--muted)" }}>Central de tarefas</p>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--faint)" }}>
                {tasks.length} tarefas · {pendingTasks.length} pendentes
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
              {tasksLoading && tasks.length === 0 && (
                <div style={{ padding: 16 }}>{[1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 12, marginBottom: 8 }} />)}</div>
              )}

              {!tasksLoading && tasks.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Nenhuma tarefa ainda. Converse com um agente para criar tarefas.
                </div>
              )}

              {[{ label: "PENDENTES", items: pendingTasks, status: "PENDING" as TaskStatus },
                { label: "APROVADAS", items: approvedTasks, status: "APPROVED" as TaskStatus },
                { label: "EXECUTANDO", items: executingTasks, status: "EXECUTING" as TaskStatus },
                { label: "CONCLUÍDAS", items: completedTasks, status: "COMPLETED" as TaskStatus },
              ].map((section) => section.items.length > 0 && (
                <div key={section.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--faint)", textTransform: "uppercase", marginBottom: 8, padding: "0 4px" }}>
                    {section.label} ({section.items.length})
                  </div>
                  {section.items.slice(0, 8).map((task) => {
                    const meta = AGENTS[task.agent_id];
                    return (
                      <div key={task.id} className={`card ${STATUS_COLORS[task.status as TaskStatus]}`} style={{ padding: "10px 12px", marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                              {meta?.icon} {meta?.label || task.agent_id}
                            </div>
                          </div>
                          <span className="badge" style={{ fontSize: 9, padding: "2px 8px", background: STATUS_COLORS[task.status as TaskStatus].split(" ")[0]?.replace("border", "background") || "var(--card)" }}>
                            {task.status}
                          </span>
                        </div>
                        {task.status === "PENDING" && (
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            <button className="btn btn-sm" style={{ flex: 1, background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)", fontSize: 11, padding: "4px 10px" }} onClick={() => { approveTask(task.id); setTimeout(() => executeTask(task.id), 500); }}>
                              ✅ Aprovar
                            </button>
                            <button className="btn btn-sm" style={{ flex: 1, background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)", fontSize: 11, padding: "4px 10px" }} onClick={() => rejectTask(task.id)}>
                              ✕ Rejeitar
                            </button>
                          </div>
                        )}
                        {task.status === "APPROVED" && (
                          <button className="btn btn-sm" style={{ width: "100%", marginTop: 8, background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.4)", fontSize: 11, padding: "4px 10px" }} onClick={() => executeTask(task.id)}>
                            ▶ Executar
                          </button>
                        )}
                        {task.status === "EXECUTING" && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--muted)" }}>
                            <span className="shimmer" style={{ width: 12, height: 12, borderRadius: "50%", display: "inline-block" }} />
                            Executando...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Refresh button */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={refreshTasks}>
                ↻ Atualizar
              </button>
              <Link href="/studio-lab" className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }}>
                📊 Studio Lab
              </Link>
            </div>
          </aside>

          {/* RIGHT PANEL — Chat Area */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Header */}
            <header style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="hero-eyebrow" style={{ margin: 0 }}>
                  <span>🧠</span>
                  <span>Mia Brain · {autoMode ? "Automático" : `Modo: ${AGENTS[activeAgent]?.icon} ${AGENTS[activeAgent]?.label || activeAgent}`}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className={`btn btn-sm ${autoMode ? "btn-primary" : "btn-ghost"}`}
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    setAutoMode(!autoMode);
                    if (!autoMode) setActiveAgent("mia");
                    setMessages((prev) => [...prev, {
                      role: "mia",
                      content: autoMode ? "🔀 Modo Automático desativado. Seleção manual reativada." : "🔀 Modo Automático ativado! Eu decido qual agente usar conforme sua necessidade.",
                      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    }]);
                  }}
                >
                  🤖 {autoMode ? "Automático" : "Manual"}
                </button>
                <div className="agent-tabs" style={{ padding: 0, border: "none", gap: 4 }}>
                  {Object.entries(AGENTS).map(([id, meta]) => (
                    <button
                      key={id}
                      className={`agent-tab ${activeAgent === id ? "active" : ""}`}
                      style={{ fontSize: 11, padding: "4px 10px", display: autoMode && id !== "mia" ? "none" : undefined }}
                      onClick={() => { setActiveAgent(id); setAutoMode(false); }}
                      disabled={autoMode}
                    >
                      {meta.icon}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Page Context Bar */}
            {contextVisible && pageContext && (
              <div style={{ padding: "6px 24px", borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.05)", fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--indigo)", whiteSpace: "nowrap" }}>📄 Contexto:</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{pageContext.title}</span>
                <span style={{ color: "var(--faint)" }}>{pageContext.path}</span>
                <button
                  style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}
                  onClick={() => setContextVisible(false)}
                  title="Fechar"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  {m.role === "mia" && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {m.agent ? AGENTS[m.agent]?.icon || "🧠" : "🧠"}
                    </div>
                  )}
                  <div style={{ maxWidth: "75%" }}>
                    <div className={`chat-bubble ${m.role === "user" ? "user" : "agent"}`} style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--faint)", marginTop: 3, textAlign: m.role === "user" ? "right" : "left" }}>
                      {m.ts} {m.agent && AGENTS[m.agent] ? `· ${AGENTS[m.agent].icon} ${AGENTS[m.agent].label}` : ""}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
                  <div className="chat-bubble agent shimmer" style={{ minWidth: 120, height: 40 }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", background: "rgba(4,4,15,0.8)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: "8px 12px" }}
                  onClick={() => {
                    const ctx = readPageContext();
                    setPageContext(ctx);
                    setMessages((prev) => [...prev, {
                      role: "mia",
                      content: `📄 **Contexto da página lido:**\n\`\`\`\n${formatContext(ctx)}\n\`\`\``,
                      ts: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                    }]);
                  }}
                  title="Ler contexto da página"
                >
                  📋
                </button>
                <input
                  className="chat-input"
                  style={{ flex: 1 }}
                  type="text"
                  placeholder={
                    autoMode
                      ? "Fale comigo — eu decido qual agente acionar..."
                      : `Fale com ${AGENTS[activeAgent]?.label || activeAgent}...`
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{ borderRadius: "50%", width: 40, height: 40, padding: 0, flexShrink: 0 }}
                >
                  {loading ? "⏳" : "→"}
                </button>
              </div>
              <div style={{ marginTop: 6, fontSize: 10, color: "var(--faint)", display: "flex", justifyContent: "space-between" }}>
                <span>Session: {sessionId.slice(-8)}</span>
                <span>
                  {autoMode
                    ? "🔀 Modo Automático · Mia roteia para o melhor agente"
                    : `🎯 Agente: ${AGENTS[activeAgent]?.icon} ${AGENTS[activeAgent]?.label || activeAgent}`}
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
