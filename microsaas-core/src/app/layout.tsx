import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MicroSaaS | Agentes de IA para o Seu Negócio",
  description:
    "Plataforma de automação inteligente com agentes de IA. Crie sites, conteúdo, automações e análises em minutos. Powered by Gemini + Ollama.",
  keywords: "microsaas, agentes ia, automação, criação de sites, inteligência artificial, n8n",
  authors: [{ name: "MicroSaaS" }],
  openGraph: {
    title: "MicroSaaS — Agentes de IA para o Seu Negócio",
    description: "5 agentes de IA especializados. Sites, conteúdo, automações e muito mais.",
    type: "website",
  },
};

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Navbar />
        <main style={{ minHeight: "80vh" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
