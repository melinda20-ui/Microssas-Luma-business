"use client"

import { motion } from "framer-motion"
import { universeItems } from "@/data/navigation"

export default function ExploreUniversos() {
  return (
    <section id="universos" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/50 to-bg" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Navegue</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-serif font-bold text-champagne">
            Explore meus <span className="text-gradient-wine">universos</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {universeItems.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                const id = item.href.replace("#", "")
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-rose/20 transition-all duration-500 cursor-pointer"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-sans font-medium text-text2 group-hover:text-champagne transition-colors">
                {item.label}
              </span>
              <span className="text-xs text-text3 group-hover:text-rose transition-colors">→</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
