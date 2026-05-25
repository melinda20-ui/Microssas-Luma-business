"use client"

import { motion } from "framer-motion"

export default function SualumaIA() {
  return (
    <section id="sualuma-ia" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(201,168,76,0.04),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(183,110,121,0.03),transparent_50%)]" />

      {/* Tech decorative lines */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/5 to-transparent" />
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose/3 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/10 bg-gold/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-glow" />
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-gold">Sualuma IA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
              A tecnologia também<br />
              <span className="text-gradient-gold">pode ter alma</span>
            </h2>

            <p className="mt-6 text-base text-text2 leading-relaxed font-sans font-light">
              A Sualuma IA nasceu da crença de que inteligência artificial e feminilidade podem caminhar juntas.
              Criamos soluções que unem tecnologia de ponta com propósito humano.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: "Automação", desc: "Processos inteligentes" },
                { label: "Conteúdo", desc: "IA com curadoria humana" },
                { label: "Branding", desc: "Identidade digital" },
                { label: "Métricas", desc: "Dados acionáveis" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <p className="text-sm font-serif font-bold text-champagne">{item.label}</p>
                  <p className="text-xs text-text3 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <a
              href="https://sualuma.online"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex px-8 py-4 text-sm font-sans font-bold tracking-widest uppercase text-bg bg-gradient-to-r from-gold to-gold-light rounded-full hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all duration-500"
            >
              Conhecer Sualuma
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Dashboard mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-bg3 shadow-[0_0_60px_rgba(201,168,76,0.08)]">
              {/* Mockup header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red/30" />
                <div className="w-3 h-3 rounded-full bg-gold/30" />
                <div className="w-3 h-3 rounded-full bg-green/30" />
                <div className="ml-4 text-xs text-text3 font-sans">sualuma.online / dashboard</div>
              </div>

              {/* Mockup content */}
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  {[70, 45, 85].map((w, i) => (
                    <div key={i} className="flex-1 h-20 rounded-xl bg-gradient-to-b from-rose/10 to-gold/5 border border-white/5 p-3">
                      <div className="w-1/2 h-2 rounded-full bg-rose/20" />
                      <div className="mt-2 w-3/4 h-4 rounded-full bg-champagne/10" />
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-xl bg-gradient-to-r from-rose/5 to-gold/5 border border-white/5 p-4">
                  <div className="flex gap-6 items-end h-full">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-rose/20 to-gold/10" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Leads", "Conversões", "ROI"].map((label) => (
                    <div key={label} className="h-12 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-xs text-text3">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold/5 via-transparent to-rose/5 rounded-3xl -z-10 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
