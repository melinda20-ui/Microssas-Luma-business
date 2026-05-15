"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

export default function LoginPage() {
  const [email, setEmail] = useState("lumabusinessa1.0@gmail.com");
  const [loading, setLoading] = useState(false);
  const { signIn } = useSession();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email);
    router.push("/studio-lab");
  };

  const quickAccess = [
    { label: "Studio Lab", href: "/studio-lab", icon: "🎛️" },
    { label: "Mia Brain", href: "/studio/mia-brain", icon: "🧠" },
    { label: "Sentinela", href: "/studio/sentinela", icon: "🚨" },
    { label: "Memória", href: "/studio/memoria", icon: "🗂️" },
  ];

  return (
    <div className="bg-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 40, maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Acesso ao Studio</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Entre com seu email para acessar</p>
        </div>

        <form onSubmit={handleLogin} style={{ marginBottom: 24 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="chat-input"
            style={{ width: "100%", marginBottom: 12, fontSize: 14, padding: "12px 16px" }}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px 0", fontSize: 14 }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 8, textAlign: "center" }}>Acesso rápido sem login</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quickAccess.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="btn btn-ghost"
                style={{ fontSize: 12, justifyContent: "flex-start", padding: "8px 12px" }}
              >
                <span style={{ marginRight: 8 }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
