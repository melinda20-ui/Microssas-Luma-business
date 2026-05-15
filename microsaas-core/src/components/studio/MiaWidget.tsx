"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { readPageContext, formatContext } from "./domReader";

const API_URL = "http://localhost:3001";

export default function MiaWidget() {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "mia"; content: string }[]>([
    { role: "mia", content: "🧠 Precisando de ajuda? Me pergunte algo sobre esta página!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading || !user) return;
    const text = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    const ctx = readPageContext();
    const enriched = `[Contexto atual da página]\n${formatContext(ctx)}\n\n[Pergunta do usuário]\n${text}`;

    try {
      const res = await fetch(`${API_URL}/api/agents/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
        },
        body: JSON.stringify({ message: enriched, sessionId: `widget_${user.id}`, plan: "pro" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "mia", content: data.response || "Sem resposta." }]);
    } catch (err) {
      console.error("[MiaWidget] Erro:", err);
      setMessages((prev) => [...prev, { role: "mia", content: "⚠️ Erro de conexão." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999 }}>
      {open && (
        <div className="card" style={{ width: 360, height: 480, display: "flex", flexDirection: "column", marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Mia</span>
            </div>
            <Link href="/studio/mia-brain" style={{ fontSize: 11, color: "var(--indigo)", textDecoration: "none" }}>
              Abrir Brain →
            </Link>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5, background: m.role === "user" ? "var(--grad)" : "var(--card-hover)", color: m.role === "user" ? "#fff" : "var(--text)", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="shimmer" style={{ height: 32, width: "60%", borderRadius: 12 }} />}
            <div ref={msgsEndRef} />
          </div>
          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input className="chat-input" style={{ flex: 1, fontSize: 12 }} placeholder="Pergunte a Mia..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn btn-primary" style={{ borderRadius: "50%", width: 34, height: 34, padding: 0, fontSize: 14 }} onClick={send} disabled={loading || !input.trim()}>→</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "var(--grad)", color: "#fff", fontSize: 28, display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 30px rgba(124,58,237,0.4)",
          transition: "all 0.3s",
        }}
        title={open ? "Fechar Mia" : "Abrir Mia"}
      >
        {open ? "✕" : "🧠"}
      </button>
    </div>
  );
}
