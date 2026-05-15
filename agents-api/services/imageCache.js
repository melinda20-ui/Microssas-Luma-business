const path = require('path');
const fs = require('fs');

const CACHE_FILE = path.join(__dirname, '../data/image_cache.json');

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {}
  return { images: [], usedContexts: [] };
}

function saveCache(cache) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error('[ImageCache] Erro ao salvar:', err);
  }
}

function getImageForContext(context) {
  const cache = loadCache();
  const normalized = context.toLowerCase().trim();

  const existing = cache.images.find(i => i.contexts.some(c => normalized.includes(c) || c.includes(normalized)));
  if (existing) return existing.url;

  return null;
}

function addImage(context, url, source = 'fallback') {
  const cache = loadCache();
  const normalized = context.toLowerCase().trim();

  const existing = cache.images.find(i => i.url === url);
  if (existing) {
    if (!existing.contexts.includes(normalized)) {
      existing.contexts.push(normalized);
    }
    saveCache(cache);
    return;
  }

  cache.images.push({
    url,
    source,
    contexts: [normalized],
    addedAt: new Date().toISOString(),
  });
  cache.usedContexts.push(normalized);

  saveCache(cache);
}

function isContextUsed(context) {
  const cache = loadCache();
  return cache.usedContexts.includes(context.toLowerCase().trim());
}

function getImageForSuggestion(description) {
  const cached = getImageForContext(description);
  if (cached) return { url: cached, source: 'cache', suggestion: description };

  const fallbacks = {
    'pessoa': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    'trabalhando': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'dashboard': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'financeiro': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    'produtividade': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    'tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'negocios': 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=800',
    'successo': 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800',
    'equipe': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'growth': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'estrategia': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'ia': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'dados': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'automação': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    'conteudo': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    'conversão': 'https://images.unsplash.com/photo-1553729459-afe8f2e7ed95?w=800',
    'cliente': 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
    'lideranca': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    'inovacao': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  };

  const lower = description.toLowerCase();
  for (const [key, url] of Object.entries(fallbacks)) {
    if (lower.includes(key)) {
      addImage(description, url, 'fallback');
      return { url, source: 'fallback', suggestion: description };
    }
  }

  const defaultUrl = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800';
  addImage(description, defaultUrl, 'default');
  return { url: defaultUrl, source: 'default', suggestion: description };
}

function getStats() {
  const cache = loadCache();
  return {
    totalImages: cache.images.length,
    totalContexts: cache.usedContexts.length,
    bySource: cache.images.reduce((acc, i) => {
      acc[i.source] = (acc[i.source] || 0) + 1;
      return acc;
    }, {}),
  };
}

module.exports = { getImageForSuggestion, addImage, isContextUsed, getStats };
