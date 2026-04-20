"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await blogService.getAllPosts();
    setPosts(data);
  };

  const generatePost = async () => {
    if (!topic) return alert('Digite um tema primeiro!');
    
    setLoading(true);
    setStatusMsg('🤖 Luma está escrevendo seu post (isso pode levar 30s)...');
    
    try {
      // 1. Gera conteúdo com a IA
      const aiResponse = await blogService.generateWithAI(topic);
      
      if (aiResponse.content) {
        // 2. Salva o post gerado
        await blogService.savePost({
          title: aiResponse.title || topic,
          content: aiResponse.content,
          category: 'IA & Automação',
          status: 'Publicado'
        });
        
        setTopic('');
        setStatusMsg('✅ Post gerado e publicado com sucesso!');
        loadPosts();
      }
    } catch (err) {
      setStatusMsg('❌ Erro ao gerar post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04040a] p-8 md:p-20 relative">
      <div className="future-grid fixed inset-0 opacity-20 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black outfit-font mb-2">Painel de Controle</h1>
            <p className="text-zinc-500">Gerencie seu conteúdo e crie novos posts com IA.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="btn-outline px-6 py-3 rounded-full text-sm">Ver Blog</Link>
          </div>
        </header>

        {statusMsg && (
          <div className="mb-8 p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl text-purple-300 text-sm animate-pulse">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold mb-8">Artigos Recentes ({posts.length})</h2>
              <div className="space-y-4">
                {posts.length === 0 && <div className="text-zinc-600 italic">Nenhum post encontrado. Use a IA ao lado!</div>}
                {posts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-zinc-800/50 rounded-xl hover:bg-white/5 transition-all">
                    <div>
                      <div className="font-bold text-white mb-1">{post.title}</div>
                      <div className="text-xs text-zinc-500">{new Date(post.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${post.status === 'Publicado' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                        {post.status}
                      </span>
                      <Link href={`/posts/${post.slug}`} target="_blank" className="text-zinc-500 hover:text-white">👁️</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-8 bg-purple-600/5 border-purple-500/30">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">🤖</div>
              <h3 className="text-xl font-bold mb-4">Escrever com IA</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                A Luma escreverá um post completo sobre qualquer tema.
              </p>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Como o n8n ajuda pequenas empresas..." 
                className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-white mb-4 min-h-[100px] outline-none focus:border-purple-500 transition-all font-inter"
              />
              <button 
                onClick={generatePost}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Gerar Post Completo'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
