// ═══════════════════════════════════════════════════════════
//  middleware/auth.js — Verifica JWT e injeta req.user
// ═══════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'reviver-dev-secret-change-me';
const JWT_EXPIRES = '7d';

function gerarToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca o usuário no banco para garantir que ainda existe e está ativo
    const { rows } = await pool.query(
      'SELECT id, nome_completo, email, role, status FROM membros WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const user = rows[0];
    if (user.status !== 'ativo') {
      return res.status(403).json({ erro: 'Conta inativa. Contate um administrador.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Sessão expirada ou inválida' });
    }
    next(err);
  }
}

module.exports = { authMiddleware, gerarToken, JWT_SECRET, JWT_EXPIRES };
