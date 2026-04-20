const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const blogService = {
  // Buscar todos os posts
  async getAllPosts() {
    try {
      const res = await fetch(`${API_URL}/blog`);
      if (!res.ok) throw new Error('Falha ao carregar posts');
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // Buscar um post único pelo slug
  async getPostBySlug(slug: string) {
    try {
      const res = await fetch(`${API_URL}/blog/${slug}`);
      if (!res.ok) throw new Error('Post não encontrado');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Salvar um novo post (ou rascunho)
  async savePost(postData: any) {
    try {
      const res = await fetch(`${API_URL}/blog/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  },

  // Pedir para a IA gerar um post
  async generateWithAI(topic: string) {
    try {
      // Usando o agente Content Creator que já criamos
      const res = await fetch(`${API_URL}/agents/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'blog',
          topic: topic,
          tone: 'profissional e futurista',
          plan: 'pro'
        }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
};
