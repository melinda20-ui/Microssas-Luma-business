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
            last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    console.log('✅ Banco de Dados SQLite Inicializado (Blog + Video + Users)');
};

module.exports = {
    db,
    initDb
};
