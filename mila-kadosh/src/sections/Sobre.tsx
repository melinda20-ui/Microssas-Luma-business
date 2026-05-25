"use client"

import { motion } from "framer-motion"

export default function Sobre() {
  return (
    <section id="sobre" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/30 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(183,110,121,0.04),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Sobre</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
              A construção do<br />
              <span className="text-gradient-wine">universo Mila</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <p className="text-base text-text2 leading-relaxed font-sans font-light">
              Mila Kadosh é escritora, cantora, empresária e criadora de conteúdo. Sua jornada começou nos palcos e nas
              páginas, combinando arte, música e palavras para tocar vidas.
            </p>
            <p className="text-base text-text2 leading-relaxed font-sans font-light">
              Fundadora da <strong className="text-champagne font-medium">Sualuma IA</strong>, une tecnologia e
              feminilidade para criar soluções que transformam marcas e pessoas. Seus livros exploram o autoconhecimento,
              a força feminina e a coragem de viver com propósito.
            </p>
            <p className="text-base text-text2 leading-relaxed font-sans font-light">
              Hoje, Mila constrói um ecossistema que integra literatura, música, tecnologia e conteúdo — provando que é
              possível ser multifacetada sem perder a essência.
            </p>
            <p className="text-base text-text2 leading-relaxed font-sans font-light italic">
              &ldquo;Não sou uma só coisa. Sou todas as mulheres que decidi ser.&rdquo;
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
