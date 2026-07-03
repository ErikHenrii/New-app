// ═══════════════════════════════════════════════════════════
//  utils/validation.js — Validação de campos de entrada
// ═══════════════════════════════════════════════════════════

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
  // Mínimo 6 caracteres
  return typeof senha === 'string' && senha.length >= 6;
}

function validarNome(nome) {
  return typeof nome === 'string' && nome.trim().length >= 3;
}

// Limpa e normaliza campos antes de salvar
function sanitizar(obj) {
  const limpo = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === '') {
      limpo[key] = null;
    } else if (typeof value === 'string') {
      limpo[key] = value.trim();
    } else {
      limpo[key] = value;
    }
  }
  return limpo;
}

module.exports = { validarEmail, validarSenha, validarNome, sanitizar };
