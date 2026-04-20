"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/mini-company", label: "Mini Empresa" },
  { href: "/services", label: "Serviços" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050507]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
              Luma OS
            </span>
            <span className="mt-1 text-xs text-white/35">
              Sistema operacional criativo
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    active
                      ? "border border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF] shadow-[0_0_24px_rgba(0,240,255,0.12)]"
                      : "border border-transparent bg-white/[0.03] text-white/70 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {pathname !== "/chat" && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#050507]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-5 gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-2 py-3 text-center text-[11px] transition ${
                    active
                      ? "bg-[#7A00FF] text-white shadow-[0_0_24px_rgba(122,0,255,0.22)]"
                      : "bg-white/[0.04] text-white/65"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}


