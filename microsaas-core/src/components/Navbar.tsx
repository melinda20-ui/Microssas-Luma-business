"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(4,4,15,0.7)] backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
      <div className="container nav-inner">
        <Link href="/" className="nav-logo">⚡ MicroSaaS</Link>
        
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/#agentes" className="nav-link">Agentes</Link>
          <Link href="/#planos" className="nav-link">Planos</Link>
          <Link href="/chat" className="nav-link">Chat IA</Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
          <Link href="/chat" className="btn btn-primary btn-sm">Começar Agora</Link>
        </div>

        {/* Mobile Toggle (Simple) */}
        <button className="md:hidden text-white text-2xl">☰</button>
      </div>
    </nav>
  );
}
