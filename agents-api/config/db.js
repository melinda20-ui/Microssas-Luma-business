const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Garante que a pasta data existe
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, 'sualuma.db'));

// Inicialização das tabelas
const initDb = () => {
    // Tabela do BlogIA (Legado integrado)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            category TEXT,
            readTime TEXT,
            image TEXT,
            status TEXT DEFAULT 'published',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela da Fábrica de Vídeos (Nova)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS video_vault (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_name TEXT,
            status TEXT DEFAULT 'pending',
            style TEXT DEFAULT 'clean',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            alert_sent INTEGER DEFAULT 0
        )
    `).run();

    // Tabela de Notificações (Nova)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Usuários (Nova - Monetização)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            clerk_id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            credits INTEGER DEFAULT 20,
            plan TEXT DEFAULT 'free',
            role TEXT DEFAULT 'user',
            last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Migração: adiciona coluna role se não existir (bancos existentes)
    try {
        db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
    } catch (_) { /* já existe */ }

    // Garante que o super-admin está registrado no banco
    const existing = db.prepare("SELECT clerk_id, role FROM users WHERE email = ?").get(SUPER_ADMIN_EMAIL);
    if (!existing) {
        db.prepare("INSERT OR IGNORE INTO users (clerk_id, email, credits, plan, role) VALUES (?, ?, ?, ?, ?)")
            .run('super-admin-seed', SUPER_ADMIN_EMAIL, 999999, 'pro', 'super-admin');
    } else if (existing.role !== 'super-admin') {
        db.prepare("UPDATE users SET role = 'super-admin', plan = 'pro' WHERE email = ?")
            .run(SUPER_ADMIN_EMAIL);
    }

    // Tabela de Pedidos do Marketplace (Sprint 4)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            clerk_id TEXT NOT NULL,
            service_name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            price REAL DEFAULT 0,
            provider TEXT DEFAULT 'IA Agent',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Tarefas / Kanban (Sprint 4)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'todo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Mensagens do Pedido (Sprint 4)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS order_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Tarefas do Cérebro (Mia Brain - BLOCO 3)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS brain_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            clerk_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            payload TEXT DEFAULT '{}',
            status TEXT DEFAULT 'PENDING',
            approved_by TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Metas Financeiras (BLOCO 5)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS financial_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clerk_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            target_value REAL DEFAULT 0,
            current_value REAL DEFAULT 0,
            category TEXT DEFAULT 'revenue',
            status TEXT DEFAULT 'active',
            due_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Ideias de Conteúdo (BLOCO 5)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS content_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clerk_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            category TEXT DEFAULT 'acquisition',
            financial_goal_id INTEGER,
            status TEXT DEFAULT 'draft',
            platform TEXT DEFAULT 'blog',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Fila de Publicação (BLOCO 6)
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
            scheduled_for DATETIME,
            published_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Migração: colunas SEO em content_ideas
    try { db.prepare("ALTER TABLE content_ideas ADD COLUMN seo_score INTEGER DEFAULT 0").run(); } catch (_) {}
    try { db.prepare("ALTER TABLE content_ideas ADD COLUMN tags TEXT DEFAULT ''").run(); } catch (_) {}
    try { db.prepare("ALTER TABLE content_ideas ADD COLUMN keywords TEXT DEFAULT ''").run(); } catch (_) {}

    // Tabela de Campanhas (BLOCO 7)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clerk_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            platform TEXT DEFAULT 'organic',
            objective TEXT DEFAULT 'conversion',
            budget REAL DEFAULT 0,
            audience TEXT DEFAULT '',
            creative TEXT DEFAULT '',
            status TEXT DEFAULT 'PENDING',
            review_notes TEXT DEFAULT '',
            approved_by TEXT DEFAULT NULL,
            approved_at DATETIME,
            executed_at DATETIME,
            completed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Versionamento de Conteúdo (SQLite)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS content_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT NOT NULL,
            content TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            version INTEGER NOT NULL,
            saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Migração: importa versões JSON existentes
    try {
        const count = db.prepare("SELECT COUNT(*) as c FROM content_versions").get();
        if (count.c === 0) {
            const versionsDir = path.join(__dirname, '../data/versions');
            if (fs.existsSync(versionsDir)) {
                const files = fs.readdirSync(versionsDir).filter(f => f.endsWith('.json'));
                const insert = db.prepare(
                    "INSERT INTO content_versions (post_id, content, metadata, version, saved_at) VALUES (?, ?, ?, ?, ?)"
                );
                for (const file of files) {
                    try {
                        const data = JSON.parse(fs.readFileSync(path.join(versionsDir, file), 'utf-8'));
                        insert.run(data.postId, data.content, JSON.stringify(data.metadata), data.version, data.savedAt);
                    } catch {}
                }
                if (files.length > 0) console.log(`📦 Importadas ${files.length} versões JSON para SQLite`);
            }
        }
    } catch (_) {}

    // Tabela de Histórico de Receita (gráficos temporais)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS revenue_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            mrr REAL DEFAULT 0,
            total_revenue REAL DEFAULT 0,
            paying_users INTEGER DEFAULT 0,
            total_users INTEGER DEFAULT 0,
            conversion_rate REAL DEFAULT 0,
            snapshot_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela de Sequências de Email para Campanhas
    db.prepare(`
        CREATE TABLE IF NOT EXISTS email_sequences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            body TEXT DEFAULT '',
            days_after_start INTEGER DEFAULT 0,
            status TEXT DEFAULT 'draft',
            sent_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    try { db.prepare("ALTER TABLE content_queue ADD COLUMN campaign_id INTEGER DEFAULT NULL").run(); } catch (_) {}

    console.log('✅ Banco de Dados SQLite Atualizado (Monetização + Marketplace + Brain + Financeiro + SEO + Campanhas + Versões + Histórico + Email)');
};

const SUPER_ADMIN_EMAIL = 'lumabusinessa1.0@gmail.com';

module.exports = {
    db,
    initDb,
    SUPER_ADMIN_EMAIL
};
