"use client"

import { motion } from "framer-motion"

const contentItems = [
  { type: "image", color: "from-rose/10 to-wine/10" },
  { type: "image", color: "from-gold/10 to-champagne/5" },
  { type: "image", color: "from-bg3 to-wine/5" },
  { type: "image", color: "from-rose/5 to-gold/5" },
  { type: "image", color: "from-wine/10 to-bg3" },
  { type: "image", color: "from-champagne/5 to-rose/5" },
]

const platforms = [
  { name: "Instagram", handle: "@milakadosh", color: "from-pink-500/20 to-purple-500/20" },
  { name: "TikTok", handle: "@milakadosh", color: "from-black/30 to-gray-500/20" },
  { name: "YouTube", handle: "Mila Kadosh", color: "from-red-500/20 to-red-800/20" },
]

export default function Conteudo() {
  return (
    <section id="conteudo" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/30 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(201,168,76,0.03),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Conteúdo</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
            Conteúdo que <span className="text-gradient-wine">inspira</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-text3 font-sans font-light leading-relaxed">
            Bastidores, reflexões e criatividade em cada post.
          </p>
        </motion.div>

        {/* Platform cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {platforms.map((p, i) => (
            <motion.a
              key={p.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${p.color} hover:border-rose/20 transition-all duration-500`}
            >
              <p className="text-xs font-sans font-bold tracking-widest uppercase text-text2">{p.name}</p>
              <p className="mt-2 text-lg font-serif text-champagne">{p.handle}</p>
              <p className="mt-1 text-xs text-text3">Seguir →</p>
            </motion.a>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {contentItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`aspect-square rounded-2xl border border-white/5 bg-gradient-to-br ${item.color} flex items-center justify-center overflow-hidden group cursor-pointer`}
            >
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto rounded-full border border-white/5 flex items-center justify-center group-hover:border-rose/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-text3 group-hover:text-rose">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
