/**
 * Realtime Service - Sincronizacao instantanea
 * Event Bus (CustomEvent) + polling + cross-tab (storage event).
 * Atualiza o CRM instantaneamente na mesma aba e entre abas.
 *
 * Fluxo:
 *   Mesma aba: OrderService -> RealtimeService.notify() -> CustomEvent -> render
 *   Outra aba: localStorage.setItem() -> storage event -> render
 *   Fallback:  polling a cada 3s para detectar mudancas externas
 *
 * TODO: Migrar para Supabase Realtime
 * - Substituir polling por subscription PostgreSQL
 * - Usar Supabase channel para mudancas em tempo real
 */
window.SUALUMA = window.SUALUMA || {};
(function(ns) {
  var POLL_MS = 3000;
  var KEY = 'sualuma_crm_pedidos';
  var listeners = {};
  var timer = null;
  var lastData = null;
  var changeCallback = null;

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(function(fn) {
        try { fn(data); } catch (e) {}
      });
    }
    try {
      window.dispatchEvent(new CustomEvent('sl:' + event, { detail: data }));
    } catch (e) {}
  }

  function startPolling() {
    stopPolling();
    timer = setInterval(function() {
      try {
        var cur = localStorage.getItem(KEY);
        if (cur !== lastData) {
          lastData = cur;
          emit('orders:changed', { source: 'polling' });
        }
      } catch (e) {}
    }, POLL_MS);
  }

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function onStorage(e) {
    if (e.key === KEY) {
      lastData = e.newValue;
      emit('orders:changed', { source: 'storage-event' });
    }
  }

  ns.RealtimeService = {
    start: function(onChange) {
      changeCallback = onChange || null;
      lastData = localStorage.getItem(KEY);
      window.addEventListener('storage', onStorage);
      startPolling();
      this.on('orders:changed', function(evt) {
        if (changeCallback) changeCallback(evt);
      });
    },
    stop: function() {
      window.removeEventListener('storage', onStorage);
      stopPolling();
      listeners = {};
    },
    emit: emit,
    on: function(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
      return function() {
        listeners[event] = (listeners[event] || []).filter(function(f) { return f !== callback; });
      };
    },
    off: function(event, callback) {
      if (!listeners[event]) return;
      listeners[event] = (listeners[event] || []).filter(function(f) { return f !== callback; });
    },
    notify: function() {
      lastData = localStorage.getItem(KEY);
      emit('orders:changed', { source: 'manual' });
    }
  };
})(window.SUALUMA);
