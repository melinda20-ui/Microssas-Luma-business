export interface NavItem {
  label: string
  href: string
}

export const navItems: NavItem[] = [
  { label: "Início", href: "#hero" },
  { label: "Sobre", href: "#sobre" },
  { label: "Universos", href: "#universos" },
  { label: "Livros", href: "#biblioteca" },
  { label: "Música", href: "#musica" },
  { label: "Conteúdo", href: "#conteudo" },
  { label: "Media Kit", href: "#media-kit" },
  { label: "Contato", href: "#contato" },
]

export interface SocialLink {
  label: string
  href: string
  icon: string
}

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/milakadosh", icon: "instagram" },
  { label: "TikTok", href: "https://tiktok.com/@milakadosh", icon: "tiktok" },
  { label: "YouTube", href: "https://youtube.com/@milakadosh", icon: "youtube" },
  { label: "Spotify", href: "https://open.spotify.com/artist/milakadosh", icon: "spotify" },
  { label: "WhatsApp", href: "https://wa.me/5511999999999", icon: "whatsapp" },
]

export interface UniverseItem {
  id: string
  label: string
  icon: string
  href: string
}

export const universeItems: UniverseItem[] = [
  { id: "musica", label: "Música", icon: "🎵", href: "#musica" },
  { id: "livros", label: "Livros", icon: "📖", href: "#biblioteca" },
  { id: "sualuma", label: "Sualuma IA", icon: "✨", href: "#sualuma-ia" },
  { id: "conteudo", label: "Conteúdo", icon: "🎬", href: "#conteudo" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌸", href: "#lifestyle" },
  { id: "negocios", label: "Negócios", icon: "💎", href: "#negocios" },
  { id: "metodos", label: "Métodos", icon: "⚡", href: "#metodos" },
]

export const mediaKitStats = [
  { value: "500K+", label: "Seguidores" },
  { value: "10M+", label: "Alcance Mensal" },
  { value: "85%", label: "Público Feminino" },
  { value: "18-45", label: "Faixa Etária" },
  { value: "Brasil", label: "Mercado Principal" },
  { value: "PT/EN", label: "Idiomas" },
]
