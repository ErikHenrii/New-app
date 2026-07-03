// ═══════════════════════════════════════════════════════════
//  middleware/adminOnly.js — Bloqueia acesso de não-admins
// ═══════════════════════════════════════════════════════════

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
}

module.exports = adminOnly;
