import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Hero from "@/sections/Hero"
import ExploreUniversos from "@/sections/ExploreUniversos"
import Biblioteca from "@/sections/Biblioteca"
import Manifesto from "@/sections/Manifesto"
import Sobre from "@/sections/Sobre"
import SualumaIA from "@/sections/SualumaIA"
import Musica from "@/sections/Musica"
import Conteudo from "@/sections/Conteudo"
import MediaKit from "@/sections/MediaKit"
import Contato from "@/sections/Contato"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ExploreUniversos />
        <Biblioteca />
        <Manifesto />
        <Sobre />
        <SualumaIA />
        <Musica />
        <Conteudo />
        <MediaKit />
        <Contato />
      </main>
      <Footer />
    </>
  )
}
