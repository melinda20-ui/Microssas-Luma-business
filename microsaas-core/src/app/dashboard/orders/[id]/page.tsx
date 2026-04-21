"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
    LayoutDashboard, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    PlayCircle, 
    Send,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface Task {
    id: number;
    title: string;
    status: 'todo' | 'doing' | 'review' | 'done';
}

interface Message {
    id: number;
    sender_id: string;
    content: string;
    created_at: string;
}

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { user } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/marketplace/order/${id}`);
            const data = await res.json();
            setOrder(data);
            setTasks(data.tasks);
            setMessages(data.messages);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar pedido', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Polling simples
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const updateTaskStatus = async (taskId: number, newStatus: string) => {
        try {
            await fetch(`http://localhost:3001/api/marketplace/order/${id}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (err) {
            console.error('Erro ao atualizar tarefa', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user) return;
        try {
            await fetch(`http://localhost:3001/api/marketplace/order/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage, senderId: user.id })
            });
            setNewMessage("");
            fetchData();
        } catch (err) {
            console.error('Erro ao enviar mensagem', err);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    const columns = [
        { id: 'todo', label: 'A Fazer', icon: <Clock size={16} /> },
        { id: 'doing', label: 'Executando', icon: <PlayCircle size={16} className="text-blue-400" /> },
        { id: 'review', label: 'Em Revisão', icon: <MessageSquare size={16} className="text-amber-400" /> },
        { id: 'done', label: 'Entregue', icon: <CheckCircle2 size={16} className="text-green-400" /> },
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden pt-20">
            {/* Main Area: Kanban */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-bold font-outfit">{order.service_name}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">ID: {id} • Executado por: {order.provider}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {columns.map(col => (
                        <div key={col.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 min-h-[400px]">
                            <div className="flex items-center gap-2 mb-6 font-bold text-sm text-gray-400">
                                {col.icon}
                                {col.label}
                                <span className="ml-auto bg-white/5 px-2 py-0.5 rounded-lg text-[10px]">{tasks.filter(t => t.status === col.id).length}</span>
                            </div>

                            <div className="space-y-4">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <div 
                                        key={task.id}
                                        className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-blue-500/30 transition-all group cursor-pointer"
                                        onClick={() => {
                                            const nextIdx = (columns.findIndex(c => c.id === col.id) + 1) % 4;
                                            updateTaskStatus(task.id, columns[nextIdx].id);
                                        }}
                                    >
                                        <p className="text-sm font-medium">{task.title}</p>
                                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Mover para Próxima</span>
                                            <ChevronRight size={14} className="text-blue-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar: Private Chat */}
            <div className="w-[380px] border-l border-white/5 flex flex-col bg-zinc-900/20 backdrop-blur-3xl">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-bold flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        Chat do Projeto
                    </h3>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.sender_id === user?.id ? 'bg-blue-600 rounded-tr-none' : 'bg-white/5 rounded-tl-none border border-white/5'}`}>
                                {m.content}
                            </div>
                            <span className="text-[9px] text-gray-600 mt-1 uppercase font-bold">{new Date(m.created_at).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-white/5 flex gap-2">
                    <input 
                        type="text" 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Escreva sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button 
                        onClick={sendMessage}
                        className="p-3 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
