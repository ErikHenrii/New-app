// ═══════════════════════════════════════════════════════════
//  utils/crypto.js — Hash e verificação de senhas (bcrypt)
// ═══════════════════════════════════════════════════════════

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashSenha(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

async function verificarSenha(senha, hash) {
  return bcrypt.compare(senha, hash);
}

module.exports = { hashSenha, verificarSenha };
