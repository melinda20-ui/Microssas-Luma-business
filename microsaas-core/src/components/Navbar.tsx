"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import CreditBalance from "./auth/CreditBalance";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(4,4,15,0.7)] backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent py-6"}`}>
      <div className="container nav-inner flex items-center justify-between">
        <Link href="/" className="nav-logo text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">⚡ Sualuma IA</Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/#agentes" className="nav-link text-sm opacity-70 hover:opacity-100 transition-all">Agentes</Link>
          <Link href="/chat" className="nav-link text-sm opacity-70 hover:opacity-100 transition-all">Chat IA</Link>
          
          <SignedIn>
            <CreditBalance />
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-400 transition-all">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-sm px-6 rounded-2xl font-bold">Começar Agora</button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Toggle (Simple) */}
        <button className="md:hidden text-white text-2xl">☰</button>
      </div>
    </nav>
  );
}
