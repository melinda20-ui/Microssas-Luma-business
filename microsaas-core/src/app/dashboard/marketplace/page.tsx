"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ShoppingBag, Briefcase, Zap, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
    id: string;
    name: string;
    price: number;
    provider: string;
}

export default function MarketplacePage() {
    const { user } = useUser();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [contractingId, setContractingId] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/marketplace/services')
            .then(res => res.json())
            .then(data => {
                setServices(data);
                setLoading(false);
            });
    }, []);

    const handleContract = async (serviceId: string) => {
        if (!user) return;
        setContractingId(serviceId);

        try {
            const res = await fetch('http://localhost:3001/api/marketplace/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ serviceId })
            });

            const data = await res.json();
            if (data.orderId) {
                router.push(`/dashboard/orders/${data.orderId}`);
            }
        } catch (err) {
            console.error('Erro ao contratar', err);
        } finally {
            setContractingId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-bold font-outfit bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Marketplace de Serviços
                    </h1>
                    <p className="text-gray-400 mt-2">Contrate especialistas e IAs para acelerar seu negócio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <div 
                            key={service.id}
                            className="group relative bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-xl hover:border-blue-500/50 transition-all hover:-translate-y-1"
                        >
                            <div className="absolute top-6 right-6 p-2 bg-blue-500/10 rounded-xl text-blue-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Zap size={20} />
                            </div>

                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <Briefcase className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{service.name}</h3>
                            <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-wider">Por: {service.provider}</p>

                            <div className="flex items-center gap-2 mb-8">
                                <span className="text-2xl font-black text-white">R$ {service.price}</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Pagamento Único</span>
                            </div>

                            <ul className="space-y-3 mb-10">
                                {['Entrega Garantida', 'Suporte Prioritário', 'Execução 24/7'].map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                        <CheckCircle size={14} className="text-blue-500" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(service.id)}
                                disabled={contractingId !== null}
                                className="w-full py-4 bg-white/5 hover:bg-blue-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border border-white/10 hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            >
                                {contractingId === service.id ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>Contratar Agora <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-xl font-bold">Quer vender seus serviços?</h4>
                        <p className="text-gray-400 text-sm">Torne-se um prestador oficial Luma e atenda milhares de clientes.</p>
                    </div>
                    <button className="btn btn-primary px-8 py-4 rounded-2xl font-bold">Candidatar-se</button>
                </div>
            </div>
        </div>
    );
}
