const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const POSTS_FILE = path.join(__dirname, '../data/posts.json');

// Garantir que a pasta de dados existe
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'));
}

// Inicializar arquivo se não existir
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
}

/**
 * Gerencia a Persistência dos Posts do Blog
 */
const blogManager = {
  // Listar todos os posts
  getAll: (req, res) => {
    const data = JSON.parse(fs.readFileSync(POSTS_FILE));
    res.json(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
  },

  // Pegar um post pelo slug
  getBySlug: (req, res) => {
    const { slug } = req.params;
    const data = JSON.parse(fs.readFileSync(POSTS_FILE));
    const post = data.find(p => p.slug === slug);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    res.json(post);
  },

  // Salvar novo post (ou atualizar)
  save: (req, res) => {
    const { title, content, excerpt, category, author, status = 'Rascunho' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }

    const data = JSON.parse(fs.readFileSync(POSTS_FILE));
    
    const slug = title.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    const newPost = {
      id: uuidv4(),
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      category: category || 'Geral',
      author: author || 'IA Agent',
      status,
      date: new Date().toISOString(),
      readTime: `${Math.ceil(content.split(' ').length / 200)} min`
    };

    data.push(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, post: newPost });
  }
};

module.exports = blogManager;
