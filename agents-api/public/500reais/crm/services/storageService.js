/**
 * Storage Service - Camada de persistencia
 * Gerencia localStorage com adapter preparado para Supabase.
 *
 * TODO: Migrar para Supabase
 * - Criar metodos com sufixo _supabase
 * - Configurar cliente Supabase via env
 * - Substituir localStorage por chamadas Supabase
 */
window.SUALUMA = window.SUALUMA || {};
(function(ns) {
  var KEY = 'sualuma_crm_pedidos';

  function get(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
  }
  function remove(k) {
    try { localStorage.removeItem(k); return true; } catch (e) { return false; }
  }

  ns.StorageService = {
    getOrders: function() {
      try {
        var d = get(KEY);
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    },
    saveOrders: function(orders) {
      return set(KEY, JSON.stringify(orders));
    },
    clearOrders: function() {
      return remove(KEY);
    }
  };
})(window.SUALUMA);
