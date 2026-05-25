"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { books, type Book } from "@/data/books"

function BookCard({ book, index, onClick }: { book: Book; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="relative flex-shrink-0 w-[260px] group text-left"
    >
      <div className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br ${book.coverColor} border border-white/5 group-hover:border-rose/20 transition-all duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_60%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-rose/80">{book.category}</span>
          <h3 className="mt-2 text-lg font-serif font-bold text-champagne leading-tight">{book.title}</h3>
          <p className="mt-1 text-xs text-text3 font-sans line-clamp-2">{book.subtitle}</p>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(183,110,121,0.1),transparent_60%)]" />
      </div>
    </motion.button>
  )
}

function BookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-bg2 p-8 sm:p-12"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-text3 hover:text-champagne hover:border-rose/30 transition-all">
          ✕
        </button>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${book.coverColor} border border-white/5 flex items-center justify-center`}>
            <div className="text-center p-6">
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-rose/80">{book.category}</span>
              <h3 className="mt-4 text-xl font-serif font-bold text-champagne">{book.title}</h3>
              <p className="mt-2 text-sm text-text3 italic">{book.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-rose">{book.category}</span>
            <h2 className="mt-2 text-2xl font-serif font-bold text-champagne">{book.title}</h2>
            <p className="mt-4 text-sm text-text2 leading-relaxed">{book.longDescription}</p>

            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-sm font-serif italic text-rose">&ldquo;{book.quote}&rdquo;</p>
            </div>

            <div className="mt-8 flex gap-3">
              <a
                href={book.amazonUrl || "#"}
                className="px-6 py-3 text-xs font-sans font-bold tracking-widest uppercase text-bg bg-gradient-to-r from-rose to-wine-light rounded-full hover:shadow-[0_0_30px_rgba(183,110,121,0.3)] transition-all"
              >
                Comprar na Amazon
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Biblioteca() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section id="biblioteca" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg2/30 to-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(107,29,58,0.06),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-sans font-bold tracking-[0.2em] uppercase text-rose">Biblioteca</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-champagne leading-tight">
            Livros que escrevi<br />para <span className="text-gradient-wine">transformar vidas</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm text-text3 font-sans font-light leading-relaxed">
            Cada livro é um pedaço da minha jornada, das minhas experiências e da missão que carrego: ajudar mulheres
            a despertarem para quem realmente são.
          </p>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 px-4 -mx-4 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {books.map((book, index) => (
            <div key={book.id} className="snap-start">
              <BookCard book={book} index={index} onClick={() => setSelectedBook(book)} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-flex px-8 py-4 text-sm font-sans font-bold tracking-widest uppercase text-champagne border border-white/10 rounded-full hover:border-rose/30 hover:bg-white/5 transition-all duration-500"
          >
            Ver todos os livros
          </a>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
      </AnimatePresence>
    </section>
  )
}
