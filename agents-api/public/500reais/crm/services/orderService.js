/**
 * Order Service - Logica de negocio para pedidos
 * CRUD completo sobre StorageService com seed data.
 *
 * TODO: Migrar para Supabase
 * - Substituir chamadas StorageService por queries Supabase
 * - Adicionar paginacao e filtros no backend
 */
window.SUALUMA = window.SUALUMA || {};
(function(ns) {
  var COLUMNS = [
    { id: 'novo',        label: 'Novos Pedidos',      color: '#60a5fa' },
    { id: 'andamento',   label: 'Em Andamento',       color: '#f97316' },
    { id: 'aguardando',  label: 'Aguardando Cliente',  color: '#c9a84c' },
    { id: 'revisao',     label: 'Em Revisao',          color: '#a78bfa' },
    { id: 'entregue',    label: 'Entregues',           color: '#34d399' }
  ];

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function getSeeds() {
    var now = new Date().toISOString();
    return [
      {id:'s1',nome:'Ana Beatriz',whatsapp:'11999999999',email:'ana@email.com',projeto:'Salao Beleza Studio',status:'novo',prazo:'2026-06-10',observacoes:'Cliente quer site com galeria de fotos',links:'',dominio:'',login:'',senha:'',prioridade:'alta',progresso:0,checklist:[{text:'Reunir referencias',done:false},{text:'Criar prototipo',done:false}],anexos:[],imagens:[],criadoEm:now},
      {id:'s2',nome:'Carlos Eduardo',whatsapp:'11988888888',email:'carlos@email.com',projeto:'Restaurante Sabor Caseiro',status:'andamento',prazo:'2026-06-05',observacoes:'Cardapio digital + delivery',links:'',dominio:'',login:'',senha:'',prioridade:'urgente',progresso:35,checklist:[{text:'Estrutura de paginas',done:true},{text:'Design responsivo',done:false},{text:'Integrar WhatsApp',done:false}],anexos:[],imagens:[],criadoEm:now},
      {id:'s3',nome:'Marina Silveira',whatsapp:'11977777777',email:'marina@email.com',projeto:'Clinica Bem-Estar',status:'aguardando',prazo:'2026-06-15',observacoes:'Aguardando fotos da clinica',links:'',dominio:'',login:'',senha:'',prioridade:'media',progresso:20,checklist:[{text:'Pagina inicial',done:true},{text:'Area de servicos',done:false},{text:'Blog',done:false}],anexos:[],imagens:[],criadoEm:now},
      {id:'s4',nome:'Rafael Oliveira',whatsapp:'11966666666',email:'rafael@email.com',projeto:'Loja Artesanato',status:'revisao',prazo:'2026-06-02',observacoes:'Revisar cores da marca',links:'',dominio:'',login:'',senha:'',prioridade:'alta',progresso:85,checklist:[{text:'Home page',done:true},{text:'Catalogo',done:true},{text:'Carrinho',done:true},{text:'Testes finais',done:false}],anexos:[],imagens:[],criadoEm:now},
      {id:'s5',nome:'Juliana Costa',whatsapp:'11955555555',email:'juliana@email.com',projeto:'Personal Trainer',status:'entregue',prazo:'2026-05-28',observacoes:'Site entregue e publicado',links:'https://julianatrainer.com',dominio:'julianatrainer.com',login:'juliana',senha:'****',prioridade:'baixa',progresso:100,checklist:[{text:'Design',done:true},{text:'Desenvolvimento',done:true},{text:'Publicacao',done:true}],anexos:[],imagens:[],criadoEm:now}
    ];
  }

  function loadOrders() {
    var orders = ns.StorageService.getOrders();
    if (!orders.length) {
      orders = getSeeds();
      ns.StorageService.saveOrders(orders);
    }
    return orders;
  }

  ns.OrderService = {
    COLUMNS: COLUMNS,

    getAll: function() { return loadOrders(); },

    getById: function(id) {
      return loadOrders().find(function(o) { return o.id === id; }) || null;
    },

    create: function(data) {
      var orders = loadOrders();
      var order = {
        id: genId(), criadoEm: new Date().toISOString(),
        imagens: [], anexos: [], checklist: []
      };
      Object.keys(data).forEach(function(k) { order[k] = data[k]; });
      orders.push(order);
      ns.StorageService.saveOrders(orders);
      if (ns.RealtimeService) ns.RealtimeService.notify();
      return order;
    },

    update: function(id, data) {
      var orders = loadOrders();
      var idx = orders.findIndex(function(o) { return o.id === id; });
      if (idx === -1) return null;
      Object.keys(data).forEach(function(k) { orders[idx][k] = data[k]; });
      ns.StorageService.saveOrders(orders);
      if (ns.RealtimeService) ns.RealtimeService.notify();
      return orders[idx];
    },

    delete: function(id) {
      var orders = loadOrders().filter(function(o) { return o.id !== id; });
      ns.StorageService.saveOrders(orders);
      if (ns.RealtimeService) ns.RealtimeService.notify();
    },

    move: function(id, newStatus) {
      var o = this.getById(id);
      if (!o) return null;
      if (newStatus === 'entregue') o.progresso = 100;
      return this.update(id, { status: newStatus });
    },

    empty: function() {
      return { nome:'',whatsapp:'',email:'',projeto:'',status:'novo',prazo:'',observacoes:'',links:'',dominio:'',login:'',senha:'',prioridade:'media',progresso:0,checklist:[],anexos:[],imagens:[] };
    },

    getMetrics: function() {
      var orders = loadOrders();
      var hoje = new Date();
      var hojeStr = hoje.toISOString().slice(0, 10);
      var mesStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
      return {
        total: orders.length,
        hoje: orders.filter(function(o) { return o.criadoEm.slice(0, 10) === hojeStr; }).length,
        mes: orders.filter(function(o) { return o.criadoEm.slice(0, 7) === mesStr; }).length,
        entregues: orders.filter(function(o) { return o.status === 'entregue'; }).length,
        entreguesMes: orders.filter(function(o) { return o.status === 'entregue' && o.criadoEm.slice(0, 7) === mesStr; }).length,
        receita: orders.filter(function(o) { return o.status === 'entregue'; }).length * 500,
        receitaPotencial: orders.length * 500,
        atrasados: orders.filter(function(o) { return o.prazo && o.prazo < hojeStr && o.status !== 'entregue'; }).length,
        andamento: orders.filter(function(o) { return o.status !== 'entregue'; }).length
      };
    }
  };
})(window.SUALUMA);
