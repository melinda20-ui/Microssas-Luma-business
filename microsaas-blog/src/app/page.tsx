"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';

export default function BlogHome() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await blogService.getAllPosts();
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Ideias que moldam o <span className="glow-title">Futuro Inteligente.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
            Explorando as fronteiras da Inteligência Artificial, automação e MicroSaaS.
          </p>
        </div>
      </section>

      {/* Categories */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {['Tudo', 'IA', 'Automação', 'Negócios', 'Tech'].map((cat) => (
          <button key={cat} className="px-6 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 hover:bg-purple-600/10 transition-all text-sm whitespace-nowrap">
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="glass-card h-80 animate-pulse bg-white/5"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} key={post.id} className="glass-card p-8 flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold tracking-widest uppercase text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
                  {post.category}
                </span>
                <span className="text-xs text-zinc-600">{post.readTime}</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors line-clamp-2 outfit-font">
                {post.title}
              </h3>
              
              <p className="text-zinc-400 text-sm mb-8 line-clamp-3 leading-relaxed font-inter font-light">
                {post.excerpt}
              </p>
              
              <div className="mt-auto pt-6 border-t border-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"></div>
                  <div className="text-xs font-bold text-white">{post.author}</div>
                </div>
                <div className="text-purple-500 group-hover:translate-x-1 transition-transform">→</div>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-600 italic">
              Nenhum artigo publicado ainda. Vá ao painel admin para começar!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
