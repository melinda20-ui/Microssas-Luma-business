"use client"

import { motion } from "framer-motion"

export default function Manifesto() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(107,29,58,0.08),transparent_60%)]" />

      {/* Decorative lines */}
      <div className="absolute left-1/4 right-1/4 top-0 bottom-0 border-x border-white/[0.02]" />

      <div className="relative max-w-4xl mx-auto px-6 text-center py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          {/* Decorative */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-rose/30" />
            <div className="w-2 h-2 rounded-full bg-rose/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-rose/30" />
          </div>

          <motion.blockquote
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.15] tracking-tight"
          >
            <span className="text-champagne">&ldquo;Escrever é transformar dores</span>
            <br />
            <span className="text-gradient-wine">em palavras</span>
            <br />
            <span className="text-champagne">e palavras</span>
            <br />
            <span className="text-gradient-gold">em libertação.&rdquo;</span>
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-px bg-rose/20" />
              <p className="text-lg font-serif italic text-rose">Mila Kadosh</p>
              <div className="w-8 h-px bg-rose/20" />
            </div>
          </motion.div>

          {/* Bottom decorative */}
          <div className="flex items-center justify-center gap-4 mt-16">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/20" />
            <div className="w-2 h-2 rounded-full bg-gold/30" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/20" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
