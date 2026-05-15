"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "../contexts/SessionContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(4,4,15,0.7)] backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
      <div className="container nav-inner flex items-center justify-between">
        <Link href="/" className="nav-logo text-xl font-bold bg-gradient-to-right from-blue-400 to-indigo-500 bg-clip-text text-transparent">⚡ Sualuma IA</Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/#agentes" className="nav-link text-sm opacity-70 hover:opacity-100 transition-all">Agentes</Link>
          <Link href="/chat" className="nav-link text-sm opacity-70 hover:opacity-100 transition-all">Chat IA</Link>
          
          {user ? (
            <>
              <Link href="/studio-lab" className="text-sm font-medium hover:text-blue-400 transition-all">Studio</Link>
              <Link href="/studio/mia-brain" className="text-sm font-medium hover:text-blue-400 transition-all">Mia Brain</Link>
              <span className="text-xs text-zinc-500">({user.email})</span>
              <button onClick={signOut} className="text-xs text-zinc-500 hover:text-red-400 transition-all">Sair</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm px-6 rounded-2xl font-bold">Entrar</Link>
          )}
        </div>

        <button className="md:hidden text-white text-2xl">☰</button>
      </div>
    </nav>
  );
}
