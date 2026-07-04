// ═══════════════════════════════════════════════════════════
//  lgpdRoutes.js — Rotas de conformidade LGPD
// ═══════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { getPool } = require('../db/init');
const { exigeAuth } = require('../middleware/auth');

// ── GET /api/lgpd/meus-dados — retorna todos os dados do usuário ──
router.get('/meus-dados', exigeAuth, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, nome, email, role, data_nascimento, telefone, endereco, cidade, estado, foto_url, created_at, updated_at
       FROM usuarios WHERE id = $1;`,
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar dados LGPD:', err);
    return res.status(500).json({ erro: 'Erro ao buscar dados.' });
  }
});

// ── DELETE /api/lgpd/excluir-conta — exclui a conta do usuário (direito ao esquecimento) ──
router.delete('/excluir-conta', exigeAuth, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM acessos_log WHERE usuario_id = $1;', [req.usuario.id]);
    await pool.query('DELETE FROM usuarios WHERE id = $1;', [req.usuario.id]);

    return res.status(200).json({ mensagem: 'Conta excluída com sucesso. Todos os seus dados foram removidos.' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    return res.status(500).json({ erro: 'Erro ao excluir conta.' });
  }
});

module.exports = router;
