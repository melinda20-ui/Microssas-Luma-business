"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';
import { useParams } from 'next/navigation';

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await blogService.getPostBySlug(slug as string);
      setPost(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <div className="container mx-auto px-6 py-40 animate-pulse text-zinc-500">Carregando artigo...</div>;
  if (!post) return <div className="container mx-auto px-6 py-40">Post não encontrado.</div>;

  return (
    <article className="container mx-auto px-6 py-20 max-w-4xl relative">
      <Link href="/" className="text-zinc-500 hover:text-purple-400 transition-colors mb-12 inline-block text-sm">
        ← Voltar para o feed
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-400/5 px-2 py-1 rounded border border-purple-500/20">
          {post.category}
        </span>
        <span className="text-[10px] text-zinc-500">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black mb-10 leading-tight outfit-font">
        {post.title}
      </h1>

      <div className="flex items-center gap-4 mb-16 pb-8 border-b border-zinc-800/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"></div>
        <div>
          <div className="text-sm font-bold text-white">{post.author}</div>
          <div className="text-xs text-zinc-500">{post.readTime} de leitura</div>
        </div>
      </div>

      <div 
        className="article-content font-inter text-zinc-300 antialiased"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <section className="mt-20 p-10 glass-card bg-purple-600/5 border-purple-500/20 text-center">
        <h3 className="text-2xl font-bold mb-4 outfit-font">Gostou deste conteúdo?</h3>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Receba novidades sobre IA e Automação direto no seu e-mail.</p>
        <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
          <input type="email" placeholder="Seu e-mail" className="bg-black/40 border border-zinc-800 px-6 py-3 rounded-xl flex-1 focus:border-purple-500 outline-none text-sm" />
          <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-500 transition-all text-sm">Assinar</button>
        </div>
      </section>
    </article>
  );
}
