"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { getLeads, promoteLeadToUser, type Lead } from "../actions";
import { motion } from "framer-motion";

const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  ),
} as const;

export default function LeadsClient() {
  const { user, isLoaded } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getLeads();
      setLeads(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar leads.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchLeads();
  }, [isLoaded, user, fetchLeads]);

  const handlePromote = async (lead: Lead) => {
    if (confirm(`Deseja promover o lead "${lead.nome}" para usuário do sistema?`)) {
      setPromotingId(lead.id);
      try {
        const result = await promoteLeadToUser(lead);
        if (result.success) {
          alert(result.message);
          if (result.redirect) {
            window.location.href = result.redirect;
            return;
          }
          await fetchLeads();
        } else {
          alert(`Erro: ${result.message}`);
        }
      } catch (err) {
        console.error(err);
        alert("Ocorreu um erro ao promover o lead.");
      } finally {
        setPromotingId(null);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#04040f] flex items-center justify-center">
        <div className="shimmer w-80 h-48 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#04040f] text-white flex items-center justify-center">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 max-w-md w-full backdrop-blur-xl text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold font-outfit mb-3">Acesso Restrito</h2>
          <p className="text-white/50 text-sm">Faça login para gerenciar leads.</p>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#04040f] text-white p-6 md:p-10">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[-200px] right-[-200px] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="hero-eyebrow inline-flex mb-4">
              <span>📋</span>
              <span>Base de Leads</span>
            </div>
            <h1 className="text-3xl font-bold font-outfit">Leads</h1>
            <p className="text-white/40 text-sm mt-1">Gerencie seus leads e converta-os em usuários.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Buscar lead..."
                className="pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-sm text-white/70 placeholder:text-white/25 outline-none transition-all duration-300 focus:border-blue-500/40 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchLeads}
              disabled={isRefreshing}
              className="p-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl text-white/50 hover:text-white/70 transition-colors disabled:opacity-50"
            >
              <Icons.RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 mb-6">
            <Icons.AlertCircle />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden backdrop-blur-xl"
        >
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-white/30">
              <Icons.RefreshCw className="w-8 h-8 animate-spin mb-3" />
              <p>Carregando leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center text-white/30">
              <div className="text-5xl mb-4">📭</div>
              <p>Nenhum lead encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Origem</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold">{lead.nome}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white/70">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-3 py-1.5 bg-white/[0.04] text-white/50 rounded-xl uppercase">
                          {lead.origem}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                          lead.status === "novo" ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : 
                          lead.status === "contatado" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                          "bg-white/5 text-white/40 border border-white/10"
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePromote(lead)}
                          disabled={promotingId === lead.id}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                            promotingId === lead.id
                              ? "bg-white/5 text-white/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                          }`}
                        >
                          {promotingId === lead.id ? (
                            <>
                              <Icons.RefreshCw className="w-4 h-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Icons.UserPlus />
                              Liberar acesso
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
