export interface Book {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  coverColor: string
  category: string
  quote: string
  pages?: number
  amazonUrl?: string
}

export const books: Book[] = [
  {
    id: "1",
    slug: "quebre-o-cadeado",
    title: "Quebre o Cadeado",
    subtitle: "Liberte-se das correntes que te prendem",
    description: "Um convite para romper com padrões limitantes e descobrir a força que existe dentro de você.",
    longDescription:
      "Em 'Quebre o Cadeado', Mila Kadosh nos guia por uma jornada de autoconhecimento e libertação emocional. Cada capítulo é uma chave para destrancar medos, crenças limitantes e padrões que nos impedem de viver em nossa plenitude. Uma obra que combina psicologia, espiritualidade e histórias reais de transformação.",
    coverColor: "from-[#2D1B2E] to-[#1a0a1e]",
    category: "Desenvolvimento Pessoal",
    quote: "A prisão mais cruel não é feita de grades, mas de pensamentos que repetimos há tempo demais.",
    amazonUrl: "#",
  },
  {
    id: "2",
    slug: "ativando-a-mulher-de-choque",
    title: "Ativando a Mulher de Choque",
    subtitle: "O despertar da sua versão mais poderosa",
    description: "Um manifesto para mulheres que decidem assumir o controle de suas vidas.",
    longDescription:
      "Este livro é um chamado para todas as mulheres que sentem que há algo mais esperando por elas. Mila Kadosh apresenta um método prático e emocional para ativar a 'Mulher de Choque' — aquela versão de si mesma que não aceita menos do que merece, que ousa sonhar grande e que transforma obstáculos em combustível.",
    coverColor: "from-[#4A1A2C] to-[#2a0a18]",
    category: "Empoderamento Feminino",
    quote: "Você não precisa se curar para começar. Você começa e a cura acontece no caminho.",
    amazonUrl: "#",
  },
  {
    id: "3",
    slug: "os-segredos-de-lucian",
    title: "Os Segredos de Lucian",
    subtitle: "Um romance de mistério e autodescoberta",
    description: "Entre segredos antigos e revelações transformadoras, uma história que vai tocar sua alma.",
    longDescription:
      "Neste romance envolvente, Mila Kadosh tece uma narrativa onde o mistério encontra a espiritualidade. Lucian guarda segredos que podem transformar não apenas sua própria vida, mas a de todos ao seu redor. Uma história sobre amor, perda e a coragem de enfrentar a verdade.",
    coverColor: "from-[#1C2D3A] to-[#0a151e]",
    category: "Romance / Ficção",
    quote: "Alguns segredos precisam ser revelados para que possamos finalmente viver.",
    amazonUrl: "#",
  },
  {
    id: "4",
    slug: "livro-digital-ia",
    title: "Livro Digital IA",
    subtitle: "O guia prático para criar conteúdo com inteligência artificial",
    description: "Aprenda a usar a IA para transformar sua criatividade em resultados reais.",
    longDescription:
      "Mila Kadosh une sua experiência em tecnologia e criatividade neste guia prático sobre inteligência artificial. Do conceito à prática, você aprenderá a usar ferramentas de IA para potencializar sua produção de conteúdo, automatizar processos e criar com mais eficiência — sem perder sua essência humana.",
    coverColor: "from-[#1A2A3A] to-[#0a1520]",
    category: "Tecnologia / Negócios",
    quote: "A tecnologia não veio para substituir a arte, mas para libertar o artista.",
    amazonUrl: "#",
  },
  {
    id: "5",
    slug: "7-passos-para-transformacao",
    title: "7 Passos para a Transformação da Sua Vida",
    subtitle: "Um método comprovado para reinventar sua história",
    description: "Sete passos práticos para uma transformação profunda e duradoura.",
    longDescription:
      "Baseado em anos de experiência e estudos, Mila Kadosh apresenta um método de 7 passos que já transformou centenas de vidas. Cada passo é uma camada de autoconhecimento, cura e ação. Da identificação dos padrões à criação de uma nova identidade, este livro é o mapa para sua reinvenção pessoal.",
    coverColor: "from-[#3A2A1A] to-[#1a0e08]",
    category: "Desenvolvimento Pessoal",
    quote: "Sua transformação não é sobre se tornar alguém novo, mas sobre lembrar quem você sempre foi.",
    amazonUrl: "#",
  },
]
