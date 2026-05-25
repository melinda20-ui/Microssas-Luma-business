import type { Metadata } from "next"
import { Cormorant_Garamond, Montserrat, Dancing_Script } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://milakadosh.online"),
  title: "Mila Kadosh — Cantora, Empresária e Influencer",
  description: "Mila Kadosh é cantora, empresária e criadora de universos digitais. Conheça seus projetos, músicas, livros e muito mais.",
  openGraph: {
    url: "https://milakadosh.online",
    images: ["/images/hero-home.jpg"],
    title: "Mila Kadosh — Cantora, Empresária e Influencer",
    description: "Mila Kadosh é cantora, empresária e criadora de universos digitais. Conheça seus projetos, músicas, livros e muito mais.",
  },
  robots: "index, follow",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${montserrat.variable} ${dancingScript.variable}`}>
      <body className="bg-background text-text-light font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
