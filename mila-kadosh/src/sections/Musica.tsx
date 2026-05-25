"use client"

import { motion } from "framer-motion"

export default function Musica() {
  return (
    <section id="musica" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/30 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(107,29,58,0.06),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Música</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
            Sons que <span className="text-gradient-wine">tocam a alma</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-text3 font-sans font-light leading-relaxed">
            Cada nota, cada letra — música é a linguagem mais profunda da emoção.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Player card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose/20 to-wine/20 flex items-center justify-center border border-rose/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-rose"><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M9 18V5l12-2v13" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-champagne">Último Lançamento</h3>
                <p className="text-sm text-text3 font-sans">Nova música em breve</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="w-1/3 h-full rounded-full bg-gradient-to-r from-rose to-gold" />
              </div>
              <div className="flex justify-between text-xs text-text3">
                <span>Player musical</span>
                <span>—:—</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <a href="#" className="flex-1 px-4 py-3 text-xs font-sans font-bold tracking-widest uppercase text-center text-bg bg-gradient-to-r from-rose to-wine-light rounded-full transition-all hover:shadow-[0_0_30px_rgba(183,110,121,0.3)]">
                Spotify
              </a>
              <a href="#" className="flex-1 px-4 py-3 text-xs font-sans font-bold tracking-widest uppercase text-center text-champagne border border-white/10 rounded-full hover:border-rose/30 transition-all">
                YouTube
              </a>
            </div>
          </motion.div>

          {/* Gallery / clips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video rounded-xl border border-white/5 bg-gradient-to-br from-bg3 to-bg2 flex items-center justify-center group cursor-pointer hover:border-rose/20 transition-all">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-rose/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-text3 group-hover:text-rose ml-0.5"><polygon points="5 3 19 12 5 21" fill="currentColor" stroke="none" /></svg>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
