import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "../contexts/SessionContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  description: "Plataforma de automação inteligente com agentes de IA. Crie sites, conteúdo, automações e análises em minutos. Powered by Gemini + Ollama.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
        <body>
          <Navbar />
          <main style={{ minHeight: "80vh" }}>{children}</main>
          <Footer />
        </body>
      </html>
    </SessionProvider>
  );
}
