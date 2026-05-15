const { db } = require('../config/db');

/**
 * Serviço de leitura de dados financeiros
 * Usa Stripe API quando disponível, fallback para DB local
 */

async function fetchFromStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.startsWith('sk_test_placeholder')) {
    return null;
  }
  try {
    const stripe = require('stripe')(stripeKey);
    const [balance, charges, subscriptions] = await Promise.all([
      stripe.balance.retrieve().catch(() => null),
      stripe.charges.list({ limit: 50 }).catch(() => null),
      stripe.subscriptions.list({ limit: 50, status: 'all' }).catch(() => null),
    ]);
    return { balance, charges, subscriptions };
  } catch {
    return null;
  }
}

function readLocalFinancialData() {
  try {
    const users = db.prepare('SELECT clerk_id, email, plan, credits, role FROM users').all();
    const orders = db.prepare('SELECT id, clerk_id, service_name, status, price, created_at FROM orders').all();
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

    const planCounts = {};
    const planRevenue = {};
    for (const u of users) {
      const p = u.plan || 'free';
      planCounts[p] = (planCounts[p] || 0) + 1;
    }
    for (const o of orders) {
      if (o.status === 'completed') {
        planRevenue[o.service_name] = (planRevenue[o.service_name] || 0) + (parseFloat(o.price) || 0);
      }
    }

    const completedOrders = orders.filter(o => o.status === 'completed');
    const recentOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return (now - d) < 30 * 24 * 60 * 60 * 1000;
    });

    const subscriptions = db.prepare(`
      SELECT clerk_id, email, plan, credits FROM users WHERE plan != 'free'
    `).all();

    return {
      users: { total: users.length, byPlan: planCounts },
      orders: { total: orders.length, completed: completedOrders.length, recent30d: recentOrders.length },
      revenue: { total: totalRevenue, byService: planRevenue },
      subscriptions: { total: subscriptions.length, list: subscriptions },
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[StripeReader] Erro ao ler dados locais:', err);
    return null;
  }
}

function readFinancialMetrics() {
  const local = readLocalFinancialData();
  if (!local) return null;

  const totalUsers = local.users.total;
  const payingUsers = local.subscriptions.total;
  const conversionRate = totalUsers > 0 ? ((payingUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const totalRevenue = local.revenue.total;
  const mrr = totalRevenue / Math.max(1, (local.orders.recent30d || 1));

  return {
    mrr: Math.round(mrr * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalUsers,
    payingUsers,
    freeUsers: totalUsers - payingUsers,
    conversionRate: parseFloat(conversionRate),
    totalOrders: local.orders.total,
    completedOrders: local.orders.completed,
    recentOrders30d: local.orders.recent30d,
    planDistribution: local.users.byPlan,
    revenueByService: local.revenue.byService,
    subscriptions: local.subscriptions,
    fetchedAt: local.fetchedAt,
  };
}

async function readAll() {
  const stripe = await fetchFromStripe();
  const local = readLocalFinancialData();
  const metrics = readFinancialMetrics();

  return {
    stripe: stripe ? {
      balance: stripe.balance ? {
        available: stripe.balance.available.map(b => ({ amount: b.amount / 100, currency: b.currency })),
        pending: stripe.balance.pending.map(b => ({ amount: b.amount / 100, currency: b.currency })),
      } : null,
      recentCharges: stripe.charges ? stripe.charges.data.slice(0, 10).map(c => ({
        id: c.id, amount: c.amount / 100, currency: c.currency,
        status: c.status, created: new Date(c.created * 1000).toISOString(),
        description: c.description,
      })) : [],
      subscriptions: stripe.subscriptions ? {
        total: stripe.subscriptions.data.length,
        active: stripe.subscriptions.data.filter(s => s.status === 'active').length,
        canceled: stripe.subscriptions.data.filter(s => s.status === 'canceled').length,
        pastDue: stripe.subscriptions.data.filter(s => s.status === 'past_due').length,
      } : null,
    } : null,
    local,
    metrics,
  };
}

module.exports = { readAll, readFinancialMetrics, readLocalFinancialData };
