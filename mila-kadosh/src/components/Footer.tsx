import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 py-16 px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-text-medium">
        <div>
          <h2 className="text-gold font-serif text-xl mb-4">Mila Kadosh</h2>
          <p>Cantora, empresária e criadora de universos digitais.</p>
        </div>
        <div>
          <h3 className="text-white mb-4 uppercase tracking-widest text-xs">Navegação</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-rose transition-colors">Home</Link></li>
            <li><Link href="/livros" className="hover:text-rose transition-colors">Livros</Link></li>
            <li><Link href="/musica" className="hover:text-rose transition-colors">Música</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white mb-4 uppercase tracking-widest text-xs">Projetos</h3>
          <ul className="space-y-2">
            <li>Sualuma IA</li>
            <li>ELMP</li>
            <li>SOS Publicidade</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white mb-4 uppercase tracking-widest text-xs">Redes</h3>
          <p>@cantoramilakadosh</p>
        </div>
      </div>
      <div className="text-center mt-12 text-xs text-text-medium border-t border-white/5 pt-8">
        © 2026 Mila Kadosh. Todos os direitos reservados.
      </div>
    </footer>
  )
}
