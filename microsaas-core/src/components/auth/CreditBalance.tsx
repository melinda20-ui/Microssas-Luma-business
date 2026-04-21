"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreditBalance() {
    const { user, isLoaded } = useUser();
    const [credits, setCredits] = useState<number | null>(null);
    const [plan, setPlan] = useState<string>('free');

    useEffect(() => {
        if (isLoaded && user) {
            const fetchCredits = async () => {
                try {
                    const res = await fetch(`http://localhost:3001/api/user/${user.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCredits(data.credits);
                        setPlan(data.plan);
                    }
                } catch (err) {
                    console.error('Erro ao buscar créditos', err);
                }
            };

            fetchCredits();
            // Atualiza a cada 30 segundos ou quando houver interação
            const interval = setInterval(fetchCredits, 30000);
            return () => clearInterval(interval);
        }
    }, [isLoaded, user]);

    if (!isLoaded || !user) return null;

    return (
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Zap size={14} className={credits && credits < 5 ? "text-amber-500 animate-pulse" : "text-blue-400"} />
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Saldo de IA</span>
                    <span className="text-xs font-bold font-outfit">
                        {credits !== null ? `${credits} Créditos` : '---'}
                    </span>
                </div>
            </div>
            
            <Link 
                href="/dashboard/billing" 
                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-1.5 rounded-lg transition-all"
                title="Comprar mais créditos"
            >
                <AlertCircle size={14} />
            </Link>
        </div>
    );
}
