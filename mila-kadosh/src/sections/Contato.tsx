"use client"

import { motion } from "framer-motion"
import { socialLinks } from "@/data/navigation"

export default function Contato() {
  return (
    <section id="contato" className="section-padding relative min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(107,29,58,0.06),transparent_60%)]" />

      {/* Decorative */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose/5 to-transparent" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne/3 to-transparent" />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Contato</span>
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
            Vamos criar algo<br />
            <span className="text-gradient-wine">extraordinário</span> juntas?
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-base text-text2 leading-relaxed font-sans font-light">
            Se você deseja transformar sua marca, sua mensagem ou sua vida, eu posso te ajudar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-10 py-5 text-base font-sans font-bold tracking-widest uppercase text-bg bg-gradient-to-r from-rose to-wine-light rounded-full hover:shadow-[0_0_50px_rgba(183,110,121,0.4)] transition-all duration-500"
          >
            Trabalhe Comigo
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6"
        >
          {socialLinks.slice(0, 4).map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-sans font-medium tracking-wider uppercase text-text3 hover:text-champagne border border-white/5 hover:border-rose/20 rounded-full transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 text-sm text-text3 font-sans"
        >
          contato@milakadosh.com
        </motion.p>
      </div>
    </section>
  )
}
