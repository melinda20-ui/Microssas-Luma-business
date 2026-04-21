const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/db');

// Configuração dos Planos (Price IDs fictícios - Substituir pelos reais no Stripe Dashboard)
const PLANS = {
    'basic': { credits: 200, name: 'Plano Básico', priceId: 'price_basic_123' },
    'pro': { credits: 1000, name: 'Plano Pro', priceId: 'price_pro_123' }
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

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'brl',
                    product_data: { name: PLANS[planId].name },
                    unit_amount: planId === 'pro' ? 14900 : 4900,
                },
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

        if (userId && PLANS[planId]) {
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
