"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      containerRef.current.style.setProperty("--mx", String(x))
      containerRef.current.style.setProperty("--my", String(y))
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section id="hero" ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Cinematic gradient background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-b from-rose/5 to-transparent opacity-30" />

      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose/5 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gold/5 blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left — Text */}
          <div className="z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose mb-6">
                Bem-vinda ao universo Mila Kadosh
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.05] tracking-tight"
            >
              <span className="text-beige">Palavras</span>
              <br />
              <span className="text-rose">que despertam.</span>
              <br />
              <span className="text-beige">Histórias</span>
              <br />
              <span className="text-gold">que transformam.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-base sm:text-lg text-text-medium leading-relaxed max-w-lg font-sans font-light"
            >
              Livros que tocam emoções, despertam ideias e guiam mulheres para uma nova identidade.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href="#biblioteca"
                className="px-8 py-4 text-sm font-sans font-bold tracking-widest uppercase text-background bg-cta rounded-full hover:bg-rose transition-all duration-500"
              >
                Conheça meus livros
              </a>
              <a
                href="#sobre"
                className="px-8 py-4 text-sm font-sans font-bold tracking-widest uppercase text-beige border border-white/10 rounded-full hover:border-rose/30 hover:bg-white/5 transition-all duration-500"
              >
                Sobre Mim
              </a>
            </motion.div>
          </div>

          {/* Right — Cinematic Image Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[3/4]">
              {/* Glass frame */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(183,110,121,0.15)]">
                {/* Photo placeholder with gradient */}
                <div className="w-full h-full bg-gradient-to-br from-background via-background/80 to-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-rose/20 to-gold/20 flex items-center justify-center border border-rose/10">
                      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 text-rose/40">
                        <circle cx="40" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M16 68c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <p className="mt-6 text-sm text-text-medium font-sans">[ Foto premium ]</p>
                  </div>
                </div>

                {/* Cinematic overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent" />

                {/* Signature */}
                <div className="absolute bottom-8 left-8">
                  <p className="text-2xl font-serif font-bold text-beige/80 italic">Mila Kadosh</p>
                  <p className="text-xs text-text-medium font-sans tracking-wider mt-1">
                    Escritora, artista e visionária.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-text3 font-sans tracking-widest uppercase">Role</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-rose/50 to-transparent" />
      </motion.div>
    </section>
  )
}
