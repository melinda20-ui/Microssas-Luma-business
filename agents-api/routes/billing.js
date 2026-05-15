const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? require('stripe')(STRIPE_KEY) : null;

// Planos com Price IDs reais do Stripe (carregados do luma-os .env)
const PLANS = {
    'basic': { credits: 200, name: 'Plano Básico', priceId: process.env.STRIPE_PRICE_BASICO || 'price_basic_placeholder' },
    'pro': { credits: 1000, name: 'Plano Pro', priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder' },
    'premium': { credits: 5000, name: 'Plano Premium', priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_placeholder' }
};

/**
 * Cria uma Sessão de Checkout do Stripe
 */
router.post('/checkout', async (req, res) => {
    const { planId } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId || !PLANS[planId]) {
        return res.status(400).json({ error: 'Plano inválido ou usuário não identificado.' });
    }

    // Modo simulação quando Stripe não está configurado
    if (!stripe) {
        return res.json({
            mock: true,
            url: `/studio-lab?mock-checkout=${planId}`,
            message: 'Modo simulação: pagamento não processado. Stripe não configurado.'
        });
    }

    try {
        const plan = PLANS[planId];
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: plan.priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            client_reference_id: userId, // Importante para o Webhook saber quem pagou
            metadata: { planId }
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('[Stripe Error]', err);
        res.status(500).json({ error: 'Erro ao criar sessão de pagamento.' });
    }
});

/**
 * Webhook para escutar confirmação de pagamento
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) return res.status(200).json({ mock: true, message: 'Stripe não configurado' });

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const planId = session.metadata.planId;

        if (userId && planId && PLANS[planId]) {
            const addedCredits = PLANS[planId].credits;
            
            // Atualiza o plano e os créditos do usuário
            db.prepare('UPDATE users SET plan = ?, credits = credits + ? WHERE clerk_id = ?')
              .run(planId, addedCredits, userId);
            
            console.log(`[Stripe Webhook] Plano ${planId} ativado para usuário ${userId}. +${addedCredits} créditos.`);
            
            // Cria notificação de sucesso
            db.prepare('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)')
              .run('Pagamento Confirmado!', `Seu plano ${PLANS[planId].name} foi ativado com sucesso. Aproveite seus créditos!`, 'success');
        }
    }

    res.json({ received: true });
});

module.exports = router;
