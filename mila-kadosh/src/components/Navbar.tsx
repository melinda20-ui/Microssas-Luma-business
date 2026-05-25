import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-8 py-6 flex justify-between items-center">
      <Link href="/" className="text-gold font-serif text-2xl tracking-widest">
        MK <span className="text-white text-xs font-sans tracking-[0.2em] ml-2">MILA KADOSH</span>
      </Link>
      <div className="hidden md:flex gap-8 text-xs tracking-[0.2em] uppercase text-text-light">
        <Link href="/" className="hover:text-rose transition-colors">Home</Link>
        <Link href="/livros" className="hover:text-rose transition-colors">Livros</Link>
        <Link href="/musica" className="hover:text-rose transition-colors">Música</Link>
        <Link href="/sobre" className="hover:text-rose transition-colors">Sobre</Link>
        <Link href="/media-kit" className="hover:text-rose transition-colors">Media Kit</Link>
      </div>
      <Link href="/contato" className="border border-rose text-rose px-6 py-2 text-xs tracking-widest uppercase hover:bg-rose hover:text-white transition-all">
        Contato
      </Link>
    </nav>
  )
}
