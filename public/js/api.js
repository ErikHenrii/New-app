// ═══════════════════════════════════════════════════════════
//  api.js — Camada de comunicação frontend ↔ backend
//  Substitui o antigo auth-engine.js (IndexedDB) por fetch HTTP
// ═══════════════════════════════════════════════════════════

const API_BASE = '/api';

// ── Gerenciamento de token ──
const TOKEN_KEY = 'reviver_token';

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

// ── Wrapper de fetch com token automático ──
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/registrar')) {
        setToken(null);
        if (window.location.pathname.includes('/dashboard') || window.location.pathname.includes('/admin')) {
          window.location.href = '/login.html';
        }
      }
      throw new Error(data.erro || `Erro ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
    }
    throw err;
  }
}

// ── API pública ──
const API = {
  // ── Auth ──
  auth: {
    registrar: (dados) => request('/auth/registrar', { method: 'POST', body: dados }),
    login: (email, senha) => request('/auth/login', { method: 'POST', body: { email, senha } }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    sessao: () => request('/auth/sessao'),
  },

  // ── Perfil ──
  perfil: {
    obter: () => request('/perfil'),
    atualizar: (dados) => request('/perfil', { method: 'PUT', body: dados }),
    alterarSenha: (senhaAtual, novaSenha) =>
      request('/perfil/alterar-senha', { method: 'POST', body: { senha_atual: senhaAtual, nova_senha: novaSenha } }),
  },

  // ── Admin ──
  admin: {
    stats: () => request('/admin/stats'),
    listarUsuarios: () => request('/admin/usuarios'),
    verUsuario: (id) => request(`/admin/usuarios/${id}`),
    criarUsuario: (dados) => request('/admin/usuarios', { method: 'POST', body: dados }),
    atualizarUsuario: (id, dados) => request(`/admin/usuarios/${id}`, { method: 'PUT', body: dados }),
    excluirUsuario: (id) => request(`/admin/usuarios/${id}`, { method: 'DELETE' }),
    auditoria: () => request('/admin/auditoria'),
    exportarCSV: () => request('/admin/exportar-csv'),
  },

  // ── Aniversariantes ──
  aniversariantes: (mes) => request(`/aniversariantes${mes ? `?mes=${mes}` : ''}`),
  aniversariantesAdmin: (mes) => request(`/aniversariantes/admin${mes ? `?mes=${mes}` : ''}`),

  // ── Lideranças ──
  liderancas: {
    listar: () => request('/liderancas'),
    listarTodas: () => request('/liderancas/todas'),
    criar: (dados) => request('/liderancas', { method: 'POST', body: dados }),
    atualizar: (id, dados) => request(`/liderancas/${id}`, { method: 'PUT', body: dados }),
    excluir: (id) => request(`/liderancas/${id}`, { method: 'DELETE' }),
  },

  // ── Conteúdo dinâmico do site (cultos, eventos, avisos, etc.) ──
  conteudo: {
    listarTudo: () => request('/conteudo'),
    obter: (secao) => request(`/conteudo/${secao}`),
    atualizar: (secao, dados) => request(`/conteudo/${secao}`, { method: 'PUT', body: { dados } }),
  },

  // ── Tesouraria ──
  tesouraria: {
    listar: (filtros) => {
      let qs = '';
      if (filtros) {
        const parts = [];
        if (filtros.mes_ref) parts.push('mes_ref=' + filtros.mes_ref);
        if (filtros.tipo) parts.push('tipo=' + filtros.tipo);
        if (filtros.categoria) parts.push('categoria=' + filtros.categoria);
        if (filtros.data_inicio) parts.push('data_inicio=' + filtros.data_inicio);
        if (filtros.data_fim) parts.push('data_fim=' + filtros.data_fim);
        if (parts.length) qs = '?' + parts.join('&');
      }
      return request('/tesouraria' + qs);
    },
    resumo: (mes_ref) => request(`/tesouraria/resumo${mes_ref ? `?mes_ref=${mes_ref}` : ''}`),
    criar: (dados) => request('/tesouraria', { method: 'POST', body: dados }),
    atualizar: (id, dados) => request(`/tesouraria/${id}`, { method: 'PUT', body: dados }),
    excluir: (id) => request(`/tesouraria/${id}`, { method: 'DELETE' }),
    exportarCSV: (mes_ref) => {
      const token = getToken();
      const url = `/api/tesouraria/exportar-csv${mes_ref ? '?mes_ref=' + mes_ref : ''}`;
      return fetch(url, { headers: token ? { Authorization: 'Bearer ' + token } : {} })
        .then(r => r.blob())
        .then(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'tesouraria' + (mes_ref ? '_' + mes_ref : '') + '.csv';
          a.click();
          URL.revokeObjectURL(a.href);
        });
    },
  },

  // ── LGPD ──
  lgpd: {
    exportarDados: () => request('/lgpd/exportar-dados'),
    solicitarExclusao: () => request('/lgpd/solicitar-exclusao', { method: 'DELETE' }),
  },

  // ── Token management ──
  getToken,
  setToken,
  isAuthenticated: () => !!getToken(),
};

// Exporta globalmente
window.API = API;
