"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Check, Zap, Rocket, Star, Loader2 } from 'lucide-react';

const PLANS = [
    {
        id: 'free',
        name: 'Plano Gratuito',
        price: 'R$ 0',
        credits: 20,
        features: [
            '20 créditos diários',
            'Agente Mia (Suporte)',
            'Acesso básico ao Blog',
            'Reset à meia-noite'
        ],
        icon: <Zap className="text-gray-400" />
    },
    {
        id: 'basic',
        name: 'Plano Básico',
        price: 'R$ 49',
        credits: 200,
        features: [
            '200 créditos mensais',
            'Agentes de Conteúdo',
            'Business Intelligence',
            'Fábrica de Vídeos v0.1'
        ],
        icon: <Star className="text-amber-500" />,
        highlight: true
    },
    {
        id: 'pro',
        name: 'Plano Pro',
        price: 'R$ 149',
        credits: 1000,
        features: [
            '1000 créditos mensais',
            'Gerador de Sites Premium',
            'Automações n8n ilimitadas',
            'Suporte VIP 24h',
            'Agentes de Vendas (Shopify/TikTok)'
        ],
        icon: <Rocket className="text-purple-500" />
    }
];

export default function BillingPage() {
    const { user, isLoaded } = useUser();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        if (!user) return;
        setLoadingPlan(planId);

        try {
            const res = await fetch('http://localhost:3001/api/billing/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ planId })
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Erro ao iniciar checkout', err);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4 font-outfit">
                Escolha o seu Nível de Poder
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                Desbloqueie agentes mais inteligentes, créditos extras e ferramentas de faturamento automático para o seu negócio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`relative bg-zinc-900/50 border ${plan.highlight ? 'border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'border-white/10'} p-8 rounded-3xl flex flex-col backdrop-blur-xl transition-all hover:scale-[1.02]`}
                    >
                        {plan.highlight && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                Mais Popular
                            </span>
                        )}

                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-left">{plan.name}</h3>
                                <div className="text-3xl font-black mt-2 text-left">{plan.price}<span className="text-xs text-gray-500 font-normal">/mês</span></div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl">{plan.icon}</div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-2xl mb-8 text-left">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Incluso</span>
                            <p className="text-lg font-bold text-blue-400">{plan.credits} Créditos de IA</p>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="p-1 bg-green-500/20 rounded-full">
                                        <Check size={10} className="text-green-500" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {plan.id === 'free' ? (
                            <button disabled className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-gray-500 cursor-not-allowed">
                                Plano Atual
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loadingPlan !== null}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {loadingPlan === plan.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    'Começar Agora'
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            <p className="mt-16 text-gray-600 text-xs">
                Seguro e processado via **Stripe**. Cancele a qualquer momento direto do painel.
            </p>
        </div>
    );
}
