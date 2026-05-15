const https = require('https');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendToDiscord(payload) {
  if (!WEBHOOK_URL) {
    console.log('[Discord] WEBHOOK_URL não configurada. Mensagem não enviada.');
    return null;
  }

  return new Promise((resolve, reject) => {
    const url = new URL(WEBHOOK_URL);
    const data = JSON.stringify(payload);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendArticleForApproval(article) {
  const embed = {
    title: `✍️ Novo Artigo para Aprovação: ${article.title}`,
    description: (article.excerpt || '').slice(0, 300),
    color: 0xFFA500,
    fields: [
      { name: '📊 SEO Score', value: `${article.seoScore || 75}/100`, inline: true },
      { name: '📂 Categoria', value: article.category || 'Geral', inline: true },
      { name: '🔑 Keywords', value: article.keywords || 'N/A', inline: false },
      { name: '🏷️ Tags', value: article.tags || 'N/A', inline: false },
      { name: '📝 Conteúdo', value: (article.content || '').slice(0, 500) + '...', inline: false },
      { name: '🏢 Branding', value: article.brandingApplied ? '✅ Incluído' : '❌ Não incluído', inline: true },
      { name: '🧲 Lead Magnet', value: article.leadMagnet || 'N/A', inline: true },
    ],
    footer: { text: `Artigo #${article.id || 'novo'} · ${new Date().toLocaleString('pt-BR')}` },
  };

  return sendToDiscord({
    content: '@here **Novo artigo aguardando aprovação editorial!**',
    embeds: [embed],
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 3, label: '✅ POSTAR AGORA', custom_id: `approve_${article.id || 'new'}` },
          { type: 2, style: 2, label: '📁 SALVAR RASCUNHO', custom_id: `draft_${article.id || 'new'}` },
          { type: 2, style: 4, label: '❌ REJEITAR', custom_id: `reject_${article.id || 'new'}` },
        ],
      },
    ],
  });
}

async function sendPublishConfirmation(article, approvedBy) {
  return sendToDiscord({
    content: `✅ **Artigo publicado!**`,
    embeds: [{
      title: `📰 ${article.title}`,
      description: `Aprovado por: ${approvedBy || 'Admin'}\nPublicado em: ${new Date().toLocaleString('pt-BR')}`,
      color: 0x22C55E,
      fields: [
        { name: '📊 SEO Score', value: `${article.seoScore || 75}/100`, inline: true },
        { name: '📂 Categoria', value: article.category || 'Geral', inline: true },
      ],
    }],
  });
}

module.exports = { sendToDiscord, sendArticleForApproval, sendPublishConfirmation };
