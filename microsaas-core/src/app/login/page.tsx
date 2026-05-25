"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { signIn, isLoaded } = useSession();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");

    const ok = await signIn(email);
    if (ok) {
      setMessage("✅ Link de acesso enviado para seu email!");
      setTimeout(() => router.push("/studio-lab"), 2000);
    } else {
      setMessage("⚠️ Erro ao enviar link. Tente novamente.");
    }
    setLoading(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#04040f] flex items-center justify-center">
        <div className="shimmer w-80 h-48 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04040f] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 max-w-md w-full backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold font-outfit">Acesso ao Studio</h1>
          <p className="text-white/40 text-sm mt-2">Entre com seu email para acessar</p>
        </div>

        <form onSubmit={handleLogin} className="mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-2xl py-3.5 px-5 text-sm text-white/70 placeholder:text-white/25 outline-none transition-all duration-300 focus:border-blue-500/40 mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Entrar"}
          </button>
        </form>

        {message && (
          <div className="text-center text-sm mb-4 p-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl">
            {message}
          </div>
        )}

        <div className="border-t border-white/[0.06] pt-6">
          <p className="text-xs text-white/20 text-center mb-4">Acesso rápido sem login</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Studio Lab", href: "/studio-lab", icon: "🎛️" },
              { label: "Mia Brain", href: "/studio/mia-brain", icon: "🧠" },
              { label: "Sentinela", href: "/studio/sentinela", icon: "🚨" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.03] transition-all"
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
