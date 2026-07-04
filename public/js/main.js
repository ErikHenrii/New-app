/* ═══════════════════════════════════════════════════════════
   main.js — Utilitários compartilhados (API, Auth, UI)
   ═══════════════════════════════════════════════════════════ */

// ── URL base da API ──
const API_BASE = window.location.origin + '/api';

// ── Helper: requisições HTTP com autenticação ──
async function apiFetch(rota, opcoes = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...opcoes.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const resp = await fetch(`${API_BASE}${rota}`, {
      ...opcoes,
      headers,
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // Token expirado ou inválido
      if (resp.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (!window.location.pathname.includes('login') && !window.location.pathname.includes('registro') && window.location.pathname !== '/') {
          window.location.href = '/login.html';
        }
      }
      throw new Error(data.erro || `Erro ${resp.status}`);
    }

    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    throw err;
  }
}

// ── Estado de autenticação ──
function getUsuario() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

function getToken() {
  return localStorage.getItem('token');
}

function setSessao(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function limparSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const u = getUsuario();
  return u && u.role === 'admin';
}

// ── Atualiza UI do header conforme login ──
function atualizarHeaderAuth() {
  const divAcoes = document.getElementById('header-acoes');
  if (!divAcoes) return;

  if (isLoggedIn()) {
    const usuario = getUsuario();
    const adminLink = isAdmin()
      ? `<a href="/admin.html" class="btn btn-destaque btn-pequeno">Painel Admin</a>`
      : '';
    divAcoes.innerHTML = `
      <a href="/perfil.html" class="btn btn-secundario btn-pequeno">Olá, ${usuario.nome.split(' ')[0]}</a>
      ${adminLink}
      <button onclick="fazerLogout()" class="btn btn-perigo btn-pequeno">Sair</button>
    `;
  } else {
    divAcoes.innerHTML = `
      <a href="/login.html" class="btn btn-secundario btn-pequeno">Entrar</a>
      <a href="/registro.html" class="btn btn-destaque btn-pequeno">Cadastrar</a>
    `;
  }
}

// ── Logout ──
async function fazerLogout() {
  limparSessao();
  window.location.href = '/';
}

// ── Exibe alerta temporário ──
function mostrarAlerta(container, mensagem, tipo = 'sucesso') {
  const div = document.createElement('div');
  div.className = `alerta alerta-${tipo}`;
  div.textContent = mensagem;
  container.insertBefore(div, container.firstChild);

  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.5s';
    setTimeout(() => div.remove(), 500);
  }, 4000);
}

// ── Escapa HTML para evitar XSS ──
function esc(texto) {
  if (texto === null || texto === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

// ── Formata data ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) ──
function formatarDataBR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

// ── Inicializa header ao carregar página ──
document.addEventListener('DOMContentLoaded', () => {
  atualizarHeaderAuth();
});
