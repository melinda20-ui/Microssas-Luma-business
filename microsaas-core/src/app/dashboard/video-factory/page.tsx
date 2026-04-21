"use client";

import { useState, useEffect } from 'react';
import { Video, Scissors, Type, Download, AlertTriangle, Play, CheckCircle, Loader2 } from 'lucide-react';

export default function VideoFactory() {
    const [file, setFile] = useState<File | null>(null);
    const [style, setStyle] = useState('clean');
    const [processing, setProcessing] = useState(false);
    const [clips, setClips] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Simula a busca de notificações e clipes existentes
    useEffect(() => {
        // Aqui conectaríamos com a API real
        // fetch('/api/notifications').then(res => res.json()).then(setNotifications);
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('video', file);
        formData.append('style', style);

        try {
            const res = await fetch('http://localhost:3001/api/agents/video', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setClips([...data.highlights, ...clips]);
        } catch (err) {
            console.error('Erro no processamento', err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            {/* Header com Alertas */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Fábrica de Vídeos IA
                    </h1>
                    <p className="text-gray-400 mt-2">Versão Beta 0.1 • Armazenamento local de 15 dias</p>
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl animate-pulse">
                        <AlertTriangle className="text-amber-500" />
                        <div>
                            <p className="text-sm font-semibold">{notifications[0].title}</p>
                            <p className="text-xs text-gray-400">{notifications[0].message}</p>
                        </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Painel de Upload e Configuração */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Video className="text-blue-500" /> Novo Projeto
                        </h2>

                        <div 
                            className={`border-2 border-dashed border-white/10 rounded-2xl p-10 text-center transition-all ${file ? 'border-green-500/50 bg-green-500/5' : 'hover:border-blue-500/30'}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                            }}
                        >
                            <input 
                                type="file" 
                                id="video-input" 
                                className="hidden" 
                                accept="video/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="video-input" className="cursor-pointer">
                                <Scissors className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p className="text-sm text-gray-300">
                                    {file ? file.name : 'Arraste seu vídeo ou clique para subir'}
                                </p>
                            </label>
                        </div>

                        <div className="mt-8">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 block">
                                Estilo das Legendas
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['clean', 'basic', 'opus'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`py-3 rounded-xl text-xs font-bold transition-all border ${style === s ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800 border-white/5 text-gray-400'}`}
                                    >
                                        {s === 'clean' ? 'Limpo' : s === 'basic' ? 'Básico' : 'Opus Style'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleUpload}
                            disabled={!file || processing}
                            className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" /> IA Processando...
                                </>
                            ) : (
                                <>
                                    <Play size={18} /> Iniciar Mágica
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Galeria de Resultados */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-xl h-full min-h-[500px]">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-500" /> Cortes Prontos (7-15 dias)
                        </h2>

                        {clips.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <Play size={48} className="mb-4 opacity-20" />
                                <p>Nenhum vídeo processado ainda.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {clips.map((clip, i) => (
                                    <div key={i} className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden group">
                                        <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
                                            <Video className="text-white/20" size={32} />
                                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                                                <Play fill="white" />
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="font-semibold text-sm truncate">{clip.title}</p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                                                    EXPIRA EM 14 DIAS
                                                </span>
                                                <a 
                                                    href={`http://localhost:3001${clip.url}`} 
                                                    download 
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
