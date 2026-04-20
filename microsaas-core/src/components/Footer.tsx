import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer py-20 border-t border-white/5">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="nav-logo mb-6">⚡ MicroSaaS</div>
            <p className="text-zinc-500 max-w-sm leading-relaxed">
              Transformando negócios com Inteligência Artificial e automação futurista. 
              Gere sites, conteúdo e workflows em segundos.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/#agentes" className="hover:text-purple-400">Nossos Agentes</Link></li>
              <li><Link href="/#planos" className="hover:text-purple-400">Planos & Preços</Link></li>
              <li><Link href="/chat" className="hover:text-purple-400">Chat com Agentes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Suporte</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/#faq" className="hover:text-purple-400">FAQ</Link></li>
              <li><Link href="/contato" className="hover:text-purple-400">Contato</Link></li>
              <li><Link href="https://blog.sualuma.online" className="hover:text-purple-400">Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4 text-xs text-zinc-600">
          <div>© 2026 Sualuma Online. Todos os direitos reservados.</div>
          <div className="flex gap-8">
            <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
