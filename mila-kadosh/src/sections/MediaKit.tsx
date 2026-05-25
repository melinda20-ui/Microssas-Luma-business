"use client"

import { motion } from "framer-motion"
import { mediaKitStats } from "@/data/navigation"

export default function MediaKit() {
  return (
    <section id="media-kit" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/30 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(183,110,121,0.04),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Media Kit</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
            <span className="text-gradient-wine">Números</span> que falam
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-text3 font-sans font-light leading-relaxed">
            Alcance, engajamento e impacto real em cada plataforma.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {mediaKitStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center group hover:border-rose/20 transition-all duration-500"
            >
              <p className="text-3xl sm:text-4xl font-serif font-bold text-gradient-wine">{stat.value}</p>
              <p className="mt-2 text-xs text-text3 font-sans">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Audience breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 mb-8"
        >
          <h3 className="text-lg font-serif font-bold text-champagne mb-6">Perfil do Público</h3>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-text3 font-sans mb-2">Gênero</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm text-text2 mb-1">
                    <span>Feminino</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="w-[85%] h-full rounded-full bg-gradient-to-r from-rose to-wine-light" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-text2 mb-1">
                    <span>Masculino</span>
                    <span>15%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="w-[15%] h-full rounded-full bg-gradient-to-r from-gold to-champagne" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-text3 font-sans mb-2">Faixa Etária</p>
              <div className="space-y-2">
                {[
                  { label: "18-24", value: 25 },
                  { label: "25-34", value: 40 },
                  { label: "35-44", value: 22 },
                  { label: "45+", value: 13 },
                ].map((age) => (
                  <div key={age.label}>
                    <div className="flex justify-between text-sm text-text2 mb-1">
                      <span>{age.label}</span>
                      <span>{age.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-rose/60 to-champagne/30" style={{ width: `${age.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href="#"
            className="inline-flex px-8 py-4 text-sm font-sans font-bold tracking-widest uppercase text-bg bg-gradient-to-r from-rose to-wine-light rounded-full hover:shadow-[0_0_40px_rgba(183,110,121,0.4)] transition-all duration-500"
          >
            Baixar Media Kit
          </a>
        </motion.div>
      </div>
    </section>
  )
}
