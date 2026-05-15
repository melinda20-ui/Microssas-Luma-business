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

    console.log('✅ Banco de Dados SQLite Atualizado (Monetização + Marketplace)');
};

const SUPER_ADMIN_EMAIL = 'lumabusinessa1.0@gmail.com';

module.exports = {
    db,
    initDb,
    SUPER_ADMIN_EMAIL
};
