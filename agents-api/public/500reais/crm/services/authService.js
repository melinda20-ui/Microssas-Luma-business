/**
 * Auth Service - Autenticacao e sessao
 * Senha fixa admin500 com sessao persistente em localStorage.
 *
 * TODO: Migrar para Supabase Auth
 * - Substituir senha fixa por Supabase Auth
 * - Adicionar magic link / OAuth
 * - Gerenciar tokens JWT
 */
window.SUALUMA = window.SUALUMA || {};
(function(ns) {
  var PASSWORD = 'admin500';
  var SESSION_KEY = 'sualuma_crm_session';
  var DURATION = 8 * 60 * 60 * 1000;

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (Date.now() > s.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch (e) { return null; }
  }

  function createSession() {
    var s = {
      authenticated: true,
      loginAt: new Date().toISOString(),
      expiresAt: Date.now() + DURATION,
      user: 'admin'
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return s;
  }

  ns.AuthService = {
    login: function(password) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          if (password === PASSWORD) {
            resolve({ success: true, session: createSession() });
          } else {
            resolve({ success: false, error: 'Senha incorreta' });
          }
        }, 400);
      });
    },
    logout: function() {
      try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
      if (ns.RealtimeService) ns.RealtimeService.stop();
      window.location.reload();
    },
    isAuthenticated: function() {
      return getSession() !== null;
    },
    getSession: function() {
      return getSession();
    },
    getRemainingTime: function() {
      var s = getSession();
      return s ? Math.max(0, s.expiresAt - Date.now()) : 0;
    }
  };
})(window.SUALUMA);
