const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Simulação de Serviços Disponíveis (Isso pode vir do Banco depois)
const SERVICES = [
    { id: 'video_expert', name: 'Edição de Vídeo Especializada', price: 99, provider: 'Agente Luma' },
    { id: 'site_premium', name: 'Criação de Site Institucional', price: 149, provider: 'Luma Sites' },
    { id: 'copy_vendas', name: 'Copywriting para Landing Page', price: 49, provider: 'Agente Copy' }
];

/**
 * Lista todos os serviços do Marketplace
 */
router.get('/services', (req, res) => {
    res.json(SERVICES);
});

/**
 * Cria um novo pedido (Contratação)
 */
router.post('/order', (req, res) => {
    const { serviceId } = req.body;
    const userId = req.headers['x-user-id'];

    if (!userId) return res.status(401).json({ error: 'Usuário não logado.' });

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado.' });

    const orderId = `ord_${uuidv4().slice(0, 8)}`;

    try {
        // Criar Pedido
        db.prepare('INSERT INTO orders (id, clerk_id, service_name, price, provider) VALUES (?, ?, ?, ?, ?)')
          .run(orderId, userId, service.name, service.price, service.provider);
        
        // Criar Tarefas Iniciais (Kanban Default)
        const initialTasks = ['Análise de Requisitos', 'Execução Técnica', 'Revisão Luma', 'Entrega Final'];
        const insertTask = db.prepare('INSERT INTO tasks (order_id, title) VALUES (?, ?)');
        initialTasks.forEach(title => insertTask.run(orderId, title));

        res.json({ success: true, orderId });
    } catch (err) {
        console.error('[Marketplace Error]', err);
        res.status(500).json({ error: 'Erro ao processar contratação.' });
    }
});

/**
 * Busca detalhes de um pedido (Tasks + Chat)
 */
router.get('/order/:id', (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const tasks = db.prepare('SELECT * FROM tasks WHERE order_id = ?').all(req.params.id);
    const messages = db.prepare('SELECT * FROM order_messages WHERE order_id = ?').all(req.params.id);

    res.json({ ...order, tasks, messages });
});

/**
 * Atualiza status de uma tarefa (Kanban)
 */
router.patch('/order/:id/tasks/:taskId', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE tasks SET status = ? WHERE id = ? AND order_id = ?').run(status, req.params.taskId, req.params.id);
    res.json({ success: true });
});

/**
 * Envia mensagem no chat do pedido
 */
router.post('/order/:id/messages', (req, res) => {
    const { content, senderId } = req.body;
    db.prepare('INSERT INTO order_messages (order_id, sender_id, content) VALUES (?, ?, ?)')
      .run(req.params.id, senderId, content);
    res.json({ success: true });
});

module.exports = router;
