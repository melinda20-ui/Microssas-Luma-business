const { callGemini } = require('../config/llm');
const { db } = require('../config/db');
const path = require('path');
const fs = require('fs');

const { getImageForSuggestion } = require('../services/imageCache');
const { saveVersion } = require('../services/contentVersioning');
const { sendArticleForApproval } = require('../services/discordService');

const SYSTEM_PROMPT = `Você é um redator SEO sênior especializado em conteúdo digital.
Cria artigos completos, bem estruturados e otimizados para mecanismos de busca.

**Regras de escrita:**
1. Artigos com EXATAMENTE 1000-1200 palavras
2. Introdução que prende atenção nos primeiros 100 caracteres
3. Desenvolvimento com H2, H3, listas e parágrafos curtos
4. CTA claro e contextual no meio e no final
5. Fechamento que conecta ao próximo artigo da sequência
6. Tom profissional mas acessível, em português brasileiro
7. Densidade de keyword: 1-2% natural
8. Incluir dados, exemplos ou analogias
9. Links internos sugeridos (apenas sugerir, não criar URLs)
10. E-E-A-T: demonstrar experiência no tema

**REGRAS DE ESTRUTURA VISUAL:**
- A cada 2-3 parágrafos, insira um marcador [IMAGE_PLACEHOLDER: descrição da imagem]
- A descrição deve ser específica e visual (ex: "Pessoa focada trabalhando em laptop", "Dashboard financeiro moderno")
- NÃO repita descrições de imagem
- Coloque [IMAGE_PLACEHOLDER] em linha própria

**REGRAS DE BRANDING:**
- Insira 1-2 menções naturais à Sualuma durante o artigo
- Use frases como: "Segundo a metodologia da Sualuma", "Como a Lude costuma ensinar", "Na visão estratégica da Sualuma"
- A menção deve soar natural, nunca forçada
- No final, adicione: "Quer se aprofundar? A Sualuma tem conteúdo exclusivo sobre este tema."

**FORMATO DE SAÍDA:**
[Conteúdo completo do artigo com [IMAGE_PLACEHOLDER] nos locais apropriados]

---
**📊 Resumo SEO:**
- Contagem de palavras: X
- Palavra-chave principal: X
- Densidade: X%
- Legibilidade: Fácil/Médio

**🏷️ Tags:** tag1, tag2, tag3, tag4, tag5
**📝 Meta Description:** texto com até 160 caracteres
**🖼️ Imagens:** desc1, desc2, desc3`;

function ensureQueueTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS content_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clerk_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      excerpt TEXT DEFAULT '',
      category TEXT DEFAULT 'Geral',
      tags TEXT DEFAULT '',
      seo_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      idea_id INTEGER,
      lead_magnet TEXT DEFAULT '',
      branding_applied INTEGER DEFAULT 0,
      image_descriptions TEXT DEFAULT '',
      discord_message_id TEXT,
      approved_by TEXT,
      approved_at DATETIME,
      scheduled_for DATETIME,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  try { db.prepare("ALTER TABLE content_queue ADD COLUMN lead_magnet TEXT DEFAULT ''").run(); } catch (_) {}
  try { db.prepare("ALTER TABLE content_queue ADD COLUMN branding_applied INTEGER DEFAULT 0").run(); } catch (_) {}
  try { db.prepare("ALTER TABLE content_queue ADD COLUMN image_descriptions TEXT DEFAULT ''").run(); } catch (_) {}
  try { db.prepare("ALTER TABLE content_queue ADD COLUMN discord_message_id TEXT").run(); } catch (_) {}
  try { db.prepare("ALTER TABLE content_queue ADD COLUMN approved_by TEXT").run(); } catch (_) {}
  try { db.prepare("ALTER TABLE content_queue ADD COLUMN approved_at DATETIME").run(); } catch (_) {}
}

function ensureSeoColumn() {
  try {
    db.prepare("ALTER TABLE content_ideas ADD COLUMN seo_score INTEGER DEFAULT 0").run();
  } catch (_) {}
  try {
    db.prepare("ALTER TABLE content_ideas ADD COLUMN tags TEXT DEFAULT ''").run();
  } catch (_) {}
  try {
    db.prepare("ALTER TABLE content_ideas ADD COLUMN keywords TEXT DEFAULT ''").run();
  } catch (_) {}
}

async function blogAgent(req, res) {
  const { action, ideaId, title, niche, keywords, clerkId, content, queueId } = req.body;

  ensureQueueTable();
  ensureSeoColumn();

  const actions = {
    generate: `Crie um artigo completo de blog em português brasileiro.

**Título:** ${title || 'Sem título'}
**Nicho:** ${niche || 'Geral'}
**Palavras-chave:** ${keywords || 'não especificado'}

Estrutura obrigatória:
1. **Introdução** (2-3 parágrafos com gancho forte)
2. **Desenvolvimento** (mínimo 4 seções com H2, use H3 quando necessário)
   - Seção 1: Contexto e problema
   - Seção 2: Solução detalhada
   - Seção 3: Exemplos práticos ou dados
   - Seção 4: Dicas avançadas
3. **CTA principal** (após desenvolvimento)
4. **Fechamento** (resumo + conexão com próximo tema sugerido)

Regras:
- Mínimo 1000 palavras, máximo 1200
- Parágrafos de 2-4 linhas
- Use listas bullet points quando relevante
- Inclua sugestão de link interno natural
- CTA no meio e no final do artigo
- Último parágrafo: "No próximo artigo, vamos explorar..."

Formato da resposta:
---
[Conteúdo completo do artigo]

---
**📊 Resumo SEO:**
- Contagem de palavras: X
- Palavra-chave principal: X
- Densidade: X%
- Legibilidade: Fácil/Médio

**🏷️ Tags:** tag1, tag2, tag3, tag4, tag5
**📝 Meta Description:** texto com até 160 caracteres`,

    review: `Revise o artigo abaixo e sugira melhorias antes da publicação.

**Artigo:**
${(content || '').slice(0, 3000)}

Verifique:
1. ✅ Ortografia e gramática
2. ✅ Clareza e fluidez
3. ✅ Estrutura (H2, parágrafos, transições)
4. ✅ SEO (keyword density, meta, headings)
5. ✅ CTA e engajamento

Responda: APROVADO ou PRECISA_REVISAR com justificativa.`,

    regenerate: `Com base no feedback abaixo, reescreva o artigo melhorando os pontos indicados.

**Feedback:** ${content || 'Melhore o artigo'}
**Título original:** ${title || ''}

Mantenha a mesma estrutura e palavras-chave, mas corrija os problemas apontados.`,
  };

  if (!action || !actions[action]) {
    return res.status(400).json({
      error: 'Ação inválida. Use: generate, review, regenerate',
      availableActions: Object.keys(actions),
    });
  }

  try {
    if (action === 'generate') {
      const prompt = actions.generate;
      const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

      const wordCount = response.split(/\s+/).length;
      const tagMatch = response.match(/\*\*🏷️ Tags:\*\*\s*(.+)/i);
      const metaMatch = response.match(/\*\*📝 Meta Description:\*\*\s*(.+)/i);
      const imgMatch = response.match(/\*\*🖼️ Imagens:\*\*\s*(.+)/i);
      const tags = tagMatch ? tagMatch[1].trim() : '';
      const metaDescription = metaMatch ? metaMatch[1].trim() : '';
      const imageDescs = imgMatch ? imgMatch[1].trim() : '';

      // Extract IMAGE_PLACEHOLDERs and cache suggestions
      const imagePlaceholders = response.match(/\[IMAGE_PLACEHOLDER:[^\]]+\]/g) || [];
      const imageContexts = imagePlaceholders.map(p => p.replace(/\[IMAGE_PLACEHOLDER:\s*([^\]]+)\]/, '$1').trim());
      const imageEntries = imageContexts.map(ctx => {
        const img = getImageForSuggestion(ctx);
        return { context: ctx, url: img.url, source: img.source };
      });

      // Add branding flag
      const brandingApplied = /Sualuma|Lude|Ludi/i.test(response);

      // Save version for rollback
      const postId = require('crypto').randomUUID();
      saveVersion(postId, response, { title, niche, keywords, tags, wordCount });

      const post = {
        id: postId,
        title: title || 'Artigo Gerado',
        slug: (title || 'artigo-gerado').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        content: response,
        excerpt,
        category: niche || 'Geral',
        author: 'Blog Agent IA',
        status: 'Rascunho',
        date: new Date().toISOString(),
        tags,
        metaDescription,
        wordCount,
        imageEntries,
        brandingApplied,
        readTime: `${Math.max(1, Math.round(wordCount / 200))} min`,
      };

      const postsPath = path.join(__dirname, '../data/posts.json');
      let posts = [];
      try {
        posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      } catch {}
      posts.push(post);
      fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

      if (ideaId) {
        db.prepare("UPDATE content_ideas SET status = 'published', seo_score = ?, tags = ?, keywords = ? WHERE id = ?")
          .run(75, tags, keywords || '', ideaId);
      }

      // Get lead magnet from inventory (match system)
      let leadMagnet = '';
      try {
        const magnets = db.prepare("SELECT title, description, type, category, download_count, conversion_count FROM lead_magnets WHERE status IN ('published', 'approved') ORDER BY conversion_count DESC, download_count DESC").all();
        if (magnets.length > 0) {
          // Score-based matching
          let bestMatch = null; let bestScore = 0;
          const aTitle = (title || '').toLowerCase();
          const aNiche = (niche || '').toLowerCase();
          for (const m of magnets) {
            let score = 0;
            const mTitle = (m.title || '').toLowerCase();
            const mCat = (m.category || '').toLowerCase();
            if (aNiche && mCat.includes(aNiche)) score += 30;
            if (aNiche && aNiche.includes(mCat)) score += 20;
            const titleWords = aTitle.split(' ');
            for (const w of titleWords) { if (w.length > 3 && mTitle.includes(w)) { score += 5; } }
            score += Math.min(m.download_count || 0, 15);
            score += Math.min(m.conversion_count || 0, 20);
            if (score > bestScore) { bestScore = score; bestMatch = m; }
          }
          if (bestMatch && bestScore > 0) {
            leadMagnet = bestMatch.title;
          }
        }
        if (!leadMagnet) {
          // Fallback: Gemini suggestion
          const lmRes = await callGemini(
            `Com base no título "${title}" e categoria "${niche}", sugira APENAS o nome de uma isca digital com emoji. Ex: "📋 Planner de Foco"`,
            'gemini-1.5-flash'
          );
          leadMagnet = lmRes.trim().slice(0, 100);
        }
      } catch {}

      ensureQueueTable();
      db.prepare(`INSERT INTO content_queue (clerk_id, title, content, excerpt, tags, seo_score, status, idea_id, lead_magnet, branding_applied, image_descriptions)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`)
        .run(clerkId || 'system', title, response.slice(0, 500), excerpt, tags, 75, ideaId || null, leadMagnet, brandingApplied ? 1 : 0, imageDescs);

      const queueId = db.prepare('SELECT last_insert_rowid() as id').get().id;

      // Send to Discord for approval
      try {
        await sendArticleForApproval({
          id: queueId,
          title,
          content: response,
          excerpt,
          category: niche,
          tags,
          seoScore: 75,
          keywords,
          brandingApplied,
          leadMagnet,
        });
      } catch (discordErr) {
        console.log('[BlogAgent] Discord not configured, skipping approval notification.');
      }

      return res.json({
        success: true,
        agent: 'blog',
        action: 'generated',
        post,
        queueId,
        leadMagnet,
        brandingApplied,
        imageEntries,
        metadata: {
          wordCount,
          tags,
          readTime: post.readTime,
          discordNotified: !!process.env.DISCORD_WEBHOOK_URL,
        },
      });
    }

    if (action === 'review') {
      const prompt = actions.review;
      const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

      const approved = /APROVADO/i.test(response);
      if (queueId) {
        db.prepare("UPDATE content_queue SET status = ? WHERE id = ?")
          .run(approved ? 'reviewed' : 'revision', queueId);
      }

      return res.json({
        success: true,
        agent: 'blog',
        action: 'reviewed',
        approved,
        feedback: response,
        queueId: queueId || null,
      });
    }

    if (action === 'regenerate') {
      const prompt = actions.regenerate;
      const response = await callGemini(prompt, 'gemini-1.5-flash', SYSTEM_PROMPT);

      if (queueId) {
        db.prepare("UPDATE content_queue SET content = ?, status = 'draft' WHERE id = ?")
          .run(response.slice(0, 500), queueId);
      }

      return res.json({
        success: true,
        agent: 'blog',
        action: 'regenerated',
        content: response,
      });
    }
  } catch (err) {
    console.error('[Blog Agent Error]', err);
    res.status(500).json({ error: err.message });
  }
}

async function getQueue(req, res) {
  ensureQueueTable();
  const queue = db.prepare('SELECT * FROM content_queue ORDER BY created_at DESC').all();
  res.json(queue);
}

async function updateQueueStatus(req, res) {
  ensureQueueTable();
  const { status, scheduledFor } = req.body;
  db.prepare(`UPDATE content_queue SET status = COALESCE(?, status), scheduled_for = COALESCE(?, scheduled_for) WHERE id = ?`)
    .run(status, scheduledFor || null, req.params.id);
  const item = db.prepare('SELECT * FROM content_queue WHERE id = ?').get(req.params.id);
  res.json(item);
}

async function publishBatch(req, res) {
  ensureQueueTable();

  const postsPath = path.join(__dirname, '../data/posts.json');
  let posts = [];
  try {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  } catch {}

  const todayPublished = posts.filter(p => {
    const d = new Date(p.date);
    const now = new Date();
    return d.toDateString() === now.toDateString() && p.status === 'published';
  }).length;

  if (posts.length < 20) {
    return res.json({
      success: false,
      message: `Apenas ${posts.length} artigos no total. Necessário mínimo 20 para ativar publicação automática.`,
      totalPosts: posts.length,
      minimumRequired: 20,
    });
  }

  const maxPerDay = 5;
  if (todayPublished >= maxPerDay) {
    return res.json({
      success: false,
      message: `Limite diário atingido: ${todayPublished}/${maxPerDay} artigos publicados hoje.`,
      publishedToday: todayPublished,
      maxPerDay,
    });
  }

  const drafts = db.prepare("SELECT * FROM content_queue WHERE status IN ('draft', 'reviewed') ORDER BY seo_score DESC LIMIT ?")
    .all(maxPerDay - todayPublished);

  const published = [];
  for (const draft of drafts) {
    const slug = draft.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = {
      id: require('crypto').randomUUID(),
      title: draft.title,
      slug: `${slug}-${Date.now()}`,
      content: draft.content || draft.excerpt,
      excerpt: draft.excerpt,
      category: draft.category,
      author: 'Blog Agent IA',
      status: 'published',
      date: new Date().toISOString(),
      tags: draft.tags,
      readTime: `${Math.max(1, Math.round((draft.content || '').split(/\s+/).length / 200))} min`,
    };
    posts.push(post);
    published.push(post);

    db.prepare("UPDATE content_queue SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(draft.id);
  }

  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

  res.json({
    success: true,
    published: published.length,
    posts: published,
    totalPublishedToday: todayPublished + published.length,
    maxPerDay,
  });
}

async function getStats(req, res) {
  const postsPath = path.join(__dirname, '../data/posts.json');
  let posts = [];
  try {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  } catch {}

  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status !== 'published');
  const todayPublished = published.filter(p => {
    const d = new Date(p.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const categories = {};
  for (const p of published) {
    categories[p.category] = (categories[p.category] || 0) + 1;
  }

  res.json({
    totalPosts: posts.length,
    published: published.length,
    drafts: drafts.length,
    todayPublished,
    categories,
    canAutoPublish: posts.length >= 20,
    remainingToday: Math.max(0, 5 - todayPublished),
    maxPerDay: 5,
    minimumForAuto: 20,
  });
}

module.exports = { blogAgent, getQueue, updateQueueStatus, publishBatch, getStats };
