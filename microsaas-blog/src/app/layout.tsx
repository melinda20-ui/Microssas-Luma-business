import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blog | Luma Insights - O Futuro é IA',
  description: 'Descubra como a Inteligência Artificial está transformando os negócios e o mundo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased overflow-x-hidden">
        {/* Glow Background Elements */}
        <div className="orb orb-purple"></div>
        <div className="orb orb-cyan"></div>
        <div className="future-grid fixed inset-0 z-[-2]"></div>
        
        <header className="container mx-auto px-6 py-10 flex justify-between items-center relative z-10">
          <div className="text-2xl font-black outfit-font tracking-tighter">
            <span className="text-white">LUMA</span>
            <span className="text-purple-500">.BLOG</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Início</a>
            <a href="#" className="hover:text-white transition-colors">Tecnologia</a>
            <a href="#" className="hover:text-white transition-colors">Negócios</a>
            <button className="bg-purple-600/20 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-full hover:bg-purple-600/30 transition-all">
              Newsletter
            </button>
          </nav>
        </header>

        <main className="relative z-10">{children}</main>
        
        <footer className="container mx-auto px-6 py-20 border-t border-zinc-800/50 mt-20 text-center text-zinc-500 text-sm">
          © 2026 Luma Insights. Powered by Next.js & IA.
        </footer>
      </body>
    </html>
  );
}
