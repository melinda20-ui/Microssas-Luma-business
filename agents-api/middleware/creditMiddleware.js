const { db, SUPER_ADMIN_EMAIL } = require('../config/db');

/**
 * Middleware para validar e descontar créditos de IA
 */
const creditMiddleware = (cost = 1) => {
    return (req, res, next) => {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não identificado. Faça login para usar a IA.' });
        }

        try {
            // Busca o usuário no banco
            const user = db.prepare('SELECT credits, plan FROM users WHERE clerk_id = ?').get(userId);

            if (!user) {
                const email = req.headers['x-user-email'] || 'unknown';
                const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
                const credits = isSuperAdmin ? 999999 : 20;
                const role = isSuperAdmin ? 'super-admin' : 'user';
                const plan = isSuperAdmin ? 'pro' : 'free';

                db.prepare('INSERT INTO users (clerk_id, email, credits, plan, role) VALUES (?, ?, ?, ?, ?)')
                  .run(userId, email, credits, plan, role);

                if (isSuperAdmin) {
                    console.log(`[SuperAdmin] Conta super-admin ativada para ${email}`);
                }
                
                return res.status(200).json({ 
                    info: isSuperAdmin
                        ? 'Conta super-admin ativada com créditos ilimitados.'
                        : 'Conta ativada com 20 créditos gratuitos. Tente novamente.',
                    retry: true 
                });
            }

            // Verifica saldo
            if (user.credits < cost) {
                return res.status(402).json({ 
                    error: 'Créditos insuficientes.', 
                    message: `Esta ação custa ${cost} créditos. Você possui ${user.credits}. Faça um upgrade para continuar!`,
                    balance: user.credits
                });
            }

            // Desconta os créditos
            db.prepare('UPDATE users SET credits = credits - ? WHERE clerk_id = ?').run(cost, userId);
            
            console.log(`[Billing] Usuário ${userId} consumiu ${cost} créditos. Saldo atual: ${user.credits - cost}`);
            
            next();
        } catch (err) {
            console.error('[Billing Error]', err);
            res.status(500).json({ error: 'Erro ao processar cobrança de créditos.' });
        }
    };
};

module.exports = creditMiddleware;
