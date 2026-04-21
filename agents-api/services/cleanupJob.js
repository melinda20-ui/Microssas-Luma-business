const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

const STORAGE_PATH = path.join(__dirname, '../storage/videos');

/**
 * Job de limpeza e alerta de vídeos
 */
const runCleanupJob = () => {
    console.log('[Cleanup Job] Iniciando verificação de rotina...');
    const now = new Date().toISOString();

    // 1. Procurar vídeos expirados (expires_at < agora)
    const expiredVideos = db.prepare('SELECT * FROM video_vault WHERE expires_at < ?').all(now);

    expiredVideos.forEach(video => {
        const filePath = path.join(STORAGE_PATH, video.filename);
        
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[Cleanup Job] Arquivo deletado: ${video.filename}`);
            }
            
            db.prepare('DELETE FROM video_vault WHERE id = ?').run(video.id);
            console.log(`[Cleanup Job] Registro removido do banco: ${video.id}`);
        } catch (err) {
            console.error(`[Cleanup Job] Erro ao deletar vídeo ${video.id}:`, err);
        }
    });

    // 2. Procurar vídeos que expiram em menos de 2 dias e ainda não foram alertados
    // Calculamos: se expires_at < (agora + 48h)
    const twoDaysFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const imminentExpiring = db.prepare('SELECT * FROM video_vault WHERE expires_at < ? AND alert_sent = 0').all(twoDaysFromNow);

    imminentExpiring.forEach(video => {
        const message = `Seu vídeo "${video.original_name || video.filename}" será apagado em menos de 48 horas para liberar espaço. Baixe-o agora se precisar!`;
        
        db.prepare('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)')
          .run('Aviso de Deleção Imunente', message, 'warning');
        
        db.prepare('UPDATE video_vault SET alert_sent = 1 WHERE id = ?').run(video.id);
        console.log(`[Cleanup Job] Alerta enviado para o vídeo: ${video.id}`);
    // 3. Reset de Créditos à Meia-Noite (Plano Free)
    // Buscamos usuários que não foram resetados hoje
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const usersToReset = db.prepare("SELECT * FROM users WHERE plan = 'free' AND last_reset < ?").all(today);

    usersToReset.forEach(user => {
        db.prepare("UPDATE users SET credits = 20, last_reset = CURRENT_TIMESTAMP WHERE clerk_id = ?")
          .run(user.clerk_id);
        console.log(`[Cleanup Job] Créditos resetados para: ${user.clerk_id}`);
    });

    console.log('[Cleanup Job] Verificação concluída.');
};

// Inicia o job a cada 6 horas por padrão
const startJob = (intervalMs = 6 * 60 * 60 * 1000) => {
    runCleanupJob(); // Roda uma vez no início
    setInterval(runCleanupJob, intervalMs);
};

module.exports = {
    runCleanupJob,
    startJob
};
