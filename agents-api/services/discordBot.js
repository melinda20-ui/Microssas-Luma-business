const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const { callOllama, callGemini } = require('../config/llm');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BOT_ENABLED = process.env.DISCORD_BOT_ENABLED === 'true';
const ALLOWED_CHANNELS = (process.env.DISCORD_BOT_CHANNELS || '').split(',').filter(Boolean);
const PREFIX = process.env.DISCORD_BOT_PREFIX || '!mia';

const conversations = new Map();

const SYSTEM_PROMPT = `Você é a Mia, assistente de IA do ecossistema Sualuma. 
Você responde em português brasileiro, de forma natural e direta.
Contexto: você faz parte de um sistema multiagentes com acesso a:
- Geração de sites, conteúdo, automações
- Análises de negócio e marketing
- Suporte técnico aos clientes
- Memória operacional entre conversas

Regras:
1. Responda sempre em pt-BR
2. Seja concisa — máximo 3 parágrafos
3. Para dúvidas complexas, ofereça escalar para time humano
4. Mantenha tom profissional mas amigável
5. Use emojis moderadamente`;

let client = null;

async function askMia(message, userId, userName) {
  const sessionId = `discord_${userId}`;
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: message });

  const context = history.slice(-8)
    .map(m => `${m.role === 'user' ? userName : 'Mia'}: ${m.content}`)
    .join('\n');

  const prompt = `${SYSTEM_PROMPT}\n\nHistórico da conversa:\n${context}\n\nMia:`;

  try {
    const response = await callOllama(prompt, process.env.OLLAMA_MODEL || 'llama3.2:3b', SYSTEM_PROMPT);
    const text = response?.response?.trim() || response?.trim() || '⚠️ Não consegui processar agora. Tente novamente.';
    history.push({ role: 'assistant', content: text });
    return text;
    } catch (err) {
      console.error('[DiscordBot] Erro ao chamar Ollama:', err.message);
      try {
        const gText = await callGemini(prompt);
        if (gText) {
          history.push({ role: 'assistant', content: gText });
          return gText;
        }
      } catch {}
    return '⚠️ Estou com instabilidade no momento. Tente novamente em alguns instantes.';
  }
}

function shouldRespond(msg) {
  if (msg.author.bot) return false;
  if (ALLOWED_CHANNELS.length > 0 && !ALLOWED_CHANNELS.includes(msg.channel.id)) return false;
  if (msg.mentions.has(client?.user)) return true;
  if (msg.content.startsWith(PREFIX)) return true;
  if (msg.channel.type === 1) return true;
  return false;
}

function cleanPrefix(text) {
  if (text.startsWith(PREFIX)) return text.slice(PREFIX.length).trim();
  return text.replace(/<@!?\d+>/g, '').trim();
}

async function startBot() {
  if (!BOT_TOKEN || !BOT_ENABLED) {
    console.log('[DiscordBot] Desativado — token ou flag ausente.');
    return null;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.once(Events.ClientReady, () => {
    console.log(`[DiscordBot] ✅ Online como ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: '🧠 Mia IA Online', type: ActivityType.Custom }],
      status: 'online',
    });
  });

  client.on(Events.MessageCreate, async (msg) => {
    if (!shouldRespond(msg)) return;

    const userId = msg.author.id;
    const userName = msg.author.globalName || msg.author.username;
    const userInput = cleanPrefix(msg.content);

    if (!userInput) {
      msg.reply('🧠 Oi! Me mande uma mensagem que eu chamo a Mia pra ajudar.');
      return;
    }

    await msg.channel.sendTyping();

    console.log(`[DiscordBot] ${userName} (${userId}) -> ${userInput.slice(0, 80)}`);

    try {
      const response = await askMia(userInput, userId, userName);
      await msg.reply(response);
      console.log(`[DiscordBot] Mia -> ${userName}: ${response.slice(0, 80)}...`);
    } catch (err) {
      console.error('[DiscordBot] Erro ao responder:', err.message);
      await msg.reply('⚠️ Erro interno ao processar sua mensagem. Tente novamente.');
    }
  });

  client.on(Events.Error, (err) => {
    console.error('[DiscordBot] Erro no gateway:', err.message);
  });

  try {
    await client.login(BOT_TOKEN);
    return client;
  } catch (err) {
    console.error('[DiscordBot] Falha no login:', err.message);
    return null;
  }
}

async function stopBot() {
  if (client) {
    client.destroy();
    client = null;
    console.log('[DiscordBot] Desconectado.');
  }
}

module.exports = { startBot, stopBot, askMia };
